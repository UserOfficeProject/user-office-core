import { injectable } from 'tsyringe';
import { createMongoAbility, ForcedSubject, MongoAbility, RawRuleOf, subject } from '@casl/ability';
import { PermissionDataSource } from '../PermissionDataSource';
import database from './database';
import {
  PermissionRecord,
  createPermissionRuleObject,
} from './records';
import { CreatePermissionRuleArgs } from '../../resolvers/mutations/CreatePermissionRuleMutation';
import { UpdatePermissionRuleArgs } from '../../resolvers/mutations/UpdatePermissionRuleMutation';
import { PermissionRulesArgs, PermissionRulesFilter } from '../../resolvers/queries/PermissionsQuery';
import { Role } from '../../models/Role';

export const actions = ['update', 'read', 'delete'] as const;
export const subjects = ['fap', 'proposal'] as const;

type Rule = {
  action: typeof actions[number],
  subject: typeof subjects[number],
  conditions: any
}

type Permission = {
  permission_id: number,
  subject: typeof subjects[number],
  action: typeof actions[number],
  conditions: string
}

export type Abilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];

export type AppAbility = MongoAbility<Abilities>;

@injectable()
export default class PostgresPermissionDataSource implements PermissionDataSource {
  createAbility(rules: RawRuleOf<AppAbility>[]){
     return createMongoAbility<AppAbility>(rules);
  }

  convertToRule(permissionRecords: PermissionRecord[], object: any): RawRuleOf<AppAbility>[] {
    const rules: Rule[] = [];

    permissionRecords.forEach(permissionRecord => {
      rules.push(
        {
          action: permissionRecord.action,
          subject: permissionRecord.subject,
          conditions: permissionRecord.conditions == null ? null : this.substituteConditionsValues(JSON.parse(permissionRecord.conditions), this.flatten(object))
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

  async hasPermission(userRole: string, action: typeof actions[number], subjectType: typeof subjects[number], object: any) {
    return await database
    .select('p.action', 'p.subject', 'p.conditions')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    //.where('r.short_code', userRole.replace(new RegExp('_', 'g'), ' '))
    //.whereRaw(`UPPER(r.title) LIKE '%${userRole.replace(new RegExp('_', 'g'), ' ').toUpperCase()}%'`)
    .whereRaw(`UPPER(r.title) LIKE '%${userRole.toUpperCase()}%'`)
    .orWhereRaw(`UPPER(r.short_code) LIKE '%${userRole.toUpperCase()}%'`)
    .andWhere('p.action', action)
    .andWhere('p.subject', subjectType)
    .then((permissionRecords: PermissionRecord[] | null) => permissionRecords ? this.createAbility(this.convertToRule(permissionRecords, object)).can(action, subject(subjectType, object)) : false);
  }

  async getPermissionRule(id: number) {
    return database
    .select('p.permission_id', 'p.action', 'p.subject', 'p.conditions', 'rhp.role_id', 'r.title as role')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .where('p.permission_id', id)
    .first()
    .then((permissionRecord: PermissionRecord) =>
            permissionRecord ? createPermissionRuleObject(permissionRecord) : null
  );
  }

  async getPermissionRules(filter?: PermissionRulesArgs) {
    return database
    .select('p.permission_id', 'p.action', 'p.subject', 'p.conditions', 'rhp.role_id', 'r.title as role')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .modify(query => {
      if (filter?.filter?.role) {
        //query.where('r.title', 'ilike', `%${filter.filter.role}%`)
        query.whereRaw(`UPPER(r.title) = '${filter.filter.role.toUpperCase()}'`)
        .orWhereRaw(`UPPER(r.short_code) = '${filter.filter.role.toUpperCase()}'`);
      }
      if (filter?.filter?.action) {
        query.where('p.action', 'ilike', `%${filter.filter.action}%`);
      }
      if (filter?.filter?.subject) {
        query.where('p.subject', 'ilike', `%${filter.filter.subject}%`);
      }
    })
    .then((permissionRecord: PermissionRecord[]) => {
      const result = permissionRecord.map(a => createPermissionRuleObject(a))
      return {
          totalCount: permissionRecord ? permissionRecord.length : 0,
          permissionRule: result,
        };
    });
  }

  async deletePermissionRule(id: number) {
    const permission = database
    .select('p.permission_id', 'p.action', 'p.subject', 'p.conditions', 'rhp.role_id', 'r.title as role')
    .from('permissions as p')
    .join('role_has_permission as rhp', 'p.permission_id', 'rhp.permission_id')
    .join('roles as r', 'rhp.role_id', 'r.role_id')
    .where('p.permission_id', id)
    .first()
    .then((permissionRecord: PermissionRecord) =>
            permissionRecord ? createPermissionRuleObject(permissionRecord) : null
  );

    await database
      .where('permissions.permission_id', id)
      .del()
      .from('permissions');

    return permission;
  }

  async createPermissionRule(args: CreatePermissionRuleArgs) {
    const permission: Permission[] = await database
      .insert({
        subject: args.subject,
        action: args.action,
        conditions: args.conditions == undefined ? null : args.conditions
      })
      .into('permissions')
      .returning('*');

    const roleId = await database
      .select('role_id')
      .from('roles')
      .where('title', args.role)
      .first()
      .then((result) => result.role_id );

    await database
    .insert({
      role_id: roleId,
      permission_id: permission[0].permission_id
    })
    .into('role_has_permission');

    return createPermissionRuleObject({...permission[0], role: args.role});
  }

  async updatePermissionRule(args: UpdatePermissionRuleArgs) {
    const permission: Permission[] = await database
      .update({
        action: args.action,
        subject: args.subject,
        conditions: args.conditions
      },
      ['*']
    )
      .from('permissions')
      .where('permission_id', args.id);

    const roleId = await database
      .select('role_id')
      .from('roles')
      .where('title', args.role)
      .first()
      .then((result) => result.role_id );

    await database
      .update({
               role_id: roleId
      },
      ['*']
    )
    .from('role_has_permission')
    .where('permission_id', args.id);

    return createPermissionRuleObject({...permission[0], role: args.role});
  }
}
