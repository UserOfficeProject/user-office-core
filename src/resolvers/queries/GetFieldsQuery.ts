import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Fields } from '../types/Fields';
@Resolver()
export class GetFieldsQuery {
  @Query(() => Fields, { nullable: true })
  getFields(@Ctx() context: ResolverContext) {
    return new Fields();
  }
}
