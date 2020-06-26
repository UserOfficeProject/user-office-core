export function stringToNumericArray(value: any): Array<number> {
  return value
    .split(',')
    .map((str: string) => parseInt(str))
    .filter((maybeNumber: any) => Number.isNaN(maybeNumber) === false);
}
