import { Field, ObjectType } from 'type-graphql';

import { Response } from '../Decorators';
import { Page } from './Admin';
import { Answer } from './Answer';
import { AnswerBasic } from './AnswerBasic';
import { BasicUserDetails } from './BasicUserDetails';
import { Call } from './Call';
import { ExperimentSafetyInput } from './ExperimentSafetyInput';
import { Feature } from './Feature';
import { Feedback } from './Feedback';
import { FeedbackRequest } from './FeedbackRequest';
import { GenericTemplate } from './GenericTemplate';
import { Institution } from './Institution';
import { Instrument } from './Instrument';
import { PermissionsWithAccessToken } from './PermissionsWithAccessToken';
import { Proposal } from './Proposal';
import { NextProposalStatus, ProposalStatus } from './ProposalStatus';
import { ProposalWorkflow } from './ProposalWorkflow';
import { ProposalWorkflowConnection } from './ProposalWorkflowConnection';
import { Question } from './Question';
import { Questionary } from './Questionary';
import { QuestionaryStep } from './QuestionaryStep';
import { QuestionTemplateRelation } from './QuestionTemplateRelation';
import { Rejection } from './Rejection';
import { ReviewWithNextProposalStatus } from './Review';
import { Review } from './Review';
import { Sample } from './Sample';
import { SampleExperimentSafetyInput } from './SampleExperimentSafetyInput';
import { ScheduledEventCore } from './ScheduledEvent';
import { SEP } from './SEP';
import { SepMeetingDecision } from './SepMeetingDecision';
import { SEPProposal } from './SEPProposal';
import { Shipment } from './Shipment';
import { StatusChangingEvent } from './StatusChangingEvent';
import { TechnicalReview } from './TechnicalReview';
import { Template } from './Template';
import { TemplateValidation } from './TemplateValidation';
import { Topic } from './Topic';
import { Unit } from './Unit';
import { UnitsImportWithValidation } from './UnitsImportWithValidation';
import { User } from './User';
import { Visit } from './Visit';
import { VisitRegistration } from './VisitRegistration';

@ObjectType()
export class ResponseWrapBase {
  @Field(() => Rejection, { nullable: true })
  public rejection: Rejection;
}

@ObjectType()
export class BasicUserDetailsResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => BasicUserDetails, { nullable: true })
  public user: BasicUserDetails;
}

@ObjectType()
export class UserResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => User, { nullable: true })
  public user: User;
}

@ObjectType()
export class ReviewResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Review, { nullable: true })
  public review: Review;
}

@ObjectType()
export class ReviewWithNextStatusResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ReviewWithNextProposalStatus, { nullable: true })
  public review: ReviewWithNextProposalStatus;
}

@ObjectType()
export class SEPResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => SEP, { nullable: true })
  public sep: SEP;
}

@ObjectType()
export class NextProposalStatusResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => NextProposalStatus, { nullable: true })
  public nextProposalStatus: NextProposalStatus;
}

@ObjectType()
export class SepMeetingDecisionResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => SepMeetingDecision, { nullable: true })
  public sepMeetingDecision: SepMeetingDecision;
}

@ObjectType()
export class InstrumentResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Instrument, { nullable: true })
  public instrument: Instrument;
}

@ObjectType()
export class SEPMembersRoleResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Boolean, { nullable: true })
  public success = false;
}

@ObjectType()
export class TechnicalReviewResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => TechnicalReview, { nullable: true })
  public technicalReview: TechnicalReview;
}
@ObjectType()
export class TechnicalReviewsResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [TechnicalReview], { nullable: true })
  public technicalReviews: TechnicalReview[];
}

@ObjectType()
export class TemplateResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Template, { nullable: true })
  public template: Template;
}

@ObjectType()
export class QuestionaryResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Questionary, { nullable: true })
  public questionary: Questionary;
}

@ObjectType()
export class SamplesResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [Sample], { nullable: true })
  public samples: Sample[];
}

@ObjectType()
export class QuestionaryStepResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => QuestionaryStep, { nullable: true })
  public questionaryStep: QuestionaryStep;
}

@ObjectType()
export class CallResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Call, { nullable: true })
  public call: Call;
}

@ObjectType()
export class ProposalResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Proposal, { nullable: true })
  public proposal: Proposal;
}

@ObjectType()
export class QuestionTemplateRelationResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => QuestionTemplateRelation, { nullable: true })
  public questionTemplateRelation: QuestionTemplateRelation;
}

