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
import {
  AnswerResponseWrap,
  BasicUserDetailsResponseWrap,
} from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { AnswerInput } from './AnswerTopicMutation';

@ArgsType()
export class UpdateAnswerArgs {
  @Field(() => Int)
  public questionaryId: number;

  @Field()
  public answer: AnswerInput;
}
@Resolver()
export class UpdateAnswerMutation {
  @Mutation(() => AnswerResponseWrap)
  updateAnswer(
    @Args() args: UpdateAnswerArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.questionary.updateAnswer(context.user, args),
      BasicUserDetailsResponseWrap
    );
  }
}
