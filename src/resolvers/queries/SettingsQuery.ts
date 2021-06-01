import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Settings } from '../types/Settings';

@Resolver()
export class SettingsQuery {
  @Query(() => [Settings])
  settings(@Ctx() context: ResolverContext) {
    return context.queries.admin.getSettings();
  }
}
