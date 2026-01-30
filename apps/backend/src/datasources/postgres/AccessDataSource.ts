import { injectable } from 'tsyringe';
import { createMongoAbility, ForcedSubject, MongoAbility, RawRuleOf, subject } from '@casl/ability';
import { AccessDataSource } from '../AccessDataSource';
import database from './database';
import {
  AccessRecord,
  createAccessRuleObject,
} from './records';
import { CreateAccessRuleInput } from '../../resolvers/mutations/CreateAccessRuleMutation';

export const actions = ['update', 'read', 'delete'] as const;
export const subjects = ['Fap', 'Proposal'] as const;
type rule = {
  action: typeof actions[number],
  subject: typeof subjects[number]
}

export type Abilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];

export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);

@injectable()
export default class PostgresAccessDataSource implements AccessDataSource {
  createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);

  convertToRule = (accessRecords: AccessRecord[]): RawRuleOf<AppAbility>[]  => {
    const rules: rule[] = [];
    accessRecords.forEach(accessRecord => { rules.push({action: accessRecord.action,
      subject: accessRecord.subject
    })});

    return rules;
  }

  async canAccess(id: number, action: typeof actions[number], subject: typeof subjects[number]) {
    return database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('role_user as ru', 'rhp.role_id', 'ru.role_id')
    .where('ru.user_id', id)
    .andWhere('p.action', action)
    .andWhere('p.subject', subject)
    .then((access: AccessRecord[] | null) => access ? createAbility(this.convertToRule(access)).can(action, subject) : false);
  }

  async canAccess2(userRole: string, action: typeof actions[number], subjectType: typeof subjects[number], object: any) {
    return database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'ru.role_id')
    .where('r.short_code', userRole)
    .andWhere('p.action', action)
    .andWhere('p.subject', subjectType)
    .then((access: AccessRecord[] | null) => access ? createAbility(this.convertToRule(access)).can(action, subject(subjectType, object)) : false);
  }

  async getAccessRule(id: number) {
    return database
    .select('p.permission_id', 'p.action', 'p.subject', 'p.action', 'p.conditions', 'rhp.role_id', 'r.shortcode as role')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .where('p.permission_id', id)
    .first()
    .then((access: AccessRecord) =>
            access ? createAccessRuleObject(access) : null
  );
  }

  async getAccessRules() {
    return database
    .select('p.permission_id', 'p.action', 'p.subject', 'p.action', 'p.conditions', 'rhp.role_id', 'r.short_code as role')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .then((access: AccessRecord[]) => {
      const result = access.map(a => createAccessRuleObject(a))
      return {
          totalCount: access ? access.length : 0,
          accessRule: result,
        };
    });
  }

  async deleteAccessRule(id: number) {
    return database
      .where('permissions.permission_id', id)
      .del()
      .from('permissions')
      .returning('*')
      .then((access: AccessRecord[]) => createAccessRuleObject(access[0])
    );
  }

  async createAccessRule(args: CreateAccessRuleInput) {
    return database
      .insert({
        role_id: args.role_id,
        subject: args.subject,
        action: args.action,
        conditions: args.conditions
      })
      .into('permissions')
      .returning('*')
      .then((access: AccessRecord[]) => createAccessRuleObject(access[0])
    );
  }
}
