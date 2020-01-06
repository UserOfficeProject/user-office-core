import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class OrcIDInformation {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  orcid: string;

  @Field()
  orcidHash: string;

  @Field()
  refreshToken: string;

  @Field(() => String, { nullable: true })
  token?: string;
}
