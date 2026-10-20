import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import { DateTime } from 'luxon';

export type AnswerType = number | string | Date | boolean | number[] | unknown;

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

export const DateWithoutTimezone = new GraphQLScalarType({
  name: 'DateWithoutTimezone',
  description: 'A date without timezone, formatted as YYYY-MM-DD',
  serialize(value) {
    if (!(value instanceof Date)) {
      throw new GraphQLError(`Value is not an instance of Date: ${value}`);
    }

    const valueAsDate = DateTime.fromJSDate(value);
    if (!valueAsDate.isValid)
      throw new GraphQLError(`Value is not a valid LocalDate: ${value}`);

    return valueAsDate.toISODate();
  },
  parseValue: (value) => {
    if (typeof value !== 'string') {
      throw new GraphQLError(`Value is not compatible: ${value}`);
    }
    const parsedDate = DateTime.fromISO(value);
    if (!parsedDate.isValid)
      throw new GraphQLError(`Value is not a valid LocalDate: ${value}`);

    return parsedDate.startOf('day');
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only validate strings as local dates but got a: ${ast.kind}`
      );
    }

    const parsedDate = DateTime.fromISO(ast.value);
    if (!parsedDate.isValid)
      throw new GraphQLError(`Value is not a valid LocalDate: ${ast.value}`);

    return parsedDate.startOf('day');
  },
});
