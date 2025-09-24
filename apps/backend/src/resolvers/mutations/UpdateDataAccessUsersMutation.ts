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
import { UpdateDataAccessUsersArgs as UpdateDataAccessUsersArgsType } from '../../mutations/DataAccessUsersMutations';
import { BasicUserDetails } from '../types/BasicUserDetails';

@ArgsType()
export class UpdateDataAccessUsersArgs
  implements UpdateDataAccessUsersArgsType
{
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => [Int])
  public userIds: number[];
}

@Resolver()
export class UpdateDataAccessUsersMutation {
  @Mutation(() => [BasicUserDetails])
  updateDataAccessUsers(
    @Args() updateDataAccessUsersArgs: UpdateDataAccessUsersArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.dataAccessUsers.updateDataAccessUsers(
      context.user,
      updateDataAccessUsersArgs
    );
  }
}
