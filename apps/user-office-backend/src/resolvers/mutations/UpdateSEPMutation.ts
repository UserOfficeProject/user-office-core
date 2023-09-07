import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';

@ArgsType()
export class UpdateSEPArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Int, { defaultValue: 2 })
  public numberRatingsRequired: number;

  @Field(() => String, { nullable: true })
  public gradeGuide: string;

  @Field(() => Boolean, { nullable: true })
  public customGradeGuide: boolean | null;

  @Field(() => Boolean)
  public active: boolean;
}

@Resolver()
export class UpdateSEPMutation {
  @Mutation(() => SEP)
  async updateSEP(
    @Args() args: UpdateSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.update(context.user, args);
  }
}
