import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';
import { Tag } from '../models/Tag';

export async function evalCondition(
  sub: any,
  obj: any,
  con: any
): Promise<boolean> {
  const casbinConditionDataSource =
    container.resolve<CasbinConditionDataSource>(
      Tokens.CasbinConditionDataSource
    );

  const conditionRecord = await casbinConditionDataSource.get(Number(con));
  if (!conditionRecord) return false;

  const ast = conditionRecord.condition;

  const ctx = { user: sub, obj };

  return evalNode(ast, ctx);
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

function resolveField(field: string, ctx: { user: any; obj: any }) {
  const [root, ...path] = field.split('.');

  let base;
  if (root === 'user') base = ctx.user;
  else base = ctx.obj;

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

    case 'hasTag':
      return hasTag(fieldValue, value);

    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

export function hasTag(tags: Tag[], shortCode: string): boolean {
  if (!tags || !Array.isArray(tags)) return false;

  return tags.some((t) => t.shortCode === shortCode);
}
