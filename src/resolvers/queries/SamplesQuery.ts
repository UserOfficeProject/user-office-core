import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Query,
  Resolver,
} from 'type-graphql';
import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';

@InputType()
class SamplesFilter {
  @Field({ nullable: true })
  public questionId?: string;
}

@ArgsType()
export class SamplesArgs {
  @Field(() => SamplesFilter, { nullable: true })
  public filter?: SamplesFilter;
}
@Resolver()
export class SamplesQuery {
  @Query(() => [Sample], { nullable: true })
  samples(@Ctx() context: ResolverContext, @Args() args: SamplesArgs) {
    return context.queries.sample.getSamples(context.user, args);
  }
}
