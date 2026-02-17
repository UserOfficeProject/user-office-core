import { container } from 'tsyringe';

import { authFunctionRegistry } from '../auth/authFunctions/authFunctions';
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

  // TODO: cache the conditions
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

// e.g. call.shortCode or a function belonging to the resource
function resolveValue(field: string, ctx: { user: any; obj: any }) {
  // Function case
  if (!field.includes('.')) {
    const resource = ctx.obj?.type;

    if (!resource) {
      throw new Error('Object does not contain a "type" field');
    }

    const registry = authFunctionRegistry.get(resource);

    if (!registry) {
      throw new Error(`No auth function registry for resource "${resource}"`);
    }

    const fn = registry[field];

    if (!fn) {
      throw new Error(
        `Unknown auth function "${field}" for resource "${resource}"`
      );
    }

    return fn;
  }

  // Field case

  const [_, ...path] = field.split('.');

  const base = ctx.obj;

  return path.reduce((acc, key) => acc?.[key], base);
}

function evalRule(rule: any, ctx: { user: any; obj: any }): boolean {
  const { field, operator, value } = rule;

  let fieldValue = resolveValue(field, ctx) ?? null;

  if (typeof fieldValue === 'function') {
    fieldValue = fieldValue(ctx.user, ctx.obj);
  }

  switch (operator) {
    case '=':
      // Temp workaround
      if (typeof fieldValue === 'boolean') {
        return fieldValue === (value === 'true');
      }

      return fieldValue === value;

    case '!=':
      return fieldValue !== value;

    case 'contains':
      if (!Array.isArray(fieldValue)) return false;

      const values = String(value)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

      return values.some((v) => fieldValue.includes(v));

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
