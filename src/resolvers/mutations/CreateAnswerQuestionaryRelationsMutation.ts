import {
  Args,
  Ctx,
  Mutation,
  Resolver,
  ArgsType,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { wrapResponse } from '../wrapResponse';
import {
  SamplesResponseWrap,
  AnswerResponseWrap,
  AnswerBasicResponseWrap,
} from '../types/CommonWrappers';

@ArgsType()
export class CreateAnswerQuestionaryRelationsArgs {
  @Field(() => Int!)
  answerId: number;

  @Field(() => [Int!]!)
  questionaryIds: number[];
}

@Resolver()
export class CreateAnswerQuestionaryRelations {
  @Mutation(() => AnswerBasicResponseWrap)
  createAnswerQuestionaryRelations(
    @Args() args: CreateAnswerQuestionaryRelationsArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.questionary.createAnswerQuestionaryRelation(
        context.user,
        args
      ),
      AnswerBasicResponseWrap
    );
  }
}
