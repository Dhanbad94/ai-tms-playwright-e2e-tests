export function addComment2ResultCLI(): void {
  const args = process.argv.slice(2);
  const id = args[0];
  const f1 = args[1];
  const f2 = args[2];

  const result: any = { id, f1, f2 };
  console.log(JSON.stringify(result));
}

if (require.main === module) addComment2ResultCLI();
