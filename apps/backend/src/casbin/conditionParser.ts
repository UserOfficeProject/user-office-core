import { container } from 'tsyringe';

import { functionRegistry } from '../auth/AuthRegistry';
import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';

export async function evalCondition(
  sub: string,
  obj: any,
  con: any
): Promise<boolean> {
  const casbinConditionDataSource =
    container.resolve<CasbinConditionDataSource>(
      Tokens.CasbinConditionDataSource
    );

  // TODO: cache the conditions
  const conditionRecord = await casbinConditionDataSource.get(con);
  if (!conditionRecord) return false;

  const conditionJson = conditionRecord.condition;

  const ctx = { role: sub, obj };

  return evalNode(conditionJson, ctx);
}

function evalNode(node: any, ctx: { role: string; obj: any }): boolean {
  if (node.combinator && Array.isArray(node.rules)) {
    // TODO: short circuit in OR conditions when a true condition is found
    const results = node.rules.map((rule: any) => evalNode(rule, ctx));

    return node.combinator === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  return evalRule(node, ctx);
}

function resolveValue(field: string, ctx: { role: string; obj: any }) {
  const fnRegistry = functionRegistry.get(ctx.obj?.type);

  if (fnRegistry?.[field]) {
    return fnRegistry[field];
  }

  const [_, ...path] = field.split('.');

  const base = ctx.obj;

  return path.reduce((acc, key) => acc?.[key], base);
}

function evalRule(rule: any, ctx: { role: string; obj: any }): boolean {
  const { field, operator, value: rightValue } = rule;

  let leftValue = resolveValue(field, ctx) ?? null;

  if (typeof leftValue === 'function') {
    leftValue = leftValue(ctx.role, ctx.obj);
  }

  switch (operator) {
    case '=':
      // Temp workaround
      if (typeof leftValue === 'boolean') {
        return leftValue === (rightValue === 'true');
      }

      return leftValue === rightValue;

    case '!=':
      return leftValue !== rightValue;

    case 'contains':
      if (!Array.isArray(leftValue)) return false;

      const rightValues = String(rightValue)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

      return rightValues.some((v) => leftValue.includes(v));

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
