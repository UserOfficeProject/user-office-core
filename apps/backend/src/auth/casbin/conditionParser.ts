import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CasbinConditionDataSource } from '../../datasources/CasbinConditionDataSource';
import { UserContextData } from '../authContexts/UserAuthContext';
import { AuthRegistry, ResourceType } from '../AuthRegistry';

export async function evalCondition(
  sub: UserContextData,
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
  const ctx = { user: sub, obj };

  return evalNode(conditionJson, ctx);
}

async function evalNode(
  node: any,
  ctx: { user: UserContextData; obj: any }
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

function resolveValue(field: string, ctx: { user: UserContextData; obj: any }) {
  const authRegistry = container.resolve<AuthRegistry>(Tokens.AuthRegistry);
  const fnRegistry = authRegistry.functions[ctx.obj?.type as ResourceType];

  if (fnRegistry?.[field]) {
    return fnRegistry[field];
  }

  const [root, ...path] = field.split('.');

  const base = root === 'user' ? ctx.user : ctx.obj;

  return path.reduce((acc, key) => acc?.[key], base);
}

async function evalRule(
  rule: any,
  ctx: { user: UserContextData; obj: any }
): Promise<boolean> {
  const { field, operator, value } = rule;

  let leftValue = resolveValue(field, ctx) ?? null;

  if (typeof leftValue === 'function') {
    leftValue = await leftValue(ctx.user, ctx.obj);
  }

  leftValue = String(leftValue);
  const rightValue = String(value);

  switch (operator) {
    case '=':
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
