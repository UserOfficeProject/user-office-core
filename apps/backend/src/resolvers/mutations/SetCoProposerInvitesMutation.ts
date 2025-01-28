import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';
import { InputType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Invite } from '../types/Invite';

@InputType()
class SetCoProposerInvitesInput {
  @Field(() => Int)
  proposalPk: number;

  @Field(() => [String])
  emails: string[];
}

@Resolver()
export class SetCoProposerInvites {
  @Mutation(() => [Invite])
  setCoProposerInvites(
    @Arg('input') input: SetCoProposerInvitesInput,
    @Ctx() context: ResolverContext
  ): Promise<Invite[]> {
    const { proposalPk, emails } = input;

    return context.mutations.invite.setCoProposerInvites(
      context.user,
      proposalPk,
      emails
    );
  }
}
