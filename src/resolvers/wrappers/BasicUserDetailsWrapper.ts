import { Field, ObjectType } from "type-graphql";
import { BasicUserDetails } from "../../models/User";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
export class BasicUserDetailsResponseWrap extends AbstractResponseWrap<
  BasicUserDetails
> {
  @Field({ nullable: true })
  public user: BasicUserDetails;

  setValue(value: BasicUserDetails): void {
    this.user = value;
  }
}

export const wrapBasicUserDetails = wrapResponse<BasicUserDetails>(
  new BasicUserDetailsResponseWrap()
);
