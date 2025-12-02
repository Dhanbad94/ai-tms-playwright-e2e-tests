export function add2ResultCLI(): void {
  const args = process.argv.slice(2);
  const browserID = args[0] ?? '0';
  const env = args[1];
  const tag = args[2];
  const time = args[3];

  const result: any = {};
  result.status_id = 1;
  result.custom_kind = 2;
  result.custom_browser_id = parseInt(String(browserID), 10);

  switch (env) {
    case 'staging':
      result.custom_env = 1;
      break;
    case 'preproduction':
      result.custom_env = 2;
      break;
    case 'prod':
      result.custom_env = 3;
      break;
    default:
      result.custom_env = 0;
  }

  if (tag === 'smoke') result.custom_class = 1;
  else if (tag === 'system') result.custom_class = 2;

  result.elapsed = time;
  console.log(JSON.stringify(result));
}

if (require.main === module) add2ResultCLI();
