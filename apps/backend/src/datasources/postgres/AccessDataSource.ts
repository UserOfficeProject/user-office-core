import { createMongoAbility, ForcedSubject, MongoAbility, RawRuleOf } from '@casl/ability';
import { Fap } from '../../models/Fap';
import { AccessDataSource } from '../AccessDataSource';
import database from './database';
import {
  AccessRecord,
} from './records';
import { Roles } from '../../models/Role';

export const actions = ['update','read'] as const;
export const subjects = ['Fap', Fap] as const;
type rule = {
  action: typeof actions[number],
  subject: typeof subjects[number],
  conditions: any
}

export type Abilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>> | Fap
];

export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);

export default class PostgresAccessDataSource implements AccessDataSource {
  createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);

  convertToRule = (accessRecords: AccessRecord[]): RawRuleOf<AppAbility>[]  => {
    const rules: rule[] = [];
    accessRecords.forEach(accessRecord => { rules.push(
      {
        action: accessRecord.action,
        subject: accessRecord.subject,
        conditions: JSON.parse(accessRecord.conditions)
      }
  )});

    return rules;
  }

  canAccess(id: number, role: Roles, action: typeof actions[number], subject: typeof subjects[number]) {
    return database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('role_user as ru', 'rhp.role_id', 'ru.role_id')
    .join('roles as r', 'ru.role_id', 'r.role_id')
    .where('ru.user_id', id)
    .andWhere('r.short_code', role.toLowerCase())
    .andWhere('p.action', action)
    .andWhere('p.subject', subject)
    .then((access: AccessRecord[] | null) => access ? createAbility(this.convertToRule(access)).can(action, subject) : false);
  }

  getRule(id: number, role: Roles, action: typeof actions[number], subject: typeof subjects[number]) {
    return database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('role_user as ru', 'rhp.role_id', 'ru.role_id')
    .join('roles as r', 'ru.role_id', 'r.role_id')
    .where('ru.user_id', id)
    .andWhere('r.short_code', role.toLowerCase())
    .andWhere('p.action', action)
    .andWhere('p.subject', subject)
    .then((access: AccessRecord[] | null) => access ? createAbility(this.convertToRule(access)) : null);
  }
}
