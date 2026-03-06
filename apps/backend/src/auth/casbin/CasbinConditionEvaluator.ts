import { injectable, inject } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import {
  CasbinCondition,
  CasbinConditionDataSource,
} from '../../datasources/CasbinConditionDataSource';
import { UserContextData } from '../authContexts/UserAuthContext';
import { AuthRegistry, ResourceType } from '../AuthRegistry';

@injectable()
export class CasbinConditionEvaluator {
  private readonly conditionCache = new Map<number, CasbinCondition>();

  constructor(
    @inject(Tokens.CasbinConditionDataSource)
    private readonly conditionDataSource: CasbinConditionDataSource,
    @inject(Tokens.AuthRegistry)
    private readonly authRegistry: AuthRegistry
  ) {}

  async evaluate(
    sub: UserContextData,
    obj: any,
    con: number
  ): Promise<boolean> {
    let conditionRecord = this.conditionCache.get(con) ?? null;

    if (!conditionRecord) {
      const record = await this.conditionDataSource.get(con);
      if (!record) return false;

      this.conditionCache.set(con, record);
      conditionRecord = record;
    }

    const ctx = { user: sub, obj };

    return this.evalNode(conditionRecord.condition, ctx);
  }

  private async evalNode(
    node: any,
    ctx: { user: UserContextData; obj: any }
  ): Promise<boolean> {
    if (node.combinator && Array.isArray(node.rules)) {
      if (node.combinator === 'and') {
        for (const rule of node.rules) {
          if (!(await this.evalNode(rule, ctx))) return false;
        }

        return true;
      }

      if (node.combinator === 'or') {
        for (const rule of node.rules) {
          if (await this.evalNode(rule, ctx)) return true;
        }

        return false;
      }
    }

    return this.evalRule(node, ctx);
  }

  private resolveValue(
    field: string,
    ctx: { user: UserContextData; obj: any }
  ) {
    const fnRegistry =
      this.authRegistry.functions[ctx.obj?.type as ResourceType];

    if (fnRegistry?.[field]) {
      return fnRegistry[field];
    }

    const [root, ...path] = field.split('.');
    const base = root === 'user' ? ctx.user : ctx.obj;

    return path.reduce((acc, key) => acc?.[key], base);
  }

  private async evalRule(
    rule: any,
    ctx: { user: UserContextData; obj: any }
  ): Promise<boolean> {
    const { field, operator, value } = rule;

    let leftValue: any = this.resolveValue(field, ctx);

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

  walkAst(node: any, fn: (rule: any) => void): void {
    if (!node) return;

    if (node.combinator && Array.isArray(node.rules)) {
      for (const child of node.rules) {
        this.walkAst(child, fn);
      }

      return;
    }

    fn(node);
  }
}
