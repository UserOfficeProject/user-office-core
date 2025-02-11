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
import { Invite } from '../types/Invite';

@InputType()
export class ClaimsInput {
  @Field(() => [Int!], { nullable: true })
  roleIds?: number[];

  @Field(() => Int, { nullable: true })
  coProposerProposalPk?: number;
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
  @Mutation(() => Invite)
  createInvite(
    @Arg('input') input: CreateInviteInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.invite.create(context.user, input);
  }
}
