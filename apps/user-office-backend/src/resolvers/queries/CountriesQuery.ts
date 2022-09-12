import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Entry } from '../types/Entry';

@Resolver()
export class CountriesQuery {
  @Query(() => [Entry], { nullable: true })
  countries(@Ctx() context: ResolverContext) {
    return context.queries.admin.getCountries();
  }
}
