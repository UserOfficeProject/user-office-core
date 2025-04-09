import {
  Args,
  Ctx,
  Field,
  Query,
  Resolver,
  ArgsType,
  Int,
  InputType,
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
  endsBefore?: Date;

  @Field({ nullable: true })
  endsAfter?: Date;

  @Field({ nullable: true })
  startsBefore?: Date;

  @Field({ nullable: true })
  startsAfter?: Date;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;

  @Field(() => TimeSpan, { nullable: true })
  overlaps?: TimeSpan;

  @Field(() => [ExperimentStatus], { nullable: true })
  status?: ExperimentStatus[] | null;
}

@ArgsType()
export class ExperimentsArgs {
  @Field(() => ExperimentsFilter, { nullable: true })
  filter?: ExperimentsFilter;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
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

@Resolver()
export class ExperimentsQuery {
  @Query(() => [Experiment])
  async experiments(
    @Args() args: ExperimentsArgs,
    @Ctx() context: ResolverContext
  ): Promise<Experiment[]> {
    return context.queries.experiment.getExperiments(context.user, args);
  }
}
