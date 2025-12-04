import { injectable } from 'tsyringe';
import { createMongoAbility, ForbiddenError, MongoAbility, RawRuleOf } from '@casl/ability';
import { Fap } from '../../models/Fap';
import { AccessDataSource } from '../AccessDataSource';

export type Action = 'cannot' | 'update'
export type Subject = typeof Fap | Fap;
type AppAbilities = [Action, Subject];
type AppAbility = MongoAbility<AppAbilities>;

const rawRules: RawRuleOf<AppAbility>[] = [
  { action: 'update', subject: Fap }
];

@injectable()
export default class PostgresAccessDataSource implements AccessDataSource{
  private ability: AppAbility;

  constructor() {
    this.ability = createMongoAbility<AppAbility>(rawRules);
  }

  canAccess(id: number, action: Action) {
    return this.ability.can(action, Fap);
  }
}