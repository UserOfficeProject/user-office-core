import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Questionary } from '../types/Questionary';

@ArgsType()
export class CreateQuestionaryArgs {
  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class CreateQuestionaryMutation {
  @Mutation(() => Questionary)
  createQuestionary(
    @Args() args: CreateQuestionaryArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.questionary.create(context.user, args);
  }
}
