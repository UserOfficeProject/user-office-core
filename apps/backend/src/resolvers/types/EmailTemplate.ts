import { Field, Int, ObjectType } from 'type-graphql';

import { EmailTemplate as EmailTemplateOrigin } from '../../models/EmailTemplate';

@ObjectType()
export class EmailTemplate implements EmailTemplateOrigin {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public createdByUserId: number;

  @Field(() => String)
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field(() => Boolean)
  public useTemplateFile: boolean;

  @Field(() => String, { nullable: true })
  public subject: string;

  @Field(() => String, { nullable: true })
  public body: string;
}
