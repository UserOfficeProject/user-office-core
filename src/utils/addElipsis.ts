export function addElipsis(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }

  return text;
}
