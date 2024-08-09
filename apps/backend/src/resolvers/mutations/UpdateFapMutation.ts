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
import { Fap } from '../types/Fap';

@ArgsType()
export class UpdateFapArgs {
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

  @Field(() => String, { nullable: true })
  public files: string | null;
}

@Resolver()
export class UpdateFapMutation {
  @Mutation(() => Fap)
  async updateFap(
    @Args() args: UpdateFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.update(context.user, args);
  }
}
