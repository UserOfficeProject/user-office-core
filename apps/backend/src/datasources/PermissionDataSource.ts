import { PermissionRule } from "../models/PermissionRule"
import { CreatePermissionRuleArgs } from "../resolvers/mutations/CreatePermissionRuleMutation";
import { UpdatePermissionRuleArgs } from "../resolvers/mutations/UpdatePermissionRuleMutation";

export interface PermissionDataSource {
  hasPermission(userRole: string, action: string, subjectType: string, object: any): Promise<boolean>;
  getPermissionRule(id: number): Promise<PermissionRule | null>;
  getPermissionRules(): Promise<{ totalCount: number; permissionRule: PermissionRule[] }>;
  deletePermissionRule(id: number): Promise<PermissionRule | null>;
  createPermissionRule(args: CreatePermissionRuleArgs): Promise<PermissionRule | null>;
  updatePermissionRule(args: UpdatePermissionRuleArgs): Promise<PermissionRule | null>;
}
