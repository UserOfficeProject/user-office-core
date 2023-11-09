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
export class ImportProposalArgs {
  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => String, { nullable: true })
  public abstract?: string;

  @Field(() => [Int], { nullable: true })
  public users?: number[];

  @Field(() => Int, { nullable: true })
  public proposerId?: number;

  @Field(() => Int)
  public submitterId: number;

  @Field(() => Int)
  public referenceNumber: string;

  @Field(() => Int)
  public callId: number;
}

@Resolver()
export class ImportProposalMutation {
  @Mutation(() => Proposal)
  importProposal(
    @Args()
    args: ImportProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.import(context.user, args);
  }
}
