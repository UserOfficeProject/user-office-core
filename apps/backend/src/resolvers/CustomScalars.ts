import { GraphQLScalarType, Kind } from 'graphql';

import { InstrumentFilter as InstrumentFilterEnum } from '../models/Instrument';

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

const MAX_INT = Math.pow(2, 31) - 1;
const MIN_INT = -Math.pow(2, 31);
const coerceInstrumentFilter = (
  value: number | InstrumentFilterEnum | unknown
) => {
  if (
    value !== InstrumentFilterEnum.MULTI &&
    value !== InstrumentFilterEnum.ALL &&
    typeof value !== 'number'
  ) {
    throw new TypeError(`InstrumentFilter got invalid value: ${String(value)}`);
  }

  if (Number.isInteger(value)) {
    const intValue = value as number;

    if (intValue < MIN_INT || intValue > MAX_INT) {
      throw new TypeError(
        `Value is integer but outside of valid range for 32-bit signed integer: ${String(value)}`
      );
    }

    return value;
  }

  return String(value);
};

export const InstrumentFilter = new GraphQLScalarType({
  name: 'InstrumentFilter',
  serialize: coerceInstrumentFilter,
  parseValue: coerceInstrumentFilter,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return coerceInstrumentFilter(parseInt(ast.value, 10));
    }
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }

    return undefined;
  },
});
