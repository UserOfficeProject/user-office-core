import { injectable } from 'tsyringe';
import { createMongoAbility, ForbiddenError, ForcedSubject, MongoAbility, RawRuleOf } from '@casl/ability';
import { Fap } from '../../models/Fap';
import { AccessDataSource } from '../AccessDataSource';
import database from './database';
import {
  AccessRecord,
} from './records';

export const actions = ['update','read'] as const;
export const subjects = ['Fap'] as const;
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

  canAccess(id: number, action: typeof actions[number], subject: typeof subjects[number]) {
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
}
