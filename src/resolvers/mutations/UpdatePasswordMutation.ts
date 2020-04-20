import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetailsResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
class UpdatePasswordArguments {
  @Field(() => Int)
  public id: number;

  @Field()
  public password: string;
}
@Resolver()
export class UpdatePasswordMutations {
  @Mutation(() => BasicUserDetailsResponseWrap)
  updatePassword(
    @Args() { id, password }: UpdatePasswordArguments,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.updatePassword(context.user, { id, password }),
      BasicUserDetailsResponseWrap
    );
  }
}
