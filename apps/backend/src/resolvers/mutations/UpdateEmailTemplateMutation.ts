import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplate } from '../types/EmailTemplate';

@InputType()
export class UpdateEmailTemplateInput {
  @Field(() => Int)
  public id: number;

  @Field()
  public name: string;

  @Field({ nullable: true })
  public description: string;

  @Field()
  public subject: string;

  @Field()
  public body: string;
}

@Resolver()
export class UpdateEmailTemplateMutation {
  @Mutation(() => EmailTemplate)
  updateEmailTemplate(
    @Arg('updateEmailTemplateInput')
    updateEmailTemplateInput: UpdateEmailTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.emailTemplate.update(
      context.user,
      updateEmailTemplateInput
    );
  }
}
