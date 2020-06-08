import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateProposalTemplateArgs {
  @Field(() => Int)
  public templateId: number;

  @Field({ nullable: true })
  public name: string;

  @Field({ nullable: true })
  public description: string;

  @Field({ nullable: true })
  public isArchived: boolean;
}

@Resolver()
export class UpdateProposalTemplateMutation {
  @Mutation(() => TemplateResponseWrap)
  updateProposalTemplate(
    @Args() args: UpdateProposalTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateProposalTemplate(context.user, args),
      TemplateResponseWrap
    );
  }
}
