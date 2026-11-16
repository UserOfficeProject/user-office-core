import { GraphQLError, Kind, parseValue as parseGraphQLValue } from 'graphql';
import { DateTime } from 'luxon';

import { DateWithoutTimezone } from './CustomScalars';

describe('DateWithoutTimezone', () => {
  describe('serialize', () => {
    it.each([
      [new Date(2026, 0, 1), '2026-01-01'],
      [new Date(2024, 1, 29), '2024-02-29'],
      [new Date(2026, 11, 31, 23, 59, 59, 999), '2026-12-31'],
    ])(
      'serializes %s as %s using the local calendar date',
      (value, expected) => {
        expect(DateWithoutTimezone.serialize(value)).toBe(expected);
      }
    );

    it.each(['2026-01-01', 123, true, null, undefined, {}, []])(
      'rejects non-Date value %p',
      (value) => {
        expect(() => DateWithoutTimezone.serialize(value)).toThrow(
          GraphQLError
        );
        expect(() => DateWithoutTimezone.serialize(value)).toThrow(
          `Value is not an instance of Date: ${value}`
        );
      }
    );

    it('rejects an invalid Date', () => {
      const value = new Date(NaN);

      expect(() => DateWithoutTimezone.serialize(value)).toThrow(GraphQLError);
      expect(() => DateWithoutTimezone.serialize(value)).toThrow(
        'Value is not a valid LocalDate: Invalid Date'
      );
    });
  });

  describe.each([
    {
      name: 'parseValue',
      parse: (value: string) => DateWithoutTimezone.parseValue(value),
    },
    {
      name: 'parseLiteral',
      parse: (value: string) =>
        DateWithoutTimezone.parseLiteral({ kind: Kind.STRING, value }, {}),
    },
  ])('$name', ({ parse }) => {
    it.each(['2026-01-01', '2024-02-29', '2026-12-31'])(
      'parses %s as a Luxon DateTime at local midnight',
      (value) => {
        const result = parse(value) as DateTime;

        expect(DateTime.isDateTime(result)).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.toISODate()).toBe(value);
        expect(result).toEqual(DateTime.fromISO(value).startOf('day'));
        expect([
          result.hour,
          result.minute,
          result.second,
          result.millisecond,
        ]).toEqual([0, 0, 0, 0]);
      }
    );

    it('normalizes an ISO date-time to the start of its day', () => {
      const result = parse('2026-10-02T15:30:45.123') as DateTime;

      expect(result).toEqual(DateTime.local(2026, 10, 2).startOf('day'));
    });

    it.each(['', 'not-a-date', '2026-02-29', '2026-04-31', '2026-13-01'])(
      'rejects invalid date %p',
      (value) => {
        expect(() => parse(value)).toThrow(GraphQLError);
        expect(() => parse(value)).toThrow(
          `Value is not a valid LocalDate: ${value}`
        );
      }
    );
  });

  describe('parseValue input validation', () => {
    it.each([123, true, null, undefined, {}, [], new Date(2026, 0, 1)])(
      'rejects non-string value %p',
      (value) => {
        expect(() => DateWithoutTimezone.parseValue(value)).toThrow(
          GraphQLError
        );
        expect(() => DateWithoutTimezone.parseValue(value)).toThrow(
          `Value is not compatible: ${value}`
        );
      }
    );
  });

  describe('parseLiteral input validation', () => {
    it.each(['123', '1.5', 'true', 'null', '[]', '{}', 'ENUM_VALUE'])(
      'rejects non-string GraphQL literal %s',
      (value) => {
        const ast = parseGraphQLValue(value);

        expect(() => DateWithoutTimezone.parseLiteral(ast, {})).toThrow(
          GraphQLError
        );
        expect(() => DateWithoutTimezone.parseLiteral(ast, {})).toThrow(
          `Can only validate strings as local dates but got a: ${ast.kind}`
        );
      }
    );
  });
});
