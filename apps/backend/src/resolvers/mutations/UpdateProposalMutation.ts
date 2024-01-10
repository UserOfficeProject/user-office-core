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
import { Proposal } from '../types/Proposal';

@ArgsType()
export class UpdateProposalArgs {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => String, { nullable: true })
  public abstract?: string;

  @Field(() => [Int], { nullable: true })
  public users?: number[];

  @Field(() => Int, { nullable: true })
  public proposerId?: number;

  @Field(() => Date, { nullable: true })
  public created?: Date;
}

@Resolver()
export class UpdateProposalMutation {
  @Mutation(() => Proposal)
  updateProposal(
    @Args()
    args: UpdateProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.update(context.user, args);
  }
}
