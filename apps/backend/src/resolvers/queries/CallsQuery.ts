import {
  Ctx,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
  Arg,
  ArgsType,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { PaginationSortDirection } from '../../utils/pagination';
import { Call } from '../types/Call';

@InputType()
export class CallsFilter {
  @Field(() => String, { nullable: true })
  public shortCode?: string;

  @Field(() => String, { nullable: true })
  public proposalStatusShortCode?: string;

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public proposalPdfTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public experimentSafetyPdfTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public esiTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public fapReviewTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public technicalReviewTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public fapIds?: number[];

  @Field(() => [Int], { nullable: true })
  public instrumentIds?: number[];

  @Field(() => Boolean, { nullable: true })
  public isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isActiveInternal?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isEnded?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isEndedInternal?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isReviewEnded?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isFapReviewEnded?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isCallEndedByEvent?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isCallUpcoming?: boolean;
}

@ArgsType()
export class CallsArgs {
  @Field(() => CallsFilter, { nullable: true })
  filter?: CallsFilter;

  @Field({ nullable: true })
  public sortField?: string;

  @Field(() => PaginationSortDirection, { nullable: true })
  public sortDirection?: PaginationSortDirection;
}

@Resolver()
export class CallsQuery {
  @Query(() => [Call], { nullable: true })
  calls(@Ctx() context: ResolverContext, @Args() args: CallsArgs) {
    return context.queries.call.getAll(
      context.user,
      args.filter,
      args.sortField,
      args.sortDirection
    );
  }

  @Query(() => [Call], { nullable: true })
  callsByInstrumentScientist(
    @Ctx() context: ResolverContext,
    @Arg('scientistId', () => Int) scientistId: number
  ) {
    return context.queries.call.getCallsByInstrumentScientist(
      context.user,
      scientistId
    );
  }
}
