import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class TemplateVersion {
  @Field(() => Int)
  public templateVersionId: number;

  @Field(() => Int)
  public templateId: number;

  @Field(() => String, { nullable: true })
  public body: string;

  @Field(() => String, { nullable: true })
  public subject: string;

  @Field(() => Int)
  public versionNumber: number;

  @Field(() => String)
  public templateType: string;
}
