import { Field, ObjectType } from "type-graphql";
import { Call } from "../models/Call";
import { Proposal } from "../models/Proposal";
import {
  ProposalTemplate,
  ProposalTemplateField,
  Topic
} from "../models/ProposalModel";
import { Review } from "../models/Review";
import { BasicUserDetails } from "../models/User";
import { Response } from "./Decorators";
import { Page } from "../models/Admin";
import { User } from "./types/User";

@ObjectType()
export class ResponseWrapBase<T> {
  @Field(() => String, { nullable: true })
  public error: string;
}

@ObjectType()
export class BasicUserDetailsResponseWrap extends ResponseWrapBase<
  BasicUserDetails
> {
  @Response()
  @Field(() => BasicUserDetails, { nullable: true })
  public user: BasicUserDetails;
}

@ObjectType()
export class UserResponseWrap extends ResponseWrapBase<User> {
  @Response()
  @Field(() => User, { nullable: true })
  public user: User;
}

@ObjectType()
export class ReviewResponseWrap extends ResponseWrapBase<Review> {
  @Response()
  @Field(() => Review, { nullable: true })
  public review: Review;
}

@ObjectType()
export class ProposalTemplateResponseWrap extends ResponseWrapBase<
  ProposalTemplate
> {
  @Response()
  @Field(() => ProposalTemplate, { nullable: true })
  public template: ProposalTemplate;
}

@ObjectType()
export class CallResponseWrap extends ResponseWrapBase<Call> {
  @Response()
  @Field(() => Call, { nullable: true })
  public call: Call;
}

@ObjectType()
export class ProposalResponseWrap extends ResponseWrapBase<Proposal> {
  @Response()
  @Field(() => Proposal, { nullable: true })
  public proposal: Proposal;
}

@ObjectType()
export class TemplateFieldResponseWrap extends ResponseWrapBase<
  ProposalTemplateField
> {
  @Response()
  @Field({ nullable: true })
  public field: ProposalTemplateField;
}

@ObjectType()
export class PageResponseWrap extends ResponseWrapBase<Page> {
  @Response()
  @Field({ nullable: true })
  public page: Page;
}

@ObjectType()
export class TopicResponseWrap extends ResponseWrapBase<Topic> {
  @Response()
  @Field(() => Topic, { nullable: true })
  public topic: Topic;
}
