/**
 * marks nullable types as not nullable
 * e.g.
 *
 *  export type Maybe<T> = T | null;
 * this would accept
 * const test1: Maybe<string> = 'foo'; // ok
 * const test2: Maybe<string> = null; // ok
 *
 * Using NotNull removes the nullable part
 *
 * type NotNullableString = NotNull<Maybe<string>>;
 * const test1: NotNullableString = 'foo'; // ok
 * const test2: NotNullableString = null; // Error
 *
 * Useful when you want to use embedded type in generated/sdk but it is nullable
 */
export type NotNull<T> = T extends null ? never : T;

/**
 * This unpacks an array let you infer the type of a single elem
 *
 * e.g.:
 * type SomethingArray = string[]; // this will be string[]
 *
 * now to get single element's type
 *
 * type test = Unpacked<SomethingArray>; // this will be string
 *
 * Useful when you want to use embedded type in generated/sdk but it's an array
 * but you need to able able to work with single element
 */
export type Unpacked<T> = T extends (infer U)[] ? U : T;

/**
 * A bit more specific function type for making the eslint happy.
 */
export type FunctionType<T = void, U = unknown[]> = (
  ...args: U extends unknown[] ? U : [U]
) => T;
