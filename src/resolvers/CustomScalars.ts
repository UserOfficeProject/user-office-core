import { GraphQLScalarType, Kind } from 'graphql';
import moment from 'moment';

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

const TZ_LESS_DATE_TIME = 'yyyy-MM-DD HH:mm:ss';

function parseTzLessDateTime(value: string) {
  const parsed = moment(value, TZ_LESS_DATE_TIME);

  if (!parsed.isValid()) {
    throw new Error('Invalid date/format');
  }

  return parsed.toDate();
}

export const TzLessDateTime = new GraphQLScalarType({
  name: 'TzLessDateTime',
  description: `DateTime without timezone in '${TZ_LESS_DATE_TIME}' format`,
  serialize(value: Date) {
    return moment(value).format(TZ_LESS_DATE_TIME);
  },
  parseValue(value: string) {
    return parseTzLessDateTime(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      return null;
    }

    return parseTzLessDateTime(ast.value);
  },
});
