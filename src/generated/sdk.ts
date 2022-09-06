import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
  IntStringDateBoolArray: any;
  _Any: any;
};

export type AddProposalWorkflowStatusInput = {
  droppableGroupId: Scalars['String'];
  nextProposalStatusId?: InputMaybe<Scalars['Int']>;
  parentDroppableGroupId?: InputMaybe<Scalars['String']>;
  prevProposalStatusId?: InputMaybe<Scalars['Int']>;
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
};

export type AddStatusChangingEventsToConnectionInput = {
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']>;
};

export type AddTechnicalReviewInput = {
  comment?: InputMaybe<Scalars['String']>;
  files?: InputMaybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  publicComment?: InputMaybe<Scalars['String']>;
  reviewerId?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<TechnicalReviewStatus>;
  submitted?: InputMaybe<Scalars['Boolean']>;
  timeAllocation?: InputMaybe<Scalars['Int']>;
};

export type AddUserRoleResponseWrap = {
  rejection: Maybe<Rejection>;
  success: Maybe<Scalars['Boolean']>;
};

export enum AllocationTimeUnits {
  DAY = 'Day',
  HOUR = 'Hour'
}

export type Answer = {
  answerId: Maybe<Scalars['Int']>;
  config: FieldConfig;
  dependencies: Array<FieldDependency>;
  dependenciesOperator: Maybe<DependenciesLogicOperator>;
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
  value: Maybe<Scalars['IntStringDateBoolArray']>;
};

export type AnswerBasic = {
  answer: Scalars['IntStringDateBoolArray'];
  answerId: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  questionId: Scalars['String'];
  questionaryId: Scalars['Int'];
};

export type AnswerInput = {
  questionId: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
};

export type ApiAccessTokenResponseWrap = {
  apiAccessToken: Maybe<PermissionsWithAccessToken>;
  rejection: Maybe<Rejection>;
};

export type AssignChairOrSecretaryToSepInput = {
  roleId: UserRole;
  sepId: Scalars['Int'];
  userId: Scalars['Int'];
};

export type AssignInstrumentsToCallInput = {
  callId: Scalars['Int'];
  instrumentIds: Array<Scalars['Int']>;
};

export type AuthJwtApiTokenPayload = {
  accessTokenId: Scalars['String'];
};

export type AuthJwtPayload = {
  currentRole: Role;
  roles: Array<Role>;
  user: User;
};

export type BasicUserDetails = {
  created: Maybe<Scalars['DateTime']>;
  email: Maybe<Scalars['String']>;
  firstname: Scalars['String'];
  id: Scalars['Int'];
  lastname: Scalars['String'];
  organisation: Scalars['String'];
  organizationId: Scalars['Int'];
  placeholder: Maybe<Scalars['Boolean']>;
  position: Scalars['String'];
  preferredname: Maybe<Scalars['String']>;
};

export type BasicUserDetailsResponseWrap = {
  rejection: Maybe<Rejection>;
  user: Maybe<BasicUserDetails>;
};

