import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Facility } from '../types/Facility';

@Resolver()
export class FacilityQuery {
  @Query(() => [Facility])
  async facilities(@Ctx() context: ResolverContext): Promise<Facility[]> {
    return await context.queries.facility.getFacilities(null);
  }

  @Query(() => Facility, { nullable: true })
  async facility(
    @Arg('id') id: number,
    @Ctx() context: ResolverContext
  ): Promise<Facility | undefined> {
    return (await context.queries.facility.getFacilities([id])).pop();
  }
}
