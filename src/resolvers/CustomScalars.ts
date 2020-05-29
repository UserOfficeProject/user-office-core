import { GraphQLScalarType, Kind } from 'graphql';

const MAX_INT = 2147483647;
const MIN_INT = -2147483648;
const coerce = (value: number | string | Date | boolean) => {
  if (Array.isArray(value)) {
    throw new TypeError(
      `IntString cannot represent an array value: [${String(value)}]`
    );
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value < MIN_INT || value > MAX_INT) {
      throw new TypeError(
        `Value is integer but outside of valid range for 32-bit signed integer: ${String(
          value
        )}`
      );
    }

    return value;
  }

  if (typeof value === 'boolean') {
    return Boolean(value);
  }

  if (value instanceof Date) {
    return value;
  }

  return String(value);
};
export const IntStringDateBool = new GraphQLScalarType({
  name: 'IntStringDateBool',
  serialize: coerce,
  parseValue: coerce,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return coerce(parseInt(ast.value, 10));
    }
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    if (ast.kind === Kind.BOOLEAN) {
      return ast.value;
    }

    return undefined;
  },
});
