import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Unit } from '../types/Unit';

@Resolver()
export class UnitsQuery {
  @Query(() => [Unit], { nullable: true })
  units(@Ctx() context: ResolverContext) {
    return context.queries.unit.getUnits();
  }
}
