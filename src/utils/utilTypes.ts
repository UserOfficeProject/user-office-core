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

/**
 * Usually used type for Formik Autocomplete
 */
export interface Option {
  text: string;
  value: string | number;
}
