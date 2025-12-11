import { Roles } from "../models/Role";
import { actions, AppAbility, subjects } from "./postgres/AccessDataSource";

export interface AccessDataSource {
  canAccess(id: number, role: Roles, action: typeof actions[number], subject: typeof subjects[number]): Promise<boolean>;
  getRule(id: number, role: Roles, action: typeof actions[number], subject: typeof subjects[number]): Promise<AppAbility | null>;
}