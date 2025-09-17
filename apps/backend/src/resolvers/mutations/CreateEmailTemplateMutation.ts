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
export class CreateEmailTemplateInput {
  @Field(() => Int)
  public createdByUserId: number;

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
export class CreateEmailTemplateMutation {
  @Mutation(() => EmailTemplate)
  createEmailTemplate(
    @Arg('createEmailTemplateInput')
    createEmailTemplateInput: CreateEmailTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.emailTemplate.create(
      context.user,
      createEmailTemplateInput
    );
  }
}
