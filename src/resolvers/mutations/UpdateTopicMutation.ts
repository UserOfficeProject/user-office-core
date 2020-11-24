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
export class UpdateTopicArgs {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  templateId: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => Int, { nullable: true })
  sortOrder: number;

  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;
}

@Resolver()
export class UpdateTopicMutation {
  @Mutation(() => TemplateResponseWrap)
  updateTopic(@Args() args: UpdateTopicArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.template.updateTopic(context.user, args),
      TemplateResponseWrap
    );
  }
}
