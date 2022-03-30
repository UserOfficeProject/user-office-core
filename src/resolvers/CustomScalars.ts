import { GraphQLScalarType, Kind } from 'graphql';

export type AnswerType = number | string | Date | boolean | number[];

const coerce = (value: AnswerType) => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'boolean') {
    return Boolean(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  return value;
};

export const IntStringDateBoolArray = new GraphQLScalarType({
  name: 'IntStringDateBoolArray',
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
