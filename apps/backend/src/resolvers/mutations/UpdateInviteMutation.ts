import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { InviteCode } from '../types/Invite';
import { ClaimsInput } from './CreateInviteMutation';

@InputType()
export class UpdateInviteInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  note: string;

  @Field(() => ClaimsInput)
  claims: ClaimsInput;
}

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
