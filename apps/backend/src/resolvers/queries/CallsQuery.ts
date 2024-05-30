import { Ctx, Field, InputType, Int, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call } from '../types/Call';

@InputType()
export class CallsFilter {
  @Field(() => String, { nullable: true })
  public shortCode?: string;

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public pdfTemplateIds?: number[];

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
}

@Resolver()
export class CallsQuery {
  @Query(() => [Call], { nullable: true })
  calls(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => CallsFilter, { nullable: true }) filter: CallsFilter
  ) {
    return context.queries.call.getAll(context.user, filter);
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
