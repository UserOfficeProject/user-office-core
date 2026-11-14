import { Query, Ctx, Arg, Resolver } from 'type-graphql';
import { ResolverContext } from '../../context';

@Resolver()
export class SafetyFormQuery {
  @Query(() => Boolean, { nullable: true })
  hasUserPassedSafetyForm(
    @Ctx() context: ResolverContext,
    @Arg('oidcSub', () => String) oidcSub: string
  ) {    
      return context.queries.user.getHasUserPassedSafetyTest(context.user, oidcSub);
  }
}