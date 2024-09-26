import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { QuestionFilterCompareOperator } from '../../models/Questionary';
import { ReviewerFilter } from '../../models/Review';
import { DataType } from '../../models/Template';
import { Proposal } from '../types/Proposal';

@InputType()
export class QuestionFilterInput {
  @Field(() => String)
  public questionId: string;

  @Field(() => String)
  public value: string;

  @Field(() => QuestionFilterCompareOperator)
  public compareOperator: QuestionFilterCompareOperator;

  @Field(() => DataType)
  public dataType: DataType;
}

@InputType()
export class InstrumentFilterInput {
  @Field(() => Int, { nullable: true })
  public instrumentId: number;

  @Field(() => Boolean)
  public showMultiInstrumentProposals: boolean;

  @Field(() => Boolean)
  public showAllProposals: boolean;
}

@InputType()
export class ProposalsFilter {
  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => [Int], { nullable: true })
  public questionaryIds?: number[];

  @Field(() => ReviewerFilter, { nullable: true })
  public reviewer?: ReviewerFilter;

  @Field(() => Int, { nullable: true })
  public callId?: number;

  @Field(() => Int, { nullable: true })
  public instrumentId?: number;

  @Field(() => InstrumentFilterInput, { nullable: true })
  public instrumentFilter?: InstrumentFilterInput;

  @Field(() => Int, { nullable: true })
  public proposalStatusId?: number;

  @Field(() => [Int], { nullable: true })
  public excludeProposalStatusIds?: number[];

  @Field(() => [String], { nullable: true })
  public shortCodes?: string[];

  @Field(() => QuestionFilterInput, { nullable: true })
  public questionFilter?: QuestionFilterInput;

  @Field(() => [String], { nullable: true })
  public referenceNumbers?: string[];

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];
}

@ArgsType()
class ProposalsArgs {
  @Field(() => ProposalsFilter, { nullable: true })
  public filter?: ProposalsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;
}

@ObjectType()
class ProposalsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Proposal])
  public proposals: Proposal[];
}

@Resolver()
export class ProposalsQuery {
  @Query(() => ProposalsQueryResult, { nullable: true })
  async proposals(
    @Args() args: ProposalsArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalsQueryResult | null> {
    return context.queries.proposal.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
