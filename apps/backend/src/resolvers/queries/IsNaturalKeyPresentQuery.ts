import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
@Resolver()
export class IsNaturalKeyPresentQuery {
  @Query(() => Boolean, { nullable: true })
  isNaturalKeyPresent(
    @Arg('naturalKey', () => String) naturalKey: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.isNaturalKeyPresent(
      context.user,
      naturalKey
    );
  }
}
