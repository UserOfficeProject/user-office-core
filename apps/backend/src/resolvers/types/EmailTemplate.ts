import { Field, Int, ObjectType } from 'type-graphql';

import { EmailTemplate as EmailTemplateOrigin } from '../../models/EmailTemplate';

@ObjectType()
export class EmailTemplate implements Partial<EmailTemplateOrigin> {
  @Field(() => Int)
  public id: number;

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
