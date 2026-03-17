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
  private readonly conditionCache = new Map<
    number,
    Promise<CasbinCondition | null>
  >();

  constructor(
    @inject(Tokens.CasbinConditionDataSource)
    private readonly conditionDataSource: CasbinConditionDataSource,
    @inject(Tokens.AuthRegistry)
    private readonly authRegistry: AuthRegistry
  ) {}

  // Called directly by Casbin
  async evaluate(
    sub: UserContextData,
    obj: any,
    con: number
  ): Promise<boolean> {
    if (!this.conditionCache.has(con)) {
      this.conditionCache.set(con, this.conditionDataSource.get(con));
    }

    const conditionRecord = await this.conditionCache.get(con)!;
    if (!conditionRecord) return false;

    const ctx = { user: sub, obj };

    return this.evalNode(conditionRecord.condition, ctx);
  }

  // Recursively evaluate every rule/section of the condition
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

      // Early exit in OR conditions
      if (node.combinator === 'or') {
        for (const rule of node.rules) {
          if (await this.evalNode(rule, ctx)) return true;
        }

        return false;
      }
    }

    return this.evalRule(node, ctx);
  }

  /*
   * Resolves the field (left) and value (right) to determine whether it's a:
   * a) user attribute (e.g. 'user.id')
   * b) resource attribute (e.g. 'proposal.title')
   * c) resource function (e.g. 'isCallEnded' on a proposal resource)
   */
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

  // Evaluate and compare the condition
  private async evalRule(
    rule: any,
    ctx: { user: UserContextData; obj: any }
  ): Promise<boolean> {
    const { field, operator, value } = rule;

    let leftValue = this.resolveValue(field, ctx);
    let rightValue = value;

    if (typeof leftValue === 'function') {
      leftValue = await leftValue(ctx.user, ctx.obj);
    }

    // Allows referencing a user or resource attribute on the right side using {} syntax, e.g. '{user.id}'
    const rightReference = value.match(/^\{(.+)\}$/);
    if (rightReference) {
      rightValue = this.resolveValue(rightReference[1], ctx);
      if (typeof rightValue === 'function') {
        return false;
      }
    }

    leftValue = String(leftValue).toLowerCase();
    rightValue = String(rightValue).toLowerCase();

    switch (operator) {
      case '=':
        return leftValue === rightValue;

      case '!=':
        return leftValue !== rightValue;

      // An array example - for now the left side is always a string
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

  // Used for DB filtering to recursively walk through the JSON
  async walkAst(node: any, fn: (rule: any) => Promise<void>): Promise<void> {
    if (!node) return;

    if (node.combinator && Array.isArray(node.rules)) {
      for (const child of node.rules) {
        await this.walkAst(child, fn);
      }

      return;
    }

    await fn(node);
  }

  // Used in DB filtering to abort early if JSON uses OR conditions
  hasOrCombinator(node: any): boolean {
    if (!node) return false;

    if (node.combinator && Array.isArray(node.rules)) {
      if (node.combinator.toLowerCase() === 'or') return true;

      return node.rules.some((child: any) => this.hasOrCombinator(child));
    }

    return false;
  }
}
