import { AnyAbility, ForbiddenError } from '@casl/ability';
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

const callBack = (rule: Rule<any, any>) => {
  console.log("BWAAAAAAAAAH")
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
}

export const toKnexRawQuery = (
  ability: AnyAbility,
  action: string,
  subject: string,
): [string, ...any[]] => {
  ForbiddenError.from(ability).throwUnlessCan(action, subject);

  //if there are no conditions on the rules, rulesToQuery will return undefined objects
  const { $and, $or } = rulesToQuery(
    ability,
    action,
    subject,
    callBack,
  ) as { $and: Condition[]; $or: Condition[] };
  
  let condition: CompoundCondition<Condition<unknown>>;

  if (!!$and) {
    condition = new CompoundCondition('and', [
    ...$and,
    new CompoundCondition('or', $or),
  ]);
  } else if (!!$or) {
    condition = new CompoundCondition('or', $or);
  } else {
    return ['()', []];
  }

  const [sql, replacements] = interpret(condition, {
    ...(pg as unknown as SqlQueryOptions),
    paramPlaceholder: () => '?',
  });

  return [sql, replacements];
};