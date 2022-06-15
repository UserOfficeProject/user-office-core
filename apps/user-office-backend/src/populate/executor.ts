/* eslint-disable no-console */
export async function execute<T>(f: () => Promise<T>, count: number) {
  const results: Array<T> = [];
  for (let index = 0; index < count; index++) {
    try {
      results.push(await f());
    } catch (e) {
      console.log('execution failure');
    }
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${Math.round((index / count) * 100)}%`);
  }
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log('100%');

  return results;
}
