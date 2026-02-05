import { AccessRule } from "../models/AccessRule"
import { CreateAccessRuleInput } from "../resolvers/mutations/CreateAccessRuleMutation";

export interface AccessDataSource {
  canAccess2(userRole: string, action: string, subjectType: string, object: any): Promise<boolean>;
  getAccessRule(id: number): Promise<AccessRule | null>;
  getAccessRules(): Promise<{ totalCount: number; accessRule: AccessRule[] }>;
  deleteAccessRule(id: number): Promise<AccessRule | null>;
  createAccessRule(args: CreateAccessRuleInput): Promise<AccessRule | null>;
}
