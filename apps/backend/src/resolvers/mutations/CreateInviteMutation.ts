import {
  InputType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Arg,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { InviteCode } from '../types/Invite';

@InputType()
export class ClaimsInput {
  @Field(() => [Int!], { nullable: true })
  roleIds?: number[];

  @Field(() => Int, { nullable: true })
  coProposerProposalId?: number;
}

@InputType()
export class CreateInviteInput {
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => ClaimsInput)
  claims: ClaimsInput;
}

@Resolver()
export class CreateInvite {
  @Mutation(() => InviteCode)
  createInvite(
    @Arg('input') input: CreateInviteInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.create(context.user, input);
  }
}
