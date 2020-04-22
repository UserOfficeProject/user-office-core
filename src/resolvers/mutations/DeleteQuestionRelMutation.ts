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
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class DeleteQuestionRelArgs {
  @Field(() => String)
  questionId: string;

  @Field(() => Int)
  templateId: number;
}

@Resolver()
export class DeleteQuestionRelMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteQuestionRel(
    @Args() args: DeleteQuestionRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalAdmin.deleteQuestionRel(context.user, args),
      ProposalTemplateResponseWrap
    );
  }
}
