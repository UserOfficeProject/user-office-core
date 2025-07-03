import {
  Args,
  Ctx,
  Field,
  Query,
  Resolver,
  ArgsType,
  Int,
  InputType,
  ObjectType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentStatus } from '../../models/Experiment';
import { Experiment } from '../types/Experiment';

@InputType()
class TimeSpan {
  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;
}

@InputType()
export class ExperimentsFilter {
  @Field({ nullable: true })
  experimentStartDate?: Date;

  @Field({ nullable: true })
  experimentEndDate?: Date;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;

  @Field(() => TimeSpan, { nullable: true })
  overlaps?: TimeSpan;

  @Field(() => Int, { nullable: true })
  public experimentSafetyStatusId?: number;
}

@ArgsType()
export class ExperimentsArgs {
  @Field(() => ExperimentsFilter, { nullable: true })
  filter?: ExperimentsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;

  @Field({ nullable: true })
  public sortField?: string;

  @Field({ nullable: true })
  public sortDirection?: string;

  @Field({ nullable: true })
  public searchText?: string;
}

@InputType()
export class UserExperimentsFilter {
  @Field({ nullable: true })
  endsAfter?: Date;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;

  @Field(() => [ExperimentStatus], { nullable: true })
  status?: ExperimentStatus[] | null;
}

@ArgsType()
export class UserExperimentsArgs {
  @Field(() => UserExperimentsFilter, { nullable: true })
  filter?: UserExperimentsFilter;
}

@ObjectType()
class ExperimentsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Experiment])
  public experiments: Experiment[];
}

@Resolver()
export class ExperimentsQuery {
  @Query(() => ExperimentsQueryResult, { nullable: true })
  async allExperiments(
    @Args() args: ExperimentsArgs,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentsQueryResult> {
    return context.queries.experiment.getAllExperiments(
      context.user,
      args.filter,
      args.first,
      args.offset,
      args.sortField,
      args.sortDirection,
      args.searchText
    );
  }
}
