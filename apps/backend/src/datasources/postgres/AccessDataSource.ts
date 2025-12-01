import { injectable } from 'tsyringe';
import { createMongoAbility, MongoAbility, RawRuleOf } from '@casl/ability';
import { Fap } from '../../models/Fap';
import { AccessDataSource } from '../AccessDataSource';

export type Action = 'manage'
export type Subject = typeof Fap | Fap;
type AppAbilities = [Action, Subject];
type AppAbility = MongoAbility<AppAbilities>;

const rawRules: RawRuleOf<AppAbility>[] = [
  { action: 'manage', subject: Fap }
];

@injectable()
export default class PostgresAccessDataSource implements AccessDataSource{
  private ability: AppAbility;

  constructor() {
    this.ability = createMongoAbility<AppAbility>(rawRules)
  }

  canAccess(id: number, action: Action) {
    return this.ability.can(action, Fap);
  }
}