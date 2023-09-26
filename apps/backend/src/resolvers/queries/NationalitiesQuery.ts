import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Entry } from '../types/Entry';

@Resolver()
export class NationalitiesQuery {
  @Query(() => [Entry], { nullable: true })
  nationalities(@Ctx() context: ResolverContext) {
    return context.queries.admin.getNationalities();
  }
}
