import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';

export async function evalCondition(
  sub: any,
  obj: any,
  con: any
): Promise<boolean> {
  // Temp workaround - if condition is absent, model.conf should prevent this function being called
  if (con === 'allow') return true;

  const casbinConditionDataSource =
    container.resolve<CasbinConditionDataSource>(
      Tokens.CasbinConditionDataSource
    );

  const conditionRecord = await casbinConditionDataSource.get(con);
  if (!conditionRecord) return false;

  const conditionJson = conditionRecord.condition;

  const ctx = { user: sub, obj };

  return evalNode(conditionJson, ctx);
}

function evalNode(node: any, ctx: { user: any; obj: any }): boolean {
  if (node.combinator && Array.isArray(node.rules)) {
    const results = node.rules.map((rule: any) => evalNode(rule, ctx));

    return node.combinator === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  return evalRule(node, ctx);
}

// e.g. call.shortCode
function resolveField(field: string, ctx: { user: any; obj: any }) {
  const [_, ...path] = field.split('.');

  const base = ctx.obj;

  return path.reduce((acc, key) => acc?.[key], base);
}

function evalRule(rule: any, ctx: { user: any; obj: any }): boolean {
  const { field, operator, value } = rule;

  const fieldValue = resolveField(field, ctx) ?? null;

  switch (operator) {
    case '=':
      return fieldValue === value;

    case '!=':
      return fieldValue !== value;

    case 'contains string':
      return fieldValue && fieldValue.includes(value);

    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

export function walkAst(node: any, fn: (rule: any) => void): void {
  if (!node) return;

  if (node.combinator && Array.isArray(node.rules)) {
    for (const child of node.rules) {
      walkAst(child, fn);
    }

    return;
  }

  fn(node);
}
