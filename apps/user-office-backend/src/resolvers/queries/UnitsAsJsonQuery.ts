import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';

@Resolver()
export class UnitsAsJsonQuery {
  @Query(() => String, { nullable: true })
  unitsAsJson(@Ctx() context: ResolverContext) {
    return context.queries.unit.getUnitsAsJson();
  }
}
