#!/usr/bin/env python3
"""Turn the QA agent's raw stream-json output into redacted run files.

Usage: qa_agent_transcript.py <raw.jsonl> <out-prefix>

Writes, all with secrets redacted:
  <out-prefix>.jsonl     the full event stream (every tool call and its output)
  <out-prefix>.md        the agent's final answer (the workflow extracts the
                         ===SLACK=== / ===JSON=== blocks from this file)
  <out-prefix>.tools.md  a readable timeline: each tool call, whether it
                         errored, and every call the permission rules refused
and prints the timeline to stdout for the job log.

Why redaction: the agent reads Playwright failure snapshots during triage,
and those record typed form values, including the test accounts' passwords.
This repo is public, so nothing unredacted may reach an artifact or the log.
Secrets = every non-empty *_PASSWORD env var plus CLAUDE_CODE_OAUTH_TOKEN.
"""
import json
import os
import sys

REDACTED = "[REDACTED]"


def secret_values():
    vals = set()
    for k, v in os.environ.items():
        if (k.endswith("_PASSWORD") or k == "CLAUDE_CODE_OAUTH_TOKEN") and v and len(v.strip()) >= 4:
            vals.add(v.strip())
            vals.add(v)
    # Also catch the JSON-escaped form a value takes inside the event stream.
    for v in list(vals):
        vals.add(json.dumps(v)[1:-1])
    return sorted(vals, key=len, reverse=True)  # longest first


def redact(text, secrets):
    for s in secrets:
        text = text.replace(s, REDACTED)
    return text


def describe_call(name, inp):
    if name == "Bash":
        return inp.get("command", "")
    for key in ("file_path", "path", "pattern"):
        if key in inp:
            return f"{key}={inp[key]}"
    return json.dumps(inp)[:200]


def main(raw_path, prefix):
    secrets = secret_values()
    raw = open(raw_path, encoding="utf-8", errors="replace").read() if os.path.exists(raw_path) else ""
    clean = redact(raw, secrets)
    with open(prefix + ".jsonl", "w", encoding="utf-8") as f:
        f.write(clean)

    calls, results, final, summary = [], {}, "", {}
    for line in clean.splitlines():
        try:
            e = json.loads(line)
        except ValueError:
            continue
        t = e.get("type")
        if t == "assistant":
            for c in e.get("message", {}).get("content", []):
                if c.get("type") == "tool_use":
                    calls.append((c.get("id"), c.get("name"), describe_call(c.get("name"), c.get("input") or {})))
        elif t == "user":
            for c in e.get("message", {}).get("content", []) or []:
                if isinstance(c, dict) and c.get("type") == "tool_result":
                    body = c.get("content")
                    body = body if isinstance(body, str) else json.dumps(body)
                    results[c.get("tool_use_id")] = (bool(c.get("is_error")), (body.strip().splitlines() or [""])[0][:160])
        elif t == "result":
            final = e.get("result") or ""
            summary = {k: e.get(k) for k in ("subtype", "is_error", "num_turns", "duration_ms", "total_cost_usd", "permission_denials")}

    with open(prefix + ".md", "w", encoding="utf-8") as f:
        f.write(final)

    lines = ["# QA agent tool timeline", ""]
    if summary:
        mins = (summary.get("duration_ms") or 0) / 60000
        lines.append(f"- Result: {summary.get('subtype')} (is_error={summary.get('is_error')}), "
                     f"{summary.get('num_turns')} turns, {mins:.1f} min")
    lines.append(f"- Tool calls: {len(calls)}")
    denials = summary.get("permission_denials") or []
    lines.append(f"- Refused by permission rules: {len(denials)}")
    lines.append("")
    for i, (cid, name, what) in enumerate(calls, 1):
        err, first = results.get(cid, (None, ""))
        mark = "ERROR" if err else ("ok" if err is not None else "no result")
        lines.append(f"{i:3d}. [{name}] {what}")
        lines.append(f"     -> {mark}: {first}")
    if denials:
        lines += ["", "## Refused tool calls"]
        for d in denials:
            lines.append(f"- [{d.get('tool_name')}] {describe_call(d.get('tool_name'), d.get('tool_input') or {})}")
    timeline = redact("\n".join(lines) + "\n", secrets)
    with open(prefix + ".tools.md", "w", encoding="utf-8") as f:
        f.write(timeline)
    print(timeline)

    leaked = [s for s in secrets if s and s != REDACTED and any(s in open(prefix + ext, encoding="utf-8").read() for ext in (".jsonl", ".md", ".tools.md"))]
    if leaked:
        print("::error::A secret value survived redaction; refusing to keep the run files.")
        for ext in (".jsonl", ".md", ".tools.md"):
            open(prefix + ext, "w").close()
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: qa_agent_transcript.py <raw.jsonl> <out-prefix>")
    main(sys.argv[1], sys.argv[2])
