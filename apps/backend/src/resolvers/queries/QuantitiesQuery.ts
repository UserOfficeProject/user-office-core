import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Quantity } from '../types/Quantity';

@Resolver()
export class QuantitiesQuery {
  @Query(() => [Quantity])
  quantities(@Ctx() context: ResolverContext) {
    return context.queries.unit.getQuantities();
  }
}
