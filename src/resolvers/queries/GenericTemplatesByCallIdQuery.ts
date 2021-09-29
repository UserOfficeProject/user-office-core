import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@Resolver()
export class GenericTemplateByCallIdQuery {
  @Query(() => [GenericTemplate], { nullable: true })
  genericTemplatesByCallId(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return context.queries.genericTemplate.getGenericTemplatesByCallId(context.user, callId);
  }
}
