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
import { GenericTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateGenericTemplateArgs {
  @Field(() => Int)
  genericTemplateId: number;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  safetyComment?: string;

  // do not expose this fields to a user
  proposalPk?: number;
  questionaryId?: number;
  shipmentId?: number | null;
}

@Resolver()
export class UpdateGenericTemplateMutation {
  @Mutation(() => GenericTemplateResponseWrap)
  updateGenericTemplate(
    @Args() args: UpdateGenericTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.genericTemplate.updateGenericTemplate(
        context.user,
        args
      ),
      GenericTemplateResponseWrap
    );
  }
}
