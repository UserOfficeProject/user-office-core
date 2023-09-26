import { Arg, Ctx, Query, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate } from '../types/GenericTemplate';

@Resolver()
export class GenericTemplateQuery {
  @Query(() => GenericTemplate, { nullable: true })
  genericTemplate(
    @Ctx() context: ResolverContext,
    @Arg('genericTemplateId', () => Int) genericTemplateId: number
  ) {
    return context.queries.genericTemplate.getGenericTemplate(
      context.user,
      genericTemplateId
    );
  }
}
