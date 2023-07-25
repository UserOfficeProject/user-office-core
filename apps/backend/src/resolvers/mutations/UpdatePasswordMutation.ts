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
import { BasicUserDetails } from '../types/BasicUserDetails';

@ArgsType()
class UpdatePasswordArguments {
  @Field(() => Int)
  public id: number;

  @Field()
  public password: string;
}
@Resolver()
export class UpdatePasswordMutations {
  @Mutation(() => BasicUserDetails)
  updatePassword(
    @Args() { id, password }: UpdatePasswordArguments,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.updatePassword(context.user, {
      id,
      password,
    });
  }
}
