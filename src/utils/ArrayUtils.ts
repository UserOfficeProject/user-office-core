export function stringToNumericArray(
  value: string,
  separator = ','
): Array<number> {
  return value
    .split(separator)
    .map((str: string) => parseInt(str))
    .filter((maybeNumber: any) => Number.isNaN(maybeNumber) === false);
}

export function stringToTextArray(
  value: string,
  separator = ','
): Array<string> {
  return value
    .split(separator)
    .filter((maybeString: any) => typeof maybeString === 'string');
}

export function toArray(input: string | string[]): string[] {
  if (typeof input === 'string') {
    return [input];
  }

  return input;
}
