export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a !== Object(a) || b !== Object(b)) {
    return false;
  }
  const props = Object.keys(a);
  if (props.length !== Object.keys(b).length) {
    return false;
  }

  return props.every(function (prop) {
    return deepEqual(
      (a as Record<string, unknown>)[prop],
      (b as Record<string, unknown>)[prop]
    );
  });
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
