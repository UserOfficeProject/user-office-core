export function stringToNumericArray(
  value: string,
  separator: string = ','
): Array<number> {
  return value
    .split(separator)
    .map((str: string) => parseInt(str))
    .filter((maybeNumber: any) => Number.isNaN(maybeNumber) === false);
}
