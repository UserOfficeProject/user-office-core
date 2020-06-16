import { Field, ObjectType } from 'type-graphql';

import { Response } from '../Decorators';
import { Page } from './Admin';
import { BasicUserDetails } from './BasicUserDetails';
import { Call } from './Call';
import { Institution } from './Institution';
import { Proposal } from './Proposal';
import { ProposalTemplate } from './ProposalTemplate';
import { Question } from './Question';
import { QuestionRel } from './QuestionRel';
import { Review } from './Review';
import { SEP } from './SEP';
import { TechnicalReview } from './TechnicalReview';
import { Topic } from './Topic';
import { User } from './User';

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
export class SEPResponseWrap extends ResponseWrapBase<SEP> {
  @Response()
  @Field(() => SEP, { nullable: true })
  public sep: SEP;
}

@ObjectType()
export class SEPMembersRoleResponseWrap extends ResponseWrapBase<boolean> {
  @Response()
  @Field(() => Boolean, { nullable: true })
  public success = false;
}

@ObjectType()
export class TechnicalReviewResponseWrap extends ResponseWrapBase<
  TechnicalReview
> {
  @Response()
  @Field(() => TechnicalReview, { nullable: true })
  public technicalReview: TechnicalReview;
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
export class QuestionRelResponseWrap extends ResponseWrapBase<QuestionRel> {
  @Response()
  @Field(() => QuestionRel, { nullable: true })
  public questionRel: QuestionRel;
}

@ObjectType()
export class QuestionResponseWrap extends ResponseWrapBase<QuestionRel> {
  @Response()
  @Field(() => Question, { nullable: true })
  public question: Question;
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

@ObjectType()
export class InstitutionResponseWrap extends ResponseWrapBase<Topic> {
  @Response()
  @Field(() => Institution, { nullable: true })
  public institution: Institution;
}

@ObjectType()
export class SuccessResponseWrap extends ResponseWrapBase<string> {
  @Response()
  @Field(() => Boolean, { nullable: true })
  public isSuccess: boolean;
}

@ObjectType()
export class TokenResponseWrap extends ResponseWrapBase<string> {
  @Response()
  @Field(() => String, { nullable: true })
  public token: string;
}

@ObjectType()
export class PrepareDBResponseWrap extends ResponseWrapBase<string> {
  @Response()
  @Field(() => String)
  public log: string;
}
