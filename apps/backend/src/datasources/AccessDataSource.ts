import { AccessRule } from "../models/AccessRule"
import { CreateAccessRuleInput } from "../resolvers/mutations/CreateAccessRuleMutation";

export interface AccessDataSource {
  canAccess(id: number, action: string, subject: string): Promise<boolean>;
  getAccessRule(id: number): Promise<AccessRule | null>;
  getAccessRules(): Promise<{ totalCount: number; accessRule: AccessRule[] }>;
  deleteAccessRule(id: number): Promise<AccessRule | null>;
  createAccessRule(args: CreateAccessRuleInput): Promise<AccessRule | null>;
}
