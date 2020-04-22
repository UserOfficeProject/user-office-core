import {
  Arg,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';
import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class DeleteQuestionRelArgs {
  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  questionId: number;
}

@Resolver()
export class DeleteQuestionRelMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteQuestionRel(
    @Arg('args', () => DeleteQuestionRelArgs) args: DeleteQuestionRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalAdmin.deleteQuestionRel(context.user, args),
      ProposalTemplateResponseWrap
    );
  }
}
