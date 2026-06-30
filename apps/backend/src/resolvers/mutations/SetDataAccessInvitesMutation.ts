import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';
import { InputType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

@InputType()
export class SetDataAccessInvitesInput {
  @Field(() => Int)
  proposalPk: number;

  @Field(() => [String])
  emails: string[];
}

@Resolver()
export class SetDataAccessInvites {
  @Mutation(() => [Invite])
  setDataAccessInvites(
    @Arg('input') input: SetDataAccessInvitesInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.setDataAccessInvites(context.user, input);
  }
}