@ObjectType()
export class QuestionResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Question, { nullable: true })
  public question: Question;
}

@ObjectType()
export class PageResponseWrap extends ResponseWrapBase {
  @Response()
  @Field({ nullable: true })
  public page: Page;
}

@ObjectType()
export class TopicResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Topic, { nullable: true })
  public topic: Topic;
}

@ObjectType()
export class InstitutionResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Institution, { nullable: true })
  public institution: Institution;
}

@ObjectType()
export class UnitResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Unit, { nullable: true })
  public unit: Unit;
}

@ObjectType()
export class UnitsResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [Unit], { nullable: true })
  public units: Unit[];
}

@ObjectType()
export class SuccessResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Boolean, { nullable: true })
  public isSuccess: boolean;
}

@ObjectType()
export class TokenResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => String, { nullable: true })
  public token: string;
}

@ObjectType()
export class ExternalTokenLoginWrap extends ResponseWrapBase {
  @Response()
  @Field(() => String, { nullable: true })
  public token: string;
}

@ObjectType()
export class LogoutTokenWrap extends ResponseWrapBase {
  @Response()
  @Field(() => String, { nullable: true })
  public token: string;
}

@ObjectType()
export class PrepareDBResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => String, { nullable: true })
  public log: string;
}

@ObjectType()
export class AnswerResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Answer, { nullable: true })
  public answer: Answer;
}

@ObjectType()
export class AnswerBasicResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => AnswerBasic, { nullable: true })
  public answer: AnswerBasic;
}

@ObjectType()
export class SampleResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Sample, { nullable: true })
  public sample: Sample;
}

@ObjectType()
export class ProposalStatusResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ProposalStatus, { nullable: true })
  public proposalStatus: ProposalStatus;
}

@ObjectType()
export class FeaturesResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [Feature], { nullable: true })
  public features: Feature[];
}

@ObjectType()
export class ProposalWorkflowResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ProposalWorkflow, { nullable: true })
  public proposalWorkflow: ProposalWorkflow;
}

@ObjectType()
export class ProposalWorkflowConnectionResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ProposalWorkflowConnection, { nullable: true })
  public proposalWorkflowConnection: ProposalWorkflowConnection;
}

@ObjectType()
export class ProposalStatusChangingEventResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [StatusChangingEvent], { nullable: true })
  public statusChangingEvents: StatusChangingEvent[];
}

@ObjectType()
export class ShipmentResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Shipment, { nullable: true })
  public shipment: Shipment;
}

@ObjectType()
export class SEPProposalResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => SEPProposal, { nullable: true })
  public sepProposal: SEPProposal;
}

@ObjectType()
export class ApiAccessTokenResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => PermissionsWithAccessToken, { nullable: true })
  public apiAccessToken: PermissionsWithAccessToken;
}

@ObjectType()
export class ProposalsResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [Proposal], { nullable: true })
  public proposals: Proposal[];
}

@ObjectType()
export class VisitResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Visit, { nullable: true })
  public visit: Visit;
}

@ObjectType()
export class VisitRegistrationResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => VisitRegistration, { nullable: true })
  public registration: VisitRegistration;
}

@ObjectType()
export class EsiResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ExperimentSafetyInput, { nullable: true })
  public esi: ExperimentSafetyInput;
}

@ObjectType()
export class SampleEsiResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => SampleExperimentSafetyInput, { nullable: true })
  public esi?: SampleExperimentSafetyInput;
}

@ObjectType()
export class GenericTemplateResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => GenericTemplate, { nullable: true })
  public genericTemplate: GenericTemplate;
}

@ObjectType()
export class FeedbackResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Feedback, { nullable: true })
  public feedback: Feedback;
}

@ObjectType()
export class TemplateValidationWrap extends ResponseWrapBase {
  @Response()
  @Field(() => TemplateValidation, { nullable: true })
  public validationResult: TemplateValidation;
}

@ObjectType()
export class FeedbackRequestWrap extends ResponseWrapBase {
  @Response()
  @Field(() => FeedbackRequest, { nullable: true })
  public request: FeedbackRequest;
}

@ObjectType()
export class ScheduledEventResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => ScheduledEventCore, { nullable: true })
  public scheduledEvent: ScheduledEventCore;
}

@ObjectType()
export class UnitsImportWithValidationWrap extends ResponseWrapBase {
  @Response()
  @Field(() => UnitsImportWithValidation, { nullable: true })
  public validationResult: UnitsImportWithValidation;
}
