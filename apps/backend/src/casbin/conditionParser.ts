import { container } from 'tsyringe';

import { AuthRegistry } from '../auth/AuthRegistry';
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

  const conditionRecord = await casbinConditionDataSource.get(con);
  if (!conditionRecord) return false;

  const conditionJson = conditionRecord.condition;
  const ctx = { role: sub, obj };

  return evalNode(conditionJson, ctx);
}

async function evalNode(
  node: any,
  ctx: { role: string; obj: any }
): Promise<boolean> {
  if (node.combinator && Array.isArray(node.rules)) {
    const results = await Promise.all(
      node.rules.map((rule: any) => evalNode(rule, ctx))
    );

    return node.combinator === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  return evalRule(node, ctx);
}

function resolveValue(field: string, ctx: { role: string; obj: any }) {
  const authRegistry = container.resolve<AuthRegistry>(Tokens.AuthRegistry);
  const fnRegistry = authRegistry.functions.get(ctx.obj?.type);

  if (fnRegistry?.[field]) {
    return fnRegistry[field];
  }

  const [_, ...path] = field.split('.');
  const base = ctx.obj;

  return path.reduce((acc, key) => acc?.[key], base);
}

async function evalRule(
  rule: any,
  ctx: { role: string; obj: any }
): Promise<boolean> {
  const { field, operator, value: rightValue } = rule;

  let leftValue = resolveValue(field, ctx) ?? null;

  if (typeof leftValue === 'function') {
    leftValue = await leftValue(ctx.role, ctx.obj);
  }

  switch (operator) {
    case '=':
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
