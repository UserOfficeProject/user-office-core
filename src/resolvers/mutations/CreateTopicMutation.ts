import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Resolver,
  ArgsType,
  Field,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
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
  @Mutation(() => ProposalTemplateResponseWrap)
  createTopic(
    @Arg('args', () => CreateTopicArgs) args: CreateTopicArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalAdmin.createTopic(context.user, args),
      ProposalTemplateResponseWrap
    );
  }
}
