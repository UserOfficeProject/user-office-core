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
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateTopicArgs {
  @Field(() => Int)
  templateId: number;

  @Field(() => Int, { nullable: true })
  sortOrder: number;

  @Field(() => Int, { nullable: true })
  title?: string;
}

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => TemplateResponseWrap)
  createTopic(@Args() args: CreateTopicArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.template.createTopic(context.user, args),
      TemplateResponseWrap
    );
  }
}
