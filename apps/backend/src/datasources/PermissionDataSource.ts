import { PermissionRule } from "../models/PermissionRule"
import { CreatePermissionRuleArgs } from "../resolvers/mutations/CreatePermissionRuleMutation";
import { UpdatePermissionRuleArgs } from "../resolvers/mutations/UpdatePermissionRuleMutation";
import { PermissionRulesArgs } from "../resolvers/queries/PermissionsQuery";
import { actions, subjects, AppAbility } from "./postgres/PermissionDataSource";

export interface PermissionDataSource {
  getAbility(userRole: string, action: typeof actions[number], subjectType: typeof subjects[number], isDbPermission: boolean, object?: any | undefined): Promise<AppAbility | null>
  hasPermission(userRole: string, action: string, subjectType: string, isDbPermission: boolean, object: any): Promise<boolean>;
  getPermissionRule(id: number): Promise<PermissionRule | null>;
  getPermissionRules(filter?: PermissionRulesArgs): Promise<{ totalCount: number; permissionRule: PermissionRule[] }>;
  deletePermissionRule(id: number): Promise<PermissionRule | null>;
  createPermissionRule(args: CreatePermissionRuleArgs): Promise<PermissionRule | null>;
  updatePermissionRule(args: UpdatePermissionRuleArgs): Promise<PermissionRule | null>;
}
