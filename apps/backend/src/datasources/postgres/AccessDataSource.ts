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
export const subjects = ['fap', 'proposal'] as const;

type rule = {
  action: typeof actions[number],
  subject: typeof subjects[number],
  conditions: any
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

  convertToRule = (accessRecords: AccessRecord[], object: any): RawRuleOf<AppAbility>[] => {
    const rules: rule[] = [];

    accessRecords.forEach(accessRecord => {
      rules.push(
        {
          action: accessRecord.action,
          subject: accessRecord.subject,
          conditions: accessRecord.conditions == null ? null : this.substituteConditionsValues(JSON.parse(accessRecord.conditions), this.flatten(object))
        }
      )
    });

    return rules;
  }

  substituteConditionsValues(conditions: any, object: any) {
    const result: any = {};

    function recurse (cur: any, prop: any, parent: any | null) {
        if (typeof cur === 'string' && Object.keys(object).includes(cur) && parent != null) { //is this a string?
            parent[prop] = object[cur];
        }
         else {
          let isEmpty = true;
            for (let p in cur) {
                isEmpty = false;
                recurse(cur[p], p, cur); //recurse into nested object
            }
            if (isEmpty && prop) {
                result[prop] = {};
            }
            if(parent == null){
              return
            }
        }
      }

      recurse(conditions, "", null);

    return conditions;
  }

  flatten(object: any) {
    const result: any = {}; //accumulator
    function recurse (cur: any, prop: any) {
        if (Object(cur) !== cur) { //is this a literal?
            result[prop] = cur; //store it in the accumulator object
        } else if (Array.isArray(cur)) {
             result[prop] = cur;
        } else {
            let isEmpty = true;
            for (let p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p); //recurse into nested object
            }
            if (isEmpty && prop) {
                result[prop] = {};
            }
        }
    }
    recurse(object, "");

    return result;
}

  async canAccess2(userRole: string, action: typeof actions[number], subjectType: typeof subjects[number], object: any) {
    return await database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .where('r.short_code', userRole)
    .andWhere('p.action', action)
    .andWhere('p.subject', subjectType)
    .then((access: AccessRecord[] | null) => access ? createAbility(this.convertToRule(access, object)).can(action, subject(subjectType, object)) : false);
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
