import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Query,
  Resolver,
  Int,
} from 'type-graphql';
import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';
import { SampleStatus } from '../../models/Sample';

@InputType()
class SamplesFilter {
  @Field(() => String, { nullable: true })
  public title?: string;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;

  @Field(() => Int, { nullable: true })
  public questionaryId?: number;

  @Field(() => [Int], { nullable: true })
  public sampleIds?: [number];

  @Field(() => SampleStatus, { nullable: true })
  public status?: SampleStatus;
}

@ArgsType()
export class SamplesArgs {
  @Field(() => SamplesFilter, { nullable: true })
  public filter?: SamplesFilter;
}
@Resolver()
export class SamplesQuery {
  @Query(() => [Sample], { nullable: true })
  async samples(@Ctx() context: ResolverContext, @Args() args: SamplesArgs) {
    const response = await context.queries.sample.getSamples(
      context.user,
      args
    );
    return response;
  }
}
