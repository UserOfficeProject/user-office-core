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
export class CreateFapArgs {
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
export class CreateFapMutation {
  @Mutation(() => Fap)
  async createFap(
    @Args() args: CreateFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.create(context.user, args);
  }
}
