import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class OrcIDInformation {
  @Field()
  firstname: String;

  @Field()
  lastname: String;

  @Field()
  orcid: String;

  @Field()
  orcidHash: String;

  @Field()
  refreshToken: String;
}
