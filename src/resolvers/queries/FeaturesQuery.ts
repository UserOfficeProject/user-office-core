import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Feature } from '../types/Feature';
import { Settings } from '../types/Settings';

@Resolver()
export class FeaturesQuery {
  @Query(() => [Feature])
  features(@Ctx() context: ResolverContext) {
    return context.queries.admin.getFeatures();
  }
}

@Resolver()
export class SettingsQuery {
  @Query(() => [Settings])
  settings(@Ctx() context: ResolverContext) {
    return context.queries.admin.getSettings();
  }
}
