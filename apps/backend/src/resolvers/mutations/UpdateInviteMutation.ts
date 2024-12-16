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

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => ClaimsInput, { nullable: true })
  claims?: ClaimsInput;
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
