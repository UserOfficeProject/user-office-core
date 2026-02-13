import { AnyAbility, ForbiddenError, Generics, Normalize } from '@casl/ability';
import { Rule } from '@casl/ability/dist/types/Rule';
import { rulesToQuery } from '@casl/ability/extra';
import { CompoundCondition } from '@ucast/core';
import type { Condition } from '@ucast/core/dist/types/Condition';
import {
  allInterpreters,
  createSqlInterpreter,
  pg,
  SqlQueryOptions,
} from '@ucast/sql';

const interpret = createSqlInterpreter(allInterpreters);

const OPS_INVERTED = {
  eq: 'ne',
  ne: 'eq',
  gt: 'lte',
  gte: 'lt',
  lt: 'gte',
  lte: 'gt',
  in: 'nin',
  nin: 'in',
};

export const toKnexRawQuery = (
  ability: any,
  action: string,
  subject: string,
): [string, ...any[]] => {
  ForbiddenError.from(ability).throwUnlessCan(action, subject);

  const { $and = [], $or = [] } = rulesToQuery(
    ability,
    action,
    subject as never,
    (rule: Rule<any, any>) => {
      if (!rule.ast) {
        throw new Error('Unable to create knex query without AST');
      }

      if (rule.inverted) {
        return {
          ...rule.ast,
          operator: OPS_INVERTED[rule.ast.operator as keyof typeof OPS_INVERTED],
        };
      }

      return rule.ast;
    },
  ) as { $and: Condition[]; $or: Condition[] };

  const condition = new CompoundCondition('and', [
    ...$and,
    new CompoundCondition('or', $or),
  ]);

  const [sql, replacements] = interpret(condition, {
    ...(pg as unknown as SqlQueryOptions),
    paramPlaceholder: () => '?',
  });

  return [sql, replacements];
};