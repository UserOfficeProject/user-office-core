import { Query, Arg, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
@Resolver()
export class CheckEmailExistQuery {
  @Query(() => Boolean, { nullable: true })
  checkEmailExist(
    @Arg('email') email: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.checkEmailExist(context.user, email);
  }
}
