import { ForcedSubject, MongoAbility, RawRuleOf } from "@casl/ability";
import { PermissionRuleFragment } from "generated/sdk";

export const actions = ['update', 'read', 'delete'] as const;
export const subjects = ['fap', 'proposal'] as const;

type Rule = {
  action: string,
  subject: string,
  conditions: any
}

export type Abilities = [
  string,
  string
];

export type AppAbility = MongoAbility<Abilities>;

export function convertToRule(permissionRecords: PermissionRuleFragment[], object?: any): RawRuleOf<AppAbility>[] {
    const rules: Rule[] = [];

    permissionRecords.forEach(permissionRecord => {
      rules.push(
        {
          action: permissionRecord.action,
          subject: permissionRecord.subject,
          conditions: permissionRecord.conditions == null || object == null ? null : substituteConditionsValues(JSON.parse(permissionRecord.conditions), flatten(object))
        }
      )
    });

    return rules;
  }

function substituteConditionsValues(conditions: any, object: any) {
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

function flatten(object: any) {
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