export type BooleanConfig = {
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type Call = {
  allocationTimeUnit: AllocationTimeUnits;
  cycleComment: Scalars['String'];
  description: Maybe<Scalars['String']>;
  endCall: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  endSEPReview: Maybe<Scalars['DateTime']>;
  esiTemplateId: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  instruments: Array<InstrumentWithAvailabilityTime>;
  isActive: Scalars['Boolean'];
  pdfTemplateId: Maybe<Scalars['Int']>;
  proposalCount: Scalars['Int'];
  proposalSequence: Maybe<Scalars['Int']>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  proposalWorkflowId: Maybe<Scalars['Int']>;
  referenceNumberFormat: Maybe<Scalars['String']>;
  seps: Maybe<Array<Sep>>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview: Maybe<Scalars['DateTime']>;
  submissionMessage: Maybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  template: Template;
  templateId: Scalars['Int'];
  title: Maybe<Scalars['String']>;
};

export type CallResponseWrap = {
  call: Maybe<Call>;
  rejection: Maybe<Rejection>;
};

export type CallsFilter = {
  isActive?: InputMaybe<Scalars['Boolean']>;
  isEnded?: InputMaybe<Scalars['Boolean']>;
  isReviewEnded?: InputMaybe<Scalars['Boolean']>;
  isSEPReviewEnded?: InputMaybe<Scalars['Boolean']>;
  sepIds?: InputMaybe<Array<Scalars['Int']>>;
  templateIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type ChangeProposalsStatusInput = {
  proposals: Array<ProposalPkWithCallId>;
  statusId: Scalars['Int'];
};

export type CloneProposalsInput = {
  callId: Scalars['Int'];
  proposalsToClonePk: Array<Scalars['Int']>;
};

export type ConflictResolution = {
  itemId: Scalars['String'];
  strategy: ConflictResolutionStrategy;
};

export enum ConflictResolutionStrategy {
  UNRESOLVED = 'UNRESOLVED',
  USE_EXISTING = 'USE_EXISTING',
  USE_NEW = 'USE_NEW'
}

export type CreateApiAccessTokenInput = {
  accessPermissions: Scalars['String'];
  name: Scalars['String'];
};

export type CreateCallInput = {
  allocationTimeUnit: AllocationTimeUnits;
  cycleComment: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  endCall: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  endSEPReview?: InputMaybe<Scalars['DateTime']>;
  esiTemplateId?: InputMaybe<Scalars['Int']>;
  pdfTemplateId?: InputMaybe<Scalars['Int']>;
  proposalSequence?: InputMaybe<Scalars['Int']>;
  proposalWorkflowId: Scalars['Int'];
  referenceNumberFormat?: InputMaybe<Scalars['String']>;
  seps?: InputMaybe<Array<Scalars['Int']>>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview?: InputMaybe<Scalars['DateTime']>;
  submissionMessage?: InputMaybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  templateId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};

export type CreatePredefinedMessageInput = {
  key: Scalars['String'];
  message: Scalars['String'];
  title: Scalars['String'];
};

export type CreateProposalStatusInput = {
  description: Scalars['String'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
};

export type CreateProposalWorkflowInput = {
  description: Scalars['String'];
  name: Scalars['String'];
};

export type CreateUserByEmailInviteResponseWrap = {
  id: Maybe<Scalars['Int']>;
  rejection: Maybe<Rejection>;
};

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FEEDBACK_BASIS = 'FEEDBACK_BASIS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  GENERIC_TEMPLATE_BASIS = 'GENERIC_TEMPLATE_BASIS',
  INTERVAL = 'INTERVAL',
  NUMBER_INPUT = 'NUMBER_INPUT',
  PROPOSAL_BASIS = 'PROPOSAL_BASIS',
  PROPOSAL_ESI_BASIS = 'PROPOSAL_ESI_BASIS',
  RICH_TEXT_INPUT = 'RICH_TEXT_INPUT',
  SAMPLE_BASIS = 'SAMPLE_BASIS',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SAMPLE_ESI_BASIS = 'SAMPLE_ESI_BASIS',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  SHIPMENT_BASIS = 'SHIPMENT_BASIS',
  TEXT_INPUT = 'TEXT_INPUT',
  VISIT_BASIS = 'VISIT_BASIS'
}

export type DateConfig = {
  defaultDate: Maybe<Scalars['String']>;
  includeTime: Scalars['Boolean'];
  maxDate: Maybe<Scalars['String']>;
  minDate: Maybe<Scalars['String']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type DeleteApiAccessTokenInput = {
  accessTokenId: Scalars['String'];
};

export type DeletePredefinedMessageInput = {
  id: Scalars['Int'];
};

export type DeleteProposalWorkflowStatusInput = {
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
};

export enum DependenciesLogicOperator {
  AND = 'AND',
  OR = 'OR'
}

export type EmailVerificationResponseWrap = {
  rejection: Maybe<Rejection>;
  success: Maybe<Scalars['Boolean']>;
};

export type EmbellishmentConfig = {
  html: Scalars['String'];
  omitFromPdf: Scalars['Boolean'];
  plain: Scalars['String'];
};

export type Entry = {
  id: Scalars['Int'];
  value: Scalars['String'];
};

export type EsiResponseWrap = {
  esi: Maybe<ExperimentSafetyInput>;
  rejection: Maybe<Rejection>;
};

export enum EvaluatorOperator {
  EQ = 'eq',
  NEQ = 'neq'
}

export enum Event {
  CALL_CREATED = 'CALL_CREATED',
  CALL_ENDED = 'CALL_ENDED',
  CALL_REVIEW_ENDED = 'CALL_REVIEW_ENDED',
  CALL_SEP_REVIEW_ENDED = 'CALL_SEP_REVIEW_ENDED',
  EMAIL_INVITE = 'EMAIL_INVITE',
  INSTRUMENT_DELETED = 'INSTRUMENT_DELETED',
  PREDEFINED_MESSAGE_CREATED = 'PREDEFINED_MESSAGE_CREATED',
  PREDEFINED_MESSAGE_DELETED = 'PREDEFINED_MESSAGE_DELETED',
  PREDEFINED_MESSAGE_UPDATED = 'PREDEFINED_MESSAGE_UPDATED',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_ALL_SEP_REVIEWERS_SELECTED = 'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
  PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED = 'PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED',
  PROPOSAL_BOOKING_TIME_ACTIVATED = 'PROPOSAL_BOOKING_TIME_ACTIVATED',
  PROPOSAL_BOOKING_TIME_COMPLETED = 'PROPOSAL_BOOKING_TIME_COMPLETED',
  PROPOSAL_BOOKING_TIME_REOPENED = 'PROPOSAL_BOOKING_TIME_REOPENED',
  PROPOSAL_BOOKING_TIME_SLOTS_REMOVED = 'PROPOSAL_BOOKING_TIME_SLOTS_REMOVED',
  PROPOSAL_BOOKING_TIME_SLOT_ADDED = 'PROPOSAL_BOOKING_TIME_SLOT_ADDED',
  PROPOSAL_BOOKING_TIME_UPDATED = 'PROPOSAL_BOOKING_TIME_UPDATED',
  PROPOSAL_CLONED = 'PROPOSAL_CLONED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_DELETED = 'PROPOSAL_DELETED',
  PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED = 'PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED',
  PROPOSAL_FEASIBILITY_REVIEW_UPDATED = 'PROPOSAL_FEASIBILITY_REVIEW_UPDATED',
  PROPOSAL_FEASIBLE = 'PROPOSAL_FEASIBLE',
  PROPOSAL_INSTRUMENT_SELECTED = 'PROPOSAL_INSTRUMENT_SELECTED',
  PROPOSAL_INSTRUMENT_SUBMITTED = 'PROPOSAL_INSTRUMENT_SUBMITTED',
  PROPOSAL_MANAGEMENT_DECISION_SUBMITTED = 'PROPOSAL_MANAGEMENT_DECISION_SUBMITTED',
  PROPOSAL_MANAGEMENT_DECISION_UPDATED = 'PROPOSAL_MANAGEMENT_DECISION_UPDATED',
  PROPOSAL_NOTIFIED = 'PROPOSAL_NOTIFIED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
  PROPOSAL_RESERVED = 'PROPOSAL_RESERVED',
  PROPOSAL_SAMPLE_REVIEW_SUBMITTED = 'PROPOSAL_SAMPLE_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_SAFE = 'PROPOSAL_SAMPLE_SAFE',
  PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN = 'PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN',
  PROPOSAL_SEP_MEETING_REORDER = 'PROPOSAL_SEP_MEETING_REORDER',
  PROPOSAL_SEP_MEETING_SAVED = 'PROPOSAL_SEP_MEETING_SAVED',
  PROPOSAL_SEP_MEETING_SUBMITTED = 'PROPOSAL_SEP_MEETING_SUBMITTED',
  PROPOSAL_SEP_REVIEW_SUBMITTED = 'PROPOSAL_SEP_REVIEW_SUBMITTED',
  PROPOSAL_SEP_REVIEW_UPDATED = 'PROPOSAL_SEP_REVIEW_UPDATED',
  PROPOSAL_SEP_SELECTED = 'PROPOSAL_SEP_SELECTED',
  PROPOSAL_STATUS_CHANGED_BY_USER = 'PROPOSAL_STATUS_CHANGED_BY_USER',
  PROPOSAL_STATUS_CHANGED_BY_WORKFLOW = 'PROPOSAL_STATUS_CHANGED_BY_WORKFLOW',
  PROPOSAL_STATUS_UPDATED = 'PROPOSAL_STATUS_UPDATED',
  PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
  PROPOSAL_UNFEASIBLE = 'PROPOSAL_UNFEASIBLE',
  PROPOSAL_UPDATED = 'PROPOSAL_UPDATED',
  SEP_CREATED = 'SEP_CREATED',
  SEP_MEMBERS_ASSIGNED = 'SEP_MEMBERS_ASSIGNED',
  SEP_MEMBER_ASSIGNED_TO_PROPOSAL = 'SEP_MEMBER_ASSIGNED_TO_PROPOSAL',
  SEP_MEMBER_REMOVED = 'SEP_MEMBER_REMOVED',
  SEP_MEMBER_REMOVED_FROM_PROPOSAL = 'SEP_MEMBER_REMOVED_FROM_PROPOSAL',
  SEP_PROPOSAL_REMOVED = 'SEP_PROPOSAL_REMOVED',
  SEP_REVIEWER_NOTIFIED = 'SEP_REVIEWER_NOTIFIED',
  SEP_UPDATED = 'SEP_UPDATED',
  TOPIC_ANSWERED = 'TOPIC_ANSWERED',
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
  USER_PASSWORD_RESET_EMAIL = 'USER_PASSWORD_RESET_EMAIL',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_UPDATED = 'USER_UPDATED'
}

export type EventLog = {
  changedBy: User;
  changedObjectId: Scalars['String'];
  eventTStamp: Scalars['DateTime'];
  eventType: Scalars['String'];
  id: Scalars['Int'];
  rowData: Scalars['String'];
};

export type ExperimentSafetyInput = {
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  isSubmitted: Scalars['Boolean'];
  proposal: Proposal;
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  sampleEsis: Array<SampleExperimentSafetyInput>;
  scheduledEventId: Scalars['Int'];
};

export type ExternalTokenLoginWrap = {
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type Feature = {
  description: Scalars['String'];
  id: FeatureId;
  isEnabled: Scalars['Boolean'];
};

export enum FeatureId {
  EMAIL_INVITE = 'EMAIL_INVITE',
  EMAIL_SEARCH = 'EMAIL_SEARCH',
  EXTERNAL_AUTH = 'EXTERNAL_AUTH',
  INSTRUMENT_MANAGEMENT = 'INSTRUMENT_MANAGEMENT',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  SAMPLE_SAFETY = 'SAMPLE_SAFETY',
  SCHEDULER = 'SCHEDULER',
  SEP_REVIEW = 'SEP_REVIEW',
  SHIPPING = 'SHIPPING',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  VISIT_MANAGEMENT = 'VISIT_MANAGEMENT'
}

export enum FeatureUpdateAction {
  DISABLE = 'DISABLE',
  ENABLE = 'ENABLE'
}

export type FeaturesResponseWrap = {
  features: Maybe<Array<Feature>>;
  rejection: Maybe<Rejection>;
};

export type Feedback = {
  createdAt: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  status: FeedbackStatus;
  submittedAt: Maybe<Scalars['DateTime']>;
};

export type FeedbackBasisConfig = {
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type FeedbackRequest = {
  id: Scalars['Int'];
  requestedAt: Scalars['DateTime'];
  scheduledEventId: Scalars['Int'];
};

export type FeedbackRequestWrap = {
  rejection: Maybe<Rejection>;
  request: Maybe<FeedbackRequest>;
};

export type FeedbackResponseWrap = {
  feedback: Maybe<Feedback>;
  rejection: Maybe<Rejection>;
};

export enum FeedbackStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type FeedbacksFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  scheduledEventId?: InputMaybe<Scalars['Int']>;
};

export type FieldCondition = {
  condition: EvaluatorOperator;
  params: Scalars['IntStringDateBoolArray'];
};

export type FieldConditionInput = {
  condition: EvaluatorOperator;
  params: Scalars['String'];
};

export type FieldConfig = BooleanConfig | DateConfig | EmbellishmentConfig | FeedbackBasisConfig | FileUploadConfig | GenericTemplateBasisConfig | IntervalConfig | NumberInputConfig | ProposalBasisConfig | ProposalEsiBasisConfig | RichTextInputConfig | SampleBasisConfig | SampleDeclarationConfig | SampleEsiBasisConfig | SelectionFromOptionsConfig | ShipmentBasisConfig | SubTemplateConfig | TextInputConfig | VisitBasisConfig;

export type FieldDependency = {
  condition: FieldCondition;
  dependencyId: Scalars['String'];
  dependencyNaturalKey: Scalars['String'];
  questionId: Scalars['String'];
};

export type FieldDependencyInput = {
  condition: FieldConditionInput;
  dependencyId: Scalars['String'];
};

export type FileMetadata = {
  createdDate: Scalars['DateTime'];
  fileId: Scalars['String'];
  mimeType: Scalars['String'];
  originalFileName: Scalars['String'];
  sizeInBytes: Scalars['Int'];
};

export type FileUploadConfig = {
  file_type: Array<Scalars['String']>;
  max_files: Scalars['Int'];
  pdf_page_limit: Scalars['Int'];
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type FilesMetadataFilter = {
  fileIds: Array<Scalars['String']>;
};

export type GenericTemplate = {
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  title: Scalars['String'];
};

export type GenericTemplateBasisConfig = {
  questionLabel: Scalars['String'];
  titlePlaceholder: Scalars['String'];
};

export type GenericTemplateResponseWrap = {
  genericTemplate: Maybe<GenericTemplate>;
  rejection: Maybe<Rejection>;
};

export type GenericTemplatesFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  genericTemplateIds?: InputMaybe<Array<Scalars['Int']>>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  questionId?: InputMaybe<Scalars['String']>;
  questionaryIds?: InputMaybe<Array<Scalars['Int']>>;
  title?: InputMaybe<Scalars['String']>;
};

export type IndexWithGroupId = {
  droppableId: Scalars['String'];
  index: Scalars['Int'];
};

export type Institution = {
  country: Maybe<Entry>;
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type InstitutionResponseWrap = {
  institution: Maybe<Institution>;
  rejection: Maybe<Rejection>;
};

export type InstitutionsFilter = {
  isVerified?: InputMaybe<Scalars['Boolean']>;
};

export type Instrument = {
  beamlineManager: Maybe<BasicUserDetails>;
  description: Scalars['String'];
  id: Scalars['Int'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  scientists: Array<BasicUserDetails>;
  shortCode: Scalars['String'];
};

export type InstrumentResponseWrap = {
  instrument: Maybe<Instrument>;
  rejection: Maybe<Rejection>;
};

export type InstrumentWithAvailabilityTime = {
  availabilityTime: Maybe<Scalars['Int']>;
  beamlineManager: Maybe<BasicUserDetails>;
  description: Scalars['String'];
  id: Scalars['Int'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  scientists: Array<BasicUserDetails>;
  shortCode: Scalars['String'];
  submitted: Maybe<Scalars['Boolean']>;
};

export type InstrumentsQueryResult = {
  instruments: Array<Instrument>;
  totalCount: Scalars['Int'];
};

export type IntervalConfig = {
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  units: Array<Unit>;
};

export type LogoutTokenWrap = {
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type MoveProposalWorkflowStatusInput = {
  from: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
  to: IndexWithGroupId;
};

export type Mutation = {
  addClientLog: SuccessResponseWrap;
  addProposalWorkflowStatus: ProposalWorkflowConnectionResponseWrap;
  addSamplesToShipment: ShipmentResponseWrap;
  addStatusChangingEventsToConnection: ProposalStatusChangingEventResponseWrap;
  addTechnicalReview: TechnicalReviewResponseWrap;
  addUserForReview: ReviewResponseWrap;
  addUserRole: AddUserRoleResponseWrap;
  administrationProposal: ProposalResponseWrap;
  answerTopic: QuestionaryStepResponseWrap;
  applyPatches: PrepareDbResponseWrap;
  assignChairOrSecretary: SepResponseWrap;
  assignInstrumentsToCall: CallResponseWrap;
  assignProposalsToInstrument: SuccessResponseWrap;
  assignProposalsToSep: NextProposalStatusResponseWrap;
  assignReviewersToSEP: SepResponseWrap;
  assignScientistsToInstrument: SuccessResponseWrap;
  assignSepReviewersToProposal: SepResponseWrap;
  changeProposalsStatus: SuccessResponseWrap;
  cloneGenericTemplate: GenericTemplateResponseWrap;
  cloneProposals: ProposalsResponseWrap;
  cloneSample: SampleResponseWrap;
  cloneSampleEsi: SampleEsiResponseWrap;
  cloneTemplate: TemplateResponseWrap;
  createApiAccessToken: ApiAccessTokenResponseWrap;
  createCall: CallResponseWrap;
  createEsi: EsiResponseWrap;
  createFeedback: FeedbackResponseWrap;
  createGenericTemplate: GenericTemplateResponseWrap;
  createInstitution: InstitutionResponseWrap;
  createInstrument: InstrumentResponseWrap;
  createPdfTemplate: PdfTemplateResponseWrap;
  createPredefinedMessage: PredefinedMessageResponseWrap;
  createProposal: ProposalResponseWrap;
  createProposalStatus: ProposalStatusResponseWrap;
  createProposalWorkflow: ProposalWorkflowResponseWrap;
  createQuestion: QuestionResponseWrap;
  createQuestionTemplateRelation: TemplateResponseWrap;
  createQuestionary: QuestionaryResponseWrap;
  createSEP: SepResponseWrap;
  createSample: SampleResponseWrap;
  createSampleEsi: SampleEsiResponseWrap;
  createShipment: ShipmentResponseWrap;
  createTemplate: TemplateResponseWrap;
  createTopic: TemplateResponseWrap;
  createUnit: UnitResponseWrap;
  createUser: UserResponseWrap;
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap;
  createVisit: VisitResponseWrap;
  createVisitRegistration: VisitRegistrationResponseWrap;
  deleteApiAccessToken: SuccessResponseWrap;
  deleteCall: CallResponseWrap;
  deleteFeedback: FeedbackResponseWrap;
  deleteGenericTemplate: GenericTemplateResponseWrap;
  deleteInstitution: InstitutionResponseWrap;
  deleteInstrument: InstrumentResponseWrap;
  deletePdfTemplate: PdfTemplateResponseWrap;
  deletePredefinedMessage: PredefinedMessageResponseWrap;
  deleteProposal: ProposalResponseWrap;
  deleteProposalStatus: ProposalStatusResponseWrap;
  deleteProposalWorkflow: ProposalWorkflowResponseWrap;
  deleteProposalWorkflowStatus: SuccessResponseWrap;
  deleteQuestion: QuestionResponseWrap;
  deleteQuestionTemplateRelation: TemplateResponseWrap;
  deleteSEP: SepResponseWrap;
  deleteSample: SampleResponseWrap;
  deleteSampleEsi: SampleEsiResponseWrap;
  deleteShipment: ShipmentResponseWrap;
  deleteTemplate: TemplateResponseWrap;
  deleteTopic: TemplateResponseWrap;
  deleteUnit: UnitResponseWrap;
  deleteUser: UserResponseWrap;
  deleteVisit: VisitResponseWrap;
  emailVerification: EmailVerificationResponseWrap;
  externalTokenLogin: ExternalTokenLoginWrap;
  getTokenForUser: TokenResponseWrap;
  importProposal: ProposalResponseWrap;
  importTemplate: TemplateResponseWrap;
  importUnits: UnitsResponseWrap;
  login: TokenResponseWrap;
  logout: LogoutTokenWrap;
  mergeInstitutions: InstitutionResponseWrap;
  moveProposalWorkflowStatus: ProposalWorkflowConnectionResponseWrap;
  notifyProposal: ProposalResponseWrap;
  prepareDB: PrepareDbResponseWrap;
  removeAssignedInstrumentFromCall: CallResponseWrap;
  removeMemberFromSEPProposal: SepResponseWrap;
  removeMemberFromSep: SepResponseWrap;
  removeProposalsFromInstrument: SuccessResponseWrap;
  removeProposalsFromSep: SepResponseWrap;
  removeScientistFromInstrument: SuccessResponseWrap;
  removeUserForReview: ReviewResponseWrap;
  reorderSepMeetingDecisionProposals: SepMeetingDecisionResponseWrap;
  requestFeedback: FeedbackRequestWrap;
  resetPassword: BasicUserDetailsResponseWrap;
  resetPasswordEmail: SuccessResponseWrap;
  saveSepMeetingDecision: SepMeetingDecisionResponseWrap;
  selectRole: TokenResponseWrap;
  setActiveTemplate: SuccessResponseWrap;
  setInstrumentAvailabilityTime: SuccessResponseWrap;
  setPageContent: PageResponseWrap;
  setUserEmailVerified: UserResponseWrap;
  setUserNotPlaceholder: UserResponseWrap;
  submitInstrument: SuccessResponseWrap;
  submitProposal: ProposalResponseWrap;
  submitProposalsReview: SuccessResponseWrap;
  submitShipment: ShipmentResponseWrap;
  submitTechnicalReviews: SuccessResponseWrap;
  token: TokenResponseWrap;
  updateAnswer: UpdateAnswerResponseWrap;
  updateApiAccessToken: ApiAccessTokenResponseWrap;
  updateCall: CallResponseWrap;
  updateEsi: EsiResponseWrap;
  updateFeatures: FeaturesResponseWrap;
  updateFeedback: FeedbackResponseWrap;
  updateGenericTemplate: GenericTemplateResponseWrap;
  updateInstitution: InstitutionResponseWrap;
  updateInstrument: InstrumentResponseWrap;
  updatePassword: BasicUserDetailsResponseWrap;
  updatePdfTemplate: PdfTemplateResponseWrap;
  updatePredefinedMessage: PredefinedMessageResponseWrap;
  updateProposal: ProposalResponseWrap;
  updateProposalStatus: ProposalStatusResponseWrap;
  updateProposalWorkflow: ProposalWorkflowResponseWrap;
  updateQuestion: QuestionResponseWrap;
  updateQuestionTemplateRelation: TemplateResponseWrap;
  updateQuestionTemplateRelationSettings: TemplateResponseWrap;
  updateReview: ReviewWithNextStatusResponseWrap;
  updateSEP: SepResponseWrap;
  updateSEPTimeAllocation: SepProposalResponseWrap;
  updateSample: SampleResponseWrap;
  updateSampleEsi: SampleEsiResponseWrap;
  updateSettings: SettingsResponseWrap;
  updateShipment: ShipmentResponseWrap;
  updateTechnicalReviewAssignee: TechnicalReviewsResponseWrap;
  updateTemplate: TemplateResponseWrap;
  updateTopic: TemplateResponseWrap;
  updateUser: UserResponseWrap;
  updateUserRoles: UserResponseWrap;
  updateVisit: VisitResponseWrap;
  updateVisitRegistration: VisitRegistrationResponseWrap;
  validateTemplateImport: TemplateValidationWrap;
  validateUnitsImport: UnitsImportWithValidationWrap;
};


export type MutationAddClientLogArgs = {
  error: Scalars['String'];
};


export type MutationAddProposalWorkflowStatusArgs = {
  newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput;
};


export type MutationAddSamplesToShipmentArgs = {
  sampleIds: Array<Scalars['Int']>;
  shipmentId: Scalars['Int'];
};


export type MutationAddStatusChangingEventsToConnectionArgs = {
  addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionInput;
};


export type MutationAddTechnicalReviewArgs = {
  addTechnicalReviewInput: AddTechnicalReviewInput;
};


export type MutationAddUserForReviewArgs = {
  proposalPk: Scalars['Int'];
  sepID: Scalars['Int'];
  userID: Scalars['Int'];
};


export type MutationAddUserRoleArgs = {
  roleID: Scalars['Int'];
  userID: Scalars['Int'];
};


export type MutationAdministrationProposalArgs = {
  commentForManagement?: InputMaybe<Scalars['String']>;
  commentForUser?: InputMaybe<Scalars['String']>;
  finalStatus?: InputMaybe<ProposalEndStatus>;
  managementDecisionSubmitted?: InputMaybe<Scalars['Boolean']>;
  managementTimeAllocation?: InputMaybe<Scalars['Int']>;
  proposalPk: Scalars['Int'];
  statusId?: InputMaybe<Scalars['Int']>;
};


export type MutationAnswerTopicArgs = {
  answers: Array<AnswerInput>;
  isPartialSave?: InputMaybe<Scalars['Boolean']>;
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
};


export type MutationAssignChairOrSecretaryArgs = {
  assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSepInput;
};


export type MutationAssignInstrumentsToCallArgs = {
  assignInstrumentsToCallInput: AssignInstrumentsToCallInput;
};


export type MutationAssignProposalsToInstrumentArgs = {
  instrumentId: Scalars['Int'];
  proposals: Array<ProposalPkWithCallId>;
};


export type MutationAssignProposalsToSepArgs = {
  proposals: Array<ProposalPkWithCallId>;
  sepId: Scalars['Int'];
};


export type MutationAssignReviewersToSepArgs = {
  memberIds: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type MutationAssignScientistsToInstrumentArgs = {
  instrumentId: Scalars['Int'];
  scientistIds: Array<Scalars['Int']>;
};


export type MutationAssignSepReviewersToProposalArgs = {
  memberIds: Array<Scalars['Int']>;
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationChangeProposalsStatusArgs = {
  changeProposalsStatusInput: ChangeProposalsStatusInput;
};


export type MutationCloneGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};


export type MutationCloneProposalsArgs = {
  cloneProposalsInput: CloneProposalsInput;
};


export type MutationCloneSampleArgs = {
  isPostProposalSubmission?: InputMaybe<Scalars['Boolean']>;
  sampleId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};


export type MutationCloneSampleEsiArgs = {
  esiId: Scalars['Int'];
  newSampleTitle?: InputMaybe<Scalars['String']>;
  sampleId: Scalars['Int'];
};


export type MutationCloneTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationCreateApiAccessTokenArgs = {
  createApiAccessTokenInput: CreateApiAccessTokenInput;
};


export type MutationCreateCallArgs = {
  createCallInput: CreateCallInput;
};


export type MutationCreateEsiArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationCreateFeedbackArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationCreateGenericTemplateArgs = {
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationCreateInstitutionArgs = {
  country: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};


export type MutationCreateInstrumentArgs = {
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
};


export type MutationCreatePdfTemplateArgs = {
  templateData: Scalars['String'];
  templateId: Scalars['Int'];
};


export type MutationCreatePredefinedMessageArgs = {
  createPredefinedMessageInput: CreatePredefinedMessageInput;
};


export type MutationCreateProposalArgs = {
  callId: Scalars['Int'];
};


export type MutationCreateProposalStatusArgs = {
  newProposalStatusInput: CreateProposalStatusInput;
};


export type MutationCreateProposalWorkflowArgs = {
  newProposalWorkflowInput: CreateProposalWorkflowInput;
};


export type MutationCreateQuestionArgs = {
  categoryId: TemplateCategoryId;
  dataType: DataType;
};


export type MutationCreateQuestionTemplateRelationArgs = {
  questionId: Scalars['String'];
  sortOrder: Scalars['Int'];
  templateId: Scalars['Int'];
  topicId: Scalars['Int'];
};


export type MutationCreateQuestionaryArgs = {
  templateId: Scalars['Int'];
};


export type MutationCreateSepArgs = {
  active: Scalars['Boolean'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired?: InputMaybe<Scalars['Int']>;
};


export type MutationCreateSampleArgs = {
  isPostProposalSubmission?: InputMaybe<Scalars['Boolean']>;
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationCreateSampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type MutationCreateShipmentArgs = {
  proposalPk: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationCreateTemplateArgs = {
  description?: InputMaybe<Scalars['String']>;
  groupId: TemplateGroupId;
  name: Scalars['String'];
};


export type MutationCreateTopicArgs = {
  sortOrder?: InputMaybe<Scalars['Int']>;
  templateId: Scalars['Int'];
  title?: InputMaybe<Scalars['Int']>;
};


export type MutationCreateUnitArgs = {
  id: Scalars['String'];
  quantity: Scalars['String'];
  siConversionFormula: Scalars['String'];
  symbol: Scalars['String'];
  unit: Scalars['String'];
};


export type MutationCreateUserArgs = {
  birthdate: Scalars['DateTime'];
  department: Scalars['String'];
  email: Scalars['String'];
  firstname: Scalars['String'];
  gender: Scalars['String'];
  lastname: Scalars['String'];
  middlename?: InputMaybe<Scalars['String']>;
  nationality: Scalars['Int'];
  orcid: Scalars['String'];
  orcidHash: Scalars['String'];
  organisation: Scalars['Int'];
  organizationCountry?: InputMaybe<Scalars['Int']>;
  otherOrganisation?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  position: Scalars['String'];
  preferredname?: InputMaybe<Scalars['String']>;
  refreshToken: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: InputMaybe<Scalars['String']>;
  user_title?: InputMaybe<Scalars['String']>;
};


export type MutationCreateUserByEmailInviteArgs = {
  email: Scalars['String'];
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  userRole: UserRole;
};


export type MutationCreateVisitArgs = {
  scheduledEventId: Scalars['Int'];
  team: Array<Scalars['Int']>;
  teamLeadUserId: Scalars['Int'];
};


export type MutationCreateVisitRegistrationArgs = {
  visitId: Scalars['Int'];
};


export type MutationDeleteApiAccessTokenArgs = {
  deleteApiAccessTokenInput: DeleteApiAccessTokenInput;
};


export type MutationDeleteCallArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteFeedbackArgs = {
  feedbackId: Scalars['Int'];
};


export type MutationDeleteGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
};


export type MutationDeleteInstitutionArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteInstrumentArgs = {
  id: Scalars['Int'];
};


export type MutationDeletePdfTemplateArgs = {
  pdfTemplateId: Scalars['Int'];
};


export type MutationDeletePredefinedMessageArgs = {
  deletePredefinedMessageInput: DeletePredefinedMessageInput;
};


export type MutationDeleteProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationDeleteProposalStatusArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteProposalWorkflowArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteProposalWorkflowStatusArgs = {
  deleteProposalWorkflowStatusInput: DeleteProposalWorkflowStatusInput;
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['String'];
};


export type MutationDeleteQuestionTemplateRelationArgs = {
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
};


export type MutationDeleteSepArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteSampleArgs = {
  sampleId: Scalars['Int'];
};


export type MutationDeleteSampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type MutationDeleteShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type MutationDeleteTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationDeleteTopicArgs = {
  topicId: Scalars['Int'];
};


export type MutationDeleteUnitArgs = {
  id: Scalars['String'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteVisitArgs = {
  visitId: Scalars['Int'];
};


export type MutationEmailVerificationArgs = {
  token: Scalars['String'];
};


export type MutationExternalTokenLoginArgs = {
  externalToken: Scalars['String'];
};


export type MutationGetTokenForUserArgs = {
  userId: Scalars['Int'];
};


export type MutationImportProposalArgs = {
  abstract?: InputMaybe<Scalars['String']>;
  callId: Scalars['Int'];
  proposerId?: InputMaybe<Scalars['Int']>;
  referenceNumber: Scalars['Int'];
  submitterId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
  users?: InputMaybe<Array<Scalars['Int']>>;
};


export type MutationImportTemplateArgs = {
  conflictResolutions: Array<ConflictResolution>;
  subTemplatesConflictResolutions: Array<Array<ConflictResolution>>;
  templateAsJson: Scalars['String'];
};


export type MutationImportUnitsArgs = {
  conflictResolutions: Array<ConflictResolution>;
  json: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationLogoutArgs = {
  token: Scalars['String'];
};


export type MutationMergeInstitutionsArgs = {
  institutionIdFrom: Scalars['Int'];
  institutionIdInto: Scalars['Int'];
  newTitle: Scalars['String'];
};


export type MutationMoveProposalWorkflowStatusArgs = {
  moveProposalWorkflowStatusInput: MoveProposalWorkflowStatusInput;
};


export type MutationNotifyProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationPrepareDbArgs = {
  includeSeeds?: InputMaybe<Scalars['Boolean']>;
};


export type MutationRemoveAssignedInstrumentFromCallArgs = {
  removeAssignedInstrumentFromCallInput: RemoveAssignedInstrumentFromCallInput;
};


export type MutationRemoveMemberFromSepProposalArgs = {
  memberId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationRemoveMemberFromSepArgs = {
  memberId: Scalars['Int'];
  roleId: UserRole;
  sepId: Scalars['Int'];
};


export type MutationRemoveProposalsFromInstrumentArgs = {
  proposalPks: Array<Scalars['Int']>;
};


export type MutationRemoveProposalsFromSepArgs = {
  proposalPks: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type MutationRemoveScientistFromInstrumentArgs = {
  instrumentId: Scalars['Int'];
  scientistId: Scalars['Int'];
};


export type MutationRemoveUserForReviewArgs = {
  reviewId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationReorderSepMeetingDecisionProposalsArgs = {
  reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput;
};


export type MutationRequestFeedbackArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationResetPasswordArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationResetPasswordEmailArgs = {
  email: Scalars['String'];
};


export type MutationSaveSepMeetingDecisionArgs = {
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
};


export type MutationSelectRoleArgs = {
  selectedRoleId?: InputMaybe<Scalars['Int']>;
  token: Scalars['String'];
};


export type MutationSetActiveTemplateArgs = {
  templateGroupId: TemplateGroupId;
  templateId: Scalars['Int'];
};


export type MutationSetInstrumentAvailabilityTimeArgs = {
  availabilityTime: Scalars['Int'];
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
};


export type MutationSetPageContentArgs = {
  id: PageName;
  text: Scalars['String'];
};


export type MutationSetUserEmailVerifiedArgs = {
  id: Scalars['Int'];
};


export type MutationSetUserNotPlaceholderArgs = {
  id: Scalars['Int'];
};


export type MutationSubmitInstrumentArgs = {
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationSubmitProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationSubmitProposalsReviewArgs = {
  submitProposalsReviewInput: SubmitProposalsReviewInput;
};


export type MutationSubmitShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type MutationSubmitTechnicalReviewsArgs = {
  submitTechnicalReviewsInput: SubmitTechnicalReviewsInput;
};


export type MutationTokenArgs = {
  token: Scalars['String'];
};


export type MutationUpdateAnswerArgs = {
  answer: AnswerInput;
  questionaryId: Scalars['Int'];
};


export type MutationUpdateApiAccessTokenArgs = {
  updateApiAccessTokenInput: UpdateApiAccessTokenInput;
};


export type MutationUpdateCallArgs = {
  updateCallInput: UpdateCallInput;
};


export type MutationUpdateEsiArgs = {
  esiId: Scalars['Int'];
  isSubmitted?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpdateFeaturesArgs = {
  updatedFeaturesInput: UpdateFeaturesInput;
};


export type MutationUpdateFeedbackArgs = {
  feedbackId: Scalars['Int'];
  status?: InputMaybe<FeedbackStatus>;
};


export type MutationUpdateGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
  safetyComment?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateInstitutionArgs = {
  country: Scalars['Int'];
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  verified?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpdateInstrumentArgs = {
  description: Scalars['String'];
  id: Scalars['Int'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
};


export type MutationUpdatePasswordArgs = {
  id: Scalars['Int'];
  password: Scalars['String'];
};


export type MutationUpdatePdfTemplateArgs = {
  pdfTemplateId: Scalars['Int'];
  templateData?: InputMaybe<Scalars['String']>;
};


export type MutationUpdatePredefinedMessageArgs = {
  updatePredefinedMessageInput: UpdatePredefinedMessageInput;
};


export type MutationUpdateProposalArgs = {
  abstract?: InputMaybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  proposerId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  users?: InputMaybe<Array<Scalars['Int']>>;
};


export type MutationUpdateProposalStatusArgs = {
  updatedProposalStatusInput: UpdateProposalStatusInput;
};


export type MutationUpdateProposalWorkflowArgs = {
  updatedProposalWorkflowInput: UpdateProposalWorkflowInput;
};


export type MutationUpdateQuestionArgs = {
  config?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  naturalKey?: InputMaybe<Scalars['String']>;
  question?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateQuestionTemplateRelationArgs = {
  config?: InputMaybe<Scalars['String']>;
  questionId: Scalars['String'];
  sortOrder: Scalars['Int'];
  templateId: Scalars['Int'];
  topicId?: InputMaybe<Scalars['Int']>;
};


export type MutationUpdateQuestionTemplateRelationSettingsArgs = {
  config?: InputMaybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput>;
  dependenciesOperator?: InputMaybe<DependenciesLogicOperator>;
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
};


export type MutationUpdateReviewArgs = {
  comment: Scalars['String'];
  grade: Scalars['Int'];
  reviewID: Scalars['Int'];
  sepID: Scalars['Int'];
  status: ReviewStatus;
};


export type MutationUpdateSepArgs = {
  active: Scalars['Boolean'];
  code: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Int'];
  numberRatingsRequired?: InputMaybe<Scalars['Int']>;
};


export type MutationUpdateSepTimeAllocationArgs = {
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
  sepTimeAllocation?: InputMaybe<Scalars['Int']>;
};


export type MutationUpdateSampleArgs = {
  safetyComment?: InputMaybe<Scalars['String']>;
  safetyStatus?: InputMaybe<SampleStatus>;
  sampleId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateSampleEsiArgs = {
  esiId: Scalars['Int'];
  isSubmitted?: InputMaybe<Scalars['Boolean']>;
  sampleId: Scalars['Int'];
};


export type MutationUpdateSettingsArgs = {
  updatedSettingsInput: UpdateSettingsInput;
};


export type MutationUpdateShipmentArgs = {
  externalRef?: InputMaybe<Scalars['String']>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  shipmentId: Scalars['Int'];
  status?: InputMaybe<ShipmentStatus>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateTechnicalReviewAssigneeArgs = {
  proposalPks: Array<Scalars['Int']>;
  userId: Scalars['Int'];
};


export type MutationUpdateTemplateArgs = {
  description?: InputMaybe<Scalars['String']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  templateId: Scalars['Int'];
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'];
  isEnabled?: InputMaybe<Scalars['Boolean']>;
  sortOrder?: InputMaybe<Scalars['Int']>;
  templateId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserArgs = {
  birthdate?: InputMaybe<Scalars['DateTime']>;
  department?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstname?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  lastname?: InputMaybe<Scalars['String']>;
  middlename?: InputMaybe<Scalars['String']>;
  nationality?: InputMaybe<Scalars['Int']>;
  orcid?: InputMaybe<Scalars['String']>;
  organisation?: InputMaybe<Scalars['Int']>;
  organizationCountry?: InputMaybe<Scalars['Int']>;
  otherOrganisation?: InputMaybe<Scalars['String']>;
  placeholder?: InputMaybe<Scalars['String']>;
  position?: InputMaybe<Scalars['String']>;
  preferredname?: InputMaybe<Scalars['String']>;
  refreshToken?: InputMaybe<Scalars['String']>;
  roles?: InputMaybe<Array<Scalars['Int']>>;
  telephone?: InputMaybe<Scalars['String']>;
  telephone_alt?: InputMaybe<Scalars['String']>;
  user_title?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserRolesArgs = {
  id: Scalars['Int'];
  roles?: InputMaybe<Array<Scalars['Int']>>;
};


export type MutationUpdateVisitArgs = {
  status?: InputMaybe<VisitStatus>;
  team?: InputMaybe<Array<Scalars['Int']>>;
  teamLeadUserId?: InputMaybe<Scalars['Int']>;
  visitId: Scalars['Int'];
};


export type MutationUpdateVisitRegistrationArgs = {
  endsAt?: InputMaybe<Scalars['DateTime']>;
  isRegistrationSubmitted?: InputMaybe<Scalars['Boolean']>;
  startsAt?: InputMaybe<Scalars['DateTime']>;
  trainingExpiryDate?: InputMaybe<Scalars['DateTime']>;
  visitId: Scalars['Int'];
};


export type MutationValidateTemplateImportArgs = {
  templateAsJson: Scalars['String'];
};


export type MutationValidateUnitsImportArgs = {
  unitsAsJson: Scalars['String'];
};

export type NextProposalStatus = {
  description: Maybe<Scalars['String']>;
  id: Maybe<Scalars['Int']>;
  isDefault: Maybe<Scalars['Boolean']>;
  name: Maybe<Scalars['String']>;
  shortCode: Maybe<Scalars['String']>;
};

export type NextProposalStatusResponseWrap = {
  nextProposalStatus: Maybe<NextProposalStatus>;
  rejection: Maybe<Rejection>;
};

export type NumberInputConfig = {
  numberValueConstraint: Maybe<NumberValueConstraint>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  units: Array<Unit>;
};

export enum NumberValueConstraint {
  NONE = 'NONE',
  ONLY_NEGATIVE = 'ONLY_NEGATIVE',
  ONLY_NEGATIVE_INTEGER = 'ONLY_NEGATIVE_INTEGER',
  ONLY_POSITIVE = 'ONLY_POSITIVE',
  ONLY_POSITIVE_INTEGER = 'ONLY_POSITIVE_INTEGER'
}

export type OrcIdInformation = {
  firstname: Maybe<Scalars['String']>;
  lastname: Maybe<Scalars['String']>;
  orcid: Maybe<Scalars['String']>;
  orcidHash: Maybe<Scalars['String']>;
  refreshToken: Maybe<Scalars['String']>;
  token: Maybe<Scalars['String']>;
};

export type Page = {
  content: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

export enum PageName {
  COOKIEPAGE = 'COOKIEPAGE',
  FOOTERCONTENT = 'FOOTERCONTENT',
  GRADEGUIDEPAGE = 'GRADEGUIDEPAGE',
  HELPPAGE = 'HELPPAGE',
  HOMEPAGE = 'HOMEPAGE',
  LOGINHELPPAGE = 'LOGINHELPPAGE',
  PRIVACYPAGE = 'PRIVACYPAGE',
  REVIEWPAGE = 'REVIEWPAGE'
}

export type PageResponseWrap = {
  page: Maybe<Page>;
  rejection: Maybe<Rejection>;
};

export type PdfTemplate = {
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  pdfTemplateId: Scalars['Int'];
  templateData: Scalars['String'];
  templateId: Scalars['Int'];
};

export type PdfTemplateResponseWrap = {
  pdfTemplate: Maybe<PdfTemplate>;
  rejection: Maybe<Rejection>;
};

export type PdfTemplatesFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  pdfTemplateData?: InputMaybe<Scalars['String']>;
  pdfTemplateIds?: InputMaybe<Array<Scalars['Int']>>;
  templateIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type PermissionsWithAccessToken = {
  accessPermissions: Scalars['String'];
  accessToken: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};

export type PredefinedMessage = {
  dateModified: Scalars['DateTime'];
  id: Scalars['Int'];
  lastModifiedBy: Scalars['Int'];
  message: Scalars['String'];
  modifiedBy: BasicUserDetails;
  title: Scalars['String'];
};

export type PredefinedMessageResponseWrap = {
  predefinedMessage: Maybe<PredefinedMessage>;
  rejection: Maybe<Rejection>;
};

export type PredefinedMessagesFilter = {
  key?: InputMaybe<Scalars['String']>;
};

export type PrepareDbResponseWrap = {
  log: Maybe<Scalars['String']>;
  rejection: Maybe<Rejection>;
};

export type Proposal = {
  abstract: Scalars['String'];
  call: Maybe<Call>;
  callId: Scalars['Int'];
  commentForManagement: Maybe<Scalars['String']>;
  commentForUser: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  finalStatus: Maybe<ProposalEndStatus>;
  genericTemplates: Maybe<Array<GenericTemplate>>;
  instrument: Maybe<Instrument>;
  managementDecisionSubmitted: Scalars['Boolean'];
  managementTimeAllocation: Maybe<Scalars['Int']>;
  notified: Scalars['Boolean'];
  primaryKey: Scalars['Int'];
  proposalBookingCore: Maybe<ProposalBookingCore>;
  proposalId: Scalars['String'];
  proposer: Maybe<BasicUserDetails>;
  proposerId: Scalars['Int'];
  publicStatus: ProposalPublicStatus;
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  reviews: Maybe<Array<Review>>;
  samples: Maybe<Array<Sample>>;
  sep: Maybe<Sep>;
  sepMeetingDecision: Maybe<SepMeetingDecision>;
  status: Maybe<ProposalStatus>;
  statusId: Scalars['Int'];
  submitted: Scalars['Boolean'];
  technicalReview: Maybe<TechnicalReview>;
  title: Scalars['String'];
  updated: Scalars['DateTime'];
  users: Array<BasicUserDetails>;
  visits: Maybe<Array<Visit>>;
};


export type ProposalProposalBookingCoreArgs = {
  filter?: InputMaybe<ProposalBookingFilter>;
};

export type ProposalBasisConfig = {
  tooltip: Scalars['String'];
};

export type ProposalBookingCore = {
  id: Scalars['Int'];
  scheduledEvents: Array<ScheduledEventCore>;
};


export type ProposalBookingCoreScheduledEventsArgs = {
  filter: ProposalBookingScheduledEventFilterCore;
};

export type ProposalBookingFilter = {
  status?: InputMaybe<Array<ProposalBookingStatusCore>>;
};

export type ProposalBookingScheduledEventFilterCore = {
  bookingType?: InputMaybe<ScheduledEventBookingType>;
  endsAfter?: InputMaybe<Scalars['DateTime']>;
  endsBefore?: InputMaybe<Scalars['DateTime']>;
  status?: InputMaybe<Array<ProposalBookingStatusCore>>;
};

export enum ProposalBookingStatusCore {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT'
}

export enum ProposalEndStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RESERVED = 'RESERVED',
  UNSET = 'UNSET'
}

export type ProposalEsiBasisConfig = {
  tooltip: Scalars['String'];
};

export type ProposalEvent = {
  description: Maybe<Scalars['String']>;
  name: Event;
};

export type ProposalPkWithCallId = {
  callId: Scalars['Int'];
  primaryKey: Scalars['Int'];
};

export type ProposalPkWithRankOrder = {
  proposalPk: Scalars['Int'];
  rankOrder: Scalars['Int'];
};

export type ProposalPkWithReviewId = {
  proposalPk: Scalars['Int'];
  reviewId: Scalars['Int'];
};

export enum ProposalPublicStatus {
  ACCEPTED = 'accepted',
  DRAFT = 'draft',
  REJECTED = 'rejected',
  RESERVED = 'reserved',
  SUBMITTED = 'submitted',
  UNKNOWN = 'unknown'
}

export type ProposalResponseWrap = {
  proposal: Maybe<Proposal>;
  rejection: Maybe<Rejection>;
};

export type ProposalStatus = {
  description: Scalars['String'];
  id: Scalars['Int'];
  isDefault: Scalars['Boolean'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
};

export type ProposalStatusChangingEventResponseWrap = {
  rejection: Maybe<Rejection>;
  statusChangingEvents: Maybe<Array<StatusChangingEvent>>;
};

export type ProposalStatusResponseWrap = {
  proposalStatus: Maybe<ProposalStatus>;
  rejection: Maybe<Rejection>;
};

export type ProposalTemplate = {
  callCount: Scalars['Int'];
  complementaryQuestions: Array<Question>;
  description: Maybe<Scalars['String']>;
  group: TemplateGroup;
  groupId: TemplateGroupId;
  isArchived: Scalars['Boolean'];
  json: Scalars['String'];
  name: Scalars['String'];
  pdfTemplate: Maybe<PdfTemplate>;
  questionaryCount: Scalars['Int'];
  steps: Array<TemplateStep>;
  templateId: Scalars['Int'];
};

export type ProposalTemplatesFilter = {
  isArchived?: InputMaybe<Scalars['Boolean']>;
  templateIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type ProposalView = {
  allocationTimeUnit: AllocationTimeUnits;
  callId: Scalars['Int'];
  callShortCode: Maybe<Scalars['String']>;
  finalStatus: Maybe<ProposalEndStatus>;
  instrumentId: Maybe<Scalars['Int']>;
  instrumentName: Maybe<Scalars['String']>;
  managementTimeAllocation: Maybe<Scalars['Int']>;
  notified: Scalars['Boolean'];
  primaryKey: Scalars['Int'];
  proposalId: Scalars['String'];
  rankOrder: Maybe<Scalars['Int']>;
  reviewAverage: Maybe<Scalars['Float']>;
  reviewDeviation: Maybe<Scalars['Float']>;
  sepCode: Maybe<Scalars['String']>;
  sepId: Maybe<Scalars['Int']>;
  statusDescription: Scalars['String'];
  statusId: Scalars['Int'];
  statusName: Scalars['String'];
  submitted: Scalars['Boolean'];
  technicalReviewAssigneeFirstName: Maybe<Scalars['String']>;
  technicalReviewAssigneeId: Maybe<Scalars['Int']>;
  technicalReviewAssigneeLastName: Maybe<Scalars['String']>;
  technicalReviewSubmitted: Maybe<Scalars['Int']>;
  technicalStatus: Maybe<TechnicalReviewStatus>;
  technicalTimeAllocation: Maybe<Scalars['Int']>;
  title: Scalars['String'];
};

export type ProposalWorkflow = {
  description: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  proposalWorkflowConnectionGroups: Array<ProposalWorkflowConnectionGroup>;
};

export type ProposalWorkflowConnection = {
  droppableGroupId: Scalars['String'];
  id: Scalars['Int'];
  nextProposalStatusId: Maybe<Scalars['Int']>;
  prevProposalStatusId: Maybe<Scalars['Int']>;
  proposalStatus: ProposalStatus;
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  statusChangingEvents: Maybe<Array<StatusChangingEvent>>;
};

export type ProposalWorkflowConnectionGroup = {
  connections: Array<ProposalWorkflowConnection>;
  groupId: Scalars['String'];
  parentGroupId: Maybe<Scalars['String']>;
};

export type ProposalWorkflowConnectionResponseWrap = {
  proposalWorkflowConnection: Maybe<ProposalWorkflowConnection>;
  rejection: Maybe<Rejection>;
};

export type ProposalWorkflowResponseWrap = {
  proposalWorkflow: Maybe<ProposalWorkflow>;
  rejection: Maybe<Rejection>;
};

export type ProposalsFilter = {
  callId?: InputMaybe<Scalars['Int']>;
  instrumentId?: InputMaybe<Scalars['Int']>;
  proposalStatusId?: InputMaybe<Scalars['Int']>;
  questionFilter?: InputMaybe<QuestionFilterInput>;
  questionaryIds?: InputMaybe<Array<Scalars['Int']>>;
  referenceNumbers?: InputMaybe<Array<Scalars['String']>>;
  reviewer?: InputMaybe<ReviewerFilter>;
  shortCodes?: InputMaybe<Array<Scalars['String']>>;
  text?: InputMaybe<Scalars['String']>;
};

export type ProposalsQueryResult = {
  proposals: Array<Proposal>;
  totalCount: Scalars['Int'];
};

export type ProposalsResponseWrap = {
  proposals: Maybe<Array<Proposal>>;
  rejection: Maybe<Rejection>;
};

export type ProposalsViewQueryResult = {
  proposalViews: Array<ProposalView>;
  totalCount: Scalars['Int'];
};

export type ProposalsViewResult = {
  proposals: Array<ProposalView>;
  totalCount: Scalars['Int'];
};

export type Quantity = {
  id: Scalars['String'];
};

export type QueriesAndMutations = {
  mutations: Array<Scalars['String']>;
  queries: Array<Scalars['String']>;
};

export type Query = {
  _entities: Array<Maybe<_Entity>>;
  _service: _Service;
  accessTokenAndPermissions: Maybe<PermissionsWithAccessToken>;
  activeTemplateId: Maybe<Scalars['Int']>;
  allAccessTokensAndPermissions: Maybe<Array<PermissionsWithAccessToken>>;
  basicUserDetails: Maybe<BasicUserDetails>;
  basicUserDetailsByEmail: Maybe<BasicUserDetails>;
  blankQuestionary: Questionary;
  blankQuestionarySteps: Maybe<Array<QuestionaryStep>>;
  call: Maybe<Call>;
  calls: Maybe<Array<Call>>;
  callsByInstrumentScientist: Maybe<Array<Call>>;
  checkEmailExist: Maybe<Scalars['Boolean']>;
  checkToken: TokenResult;
  countries: Maybe<Array<Entry>>;
  esi: Maybe<ExperimentSafetyInput>;
  eventLogs: Maybe<Array<EventLog>>;
  factoryVersion: Scalars['String'];
  features: Array<Feature>;
  feedback: Maybe<Feedback>;
  feedbacks: Array<Feedback>;
  fileMetadata: Maybe<FileMetadata>;
  filesMetadata: Array<FileMetadata>;
  genericTemplate: Maybe<GenericTemplate>;
  genericTemplates: Maybe<Array<GenericTemplate>>;
  getOrcIDInformation: Maybe<OrcIdInformation>;
  getPageContent: Maybe<Scalars['String']>;
  institutions: Maybe<Array<Institution>>;
  instrument: Maybe<Instrument>;
  instrumentScientistHasAccess: Maybe<Scalars['Boolean']>;
  instrumentScientistHasInstrument: Maybe<Scalars['Boolean']>;
  instrumentScientistProposals: Maybe<ProposalsViewResult>;
  instruments: Maybe<InstrumentsQueryResult>;
  instrumentsBySep: Maybe<Array<InstrumentWithAvailabilityTime>>;
  isNaturalKeyPresent: Maybe<Scalars['Boolean']>;
  me: Maybe<User>;
  myShipments: Maybe<Array<Shipment>>;
  myVisits: Array<Visit>;
  nationalities: Maybe<Array<Entry>>;
  pdfTemplate: Maybe<PdfTemplate>;
  pdfTemplates: Maybe<Array<PdfTemplate>>;
  predefinedMessage: Maybe<PredefinedMessage>;
  predefinedMessages: Array<PredefinedMessage>;
  previousCollaborators: Maybe<UserQueryResult>;
  proposal: Maybe<Proposal>;
  proposalById: Maybe<Proposal>;
  proposalEvents: Maybe<Array<ProposalEvent>>;
  proposalReviews: Maybe<Array<Review>>;
  proposalStatus: Maybe<ProposalStatus>;
  proposalStatuses: Maybe<Array<ProposalStatus>>;
  proposalTemplates: Maybe<Array<ProposalTemplate>>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  proposalWorkflows: Maybe<Array<ProposalWorkflow>>;
  proposals: Maybe<ProposalsQueryResult>;
  proposalsView: Maybe<ProposalsViewQueryResult>;
  quantities: Array<Quantity>;
  queriesAndMutations: Maybe<QueriesAndMutations>;
  questionByNaturalKey: Question;
  questionary: Maybe<Questionary>;
  questions: Array<QuestionWithUsage>;
  review: Maybe<Review>;
  roles: Maybe<Array<Role>>;
  sample: Maybe<Sample>;
  sampleEsi: Maybe<SampleExperimentSafetyInput>;
  samples: Maybe<Array<Sample>>;
  samplesByCallId: Maybe<Array<Sample>>;
  scheduledEventCore: Maybe<ScheduledEventCore>;
  scheduledEventsCore: Array<ScheduledEventCore>;
  sep: Maybe<Sep>;
  sepMembers: Maybe<Array<SepReviewer>>;
  sepProposal: Maybe<SepProposal>;
  sepProposals: Maybe<Array<SepProposal>>;
  sepProposalsByInstrument: Maybe<Array<SepProposal>>;
  sepReviewers: Maybe<Array<SepReviewer>>;
  seps: Maybe<SePsQueryResult>;
  settings: Array<Settings>;
  shipment: Maybe<Shipment>;
  shipments: Maybe<Array<Shipment>>;
  template: Maybe<Template>;
  templateCategories: Maybe<Array<TemplateCategory>>;
  templates: Maybe<Array<Template>>;
  units: Maybe<Array<Unit>>;
  unitsAsJson: Maybe<Scalars['String']>;
  user: Maybe<User>;
  userHasAccessToProposal: Maybe<Scalars['Boolean']>;
  userInstruments: Maybe<InstrumentsQueryResult>;
  users: Maybe<UserQueryResult>;
  version: Scalars['String'];
  visit: Maybe<Visit>;
  visitRegistration: Maybe<VisitRegistration>;
  visits: Array<Visit>;
};


export type Query_EntitiesArgs = {
  representations: Array<Scalars['_Any']>;
};


export type QueryAccessTokenAndPermissionsArgs = {
  accessTokenId: Scalars['String'];
};


export type QueryActiveTemplateIdArgs = {
  templateGroupId: TemplateGroupId;
};


export type QueryBasicUserDetailsArgs = {
  userId: Scalars['Int'];
};


export type QueryBasicUserDetailsByEmailArgs = {
  email: Scalars['String'];
  role?: InputMaybe<UserRole>;
};


export type QueryBlankQuestionaryArgs = {
  templateId: Scalars['Int'];
};


export type QueryBlankQuestionaryStepsArgs = {
  templateId: Scalars['Int'];
};


export type QueryCallArgs = {
  callId: Scalars['Int'];
};


export type QueryCallsArgs = {
  filter?: InputMaybe<CallsFilter>;
};


export type QueryCallsByInstrumentScientistArgs = {
  scientistId: Scalars['Int'];
};


export type QueryCheckEmailExistArgs = {
  email: Scalars['String'];
};


export type QueryCheckTokenArgs = {
  token: Scalars['String'];
};


export type QueryEsiArgs = {
  esiId: Scalars['Int'];
};


export type QueryEventLogsArgs = {
  changedObjectId: Scalars['String'];
  eventType: Scalars['String'];
};


export type QueryFeedbackArgs = {
  feedbackId: Scalars['Int'];
};


export type QueryFeedbacksArgs = {
  filter?: InputMaybe<FeedbacksFilter>;
};


export type QueryFileMetadataArgs = {
  fileId: Scalars['String'];
};


export type QueryFilesMetadataArgs = {
  filter: FilesMetadataFilter;
};


export type QueryGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
};


export type QueryGenericTemplatesArgs = {
  filter?: InputMaybe<GenericTemplatesFilter>;
};


export type QueryGetOrcIdInformationArgs = {
  authorizationCode: Scalars['String'];
};


export type QueryGetPageContentArgs = {
  pageId: PageName;
};


export type QueryInstitutionsArgs = {
  filter?: InputMaybe<InstitutionsFilter>;
};


export type QueryInstrumentArgs = {
  instrumentId: Scalars['Int'];
};


export type QueryInstrumentScientistHasAccessArgs = {
  instrumentId: Scalars['Int'];
  proposalPk: Scalars['Int'];
};


export type QueryInstrumentScientistHasInstrumentArgs = {
  instrumentId: Scalars['Int'];
};


export type QueryInstrumentScientistProposalsArgs = {
  filter?: InputMaybe<ProposalsFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryInstrumentsArgs = {
  callIds?: InputMaybe<Array<Scalars['Int']>>;
};


export type QueryInstrumentsBySepArgs = {
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QueryIsNaturalKeyPresentArgs = {
  naturalKey: Scalars['String'];
};


export type QueryPdfTemplateArgs = {
  pdfTemplateId: Scalars['Int'];
};


export type QueryPdfTemplatesArgs = {
  filter?: InputMaybe<PdfTemplatesFilter>;
};


export type QueryPredefinedMessageArgs = {
  predefinedMessageId: Scalars['Int'];
};


export type QueryPredefinedMessagesArgs = {
  filter?: InputMaybe<PredefinedMessagesFilter>;
};


export type QueryPreviousCollaboratorsArgs = {
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  subtractUsers?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  userId: Scalars['Int'];
  userRole?: InputMaybe<UserRole>;
};


export type QueryProposalArgs = {
  primaryKey: Scalars['Int'];
};


export type QueryProposalByIdArgs = {
  proposalId: Scalars['String'];
};


export type QueryProposalReviewsArgs = {
  proposalPk: Scalars['Int'];
};


export type QueryProposalStatusArgs = {
  proposalStatusId: Scalars['Int'];
};


export type QueryProposalTemplatesArgs = {
  filter?: InputMaybe<ProposalTemplatesFilter>;
};


export type QueryProposalWorkflowArgs = {
  proposalWorkflowId: Scalars['Int'];
};


export type QueryProposalsArgs = {
  filter?: InputMaybe<ProposalsFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryProposalsViewArgs = {
  filter?: InputMaybe<ProposalsFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  searchText?: InputMaybe<Scalars['String']>;
  sortDirection?: InputMaybe<Scalars['String']>;
  sortField?: InputMaybe<Scalars['String']>;
};


export type QueryQuestionByNaturalKeyArgs = {
  naturalKey: Scalars['String'];
};


export type QueryQuestionaryArgs = {
  questionaryId: Scalars['Int'];
};


export type QueryQuestionsArgs = {
  filter?: InputMaybe<QuestionsFilter>;
};


export type QueryReviewArgs = {
  reviewId: Scalars['Int'];
};


export type QuerySampleArgs = {
  sampleId: Scalars['Int'];
};


export type QuerySampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type QuerySamplesArgs = {
  filter?: InputMaybe<SamplesFilter>;
};


export type QuerySamplesByCallIdArgs = {
  callId: Scalars['Int'];
};


export type QueryScheduledEventCoreArgs = {
  scheduledEventId: Scalars['Int'];
};


export type QueryScheduledEventsCoreArgs = {
  filter?: InputMaybe<ScheduledEventsCoreFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QuerySepArgs = {
  id: Scalars['Int'];
};


export type QuerySepMembersArgs = {
  sepId: Scalars['Int'];
};


export type QuerySepProposalArgs = {
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QuerySepProposalsArgs = {
  callId?: InputMaybe<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type QuerySepProposalsByInstrumentArgs = {
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QuerySepReviewersArgs = {
  sepId: Scalars['Int'];
};


export type QuerySepsArgs = {
  filter?: InputMaybe<SePsFilter>;
};


export type QueryShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type QueryShipmentsArgs = {
  filter?: InputMaybe<ShipmentsFilter>;
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int'];
};


export type QueryTemplatesArgs = {
  filter?: InputMaybe<TemplatesFilter>;
};


export type QueryUserArgs = {
  userId: Scalars['Int'];
};


export type QueryUserHasAccessToProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type QueryUsersArgs = {
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
  subtractUsers?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  userRole?: InputMaybe<UserRole>;
};


export type QueryVisitArgs = {
  visitId: Scalars['Int'];
};


export type QueryVisitRegistrationArgs = {
  visitId: Scalars['Int'];
};


export type QueryVisitsArgs = {
  filter?: InputMaybe<VisitsFilter>;
};

export type Question = {
  categoryId: TemplateCategoryId;
  config: FieldConfig;
  dataType: DataType;
  id: Scalars['String'];
  naturalKey: Scalars['String'];
  question: Scalars['String'];
};

export type QuestionComparison = {
  conflictResolutionStrategy: ConflictResolutionStrategy;
  existingQuestion: Maybe<Question>;
  newQuestion: Question;
  status: QuestionComparisonStatus;
};

export enum QuestionComparisonStatus {
  DIFFERENT = 'DIFFERENT',
  NEW = 'NEW',
  SAME = 'SAME'
}

export enum QuestionFilterCompareOperator {
  EQUALS = 'EQUALS',
  EXISTS = 'EXISTS',
  GREATER_THAN = 'GREATER_THAN',
  INCLUDES = 'INCLUDES',
  LESS_THAN = 'LESS_THAN'
}

export type QuestionFilterInput = {
  compareOperator: QuestionFilterCompareOperator;
  dataType: DataType;
  questionId: Scalars['String'];
  value: Scalars['String'];
};

export type QuestionResponseWrap = {
  question: Maybe<Question>;
  rejection: Maybe<Rejection>;
};

export type QuestionTemplateRelation = {
  config: FieldConfig;
  dependencies: Array<FieldDependency>;
  dependenciesOperator: Maybe<DependenciesLogicOperator>;
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
};

export type QuestionWithUsage = {
  answers: Array<AnswerBasic>;
  categoryId: TemplateCategoryId;
  config: FieldConfig;
  dataType: DataType;
  id: Scalars['String'];
  naturalKey: Scalars['String'];
  question: Scalars['String'];
  templates: Array<Template>;
};

export type Questionary = {
  created: Scalars['DateTime'];
  isCompleted: Scalars['Boolean'];
  questionaryId: Scalars['Int'];
  steps: Array<QuestionaryStep>;
  templateId: Scalars['Int'];
};

export type QuestionaryResponseWrap = {
  questionary: Maybe<Questionary>;
  rejection: Maybe<Rejection>;
};

export type QuestionaryStep = {
  fields: Array<Answer>;
  isCompleted: Scalars['Boolean'];
  topic: Topic;
};

export type QuestionaryStepResponseWrap = {
  questionaryStep: Maybe<QuestionaryStep>;
  rejection: Maybe<Rejection>;
};

export type QuestionsFilter = {
  category?: InputMaybe<TemplateCategoryId>;
  dataType?: InputMaybe<Array<DataType>>;
  excludeDataType?: InputMaybe<Array<DataType>>;
  questionIds?: InputMaybe<Array<Scalars['String']>>;
  text?: InputMaybe<Scalars['String']>;
};

export type Rejection = {
  context: Maybe<Scalars['String']>;
  exception: Maybe<Scalars['String']>;
  reason: Scalars['String'];
};

export type RemoveAssignedInstrumentFromCallInput = {
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
};

export type ReorderSepMeetingDecisionProposalsInput = {
  proposals: Array<ProposalPkWithRankOrder>;
};

export type Review = {
  comment: Maybe<Scalars['String']>;
  grade: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  proposal: Maybe<Proposal>;
  reviewer: Maybe<BasicUserDetails>;
  sepID: Scalars['Int'];
  status: ReviewStatus;
  userID: Scalars['Int'];
};

export type ReviewResponseWrap = {
  rejection: Maybe<Rejection>;
  review: Maybe<Review>;
};

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ReviewWithNextProposalStatus = {
  comment: Maybe<Scalars['String']>;
  grade: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  nextProposalStatus: Maybe<NextProposalStatus>;
  proposal: Maybe<Proposal>;
  reviewer: Maybe<BasicUserDetails>;
  sepID: Scalars['Int'];
  status: ReviewStatus;
  userID: Scalars['Int'];
};

export type ReviewWithNextStatusResponseWrap = {
  rejection: Maybe<Rejection>;
  review: Maybe<ReviewWithNextProposalStatus>;
};

export enum ReviewerFilter {
  ALL = 'ALL',
  ME = 'ME'
}

export type RichTextInputConfig = {
  max: Maybe<Scalars['Int']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type Role = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  title: Scalars['String'];
};

export type Sep = {
  active: Scalars['Boolean'];
  code: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Int'];
  numberRatingsRequired: Scalars['Float'];
  proposalCount: Scalars['Int'];
  sepChair: Maybe<BasicUserDetails>;
  sepChairProposalCount: Maybe<Scalars['Int']>;
  sepSecretary: Maybe<BasicUserDetails>;
  sepSecretaryProposalCount: Maybe<Scalars['Int']>;
};

export type SepAssignment = {
  dateAssigned: Scalars['DateTime'];
  dateReassigned: Maybe<Scalars['DateTime']>;
  emailSent: Scalars['Boolean'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  reassigned: Scalars['Boolean'];
  review: Maybe<Review>;
  role: Maybe<Role>;
  sepId: Scalars['Int'];
  sepMemberUserId: Maybe<Scalars['Int']>;
  user: Maybe<BasicUserDetails>;
};

export type SepProposal = {
  assignments: Maybe<Array<SepAssignment>>;
  dateAssigned: Scalars['DateTime'];
  instrumentSubmitted: Scalars['Boolean'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
  sepTimeAllocation: Maybe<Scalars['Int']>;
};

export type SepProposalResponseWrap = {
  rejection: Maybe<Rejection>;
  sepProposal: Maybe<SepProposal>;
};

export type SepResponseWrap = {
  rejection: Maybe<Rejection>;
  sep: Maybe<Sep>;
};

export type SepReviewer = {
  proposalsCount: Scalars['Int'];
  role: Maybe<Role>;
  sepId: Scalars['Int'];
  user: BasicUserDetails;
  userId: Scalars['Int'];
};

export type SePsFilter = {
  active?: InputMaybe<Scalars['Boolean']>;
  callIds?: InputMaybe<Array<Scalars['Int']>>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type SePsQueryResult = {
  seps: Array<Sep>;
  totalCount: Scalars['Int'];
};

export type Sample = {
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  isPostProposalSubmission: Scalars['Boolean'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  safetyComment: Scalars['String'];
  safetyStatus: SampleStatus;
  title: Scalars['String'];
};

export type SampleBasisConfig = {
  titlePlaceholder: Scalars['String'];
};

export type SampleDeclarationConfig = {
  addEntryButtonLabel: Scalars['String'];
  esiTemplateId: Maybe<Scalars['Int']>;
  maxEntries: Maybe<Scalars['Int']>;
  minEntries: Maybe<Scalars['Int']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  templateCategory: Scalars['String'];
  templateId: Maybe<Scalars['Int']>;
};

export type SampleEsiBasisConfig = {
  tooltip: Scalars['String'];
};

export type SampleEsiResponseWrap = {
  esi: Maybe<SampleExperimentSafetyInput>;
  rejection: Maybe<Rejection>;
};

export type SampleExperimentSafetyInput = {
  esiId: Scalars['Int'];
  isSubmitted: Scalars['Boolean'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  sample: Sample;
  sampleId: Scalars['Int'];
};

export type SampleResponseWrap = {
  rejection: Maybe<Rejection>;
  sample: Maybe<Sample>;
};

export enum SampleStatus {
  ELEVATED_RISK = 'ELEVATED_RISK',
  HIGH_RISK = 'HIGH_RISK',
  LOW_RISK = 'LOW_RISK',
  PENDING_EVALUATION = 'PENDING_EVALUATION'
}

export type SamplesFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  questionId?: InputMaybe<Scalars['String']>;
  questionaryIds?: InputMaybe<Array<Scalars['Int']>>;
  sampleIds?: InputMaybe<Array<Scalars['Int']>>;
  status?: InputMaybe<SampleStatus>;
  title?: InputMaybe<Scalars['String']>;
  visitId?: InputMaybe<Scalars['Int']>;
};

export type SaveSepMeetingDecisionInput = {
  commentForManagement?: InputMaybe<Scalars['String']>;
  commentForUser?: InputMaybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  rankOrder?: InputMaybe<Scalars['Int']>;
  recommendation?: InputMaybe<ProposalEndStatus>;
  submitted?: InputMaybe<Scalars['Boolean']>;
};

export enum ScheduledEventBookingType {
  EQUIPMENT = 'EQUIPMENT',
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  USER_OPERATIONS = 'USER_OPERATIONS'
}

export type ScheduledEventCore = {
  bookingType: ScheduledEventBookingType;
  endsAt: Scalars['DateTime'];
  esi: Maybe<ExperimentSafetyInput>;
  feedback: Maybe<Feedback>;
  feedbackRequests: Array<FeedbackRequest>;
  id: Scalars['Int'];
  localContact: Maybe<BasicUserDetails>;
  localContactId: Maybe<Scalars['Int']>;
  proposal: Proposal;
  proposalPk: Maybe<Scalars['Int']>;
  shipments: Array<Shipment>;
  startsAt: Scalars['DateTime'];
  status: ProposalBookingStatusCore;
  visit: Maybe<Visit>;
};

export type ScheduledEventsCoreFilter = {
  callId?: InputMaybe<Scalars['Int']>;
  endsAfter?: InputMaybe<Scalars['DateTime']>;
  endsBefore?: InputMaybe<Scalars['DateTime']>;
  instrumentId?: InputMaybe<Scalars['Int']>;
  overlaps?: InputMaybe<TimeSpan>;
  startsAfter?: InputMaybe<Scalars['DateTime']>;
  startsBefore?: InputMaybe<Scalars['DateTime']>;
};

export type SelectionFromOptionsConfig = {
  isMultipleSelect: Scalars['Boolean'];
  options: Array<Scalars['String']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  variant: Scalars['String'];
};

export type SepMeetingDecision = {
  commentForManagement: Maybe<Scalars['String']>;
  commentForUser: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  rankOrder: Maybe<Scalars['Int']>;
  recommendation: Maybe<ProposalEndStatus>;
  submitted: Scalars['Boolean'];
  submittedBy: Maybe<Scalars['Int']>;
};

export type SepMeetingDecisionResponseWrap = {
  rejection: Maybe<Rejection>;
  sepMeetingDecision: Maybe<SepMeetingDecision>;
};

export type Settings = {
  description: Maybe<Scalars['String']>;
  id: SettingsId;
  settingsValue: Maybe<Scalars['String']>;
};

export enum SettingsId {
  DATE_FORMAT = 'DATE_FORMAT',
  DATE_TIME_FORMAT = 'DATE_TIME_FORMAT',
  DEFAULT_INST_SCI_REVIEWER_FILTER = 'DEFAULT_INST_SCI_REVIEWER_FILTER',
  DEFAULT_INST_SCI_STATUS_FILTER = 'DEFAULT_INST_SCI_STATUS_FILTER',
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
  FEEDBACK_EXHAUST_DAYS = 'FEEDBACK_EXHAUST_DAYS',
  FEEDBACK_FREQUENCY_DAYS = 'FEEDBACK_FREQUENCY_DAYS',
  FEEDBACK_MAX_REQUESTS = 'FEEDBACK_MAX_REQUESTS',
  HEADER_LOGO_FILENAME = 'HEADER_LOGO_FILENAME',
  PALETTE_ERROR_MAIN = 'PALETTE_ERROR_MAIN',
  PALETTE_INFO_MAIN = 'PALETTE_INFO_MAIN',
  PALETTE_PRIMARY_ACCENT = 'PALETTE_PRIMARY_ACCENT',
  PALETTE_PRIMARY_CONTRAST = 'PALETTE_PRIMARY_CONTRAST',
  PALETTE_PRIMARY_DARK = 'PALETTE_PRIMARY_DARK',
  PALETTE_PRIMARY_LIGHT = 'PALETTE_PRIMARY_LIGHT',
  PALETTE_PRIMARY_MAIN = 'PALETTE_PRIMARY_MAIN',
  PALETTE_SECONDARY_CONTRAST = 'PALETTE_SECONDARY_CONTRAST',
  PALETTE_SECONDARY_DARK = 'PALETTE_SECONDARY_DARK',
  PALETTE_SECONDARY_LIGHT = 'PALETTE_SECONDARY_LIGHT',
  PALETTE_SECONDARY_MAIN = 'PALETTE_SECONDARY_MAIN',
  PALETTE_SUCCESS_MAIN = 'PALETTE_SUCCESS_MAIN',
  PALETTE_WARNING_MAIN = 'PALETTE_WARNING_MAIN',
  PROFILE_PAGE_LINK = 'PROFILE_PAGE_LINK',
  TIMEZONE = 'TIMEZONE'
}

export type SettingsResponseWrap = {
  rejection: Maybe<Rejection>;
  settings: Maybe<Settings>;
};

export type Shipment = {
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  externalRef: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  samples: Array<Sample>;
  scheduledEventId: Scalars['Int'];
  status: ShipmentStatus;
  title: Scalars['String'];
};

export type ShipmentBasisConfig = {
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type ShipmentResponseWrap = {
  rejection: Maybe<Rejection>;
  shipment: Maybe<Shipment>;
};

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ShipmentsFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  externalRef?: InputMaybe<Scalars['String']>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  questionaryIds?: InputMaybe<Array<Scalars['Int']>>;
  scheduledEventId?: InputMaybe<Scalars['Int']>;
  shipmentIds?: InputMaybe<Array<Scalars['Int']>>;
  status?: InputMaybe<ShipmentStatus>;
  title?: InputMaybe<Scalars['String']>;
};

export type StatusChangingEvent = {
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvent: Scalars['String'];
  statusChangingEventId: Scalars['Int'];
};

export type SubTemplateConfig = {
  addEntryButtonLabel: Scalars['String'];
  maxEntries: Maybe<Scalars['Int']>;
  minEntries: Maybe<Scalars['Int']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  templateCategory: Scalars['String'];
  templateId: Maybe<Scalars['Int']>;
};

export type SubmitProposalsReviewInput = {
  proposals: Array<ProposalPkWithReviewId>;
};

export type SubmitTechnicalReviewInput = {
  comment?: InputMaybe<Scalars['String']>;
  files?: InputMaybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  publicComment?: InputMaybe<Scalars['String']>;
  reviewerId: Scalars['Int'];
  status?: InputMaybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  timeAllocation?: InputMaybe<Scalars['Int']>;
};

export type SubmitTechnicalReviewsInput = {
  technicalReviews: Array<SubmitTechnicalReviewInput>;
};

export type SuccessResponseWrap = {
  isSuccess: Maybe<Scalars['Boolean']>;
  rejection: Maybe<Rejection>;
};

export type TechnicalReview = {
  comment: Maybe<Scalars['String']>;
  files: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  proposal: Maybe<Proposal>;
  proposalPk: Scalars['Int'];
  publicComment: Maybe<Scalars['String']>;
  reviewer: Maybe<BasicUserDetails>;
  reviewerId: Scalars['Int'];
  status: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  technicalReviewAssignee: Maybe<BasicUserDetails>;
  technicalReviewAssigneeId: Maybe<Scalars['Int']>;
  timeAllocation: Maybe<Scalars['Int']>;
};

export type TechnicalReviewResponseWrap = {
  rejection: Maybe<Rejection>;
  technicalReview: Maybe<TechnicalReview>;
};

export enum TechnicalReviewStatus {
  FEASIBLE = 'FEASIBLE',
  PARTIALLY_FEASIBLE = 'PARTIALLY_FEASIBLE',
  UNFEASIBLE = 'UNFEASIBLE'
}

export type TechnicalReviewsResponseWrap = {
  rejection: Maybe<Rejection>;
  technicalReviews: Maybe<Array<TechnicalReview>>;
};

export type Template = {
  complementaryQuestions: Array<Question>;
  description: Maybe<Scalars['String']>;
  group: TemplateGroup;
  groupId: TemplateGroupId;
  isArchived: Scalars['Boolean'];
  json: Scalars['String'];
  name: Scalars['String'];
  pdfTemplate: Maybe<PdfTemplate>;
  questionaryCount: Scalars['Int'];
  steps: Array<TemplateStep>;
  templateId: Scalars['Int'];
};

export type TemplateCategory = {
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
};

export enum TemplateCategoryId {
  FEEDBACK = 'FEEDBACK',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  PDF = 'PDF',
  PROPOSAL_QUESTIONARY = 'PROPOSAL_QUESTIONARY',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SHIPMENT_DECLARATION = 'SHIPMENT_DECLARATION',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION'
}

export type TemplateGroup = {
  categoryId: TemplateCategoryId;
  groupId: TemplateGroupId;
};

export enum TemplateGroupId {
  FEEDBACK = 'FEEDBACK',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  PDF_TEMPLATE = 'PDF_TEMPLATE',
  PROPOSAL = 'PROPOSAL',
  PROPOSAL_ESI = 'PROPOSAL_ESI',
  SAMPLE = 'SAMPLE',
  SAMPLE_ESI = 'SAMPLE_ESI',
  SHIPMENT = 'SHIPMENT',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION'
}

export type TemplateResponseWrap = {
  rejection: Maybe<Rejection>;
  template: Maybe<Template>;
};

export type TemplateStep = {
  fields: Array<QuestionTemplateRelation>;
  topic: Topic;
};

export type TemplateValidation = {
  exportDate: Scalars['DateTime'];
  json: Scalars['String'];
  validationData: TemplateValidationData;
  version: Scalars['String'];
};

export type TemplateValidationData = {
  errors: Array<Scalars['String']>;
  isValid: Scalars['Boolean'];
  questionComparisons: Array<QuestionComparison>;
  subTemplateValidationData: Array<TemplateValidationData>;
};

export type TemplateValidationWrap = {
  rejection: Maybe<Rejection>;
  validationResult: Maybe<TemplateValidation>;
};

export type TemplatesFilter = {
  group?: InputMaybe<TemplateGroupId>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  templateIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type TextInputConfig = {
  htmlQuestion: Maybe<Scalars['String']>;
  isCounterHidden: Scalars['Boolean'];
  isHtmlQuestion: Scalars['Boolean'];
  max: Maybe<Scalars['Int']>;
  min: Maybe<Scalars['Int']>;
  multiline: Scalars['Boolean'];
  placeholder: Scalars['String'];
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type TimeSpan = {
  from?: InputMaybe<Scalars['DateTime']>;
  to?: InputMaybe<Scalars['DateTime']>;
};

export type TokenPayloadUnion = AuthJwtApiTokenPayload | AuthJwtPayload;

export type TokenResponseWrap = {
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type TokenResult = {
  isValid: Scalars['Boolean'];
  payload: Maybe<TokenPayloadUnion>;
};

export type Topic = {
  id: Scalars['Int'];
  isEnabled: Scalars['Boolean'];
  sortOrder: Scalars['Int'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};

export enum TrainingStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  NONE = 'NONE'
}

export type Unit = {
  id: Scalars['String'];
  quantity: Scalars['String'];
  siConversionFormula: Scalars['String'];
  symbol: Scalars['String'];
  unit: Scalars['String'];
};

export type UnitComparison = {
  conflictResolutionStrategy: ConflictResolutionStrategy;
  existingUnit: Maybe<Unit>;
  newUnit: Unit;
  status: QuestionComparisonStatus;
};

export type UnitResponseWrap = {
  rejection: Maybe<Rejection>;
  unit: Maybe<Unit>;
};

export type UnitsImportWithValidation = {
  errors: Array<Scalars['String']>;
  exportDate: Scalars['DateTime'];
  isValid: Scalars['Boolean'];
  json: Scalars['String'];
  unitComparisons: Array<UnitComparison>;
  version: Scalars['String'];
};

export type UnitsImportWithValidationWrap = {
  rejection: Maybe<Rejection>;
  validationResult: Maybe<UnitsImportWithValidation>;
};

export type UnitsResponseWrap = {
  rejection: Maybe<Rejection>;
  units: Maybe<Array<Unit>>;
};

export type UpdateAnswerResponseWrap = {
  questionId: Maybe<Scalars['String']>;
  rejection: Maybe<Rejection>;
};

export type UpdateApiAccessTokenInput = {
  accessPermissions: Scalars['String'];
  accessTokenId: Scalars['String'];
  name: Scalars['String'];
};

export type UpdateCallInput = {
  allocationTimeUnit: AllocationTimeUnits;
  callEnded?: InputMaybe<Scalars['Int']>;
  callReviewEnded?: InputMaybe<Scalars['Int']>;
  callSEPReviewEnded?: InputMaybe<Scalars['Int']>;
  cycleComment: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  endCall: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  endSEPReview?: InputMaybe<Scalars['DateTime']>;
  esiTemplateId?: InputMaybe<Scalars['Int']>;
  id: Scalars['Int'];
  pdfTemplateId?: InputMaybe<Scalars['Int']>;
  proposalSequence?: InputMaybe<Scalars['Int']>;
  proposalWorkflowId: Scalars['Int'];
  referenceNumberFormat?: InputMaybe<Scalars['String']>;
  seps?: InputMaybe<Array<Scalars['Int']>>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview?: InputMaybe<Scalars['DateTime']>;
  submissionMessage?: InputMaybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  templateId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
};

export type UpdateFeaturesInput = {
  action: FeatureUpdateAction;
  featureIds: Array<FeatureId>;
};

export type UpdatePredefinedMessageInput = {
  id: Scalars['Int'];
  key: Scalars['String'];
  message: Scalars['String'];
  title: Scalars['String'];
};

export type UpdateProposalStatusInput = {
  description: Scalars['String'];
  id: Scalars['Int'];
  isDefault?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  shortCode?: InputMaybe<Scalars['String']>;
};

export type UpdateProposalWorkflowInput = {
  description: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type UpdateSettingsInput = {
  description?: InputMaybe<Scalars['String']>;
  settingsId: SettingsId;
  settingsValue?: InputMaybe<Scalars['String']>;
};

export type User = {
  birthdate: Scalars['DateTime'];
  created: Scalars['String'];
  department: Scalars['String'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  firstname: Scalars['String'];
  gender: Scalars['String'];
  id: Scalars['Int'];
  instruments: Array<Instrument>;
  lastname: Scalars['String'];
  middlename: Maybe<Scalars['String']>;
  nationality: Maybe<Scalars['Int']>;
  orcid: Scalars['String'];
  organisation: Scalars['Int'];
  placeholder: Scalars['Boolean'];
  position: Scalars['String'];
  preferredname: Maybe<Scalars['String']>;
  proposals: Array<Proposal>;
  refreshToken: Scalars['String'];
  reviews: Array<Review>;
  roles: Array<Role>;
  seps: Array<Sep>;
  telephone: Scalars['String'];
  telephone_alt: Maybe<Scalars['String']>;
  updated: Scalars['String'];
  user_title: Scalars['String'];
  username: Scalars['String'];
};


export type UserProposalsArgs = {
  filter?: InputMaybe<UserProposalsFilter>;
};


export type UserReviewsArgs = {
  callId?: InputMaybe<Scalars['Int']>;
  instrumentId?: InputMaybe<Scalars['Int']>;
  reviewer?: InputMaybe<ReviewerFilter>;
  status?: InputMaybe<ReviewStatus>;
};

export type UserProposalsFilter = {
  finalStatus?: InputMaybe<ProposalEndStatus>;
  instrumentId?: InputMaybe<Scalars['Int']>;
  managementDecisionSubmitted?: InputMaybe<Scalars['Boolean']>;
};

export type UserQueryResult = {
  totalCount: Scalars['Int'];
  users: Array<BasicUserDetails>;
};

export type UserResponseWrap = {
  rejection: Maybe<Rejection>;
  user: Maybe<User>;
};

export enum UserRole {
  INSTRUMENT_SCIENTIST = 'INSTRUMENT_SCIENTIST',
  SAMPLE_SAFETY_REVIEWER = 'SAMPLE_SAFETY_REVIEWER',
  SEP_CHAIR = 'SEP_CHAIR',
  SEP_REVIEWER = 'SEP_REVIEWER',
  SEP_SECRETARY = 'SEP_SECRETARY',
  USER = 'USER',
  USER_OFFICER = 'USER_OFFICER'
}

export type Visit = {
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  registrations: Array<VisitRegistration>;
  samples: Array<Sample>;
  scheduledEventId: Scalars['Int'];
  status: VisitStatus;
  teamLead: BasicUserDetails;
  teamLeadUserId: Scalars['Int'];
};

export type VisitBasisConfig = {
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type VisitRegistration = {
  endsAt: Maybe<Scalars['DateTime']>;
  isRegistrationSubmitted: Scalars['Boolean'];
  questionary: Questionary;
  registrationQuestionaryId: Maybe<Scalars['Int']>;
  startsAt: Maybe<Scalars['DateTime']>;
  trainingExpiryDate: Maybe<Scalars['DateTime']>;
  trainingStatus: TrainingStatus;
  user: Maybe<BasicUserDetails>;
  userId: Scalars['Int'];
  visitId: Scalars['Int'];
};

export type VisitRegistrationResponseWrap = {
  registration: Maybe<VisitRegistration>;
  rejection: Maybe<Rejection>;
};

export type VisitResponseWrap = {
  rejection: Maybe<Rejection>;
  visit: Maybe<Visit>;
};

export enum VisitStatus {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type VisitsFilter = {
  creatorId?: InputMaybe<Scalars['Int']>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  scheduledEventId?: InputMaybe<Scalars['Int']>;
};

export type _Entity = BasicUserDetails | Call | Instrument | Proposal | Rejection | User;

export type _Service = {
  /** The sdl representing the federated service capabilities. Includes federation directives, removes federation types, and includes rest of full schema after schema directives have been applied */
  sdl: Maybe<Scalars['String']>;
};

export type AssignProposalsToSepMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  sepId: Scalars['Int'];
}>;


export type AssignProposalsToSepMutation = { assignProposalsToSep: { rejection: { reason: string, context: string | null, exception: string | null } | null, nextProposalStatus: { id: number | null, shortCode: string | null, name: string | null } | null } };

export type AssignReviewersToSepMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type AssignReviewersToSepMutation = { assignReviewersToSEP: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type AssignChairOrSecretaryMutationVariables = Exact<{
  assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSepInput;
}>;


export type AssignChairOrSecretaryMutation = { assignChairOrSecretary: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type AssignSepReviewersToProposalMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type AssignSepReviewersToProposalMutation = { assignSepReviewersToProposal: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type CreateSepMutationVariables = Exact<{
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type CreateSepMutation = { createSEP: { sep: { id: number, code: string, description: string, numberRatingsRequired: number, active: boolean, sepChairProposalCount: number | null, sepSecretaryProposalCount: number | null, proposalCount: number, sepChair: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, sepSecretary: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteSepMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteSepMutation = { deleteSEP: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type SepFragment = { id: number, code: string, description: string, numberRatingsRequired: number, active: boolean, sepChairProposalCount: number | null, sepSecretaryProposalCount: number | null, proposalCount: number, sepChair: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, sepSecretary: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null };

export type SepMeetingDecisionFragment = { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null };

export type GetInstrumentsBySepQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetInstrumentsBySepQuery = { instrumentsBySep: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }> | null };

export type GetUserSepsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserSepsQuery = { me: { seps: Array<{ id: number, code: string, description: string, numberRatingsRequired: number, active: boolean, sepChairProposalCount: number | null, sepSecretaryProposalCount: number | null, proposalCount: number, sepChair: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, sepSecretary: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }> } | null };

export type GetSepQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSepQuery = { sep: { id: number, code: string, description: string, numberRatingsRequired: number, active: boolean, sepChairProposalCount: number | null, sepSecretaryProposalCount: number | null, proposalCount: number, sepChair: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, sepSecretary: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null } | null };

export type GetSepMembersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepMembersQuery = { sepMembers: Array<{ userId: number, sepId: number, role: { id: number, shortCode: string, title: string } | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } }> | null };

export type GetSepProposalQueryVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type GetSepProposalQuery = { sepProposal: { proposalPk: number, sepId: number, sepTimeAllocation: number | null, instrumentSubmitted: boolean, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, questionary: { questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, technicalReview: { id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, reviewer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null } | null, reviews: Array<{ id: number, grade: number | null, comment: string | null, status: ReviewStatus, userID: number, sepID: number, reviewer: { firstname: string, lastname: string, id: number } | null }> | null, instrument: { id: number, name: string, shortCode: string } | null, call: { id: number, shortCode: string, allocationTimeUnit: AllocationTimeUnits } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null }, assignments: Array<{ proposalPk: number, sepMemberUserId: number | null, dateAssigned: any, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, role: { id: number, shortCode: string, title: string } | null, review: { id: number, status: ReviewStatus, comment: string | null, grade: number | null, sepID: number } | null }> | null } | null };

export type GetSepProposalsQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId?: InputMaybe<Scalars['Int']>;
}>;


export type GetSepProposalsQuery = { sepProposals: Array<{ proposalPk: number, dateAssigned: any, sepId: number, sepTimeAllocation: number | null, proposal: { title: string, primaryKey: number, proposalId: string, proposer: { id: number, organizationId: number } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, users: Array<{ id: number, organizationId: number }> }, assignments: Array<{ proposalPk: number, sepMemberUserId: number | null, dateAssigned: any, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, role: { id: number, shortCode: string, title: string } | null, review: { id: number, status: ReviewStatus, comment: string | null, grade: number | null, sepID: number } | null }> | null }> | null };

export type SepProposalsByInstrumentQueryVariables = Exact<{
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type SepProposalsByInstrumentQuery = { sepProposalsByInstrument: Array<{ sepTimeAllocation: number | null, proposal: { primaryKey: number, title: string, proposalId: string, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null, reviews: Array<{ id: number, comment: string | null, grade: number | null, status: ReviewStatus }> | null, technicalReview: { publicComment: string | null, status: TechnicalReviewStatus | null, timeAllocation: number | null } | null }, assignments: Array<{ sepMemberUserId: number | null }> | null }> | null };

export type GetSepReviewersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepReviewersQuery = { sepReviewers: Array<{ userId: number, sepId: number, proposalsCount: number, role: { id: number, shortCode: string, title: string } | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } }> | null };

export type GetSePsQueryVariables = Exact<{
  filter?: InputMaybe<SePsFilter>;
}>;


export type GetSePsQuery = { seps: { totalCount: number, seps: Array<{ id: number, code: string, description: string, numberRatingsRequired: number, active: boolean, sepChairProposalCount: number | null, sepSecretaryProposalCount: number | null, proposalCount: number, sepChair: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, sepSecretary: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }> } | null };

export type RemoveProposalsFromSepMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveProposalsFromSepMutation = { removeProposalsFromSep: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type RemoveMemberFromSepMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  roleId: UserRole;
}>;


export type RemoveMemberFromSepMutation = { removeMemberFromSep: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type RemoveMemberFromSepProposalMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type RemoveMemberFromSepProposalMutation = { removeMemberFromSEPProposal: { rejection: { reason: string, context: string | null, exception: string | null } | null, sep: { id: number } | null } };

export type ReorderSepMeetingDecisionProposalsMutationVariables = Exact<{
  reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput;
}>;


export type ReorderSepMeetingDecisionProposalsMutation = { reorderSepMeetingDecisionProposals: { rejection: { reason: string, context: string | null, exception: string | null } | null, sepMeetingDecision: { proposalPk: number } | null } };

export type SaveSepMeetingDecisionMutationVariables = Exact<{
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
}>;


export type SaveSepMeetingDecisionMutation = { saveSepMeetingDecision: { rejection: { reason: string, context: string | null, exception: string | null } | null, sepMeetingDecision: { proposalPk: number } | null } };

export type UpdateSepMutationVariables = Exact<{
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type UpdateSepMutation = { updateSEP: { sep: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateSepTimeAllocationMutationVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepTimeAllocation?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateSepTimeAllocationMutation = { updateSEPTimeAllocation: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AddClientLogMutationVariables = Exact<{
  error: Scalars['String'];
}>;


export type AddClientLogMutation = { addClientLog: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CountryFragment = { id: number, value: string };

export type CreateApiAccessTokenMutationVariables = Exact<{
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type CreateApiAccessTokenMutation = { createApiAccessToken: { rejection: { reason: string, context: string | null, exception: string | null } | null, apiAccessToken: { id: string, name: string, accessToken: string, accessPermissions: string } | null } };

export type CreateInstitutionMutationVariables = Exact<{
  name: Scalars['String'];
  country: Scalars['Int'];
  verified: Scalars['Boolean'];
}>;


export type CreateInstitutionMutation = { createInstitution: { institution: { id: number, name: string, verified: boolean, country: { id: number, value: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
}>;


export type DeleteApiAccessTokenMutation = { deleteApiAccessToken: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstitutionMutation = { deleteInstitution: { institution: { id: number, verified: boolean } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UnitFragment = { id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string };

export type GetAllApiAccessTokensAndPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllApiAccessTokensAndPermissionsQuery = { allAccessTokensAndPermissions: Array<{ id: string, name: string, accessToken: string, accessPermissions: string }> | null };

export type GetAllQueriesAndMutationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllQueriesAndMutationsQuery = { queriesAndMutations: { queries: Array<string>, mutations: Array<string> } | null };

export type GetFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturesQuery = { features: Array<{ id: FeatureId, isEnabled: boolean, description: string }> };

export type GetInstitutionsQueryVariables = Exact<{
  filter?: InputMaybe<InstitutionsFilter>;
}>;


export type GetInstitutionsQuery = { institutions: Array<{ id: number, name: string, verified: boolean }> | null };

export type GetInstitutionsWithCountryQueryVariables = Exact<{
  filter?: InputMaybe<InstitutionsFilter>;
}>;


export type GetInstitutionsWithCountryQuery = { institutions: Array<{ id: number, name: string, verified: boolean, country: { id: number, value: string } | null }> | null };

export type GetPageContentQueryVariables = Exact<{
  pageId: PageName;
}>;


export type GetPageContentQuery = { getPageContent: string | null };

export type GetQuantitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuantitiesQuery = { quantities: Array<{ id: string }> };

export type GetSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSettingsQuery = { settings: Array<{ id: SettingsId, settingsValue: string | null, description: string | null }> };

export type MergeInstitutionsMutationVariables = Exact<{
  institutionIdFrom: Scalars['Int'];
  institutionIdInto: Scalars['Int'];
  newTitle: Scalars['String'];
}>;


export type MergeInstitutionsMutation = { mergeInstitutions: { institution: { id: number, verified: boolean, name: string, country: { id: number, value: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type PrepareDbMutationVariables = Exact<{
  includeSeeds: Scalars['Boolean'];
}>;


export type PrepareDbMutation = { prepareDB: { log: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type RejectionFragment = { reason: string, context: string | null, exception: string | null };

export type SetPageContentMutationVariables = Exact<{
  id: PageName;
  text: Scalars['String'];
}>;


export type SetPageContentMutation = { setPageContent: { page: { id: number, content: string | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type UpdateApiAccessTokenMutation = { updateApiAccessToken: { rejection: { reason: string, context: string | null, exception: string | null } | null, apiAccessToken: { id: string, name: string, accessToken: string, accessPermissions: string } | null } };

export type UpdateInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  country: Scalars['Int'];
  verified: Scalars['Boolean'];
}>;


export type UpdateInstitutionMutation = { updateInstitution: { institution: { id: number, verified: boolean, name: string, country: { id: number, value: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AssignInstrumentsToCallMutationVariables = Exact<{
  instrumentIds: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type AssignInstrumentsToCallMutation = { assignInstrumentsToCall: { rejection: { reason: string, context: string | null, exception: string | null } | null, call: { id: number } | null } };

export type CreateCallMutationVariables = Exact<{
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: InputMaybe<Scalars['DateTime']>;
  endSEPReview?: InputMaybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  submissionMessage?: InputMaybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: InputMaybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: InputMaybe<Scalars['Int']>;
  pdfTemplateId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  seps?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type CreateCallMutation = { createCall: { rejection: { reason: string, context: string | null, exception: string | null } | null, call: { id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } } | null } };

export type DeleteCallMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteCallMutation = { deleteCall: { rejection: { reason: string, context: string | null, exception: string | null } | null, call: { id: number } | null } };

export type CallFragment = { id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } };

export type GetCallQueryVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type GetCallQuery = { call: { id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } } | null };

export type GetCallsQueryVariables = Exact<{
  filter?: InputMaybe<CallsFilter>;
}>;


export type GetCallsQuery = { calls: Array<{ id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } }> | null };

export type GetCallsByInstrumentScientistQueryVariables = Exact<{
  scientistId: Scalars['Int'];
}>;


export type GetCallsByInstrumentScientistQuery = { callsByInstrumentScientist: Array<{ id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } }> | null };

export type RemoveAssignedInstrumentFromCallMutationVariables = Exact<{
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type RemoveAssignedInstrumentFromCallMutation = { removeAssignedInstrumentFromCall: { rejection: { reason: string, context: string | null, exception: string | null } | null, call: { id: number } | null } };

export type UpdateCallMutationVariables = Exact<{
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: InputMaybe<Scalars['DateTime']>;
  endSEPReview?: InputMaybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  submissionMessage?: InputMaybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: InputMaybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: InputMaybe<Scalars['Int']>;
  pdfTemplateId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  seps?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type UpdateCallMutation = { updateCall: { rejection: { reason: string, context: string | null, exception: string | null } | null, call: { id: number, shortCode: string, startCall: any, endCall: any, startReview: any, endReview: any, startSEPReview: any | null, endSEPReview: any | null, startNotify: any, endNotify: any, startCycle: any, endCycle: any, cycleComment: string, surveyComment: string, referenceNumberFormat: string | null, proposalWorkflowId: number | null, templateId: number, esiTemplateId: number | null, pdfTemplateId: number | null, allocationTimeUnit: AllocationTimeUnits, proposalCount: number, title: string | null, description: string | null, submissionMessage: string | null, instruments: Array<{ id: number, name: string, shortCode: string, description: string, availabilityTime: number | null, submitted: boolean | null, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }>, seps: Array<{ id: number, code: string }> | null, proposalWorkflow: { id: number, name: string, description: string } | null, template: { templateId: number, name: string, isArchived: boolean } } | null } };

export type CreateEsiMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type CreateEsiMutation = { createEsi: { esi: { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sampleEsis: Array<{ sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }, questionary: { isCompleted: boolean } }>, proposal: { primaryKey: number, proposalId: string, title: string, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }> | null, questionary: { questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type EsiFragment = { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any };

export type GetEsiQueryVariables = Exact<{
  esiId: Scalars['Int'];
}>;


export type GetEsiQuery = { esi: { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sampleEsis: Array<{ sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }, questionary: { isCompleted: boolean } }>, proposal: { primaryKey: number, proposalId: string, title: string, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }> | null, questionary: { questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } } | null };

export type UpdateEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  isSubmitted?: InputMaybe<Scalars['Boolean']>;
}>;


export type UpdateEsiMutation = { updateEsi: { esi: { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sampleEsis: Array<{ sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }, questionary: { isCompleted: boolean } }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetEventLogsQueryVariables = Exact<{
  eventType: Scalars['String'];
  changedObjectId: Scalars['String'];
}>;


export type GetEventLogsQuery = { eventLogs: Array<{ id: number, eventType: string, eventTStamp: any, rowData: string, changedObjectId: string, changedBy: { id: number, firstname: string, lastname: string, email: string } }> | null };

export type CreateFeedbackMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type CreateFeedbackMutation = { createFeedback: { feedback: { id: number, scheduledEventId: number, status: FeedbackStatus, questionaryId: number, creatorId: number, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type FeedbackFragment = { id: number, scheduledEventId: number, status: FeedbackStatus, questionaryId: number, creatorId: number };

export type GetFeedbackQueryVariables = Exact<{
  feedbackId: Scalars['Int'];
}>;


export type GetFeedbackQuery = { feedback: { id: number, scheduledEventId: number, status: FeedbackStatus, questionaryId: number, creatorId: number, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null };

export type UpdateFeedbackMutationVariables = Exact<{
  feedbackId: Scalars['Int'];
  status?: InputMaybe<FeedbackStatus>;
}>;


export type UpdateFeedbackMutation = { updateFeedback: { feedback: { id: number, scheduledEventId: number, status: FeedbackStatus, questionaryId: number, creatorId: number, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CloneGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
}>;


export type CloneGenericTemplateMutation = { cloneGenericTemplate: { genericTemplate: { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateGenericTemplateMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
}>;


export type CreateGenericTemplateMutation = { createGenericTemplate: { genericTemplate: { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type DeleteGenericTemplateMutation = { deleteGenericTemplate: { genericTemplate: { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GenericTemplateFragment = { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string };

export type GetGenericTemplateQueryVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type GetGenericTemplateQuery = { genericTemplate: { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null };

export type GetGenericTemplatesWithProposalDataQueryVariables = Exact<{
  filter?: InputMaybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithProposalDataQuery = { genericTemplates: Array<{ id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, proposal: { primaryKey: number, proposalId: string } }> | null };

export type GetGenericTemplatesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: InputMaybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithQuestionaryStatusQuery = { genericTemplates: Array<{ id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null };

export type UpdateGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
}>;


export type UpdateGenericTemplateMutation = { updateGenericTemplate: { genericTemplate: { id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AssignProposalsToInstrumentMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  instrumentId: Scalars['Int'];
}>;


export type AssignProposalsToInstrumentMutation = { assignProposalsToInstrument: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AssignScientistsToInstrumentMutationVariables = Exact<{
  scientistIds: Array<Scalars['Int']> | Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type AssignScientistsToInstrumentMutation = { assignScientistsToInstrument: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateInstrumentMutationVariables = Exact<{
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type CreateInstrumentMutation = { createInstrument: { instrument: { id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstrumentMutation = { deleteInstrument: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetInstrumentsQueryVariables = Exact<{
  callIds?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetInstrumentsQuery = { instruments: { totalCount: number, instruments: Array<{ id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }> } | null };

export type GetUserInstrumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserInstrumentsQuery = { me: { instruments: Array<{ id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> }> } | null };

export type InstrumentFragment = { id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> };

export type RemoveProposalsFromInstrumentMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type RemoveProposalsFromInstrumentMutation = { removeProposalsFromInstrument: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type RemoveScientistFromInstrumentMutationVariables = Exact<{
  scientistId: Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type RemoveScientistFromInstrumentMutation = { removeScientistFromInstrument: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SetInstrumentAvailabilityTimeMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  availabilityTime: Scalars['Int'];
}>;


export type SetInstrumentAvailabilityTimeMutation = { setInstrumentAvailabilityTime: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SubmitInstrumentMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type SubmitInstrumentMutation = { submitInstrument: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type UpdateInstrumentMutation = { updateInstrument: { instrument: { id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreatePredefinedMessageMutationVariables = Exact<{
  input: CreatePredefinedMessageInput;
}>;


export type CreatePredefinedMessageMutation = { createPredefinedMessage: { predefinedMessage: { id: number, title: string, message: string, lastModifiedBy: number, dateModified: any, modifiedBy: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeletePredefinedMessageMutationVariables = Exact<{
  input: DeletePredefinedMessageInput;
}>;


export type DeletePredefinedMessageMutation = { deletePredefinedMessage: { predefinedMessage: { id: number, title: string, message: string, lastModifiedBy: number, dateModified: any, modifiedBy: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type PredefinedMessageFragment = { id: number, title: string, message: string, lastModifiedBy: number, dateModified: any, modifiedBy: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } };

export type GetPredefinedMessagesQueryVariables = Exact<{
  filter?: InputMaybe<PredefinedMessagesFilter>;
}>;


export type GetPredefinedMessagesQuery = { predefinedMessages: Array<{ id: number, title: string, message: string, lastModifiedBy: number, dateModified: any, modifiedBy: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } }> };

export type UpdatePredefinedMessageMutationVariables = Exact<{
  input: UpdatePredefinedMessageInput;
}>;


export type UpdatePredefinedMessageMutation = { updatePredefinedMessage: { predefinedMessage: { id: number, title: string, message: string, lastModifiedBy: number, dateModified: any, modifiedBy: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AdministrationProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  finalStatus?: InputMaybe<ProposalEndStatus>;
  statusId?: InputMaybe<Scalars['Int']>;
  commentForUser?: InputMaybe<Scalars['String']>;
  commentForManagement?: InputMaybe<Scalars['String']>;
  managementTimeAllocation?: InputMaybe<Scalars['Int']>;
  managementDecisionSubmitted?: InputMaybe<Scalars['Boolean']>;
}>;


export type AdministrationProposalMutation = { administrationProposal: { proposal: { primaryKey: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ChangeProposalsStatusMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  statusId: Scalars['Int'];
}>;


export type ChangeProposalsStatusMutation = { changeProposalsStatus: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CloneProposalsMutationVariables = Exact<{
  proposalsToClonePk: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type CloneProposalsMutation = { cloneProposals: { proposals: Array<{ primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, technicalReview: { id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null } | null, reviews: Array<{ id: number, grade: number | null, comment: string | null, status: ReviewStatus, userID: number, sepID: number, reviewer: { firstname: string, lastname: string, id: number } | null }> | null, instrument: { id: number, name: string, shortCode: string } | null, call: { id: number, shortCode: string, isActive: boolean, referenceNumberFormat: string | null } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null }> | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateProposalMutationVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type CreateProposalMutation = { createProposal: { proposal: { primaryKey: number, proposalId: string, questionaryId: number, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null, genericTemplates: Array<{ id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type DeleteProposalMutation = { deleteProposal: { rejection: { reason: string, context: string | null, exception: string | null } | null, proposal: { primaryKey: number } | null } };

export type CoreTechnicalReviewFragment = { id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null };

export type ProposalFragment = { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null };

export type GetInstrumentScientistProposalsQueryVariables = Exact<{
  filter?: InputMaybe<ProposalsFilter>;
  offset?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type GetInstrumentScientistProposalsQuery = { instrumentScientistProposals: { totalCount: number, proposals: Array<{ primaryKey: number, proposalId: string, title: string, submitted: boolean, finalStatus: ProposalEndStatus | null, technicalReviewAssigneeId: number | null, technicalReviewAssigneeFirstName: string | null, technicalReviewAssigneeLastName: string | null, technicalStatus: TechnicalReviewStatus | null, technicalTimeAllocation: number | null, statusName: string, technicalReviewSubmitted: number | null, instrumentId: number | null, instrumentName: string | null, allocationTimeUnit: AllocationTimeUnits, callShortCode: string | null, sepCode: string | null }> } | null };

export type GetMyProposalsQueryVariables = Exact<{
  filter?: InputMaybe<UserProposalsFilter>;
}>;


export type GetMyProposalsQuery = { me: { proposals: Array<{ primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null }> } | null };

export type GetProposalQueryVariables = Exact<{
  primaryKey: Scalars['Int'];
}>;


export type GetProposalQuery = { proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, technicalReview: { id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, reviewer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null } | null, reviews: Array<{ id: number, grade: number | null, comment: string | null, status: ReviewStatus, userID: number, sepID: number, reviewer: { firstname: string, lastname: string, id: number } | null }> | null, instrument: { id: number, name: string, shortCode: string, beamlineManager: { id: number, firstname: string, lastname: string } | null, scientists: Array<{ id: number, firstname: string, lastname: string }> } | null, call: { id: number, shortCode: string, isActive: boolean, allocationTimeUnit: AllocationTimeUnits, referenceNumberFormat: string | null } | null, sep: { id: number, code: string } | null, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null, genericTemplates: Array<{ id: number, title: string, creatorId: number, questionaryId: number, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } | null };

export type GetProposalsQueryVariables = Exact<{
  filter?: InputMaybe<ProposalsFilter>;
}>;


export type GetProposalsQuery = { proposals: { totalCount: number, proposals: Array<{ primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, reviews: Array<{ id: number, grade: number | null, comment: string | null, status: ReviewStatus, userID: number, sepID: number, reviewer: { firstname: string, lastname: string, id: number } | null }> | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, technicalReview: { id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, reviewer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null } | null, instrument: { id: number, name: string } | null, call: { id: number, shortCode: string } | null, sep: { id: number, code: string } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null }> } | null };

export type GetProposalsCoreQueryVariables = Exact<{
  filter?: InputMaybe<ProposalsFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sortField?: InputMaybe<Scalars['String']>;
  sortDirection?: InputMaybe<Scalars['String']>;
  searchText?: InputMaybe<Scalars['String']>;
}>;


export type GetProposalsCoreQuery = { proposalsView: { totalCount: number, proposalViews: Array<{ primaryKey: number, title: string, statusId: number, statusName: string, statusDescription: string, proposalId: string, rankOrder: number | null, finalStatus: ProposalEndStatus | null, notified: boolean, managementTimeAllocation: number | null, technicalTimeAllocation: number | null, technicalReviewAssigneeId: number | null, technicalReviewAssigneeFirstName: string | null, technicalReviewAssigneeLastName: string | null, technicalStatus: TechnicalReviewStatus | null, instrumentName: string | null, callShortCode: string | null, sepCode: string | null, sepId: number | null, reviewAverage: number | null, reviewDeviation: number | null, instrumentId: number | null, callId: number, submitted: boolean, allocationTimeUnit: AllocationTimeUnits }> } | null };

export type NotifyProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type NotifyProposalMutation = { notifyProposal: { proposal: { primaryKey: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SubmitProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type SubmitProposalMutation = { submitProposal: { proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
  abstract?: InputMaybe<Scalars['String']>;
  users?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
  proposerId?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateProposalMutation = { updateProposal: { proposal: { primaryKey: number, title: string, abstract: string, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetUserProposalBookingsWithEventsQueryVariables = Exact<{
  endsAfter?: InputMaybe<Scalars['DateTime']>;
  status?: InputMaybe<Array<ProposalBookingStatusCore> | ProposalBookingStatusCore>;
  instrumentId?: InputMaybe<Scalars['Int']>;
}>;


export type GetUserProposalBookingsWithEventsQuery = { me: { proposals: Array<{ primaryKey: number, title: string, proposalId: string, finalStatus: ProposalEndStatus | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }>, proposalBookingCore: { scheduledEvents: Array<{ id: number, startsAt: any, endsAt: any, bookingType: ScheduledEventBookingType, status: ProposalBookingStatusCore, visit: { id: number, proposalPk: number, status: VisitStatus, creatorId: number, teamLead: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }, registrations: Array<{ userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }> } | null, esi: { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any } | null, feedback: { id: number, scheduledEventId: number, status: FeedbackStatus, questionaryId: number, creatorId: number } | null, shipments: Array<{ id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, proposal: { proposalId: string } }>, localContact: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }> } | null, visits: Array<{ id: number, proposalPk: number, status: VisitStatus, creatorId: number }> | null, instrument: { id: number, name: string } | null }> } | null };

export type AnswerTopicMutationVariables = Exact<{
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
  answers: Array<AnswerInput> | AnswerInput;
  isPartialSave?: InputMaybe<Scalars['Boolean']>;
}>;


export type AnswerTopicMutation = { answerTopic: { questionaryStep: { isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateQuestionaryMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CreateQuestionaryMutation = { createQuestionary: { questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AnswerFragment = { answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> };

export type FileMetadataFragment = { fileId: string, originalFileName: string, mimeType: string, sizeInBytes: number, createdDate: any };

export type QuestionaryFragment = { questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> };

export type QuestionaryStepFragment = { isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> };

export type GetBlankQuestionaryQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryQuery = { blankQuestionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } };

export type GetBlankQuestionaryStepsQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryStepsQuery = { blankQuestionarySteps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> | null };

export type GetFileMetadataQueryVariables = Exact<{
  fileId: Scalars['String'];
}>;


export type GetFileMetadataQuery = { fileMetadata: { fileId: string, originalFileName: string, mimeType: string, sizeInBytes: number, createdDate: any } | null };

export type GetFilesMetadataQueryVariables = Exact<{
  filter: FilesMetadataFilter;
}>;


export type GetFilesMetadataQuery = { filesMetadata: Array<{ fileId: string, originalFileName: string, mimeType: string, sizeInBytes: number, createdDate: any }> };

export type GetQuestionaryQueryVariables = Exact<{
  questionaryId: Scalars['Int'];
}>;


export type GetQuestionaryQuery = { questionary: { questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } | null };

export type AddTechnicalReviewMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  timeAllocation?: InputMaybe<Scalars['Int']>;
  comment?: InputMaybe<Scalars['String']>;
  publicComment?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
  files?: InputMaybe<Scalars['String']>;
}>;


export type AddTechnicalReviewMutation = { addTechnicalReview: { rejection: { reason: string, context: string | null, exception: string | null } | null, technicalReview: { id: number } | null } };

export type AddUserForReviewMutationVariables = Exact<{
  userID: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepID: Scalars['Int'];
}>;


export type AddUserForReviewMutation = { addUserForReview: { rejection: { reason: string, context: string | null, exception: string | null } | null, review: { id: number } | null } };

export type UpdateTechnicalReviewAssigneeMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  userId: Scalars['Int'];
}>;


export type UpdateTechnicalReviewAssigneeMutation = { updateTechnicalReviewAssignee: { technicalReviews: Array<{ id: number, comment: string | null, publicComment: string | null, timeAllocation: number | null, status: TechnicalReviewStatus | null, proposalPk: number, submitted: boolean, files: string | null, technicalReviewAssigneeId: number | null, technicalReviewAssignee: { id: number, firstname: string, lastname: string } | null }> | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CoreReviewFragment = { id: number, userID: number, status: ReviewStatus, comment: string | null, grade: number | null, sepID: number };

export type GetProposalReviewsQueryVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type GetProposalReviewsQuery = { proposalReviews: Array<{ id: number, userID: number, comment: string | null, grade: number | null, status: ReviewStatus, sepID: number }> | null };

export type GetReviewQueryVariables = Exact<{
  reviewId: Scalars['Int'];
}>;


export type GetReviewQuery = { review: { id: number, userID: number, status: ReviewStatus, comment: string | null, grade: number | null, sepID: number, proposal: { primaryKey: number, title: string, abstract: string, proposer: { id: number } | null } | null, reviewer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null } | null };

export type RemoveUserForReviewMutationVariables = Exact<{
  reviewId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveUserForReviewMutation = { removeUserForReview: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SubmitProposalsReviewMutationVariables = Exact<{
  proposals: Array<ProposalPkWithReviewId> | ProposalPkWithReviewId;
}>;


export type SubmitProposalsReviewMutation = { submitProposalsReview: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SubmitTechnicalReviewsMutationVariables = Exact<{
  technicalReviews: Array<SubmitTechnicalReviewInput> | SubmitTechnicalReviewInput;
}>;


export type SubmitTechnicalReviewsMutation = { submitTechnicalReviews: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateReviewMutationVariables = Exact<{
  reviewID: Scalars['Int'];
  grade: Scalars['Int'];
  comment: Scalars['String'];
  status: ReviewStatus;
  sepID: Scalars['Int'];
}>;


export type UpdateReviewMutation = { updateReview: { rejection: { reason: string, context: string | null, exception: string | null } | null, review: { id: number, userID: number, status: ReviewStatus, comment: string | null, grade: number | null, sepID: number, nextProposalStatus: { id: number | null, shortCode: string | null, name: string | null } | null } | null } };

export type UserWithReviewsQueryVariables = Exact<{
  callId?: InputMaybe<Scalars['Int']>;
  instrumentId?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<ReviewStatus>;
  reviewer?: InputMaybe<ReviewerFilter>;
}>;


export type UserWithReviewsQuery = { me: { id: number, firstname: string, lastname: string, organisation: number, reviews: Array<{ id: number, grade: number | null, comment: string | null, status: ReviewStatus, sepID: number, proposal: { primaryKey: number, title: string, proposalId: string, call: { shortCode: string } | null, instrument: { shortCode: string } | null } | null }> } | null };

export type CloneSampleEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  newSampleTitle?: InputMaybe<Scalars['String']>;
}>;


export type CloneSampleEsiMutation = { cloneSampleEsi: { esi: { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type CreateSampleEsiMutation = { createSampleEsi: { esi: { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type DeleteSampleEsiMutation = { deleteSampleEsi: { esi: { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SampleEsiFragment = { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean };

export type GetSampleEsiQueryVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type GetSampleEsiQuery = { sampleEsi: { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } } | null };

export type UpdateSampleEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  isSubmitted?: InputMaybe<Scalars['Boolean']>;
}>;


export type UpdateSampleEsiMutation = { updateSampleEsi: { esi: { sampleId: number, esiId: number, questionaryId: number, isSubmitted: boolean, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CloneSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
  isPostProposalSubmission?: InputMaybe<Scalars['Boolean']>;
}>;


export type CloneSampleMutation = { cloneSample: { sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateSampleMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  isPostProposalSubmission?: InputMaybe<Scalars['Boolean']>;
}>;


export type CreateSampleMutation = { createSample: { sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type DeleteSampleMutation = { deleteSample: { sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SampleFragment = { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string };

export type GetSampleQueryVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type GetSampleQuery = { sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null };

export type GetSamplesByCallIdQueryVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type GetSamplesByCallIdQuery = { samplesByCallId: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, proposal: { primaryKey: number, proposalId: string } }> | null };

export type GetSamplesWithProposalDataQueryVariables = Exact<{
  filter?: InputMaybe<SamplesFilter>;
}>;


export type GetSamplesWithProposalDataQuery = { samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, proposal: { primaryKey: number, proposalId: string } }> | null };

export type GetSamplesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: InputMaybe<SamplesFilter>;
}>;


export type GetSamplesWithQuestionaryStatusQuery = { samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string, questionary: { isCompleted: boolean } }> | null };

export type UpdateSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
  safetyComment?: InputMaybe<Scalars['String']>;
  safetyStatus?: InputMaybe<SampleStatus>;
}>;


export type UpdateSampleMutation = { updateSample: { sample: { id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ScheduledEventCoreFragment = { id: number, proposalPk: number | null, bookingType: ScheduledEventBookingType, startsAt: any, endsAt: any, status: ProposalBookingStatusCore, localContactId: number | null };

export type GetScheduledEventCoreQueryVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type GetScheduledEventCoreQuery = { scheduledEventCore: { id: number, proposalPk: number | null, bookingType: ScheduledEventBookingType, startsAt: any, endsAt: any, status: ProposalBookingStatusCore, localContactId: number | null } | null };

export type GetScheduledEventsCoreQueryVariables = Exact<{
  filter?: InputMaybe<ScheduledEventsCoreFilter>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type GetScheduledEventsCoreQuery = { scheduledEventsCore: Array<{ id: number, proposalPk: number | null, bookingType: ScheduledEventBookingType, startsAt: any, endsAt: any, status: ProposalBookingStatusCore, localContactId: number | null, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, proposer: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, instrument: { id: number, name: string, shortCode: string, description: string, managerUserId: number, scientists: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null }, esi: { id: number, creatorId: number, questionaryId: number, isSubmitted: boolean, created: any } | null, visit: { registrations: Array<{ startsAt: any | null, endsAt: any | null, trainingStatus: TrainingStatus, userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }>, teamLead: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } } | null }> };

export type AddProposalWorkflowStatusMutationVariables = Exact<{
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  droppableGroupId: Scalars['String'];
  parentDroppableGroupId?: InputMaybe<Scalars['String']>;
  proposalStatusId: Scalars['Int'];
  nextProposalStatusId?: InputMaybe<Scalars['Int']>;
  prevProposalStatusId?: InputMaybe<Scalars['Int']>;
}>;


export type AddProposalWorkflowStatusMutation = { addProposalWorkflowStatus: { proposalWorkflowConnection: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AddStatusChangingEventsToConnectionMutationVariables = Exact<{
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']> | Scalars['String'];
}>;


export type AddStatusChangingEventsToConnectionMutation = { addStatusChangingEventsToConnection: { statusChangingEvents: Array<{ statusChangingEventId: number, proposalWorkflowConnectionId: number, statusChangingEvent: string }> | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateProposalStatusMutationVariables = Exact<{
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalStatusMutation = { createProposalStatus: { proposalStatus: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateProposalWorkflowMutationVariables = Exact<{
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalWorkflowMutation = { createProposalWorkflow: { proposalWorkflow: { id: number, name: string, description: string, proposalWorkflowConnectionGroups: Array<{ groupId: string, parentGroupId: string | null, connections: Array<{ id: number, sortOrder: number, proposalWorkflowId: number, proposalStatusId: number, nextProposalStatusId: number | null, prevProposalStatusId: number | null, droppableGroupId: string, proposalStatus: { id: number, shortCode: string, name: string, description: string, isDefault: boolean }, statusChangingEvents: Array<{ statusChangingEventId: number, proposalWorkflowConnectionId: number, statusChangingEvent: string }> | null }> }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalStatusMutation = { deleteProposalStatus: { proposalStatus: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalWorkflowMutation = { deleteProposalWorkflow: { proposalWorkflow: { id: number, name: string, description: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteProposalWorkflowStatusMutationVariables = Exact<{
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type DeleteProposalWorkflowStatusMutation = { deleteProposalWorkflowStatus: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ProposalStatusFragment = { id: number, shortCode: string, name: string, description: string, isDefault: boolean };

export type GetProposalEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalEventsQuery = { proposalEvents: Array<{ name: Event, description: string | null }> | null };

export type GetProposalStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalStatusesQuery = { proposalStatuses: Array<{ id: number, shortCode: string, name: string, description: string, isDefault: boolean }> | null };

export type GetProposalWorkflowQueryVariables = Exact<{
  proposalWorkflowId: Scalars['Int'];
}>;


export type GetProposalWorkflowQuery = { proposalWorkflow: { id: number, name: string, description: string, proposalWorkflowConnectionGroups: Array<{ groupId: string, parentGroupId: string | null, connections: Array<{ id: number, sortOrder: number, proposalWorkflowId: number, proposalStatusId: number, nextProposalStatusId: number | null, prevProposalStatusId: number | null, droppableGroupId: string, proposalStatus: { id: number, shortCode: string, name: string, description: string, isDefault: boolean }, statusChangingEvents: Array<{ statusChangingEventId: number, proposalWorkflowConnectionId: number, statusChangingEvent: string }> | null }> }> } | null };

export type GetProposalWorkflowsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalWorkflowsQuery = { proposalWorkflows: Array<{ id: number, name: string, description: string }> | null };

export type MoveProposalWorkflowStatusMutationVariables = Exact<{
  from: IndexWithGroupId;
  to: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
}>;


export type MoveProposalWorkflowStatusMutation = { moveProposalWorkflowStatus: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateFeaturesMutationVariables = Exact<{
  input: UpdateFeaturesInput;
}>;


export type UpdateFeaturesMutation = { updateFeatures: { features: Array<{ id: FeatureId, isEnabled: boolean, description: string }> | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalStatusMutation = { updateProposalStatus: { proposalStatus: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalWorkflowMutation = { updateProposalWorkflow: { proposalWorkflow: { id: number, name: string, description: string, proposalWorkflowConnectionGroups: Array<{ groupId: string, parentGroupId: string | null, connections: Array<{ id: number, sortOrder: number, proposalWorkflowId: number, proposalStatusId: number, nextProposalStatusId: number | null, prevProposalStatusId: number | null, droppableGroupId: string, proposalStatus: { id: number, name: string, description: string }, statusChangingEvents: Array<{ statusChangingEventId: number, proposalWorkflowConnectionId: number, statusChangingEvent: string }> | null }> }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateSettingsMutationVariables = Exact<{
  input: UpdateSettingsInput;
}>;


export type UpdateSettingsMutation = { updateSettings: { settings: { id: SettingsId, settingsValue: string | null, description: string | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type AddSamplesToShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  sampleIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type AddSamplesToShipmentMutation = { addSamplesToShipment: { rejection: { reason: string, context: string | null, exception: string | null } | null, shipment: { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }>, proposal: { proposalId: string } } | null } };

export type CreateShipmentMutationVariables = Exact<{
  title: Scalars['String'];
  proposalPk: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
}>;


export type CreateShipmentMutation = { createShipment: { shipment: { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }>, proposal: { proposalId: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type DeleteShipmentMutation = { deleteShipment: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ShipmentFragment = { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, proposal: { proposalId: string } };

export type GetMyShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyShipmentsQuery = { myShipments: Array<{ id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, proposal: { proposalId: string } }> | null };

export type GetShipmentQueryVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type GetShipmentQuery = { shipment: { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, samples: Array<{ id: number, title: string, creatorId: number, questionaryId: number, safetyStatus: SampleStatus, safetyComment: string, isPostProposalSubmission: boolean, created: any, proposalPk: number, questionId: string }>, proposal: { proposalId: string } } | null };

export type GetShipmentsQueryVariables = Exact<{
  filter?: InputMaybe<ShipmentsFilter>;
}>;


export type GetShipmentsQuery = { shipments: Array<{ id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, proposal: { proposalId: string } }> | null };

export type SetActiveTemplateMutationVariables = Exact<{
  templateGroupId: TemplateGroupId;
  templateId: Scalars['Int'];
}>;


export type SetActiveTemplateMutation = { setActiveTemplate: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SubmitShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type SubmitShipmentMutation = { submitShipment: { rejection: { reason: string, context: string | null, exception: string | null } | null, shipment: { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, proposal: { proposalId: string } } | null } };

export type UpdateShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  title?: InputMaybe<Scalars['String']>;
  proposalPk?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<ShipmentStatus>;
}>;


export type UpdateShipmentMutation = { updateShipment: { rejection: { reason: string, context: string | null, exception: string | null } | null, shipment: { id: number, title: string, proposalPk: number, status: ShipmentStatus, externalRef: string | null, questionaryId: number, scheduledEventId: number, creatorId: number, created: any, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> }, proposal: { proposalId: string } } | null } };

export type ImportTemplateMutationVariables = Exact<{
  templateAsJson: Scalars['String'];
  conflictResolutions: Array<ConflictResolution> | ConflictResolution;
  subTemplatesConflictResolutions: Array<Array<ConflictResolution> | ConflictResolution> | Array<ConflictResolution> | ConflictResolution;
}>;


export type ImportTemplateMutation = { importTemplate: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CloneTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CloneTemplateMutation = { cloneTemplate: { template: { questionaryCount: number, templateId: number, name: string, description: string | null, isArchived: boolean, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean } }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateQuestionMutationVariables = Exact<{
  categoryId: TemplateCategoryId;
  dataType: DataType;
}>;


export type CreateQuestionMutation = { createQuestion: { question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateQuestionTemplateRelationMutationVariables = Exact<{
  templateId: Scalars['Int'];
  questionId: Scalars['String'];
  topicId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateQuestionTemplateRelationMutation = { createQuestionTemplateRelation: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateTemplateMutationVariables = Exact<{
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
}>;


export type CreateTemplateMutation = { createTemplate: { template: { questionaryCount: number, isArchived: boolean, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateTopicMutationVariables = Exact<{
  templateId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateTopicMutation = { createTopic: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteQuestionMutationVariables = Exact<{
  questionId: Scalars['String'];
}>;


export type DeleteQuestionMutation = { deleteQuestion: { question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
}>;


export type DeleteQuestionTemplateRelationMutation = { deleteQuestionTemplateRelation: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteTemplateMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteTemplateMutation = { deleteTemplate: { template: { templateId: number, name: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
}>;


export type DeleteTopicMutation = { deleteTopic: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type FieldConditionFragment = { condition: EvaluatorOperator, params: any };

type FieldConfig_BooleanConfig_Fragment = { small_label: string, required: boolean, tooltip: string };

type FieldConfig_DateConfig_Fragment = { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean };

type FieldConfig_EmbellishmentConfig_Fragment = { html: string, plain: string, omitFromPdf: boolean };

type FieldConfig_FeedbackBasisConfig_Fragment = { small_label: string, required: boolean, tooltip: string };

type FieldConfig_FileUploadConfig_Fragment = { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string };

type FieldConfig_GenericTemplateBasisConfig_Fragment = { titlePlaceholder: string, questionLabel: string };

type FieldConfig_IntervalConfig_Fragment = { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> };

type FieldConfig_NumberInputConfig_Fragment = { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> };

type FieldConfig_ProposalBasisConfig_Fragment = { tooltip: string };

type FieldConfig_ProposalEsiBasisConfig_Fragment = { tooltip: string };

type FieldConfig_RichTextInputConfig_Fragment = { small_label: string, required: boolean, tooltip: string, max: number | null };

type FieldConfig_SampleBasisConfig_Fragment = { titlePlaceholder: string };

type FieldConfig_SampleDeclarationConfig_Fragment = { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string };

type FieldConfig_SampleEsiBasisConfig_Fragment = { tooltip: string };

type FieldConfig_SelectionFromOptionsConfig_Fragment = { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string };

type FieldConfig_ShipmentBasisConfig_Fragment = { small_label: string, required: boolean, tooltip: string };

type FieldConfig_SubTemplateConfig_Fragment = { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string };

type FieldConfig_TextInputConfig_Fragment = { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean };

type FieldConfig_VisitBasisConfig_Fragment = { small_label: string, required: boolean, tooltip: string };

export type FieldConfigFragment = FieldConfig_BooleanConfig_Fragment | FieldConfig_DateConfig_Fragment | FieldConfig_EmbellishmentConfig_Fragment | FieldConfig_FeedbackBasisConfig_Fragment | FieldConfig_FileUploadConfig_Fragment | FieldConfig_GenericTemplateBasisConfig_Fragment | FieldConfig_IntervalConfig_Fragment | FieldConfig_NumberInputConfig_Fragment | FieldConfig_ProposalBasisConfig_Fragment | FieldConfig_ProposalEsiBasisConfig_Fragment | FieldConfig_RichTextInputConfig_Fragment | FieldConfig_SampleBasisConfig_Fragment | FieldConfig_SampleDeclarationConfig_Fragment | FieldConfig_SampleEsiBasisConfig_Fragment | FieldConfig_SelectionFromOptionsConfig_Fragment | FieldConfig_ShipmentBasisConfig_Fragment | FieldConfig_SubTemplateConfig_Fragment | FieldConfig_TextInputConfig_Fragment | FieldConfig_VisitBasisConfig_Fragment;

export type QuestionFragment = { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } };

export type QuestionComparisonFragment = { status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, newQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } };

export type QuestionTemplateRelationFragment = { sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> };

export type TemplateFragment = { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null };

export type TemplateMetadataFragment = { templateId: number, name: string, description: string | null, isArchived: boolean, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean } }> };

export type TemplateStepFragment = { topic: { title: string, id: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> };

export type TemplateValidationDataFragment = { isValid: boolean, errors: Array<string>, questionComparisons: Array<{ status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, newQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } }>, subTemplateValidationData: Array<{ isValid: boolean, errors: Array<string>, questionComparisons: Array<{ status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, newQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } }> }> };

export type TopicFragment = { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean };

export type GetActiveTemplateIdQueryVariables = Exact<{
  templateGroupId: TemplateGroupId;
}>;


export type GetActiveTemplateIdQuery = { activeTemplateId: number | null };

export type GetIsNaturalKeyPresentQueryVariables = Exact<{
  naturalKey: Scalars['String'];
}>;


export type GetIsNaturalKeyPresentQuery = { isNaturalKeyPresent: boolean | null };

export type GetPdfTemplateQueryVariables = Exact<{
  pdfTemplateId: Scalars['Int'];
}>;


export type GetPdfTemplateQuery = { pdfTemplate: { pdfTemplateId: number, templateId: number, templateData: string } | null };

export type GetProposalTemplatesQueryVariables = Exact<{
  filter?: InputMaybe<ProposalTemplatesFilter>;
}>;


export type GetProposalTemplatesQuery = { proposalTemplates: Array<{ templateId: number, name: string, description: string | null, isArchived: boolean, questionaryCount: number, callCount: number }> | null };

export type GetQuestionsQueryVariables = Exact<{
  filter?: InputMaybe<QuestionsFilter>;
}>;


export type GetQuestionsQuery = { questions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, answers: Array<{ questionaryId: number }>, templates: Array<{ templateId: number }> }> };

export type GetTemplateQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetTemplateQuery = { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null };

export type GetTemplateCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTemplateCategoriesQuery = { templateCategories: Array<{ categoryId: TemplateCategoryId, name: string }> | null };

export type GetTemplateExportQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetTemplateExportQuery = { template: { json: string } | null };

export type GetTemplatesQueryVariables = Exact<{
  filter?: InputMaybe<TemplatesFilter>;
}>;


export type GetTemplatesQuery = { templates: Array<{ templateId: number, name: string, description: string | null, isArchived: boolean, questionaryCount: number }> | null };

export type UpdatePdfTemplateMutationVariables = Exact<{
  pdfTemplateId: Scalars['Int'];
  templateData?: InputMaybe<Scalars['String']>;
}>;


export type UpdatePdfTemplateMutation = { updatePdfTemplate: { pdfTemplate: { pdfTemplateId: number, templateId: number, templateData: string, created: any, creatorId: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateQuestionMutationVariables = Exact<{
  id: Scalars['String'];
  naturalKey?: InputMaybe<Scalars['String']>;
  question?: InputMaybe<Scalars['String']>;
  config?: InputMaybe<Scalars['String']>;
}>;


export type UpdateQuestionMutation = { updateQuestion: { question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  topicId?: InputMaybe<Scalars['Int']>;
  sortOrder: Scalars['Int'];
  config?: InputMaybe<Scalars['String']>;
}>;


export type UpdateQuestionTemplateRelationMutation = { updateQuestionTemplateRelation: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateQuestionTemplateRelationSettingsMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  config?: InputMaybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput> | FieldDependencyInput;
  dependenciesOperator?: InputMaybe<DependenciesLogicOperator>;
}>;


export type UpdateQuestionTemplateRelationSettingsMutation = { updateQuestionTemplateRelationSettings: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
}>;


export type UpdateTemplateMutation = { updateTemplate: { template: { templateId: number, name: string, description: string | null, isArchived: boolean, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean } }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
  templateId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  sortOrder?: InputMaybe<Scalars['Int']>;
  isEnabled?: InputMaybe<Scalars['Boolean']>;
}>;


export type UpdateTopicMutation = { updateTopic: { template: { isArchived: boolean, questionaryCount: number, templateId: number, groupId: TemplateGroupId, name: string, description: string | null, steps: Array<{ topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }>, complementaryQuestions: Array<{ id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }>, group: { groupId: TemplateGroupId, categoryId: TemplateCategoryId }, pdfTemplate: { pdfTemplateId: number, templateData: string } | null } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ValidateTemplateImportMutationVariables = Exact<{
  templateAsJson: Scalars['String'];
}>;


export type ValidateTemplateImportMutation = { validateTemplateImport: { validationResult: { json: string, version: string, exportDate: any, validationData: { isValid: boolean, errors: Array<string>, questionComparisons: Array<{ status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, newQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } }>, subTemplateValidationData: Array<{ isValid: boolean, errors: Array<string>, questionComparisons: Array<{ status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } | null, newQuestion: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } } }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateUnitMutationVariables = Exact<{
  id: Scalars['String'];
  unit: Scalars['String'];
  quantity: Scalars['String'];
  symbol: Scalars['String'];
  siConversionFormula: Scalars['String'];
}>;


export type CreateUnitMutation = { createUnit: { unit: { id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteUnitMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteUnitMutation = { deleteUnit: { unit: { id: string } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetUnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnitsQuery = { units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> | null };

export type GetUnitsAsJsonQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnitsAsJsonQuery = { unitsAsJson: string | null };

export type ImportUnitsMutationVariables = Exact<{
  json: Scalars['String'];
  conflictResolutions: Array<ConflictResolution> | ConflictResolution;
}>;


export type ImportUnitsMutation = { importUnits: { units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ValidateUnitsImportMutationVariables = Exact<{
  unitsAsJson: Scalars['String'];
}>;


export type ValidateUnitsImportMutation = { validateUnitsImport: { validationResult: { json: string, version: string, exportDate: any, isValid: boolean, errors: Array<string>, unitComparisons: Array<{ status: QuestionComparisonStatus, conflictResolutionStrategy: ConflictResolutionStrategy, existingUnit: { id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string } | null, newUnit: { id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string } }> } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CheckTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type CheckTokenQuery = { checkToken: { isValid: boolean } };

export type CreateUserMutationVariables = Exact<{
  user_title?: InputMaybe<Scalars['String']>;
  firstname: Scalars['String'];
  middlename?: InputMaybe<Scalars['String']>;
  lastname: Scalars['String'];
  password: Scalars['String'];
  preferredname?: InputMaybe<Scalars['String']>;
  orcid: Scalars['String'];
  orcidHash: Scalars['String'];
  refreshToken: Scalars['String'];
  gender: Scalars['String'];
  nationality: Scalars['Int'];
  birthdate: Scalars['DateTime'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: InputMaybe<Scalars['String']>;
  otherOrganisation?: InputMaybe<Scalars['String']>;
  organizationCountry?: InputMaybe<Scalars['Int']>;
}>;


export type CreateUserMutation = { createUser: { user: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateUserByEmailInviteMutationVariables = Exact<{
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  email: Scalars['String'];
  userRole: UserRole;
}>;


export type CreateUserByEmailInviteMutation = { createUserByEmailInvite: { id: number | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUserMutation = { deleteUser: { user: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ExternalTokenLoginMutationVariables = Exact<{
  externalToken: Scalars['String'];
}>;


export type ExternalTokenLoginMutation = { externalTokenLogin: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type BasicUserDetailsFragment = { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null };

export type GetBasicUserDetailsQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetBasicUserDetailsQuery = { basicUserDetails: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null };

export type GetBasicUserDetailsByEmailQueryVariables = Exact<{
  email: Scalars['String'];
  role?: InputMaybe<UserRole>;
}>;


export type GetBasicUserDetailsByEmailQuery = { basicUserDetailsByEmail: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null };

export type GetCountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCountriesQuery = { countries: Array<{ id: number, value: string }> | null };

export type GetMyRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyRolesQuery = { me: { firstname: string, lastname: string, roles: Array<{ id: number, shortCode: string, title: string }> } | null };

export type GetNationalitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNationalitiesQuery = { nationalities: Array<{ id: number, value: string }> | null };

export type GetOrcIdInformationQueryVariables = Exact<{
  authorizationCode: Scalars['String'];
}>;


export type GetOrcIdInformationQuery = { getOrcIDInformation: { firstname: string | null, lastname: string | null, orcid: string | null, orcidHash: string | null, refreshToken: string | null, token: string | null } | null };

export type GetPreviousCollaboratorsQueryVariables = Exact<{
  userId: Scalars['Int'];
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  userRole?: InputMaybe<UserRole>;
  subtractUsers?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetPreviousCollaboratorsQuery = { previousCollaborators: { totalCount: number, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { roles: Array<{ id: number, shortCode: string, title: string }> | null };

export type GetTokenMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type GetTokenMutation = { token: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetTokenForUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetTokenForUserMutation = { getTokenForUser: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type GetUserQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetUserQuery = { user: { user_title: string, username: string, firstname: string, middlename: string | null, lastname: string, preferredname: string | null, gender: string, nationality: number | null, birthdate: any, organisation: number, department: string, position: string, email: string, telephone: string, telephone_alt: string | null, orcid: string, emailVerified: boolean, placeholder: boolean } | null };

export type GetUserMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserMeQuery = { me: { user_title: string, username: string, firstname: string, middlename: string | null, lastname: string, preferredname: string | null, gender: string, nationality: number | null, birthdate: any, organisation: number, department: string, position: string, email: string, telephone: string, telephone_alt: string | null, orcid: string, emailVerified: boolean, placeholder: boolean } | null };

export type GetUserProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProposalsQuery = { me: { proposals: Array<{ primaryKey: number, proposalId: string, title: string, publicStatus: ProposalPublicStatus, statusId: number, created: any, finalStatus: ProposalEndStatus | null, notified: boolean, submitted: boolean, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, proposer: { id: number } | null, call: { id: number, shortCode: string, isActive: boolean, referenceNumberFormat: string | null } | null }> } | null };

export type GetUserWithRolesQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetUserWithRolesQuery = { user: { firstname: string, lastname: string, roles: Array<{ id: number, shortCode: string, title: string }> } | null };

export type GetUsersQueryVariables = Exact<{
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  userRole?: InputMaybe<UserRole>;
  subtractUsers?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderDirection?: InputMaybe<Scalars['String']>;
}>;


export type GetUsersQuery = { users: { totalCount: number, users: Array<{ id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }> } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { login: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type LogoutMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type LogoutMutation = { logout: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ResetPasswordMutation = { resetPassword: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type ResetPasswordEmailMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ResetPasswordEmailMutation = { resetPasswordEmail: { isSuccess: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SelectRoleMutationVariables = Exact<{
  token: Scalars['String'];
  selectedRoleId: Scalars['Int'];
}>;


export type SelectRoleMutation = { selectRole: { token: string | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SetUserEmailVerifiedMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserEmailVerifiedMutation = { setUserEmailVerified: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type SetUserNotPlaceholderMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserNotPlaceholderMutation = { setUserNotPlaceholder: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdatePasswordMutationVariables = Exact<{
  id: Scalars['Int'];
  password: Scalars['String'];
}>;


export type UpdatePasswordMutation = { updatePassword: { rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Int'];
  user_title?: InputMaybe<Scalars['String']>;
  firstname: Scalars['String'];
  middlename?: InputMaybe<Scalars['String']>;
  lastname: Scalars['String'];
  preferredname?: InputMaybe<Scalars['String']>;
  gender: Scalars['String'];
  nationality: Scalars['Int'];
  birthdate: Scalars['DateTime'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: InputMaybe<Scalars['String']>;
  otherOrganisation?: InputMaybe<Scalars['String']>;
  organizationCountry?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateUserMutation = { updateUser: { user: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type UpdateUserRolesMutationVariables = Exact<{
  id: Scalars['Int'];
  roles?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type UpdateUserRolesMutation = { updateUserRoles: { user: { id: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type VerifyEmailMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type VerifyEmailMutation = { emailVerification: { success: boolean | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateVisitMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
  team: Array<Scalars['Int']> | Scalars['Int'];
  teamLeadUserId: Scalars['Int'];
}>;


export type CreateVisitMutation = { createVisit: { visit: { id: number, proposalPk: number, status: VisitStatus, creatorId: number, teamLead: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }, registrations: Array<{ userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }>, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, instrument: { name: string } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type DeleteVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type DeleteVisitMutation = { deleteVisit: { visit: { id: number, proposalPk: number, status: VisitStatus, creatorId: number } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type VisitFragment = { id: number, proposalPk: number, status: VisitStatus, creatorId: number };

export type GetVisitQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitQuery = { visit: { id: number, proposalPk: number, status: VisitStatus, creatorId: number, registrations: Array<{ userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }>, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, instrument: { name: string } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } } | null };

export type GetVisitsQueryVariables = Exact<{
  filter?: InputMaybe<VisitsFilter>;
}>;


export type GetVisitsQuery = { visits: Array<{ id: number, proposalPk: number, status: VisitStatus, creatorId: number, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, instrument: { name: string } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } }> };

export type UpdateVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
  team?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
  status?: InputMaybe<VisitStatus>;
  teamLeadUserId?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateVisitMutation = { updateVisit: { visit: { id: number, proposalPk: number, status: VisitStatus, creatorId: number, teamLead: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null }, registrations: Array<{ userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null }>, proposal: { primaryKey: number, title: string, abstract: string, statusId: number, publicStatus: ProposalPublicStatus, proposalId: string, finalStatus: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, created: any, updated: any, callId: number, questionaryId: number, notified: boolean, submitted: boolean, managementTimeAllocation: number | null, managementDecisionSubmitted: boolean, instrument: { name: string } | null, status: { id: number, shortCode: string, name: string, description: string, isDefault: boolean } | null, sepMeetingDecision: { proposalPk: number, recommendation: ProposalEndStatus | null, commentForUser: string | null, commentForManagement: string | null, rankOrder: number | null, submitted: boolean, submittedBy: number | null } | null } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type CreateVisitRegistrationMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type CreateVisitRegistrationMutation = { createVisitRegistration: { registration: { userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export type VisitRegistrationFragment = { userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null };

export type GetVisitRegistrationQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitRegistrationQuery = { visitRegistration: { userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null };

export type UpdateVisitRegistrationMutationVariables = Exact<{
  visitId: Scalars['Int'];
  trainingExpiryDate?: InputMaybe<Scalars['DateTime']>;
  isRegistrationSubmitted?: InputMaybe<Scalars['Boolean']>;
  startsAt?: InputMaybe<Scalars['DateTime']>;
  endsAt?: InputMaybe<Scalars['DateTime']>;
}>;


export type UpdateVisitRegistrationMutation = { updateVisitRegistration: { registration: { userId: number, visitId: number, registrationQuestionaryId: number | null, isRegistrationSubmitted: boolean, trainingExpiryDate: any | null, startsAt: any | null, endsAt: any | null, user: { id: number, firstname: string, lastname: string, preferredname: string | null, organisation: string, organizationId: number, position: string, created: any | null, placeholder: boolean | null, email: string | null } | null, questionary: { isCompleted: boolean, questionaryId: number, templateId: number, created: any, steps: Array<{ isCompleted: boolean, topic: { title: string, id: number, templateId: number, sortOrder: number, isEnabled: boolean }, fields: Array<{ answerId: number | null, sortOrder: number, topicId: number, dependenciesOperator: DependenciesLogicOperator | null, value: any | null, question: { id: string, question: string, naturalKey: string, dataType: DataType, categoryId: TemplateCategoryId, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string } }, config: { small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string, minDate: string | null, maxDate: string | null, defaultDate: string | null, includeTime: boolean } | { html: string, plain: string, omitFromPdf: boolean } | { small_label: string, required: boolean, tooltip: string } | { file_type: Array<string>, max_files: number, pdf_page_limit: number, small_label: string, required: boolean, tooltip: string } | { titlePlaceholder: string, questionLabel: string } | { small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { numberValueConstraint: NumberValueConstraint | null, small_label: string, required: boolean, tooltip: string, units: Array<{ id: string, unit: string, quantity: string, symbol: string, siConversionFormula: string }> } | { tooltip: string } | { tooltip: string } | { small_label: string, required: boolean, tooltip: string, max: number | null } | { titlePlaceholder: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, esiTemplateId: number | null, templateCategory: string, required: boolean, small_label: string } | { tooltip: string } | { variant: string, options: Array<string>, isMultipleSelect: boolean, small_label: string, required: boolean, tooltip: string } | { small_label: string, required: boolean, tooltip: string } | { addEntryButtonLabel: string, minEntries: number | null, maxEntries: number | null, templateId: number | null, templateCategory: string, required: boolean, small_label: string } | { min: number | null, max: number | null, multiline: boolean, placeholder: string, small_label: string, required: boolean, tooltip: string, htmlQuestion: string | null, isHtmlQuestion: boolean, isCounterHidden: boolean } | { small_label: string, required: boolean, tooltip: string }, dependencies: Array<{ questionId: string, dependencyId: string, dependencyNaturalKey: string, condition: { condition: EvaluatorOperator, params: any } }> }> }> } } | null, rejection: { reason: string, context: string | null, exception: string | null } | null } };

export const BasicUserDetailsFragmentDoc = gql`
    fragment basicUserDetails on BasicUserDetails {
  id
  firstname
  lastname
  preferredname
  organisation
  organizationId
  position
  created
  placeholder
  email
}
    `;
export const SepFragmentDoc = gql`
    fragment sep on SEP {
  id
  code
  description
  numberRatingsRequired
  active
  sepChair {
    ...basicUserDetails
  }
  sepChairProposalCount
  sepSecretary {
    ...basicUserDetails
  }
  sepSecretaryProposalCount
  proposalCount
}
    ${BasicUserDetailsFragmentDoc}`;
export const CountryFragmentDoc = gql`
    fragment country on Entry {
  id
  value
}
    `;
export const RejectionFragmentDoc = gql`
    fragment rejection on Rejection {
  reason
  context
  exception
}
    `;
export const CallFragmentDoc = gql`
    fragment call on Call {
  id
  shortCode
  startCall
  endCall
  startReview
  endReview
  startSEPReview
  endSEPReview
  startNotify
  endNotify
  startCycle
  endCycle
  cycleComment
  surveyComment
  referenceNumberFormat
  proposalWorkflowId
  templateId
  esiTemplateId
  pdfTemplateId
  allocationTimeUnit
  instruments {
    id
    name
    shortCode
    description
    availabilityTime
    submitted
    scientists {
      ...basicUserDetails
    }
  }
  seps {
    id
    code
  }
  proposalWorkflow {
    id
    name
    description
  }
  template {
    templateId
    name
    isArchived
  }
  proposalCount
  title
  description
  submissionMessage
}
    ${BasicUserDetailsFragmentDoc}`;
export const EsiFragmentDoc = gql`
    fragment esi on ExperimentSafetyInput {
  id
  creatorId
  questionaryId
  isSubmitted
  created
}
    `;
export const FeedbackFragmentDoc = gql`
    fragment feedback on Feedback {
  id
  scheduledEventId
  status
  questionaryId
  creatorId
}
    `;
export const GenericTemplateFragmentDoc = gql`
    fragment genericTemplate on GenericTemplate {
  id
  title
  creatorId
  questionaryId
  created
  proposalPk
  questionId
}
    `;
export const InstrumentFragmentDoc = gql`
    fragment instrument on Instrument {
  id
  name
  shortCode
  description
  managerUserId
  scientists {
    ...basicUserDetails
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const PredefinedMessageFragmentDoc = gql`
    fragment predefinedMessage on PredefinedMessage {
  id
  title
  message
  lastModifiedBy
  dateModified
  modifiedBy {
    ...basicUserDetails
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const CoreTechnicalReviewFragmentDoc = gql`
    fragment coreTechnicalReview on TechnicalReview {
  id
  comment
  publicComment
  timeAllocation
  status
  proposalPk
  submitted
  files
  technicalReviewAssigneeId
  technicalReviewAssignee {
    id
    firstname
    lastname
  }
}
    `;
export const ProposalStatusFragmentDoc = gql`
    fragment proposalStatus on ProposalStatus {
  id
  shortCode
  name
  description
  isDefault
}
    `;
export const SepMeetingDecisionFragmentDoc = gql`
    fragment sepMeetingDecision on SepMeetingDecision {
  proposalPk
  recommendation
  commentForUser
  commentForManagement
  rankOrder
  submitted
  submittedBy
}
    `;
export const ProposalFragmentDoc = gql`
    fragment proposal on Proposal {
  primaryKey
  title
  abstract
  statusId
  status {
    ...proposalStatus
  }
  publicStatus
  proposalId
  finalStatus
  commentForUser
  commentForManagement
  created
  updated
  callId
  questionaryId
  notified
  submitted
  managementTimeAllocation
  managementDecisionSubmitted
  sepMeetingDecision {
    ...sepMeetingDecision
  }
}
    ${ProposalStatusFragmentDoc}
${SepMeetingDecisionFragmentDoc}`;
export const FileMetadataFragmentDoc = gql`
    fragment fileMetadata on FileMetadata {
  fileId
  originalFileName
  mimeType
  sizeInBytes
  createdDate
}
    `;
export const TopicFragmentDoc = gql`
    fragment topic on Topic {
  title
  id
  templateId
  sortOrder
  isEnabled
}
    `;
export const UnitFragmentDoc = gql`
    fragment unit on Unit {
  id
  unit
  quantity
  symbol
  siConversionFormula
}
    `;
export const FieldConfigFragmentDoc = gql`
    fragment fieldConfig on FieldConfig {
  ... on BooleanConfig {
    small_label
    required
    tooltip
  }
  ... on DateConfig {
    small_label
    required
    tooltip
    minDate
    maxDate
    defaultDate
    includeTime
  }
  ... on EmbellishmentConfig {
    html
    plain
    omitFromPdf
  }
  ... on FileUploadConfig {
    file_type
    max_files
    pdf_page_limit
    small_label
    required
    tooltip
  }
  ... on IntervalConfig {
    units {
      ...unit
    }
    small_label
    required
    tooltip
  }
  ... on NumberInputConfig {
    units {
      ...unit
    }
    numberValueConstraint
    small_label
    required
    tooltip
  }
  ... on ProposalBasisConfig {
    tooltip
  }
  ... on ProposalEsiBasisConfig {
    tooltip
  }
  ... on SampleEsiBasisConfig {
    tooltip
  }
  ... on SampleBasisConfig {
    titlePlaceholder
  }
  ... on SampleDeclarationConfig {
    addEntryButtonLabel
    minEntries
    maxEntries
    templateId
    esiTemplateId
    templateCategory
    required
    small_label
  }
  ... on SubTemplateConfig {
    addEntryButtonLabel
    minEntries
    maxEntries
    templateId
    templateCategory
    required
    small_label
  }
  ... on SelectionFromOptionsConfig {
    variant
    options
    isMultipleSelect
    small_label
    required
    tooltip
  }
  ... on TextInputConfig {
    min
    max
    multiline
    placeholder
    small_label
    required
    tooltip
    htmlQuestion
    isHtmlQuestion
    isCounterHidden
  }
  ... on ShipmentBasisConfig {
    small_label
    required
    tooltip
  }
  ... on RichTextInputConfig {
    small_label
    required
    tooltip
    max
  }
  ... on VisitBasisConfig {
    small_label
    required
    tooltip
  }
  ... on GenericTemplateBasisConfig {
    titlePlaceholder
    questionLabel
  }
  ... on FeedbackBasisConfig {
    small_label
    required
    tooltip
  }
}
    ${UnitFragmentDoc}`;
export const QuestionFragmentDoc = gql`
    fragment question on Question {
  id
  question
  naturalKey
  dataType
  categoryId
  config {
    ...fieldConfig
  }
}
    ${FieldConfigFragmentDoc}`;
export const FieldConditionFragmentDoc = gql`
    fragment fieldCondition on FieldCondition {
  condition
  params
}
    `;
export const AnswerFragmentDoc = gql`
    fragment answer on Answer {
  answerId
  question {
    ...question
  }
  sortOrder
  topicId
  config {
    ...fieldConfig
  }
  dependencies {
    questionId
    dependencyId
    dependencyNaturalKey
    condition {
      ...fieldCondition
    }
  }
  dependenciesOperator
  value
}
    ${QuestionFragmentDoc}
${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const QuestionaryStepFragmentDoc = gql`
    fragment questionaryStep on QuestionaryStep {
  topic {
    ...topic
  }
  isCompleted
  fields {
    ...answer
  }
}
    ${TopicFragmentDoc}
${AnswerFragmentDoc}`;
export const QuestionaryFragmentDoc = gql`
    fragment questionary on Questionary {
  questionaryId
  templateId
  created
  steps {
    ...questionaryStep
  }
}
    ${QuestionaryStepFragmentDoc}`;
export const CoreReviewFragmentDoc = gql`
    fragment coreReview on Review {
  id
  userID
  status
  comment
  grade
  sepID
}
    `;
export const SampleEsiFragmentDoc = gql`
    fragment sampleEsi on SampleExperimentSafetyInput {
  sampleId
  esiId
  questionaryId
  isSubmitted
}
    `;
export const SampleFragmentDoc = gql`
    fragment sample on Sample {
  id
  title
  creatorId
  questionaryId
  safetyStatus
  safetyComment
  isPostProposalSubmission
  created
  proposalPk
  questionId
}
    `;
export const ScheduledEventCoreFragmentDoc = gql`
    fragment scheduledEventCore on ScheduledEventCore {
  id
  proposalPk
  bookingType
  startsAt
  endsAt
  status
  localContactId
}
    `;
export const ShipmentFragmentDoc = gql`
    fragment shipment on Shipment {
  id
  title
  proposalPk
  status
  externalRef
  questionaryId
  scheduledEventId
  creatorId
  created
  proposal {
    proposalId
  }
}
    `;
export const QuestionTemplateRelationFragmentDoc = gql`
    fragment questionTemplateRelation on QuestionTemplateRelation {
  question {
    ...question
  }
  sortOrder
  topicId
  config {
    ...fieldConfig
  }
  dependencies {
    questionId
    dependencyId
    dependencyNaturalKey
    condition {
      ...fieldCondition
    }
  }
  dependenciesOperator
}
    ${QuestionFragmentDoc}
${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const TemplateFragmentDoc = gql`
    fragment template on Template {
  steps {
    topic {
      ...topic
    }
    fields {
      ...questionTemplateRelation
    }
  }
  isArchived
  questionaryCount
  templateId
  groupId
  name
  description
  complementaryQuestions {
    ...question
  }
  group {
    groupId
    categoryId
  }
  pdfTemplate {
    pdfTemplateId
    templateData
  }
}
    ${TopicFragmentDoc}
${QuestionTemplateRelationFragmentDoc}
${QuestionFragmentDoc}`;
export const TemplateMetadataFragmentDoc = gql`
    fragment templateMetadata on Template {
  templateId
  name
  description
  isArchived
  steps {
    topic {
      ...topic
    }
  }
}
    ${TopicFragmentDoc}`;
export const TemplateStepFragmentDoc = gql`
    fragment templateStep on TemplateStep {
  topic {
    title
    id
    sortOrder
    isEnabled
  }
  fields {
    ...questionTemplateRelation
  }
}
    ${QuestionTemplateRelationFragmentDoc}`;
export const QuestionComparisonFragmentDoc = gql`
    fragment questionComparison on QuestionComparison {
  existingQuestion {
    ...question
  }
  newQuestion {
    ...question
  }
  status
  conflictResolutionStrategy
}
    ${QuestionFragmentDoc}`;
export const TemplateValidationDataFragmentDoc = gql`
    fragment templateValidationData on TemplateValidationData {
  isValid
  errors
  questionComparisons {
    ...questionComparison
  }
  subTemplateValidationData {
    isValid
    errors
    questionComparisons {
      ...questionComparison
    }
  }
}
    ${QuestionComparisonFragmentDoc}`;
export const VisitFragmentDoc = gql`
    fragment visit on Visit {
  id
  proposalPk
  status
  creatorId
}
    `;
export const VisitRegistrationFragmentDoc = gql`
    fragment visitRegistration on VisitRegistration {
  userId
  visitId
  registrationQuestionaryId
  isRegistrationSubmitted
  trainingExpiryDate
  startsAt
  endsAt
}
    `;
export const AssignProposalsToSepDocument = gql`
    mutation assignProposalsToSep($proposals: [ProposalPkWithCallId!]!, $sepId: Int!) {
  assignProposalsToSep(proposals: $proposals, sepId: $sepId) {
    rejection {
      ...rejection
    }
    nextProposalStatus {
      id
      shortCode
      name
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AssignReviewersToSepDocument = gql`
    mutation assignReviewersToSEP($memberIds: [Int!]!, $sepId: Int!) {
  assignReviewersToSEP(memberIds: $memberIds, sepId: $sepId) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AssignChairOrSecretaryDocument = gql`
    mutation assignChairOrSecretary($assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSEPInput!) {
  assignChairOrSecretary(
    assignChairOrSecretaryToSEPInput: $assignChairOrSecretaryToSEPInput
  ) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AssignSepReviewersToProposalDocument = gql`
    mutation assignSepReviewersToProposal($memberIds: [Int!]!, $sepId: Int!, $proposalPk: Int!) {
  assignSepReviewersToProposal(
    memberIds: $memberIds
    sepId: $sepId
    proposalPk: $proposalPk
  ) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateSepDocument = gql`
    mutation createSEP($code: String!, $description: String!, $numberRatingsRequired: Int!, $active: Boolean!) {
  createSEP(
    code: $code
    description: $description
    numberRatingsRequired: $numberRatingsRequired
    active: $active
  ) {
    sep {
      ...sep
    }
    rejection {
      ...rejection
    }
  }
}
    ${SepFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteSepDocument = gql`
    mutation deleteSEP($id: Int!) {
  deleteSEP(id: $id) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetInstrumentsBySepDocument = gql`
    query getInstrumentsBySEP($sepId: Int!, $callId: Int!) {
  instrumentsBySep(sepId: $sepId, callId: $callId) {
    id
    name
    shortCode
    description
    availabilityTime
    submitted
    scientists {
      ...basicUserDetails
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetUserSepsDocument = gql`
    query getUserSeps {
  me {
    seps {
      ...sep
    }
  }
}
    ${SepFragmentDoc}`;
export const GetSepDocument = gql`
    query getSEP($id: Int!) {
  sep(id: $id) {
    ...sep
  }
}
    ${SepFragmentDoc}`;
export const GetSepMembersDocument = gql`
    query getSEPMembers($sepId: Int!) {
  sepMembers(sepId: $sepId) {
    userId
    sepId
    role {
      id
      shortCode
      title
    }
    user {
      ...basicUserDetails
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetSepProposalDocument = gql`
    query getSEPProposal($sepId: Int!, $proposalPk: Int!) {
  sepProposal(sepId: $sepId, proposalPk: $proposalPk) {
    proposalPk
    sepId
    sepTimeAllocation
    instrumentSubmitted
    proposal {
      ...proposal
      proposer {
        ...basicUserDetails
      }
      users {
        ...basicUserDetails
      }
      questionary {
        ...questionary
      }
      technicalReview {
        ...coreTechnicalReview
        reviewer {
          ...basicUserDetails
        }
      }
      reviews {
        id
        grade
        comment
        status
        userID
        sepID
        reviewer {
          firstname
          lastname
          id
        }
      }
      instrument {
        id
        name
        shortCode
      }
      call {
        id
        shortCode
        allocationTimeUnit
      }
    }
    assignments {
      proposalPk
      sepMemberUserId
      dateAssigned
      user {
        ...basicUserDetails
      }
      role {
        id
        shortCode
        title
      }
      review {
        id
        status
        comment
        grade
        sepID
      }
    }
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${CoreTechnicalReviewFragmentDoc}`;
export const GetSepProposalsDocument = gql`
    query getSEPProposals($sepId: Int!, $callId: Int) {
  sepProposals(sepId: $sepId, callId: $callId) {
    proposalPk
    dateAssigned
    sepId
    sepTimeAllocation
    proposal {
      title
      primaryKey
      proposalId
      proposer {
        id
        organizationId
      }
      status {
        ...proposalStatus
      }
      users {
        id
        organizationId
      }
    }
    assignments {
      proposalPk
      sepMemberUserId
      dateAssigned
      user {
        ...basicUserDetails
      }
      role {
        id
        shortCode
        title
      }
      review {
        id
        status
        comment
        grade
        sepID
      }
    }
  }
}
    ${ProposalStatusFragmentDoc}
${BasicUserDetailsFragmentDoc}`;
export const SepProposalsByInstrumentDocument = gql`
    query sepProposalsByInstrument($instrumentId: Int!, $sepId: Int!, $callId: Int!) {
  sepProposalsByInstrument(
    instrumentId: $instrumentId
    sepId: $sepId
    callId: $callId
  ) {
    sepTimeAllocation
    proposal {
      primaryKey
      title
      proposalId
      status {
        ...proposalStatus
      }
      sepMeetingDecision {
        ...sepMeetingDecision
      }
      reviews {
        id
        comment
        grade
        status
      }
      technicalReview {
        publicComment
        status
        timeAllocation
      }
    }
    assignments {
      sepMemberUserId
    }
  }
}
    ${ProposalStatusFragmentDoc}
${SepMeetingDecisionFragmentDoc}`;
export const GetSepReviewersDocument = gql`
    query getSEPReviewers($sepId: Int!) {
  sepReviewers(sepId: $sepId) {
    userId
    sepId
    role {
      id
      shortCode
      title
    }
    user {
      ...basicUserDetails
    }
    proposalsCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetSePsDocument = gql`
    query getSEPs($filter: SEPsFilter) {
  seps(filter: $filter) {
    seps {
      ...sep
    }
    totalCount
  }
}
    ${SepFragmentDoc}`;
export const RemoveProposalsFromSepDocument = gql`
    mutation removeProposalsFromSep($proposalPks: [Int!]!, $sepId: Int!) {
  removeProposalsFromSep(proposalPks: $proposalPks, sepId: $sepId) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const RemoveMemberFromSepDocument = gql`
    mutation removeMemberFromSep($memberId: Int!, $sepId: Int!, $roleId: UserRole!) {
  removeMemberFromSep(memberId: $memberId, sepId: $sepId, roleId: $roleId) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const RemoveMemberFromSepProposalDocument = gql`
    mutation removeMemberFromSEPProposal($memberId: Int!, $sepId: Int!, $proposalPk: Int!) {
  removeMemberFromSEPProposal(
    memberId: $memberId
    sepId: $sepId
    proposalPk: $proposalPk
  ) {
    rejection {
      ...rejection
    }
    sep {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const ReorderSepMeetingDecisionProposalsDocument = gql`
    mutation reorderSepMeetingDecisionProposals($reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput!) {
  reorderSepMeetingDecisionProposals(
    reorderSepMeetingDecisionProposalsInput: $reorderSepMeetingDecisionProposalsInput
  ) {
    rejection {
      ...rejection
    }
    sepMeetingDecision {
      proposalPk
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SaveSepMeetingDecisionDocument = gql`
    mutation saveSepMeetingDecision($saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput!) {
  saveSepMeetingDecision(
    saveSepMeetingDecisionInput: $saveSepMeetingDecisionInput
  ) {
    rejection {
      ...rejection
    }
    sepMeetingDecision {
      proposalPk
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateSepDocument = gql`
    mutation updateSEP($id: Int!, $code: String!, $description: String!, $numberRatingsRequired: Int!, $active: Boolean!) {
  updateSEP(
    id: $id
    code: $code
    description: $description
    numberRatingsRequired: $numberRatingsRequired
    active: $active
  ) {
    sep {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateSepTimeAllocationDocument = gql`
    mutation updateSEPTimeAllocation($sepId: Int!, $proposalPk: Int!, $sepTimeAllocation: Int) {
  updateSEPTimeAllocation(
    sepId: $sepId
    proposalPk: $proposalPk
    sepTimeAllocation: $sepTimeAllocation
  ) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AddClientLogDocument = gql`
    mutation addClientLog($error: String!) {
  addClientLog(error: $error) {
    isSuccess
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateApiAccessTokenDocument = gql`
    mutation createApiAccessToken($name: String!, $accessPermissions: String!) {
  createApiAccessToken(
    createApiAccessTokenInput: {name: $name, accessPermissions: $accessPermissions}
  ) {
    rejection {
      ...rejection
    }
    apiAccessToken {
      id
      name
      accessToken
      accessPermissions
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateInstitutionDocument = gql`
    mutation createInstitution($name: String!, $country: Int!, $verified: Boolean!) {
  createInstitution(name: $name, country: $country, verified: $verified) {
    institution {
      id
      name
      country {
        ...country
      }
      verified
    }
    rejection {
      ...rejection
    }
  }
}
    ${CountryFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteApiAccessTokenDocument = gql`
    mutation deleteApiAccessToken($accessTokenId: String!) {
  deleteApiAccessToken(deleteApiAccessTokenInput: {accessTokenId: $accessTokenId}) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const DeleteInstitutionDocument = gql`
    mutation deleteInstitution($id: Int!) {
  deleteInstitution(id: $id) {
    institution {
      id
      verified
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetAllApiAccessTokensAndPermissionsDocument = gql`
    query getAllApiAccessTokensAndPermissions {
  allAccessTokensAndPermissions {
    id
    name
    accessToken
    accessPermissions
  }
}
    `;
export const GetAllQueriesAndMutationsDocument = gql`
    query getAllQueriesAndMutations {
  queriesAndMutations {
    queries
    mutations
  }
}
    `;
export const GetFeaturesDocument = gql`
    query getFeatures {
  features {
    id
    isEnabled
    description
  }
}
    `;
export const GetInstitutionsDocument = gql`
    query getInstitutions($filter: InstitutionsFilter) {
  institutions(filter: $filter) {
    id
    name
    verified
  }
}
    `;
export const GetInstitutionsWithCountryDocument = gql`
    query getInstitutionsWithCountry($filter: InstitutionsFilter) {
  institutions(filter: $filter) {
    id
    name
    verified
    country {
      ...country
    }
  }
}
    ${CountryFragmentDoc}`;
export const GetPageContentDocument = gql`
    query getPageContent($pageId: PageName!) {
  getPageContent(pageId: $pageId)
}
    `;
export const GetQuantitiesDocument = gql`
    query getQuantities {
  quantities {
    id
  }
}
    `;
export const GetSettingsDocument = gql`
    query getSettings {
  settings {
    id
    settingsValue
    description
  }
}
    `;
export const MergeInstitutionsDocument = gql`
    mutation mergeInstitutions($institutionIdFrom: Int!, $institutionIdInto: Int!, $newTitle: String!) {
  mergeInstitutions(
    institutionIdFrom: $institutionIdFrom
    institutionIdInto: $institutionIdInto
    newTitle: $newTitle
  ) {
    institution {
      id
      verified
      name
      country {
        ...country
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${CountryFragmentDoc}
${RejectionFragmentDoc}`;
export const PrepareDbDocument = gql`
    mutation prepareDB($includeSeeds: Boolean!) {
  prepareDB(includeSeeds: $includeSeeds) {
    log
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SetPageContentDocument = gql`
    mutation setPageContent($id: PageName!, $text: String!) {
  setPageContent(id: $id, text: $text) {
    page {
      id
      content
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateApiAccessTokenDocument = gql`
    mutation updateApiAccessToken($accessTokenId: String!, $name: String!, $accessPermissions: String!) {
  updateApiAccessToken(
    updateApiAccessTokenInput: {accessTokenId: $accessTokenId, name: $name, accessPermissions: $accessPermissions}
  ) {
    rejection {
      ...rejection
    }
    apiAccessToken {
      id
      name
      accessToken
      accessPermissions
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateInstitutionDocument = gql`
    mutation updateInstitution($id: Int!, $name: String!, $country: Int!, $verified: Boolean!) {
  updateInstitution(id: $id, name: $name, country: $country, verified: $verified) {
    institution {
      id
      verified
      name
      country {
        ...country
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${CountryFragmentDoc}
${RejectionFragmentDoc}`;
export const AssignInstrumentsToCallDocument = gql`
    mutation assignInstrumentsToCall($instrumentIds: [Int!]!, $callId: Int!) {
  assignInstrumentsToCall(
    assignInstrumentsToCallInput: {instrumentIds: $instrumentIds, callId: $callId}
  ) {
    rejection {
      ...rejection
    }
    call {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateCallDocument = gql`
    mutation createCall($shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $submissionMessage: String, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $pdfTemplateId: Int, $title: String, $description: String, $seps: [Int!]) {
  createCall(
    createCallInput: {shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, submissionMessage: $submissionMessage, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, pdfTemplateId: $pdfTemplateId, title: $title, description: $description, seps: $seps}
  ) {
    rejection {
      ...rejection
    }
    call {
      ...call
    }
  }
}
    ${RejectionFragmentDoc}
${CallFragmentDoc}`;
export const DeleteCallDocument = gql`
    mutation deleteCall($id: Int!) {
  deleteCall(id: $id) {
    rejection {
      ...rejection
    }
    call {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetCallDocument = gql`
    query getCall($callId: Int!) {
  call(callId: $callId) {
    ...call
  }
}
    ${CallFragmentDoc}`;
export const GetCallsDocument = gql`
    query getCalls($filter: CallsFilter) {
  calls(filter: $filter) {
    ...call
  }
}
    ${CallFragmentDoc}`;
export const GetCallsByInstrumentScientistDocument = gql`
    query getCallsByInstrumentScientist($scientistId: Int!) {
  callsByInstrumentScientist(scientistId: $scientistId) {
    ...call
  }
}
    ${CallFragmentDoc}`;
export const RemoveAssignedInstrumentFromCallDocument = gql`
    mutation removeAssignedInstrumentFromCall($instrumentId: Int!, $callId: Int!) {
  removeAssignedInstrumentFromCall(
    removeAssignedInstrumentFromCallInput: {instrumentId: $instrumentId, callId: $callId}
  ) {
    rejection {
      ...rejection
    }
    call {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateCallDocument = gql`
    mutation updateCall($id: Int!, $shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $submissionMessage: String, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $pdfTemplateId: Int, $title: String, $description: String, $seps: [Int!]) {
  updateCall(
    updateCallInput: {id: $id, shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, submissionMessage: $submissionMessage, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, pdfTemplateId: $pdfTemplateId, title: $title, description: $description, seps: $seps}
  ) {
    rejection {
      ...rejection
    }
    call {
      ...call
    }
  }
}
    ${RejectionFragmentDoc}
${CallFragmentDoc}`;
export const CreateEsiDocument = gql`
    mutation createEsi($scheduledEventId: Int!) {
  createEsi(scheduledEventId: $scheduledEventId) {
    esi {
      ...esi
      questionary {
        isCompleted
        ...questionary
      }
      sampleEsis {
        sample {
          ...sample
        }
        ...sampleEsi
        questionary {
          isCompleted
        }
      }
      proposal {
        primaryKey
        proposalId
        title
        samples {
          ...sample
        }
        questionary {
          ...questionary
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${EsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${SampleEsiFragmentDoc}
${RejectionFragmentDoc}`;
export const GetEsiDocument = gql`
    query getEsi($esiId: Int!) {
  esi(esiId: $esiId) {
    ...esi
    questionary {
      isCompleted
      ...questionary
    }
    sampleEsis {
      sample {
        ...sample
      }
      ...sampleEsi
      questionary {
        isCompleted
      }
    }
    proposal {
      primaryKey
      proposalId
      title
      samples {
        ...sample
      }
      questionary {
        ...questionary
      }
    }
  }
}
    ${EsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${SampleEsiFragmentDoc}`;
export const UpdateEsiDocument = gql`
    mutation updateEsi($esiId: Int!, $isSubmitted: Boolean) {
  updateEsi(esiId: $esiId, isSubmitted: $isSubmitted) {
    esi {
      ...esi
      questionary {
        isCompleted
        ...questionary
      }
      sampleEsis {
        sample {
          ...sample
        }
        ...sampleEsi
        questionary {
          isCompleted
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${EsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${SampleEsiFragmentDoc}
${RejectionFragmentDoc}`;
export const GetEventLogsDocument = gql`
    query getEventLogs($eventType: String!, $changedObjectId: String!) {
  eventLogs(eventType: $eventType, changedObjectId: $changedObjectId) {
    id
    eventType
    changedBy {
      id
      firstname
      lastname
      email
    }
    eventTStamp
    rowData
    changedObjectId
  }
}
    `;
export const CreateFeedbackDocument = gql`
    mutation createFeedback($scheduledEventId: Int!) {
  createFeedback(scheduledEventId: $scheduledEventId) {
    feedback {
      ...feedback
      questionary {
        ...questionary
        isCompleted
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${FeedbackFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const GetFeedbackDocument = gql`
    query getFeedback($feedbackId: Int!) {
  feedback(feedbackId: $feedbackId) {
    ...feedback
    questionary {
      ...questionary
      isCompleted
    }
  }
}
    ${FeedbackFragmentDoc}
${QuestionaryFragmentDoc}`;
export const UpdateFeedbackDocument = gql`
    mutation updateFeedback($feedbackId: Int!, $status: FeedbackStatus) {
  updateFeedback(feedbackId: $feedbackId, status: $status) {
    feedback {
      ...feedback
      questionary {
        ...questionary
        isCompleted
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${FeedbackFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const CloneGenericTemplateDocument = gql`
    mutation cloneGenericTemplate($genericTemplateId: Int!, $title: String) {
  cloneGenericTemplate(genericTemplateId: $genericTemplateId, title: $title) {
    genericTemplate {
      ...genericTemplate
      questionary {
        isCompleted
        ...questionary
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${GenericTemplateFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateGenericTemplateDocument = gql`
    mutation createGenericTemplate($title: String!, $templateId: Int!, $proposalPk: Int!, $questionId: String!) {
  createGenericTemplate(
    title: $title
    templateId: $templateId
    proposalPk: $proposalPk
    questionId: $questionId
  ) {
    genericTemplate {
      ...genericTemplate
      questionary {
        isCompleted
        ...questionary
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${GenericTemplateFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteGenericTemplateDocument = gql`
    mutation deleteGenericTemplate($genericTemplateId: Int!) {
  deleteGenericTemplate(genericTemplateId: $genericTemplateId) {
    genericTemplate {
      ...genericTemplate
    }
    rejection {
      ...rejection
    }
  }
}
    ${GenericTemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const GetGenericTemplateDocument = gql`
    query getGenericTemplate($genericTemplateId: Int!) {
  genericTemplate(genericTemplateId: $genericTemplateId) {
    ...genericTemplate
    questionary {
      isCompleted
      ...questionary
    }
  }
}
    ${GenericTemplateFragmentDoc}
${QuestionaryFragmentDoc}`;
export const GetGenericTemplatesWithProposalDataDocument = gql`
    query getGenericTemplatesWithProposalData($filter: GenericTemplatesFilter) {
  genericTemplates(filter: $filter) {
    ...genericTemplate
    proposal {
      primaryKey
      proposalId
    }
  }
}
    ${GenericTemplateFragmentDoc}`;
export const GetGenericTemplatesWithQuestionaryStatusDocument = gql`
    query getGenericTemplatesWithQuestionaryStatus($filter: GenericTemplatesFilter) {
  genericTemplates(filter: $filter) {
    ...genericTemplate
    questionary {
      isCompleted
    }
  }
}
    ${GenericTemplateFragmentDoc}`;
export const UpdateGenericTemplateDocument = gql`
    mutation updateGenericTemplate($genericTemplateId: Int!, $title: String) {
  updateGenericTemplate(genericTemplateId: $genericTemplateId, title: $title) {
    genericTemplate {
      ...genericTemplate
    }
    rejection {
      ...rejection
    }
  }
}
    ${GenericTemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const AssignProposalsToInstrumentDocument = gql`
    mutation assignProposalsToInstrument($proposals: [ProposalPkWithCallId!]!, $instrumentId: Int!) {
  assignProposalsToInstrument(proposals: $proposals, instrumentId: $instrumentId) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const AssignScientistsToInstrumentDocument = gql`
    mutation assignScientistsToInstrument($scientistIds: [Int!]!, $instrumentId: Int!) {
  assignScientistsToInstrument(
    scientistIds: $scientistIds
    instrumentId: $instrumentId
  ) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const CreateInstrumentDocument = gql`
    mutation createInstrument($name: String!, $shortCode: String!, $description: String!, $managerUserId: Int!) {
  createInstrument(
    name: $name
    shortCode: $shortCode
    description: $description
    managerUserId: $managerUserId
  ) {
    instrument {
      ...instrument
    }
    rejection {
      ...rejection
    }
  }
}
    ${InstrumentFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteInstrumentDocument = gql`
    mutation deleteInstrument($id: Int!) {
  deleteInstrument(id: $id) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetInstrumentsDocument = gql`
    query getInstruments($callIds: [Int!]) {
  instruments(callIds: $callIds) {
    instruments {
      ...instrument
    }
    totalCount
  }
}
    ${InstrumentFragmentDoc}`;
export const GetUserInstrumentsDocument = gql`
    query getUserInstruments {
  me {
    instruments {
      ...instrument
    }
  }
}
    ${InstrumentFragmentDoc}`;
export const RemoveProposalsFromInstrumentDocument = gql`
    mutation removeProposalsFromInstrument($proposalPks: [Int!]!) {
  removeProposalsFromInstrument(proposalPks: $proposalPks) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const RemoveScientistFromInstrumentDocument = gql`
    mutation removeScientistFromInstrument($scientistId: Int!, $instrumentId: Int!) {
  removeScientistFromInstrument(
    scientistId: $scientistId
    instrumentId: $instrumentId
  ) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const SetInstrumentAvailabilityTimeDocument = gql`
    mutation setInstrumentAvailabilityTime($callId: Int!, $instrumentId: Int!, $availabilityTime: Int!) {
  setInstrumentAvailabilityTime(
    callId: $callId
    instrumentId: $instrumentId
    availabilityTime: $availabilityTime
  ) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const SubmitInstrumentDocument = gql`
    mutation submitInstrument($callId: Int!, $instrumentId: Int!, $sepId: Int!) {
  submitInstrument(callId: $callId, instrumentId: $instrumentId, sepId: $sepId) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateInstrumentDocument = gql`
    mutation updateInstrument($id: Int!, $name: String!, $shortCode: String!, $description: String!, $managerUserId: Int!) {
  updateInstrument(
    id: $id
    name: $name
    shortCode: $shortCode
    description: $description
    managerUserId: $managerUserId
  ) {
    instrument {
      ...instrument
    }
    rejection {
      ...rejection
    }
  }
}
    ${InstrumentFragmentDoc}
${RejectionFragmentDoc}`;
export const CreatePredefinedMessageDocument = gql`
    mutation createPredefinedMessage($input: CreatePredefinedMessageInput!) {
  createPredefinedMessage(createPredefinedMessageInput: $input) {
    predefinedMessage {
      ...predefinedMessage
    }
    rejection {
      ...rejection
    }
  }
}
    ${PredefinedMessageFragmentDoc}
${RejectionFragmentDoc}`;
export const DeletePredefinedMessageDocument = gql`
    mutation deletePredefinedMessage($input: DeletePredefinedMessageInput!) {
  deletePredefinedMessage(deletePredefinedMessageInput: $input) {
    predefinedMessage {
      ...predefinedMessage
    }
    rejection {
      ...rejection
    }
  }
}
    ${PredefinedMessageFragmentDoc}
${RejectionFragmentDoc}`;
export const GetPredefinedMessagesDocument = gql`
    query getPredefinedMessages($filter: PredefinedMessagesFilter) {
  predefinedMessages(filter: $filter) {
    ...predefinedMessage
  }
}
    ${PredefinedMessageFragmentDoc}`;
export const UpdatePredefinedMessageDocument = gql`
    mutation updatePredefinedMessage($input: UpdatePredefinedMessageInput!) {
  updatePredefinedMessage(updatePredefinedMessageInput: $input) {
    predefinedMessage {
      ...predefinedMessage
    }
    rejection {
      ...rejection
    }
  }
}
    ${PredefinedMessageFragmentDoc}
${RejectionFragmentDoc}`;
export const AdministrationProposalDocument = gql`
    mutation administrationProposal($proposalPk: Int!, $finalStatus: ProposalEndStatus, $statusId: Int, $commentForUser: String, $commentForManagement: String, $managementTimeAllocation: Int, $managementDecisionSubmitted: Boolean) {
  administrationProposal(
    proposalPk: $proposalPk
    finalStatus: $finalStatus
    statusId: $statusId
    commentForUser: $commentForUser
    commentForManagement: $commentForManagement
    managementTimeAllocation: $managementTimeAllocation
    managementDecisionSubmitted: $managementDecisionSubmitted
  ) {
    proposal {
      primaryKey
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const ChangeProposalsStatusDocument = gql`
    mutation changeProposalsStatus($proposals: [ProposalPkWithCallId!]!, $statusId: Int!) {
  changeProposalsStatus(
    changeProposalsStatusInput: {proposals: $proposals, statusId: $statusId}
  ) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const CloneProposalsDocument = gql`
    mutation cloneProposals($proposalsToClonePk: [Int!]!, $callId: Int!) {
  cloneProposals(
    cloneProposalsInput: {proposalsToClonePk: $proposalsToClonePk, callId: $callId}
  ) {
    proposals {
      ...proposal
      proposer {
        ...basicUserDetails
      }
      users {
        ...basicUserDetails
      }
      questionary {
        ...questionary
        isCompleted
      }
      technicalReview {
        ...coreTechnicalReview
      }
      reviews {
        id
        grade
        comment
        status
        userID
        sepID
        reviewer {
          firstname
          lastname
          id
        }
      }
      instrument {
        id
        name
        shortCode
      }
      call {
        id
        shortCode
        isActive
        referenceNumberFormat
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${CoreTechnicalReviewFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateProposalDocument = gql`
    mutation createProposal($callId: Int!) {
  createProposal(callId: $callId) {
    proposal {
      primaryKey
      status {
        ...proposalStatus
      }
      proposalId
      questionaryId
      questionary {
        ...questionary
        isCompleted
      }
      proposer {
        ...basicUserDetails
      }
      users {
        ...basicUserDetails
      }
      samples {
        ...sample
        questionary {
          isCompleted
        }
      }
      genericTemplates {
        ...genericTemplate
        questionary {
          isCompleted
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalStatusFragmentDoc}
${QuestionaryFragmentDoc}
${BasicUserDetailsFragmentDoc}
${SampleFragmentDoc}
${GenericTemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteProposalDocument = gql`
    mutation deleteProposal($proposalPk: Int!) {
  deleteProposal(proposalPk: $proposalPk) {
    rejection {
      ...rejection
    }
    proposal {
      primaryKey
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetInstrumentScientistProposalsDocument = gql`
    query getInstrumentScientistProposals($filter: ProposalsFilter, $offset: Int, $first: Int) {
  instrumentScientistProposals(filter: $filter, offset: $offset, first: $first) {
    proposals {
      primaryKey
      proposalId
      title
      submitted
      finalStatus
      technicalReviewAssigneeId
      technicalReviewAssigneeFirstName
      technicalReviewAssigneeLastName
      technicalStatus
      technicalTimeAllocation
      statusName
      technicalReviewSubmitted
      instrumentId
      instrumentName
      allocationTimeUnit
      callShortCode
      statusName
      sepCode
    }
    totalCount
  }
}
    `;
export const GetMyProposalsDocument = gql`
    query getMyProposals($filter: UserProposalsFilter) {
  me {
    proposals(filter: $filter) {
      ...proposal
    }
  }
}
    ${ProposalFragmentDoc}`;
export const GetProposalDocument = gql`
    query getProposal($primaryKey: Int!) {
  proposal(primaryKey: $primaryKey) {
    ...proposal
    proposer {
      ...basicUserDetails
    }
    users {
      ...basicUserDetails
    }
    questionary {
      ...questionary
      isCompleted
    }
    technicalReview {
      ...coreTechnicalReview
      reviewer {
        ...basicUserDetails
      }
    }
    reviews {
      id
      grade
      comment
      status
      userID
      sepID
      reviewer {
        firstname
        lastname
        id
      }
    }
    instrument {
      id
      name
      shortCode
      beamlineManager {
        id
        firstname
        lastname
      }
      scientists {
        id
        firstname
        lastname
      }
    }
    call {
      id
      shortCode
      isActive
      allocationTimeUnit
      referenceNumberFormat
    }
    sep {
      id
      code
    }
    samples {
      ...sample
      questionary {
        isCompleted
      }
    }
    genericTemplates {
      ...genericTemplate
      questionary {
        isCompleted
      }
    }
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${CoreTechnicalReviewFragmentDoc}
${SampleFragmentDoc}
${GenericTemplateFragmentDoc}`;
export const GetProposalsDocument = gql`
    query getProposals($filter: ProposalsFilter) {
  proposals(filter: $filter) {
    proposals {
      ...proposal
      proposer {
        ...basicUserDetails
      }
      reviews {
        id
        grade
        comment
        status
        userID
        sepID
        reviewer {
          firstname
          lastname
          id
        }
      }
      users {
        ...basicUserDetails
      }
      technicalReview {
        ...coreTechnicalReview
        reviewer {
          ...basicUserDetails
        }
      }
      instrument {
        id
        name
      }
      call {
        id
        shortCode
      }
      sep {
        id
        code
      }
    }
    totalCount
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${CoreTechnicalReviewFragmentDoc}`;
export const GetProposalsCoreDocument = gql`
    query getProposalsCore($filter: ProposalsFilter, $first: Int, $offset: Int, $sortField: String, $sortDirection: String, $searchText: String) {
  proposalsView(
    filter: $filter
    first: $first
    offset: $offset
    sortField: $sortField
    sortDirection: $sortDirection
    searchText: $searchText
  ) {
    proposalViews {
      primaryKey
      title
      statusId
      statusName
      statusDescription
      proposalId
      rankOrder
      finalStatus
      notified
      managementTimeAllocation
      technicalTimeAllocation
      technicalReviewAssigneeId
      technicalReviewAssigneeFirstName
      technicalReviewAssigneeLastName
      technicalStatus
      instrumentName
      callShortCode
      sepCode
      sepId
      reviewAverage
      reviewDeviation
      instrumentId
      callId
      submitted
      allocationTimeUnit
    }
    totalCount
  }
}
    `;
export const NotifyProposalDocument = gql`
    mutation notifyProposal($proposalPk: Int!) {
  notifyProposal(proposalPk: $proposalPk) {
    proposal {
      primaryKey
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SubmitProposalDocument = gql`
    mutation submitProposal($proposalPk: Int!) {
  submitProposal(proposalPk: $proposalPk) {
    proposal {
      ...proposal
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateProposalDocument = gql`
    mutation updateProposal($proposalPk: Int!, $title: String, $abstract: String, $users: [Int!], $proposerId: Int) {
  updateProposal(
    proposalPk: $proposalPk
    title: $title
    abstract: $abstract
    users: $users
    proposerId: $proposerId
  ) {
    proposal {
      primaryKey
      title
      abstract
      proposer {
        ...basicUserDetails
      }
      users {
        ...basicUserDetails
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${BasicUserDetailsFragmentDoc}
${RejectionFragmentDoc}`;
export const GetUserProposalBookingsWithEventsDocument = gql`
    query getUserProposalBookingsWithEvents($endsAfter: DateTime, $status: [ProposalBookingStatusCore!], $instrumentId: Int) {
  me {
    proposals(filter: {instrumentId: $instrumentId}) {
      primaryKey
      title
      proposalId
      finalStatus
      managementDecisionSubmitted
      proposer {
        ...basicUserDetails
      }
      users {
        ...basicUserDetails
      }
      proposalBookingCore(filter: {status: $status}) {
        scheduledEvents(filter: {endsAfter: $endsAfter, status: $status}) {
          id
          startsAt
          endsAt
          bookingType
          status
          visit {
            ...visit
            teamLead {
              ...basicUserDetails
            }
            registrations {
              ...visitRegistration
              user {
                ...basicUserDetails
              }
            }
          }
          esi {
            ...esi
          }
          feedback {
            ...feedback
          }
          shipments {
            ...shipment
          }
          localContact {
            ...basicUserDetails
          }
        }
      }
      visits {
        ...visit
      }
      instrument {
        id
        name
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}
${VisitFragmentDoc}
${VisitRegistrationFragmentDoc}
${EsiFragmentDoc}
${FeedbackFragmentDoc}
${ShipmentFragmentDoc}`;
export const AnswerTopicDocument = gql`
    mutation answerTopic($questionaryId: Int!, $topicId: Int!, $answers: [AnswerInput!]!, $isPartialSave: Boolean) {
  answerTopic(
    questionaryId: $questionaryId
    topicId: $topicId
    answers: $answers
    isPartialSave: $isPartialSave
  ) {
    questionaryStep {
      ...questionaryStep
    }
    rejection {
      ...rejection
    }
  }
}
    ${QuestionaryStepFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateQuestionaryDocument = gql`
    mutation createQuestionary($templateId: Int!) {
  createQuestionary(templateId: $templateId) {
    questionary {
      ...questionary
      isCompleted
    }
    rejection {
      ...rejection
    }
  }
}
    ${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const GetBlankQuestionaryDocument = gql`
    query getBlankQuestionary($templateId: Int!) {
  blankQuestionary(templateId: $templateId) {
    isCompleted
    ...questionary
  }
}
    ${QuestionaryFragmentDoc}`;
export const GetBlankQuestionaryStepsDocument = gql`
    query getBlankQuestionarySteps($templateId: Int!) {
  blankQuestionarySteps(templateId: $templateId) {
    ...questionaryStep
  }
}
    ${QuestionaryStepFragmentDoc}`;
export const GetFileMetadataDocument = gql`
    query getFileMetadata($fileId: String!) {
  fileMetadata(fileId: $fileId) {
    ...fileMetadata
  }
}
    ${FileMetadataFragmentDoc}`;
export const GetFilesMetadataDocument = gql`
    query getFilesMetadata($filter: FilesMetadataFilter!) {
  filesMetadata(filter: $filter) {
    ...fileMetadata
  }
}
    ${FileMetadataFragmentDoc}`;
export const GetQuestionaryDocument = gql`
    query getQuestionary($questionaryId: Int!) {
  questionary(questionaryId: $questionaryId) {
    ...questionary
  }
}
    ${QuestionaryFragmentDoc}`;
export const AddTechnicalReviewDocument = gql`
    mutation addTechnicalReview($proposalPk: Int!, $timeAllocation: Int, $comment: String, $publicComment: String, $status: TechnicalReviewStatus, $submitted: Boolean!, $reviewerId: Int!, $files: String) {
  addTechnicalReview(
    addTechnicalReviewInput: {proposalPk: $proposalPk, timeAllocation: $timeAllocation, comment: $comment, publicComment: $publicComment, status: $status, submitted: $submitted, reviewerId: $reviewerId, files: $files}
  ) {
    rejection {
      ...rejection
    }
    technicalReview {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AddUserForReviewDocument = gql`
    mutation addUserForReview($userID: Int!, $proposalPk: Int!, $sepID: Int!) {
  addUserForReview(userID: $userID, proposalPk: $proposalPk, sepID: $sepID) {
    rejection {
      ...rejection
    }
    review {
      id
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateTechnicalReviewAssigneeDocument = gql`
    mutation updateTechnicalReviewAssignee($proposalPks: [Int!]!, $userId: Int!) {
  updateTechnicalReviewAssignee(proposalPks: $proposalPks, userId: $userId) {
    technicalReviews {
      ...coreTechnicalReview
    }
    rejection {
      ...rejection
    }
  }
}
    ${CoreTechnicalReviewFragmentDoc}
${RejectionFragmentDoc}`;
export const GetProposalReviewsDocument = gql`
    query getProposalReviews($proposalPk: Int!) {
  proposalReviews(proposalPk: $proposalPk) {
    id
    userID
    comment
    grade
    status
    sepID
  }
}
    `;
export const GetReviewDocument = gql`
    query getReview($reviewId: Int!) {
  review(reviewId: $reviewId) {
    ...coreReview
    proposal {
      primaryKey
      title
      abstract
      proposer {
        id
      }
    }
    reviewer {
      ...basicUserDetails
    }
  }
}
    ${CoreReviewFragmentDoc}
${BasicUserDetailsFragmentDoc}`;
export const RemoveUserForReviewDocument = gql`
    mutation removeUserForReview($reviewId: Int!, $sepId: Int!) {
  removeUserForReview(reviewId: $reviewId, sepId: $sepId) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SubmitProposalsReviewDocument = gql`
    mutation submitProposalsReview($proposals: [ProposalPkWithReviewId!]!) {
  submitProposalsReview(submitProposalsReviewInput: {proposals: $proposals}) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const SubmitTechnicalReviewsDocument = gql`
    mutation submitTechnicalReviews($technicalReviews: [SubmitTechnicalReviewInput!]!) {
  submitTechnicalReviews(
    submitTechnicalReviewsInput: {technicalReviews: $technicalReviews}
  ) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateReviewDocument = gql`
    mutation updateReview($reviewID: Int!, $grade: Int!, $comment: String!, $status: ReviewStatus!, $sepID: Int!) {
  updateReview(
    reviewID: $reviewID
    grade: $grade
    comment: $comment
    status: $status
    sepID: $sepID
  ) {
    rejection {
      ...rejection
    }
    review {
      id
      userID
      status
      comment
      grade
      sepID
      nextProposalStatus {
        id
        shortCode
        name
      }
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UserWithReviewsDocument = gql`
    query userWithReviews($callId: Int, $instrumentId: Int, $status: ReviewStatus, $reviewer: ReviewerFilter) {
  me {
    id
    firstname
    lastname
    organisation
    reviews(
      callId: $callId
      instrumentId: $instrumentId
      status: $status
      reviewer: $reviewer
    ) {
      id
      grade
      comment
      status
      sepID
      proposal {
        primaryKey
        title
        proposalId
        call {
          shortCode
        }
        instrument {
          shortCode
        }
      }
    }
  }
}
    `;
export const CloneSampleEsiDocument = gql`
    mutation cloneSampleEsi($esiId: Int!, $sampleId: Int!, $newSampleTitle: String) {
  cloneSampleEsi(
    esiId: $esiId
    sampleId: $sampleId
    newSampleTitle: $newSampleTitle
  ) {
    esi {
      ...sampleEsi
      questionary {
        isCompleted
        ...questionary
      }
      sample {
        ...sample
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleEsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateSampleEsiDocument = gql`
    mutation createSampleEsi($sampleId: Int!, $esiId: Int!) {
  createSampleEsi(sampleId: $sampleId, esiId: $esiId) {
    esi {
      ...sampleEsi
      questionary {
        isCompleted
        ...questionary
      }
      sample {
        ...sample
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleEsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteSampleEsiDocument = gql`
    mutation deleteSampleEsi($sampleId: Int!, $esiId: Int!) {
  deleteSampleEsi(sampleId: $sampleId, esiId: $esiId) {
    esi {
      ...sampleEsi
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleEsiFragmentDoc}
${RejectionFragmentDoc}`;
export const GetSampleEsiDocument = gql`
    query getSampleEsi($sampleId: Int!, $esiId: Int!) {
  sampleEsi(sampleId: $sampleId, esiId: $esiId) {
    ...sampleEsi
    questionary {
      isCompleted
      ...questionary
    }
    sample {
      ...sample
    }
  }
}
    ${SampleEsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}`;
export const UpdateSampleEsiDocument = gql`
    mutation updateSampleEsi($esiId: Int!, $sampleId: Int!, $isSubmitted: Boolean) {
  updateSampleEsi(sampleId: $sampleId, esiId: $esiId, isSubmitted: $isSubmitted) {
    esi {
      ...sampleEsi
      questionary {
        isCompleted
        ...questionary
      }
      sample {
        ...sample
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleEsiFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const CloneSampleDocument = gql`
    mutation cloneSample($sampleId: Int!, $title: String, $isPostProposalSubmission: Boolean) {
  cloneSample(
    sampleId: $sampleId
    title: $title
    isPostProposalSubmission: $isPostProposalSubmission
  ) {
    sample {
      ...sample
      questionary {
        isCompleted
        ...questionary
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateSampleDocument = gql`
    mutation createSample($title: String!, $templateId: Int!, $proposalPk: Int!, $questionId: String!, $isPostProposalSubmission: Boolean) {
  createSample(
    title: $title
    templateId: $templateId
    proposalPk: $proposalPk
    questionId: $questionId
    isPostProposalSubmission: $isPostProposalSubmission
  ) {
    sample {
      ...sample
      questionary {
        isCompleted
        ...questionary
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteSampleDocument = gql`
    mutation deleteSample($sampleId: Int!) {
  deleteSample(sampleId: $sampleId) {
    sample {
      ...sample
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const GetSampleDocument = gql`
    query getSample($sampleId: Int!) {
  sample(sampleId: $sampleId) {
    ...sample
    questionary {
      isCompleted
      ...questionary
    }
  }
}
    ${SampleFragmentDoc}
${QuestionaryFragmentDoc}`;
export const GetSamplesByCallIdDocument = gql`
    query getSamplesByCallId($callId: Int!) {
  samplesByCallId(callId: $callId) {
    ...sample
    proposal {
      primaryKey
      proposalId
    }
  }
}
    ${SampleFragmentDoc}`;
export const GetSamplesWithProposalDataDocument = gql`
    query getSamplesWithProposalData($filter: SamplesFilter) {
  samples(filter: $filter) {
    ...sample
    proposal {
      primaryKey
      proposalId
    }
  }
}
    ${SampleFragmentDoc}`;
export const GetSamplesWithQuestionaryStatusDocument = gql`
    query getSamplesWithQuestionaryStatus($filter: SamplesFilter) {
  samples(filter: $filter) {
    ...sample
    questionary {
      isCompleted
    }
  }
}
    ${SampleFragmentDoc}`;
export const UpdateSampleDocument = gql`
    mutation updateSample($sampleId: Int!, $title: String, $safetyComment: String, $safetyStatus: SampleStatus) {
  updateSample(
    sampleId: $sampleId
    title: $title
    safetyComment: $safetyComment
    safetyStatus: $safetyStatus
  ) {
    sample {
      ...sample
    }
    rejection {
      ...rejection
    }
  }
}
    ${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const GetScheduledEventCoreDocument = gql`
    query getScheduledEventCore($scheduledEventId: Int!) {
  scheduledEventCore(scheduledEventId: $scheduledEventId) {
    ...scheduledEventCore
  }
}
    ${ScheduledEventCoreFragmentDoc}`;
export const GetScheduledEventsCoreDocument = gql`
    query getScheduledEventsCore($filter: ScheduledEventsCoreFilter, $first: Int, $offset: Int) {
  scheduledEventsCore(filter: $filter, first: $first, offset: $offset) {
    ...scheduledEventCore
    proposal {
      ...proposal
      proposer {
        ...basicUserDetails
      }
      instrument {
        ...instrument
      }
    }
    esi {
      ...esi
    }
    visit {
      registrations {
        ...visitRegistration
        startsAt
        endsAt
        trainingStatus
        user {
          ...basicUserDetails
        }
      }
      teamLead {
        ...basicUserDetails
      }
    }
  }
}
    ${ScheduledEventCoreFragmentDoc}
${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${InstrumentFragmentDoc}
${EsiFragmentDoc}
${VisitRegistrationFragmentDoc}`;
export const AddProposalWorkflowStatusDocument = gql`
    mutation addProposalWorkflowStatus($proposalWorkflowId: Int!, $sortOrder: Int!, $droppableGroupId: String!, $parentDroppableGroupId: String, $proposalStatusId: Int!, $nextProposalStatusId: Int, $prevProposalStatusId: Int) {
  addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: {proposalWorkflowId: $proposalWorkflowId, sortOrder: $sortOrder, droppableGroupId: $droppableGroupId, parentDroppableGroupId: $parentDroppableGroupId, proposalStatusId: $proposalStatusId, nextProposalStatusId: $nextProposalStatusId, prevProposalStatusId: $prevProposalStatusId}
  ) {
    proposalWorkflowConnection {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AddStatusChangingEventsToConnectionDocument = gql`
    mutation addStatusChangingEventsToConnection($proposalWorkflowConnectionId: Int!, $statusChangingEvents: [String!]!) {
  addStatusChangingEventsToConnection(
    addStatusChangingEventsToConnectionInput: {proposalWorkflowConnectionId: $proposalWorkflowConnectionId, statusChangingEvents: $statusChangingEvents}
  ) {
    statusChangingEvents {
      statusChangingEventId
      proposalWorkflowConnectionId
      statusChangingEvent
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateProposalStatusDocument = gql`
    mutation createProposalStatus($shortCode: String!, $name: String!, $description: String!) {
  createProposalStatus(
    newProposalStatusInput: {shortCode: $shortCode, name: $name, description: $description}
  ) {
    proposalStatus {
      ...proposalStatus
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalStatusFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateProposalWorkflowDocument = gql`
    mutation createProposalWorkflow($name: String!, $description: String!) {
  createProposalWorkflow(
    newProposalWorkflowInput: {name: $name, description: $description}
  ) {
    proposalWorkflow {
      id
      name
      description
      proposalWorkflowConnectionGroups {
        groupId
        parentGroupId
        connections {
          id
          sortOrder
          proposalWorkflowId
          proposalStatusId
          proposalStatus {
            ...proposalStatus
          }
          nextProposalStatusId
          prevProposalStatusId
          droppableGroupId
          statusChangingEvents {
            statusChangingEventId
            proposalWorkflowConnectionId
            statusChangingEvent
          }
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalStatusFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteProposalStatusDocument = gql`
    mutation deleteProposalStatus($id: Int!) {
  deleteProposalStatus(id: $id) {
    proposalStatus {
      ...proposalStatus
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalStatusFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteProposalWorkflowDocument = gql`
    mutation deleteProposalWorkflow($id: Int!) {
  deleteProposalWorkflow(id: $id) {
    proposalWorkflow {
      id
      name
      description
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const DeleteProposalWorkflowStatusDocument = gql`
    mutation deleteProposalWorkflowStatus($proposalStatusId: Int!, $proposalWorkflowId: Int!, $sortOrder: Int!) {
  deleteProposalWorkflowStatus(
    deleteProposalWorkflowStatusInput: {proposalStatusId: $proposalStatusId, proposalWorkflowId: $proposalWorkflowId, sortOrder: $sortOrder}
  ) {
    isSuccess
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetProposalEventsDocument = gql`
    query getProposalEvents {
  proposalEvents {
    name
    description
  }
}
    `;
export const GetProposalStatusesDocument = gql`
    query getProposalStatuses {
  proposalStatuses {
    ...proposalStatus
  }
}
    ${ProposalStatusFragmentDoc}`;
export const GetProposalWorkflowDocument = gql`
    query getProposalWorkflow($proposalWorkflowId: Int!) {
  proposalWorkflow(proposalWorkflowId: $proposalWorkflowId) {
    id
    name
    description
    proposalWorkflowConnectionGroups {
      groupId
      parentGroupId
      connections {
        id
        sortOrder
        proposalWorkflowId
        proposalStatusId
        proposalStatus {
          ...proposalStatus
        }
        nextProposalStatusId
        prevProposalStatusId
        droppableGroupId
        statusChangingEvents {
          statusChangingEventId
          proposalWorkflowConnectionId
          statusChangingEvent
        }
      }
    }
  }
}
    ${ProposalStatusFragmentDoc}`;
export const GetProposalWorkflowsDocument = gql`
    query getProposalWorkflows {
  proposalWorkflows {
    id
    name
    description
  }
}
    `;
export const MoveProposalWorkflowStatusDocument = gql`
    mutation moveProposalWorkflowStatus($from: IndexWithGroupId!, $to: IndexWithGroupId!, $proposalWorkflowId: Int!) {
  moveProposalWorkflowStatus(
    moveProposalWorkflowStatusInput: {from: $from, to: $to, proposalWorkflowId: $proposalWorkflowId}
  ) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateFeaturesDocument = gql`
    mutation updateFeatures($input: UpdateFeaturesInput!) {
  updateFeatures(updatedFeaturesInput: $input) {
    features {
      id
      isEnabled
      description
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateProposalStatusDocument = gql`
    mutation updateProposalStatus($id: Int!, $shortCode: String!, $name: String!, $description: String!) {
  updateProposalStatus(
    updatedProposalStatusInput: {id: $id, shortCode: $shortCode, name: $name, description: $description}
  ) {
    proposalStatus {
      ...proposalStatus
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalStatusFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateProposalWorkflowDocument = gql`
    mutation updateProposalWorkflow($id: Int!, $name: String!, $description: String!) {
  updateProposalWorkflow(
    updatedProposalWorkflowInput: {id: $id, name: $name, description: $description}
  ) {
    proposalWorkflow {
      id
      name
      description
      proposalWorkflowConnectionGroups {
        groupId
        parentGroupId
        connections {
          id
          sortOrder
          proposalWorkflowId
          proposalStatusId
          proposalStatus {
            id
            name
            description
          }
          nextProposalStatusId
          prevProposalStatusId
          droppableGroupId
          statusChangingEvents {
            statusChangingEventId
            proposalWorkflowConnectionId
            statusChangingEvent
          }
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateSettingsDocument = gql`
    mutation updateSettings($input: UpdateSettingsInput!) {
  updateSettings(updatedSettingsInput: $input) {
    settings {
      id
      settingsValue
      description
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const AddSamplesToShipmentDocument = gql`
    mutation addSamplesToShipment($shipmentId: Int!, $sampleIds: [Int!]!) {
  addSamplesToShipment(shipmentId: $shipmentId, sampleIds: $sampleIds) {
    rejection {
      ...rejection
    }
    shipment {
      ...shipment
      samples {
        ...sample
      }
    }
  }
}
    ${RejectionFragmentDoc}
${ShipmentFragmentDoc}
${SampleFragmentDoc}`;
export const CreateShipmentDocument = gql`
    mutation createShipment($title: String!, $proposalPk: Int!, $scheduledEventId: Int!) {
  createShipment(
    title: $title
    proposalPk: $proposalPk
    scheduledEventId: $scheduledEventId
  ) {
    shipment {
      ...shipment
      questionary {
        ...questionary
        isCompleted
      }
      samples {
        ...sample
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${ShipmentFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteShipmentDocument = gql`
    mutation deleteShipment($shipmentId: Int!) {
  deleteShipment(shipmentId: $shipmentId) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetMyShipmentsDocument = gql`
    query getMyShipments {
  myShipments {
    ...shipment
  }
}
    ${ShipmentFragmentDoc}`;
export const GetShipmentDocument = gql`
    query getShipment($shipmentId: Int!) {
  shipment(shipmentId: $shipmentId) {
    ...shipment
    questionary {
      ...questionary
      isCompleted
    }
    samples {
      ...sample
    }
  }
}
    ${ShipmentFragmentDoc}
${QuestionaryFragmentDoc}
${SampleFragmentDoc}`;
export const GetShipmentsDocument = gql`
    query getShipments($filter: ShipmentsFilter) {
  shipments(filter: $filter) {
    ...shipment
  }
}
    ${ShipmentFragmentDoc}`;
export const SetActiveTemplateDocument = gql`
    mutation setActiveTemplate($templateGroupId: TemplateGroupId!, $templateId: Int!) {
  setActiveTemplate(templateId: $templateId, templateGroupId: $templateGroupId) {
    isSuccess
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SubmitShipmentDocument = gql`
    mutation submitShipment($shipmentId: Int!) {
  submitShipment(shipmentId: $shipmentId) {
    rejection {
      ...rejection
    }
    shipment {
      ...shipment
    }
  }
}
    ${RejectionFragmentDoc}
${ShipmentFragmentDoc}`;
export const UpdateShipmentDocument = gql`
    mutation updateShipment($shipmentId: Int!, $title: String, $proposalPk: Int, $status: ShipmentStatus) {
  updateShipment(
    shipmentId: $shipmentId
    title: $title
    status: $status
    proposalPk: $proposalPk
  ) {
    rejection {
      ...rejection
    }
    shipment {
      ...shipment
      questionary {
        ...questionary
        isCompleted
      }
    }
  }
}
    ${RejectionFragmentDoc}
${ShipmentFragmentDoc}
${QuestionaryFragmentDoc}`;
export const ImportTemplateDocument = gql`
    mutation importTemplate($templateAsJson: String!, $conflictResolutions: [ConflictResolution!]!, $subTemplatesConflictResolutions: [[ConflictResolution!]!]!) {
  importTemplate(
    templateAsJson: $templateAsJson
    conflictResolutions: $conflictResolutions
    subTemplatesConflictResolutions: $subTemplatesConflictResolutions
  ) {
    template {
      ...template
    }
    rejection {
      reason
      context
      exception
    }
  }
}
    ${TemplateFragmentDoc}`;
export const CloneTemplateDocument = gql`
    mutation cloneTemplate($templateId: Int!) {
  cloneTemplate(templateId: $templateId) {
    template {
      ...templateMetadata
      questionaryCount
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateMetadataFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateQuestionDocument = gql`
    mutation createQuestion($categoryId: TemplateCategoryId!, $dataType: DataType!) {
  createQuestion(categoryId: $categoryId, dataType: $dataType) {
    question {
      ...question
    }
    rejection {
      ...rejection
    }
  }
}
    ${QuestionFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateQuestionTemplateRelationDocument = gql`
    mutation createQuestionTemplateRelation($templateId: Int!, $questionId: String!, $topicId: Int!, $sortOrder: Int!) {
  createQuestionTemplateRelation(
    templateId: $templateId
    questionId: $questionId
    topicId: $topicId
    sortOrder: $sortOrder
  ) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateTemplateDocument = gql`
    mutation createTemplate($groupId: TemplateGroupId!, $name: String!, $description: String) {
  createTemplate(groupId: $groupId, name: $name, description: $description) {
    template {
      ...template
      questionaryCount
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateTopicDocument = gql`
    mutation createTopic($templateId: Int!, $sortOrder: Int!) {
  createTopic(templateId: $templateId, sortOrder: $sortOrder) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteQuestionDocument = gql`
    mutation deleteQuestion($questionId: String!) {
  deleteQuestion(questionId: $questionId) {
    question {
      ...question
    }
    rejection {
      ...rejection
    }
  }
}
    ${QuestionFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteQuestionTemplateRelationDocument = gql`
    mutation deleteQuestionTemplateRelation($questionId: String!, $templateId: Int!) {
  deleteQuestionTemplateRelation(questionId: $questionId, templateId: $templateId) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteTemplateDocument = gql`
    mutation deleteTemplate($id: Int!) {
  deleteTemplate(templateId: $id) {
    template {
      templateId
      name
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const DeleteTopicDocument = gql`
    mutation deleteTopic($topicId: Int!) {
  deleteTopic(topicId: $topicId) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetActiveTemplateIdDocument = gql`
    query getActiveTemplateId($templateGroupId: TemplateGroupId!) {
  activeTemplateId(templateGroupId: $templateGroupId)
}
    `;
export const GetIsNaturalKeyPresentDocument = gql`
    query getIsNaturalKeyPresent($naturalKey: String!) {
  isNaturalKeyPresent(naturalKey: $naturalKey)
}
    `;
export const GetPdfTemplateDocument = gql`
    query getPdfTemplate($pdfTemplateId: Int!) {
  pdfTemplate(pdfTemplateId: $pdfTemplateId) {
    pdfTemplateId
    templateId
    templateData
  }
}
    `;
export const GetProposalTemplatesDocument = gql`
    query getProposalTemplates($filter: ProposalTemplatesFilter) {
  proposalTemplates(filter: $filter) {
    templateId
    name
    description
    isArchived
    questionaryCount
    callCount
  }
}
    `;
export const GetQuestionsDocument = gql`
    query getQuestions($filter: QuestionsFilter) {
  questions(filter: $filter) {
    id
    question
    naturalKey
    dataType
    categoryId
    config {
      ...fieldConfig
    }
    answers {
      questionaryId
    }
    templates {
      templateId
    }
  }
}
    ${FieldConfigFragmentDoc}`;
export const GetTemplateDocument = gql`
    query getTemplate($templateId: Int!) {
  template(templateId: $templateId) {
    ...template
  }
}
    ${TemplateFragmentDoc}`;
export const GetTemplateCategoriesDocument = gql`
    query getTemplateCategories {
  templateCategories {
    categoryId
    name
  }
}
    `;
export const GetTemplateExportDocument = gql`
    query getTemplateExport($templateId: Int!) {
  template(templateId: $templateId) {
    json
  }
}
    `;
export const GetTemplatesDocument = gql`
    query getTemplates($filter: TemplatesFilter) {
  templates(filter: $filter) {
    templateId
    name
    description
    isArchived
    questionaryCount
  }
}
    `;
export const UpdatePdfTemplateDocument = gql`
    mutation updatePdfTemplate($pdfTemplateId: Int!, $templateData: String) {
  updatePdfTemplate(pdfTemplateId: $pdfTemplateId, templateData: $templateData) {
    pdfTemplate {
      pdfTemplateId
      templateId
      templateData
      created
      creatorId
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateQuestionDocument = gql`
    mutation updateQuestion($id: String!, $naturalKey: String, $question: String, $config: String) {
  updateQuestion(
    id: $id
    naturalKey: $naturalKey
    question: $question
    config: $config
  ) {
    question {
      ...question
    }
    rejection {
      ...rejection
    }
  }
}
    ${QuestionFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateQuestionTemplateRelationDocument = gql`
    mutation updateQuestionTemplateRelation($questionId: String!, $templateId: Int!, $topicId: Int, $sortOrder: Int!, $config: String) {
  updateQuestionTemplateRelation(
    questionId: $questionId
    templateId: $templateId
    topicId: $topicId
    sortOrder: $sortOrder
    config: $config
  ) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateQuestionTemplateRelationSettingsDocument = gql`
    mutation updateQuestionTemplateRelationSettings($questionId: String!, $templateId: Int!, $config: String, $dependencies: [FieldDependencyInput!]!, $dependenciesOperator: DependenciesLogicOperator) {
  updateQuestionTemplateRelationSettings(
    questionId: $questionId
    templateId: $templateId
    config: $config
    dependencies: $dependencies
    dependenciesOperator: $dependenciesOperator
  ) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateTemplateDocument = gql`
    mutation updateTemplate($templateId: Int!, $name: String, $description: String, $isArchived: Boolean) {
  updateTemplate(
    templateId: $templateId
    name: $name
    description: $description
    isArchived: $isArchived
  ) {
    template {
      ...templateMetadata
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateMetadataFragmentDoc}
${RejectionFragmentDoc}`;
export const UpdateTopicDocument = gql`
    mutation updateTopic($topicId: Int!, $templateId: Int, $title: String, $sortOrder: Int, $isEnabled: Boolean) {
  updateTopic(
    id: $topicId
    templateId: $templateId
    title: $title
    sortOrder: $sortOrder
    isEnabled: $isEnabled
  ) {
    template {
      ...template
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateFragmentDoc}
${RejectionFragmentDoc}`;
export const ValidateTemplateImportDocument = gql`
    mutation validateTemplateImport($templateAsJson: String!) {
  validateTemplateImport(templateAsJson: $templateAsJson) {
    validationResult {
      json
      version
      exportDate
      validationData {
        ...templateValidationData
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${TemplateValidationDataFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateUnitDocument = gql`
    mutation createUnit($id: String!, $unit: String!, $quantity: String!, $symbol: String!, $siConversionFormula: String!) {
  createUnit(
    id: $id
    unit: $unit
    quantity: $quantity
    symbol: $symbol
    siConversionFormula: $siConversionFormula
  ) {
    unit {
      ...unit
    }
    rejection {
      ...rejection
    }
  }
}
    ${UnitFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteUnitDocument = gql`
    mutation deleteUnit($id: String!) {
  deleteUnit(id: $id) {
    unit {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetUnitsDocument = gql`
    query getUnits {
  units {
    ...unit
  }
}
    ${UnitFragmentDoc}`;
export const GetUnitsAsJsonDocument = gql`
    query getUnitsAsJson {
  unitsAsJson
}
    `;
export const ImportUnitsDocument = gql`
    mutation importUnits($json: String!, $conflictResolutions: [ConflictResolution!]!) {
  importUnits(json: $json, conflictResolutions: $conflictResolutions) {
    units {
      ...unit
    }
    rejection {
      ...rejection
    }
  }
}
    ${UnitFragmentDoc}
${RejectionFragmentDoc}`;
export const ValidateUnitsImportDocument = gql`
    mutation validateUnitsImport($unitsAsJson: String!) {
  validateUnitsImport(unitsAsJson: $unitsAsJson) {
    validationResult {
      json
      version
      exportDate
      isValid
      errors
      unitComparisons {
        existingUnit {
          ...unit
        }
        newUnit {
          ...unit
        }
        status
        conflictResolutionStrategy
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${UnitFragmentDoc}
${RejectionFragmentDoc}`;
export const CheckTokenDocument = gql`
    query checkToken($token: String!) {
  checkToken(token: $token) {
    isValid
  }
}
    `;
export const CreateUserDocument = gql`
    mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: DateTime!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String, $organizationCountry: Int) {
  createUser(
    user_title: $user_title
    firstname: $firstname
    middlename: $middlename
    lastname: $lastname
    password: $password
    preferredname: $preferredname
    orcid: $orcid
    orcidHash: $orcidHash
    refreshToken: $refreshToken
    gender: $gender
    nationality: $nationality
    birthdate: $birthdate
    organisation: $organisation
    department: $department
    position: $position
    email: $email
    telephone: $telephone
    telephone_alt: $telephone_alt
    otherOrganisation: $otherOrganisation
    organizationCountry: $organizationCountry
  ) {
    user {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateUserByEmailInviteDocument = gql`
    mutation createUserByEmailInvite($firstname: String!, $lastname: String!, $email: String!, $userRole: UserRole!) {
  createUserByEmailInvite(
    firstname: $firstname
    lastname: $lastname
    email: $email
    userRole: $userRole
  ) {
    rejection {
      ...rejection
    }
    id
  }
}
    ${RejectionFragmentDoc}`;
export const DeleteUserDocument = gql`
    mutation deleteUser($id: Int!) {
  deleteUser(id: $id) {
    user {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const ExternalTokenLoginDocument = gql`
    mutation externalTokenLogin($externalToken: String!) {
  externalTokenLogin(externalToken: $externalToken) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetBasicUserDetailsDocument = gql`
    query getBasicUserDetails($userId: Int!) {
  basicUserDetails(userId: $userId) {
    ...basicUserDetails
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetBasicUserDetailsByEmailDocument = gql`
    query getBasicUserDetailsByEmail($email: String!, $role: UserRole) {
  basicUserDetailsByEmail(email: $email, role: $role) {
    ...basicUserDetails
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetCountriesDocument = gql`
    query getCountries {
  countries {
    id
    value
  }
}
    `;
export const GetMyRolesDocument = gql`
    query getMyRoles {
  me {
    firstname
    lastname
    roles {
      id
      shortCode
      title
    }
  }
}
    `;
export const GetNationalitiesDocument = gql`
    query getNationalities {
  nationalities {
    id
    value
  }
}
    `;
export const GetOrcIdInformationDocument = gql`
    query getOrcIDInformation($authorizationCode: String!) {
  getOrcIDInformation(authorizationCode: $authorizationCode) {
    firstname
    lastname
    orcid
    orcidHash
    refreshToken
    token
  }
}
    `;
export const GetPreviousCollaboratorsDocument = gql`
    query getPreviousCollaborators($userId: Int!, $filter: String, $first: Int, $offset: Int, $userRole: UserRole, $subtractUsers: [Int!]) {
  previousCollaborators(
    userId: $userId
    filter: $filter
    first: $first
    offset: $offset
    userRole: $userRole
    subtractUsers: $subtractUsers
  ) {
    users {
      ...basicUserDetails
    }
    totalCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetRolesDocument = gql`
    query getRoles {
  roles {
    id
    shortCode
    title
  }
}
    `;
export const GetTokenDocument = gql`
    mutation getToken($token: String!) {
  token(token: $token) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetTokenForUserDocument = gql`
    mutation getTokenForUser($userId: Int!) {
  getTokenForUser(userId: $userId) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const GetUserDocument = gql`
    query getUser($userId: Int!) {
  user(userId: $userId) {
    user_title
    username
    firstname
    middlename
    lastname
    preferredname
    gender
    nationality
    birthdate
    organisation
    department
    position
    email
    telephone
    telephone_alt
    orcid
    emailVerified
    placeholder
  }
}
    `;
export const GetUserMeDocument = gql`
    query getUserMe {
  me {
    user_title
    username
    firstname
    middlename
    lastname
    preferredname
    gender
    nationality
    birthdate
    organisation
    department
    position
    email
    telephone
    telephone_alt
    orcid
    emailVerified
    placeholder
  }
}
    `;
export const GetUserProposalsDocument = gql`
    query getUserProposals {
  me {
    proposals {
      primaryKey
      proposalId
      title
      status {
        ...proposalStatus
      }
      publicStatus
      statusId
      created
      finalStatus
      notified
      submitted
      proposer {
        id
      }
      call {
        id
        shortCode
        isActive
        referenceNumberFormat
      }
    }
  }
}
    ${ProposalStatusFragmentDoc}`;
export const GetUserWithRolesDocument = gql`
    query getUserWithRoles($userId: Int!) {
  user(userId: $userId) {
    firstname
    lastname
    roles {
      id
      shortCode
      title
    }
  }
}
    `;
export const GetUsersDocument = gql`
    query getUsers($filter: String, $first: Int, $offset: Int, $userRole: UserRole, $subtractUsers: [Int!], $orderBy: String, $orderDirection: String) {
  users(
    filter: $filter
    first: $first
    offset: $offset
    userRole: $userRole
    subtractUsers: $subtractUsers
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    users {
      ...basicUserDetails
    }
    totalCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const LogoutDocument = gql`
    mutation logout($token: String!) {
  logout(token: $token) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const ResetPasswordDocument = gql`
    mutation resetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const ResetPasswordEmailDocument = gql`
    mutation resetPasswordEmail($email: String!) {
  resetPasswordEmail(email: $email) {
    rejection {
      ...rejection
    }
    isSuccess
  }
}
    ${RejectionFragmentDoc}`;
export const SelectRoleDocument = gql`
    mutation selectRole($token: String!, $selectedRoleId: Int!) {
  selectRole(token: $token, selectedRoleId: $selectedRoleId) {
    token
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SetUserEmailVerifiedDocument = gql`
    mutation setUserEmailVerified($id: Int!) {
  setUserEmailVerified(id: $id) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const SetUserNotPlaceholderDocument = gql`
    mutation setUserNotPlaceholder($id: Int!) {
  setUserNotPlaceholder(id: $id) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdatePasswordDocument = gql`
    mutation updatePassword($id: Int!, $password: String!) {
  updatePassword(id: $id, password: $password) {
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateUserDocument = gql`
    mutation updateUser($id: Int!, $user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $preferredname: String, $gender: String!, $nationality: Int!, $birthdate: DateTime!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String, $organizationCountry: Int) {
  updateUser(
    id: $id
    user_title: $user_title
    firstname: $firstname
    middlename: $middlename
    lastname: $lastname
    preferredname: $preferredname
    gender: $gender
    nationality: $nationality
    birthdate: $birthdate
    organisation: $organisation
    department: $department
    position: $position
    email: $email
    telephone: $telephone
    telephone_alt: $telephone_alt
    otherOrganisation: $otherOrganisation
    organizationCountry: $organizationCountry
  ) {
    user {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const UpdateUserRolesDocument = gql`
    mutation updateUserRoles($id: Int!, $roles: [Int!]) {
  updateUserRoles(id: $id, roles: $roles) {
    user {
      id
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const VerifyEmailDocument = gql`
    mutation verifyEmail($token: String!) {
  emailVerification(token: $token) {
    rejection {
      ...rejection
    }
    success
  }
}
    ${RejectionFragmentDoc}`;
export const CreateVisitDocument = gql`
    mutation createVisit($scheduledEventId: Int!, $team: [Int!]!, $teamLeadUserId: Int!) {
  createVisit(
    scheduledEventId: $scheduledEventId
    team: $team
    teamLeadUserId: $teamLeadUserId
  ) {
    visit {
      ...visit
      teamLead {
        ...basicUserDetails
      }
      registrations {
        ...visitRegistration
        user {
          ...basicUserDetails
        }
      }
      proposal {
        ...proposal
        instrument {
          name
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitFragmentDoc}
${BasicUserDetailsFragmentDoc}
${VisitRegistrationFragmentDoc}
${ProposalFragmentDoc}
${RejectionFragmentDoc}`;
export const DeleteVisitDocument = gql`
    mutation deleteVisit($visitId: Int!) {
  deleteVisit(visitId: $visitId) {
    visit {
      ...visit
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitFragmentDoc}
${RejectionFragmentDoc}`;
export const GetVisitDocument = gql`
    query getVisit($visitId: Int!) {
  visit(visitId: $visitId) {
    ...visit
    registrations {
      ...visitRegistration
      user {
        ...basicUserDetails
      }
    }
    proposal {
      ...proposal
      instrument {
        name
      }
    }
  }
}
    ${VisitFragmentDoc}
${VisitRegistrationFragmentDoc}
${BasicUserDetailsFragmentDoc}
${ProposalFragmentDoc}`;
export const GetVisitsDocument = gql`
    query getVisits($filter: VisitsFilter) {
  visits(filter: $filter) {
    ...visit
    proposal {
      ...proposal
      instrument {
        name
      }
    }
  }
}
    ${VisitFragmentDoc}
${ProposalFragmentDoc}`;
export const UpdateVisitDocument = gql`
    mutation updateVisit($visitId: Int!, $team: [Int!], $status: VisitStatus, $teamLeadUserId: Int) {
  updateVisit(
    visitId: $visitId
    team: $team
    status: $status
    teamLeadUserId: $teamLeadUserId
  ) {
    visit {
      ...visit
      teamLead {
        ...basicUserDetails
      }
      registrations {
        ...visitRegistration
        user {
          ...basicUserDetails
        }
      }
      proposal {
        ...proposal
        instrument {
          name
        }
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitFragmentDoc}
${BasicUserDetailsFragmentDoc}
${VisitRegistrationFragmentDoc}
${ProposalFragmentDoc}
${RejectionFragmentDoc}`;
export const CreateVisitRegistrationDocument = gql`
    mutation createVisitRegistration($visitId: Int!) {
  createVisitRegistration(visitId: $visitId) {
    registration {
      ...visitRegistration
      user {
        ...basicUserDetails
      }
      questionary {
        ...questionary
        isCompleted
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitRegistrationFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;
export const GetVisitRegistrationDocument = gql`
    query getVisitRegistration($visitId: Int!) {
  visitRegistration(visitId: $visitId) {
    ...visitRegistration
    user {
      ...basicUserDetails
    }
    questionary {
      ...questionary
      isCompleted
    }
  }
}
    ${VisitRegistrationFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}`;
export const UpdateVisitRegistrationDocument = gql`
    mutation updateVisitRegistration($visitId: Int!, $trainingExpiryDate: DateTime, $isRegistrationSubmitted: Boolean, $startsAt: DateTime, $endsAt: DateTime) {
  updateVisitRegistration(
    visitId: $visitId
    trainingExpiryDate: $trainingExpiryDate
    isRegistrationSubmitted: $isRegistrationSubmitted
    startsAt: $startsAt
    endsAt: $endsAt
  ) {
    registration {
      ...visitRegistration
      user {
        ...basicUserDetails
      }
      questionary {
        ...questionary
        isCompleted
      }
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitRegistrationFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${RejectionFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    assignProposalsToSep(variables: AssignProposalsToSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignProposalsToSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignProposalsToSepMutation>(AssignProposalsToSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignProposalsToSep', 'mutation');
    },
    assignReviewersToSEP(variables: AssignReviewersToSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignReviewersToSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignReviewersToSepMutation>(AssignReviewersToSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignReviewersToSEP', 'mutation');
    },
    assignChairOrSecretary(variables: AssignChairOrSecretaryMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignChairOrSecretaryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignChairOrSecretaryMutation>(AssignChairOrSecretaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignChairOrSecretary', 'mutation');
    },
    assignSepReviewersToProposal(variables: AssignSepReviewersToProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignSepReviewersToProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignSepReviewersToProposalMutation>(AssignSepReviewersToProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignSepReviewersToProposal', 'mutation');
    },
    createSEP(variables: CreateSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateSepMutation>(CreateSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createSEP', 'mutation');
    },
    deleteSEP(variables: DeleteSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteSepMutation>(DeleteSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteSEP', 'mutation');
    },
    getInstrumentsBySEP(variables: GetInstrumentsBySepQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetInstrumentsBySepQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInstrumentsBySepQuery>(GetInstrumentsBySepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getInstrumentsBySEP', 'query');
    },
    getUserSeps(variables?: GetUserSepsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserSepsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserSepsQuery>(GetUserSepsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserSeps', 'query');
    },
    getSEP(variables: GetSepQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSepQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSepQuery>(GetSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEP', 'query');
    },
    getSEPMembers(variables: GetSepMembersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSepMembersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSepMembersQuery>(GetSepMembersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEPMembers', 'query');
    },
    getSEPProposal(variables: GetSepProposalQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSepProposalQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSepProposalQuery>(GetSepProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEPProposal', 'query');
    },
    getSEPProposals(variables: GetSepProposalsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSepProposalsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSepProposalsQuery>(GetSepProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEPProposals', 'query');
    },
    sepProposalsByInstrument(variables: SepProposalsByInstrumentQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SepProposalsByInstrumentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SepProposalsByInstrumentQuery>(SepProposalsByInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sepProposalsByInstrument', 'query');
    },
    getSEPReviewers(variables: GetSepReviewersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSepReviewersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSepReviewersQuery>(GetSepReviewersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEPReviewers', 'query');
    },
    getSEPs(variables?: GetSePsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSePsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSePsQuery>(GetSePsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSEPs', 'query');
    },
    removeProposalsFromSep(variables: RemoveProposalsFromSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveProposalsFromSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveProposalsFromSepMutation>(RemoveProposalsFromSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeProposalsFromSep', 'mutation');
    },
    removeMemberFromSep(variables: RemoveMemberFromSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveMemberFromSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveMemberFromSepMutation>(RemoveMemberFromSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeMemberFromSep', 'mutation');
    },
    removeMemberFromSEPProposal(variables: RemoveMemberFromSepProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveMemberFromSepProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveMemberFromSepProposalMutation>(RemoveMemberFromSepProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeMemberFromSEPProposal', 'mutation');
    },
    reorderSepMeetingDecisionProposals(variables: ReorderSepMeetingDecisionProposalsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ReorderSepMeetingDecisionProposalsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReorderSepMeetingDecisionProposalsMutation>(ReorderSepMeetingDecisionProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'reorderSepMeetingDecisionProposals', 'mutation');
    },
    saveSepMeetingDecision(variables: SaveSepMeetingDecisionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SaveSepMeetingDecisionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveSepMeetingDecisionMutation>(SaveSepMeetingDecisionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'saveSepMeetingDecision', 'mutation');
    },
    updateSEP(variables: UpdateSepMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateSepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSepMutation>(UpdateSepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSEP', 'mutation');
    },
    updateSEPTimeAllocation(variables: UpdateSepTimeAllocationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateSepTimeAllocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSepTimeAllocationMutation>(UpdateSepTimeAllocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSEPTimeAllocation', 'mutation');
    },
    addClientLog(variables: AddClientLogMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddClientLogMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddClientLogMutation>(AddClientLogDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addClientLog', 'mutation');
    },
    createApiAccessToken(variables: CreateApiAccessTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateApiAccessTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateApiAccessTokenMutation>(CreateApiAccessTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createApiAccessToken', 'mutation');
    },
    createInstitution(variables: CreateInstitutionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateInstitutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateInstitutionMutation>(CreateInstitutionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createInstitution', 'mutation');
    },
    deleteApiAccessToken(variables: DeleteApiAccessTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteApiAccessTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteApiAccessTokenMutation>(DeleteApiAccessTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteApiAccessToken', 'mutation');
    },
    deleteInstitution(variables: DeleteInstitutionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteInstitutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteInstitutionMutation>(DeleteInstitutionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteInstitution', 'mutation');
    },
    getAllApiAccessTokensAndPermissions(variables?: GetAllApiAccessTokensAndPermissionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAllApiAccessTokensAndPermissionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllApiAccessTokensAndPermissionsQuery>(GetAllApiAccessTokensAndPermissionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllApiAccessTokensAndPermissions', 'query');
    },
    getAllQueriesAndMutations(variables?: GetAllQueriesAndMutationsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAllQueriesAndMutationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllQueriesAndMutationsQuery>(GetAllQueriesAndMutationsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllQueriesAndMutations', 'query');
    },
    getFeatures(variables?: GetFeaturesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFeaturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFeaturesQuery>(GetFeaturesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFeatures', 'query');
    },
    getInstitutions(variables?: GetInstitutionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetInstitutionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInstitutionsQuery>(GetInstitutionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getInstitutions', 'query');
    },
    getInstitutionsWithCountry(variables?: GetInstitutionsWithCountryQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetInstitutionsWithCountryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInstitutionsWithCountryQuery>(GetInstitutionsWithCountryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getInstitutionsWithCountry', 'query');
    },
    getPageContent(variables: GetPageContentQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPageContentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPageContentQuery>(GetPageContentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getPageContent', 'query');
    },
    getQuantities(variables?: GetQuantitiesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetQuantitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetQuantitiesQuery>(GetQuantitiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getQuantities', 'query');
    },
    getSettings(variables?: GetSettingsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSettingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSettingsQuery>(GetSettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSettings', 'query');
    },
    mergeInstitutions(variables: MergeInstitutionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MergeInstitutionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<MergeInstitutionsMutation>(MergeInstitutionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'mergeInstitutions', 'mutation');
    },
    prepareDB(variables: PrepareDbMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PrepareDbMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PrepareDbMutation>(PrepareDbDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'prepareDB', 'mutation');
    },
    setPageContent(variables: SetPageContentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetPageContentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetPageContentMutation>(SetPageContentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setPageContent', 'mutation');
    },
    updateApiAccessToken(variables: UpdateApiAccessTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateApiAccessTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateApiAccessTokenMutation>(UpdateApiAccessTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateApiAccessToken', 'mutation');
    },
    updateInstitution(variables: UpdateInstitutionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateInstitutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateInstitutionMutation>(UpdateInstitutionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateInstitution', 'mutation');
    },
    assignInstrumentsToCall(variables: AssignInstrumentsToCallMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignInstrumentsToCallMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignInstrumentsToCallMutation>(AssignInstrumentsToCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignInstrumentsToCall', 'mutation');
    },
    createCall(variables: CreateCallMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateCallMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateCallMutation>(CreateCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createCall', 'mutation');
    },
    deleteCall(variables: DeleteCallMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteCallMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteCallMutation>(DeleteCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteCall', 'mutation');
    },
    getCall(variables: GetCallQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCallQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCallQuery>(GetCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCall', 'query');
    },
    getCalls(variables?: GetCallsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCallsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCallsQuery>(GetCallsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCalls', 'query');
    },
    getCallsByInstrumentScientist(variables: GetCallsByInstrumentScientistQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCallsByInstrumentScientistQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCallsByInstrumentScientistQuery>(GetCallsByInstrumentScientistDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCallsByInstrumentScientist', 'query');
    },
    removeAssignedInstrumentFromCall(variables: RemoveAssignedInstrumentFromCallMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveAssignedInstrumentFromCallMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveAssignedInstrumentFromCallMutation>(RemoveAssignedInstrumentFromCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeAssignedInstrumentFromCall', 'mutation');
    },
    updateCall(variables: UpdateCallMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateCallMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCallMutation>(UpdateCallDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateCall', 'mutation');
    },
    createEsi(variables: CreateEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateEsiMutation>(CreateEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createEsi', 'mutation');
    },
    getEsi(variables: GetEsiQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetEsiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEsiQuery>(GetEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getEsi', 'query');
    },
    updateEsi(variables: UpdateEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateEsiMutation>(UpdateEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateEsi', 'mutation');
    },
    getEventLogs(variables: GetEventLogsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetEventLogsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEventLogsQuery>(GetEventLogsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getEventLogs', 'query');
    },
    createFeedback(variables: CreateFeedbackMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateFeedbackMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateFeedbackMutation>(CreateFeedbackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createFeedback', 'mutation');
    },
    getFeedback(variables: GetFeedbackQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFeedbackQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFeedbackQuery>(GetFeedbackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFeedback', 'query');
    },
    updateFeedback(variables: UpdateFeedbackMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateFeedbackMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateFeedbackMutation>(UpdateFeedbackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateFeedback', 'mutation');
    },
    cloneGenericTemplate(variables: CloneGenericTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CloneGenericTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CloneGenericTemplateMutation>(CloneGenericTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cloneGenericTemplate', 'mutation');
    },
    createGenericTemplate(variables: CreateGenericTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateGenericTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateGenericTemplateMutation>(CreateGenericTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createGenericTemplate', 'mutation');
    },
    deleteGenericTemplate(variables: DeleteGenericTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteGenericTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteGenericTemplateMutation>(DeleteGenericTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteGenericTemplate', 'mutation');
    },
    getGenericTemplate(variables: GetGenericTemplateQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetGenericTemplateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetGenericTemplateQuery>(GetGenericTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getGenericTemplate', 'query');
    },
    getGenericTemplatesWithProposalData(variables?: GetGenericTemplatesWithProposalDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetGenericTemplatesWithProposalDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetGenericTemplatesWithProposalDataQuery>(GetGenericTemplatesWithProposalDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getGenericTemplatesWithProposalData', 'query');
    },
    getGenericTemplatesWithQuestionaryStatus(variables?: GetGenericTemplatesWithQuestionaryStatusQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetGenericTemplatesWithQuestionaryStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetGenericTemplatesWithQuestionaryStatusQuery>(GetGenericTemplatesWithQuestionaryStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getGenericTemplatesWithQuestionaryStatus', 'query');
    },
    updateGenericTemplate(variables: UpdateGenericTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateGenericTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateGenericTemplateMutation>(UpdateGenericTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateGenericTemplate', 'mutation');
    },
    assignProposalsToInstrument(variables: AssignProposalsToInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignProposalsToInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignProposalsToInstrumentMutation>(AssignProposalsToInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignProposalsToInstrument', 'mutation');
    },
    assignScientistsToInstrument(variables: AssignScientistsToInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AssignScientistsToInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AssignScientistsToInstrumentMutation>(AssignScientistsToInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'assignScientistsToInstrument', 'mutation');
    },
    createInstrument(variables: CreateInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateInstrumentMutation>(CreateInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createInstrument', 'mutation');
    },
    deleteInstrument(variables: DeleteInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteInstrumentMutation>(DeleteInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteInstrument', 'mutation');
    },
    getInstruments(variables?: GetInstrumentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetInstrumentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInstrumentsQuery>(GetInstrumentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getInstruments', 'query');
    },
    getUserInstruments(variables?: GetUserInstrumentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserInstrumentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserInstrumentsQuery>(GetUserInstrumentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserInstruments', 'query');
    },
    removeProposalsFromInstrument(variables: RemoveProposalsFromInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveProposalsFromInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveProposalsFromInstrumentMutation>(RemoveProposalsFromInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeProposalsFromInstrument', 'mutation');
    },
    removeScientistFromInstrument(variables: RemoveScientistFromInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveScientistFromInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveScientistFromInstrumentMutation>(RemoveScientistFromInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeScientistFromInstrument', 'mutation');
    },
    setInstrumentAvailabilityTime(variables: SetInstrumentAvailabilityTimeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetInstrumentAvailabilityTimeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetInstrumentAvailabilityTimeMutation>(SetInstrumentAvailabilityTimeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setInstrumentAvailabilityTime', 'mutation');
    },
    submitInstrument(variables: SubmitInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SubmitInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitInstrumentMutation>(SubmitInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'submitInstrument', 'mutation');
    },
    updateInstrument(variables: UpdateInstrumentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateInstrumentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateInstrumentMutation>(UpdateInstrumentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateInstrument', 'mutation');
    },
    createPredefinedMessage(variables: CreatePredefinedMessageMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreatePredefinedMessageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreatePredefinedMessageMutation>(CreatePredefinedMessageDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createPredefinedMessage', 'mutation');
    },
    deletePredefinedMessage(variables: DeletePredefinedMessageMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeletePredefinedMessageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeletePredefinedMessageMutation>(DeletePredefinedMessageDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deletePredefinedMessage', 'mutation');
    },
    getPredefinedMessages(variables?: GetPredefinedMessagesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPredefinedMessagesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPredefinedMessagesQuery>(GetPredefinedMessagesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getPredefinedMessages', 'query');
    },
    updatePredefinedMessage(variables: UpdatePredefinedMessageMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdatePredefinedMessageMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePredefinedMessageMutation>(UpdatePredefinedMessageDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updatePredefinedMessage', 'mutation');
    },
    administrationProposal(variables: AdministrationProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AdministrationProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdministrationProposalMutation>(AdministrationProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'administrationProposal', 'mutation');
    },
    changeProposalsStatus(variables: ChangeProposalsStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ChangeProposalsStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ChangeProposalsStatusMutation>(ChangeProposalsStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'changeProposalsStatus', 'mutation');
    },
    cloneProposals(variables: CloneProposalsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CloneProposalsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CloneProposalsMutation>(CloneProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cloneProposals', 'mutation');
    },
    createProposal(variables: CreateProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateProposalMutation>(CreateProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createProposal', 'mutation');
    },
    deleteProposal(variables: DeleteProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteProposalMutation>(DeleteProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteProposal', 'mutation');
    },
    getInstrumentScientistProposals(variables?: GetInstrumentScientistProposalsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetInstrumentScientistProposalsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInstrumentScientistProposalsQuery>(GetInstrumentScientistProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getInstrumentScientistProposals', 'query');
    },
    getMyProposals(variables?: GetMyProposalsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetMyProposalsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMyProposalsQuery>(GetMyProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMyProposals', 'query');
    },
    getProposal(variables: GetProposalQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalQuery>(GetProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposal', 'query');
    },
    getProposals(variables?: GetProposalsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalsQuery>(GetProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposals', 'query');
    },
    getProposalsCore(variables?: GetProposalsCoreQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalsCoreQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalsCoreQuery>(GetProposalsCoreDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalsCore', 'query');
    },
    notifyProposal(variables: NotifyProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<NotifyProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<NotifyProposalMutation>(NotifyProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'notifyProposal', 'mutation');
    },
    submitProposal(variables: SubmitProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SubmitProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitProposalMutation>(SubmitProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'submitProposal', 'mutation');
    },
    updateProposal(variables: UpdateProposalMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateProposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProposalMutation>(UpdateProposalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateProposal', 'mutation');
    },
    getUserProposalBookingsWithEvents(variables?: GetUserProposalBookingsWithEventsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserProposalBookingsWithEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserProposalBookingsWithEventsQuery>(GetUserProposalBookingsWithEventsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserProposalBookingsWithEvents', 'query');
    },
    answerTopic(variables: AnswerTopicMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AnswerTopicMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AnswerTopicMutation>(AnswerTopicDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'answerTopic', 'mutation');
    },
    createQuestionary(variables: CreateQuestionaryMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateQuestionaryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateQuestionaryMutation>(CreateQuestionaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createQuestionary', 'mutation');
    },
    getBlankQuestionary(variables: GetBlankQuestionaryQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetBlankQuestionaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlankQuestionaryQuery>(GetBlankQuestionaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBlankQuestionary', 'query');
    },
    getBlankQuestionarySteps(variables: GetBlankQuestionaryStepsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetBlankQuestionaryStepsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlankQuestionaryStepsQuery>(GetBlankQuestionaryStepsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBlankQuestionarySteps', 'query');
    },
    getFileMetadata(variables: GetFileMetadataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFileMetadataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFileMetadataQuery>(GetFileMetadataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFileMetadata', 'query');
    },
    getFilesMetadata(variables: GetFilesMetadataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFilesMetadataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFilesMetadataQuery>(GetFilesMetadataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFilesMetadata', 'query');
    },
    getQuestionary(variables: GetQuestionaryQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetQuestionaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetQuestionaryQuery>(GetQuestionaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getQuestionary', 'query');
    },
    addTechnicalReview(variables: AddTechnicalReviewMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddTechnicalReviewMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddTechnicalReviewMutation>(AddTechnicalReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addTechnicalReview', 'mutation');
    },
    addUserForReview(variables: AddUserForReviewMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddUserForReviewMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddUserForReviewMutation>(AddUserForReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addUserForReview', 'mutation');
    },
    updateTechnicalReviewAssignee(variables: UpdateTechnicalReviewAssigneeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateTechnicalReviewAssigneeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateTechnicalReviewAssigneeMutation>(UpdateTechnicalReviewAssigneeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateTechnicalReviewAssignee', 'mutation');
    },
    getProposalReviews(variables: GetProposalReviewsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalReviewsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalReviewsQuery>(GetProposalReviewsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalReviews', 'query');
    },
    getReview(variables: GetReviewQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetReviewQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReviewQuery>(GetReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getReview', 'query');
    },
    removeUserForReview(variables: RemoveUserForReviewMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RemoveUserForReviewMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveUserForReviewMutation>(RemoveUserForReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeUserForReview', 'mutation');
    },
    submitProposalsReview(variables: SubmitProposalsReviewMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SubmitProposalsReviewMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitProposalsReviewMutation>(SubmitProposalsReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'submitProposalsReview', 'mutation');
    },
    submitTechnicalReviews(variables: SubmitTechnicalReviewsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SubmitTechnicalReviewsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitTechnicalReviewsMutation>(SubmitTechnicalReviewsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'submitTechnicalReviews', 'mutation');
    },
    updateReview(variables: UpdateReviewMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateReviewMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateReviewMutation>(UpdateReviewDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateReview', 'mutation');
    },
    userWithReviews(variables?: UserWithReviewsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UserWithReviewsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserWithReviewsQuery>(UserWithReviewsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userWithReviews', 'query');
    },
    cloneSampleEsi(variables: CloneSampleEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CloneSampleEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CloneSampleEsiMutation>(CloneSampleEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cloneSampleEsi', 'mutation');
    },
    createSampleEsi(variables: CreateSampleEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateSampleEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateSampleEsiMutation>(CreateSampleEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createSampleEsi', 'mutation');
    },
    deleteSampleEsi(variables: DeleteSampleEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteSampleEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteSampleEsiMutation>(DeleteSampleEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteSampleEsi', 'mutation');
    },
    getSampleEsi(variables: GetSampleEsiQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSampleEsiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSampleEsiQuery>(GetSampleEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSampleEsi', 'query');
    },
    updateSampleEsi(variables: UpdateSampleEsiMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateSampleEsiMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSampleEsiMutation>(UpdateSampleEsiDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSampleEsi', 'mutation');
    },
    cloneSample(variables: CloneSampleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CloneSampleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CloneSampleMutation>(CloneSampleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cloneSample', 'mutation');
    },
    createSample(variables: CreateSampleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateSampleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateSampleMutation>(CreateSampleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createSample', 'mutation');
    },
    deleteSample(variables: DeleteSampleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteSampleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteSampleMutation>(DeleteSampleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteSample', 'mutation');
    },
    getSample(variables: GetSampleQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSampleQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSampleQuery>(GetSampleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSample', 'query');
    },
    getSamplesByCallId(variables: GetSamplesByCallIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSamplesByCallIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSamplesByCallIdQuery>(GetSamplesByCallIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSamplesByCallId', 'query');
    },
    getSamplesWithProposalData(variables?: GetSamplesWithProposalDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSamplesWithProposalDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSamplesWithProposalDataQuery>(GetSamplesWithProposalDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSamplesWithProposalData', 'query');
    },
    getSamplesWithQuestionaryStatus(variables?: GetSamplesWithQuestionaryStatusQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSamplesWithQuestionaryStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSamplesWithQuestionaryStatusQuery>(GetSamplesWithQuestionaryStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSamplesWithQuestionaryStatus', 'query');
    },
    updateSample(variables: UpdateSampleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateSampleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSampleMutation>(UpdateSampleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSample', 'mutation');
    },
    getScheduledEventCore(variables: GetScheduledEventCoreQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetScheduledEventCoreQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetScheduledEventCoreQuery>(GetScheduledEventCoreDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getScheduledEventCore', 'query');
    },
    getScheduledEventsCore(variables?: GetScheduledEventsCoreQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetScheduledEventsCoreQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetScheduledEventsCoreQuery>(GetScheduledEventsCoreDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getScheduledEventsCore', 'query');
    },
    addProposalWorkflowStatus(variables: AddProposalWorkflowStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddProposalWorkflowStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProposalWorkflowStatusMutation>(AddProposalWorkflowStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addProposalWorkflowStatus', 'mutation');
    },
    addStatusChangingEventsToConnection(variables: AddStatusChangingEventsToConnectionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddStatusChangingEventsToConnectionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddStatusChangingEventsToConnectionMutation>(AddStatusChangingEventsToConnectionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addStatusChangingEventsToConnection', 'mutation');
    },
    createProposalStatus(variables: CreateProposalStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateProposalStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateProposalStatusMutation>(CreateProposalStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createProposalStatus', 'mutation');
    },
    createProposalWorkflow(variables: CreateProposalWorkflowMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateProposalWorkflowMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateProposalWorkflowMutation>(CreateProposalWorkflowDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createProposalWorkflow', 'mutation');
    },
    deleteProposalStatus(variables: DeleteProposalStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteProposalStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteProposalStatusMutation>(DeleteProposalStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteProposalStatus', 'mutation');
    },
    deleteProposalWorkflow(variables: DeleteProposalWorkflowMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteProposalWorkflowMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteProposalWorkflowMutation>(DeleteProposalWorkflowDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteProposalWorkflow', 'mutation');
    },
    deleteProposalWorkflowStatus(variables: DeleteProposalWorkflowStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteProposalWorkflowStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteProposalWorkflowStatusMutation>(DeleteProposalWorkflowStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteProposalWorkflowStatus', 'mutation');
    },
    getProposalEvents(variables?: GetProposalEventsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalEventsQuery>(GetProposalEventsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalEvents', 'query');
    },
    getProposalStatuses(variables?: GetProposalStatusesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalStatusesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalStatusesQuery>(GetProposalStatusesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalStatuses', 'query');
    },
    getProposalWorkflow(variables: GetProposalWorkflowQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalWorkflowQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalWorkflowQuery>(GetProposalWorkflowDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalWorkflow', 'query');
    },
    getProposalWorkflows(variables?: GetProposalWorkflowsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalWorkflowsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalWorkflowsQuery>(GetProposalWorkflowsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalWorkflows', 'query');
    },
    moveProposalWorkflowStatus(variables: MoveProposalWorkflowStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MoveProposalWorkflowStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<MoveProposalWorkflowStatusMutation>(MoveProposalWorkflowStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'moveProposalWorkflowStatus', 'mutation');
    },
    updateFeatures(variables: UpdateFeaturesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateFeaturesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateFeaturesMutation>(UpdateFeaturesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateFeatures', 'mutation');
    },
    updateProposalStatus(variables: UpdateProposalStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateProposalStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProposalStatusMutation>(UpdateProposalStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateProposalStatus', 'mutation');
    },
    updateProposalWorkflow(variables: UpdateProposalWorkflowMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateProposalWorkflowMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProposalWorkflowMutation>(UpdateProposalWorkflowDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateProposalWorkflow', 'mutation');
    },
    updateSettings(variables: UpdateSettingsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateSettingsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSettingsMutation>(UpdateSettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSettings', 'mutation');
    },
    addSamplesToShipment(variables: AddSamplesToShipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSamplesToShipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSamplesToShipmentMutation>(AddSamplesToShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addSamplesToShipment', 'mutation');
    },
    createShipment(variables: CreateShipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateShipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateShipmentMutation>(CreateShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createShipment', 'mutation');
    },
    deleteShipment(variables: DeleteShipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteShipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteShipmentMutation>(DeleteShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteShipment', 'mutation');
    },
    getMyShipments(variables?: GetMyShipmentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetMyShipmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMyShipmentsQuery>(GetMyShipmentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMyShipments', 'query');
    },
    getShipment(variables: GetShipmentQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetShipmentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShipmentQuery>(GetShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getShipment', 'query');
    },
    getShipments(variables?: GetShipmentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetShipmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShipmentsQuery>(GetShipmentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getShipments', 'query');
    },
    setActiveTemplate(variables: SetActiveTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetActiveTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetActiveTemplateMutation>(SetActiveTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setActiveTemplate', 'mutation');
    },
    submitShipment(variables: SubmitShipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SubmitShipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SubmitShipmentMutation>(SubmitShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'submitShipment', 'mutation');
    },
    updateShipment(variables: UpdateShipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateShipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateShipmentMutation>(UpdateShipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateShipment', 'mutation');
    },
    importTemplate(variables: ImportTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ImportTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ImportTemplateMutation>(ImportTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'importTemplate', 'mutation');
    },
    cloneTemplate(variables: CloneTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CloneTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CloneTemplateMutation>(CloneTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cloneTemplate', 'mutation');
    },
    createQuestion(variables: CreateQuestionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateQuestionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateQuestionMutation>(CreateQuestionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createQuestion', 'mutation');
    },
    createQuestionTemplateRelation(variables: CreateQuestionTemplateRelationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateQuestionTemplateRelationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateQuestionTemplateRelationMutation>(CreateQuestionTemplateRelationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createQuestionTemplateRelation', 'mutation');
    },
    createTemplate(variables: CreateTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateTemplateMutation>(CreateTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createTemplate', 'mutation');
    },
    createTopic(variables: CreateTopicMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateTopicMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateTopicMutation>(CreateTopicDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createTopic', 'mutation');
    },
    deleteQuestion(variables: DeleteQuestionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteQuestionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteQuestionMutation>(DeleteQuestionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteQuestion', 'mutation');
    },
    deleteQuestionTemplateRelation(variables: DeleteQuestionTemplateRelationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteQuestionTemplateRelationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteQuestionTemplateRelationMutation>(DeleteQuestionTemplateRelationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteQuestionTemplateRelation', 'mutation');
    },
    deleteTemplate(variables: DeleteTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTemplateMutation>(DeleteTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteTemplate', 'mutation');
    },
    deleteTopic(variables: DeleteTopicMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteTopicMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTopicMutation>(DeleteTopicDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteTopic', 'mutation');
    },
    getActiveTemplateId(variables: GetActiveTemplateIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetActiveTemplateIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveTemplateIdQuery>(GetActiveTemplateIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveTemplateId', 'query');
    },
    getIsNaturalKeyPresent(variables: GetIsNaturalKeyPresentQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetIsNaturalKeyPresentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetIsNaturalKeyPresentQuery>(GetIsNaturalKeyPresentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getIsNaturalKeyPresent', 'query');
    },
    getPdfTemplate(variables: GetPdfTemplateQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPdfTemplateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPdfTemplateQuery>(GetPdfTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getPdfTemplate', 'query');
    },
    getProposalTemplates(variables?: GetProposalTemplatesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProposalTemplatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProposalTemplatesQuery>(GetProposalTemplatesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProposalTemplates', 'query');
    },
    getQuestions(variables?: GetQuestionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetQuestionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetQuestionsQuery>(GetQuestionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getQuestions', 'query');
    },
    getTemplate(variables: GetTemplateQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTemplateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTemplateQuery>(GetTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTemplate', 'query');
    },
    getTemplateCategories(variables?: GetTemplateCategoriesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTemplateCategoriesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTemplateCategoriesQuery>(GetTemplateCategoriesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTemplateCategories', 'query');
    },
    getTemplateExport(variables: GetTemplateExportQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTemplateExportQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTemplateExportQuery>(GetTemplateExportDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTemplateExport', 'query');
    },
    getTemplates(variables?: GetTemplatesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTemplatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTemplatesQuery>(GetTemplatesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTemplates', 'query');
    },
    updatePdfTemplate(variables: UpdatePdfTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdatePdfTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePdfTemplateMutation>(UpdatePdfTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updatePdfTemplate', 'mutation');
    },
    updateQuestion(variables: UpdateQuestionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateQuestionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateQuestionMutation>(UpdateQuestionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateQuestion', 'mutation');
    },
    updateQuestionTemplateRelation(variables: UpdateQuestionTemplateRelationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateQuestionTemplateRelationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateQuestionTemplateRelationMutation>(UpdateQuestionTemplateRelationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateQuestionTemplateRelation', 'mutation');
    },
    updateQuestionTemplateRelationSettings(variables: UpdateQuestionTemplateRelationSettingsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateQuestionTemplateRelationSettingsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateQuestionTemplateRelationSettingsMutation>(UpdateQuestionTemplateRelationSettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateQuestionTemplateRelationSettings', 'mutation');
    },
    updateTemplate(variables: UpdateTemplateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateTemplateMutation>(UpdateTemplateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateTemplate', 'mutation');
    },
    updateTopic(variables: UpdateTopicMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateTopicMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateTopicMutation>(UpdateTopicDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateTopic', 'mutation');
    },
    validateTemplateImport(variables: ValidateTemplateImportMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ValidateTemplateImportMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidateTemplateImportMutation>(ValidateTemplateImportDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'validateTemplateImport', 'mutation');
    },
    createUnit(variables: CreateUnitMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUnitMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUnitMutation>(CreateUnitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUnit', 'mutation');
    },
    deleteUnit(variables: DeleteUnitMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteUnitMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUnitMutation>(DeleteUnitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUnit', 'mutation');
    },
    getUnits(variables?: GetUnitsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUnitsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUnitsQuery>(GetUnitsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUnits', 'query');
    },
    getUnitsAsJson(variables?: GetUnitsAsJsonQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUnitsAsJsonQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUnitsAsJsonQuery>(GetUnitsAsJsonDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUnitsAsJson', 'query');
    },
    importUnits(variables: ImportUnitsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ImportUnitsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ImportUnitsMutation>(ImportUnitsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'importUnits', 'mutation');
    },
    validateUnitsImport(variables: ValidateUnitsImportMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ValidateUnitsImportMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidateUnitsImportMutation>(ValidateUnitsImportDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'validateUnitsImport', 'mutation');
    },
    checkToken(variables: CheckTokenQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CheckTokenQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CheckTokenQuery>(CheckTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'checkToken', 'query');
    },
    createUser(variables: CreateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserMutation>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUser', 'mutation');
    },
    createUserByEmailInvite(variables: CreateUserByEmailInviteMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUserByEmailInviteMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserByEmailInviteMutation>(CreateUserByEmailInviteDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUserByEmailInvite', 'mutation');
    },
    deleteUser(variables: DeleteUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUser', 'mutation');
    },
    externalTokenLogin(variables: ExternalTokenLoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ExternalTokenLoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExternalTokenLoginMutation>(ExternalTokenLoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'externalTokenLogin', 'mutation');
    },
    getBasicUserDetails(variables: GetBasicUserDetailsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetBasicUserDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBasicUserDetailsQuery>(GetBasicUserDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBasicUserDetails', 'query');
    },
    getBasicUserDetailsByEmail(variables: GetBasicUserDetailsByEmailQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetBasicUserDetailsByEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBasicUserDetailsByEmailQuery>(GetBasicUserDetailsByEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBasicUserDetailsByEmail', 'query');
    },
    getCountries(variables?: GetCountriesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCountriesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCountriesQuery>(GetCountriesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCountries', 'query');
    },
    getMyRoles(variables?: GetMyRolesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetMyRolesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMyRolesQuery>(GetMyRolesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMyRoles', 'query');
    },
    getNationalities(variables?: GetNationalitiesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNationalitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNationalitiesQuery>(GetNationalitiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getNationalities', 'query');
    },
    getOrcIDInformation(variables: GetOrcIdInformationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetOrcIdInformationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOrcIdInformationQuery>(GetOrcIdInformationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getOrcIDInformation', 'query');
    },
    getPreviousCollaborators(variables: GetPreviousCollaboratorsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPreviousCollaboratorsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPreviousCollaboratorsQuery>(GetPreviousCollaboratorsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getPreviousCollaborators', 'query');
    },
    getRoles(variables?: GetRolesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRolesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRolesQuery>(GetRolesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getRoles', 'query');
    },
    getToken(variables: GetTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTokenMutation>(GetTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getToken', 'mutation');
    },
    getTokenForUser(variables: GetTokenForUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetTokenForUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTokenForUserMutation>(GetTokenForUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTokenForUser', 'mutation');
    },
    getUser(variables: GetUserQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserQuery>(GetUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUser', 'query');
    },
    getUserMe(variables?: GetUserMeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserMeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserMeQuery>(GetUserMeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserMe', 'query');
    },
    getUserProposals(variables?: GetUserProposalsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserProposalsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserProposalsQuery>(GetUserProposalsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserProposals', 'query');
    },
    getUserWithRoles(variables: GetUserWithRolesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserWithRolesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserWithRolesQuery>(GetUserWithRolesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserWithRoles', 'query');
    },
    getUsers(variables?: GetUsersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUsersQuery>(GetUsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUsers', 'query');
    },
    login(variables: LoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'login', 'mutation');
    },
    logout(variables: LogoutMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LogoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LogoutMutation>(LogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'logout', 'mutation');
    },
    resetPassword(variables: ResetPasswordMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ResetPasswordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResetPasswordMutation>(ResetPasswordDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resetPassword', 'mutation');
    },
    resetPasswordEmail(variables: ResetPasswordEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ResetPasswordEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResetPasswordEmailMutation>(ResetPasswordEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resetPasswordEmail', 'mutation');
    },
    selectRole(variables: SelectRoleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SelectRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SelectRoleMutation>(SelectRoleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'selectRole', 'mutation');
    },
    setUserEmailVerified(variables: SetUserEmailVerifiedMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetUserEmailVerifiedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetUserEmailVerifiedMutation>(SetUserEmailVerifiedDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setUserEmailVerified', 'mutation');
    },
    setUserNotPlaceholder(variables: SetUserNotPlaceholderMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetUserNotPlaceholderMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetUserNotPlaceholderMutation>(SetUserNotPlaceholderDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setUserNotPlaceholder', 'mutation');
    },
    updatePassword(variables: UpdatePasswordMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdatePasswordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePasswordMutation>(UpdatePasswordDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updatePassword', 'mutation');
    },
    updateUser(variables: UpdateUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserMutation>(UpdateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUser', 'mutation');
    },
    updateUserRoles(variables: UpdateUserRolesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserRolesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserRolesMutation>(UpdateUserRolesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUserRoles', 'mutation');
    },
    verifyEmail(variables: VerifyEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<VerifyEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyEmailMutation>(VerifyEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyEmail', 'mutation');
    },
    createVisit(variables: CreateVisitMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateVisitMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateVisitMutation>(CreateVisitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createVisit', 'mutation');
    },
    deleteVisit(variables: DeleteVisitMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteVisitMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteVisitMutation>(DeleteVisitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteVisit', 'mutation');
    },
    getVisit(variables: GetVisitQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetVisitQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisitQuery>(GetVisitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getVisit', 'query');
    },
    getVisits(variables?: GetVisitsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetVisitsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisitsQuery>(GetVisitsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getVisits', 'query');
    },
    updateVisit(variables: UpdateVisitMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateVisitMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateVisitMutation>(UpdateVisitDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateVisit', 'mutation');
    },
    createVisitRegistration(variables: CreateVisitRegistrationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateVisitRegistrationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateVisitRegistrationMutation>(CreateVisitRegistrationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createVisitRegistration', 'mutation');
    },
    getVisitRegistration(variables: GetVisitRegistrationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetVisitRegistrationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisitRegistrationQuery>(GetVisitRegistrationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getVisitRegistration', 'query');
    },
    updateVisitRegistration(variables: UpdateVisitRegistrationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateVisitRegistrationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateVisitRegistrationMutation>(UpdateVisitRegistrationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateVisitRegistration', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;