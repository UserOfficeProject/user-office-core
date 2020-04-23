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
import { TemplateStepArrayResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateTopicArgs {
  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  sortOrder: number;
}

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => TemplateStepArrayResponseWrap)
  createTopic(@Args() args: CreateTopicArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.template.createTopic(context.user, args),
      TemplateStepArrayResponseWrap
    );
  }
}
