import { Arg, Ctx, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { InviteCode } from '../types/Invite';
import { CreateInviteInput } from './CreateInviteMutation';

@InputType()
export class UpdateInviteInput extends CreateInviteInput {}

@Resolver()
export class UpdateInvite {
  @Mutation(() => InviteCode)
  updateInvite(
    @Arg('input') input: UpdateInviteInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.update(context.user, input);
  }
}
