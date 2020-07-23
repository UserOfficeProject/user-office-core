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
import { QuestionariesResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AddQuestionariesToAnswerArgs {
  @Field(() => Int!)
  answerId: number;

  @Field(() => [Int!]!)
  questionaryIds: number[];
}

@Resolver()
export class AddQuestionariesToAnswerMutation {
  @Mutation(() => QuestionariesResponseWrap)
  addQuestionariesToAnswer(
    @Args() args: AddQuestionariesToAnswerArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.questionary.addQuestionariesToAnswer(
        context.user,
        args
      ),
      QuestionariesResponseWrap
    );
  }
}
