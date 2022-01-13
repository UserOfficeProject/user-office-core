import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
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
  /** DateTime without timezone in 'yyyy-MM-DD HH:mm:ss' format */
  TzLessDateTime: string;
  _Any: any;
};








export type AddProposalWorkflowStatusInput = {
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  droppableGroupId: Scalars['String'];
  parentDroppableGroupId?: Maybe<Scalars['String']>;
  proposalStatusId: Scalars['Int'];
  nextProposalStatusId?: Maybe<Scalars['Int']>;
  prevProposalStatusId?: Maybe<Scalars['Int']>;
};

export type AddStatusChangingEventsToConnectionInput = {
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']>;
};

export type AddTechnicalReviewInput = {
  proposalPk: Scalars['Int'];
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  timeAllocation?: Maybe<Scalars['Int']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted?: Maybe<Scalars['Boolean']>;
  reviewerId?: Maybe<Scalars['Int']>;
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
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
  config: FieldConfig;
  dependencies: Array<FieldDependency>;
  dependenciesOperator: Maybe<DependenciesLogicOperator>;
  answerId: Maybe<Scalars['Int']>;
  value: Maybe<Scalars['IntStringDateBoolArray']>;
};

export type AnswerBasic = {
  answerId: Maybe<Scalars['Int']>;
  answer: Scalars['IntStringDateBoolArray'];
  questionaryId: Scalars['Int'];
  questionId: Scalars['String'];
  createdAt: Scalars['DateTime'];
};

export type AnswerInput = {
  questionId: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type ApiAccessTokenResponseWrap = {
  rejection: Maybe<Rejection>;
  apiAccessToken: Maybe<PermissionsWithAccessToken>;
};

export type AssignChairOrSecretaryToSepInput = {
  userId: Scalars['Int'];
  roleId: UserRole;
  sepId: Scalars['Int'];
};

export type AssignInstrumentsToCallInput = {
  instrumentIds: Array<Scalars['Int']>;
  callId: Scalars['Int'];
};

export type AuthJwtApiTokenPayload = {
  accessTokenId: Scalars['String'];
};

export type AuthJwtPayload = {
  user: User;
  currentRole: Role;
  roles: Array<Role>;
};

export type BasicUserDetails = {
  id: Scalars['Int'];
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  preferredname: Maybe<Scalars['String']>;
  organisation: Scalars['String'];
  position: Scalars['String'];
  placeholder: Maybe<Scalars['Boolean']>;
  created: Maybe<Scalars['DateTime']>;
};

export type BasicUserDetailsResponseWrap = {
  rejection: Maybe<Rejection>;
  user: Maybe<BasicUserDetails>;
};

export type BooleanConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};

export type Call = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview: Maybe<Scalars['DateTime']>;
  endSEPReview: Maybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  referenceNumberFormat: Maybe<Scalars['String']>;
  proposalSequence: Maybe<Scalars['Int']>;
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  submissionMessage: Maybe<Scalars['String']>;
  proposalWorkflowId: Maybe<Scalars['Int']>;
  allocationTimeUnit: AllocationTimeUnits;
  templateId: Scalars['Int'];
  esiTemplateId: Maybe<Scalars['Int']>;
  title: Maybe<Scalars['String']>;
  description: Maybe<Scalars['String']>;
  instruments: Array<InstrumentWithAvailabilityTime>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  template: Template;
  proposalCount: Scalars['Int'];
  isActive: Scalars['Boolean'];
};

export type CallResponseWrap = {
  rejection: Maybe<Rejection>;
  call: Maybe<Call>;
};

export type CallsFilter = {
  templateIds?: Maybe<Array<Scalars['Int']>>;
  isActive?: Maybe<Scalars['Boolean']>;
  isEnded?: Maybe<Scalars['Boolean']>;
  isReviewEnded?: Maybe<Scalars['Boolean']>;
  isSEPReviewEnded?: Maybe<Scalars['Boolean']>;
};

export type ChangeProposalsStatusInput = {
  statusId: Scalars['Int'];
  proposals: Array<ProposalPkWithCallId>;
};

export type CloneProposalsInput = {
  callId: Scalars['Int'];
  proposalsToClonePk: Array<Scalars['Int']>;
};

export type ConflictResolution = {
  questionId: Scalars['String'];
  strategy: ConflictResolutionStrategy;
};

export enum ConflictResolutionStrategy {
  USE_NEW = 'USE_NEW',
  USE_EXISTING = 'USE_EXISTING',
  UNRESOLVED = 'UNRESOLVED'
}

export type CreateApiAccessTokenInput = {
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
};

export type CreateCallInput = {
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  endSEPReview?: Maybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalSequence?: Maybe<Scalars['Int']>;
  cycleComment: Scalars['String'];
  submissionMessage?: Maybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type CreateProposalStatusInput = {
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
};

export type CreateProposalWorkflowInput = {
  name: Scalars['String'];
  description: Scalars['String'];
};

export type CreateUserByEmailInviteResponseWrap = {
  rejection: Maybe<Rejection>;
  id: Maybe<Scalars['Int']>;
};

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SAMPLE_BASIS = 'SAMPLE_BASIS',
  PROPOSAL_BASIS = 'PROPOSAL_BASIS',
  INTERVAL = 'INTERVAL',
  NUMBER_INPUT = 'NUMBER_INPUT',
  SHIPMENT_BASIS = 'SHIPMENT_BASIS',
  RICH_TEXT_INPUT = 'RICH_TEXT_INPUT',
  VISIT_BASIS = 'VISIT_BASIS',
  GENERIC_TEMPLATE_BASIS = 'GENERIC_TEMPLATE_BASIS',
  PROPOSAL_ESI_BASIS = 'PROPOSAL_ESI_BASIS',
  SAMPLE_ESI_BASIS = 'SAMPLE_ESI_BASIS',
  FEEDBACK_BASIS = 'FEEDBACK_BASIS'
}

export type DateConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  minDate: Maybe<Scalars['String']>;
  maxDate: Maybe<Scalars['String']>;
  defaultDate: Maybe<Scalars['String']>;
  includeTime: Scalars['Boolean'];
};


export type DeleteApiAccessTokenInput = {
  accessTokenId: Scalars['String'];
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
  omitFromPdf: Scalars['Boolean'];
  html: Scalars['String'];
  plain: Scalars['String'];
};

export type Entry = {
  id: Scalars['Int'];
  value: Scalars['String'];
};

export type EsiResponseWrap = {
  rejection: Maybe<Rejection>;
  esi: Maybe<ExperimentSafetyInput>;
};

export enum EvaluatorOperator {
  EQ = 'eq',
  NEQ = 'neq'
}

export enum Event {
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_UPDATED = 'PROPOSAL_UPDATED',
  PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
  PROPOSAL_FEASIBLE = 'PROPOSAL_FEASIBLE',
  PROPOSAL_UNFEASIBLE = 'PROPOSAL_UNFEASIBLE',
  PROPOSAL_SEP_SELECTED = 'PROPOSAL_SEP_SELECTED',
  PROPOSAL_INSTRUMENT_SELECTED = 'PROPOSAL_INSTRUMENT_SELECTED',
  PROPOSAL_FEASIBILITY_REVIEW_UPDATED = 'PROPOSAL_FEASIBILITY_REVIEW_UPDATED',
  PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED = 'PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_REVIEW_SUBMITTED = 'PROPOSAL_SAMPLE_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_SAFE = 'PROPOSAL_SAMPLE_SAFE',
  PROPOSAL_ALL_SEP_REVIEWERS_SELECTED = 'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
  PROPOSAL_SEP_REVIEW_UPDATED = 'PROPOSAL_SEP_REVIEW_UPDATED',
  PROPOSAL_SEP_REVIEW_SUBMITTED = 'PROPOSAL_SEP_REVIEW_SUBMITTED',
  PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED = 'PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED',
  PROPOSAL_SEP_MEETING_SAVED = 'PROPOSAL_SEP_MEETING_SAVED',
  PROPOSAL_SEP_MEETING_SUBMITTED = 'PROPOSAL_SEP_MEETING_SUBMITTED',
  PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN = 'PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN',
  PROPOSAL_SEP_MEETING_REORDER = 'PROPOSAL_SEP_MEETING_REORDER',
  PROPOSAL_MANAGEMENT_DECISION_UPDATED = 'PROPOSAL_MANAGEMENT_DECISION_UPDATED',
  PROPOSAL_MANAGEMENT_DECISION_SUBMITTED = 'PROPOSAL_MANAGEMENT_DECISION_SUBMITTED',
  PROPOSAL_INSTRUMENT_SUBMITTED = 'PROPOSAL_INSTRUMENT_SUBMITTED',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_RESERVED = 'PROPOSAL_RESERVED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
  PROPOSAL_STATUS_UPDATED = 'PROPOSAL_STATUS_UPDATED',
  CALL_ENDED = 'CALL_ENDED',
  CALL_REVIEW_ENDED = 'CALL_REVIEW_ENDED',
  CALL_SEP_REVIEW_ENDED = 'CALL_SEP_REVIEW_ENDED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_PASSWORD_RESET_EMAIL = 'USER_PASSWORD_RESET_EMAIL',
  EMAIL_INVITE = 'EMAIL_INVITE',
  SEP_CREATED = 'SEP_CREATED',
  SEP_UPDATED = 'SEP_UPDATED',
  SEP_MEMBERS_ASSIGNED = 'SEP_MEMBERS_ASSIGNED',
  SEP_MEMBER_REMOVED = 'SEP_MEMBER_REMOVED',
  SEP_PROPOSAL_REMOVED = 'SEP_PROPOSAL_REMOVED',
  SEP_MEMBER_ASSIGNED_TO_PROPOSAL = 'SEP_MEMBER_ASSIGNED_TO_PROPOSAL',
  SEP_MEMBER_REMOVED_FROM_PROPOSAL = 'SEP_MEMBER_REMOVED_FROM_PROPOSAL',
  PROPOSAL_NOTIFIED = 'PROPOSAL_NOTIFIED',
  PROPOSAL_CLONED = 'PROPOSAL_CLONED',
  PROPOSAL_STATUS_CHANGED_BY_WORKFLOW = 'PROPOSAL_STATUS_CHANGED_BY_WORKFLOW',
  PROPOSAL_STATUS_CHANGED_BY_USER = 'PROPOSAL_STATUS_CHANGED_BY_USER',
  TOPIC_ANSWERED = 'TOPIC_ANSWERED',
  PROPOSAL_BOOKING_TIME_SLOT_ADDED = 'PROPOSAL_BOOKING_TIME_SLOT_ADDED',
  PROPOSAL_BOOKING_TIME_SLOTS_REMOVED = 'PROPOSAL_BOOKING_TIME_SLOTS_REMOVED',
  PROPOSAL_BOOKING_TIME_ACTIVATED = 'PROPOSAL_BOOKING_TIME_ACTIVATED',
  PROPOSAL_BOOKING_TIME_COMPLETED = 'PROPOSAL_BOOKING_TIME_COMPLETED',
  PROPOSAL_BOOKING_TIME_UPDATED = 'PROPOSAL_BOOKING_TIME_UPDATED',
  PROPOSAL_BOOKING_TIME_REOPENED = 'PROPOSAL_BOOKING_TIME_REOPENED'
}

export type EventLog = {
  id: Scalars['Int'];
  eventType: Scalars['String'];
  rowData: Scalars['String'];
  eventTStamp: Scalars['DateTime'];
  changedObjectId: Scalars['String'];
  changedBy: User;
};

export type ExperimentSafetyInput = {
  id: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  creatorId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  isSubmitted: Scalars['Boolean'];
  created: Scalars['DateTime'];
  sampleEsis: Array<SampleExperimentSafetyInput>;
  questionary: Questionary;
  proposal: Proposal;
};

export type ExternalTokenLoginWrap = {
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type Feature = {
  id: FeatureId;
  isEnabled: Scalars['Boolean'];
  description: Scalars['String'];
};

export enum FeatureId {
  SHIPPING = 'SHIPPING',
  SCHEDULER = 'SCHEDULER',
  EXTERNAL_AUTH = 'EXTERNAL_AUTH',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  EMAIL_INVITE = 'EMAIL_INVITE'
}

export type Feedback = {
  id: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  status: FeedbackStatus;
  questionaryId: Scalars['Int'];
  creatorId: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  submittedAt: Maybe<Scalars['DateTime']>;
  questionary: Questionary;
};

export type FeedbackBasisConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};

export type FeedbackResponseWrap = {
  rejection: Maybe<Rejection>;
  feedback: Maybe<Feedback>;
};

export enum FeedbackStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type FeedbacksFilter = {
  creatorId?: Maybe<Scalars['Int']>;
  scheduledEventId?: Maybe<Scalars['Int']>;
};

export type FieldCondition = {
  condition: EvaluatorOperator;
  params: Scalars['IntStringDateBoolArray'];
};

export type FieldConditionInput = {
  condition: EvaluatorOperator;
  params: Scalars['String'];
};

export type FieldConfig = BooleanConfig | DateConfig | EmbellishmentConfig | FileUploadConfig | SelectionFromOptionsConfig | TextInputConfig | SampleBasisConfig | SampleDeclarationConfig | SampleEsiBasisConfig | SubTemplateConfig | ProposalBasisConfig | ProposalEsiBasisConfig | IntervalConfig | NumberInputConfig | ShipmentBasisConfig | RichTextInputConfig | VisitBasisConfig | GenericTemplateBasisConfig | FeedbackBasisConfig;

export type FieldDependency = {
  questionId: Scalars['String'];
  dependencyId: Scalars['String'];
  dependencyNaturalKey: Scalars['String'];
  condition: FieldCondition;
};

export type FieldDependencyInput = {
  dependencyId: Scalars['String'];
  condition: FieldConditionInput;
};

export type Fields = {
  nationalities: Array<Entry>;
  countries: Array<Entry>;
};

export type FileMetadata = {
  originalFileName: Scalars['String'];
  mimeType: Scalars['String'];
  sizeInBytes: Scalars['Int'];
  createdDate: Scalars['DateTime'];
  fileId: Scalars['String'];
};

export type FileUploadConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  file_type: Array<Scalars['String']>;
  max_files: Scalars['Int'];
};

export type GenericTemplate = {
  id: Scalars['Int'];
  title: Scalars['String'];
  creatorId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  created: Scalars['DateTime'];
  questionary: Questionary;
  proposal: Proposal;
};

export type GenericTemplateBasisConfig = {
  titlePlaceholder: Scalars['String'];
  questionLabel: Scalars['String'];
};

export type GenericTemplateResponseWrap = {
  rejection: Maybe<Rejection>;
  genericTemplate: Maybe<GenericTemplate>;
};

export type GenericTemplatesFilter = {
  title?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['Int']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  genericTemplateIds?: Maybe<Array<Scalars['Int']>>;
  questionId?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
};

export type IndexWithGroupId = {
  index: Scalars['Int'];
  droppableId: Scalars['String'];
};

export type Institution = {
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type InstitutionResponseWrap = {
  rejection: Maybe<Rejection>;
  institution: Maybe<Institution>;
};

export type InstitutionsFilter = {
  isVerified?: Maybe<Scalars['Boolean']>;
};

export type Instrument = {
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
  scientists: Array<BasicUserDetails>;
  beamlineManager: BasicUserDetails;
};

export type InstrumentResponseWrap = {
  rejection: Maybe<Rejection>;
  instrument: Maybe<Instrument>;
};

export type InstrumentWithAvailabilityTime = {
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
  scientists: Array<BasicUserDetails>;
  beamlineManager: BasicUserDetails;
  availabilityTime: Maybe<Scalars['Int']>;
  submitted: Maybe<Scalars['Boolean']>;
};

export type InstrumentsQueryResult = {
  totalCount: Scalars['Int'];
  instruments: Array<Instrument>;
};


export type IntervalConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  units: Maybe<Array<Scalars['String']>>;
};

export type LogoutTokenWrap = {
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type MoveProposalWorkflowStatusInput = {
  from: IndexWithGroupId;
  to: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
};

export type Mutation = {
  createApiAccessToken: ApiAccessTokenResponseWrap;
  createInstitution: InstitutionResponseWrap;
  createUnit: UnitResponseWrap;
  deleteApiAccessToken: SuccessResponseWrap;
  mergeInstitutions: InstitutionResponseWrap;
  updateApiAccessToken: ApiAccessTokenResponseWrap;
  updateInstitution: InstitutionResponseWrap;
  createCall: CallResponseWrap;
  updateCall: CallResponseWrap;
  assignInstrumentsToCall: CallResponseWrap;
  removeAssignedInstrumentFromCall: CallResponseWrap;
  createFeedback: FeedbackResponseWrap;
  updateFeedback: FeedbackResponseWrap;
  createGenericTemplate: GenericTemplateResponseWrap;
  updateGenericTemplate: GenericTemplateResponseWrap;
  changeProposalsStatus: SuccessResponseWrap;
  assignProposalsToInstrument: SuccessResponseWrap;
  removeProposalsFromInstrument: SuccessResponseWrap;
  assignScientistsToInstrument: SuccessResponseWrap;
  removeScientistFromInstrument: SuccessResponseWrap;
  createInstrument: InstrumentResponseWrap;
  updateInstrument: InstrumentResponseWrap;
  setInstrumentAvailabilityTime: SuccessResponseWrap;
  submitInstrument: SuccessResponseWrap;
  updateEsi: EsiResponseWrap;
  administrationProposal: ProposalResponseWrap;
  cloneProposals: ProposalsResponseWrap;
  importProposal: ProposalResponseWrap;
  updateProposal: ProposalResponseWrap;
  addProposalWorkflowStatus: ProposalWorkflowConnectionResponseWrap;
  addStatusChangingEventsToConnection: ProposalStatusChangingEventResponseWrap;
  createProposalStatus: ProposalStatusResponseWrap;
  createProposalWorkflow: ProposalWorkflowResponseWrap;
  deleteProposalWorkflowStatus: SuccessResponseWrap;
  moveProposalWorkflowStatus: ProposalWorkflowConnectionResponseWrap;
  updateProposalStatus: ProposalStatusResponseWrap;
  updateProposalWorkflow: ProposalWorkflowResponseWrap;
  answerTopic: QuestionaryStepResponseWrap;
  createQuestionary: QuestionaryResponseWrap;
  updateAnswer: UpdateAnswerResponseWrap;
  addReview: ReviewWithNextStatusResponseWrap;
  addUserForReview: ReviewResponseWrap;
  submitProposalsReview: SuccessResponseWrap;
  updateTechnicalReviewAssignee: ProposalsResponseWrap;
  createSampleEsi: SampleEsiResponseWrap;
  deleteSampleEsi: SampleEsiResponseWrap;
  updateSampleEsi: SampleEsiResponseWrap;
  cloneSampleEsi: SampleEsiResponseWrap;
  createSample: SampleResponseWrap;
  updateSample: SampleResponseWrap;
  cloneSample: SampleResponseWrap;
  assignChairOrSecretary: SepResponseWrap;
  assignReviewersToSEP: SepResponseWrap;
  removeMemberFromSep: SepResponseWrap;
  assignSepReviewersToProposal: SepResponseWrap;
  removeMemberFromSEPProposal: SepResponseWrap;
  assignProposalsToSep: NextProposalStatusResponseWrap;
  removeProposalsFromSep: SepResponseWrap;
  createSEP: SepResponseWrap;
  reorderSepMeetingDecisionProposals: SepMeetingDecisionResponseWrap;
  saveSepMeetingDecision: SepMeetingDecisionResponseWrap;
  updateSEP: SepResponseWrap;
  updateSEPTimeAllocation: SepProposalResponseWrap;
  createShipment: ShipmentResponseWrap;
  updateShipment: ShipmentResponseWrap;
  createQuestion: QuestionResponseWrap;
  createQuestionTemplateRelation: TemplateResponseWrap;
  createTemplate: TemplateResponseWrap;
  createTopic: TemplateResponseWrap;
  deleteQuestionTemplateRelation: TemplateResponseWrap;
  setActiveTemplate: SuccessResponseWrap;
  updateQuestion: QuestionResponseWrap;
  updateQuestionTemplateRelation: TemplateResponseWrap;
  updateQuestionTemplateRelationSettings: TemplateResponseWrap;
  updateTemplate: TemplateResponseWrap;
  updateTopic: TemplateResponseWrap;
  addUserRole: AddUserRoleResponseWrap;
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap;
  createUser: UserResponseWrap;
  updateUser: UserResponseWrap;
  updateUserRoles: UserResponseWrap;
  setUserEmailVerified: UserResponseWrap;
  setUserNotPlaceholder: UserResponseWrap;
  createVisit: VisitResponseWrap;
  updateVisit: VisitResponseWrap;
  updateVisitRegistration: VisitRegistrationResponseWrap;
  addClientLog: SuccessResponseWrap;
  addSamplesToShipment: ShipmentResponseWrap;
  addTechnicalReview: TechnicalReviewResponseWrap;
  applyPatches: PrepareDbResponseWrap;
  externalTokenLogin: ExternalTokenLoginWrap;
  cloneGenericTemplate: GenericTemplateResponseWrap;
  cloneTemplate: TemplateResponseWrap;
  createEsi: EsiResponseWrap;
  createProposal: ProposalResponseWrap;
  createVisitRegistrationQuestionary: VisitRegistrationResponseWrap;
  deleteCall: CallResponseWrap;
  deleteFeedback: FeedbackResponseWrap;
  deleteGenericTemplate: GenericTemplateResponseWrap;
  deleteInstitution: InstitutionResponseWrap;
  deleteInstrument: InstrumentResponseWrap;
  deleteProposal: ProposalResponseWrap;
  deleteQuestion: QuestionResponseWrap;
  deleteSample: SampleResponseWrap;
  deleteSEP: SepResponseWrap;
  deleteShipment: ShipmentResponseWrap;
  deleteTemplate: TemplateResponseWrap;
  deleteTopic: TemplateResponseWrap;
  deleteUnit: UnitResponseWrap;
  deleteUser: UserResponseWrap;
  deleteVisit: VisitResponseWrap;
  emailVerification: EmailVerificationResponseWrap;
  getTokenForUser: TokenResponseWrap;
  importTemplate: TemplateResponseWrap;
  login: TokenResponseWrap;
  logout: LogoutTokenWrap;
  notifyProposal: ProposalResponseWrap;
  prepareDB: PrepareDbResponseWrap;
  removeUserForReview: ReviewResponseWrap;
  resetPasswordEmail: SuccessResponseWrap;
  resetPassword: BasicUserDetailsResponseWrap;
  setPageContent: PageResponseWrap;
  deleteProposalStatus: ProposalStatusResponseWrap;
  deleteProposalWorkflow: ProposalWorkflowResponseWrap;
  submitProposal: ProposalResponseWrap;
  submitShipment: ShipmentResponseWrap;
  submitTechnicalReview: TechnicalReviewResponseWrap;
  token: TokenResponseWrap;
  selectRole: TokenResponseWrap;
  updatePassword: BasicUserDetailsResponseWrap;
  validateTemplateImport: TemplateImportWithValidationWrap;
};


export type MutationCreateApiAccessTokenArgs = {
  createApiAccessTokenInput: CreateApiAccessTokenInput;
};


export type MutationCreateInstitutionArgs = {
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};


export type MutationCreateUnitArgs = {
  name: Scalars['String'];
};


export type MutationDeleteApiAccessTokenArgs = {
  deleteApiAccessTokenInput: DeleteApiAccessTokenInput;
};


export type MutationMergeInstitutionsArgs = {
  institutionIdFrom: Scalars['Int'];
  institutionIdInto: Scalars['Int'];
  newTitle: Scalars['String'];
};


export type MutationUpdateApiAccessTokenArgs = {
  updateApiAccessTokenInput: UpdateApiAccessTokenInput;
};


export type MutationUpdateInstitutionArgs = {
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateCallArgs = {
  createCallInput: CreateCallInput;
};


export type MutationUpdateCallArgs = {
  updateCallInput: UpdateCallInput;
};


export type MutationAssignInstrumentsToCallArgs = {
  assignInstrumentsToCallInput: AssignInstrumentsToCallInput;
};


export type MutationRemoveAssignedInstrumentFromCallArgs = {
  removeAssignedInstrumentFromCallInput: RemoveAssignedInstrumentFromCallInput;
};


export type MutationCreateFeedbackArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationUpdateFeedbackArgs = {
  feedbackId: Scalars['Int'];
  status?: Maybe<FeedbackStatus>;
};


export type MutationCreateGenericTemplateArgs = {
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
};


export type MutationUpdateGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  safetyComment?: Maybe<Scalars['String']>;
};


export type MutationChangeProposalsStatusArgs = {
  changeProposalsStatusInput: ChangeProposalsStatusInput;
};


export type MutationAssignProposalsToInstrumentArgs = {
  proposals: Array<ProposalPkWithCallId>;
  instrumentId: Scalars['Int'];
};


export type MutationRemoveProposalsFromInstrumentArgs = {
  proposalPks: Array<Scalars['Int']>;
};


export type MutationAssignScientistsToInstrumentArgs = {
  scientistIds: Array<Scalars['Int']>;
  instrumentId: Scalars['Int'];
};


export type MutationRemoveScientistFromInstrumentArgs = {
  scientistId: Scalars['Int'];
  instrumentId: Scalars['Int'];
};


export type MutationCreateInstrumentArgs = {
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
};


export type MutationUpdateInstrumentArgs = {
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
};


export type MutationSetInstrumentAvailabilityTimeArgs = {
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
  availabilityTime: Scalars['Int'];
};


export type MutationSubmitInstrumentArgs = {
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationUpdateEsiArgs = {
  esiId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
};


export type MutationAdministrationProposalArgs = {
  proposalPk: Scalars['Int'];
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
  finalStatus?: Maybe<ProposalEndStatus>;
  statusId?: Maybe<Scalars['Int']>;
  managementTimeAllocation?: Maybe<Scalars['Int']>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
};


export type MutationCloneProposalsArgs = {
  cloneProposalsInput: CloneProposalsInput;
};


export type MutationImportProposalArgs = {
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']>>;
  proposerId?: Maybe<Scalars['Int']>;
  submitterId: Scalars['Int'];
  referenceNumber: Scalars['Int'];
  callId: Scalars['Int'];
};


export type MutationUpdateProposalArgs = {
  proposalPk: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']>>;
  proposerId?: Maybe<Scalars['Int']>;
};


export type MutationAddProposalWorkflowStatusArgs = {
  newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput;
};


export type MutationAddStatusChangingEventsToConnectionArgs = {
  addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionInput;
};


export type MutationCreateProposalStatusArgs = {
  newProposalStatusInput: CreateProposalStatusInput;
};


export type MutationCreateProposalWorkflowArgs = {
  newProposalWorkflowInput: CreateProposalWorkflowInput;
};


export type MutationDeleteProposalWorkflowStatusArgs = {
  deleteProposalWorkflowStatusInput: DeleteProposalWorkflowStatusInput;
};


export type MutationMoveProposalWorkflowStatusArgs = {
  moveProposalWorkflowStatusInput: MoveProposalWorkflowStatusInput;
};


export type MutationUpdateProposalStatusArgs = {
  updatedProposalStatusInput: UpdateProposalStatusInput;
};


export type MutationUpdateProposalWorkflowArgs = {
  updatedProposalWorkflowInput: UpdateProposalWorkflowInput;
};


export type MutationAnswerTopicArgs = {
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
  answers: Array<AnswerInput>;
  isPartialSave?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateQuestionaryArgs = {
  templateId: Scalars['Int'];
};


export type MutationUpdateAnswerArgs = {
  questionaryId: Scalars['Int'];
  answer: AnswerInput;
};


export type MutationAddReviewArgs = {
  reviewID: Scalars['Int'];
  comment: Scalars['String'];
  grade: Scalars['Int'];
  status: ReviewStatus;
  sepID: Scalars['Int'];
};


export type MutationAddUserForReviewArgs = {
  userID: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepID: Scalars['Int'];
};


export type MutationSubmitProposalsReviewArgs = {
  submitProposalsReviewInput: SubmitProposalsReviewInput;
};


export type MutationUpdateTechnicalReviewAssigneeArgs = {
  userId: Scalars['Int'];
  proposalPks: Array<Scalars['Int']>;
};


export type MutationCreateSampleEsiArgs = {
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
};


export type MutationDeleteSampleEsiArgs = {
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
};


export type MutationUpdateSampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
};


export type MutationCloneSampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  newSampleTitle?: Maybe<Scalars['String']>;
};


export type MutationCreateSampleArgs = {
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateSampleArgs = {
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  safetyComment?: Maybe<Scalars['String']>;
  safetyStatus?: Maybe<SampleStatus>;
};


export type MutationCloneSampleArgs = {
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
};


export type MutationAssignChairOrSecretaryArgs = {
  assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSepInput;
};


export type MutationAssignReviewersToSepArgs = {
  memberIds: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type MutationRemoveMemberFromSepArgs = {
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  roleId: UserRole;
};


export type MutationAssignSepReviewersToProposalArgs = {
  memberIds: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
};


export type MutationRemoveMemberFromSepProposalArgs = {
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
};


export type MutationAssignProposalsToSepArgs = {
  proposals: Array<ProposalPkWithCallId>;
  sepId: Scalars['Int'];
};


export type MutationRemoveProposalsFromSepArgs = {
  proposalPks: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type MutationCreateSepArgs = {
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired?: Maybe<Scalars['Int']>;
  active: Scalars['Boolean'];
};


export type MutationReorderSepMeetingDecisionProposalsArgs = {
  reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput;
};


export type MutationSaveSepMeetingDecisionArgs = {
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
};


export type MutationUpdateSepArgs = {
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired?: Maybe<Scalars['Int']>;
  active: Scalars['Boolean'];
};


export type MutationUpdateSepTimeAllocationArgs = {
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepTimeAllocation?: Maybe<Scalars['Int']>;
};


export type MutationCreateShipmentArgs = {
  title: Scalars['String'];
  proposalPk: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
};


export type MutationUpdateShipmentArgs = {
  shipmentId: Scalars['Int'];
  proposalPk?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  status?: Maybe<ShipmentStatus>;
  externalRef?: Maybe<Scalars['String']>;
};


export type MutationCreateQuestionArgs = {
  categoryId: TemplateCategoryId;
  dataType: DataType;
};


export type MutationCreateQuestionTemplateRelationArgs = {
  templateId: Scalars['Int'];
  questionId: Scalars['String'];
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
};


export type MutationCreateTemplateArgs = {
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};


export type MutationCreateTopicArgs = {
  templateId: Scalars['Int'];
  sortOrder?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['Int']>;
};


export type MutationDeleteQuestionTemplateRelationArgs = {
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
};


export type MutationSetActiveTemplateArgs = {
  templateGroupId: TemplateGroupId;
  templateId: Scalars['Int'];
};


export type MutationUpdateQuestionArgs = {
  id: Scalars['String'];
  naturalKey?: Maybe<Scalars['String']>;
  question?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
};


export type MutationUpdateQuestionTemplateRelationArgs = {
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  topicId?: Maybe<Scalars['Int']>;
  sortOrder: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
};


export type MutationUpdateQuestionTemplateRelationSettingsArgs = {
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput>;
  dependenciesOperator?: Maybe<DependenciesLogicOperator>;
};


export type MutationUpdateTemplateArgs = {
  templateId: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isArchived?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'];
  templateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  isEnabled?: Maybe<Scalars['Boolean']>;
};


export type MutationAddUserRoleArgs = {
  userID: Scalars['Int'];
  roleID: Scalars['Int'];
};


export type MutationCreateUserByEmailInviteArgs = {
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  email: Scalars['String'];
  userRole: UserRole;
};


export type MutationCreateUserArgs = {
  user_title?: Maybe<Scalars['String']>;
  firstname: Scalars['String'];
  middlename?: Maybe<Scalars['String']>;
  lastname: Scalars['String'];
  password: Scalars['String'];
  preferredname?: Maybe<Scalars['String']>;
  orcid: Scalars['String'];
  orcidHash: Scalars['String'];
  refreshToken: Scalars['String'];
  gender: Scalars['String'];
  nationality: Scalars['Int'];
  birthdate: Scalars['String'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: Maybe<Scalars['String']>;
  otherOrganisation?: Maybe<Scalars['String']>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['Int'];
  user_title?: Maybe<Scalars['String']>;
  firstname?: Maybe<Scalars['String']>;
  middlename?: Maybe<Scalars['String']>;
  lastname?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  preferredname?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  nationality?: Maybe<Scalars['Int']>;
  birthdate?: Maybe<Scalars['String']>;
  organisation?: Maybe<Scalars['Int']>;
  department?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  telephone?: Maybe<Scalars['String']>;
  telephone_alt?: Maybe<Scalars['String']>;
  placeholder?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Scalars['Int']>>;
  orcid?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
};


export type MutationUpdateUserRolesArgs = {
  id: Scalars['Int'];
  roles?: Maybe<Array<Scalars['Int']>>;
};


export type MutationSetUserEmailVerifiedArgs = {
  id: Scalars['Int'];
};


export type MutationSetUserNotPlaceholderArgs = {
  id: Scalars['Int'];
};


export type MutationCreateVisitArgs = {
  scheduledEventId: Scalars['Int'];
  team: Array<Scalars['Int']>;
  teamLeadUserId: Scalars['Int'];
};


export type MutationUpdateVisitArgs = {
  visitId: Scalars['Int'];
  status?: Maybe<VisitStatus>;
  team?: Maybe<Array<Scalars['Int']>>;
  teamLeadUserId?: Maybe<Scalars['Int']>;
};


export type MutationUpdateVisitRegistrationArgs = {
  visitId: Scalars['Int'];
  trainingExpiryDate?: Maybe<Scalars['DateTime']>;
  isRegistrationSubmitted?: Maybe<Scalars['Boolean']>;
};


export type MutationAddClientLogArgs = {
  error: Scalars['String'];
};


export type MutationAddSamplesToShipmentArgs = {
  shipmentId: Scalars['Int'];
  sampleIds: Array<Scalars['Int']>;
};


export type MutationAddTechnicalReviewArgs = {
  addTechnicalReviewInput: AddTechnicalReviewInput;
};


export type MutationExternalTokenLoginArgs = {
  externalToken: Scalars['String'];
};


export type MutationCloneGenericTemplateArgs = {
  title?: Maybe<Scalars['String']>;
  genericTemplateId: Scalars['Int'];
};


export type MutationCloneTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationCreateEsiArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationCreateProposalArgs = {
  callId: Scalars['Int'];
};


export type MutationCreateVisitRegistrationQuestionaryArgs = {
  visitId: Scalars['Int'];
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


export type MutationDeleteProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['String'];
};


export type MutationDeleteSampleArgs = {
  sampleId: Scalars['Int'];
};


export type MutationDeleteSepArgs = {
  id: Scalars['Int'];
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
  id: Scalars['Int'];
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


export type MutationGetTokenForUserArgs = {
  userId: Scalars['Int'];
};


export type MutationImportTemplateArgs = {
  conflictResolutions: Array<ConflictResolution>;
  templateAsJson: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationLogoutArgs = {
  token: Scalars['String'];
};


export type MutationNotifyProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationPrepareDbArgs = {
  includeSeeds?: Maybe<Scalars['Boolean']>;
};


export type MutationRemoveUserForReviewArgs = {
  sepId: Scalars['Int'];
  reviewId: Scalars['Int'];
};


export type MutationResetPasswordEmailArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  token: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSetPageContentArgs = {
  text: Scalars['String'];
  id: PageName;
};


export type MutationDeleteProposalStatusArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteProposalWorkflowArgs = {
  id: Scalars['Int'];
};


export type MutationSubmitProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationSubmitShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type MutationSubmitTechnicalReviewArgs = {
  submitTechnicalReviewInput: SubmitTechnicalReviewInput;
};


export type MutationTokenArgs = {
  token: Scalars['String'];
};


export type MutationSelectRoleArgs = {
  token: Scalars['String'];
  selectedRoleId?: Maybe<Scalars['Int']>;
};


export type MutationUpdatePasswordArgs = {
  id: Scalars['Int'];
  password: Scalars['String'];
};


export type MutationValidateTemplateImportArgs = {
  templateAsJson: Scalars['String'];
};

export type NextProposalStatus = {
  id: Maybe<Scalars['Int']>;
  shortCode: Maybe<Scalars['String']>;
  name: Maybe<Scalars['String']>;
  description: Maybe<Scalars['String']>;
  isDefault: Maybe<Scalars['Boolean']>;
};

export type NextProposalStatusResponseWrap = {
  rejection: Maybe<Rejection>;
  nextProposalStatus: Maybe<NextProposalStatus>;
};

export type NumberInputConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  units: Maybe<Array<Scalars['String']>>;
  numberValueConstraint: Maybe<NumberValueConstraint>;
};

export enum NumberValueConstraint {
  NONE = 'NONE',
  ONLY_POSITIVE = 'ONLY_POSITIVE',
  ONLY_NEGATIVE = 'ONLY_NEGATIVE'
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
  id: Scalars['Int'];
  content: Maybe<Scalars['String']>;
};

export enum PageName {
  HOMEPAGE = 'HOMEPAGE',
  HELPPAGE = 'HELPPAGE',
  PRIVACYPAGE = 'PRIVACYPAGE',
  COOKIEPAGE = 'COOKIEPAGE',
  REVIEWPAGE = 'REVIEWPAGE',
  FOOTERCONTENT = 'FOOTERCONTENT'
}

export type PageResponseWrap = {
  rejection: Maybe<Rejection>;
  page: Maybe<Page>;
};

export type PermissionsWithAccessToken = {
  id: Scalars['String'];
  name: Scalars['String'];
  accessToken: Scalars['String'];
  accessPermissions: Scalars['String'];
};

export type PrepareDbResponseWrap = {
  rejection: Maybe<Rejection>;
  log: Maybe<Scalars['String']>;
};

export type Proposal = {
  primaryKey: Scalars['Int'];
  title: Scalars['String'];
  abstract: Scalars['String'];
  statusId: Scalars['Int'];
  created: Scalars['DateTime'];
  updated: Scalars['DateTime'];
  proposalId: Scalars['String'];
  finalStatus: Maybe<ProposalEndStatus>;
  callId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  commentForUser: Maybe<Scalars['String']>;
  commentForManagement: Maybe<Scalars['String']>;
  notified: Scalars['Boolean'];
  submitted: Scalars['Boolean'];
  managementTimeAllocation: Maybe<Scalars['Int']>;
  managementDecisionSubmitted: Scalars['Boolean'];
  technicalReviewAssignee: Maybe<Scalars['Int']>;
  users: Array<BasicUserDetails>;
  proposer: Maybe<BasicUserDetails>;
  status: Maybe<ProposalStatus>;
  publicStatus: ProposalPublicStatus;
  reviews: Maybe<Array<Review>>;
  technicalReview: Maybe<TechnicalReview>;
  instrument: Maybe<Instrument>;
  sep: Maybe<Sep>;
  call: Maybe<Call>;
  questionary: Questionary;
  sepMeetingDecision: Maybe<SepMeetingDecision>;
  samples: Maybe<Array<Sample>>;
  genericTemplates: Maybe<Array<GenericTemplate>>;
  visits: Maybe<Array<Visit>>;
  proposalBookingCore: Maybe<ProposalBookingCore>;
};


export type ProposalProposalBookingCoreArgs = {
  filter?: Maybe<ProposalBookingFilter>;
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
  status?: Maybe<Array<ProposalBookingStatusCore>>;
};

export type ProposalBookingScheduledEventFilterCore = {
  bookingType?: Maybe<ScheduledEventBookingType>;
  endsAfter?: Maybe<Scalars['TzLessDateTime']>;
  endsBefore?: Maybe<Scalars['TzLessDateTime']>;
  status?: Maybe<Array<ProposalBookingStatusCore>>;
};

export enum ProposalBookingStatusCore {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum ProposalEndStatus {
  UNSET = 'UNSET',
  ACCEPTED = 'ACCEPTED',
  RESERVED = 'RESERVED',
  REJECTED = 'REJECTED'
}

export type ProposalEsiBasisConfig = {
  tooltip: Scalars['String'];
};

export type ProposalEvent = {
  name: Event;
  description: Maybe<Scalars['String']>;
};

export type ProposalPkWithCallId = {
  primaryKey: Scalars['Int'];
  callId: Scalars['Int'];
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
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  UNKNOWN = 'unknown',
  RESERVED = 'reserved'
}

export type ProposalResponseWrap = {
  rejection: Maybe<Rejection>;
  proposal: Maybe<Proposal>;
};

export type ProposalStatus = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
  isDefault: Scalars['Boolean'];
};

export type ProposalStatusChangingEventResponseWrap = {
  rejection: Maybe<Rejection>;
  statusChangingEvents: Maybe<Array<StatusChangingEvent>>;
};

export type ProposalStatusResponseWrap = {
  rejection: Maybe<Rejection>;
  proposalStatus: Maybe<ProposalStatus>;
};

export type ProposalTemplate = {
  templateId: Scalars['Int'];
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  steps: Array<TemplateStep>;
  complementaryQuestions: Array<Question>;
  questionaryCount: Scalars['Int'];
  group: TemplateGroup;
  json: Scalars['String'];
  callCount: Scalars['Int'];
};

export type ProposalTemplatesFilter = {
  isArchived?: Maybe<Scalars['Boolean']>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
};

export type ProposalView = {
  primaryKey: Scalars['Int'];
  title: Scalars['String'];
  statusId: Scalars['Int'];
  statusName: Scalars['String'];
  statusDescription: Scalars['String'];
  proposalId: Scalars['String'];
  rankOrder: Maybe<Scalars['Int']>;
  finalStatus: Maybe<ProposalEndStatus>;
  notified: Scalars['Boolean'];
  submitted: Scalars['Boolean'];
  technicalTimeAllocation: Maybe<Scalars['Int']>;
  managementTimeAllocation: Maybe<Scalars['Int']>;
  technicalReviewAssignee: Maybe<Scalars['Int']>;
  technicalStatus: Maybe<TechnicalReviewStatus>;
  technicalReviewSubmitted: Maybe<Scalars['Int']>;
  instrumentName: Maybe<Scalars['String']>;
  callShortCode: Maybe<Scalars['String']>;
  sepCode: Maybe<Scalars['String']>;
  sepId: Maybe<Scalars['Int']>;
  reviewAverage: Maybe<Scalars['Float']>;
  reviewDeviation: Maybe<Scalars['Float']>;
  instrumentId: Maybe<Scalars['Int']>;
  callId: Scalars['Int'];
  allocationTimeUnit: AllocationTimeUnits;
};

export type ProposalWorkflow = {
  id: Scalars['Int'];
  name: Scalars['String'];
  description: Scalars['String'];
  proposalWorkflowConnectionGroups: Array<ProposalWorkflowConnectionGroup>;
};

export type ProposalWorkflowConnection = {
  id: Scalars['Int'];
  sortOrder: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  proposalStatusId: Scalars['Int'];
  proposalStatus: ProposalStatus;
  nextProposalStatusId: Maybe<Scalars['Int']>;
  prevProposalStatusId: Maybe<Scalars['Int']>;
  droppableGroupId: Scalars['String'];
  statusChangingEvents: Maybe<Array<StatusChangingEvent>>;
};

export type ProposalWorkflowConnectionGroup = {
  groupId: Scalars['String'];
  parentGroupId: Maybe<Scalars['String']>;
  connections: Array<ProposalWorkflowConnection>;
};

export type ProposalWorkflowConnectionResponseWrap = {
  rejection: Maybe<Rejection>;
  proposalWorkflowConnection: Maybe<ProposalWorkflowConnection>;
};

export type ProposalWorkflowResponseWrap = {
  rejection: Maybe<Rejection>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
};

export type ProposalsFilter = {
  text?: Maybe<Scalars['String']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
  proposalStatusId?: Maybe<Scalars['Int']>;
  shortCodes?: Maybe<Array<Scalars['String']>>;
  questionFilter?: Maybe<QuestionFilterInput>;
};

export type ProposalsQueryResult = {
  totalCount: Scalars['Int'];
  proposals: Array<Proposal>;
};

export type ProposalsResponseWrap = {
  rejection: Maybe<Rejection>;
  proposals: Array<Proposal>;
};

export type ProposalsViewResult = {
  totalCount: Scalars['Int'];
  proposals: Array<ProposalView>;
};

export type QueriesAndMutations = {
  queries: Array<Scalars['String']>;
  mutations: Array<Scalars['String']>;
};

export type Query = {
  _entities: Array<Maybe<Entity>>;
  _service: Service;
  calls: Maybe<Array<Call>>;
  callsByInstrumentScientist: Maybe<Array<Call>>;
  feedbacks: Array<Feedback>;
  genericTemplates: Maybe<Array<GenericTemplate>>;
  proposals: Maybe<ProposalsQueryResult>;
  sampleEsi: Maybe<SampleExperimentSafetyInput>;
  samples: Maybe<Array<Sample>>;
  shipments: Maybe<Array<Shipment>>;
  questions: Array<QuestionWithUsage>;
  templates: Maybe<Array<Template>>;
  visits: Array<Visit>;
  myVisits: Array<Visit>;
  activeTemplateId: Maybe<Scalars['Int']>;
  basicUserDetails: Maybe<BasicUserDetails>;
  basicUserDetailsByEmail: Maybe<BasicUserDetails>;
  blankQuestionary: Questionary;
  blankQuestionarySteps: Maybe<Array<QuestionaryStep>>;
  call: Maybe<Call>;
  checkEmailExist: Maybe<Scalars['Boolean']>;
  esi: Maybe<ExperimentSafetyInput>;
  eventLogs: Maybe<Array<EventLog>>;
  features: Array<Feature>;
  feedback: Maybe<Feedback>;
  fileMetadata: Maybe<Array<FileMetadata>>;
  genericTemplate: Maybe<GenericTemplate>;
  allAccessTokensAndPermissions: Maybe<Array<PermissionsWithAccessToken>>;
  queriesAndMutations: Maybe<QueriesAndMutations>;
  accessTokenAndPermissions: Maybe<PermissionsWithAccessToken>;
  getFields: Maybe<Fields>;
  getOrcIDInformation: Maybe<OrcIdInformation>;
  getPageContent: Maybe<Scalars['String']>;
  institutions: Maybe<Array<Institution>>;
  instrument: Maybe<Instrument>;
  instruments: Maybe<InstrumentsQueryResult>;
  instrumentsBySep: Maybe<Array<InstrumentWithAvailabilityTime>>;
  userInstruments: Maybe<InstrumentsQueryResult>;
  instrumentScientistHasInstrument: Maybe<Scalars['Boolean']>;
  instrumentScientistHasAccess: Maybe<Scalars['Boolean']>;
  isNaturalKeyPresent: Maybe<Scalars['Boolean']>;
  myShipments: Maybe<Array<Shipment>>;
  proposal: Maybe<Proposal>;
  userHasAccessToProposal: Maybe<Scalars['Boolean']>;
  proposalStatus: Maybe<ProposalStatus>;
  proposalStatuses: Maybe<Array<ProposalStatus>>;
  proposalsView: Maybe<Array<ProposalView>>;
  instrumentScientistProposals: Maybe<ProposalsViewResult>;
  proposalTemplates: Maybe<Array<ProposalTemplate>>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  proposalWorkflows: Maybe<Array<ProposalWorkflow>>;
  proposalEvents: Maybe<Array<ProposalEvent>>;
  questionary: Maybe<Questionary>;
  review: Maybe<Review>;
  proposalReviews: Maybe<Array<Review>>;
  roles: Maybe<Array<Role>>;
  sample: Maybe<Sample>;
  samplesByCallId: Maybe<Array<Sample>>;
  sep: Maybe<Sep>;
  sepMembers: Maybe<Array<SepReviewer>>;
  sepReviewers: Maybe<Array<SepReviewer>>;
  sepProposals: Maybe<Array<SepProposal>>;
  sepProposal: Maybe<SepProposal>;
  sepProposalsByInstrument: Maybe<Array<SepProposal>>;
  seps: Maybe<SePsQueryResult>;
  settings: Array<Settings>;
  shipment: Maybe<Shipment>;
  version: Scalars['String'];
  factoryVersion: Scalars['String'];
  templateCategories: Maybe<Array<TemplateCategory>>;
  template: Maybe<Template>;
  checkToken: TokenResult;
  units: Maybe<Array<Unit>>;
  user: Maybe<User>;
  me: Maybe<User>;
  users: Maybe<UserQueryResult>;
  previousCollaborators: Maybe<UserQueryResult>;
  visitRegistration: Maybe<VisitRegistration>;
  visit: Maybe<Visit>;
};


export type QueryEntitiesArgs = {
  representations: Array<Scalars['_Any']>;
};


export type QueryCallsArgs = {
  filter?: Maybe<CallsFilter>;
};


export type QueryCallsByInstrumentScientistArgs = {
  scientistId: Scalars['Int'];
};


export type QueryFeedbacksArgs = {
  filter?: Maybe<FeedbacksFilter>;
};


export type QueryGenericTemplatesArgs = {
  filter?: Maybe<GenericTemplatesFilter>;
};


export type QueryProposalsArgs = {
  filter?: Maybe<ProposalsFilter>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QuerySampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type QuerySamplesArgs = {
  filter?: Maybe<SamplesFilter>;
};


export type QueryShipmentsArgs = {
  filter?: Maybe<ShipmentsFilter>;
};


export type QueryQuestionsArgs = {
  filter?: Maybe<QuestionsFilter>;
};


export type QueryTemplatesArgs = {
  filter?: Maybe<TemplatesFilter>;
};


export type QueryVisitsArgs = {
  filter?: Maybe<VisitsFilter>;
};


export type QueryActiveTemplateIdArgs = {
  templateGroupId: TemplateGroupId;
};


export type QueryBasicUserDetailsArgs = {
  id: Scalars['Int'];
};


export type QueryBasicUserDetailsByEmailArgs = {
  role?: Maybe<UserRole>;
  email: Scalars['String'];
};


export type QueryBlankQuestionaryArgs = {
  templateId: Scalars['Int'];
};


export type QueryBlankQuestionaryStepsArgs = {
  templateId: Scalars['Int'];
};


export type QueryCallArgs = {
  id: Scalars['Int'];
};


export type QueryCheckEmailExistArgs = {
  email: Scalars['String'];
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


export type QueryFileMetadataArgs = {
  fileIds: Array<Scalars['String']>;
};


export type QueryGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
};


export type QueryAccessTokenAndPermissionsArgs = {
  accessTokenId: Scalars['String'];
};


export type QueryGetOrcIdInformationArgs = {
  authorizationCode: Scalars['String'];
};


export type QueryGetPageContentArgs = {
  id: PageName;
};


export type QueryInstitutionsArgs = {
  filter?: Maybe<InstitutionsFilter>;
};


export type QueryInstrumentArgs = {
  instrumentId: Scalars['Int'];
};


export type QueryInstrumentsArgs = {
  callIds?: Maybe<Array<Scalars['Int']>>;
};


export type QueryInstrumentsBySepArgs = {
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QueryInstrumentScientistHasInstrumentArgs = {
  instrumentId: Scalars['Int'];
};


export type QueryInstrumentScientistHasAccessArgs = {
  proposalPk: Scalars['Int'];
  instrumentId: Scalars['Int'];
};


export type QueryIsNaturalKeyPresentArgs = {
  naturalKey: Scalars['String'];
};


export type QueryProposalArgs = {
  primaryKey: Scalars['Int'];
};


export type QueryUserHasAccessToProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type QueryProposalStatusArgs = {
  id: Scalars['Int'];
};


export type QueryProposalsViewArgs = {
  filter?: Maybe<ProposalsFilter>;
};


export type QueryInstrumentScientistProposalsArgs = {
  offset?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<ProposalsFilter>;
};


export type QueryProposalTemplatesArgs = {
  filter?: Maybe<ProposalTemplatesFilter>;
};


export type QueryProposalWorkflowArgs = {
  id: Scalars['Int'];
};


export type QueryQuestionaryArgs = {
  questionaryId: Scalars['Int'];
};


export type QueryReviewArgs = {
  sepId?: Maybe<Scalars['Int']>;
  reviewId: Scalars['Int'];
};


export type QueryProposalReviewsArgs = {
  proposalPk: Scalars['Int'];
};


export type QuerySampleArgs = {
  sampleId: Scalars['Int'];
};


export type QuerySamplesByCallIdArgs = {
  callId: Scalars['Int'];
};


export type QuerySepArgs = {
  id: Scalars['Int'];
};


export type QuerySepMembersArgs = {
  sepId: Scalars['Int'];
};


export type QuerySepReviewersArgs = {
  sepId: Scalars['Int'];
};


export type QuerySepProposalsArgs = {
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QuerySepProposalArgs = {
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QuerySepProposalsByInstrumentArgs = {
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QuerySepsArgs = {
  active?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int'];
};


export type QueryCheckTokenArgs = {
  token: Scalars['String'];
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


export type QueryPreviousCollaboratorsArgs = {
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userId: Scalars['Int'];
};


export type QueryVisitRegistrationArgs = {
  visitId: Scalars['Int'];
};


export type QueryVisitArgs = {
  visitId: Scalars['Int'];
};

export type Question = {
  id: Scalars['String'];
  categoryId: TemplateCategoryId;
  naturalKey: Scalars['String'];
  dataType: DataType;
  question: Scalars['String'];
  config: FieldConfig;
};

export type QuestionComparison = {
  existingQuestion: Maybe<Question>;
  newQuestion: Question;
  status: QuestionComparisonStatus;
  conflictResolutionStrategy: ConflictResolutionStrategy;
};

export enum QuestionComparisonStatus {
  NEW = 'NEW',
  DIFFERENT = 'DIFFERENT',
  SAME = 'SAME'
}

export enum QuestionFilterCompareOperator {
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  EQUALS = 'EQUALS',
  INCLUDES = 'INCLUDES',
  EXISTS = 'EXISTS'
}

export type QuestionFilterInput = {
  questionId: Scalars['String'];
  value: Scalars['String'];
  compareOperator: QuestionFilterCompareOperator;
  dataType: DataType;
};

export type QuestionResponseWrap = {
  rejection: Maybe<Rejection>;
  question: Maybe<Question>;
};

export type QuestionTemplateRelation = {
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
  config: FieldConfig;
  dependencies: Array<FieldDependency>;
  dependenciesOperator: Maybe<DependenciesLogicOperator>;
};

export type QuestionWithUsage = {
  id: Scalars['String'];
  categoryId: TemplateCategoryId;
  naturalKey: Scalars['String'];
  dataType: DataType;
  question: Scalars['String'];
  config: FieldConfig;
  answers: Array<AnswerBasic>;
  templates: Array<Template>;
};

export type Questionary = {
  questionaryId: Scalars['Int'];
  templateId: Scalars['Int'];
  created: Scalars['DateTime'];
  steps: Array<QuestionaryStep>;
  isCompleted: Scalars['Boolean'];
};

export type QuestionaryResponseWrap = {
  rejection: Maybe<Rejection>;
  questionary: Maybe<Questionary>;
};

export type QuestionaryStep = {
  topic: Topic;
  isCompleted: Scalars['Boolean'];
  fields: Array<Answer>;
};

export type QuestionaryStepResponseWrap = {
  rejection: Maybe<Rejection>;
  questionaryStep: Maybe<QuestionaryStep>;
};

export type QuestionsFilter = {
  text?: Maybe<Scalars['String']>;
  category?: Maybe<TemplateCategoryId>;
  dataType?: Maybe<Array<DataType>>;
  excludeDataType?: Maybe<Array<DataType>>;
  questionIds?: Maybe<Array<Scalars['String']>>;
};

export type Rejection = {
  reason: Scalars['String'];
  context: Maybe<Scalars['String']>;
  exception: Maybe<Scalars['String']>;
};

export type RemoveAssignedInstrumentFromCallInput = {
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
};

export type ReorderSepMeetingDecisionProposalsInput = {
  proposals: Array<ProposalPkWithRankOrder>;
};

export type Review = {
  id: Scalars['Int'];
  userID: Scalars['Int'];
  comment: Maybe<Scalars['String']>;
  grade: Maybe<Scalars['Int']>;
  status: ReviewStatus;
  sepID: Scalars['Int'];
  reviewer: Maybe<BasicUserDetails>;
  proposal: Maybe<Proposal>;
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
  id: Scalars['Int'];
  userID: Scalars['Int'];
  comment: Maybe<Scalars['String']>;
  grade: Maybe<Scalars['Int']>;
  status: ReviewStatus;
  sepID: Scalars['Int'];
  reviewer: Maybe<BasicUserDetails>;
  proposal: Maybe<Proposal>;
  nextProposalStatus: Maybe<NextProposalStatus>;
};

export type ReviewWithNextStatusResponseWrap = {
  rejection: Maybe<Rejection>;
  review: Maybe<ReviewWithNextProposalStatus>;
};

export enum ReviewerFilter {
  YOU = 'YOU',
  ALL = 'ALL'
}

export type RichTextInputConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  max: Maybe<Scalars['Int']>;
};

export type Role = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  title: Scalars['String'];
};

export type Sep = {
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Float'];
  active: Scalars['Boolean'];
  sepChair: Maybe<BasicUserDetails>;
  sepSecretary: Maybe<BasicUserDetails>;
};

export type SepAssignment = {
  proposalPk: Scalars['Int'];
  sepMemberUserId: Maybe<Scalars['Int']>;
  sepId: Scalars['Int'];
  dateAssigned: Scalars['DateTime'];
  reassigned: Scalars['Boolean'];
  dateReassigned: Maybe<Scalars['DateTime']>;
  emailSent: Scalars['Boolean'];
  proposal: Proposal;
  role: Maybe<Role>;
  user: Maybe<BasicUserDetails>;
  review: Maybe<Review>;
};

export type SepProposal = {
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
  dateAssigned: Scalars['DateTime'];
  sepTimeAllocation: Maybe<Scalars['Int']>;
  proposal: Proposal;
  assignments: Maybe<Array<SepAssignment>>;
  instrumentSubmitted: Scalars['Boolean'];
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
  userId: Scalars['Int'];
  sepId: Scalars['Int'];
  role: Maybe<Role>;
  user: BasicUserDetails;
};

export type SePsQueryResult = {
  totalCount: Scalars['Int'];
  seps: Array<Sep>;
};

export type Sample = {
  id: Scalars['Int'];
  title: Scalars['String'];
  creatorId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  isPostProposalSubmission: Scalars['Boolean'];
  safetyStatus: SampleStatus;
  safetyComment: Scalars['String'];
  created: Scalars['DateTime'];
  questionary: Questionary;
  proposal: Proposal;
};

export type SampleBasisConfig = {
  titlePlaceholder: Scalars['String'];
};

export type SampleDeclarationConfig = {
  minEntries: Maybe<Scalars['Int']>;
  maxEntries: Maybe<Scalars['Int']>;
  templateId: Maybe<Scalars['Int']>;
  templateCategory: Scalars['String'];
  addEntryButtonLabel: Scalars['String'];
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  esiTemplateId: Maybe<Scalars['Int']>;
};

export type SampleEsiBasisConfig = {
  tooltip: Scalars['String'];
};

export type SampleEsiResponseWrap = {
  rejection: Maybe<Rejection>;
  esi: Maybe<SampleExperimentSafetyInput>;
};

export type SampleExperimentSafetyInput = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  isSubmitted: Scalars['Boolean'];
  questionary: Questionary;
  sample: Sample;
};

export type SampleResponseWrap = {
  rejection: Maybe<Rejection>;
  sample: Maybe<Sample>;
};

export enum SampleStatus {
  PENDING_EVALUATION = 'PENDING_EVALUATION',
  LOW_RISK = 'LOW_RISK',
  ELEVATED_RISK = 'ELEVATED_RISK',
  HIGH_RISK = 'HIGH_RISK'
}

export type SamplesFilter = {
  title?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['Int']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  sampleIds?: Maybe<Array<Scalars['Int']>>;
  status?: Maybe<SampleStatus>;
  questionId?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
  visitId?: Maybe<Scalars['Int']>;
};

export type SaveSepMeetingDecisionInput = {
  proposalPk: Scalars['Int'];
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
  recommendation?: Maybe<ProposalEndStatus>;
  rankOrder?: Maybe<Scalars['Int']>;
  submitted?: Maybe<Scalars['Boolean']>;
};

export enum ScheduledEventBookingType {
  USER_OPERATIONS = 'USER_OPERATIONS',
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  COMMISSIONING = 'COMMISSIONING',
  EQUIPMENT = 'EQUIPMENT'
}

export type ScheduledEventCore = {
  id: Scalars['Int'];
  bookingType: ScheduledEventBookingType;
  startsAt: Scalars['TzLessDateTime'];
  endsAt: Scalars['TzLessDateTime'];
  status: ProposalBookingStatusCore;
  localContactId: Maybe<Scalars['Int']>;
  visit: Maybe<Visit>;
  feedback: Maybe<Feedback>;
  esi: Maybe<ExperimentSafetyInput>;
  localContact: Maybe<BasicUserDetails>;
  shipments: Array<Shipment>;
};

export type SelectionFromOptionsConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  variant: Scalars['String'];
  options: Array<Scalars['String']>;
  isMultipleSelect: Scalars['Boolean'];
};

export type SepMeetingDecision = {
  proposalPk: Scalars['Int'];
  recommendation: Maybe<ProposalEndStatus>;
  commentForManagement: Maybe<Scalars['String']>;
  commentForUser: Maybe<Scalars['String']>;
  rankOrder: Maybe<Scalars['Int']>;
  submitted: Scalars['Boolean'];
  submittedBy: Maybe<Scalars['Int']>;
};

export type SepMeetingDecisionResponseWrap = {
  rejection: Maybe<Rejection>;
  sepMeetingDecision: Maybe<SepMeetingDecision>;
};

export type Settings = {
  id: SettingsId;
  settingsValue: Maybe<Scalars['String']>;
  description: Maybe<Scalars['String']>;
};

export enum SettingsId {
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
  PROFILE_PAGE_LINK = 'PROFILE_PAGE_LINK',
  PALETTE_PRIMARY_DARK = 'PALETTE_PRIMARY_DARK',
  PALETTE_PRIMARY_MAIN = 'PALETTE_PRIMARY_MAIN',
  PALETTE_PRIMARY_ACCENT = 'PALETTE_PRIMARY_ACCENT',
  PALETTE_PRIMARY_LIGHT = 'PALETTE_PRIMARY_LIGHT',
  PALETTE_PRIMARY_CONTRAST = 'PALETTE_PRIMARY_CONTRAST',
  PALETTE_SECONDARY_DARK = 'PALETTE_SECONDARY_DARK',
  PALETTE_SECONDARY_MAIN = 'PALETTE_SECONDARY_MAIN',
  PALETTE_SECONDARY_LIGHT = 'PALETTE_SECONDARY_LIGHT',
  PALETTE_SECONDARY_CONTRAST = 'PALETTE_SECONDARY_CONTRAST',
  PALETTE_ERROR_MAIN = 'PALETTE_ERROR_MAIN',
  PALETTE_SUCCESS_MAIN = 'PALETTE_SUCCESS_MAIN',
  PALETTE_WARNING_MAIN = 'PALETTE_WARNING_MAIN',
  PALETTE_INFO_MAIN = 'PALETTE_INFO_MAIN',
  HEADER_LOGO_FILENAME = 'HEADER_LOGO_FILENAME'
}

export type Shipment = {
  id: Scalars['Int'];
  title: Scalars['String'];
  proposalPk: Scalars['Int'];
  status: ShipmentStatus;
  externalRef: Maybe<Scalars['String']>;
  questionaryId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  creatorId: Scalars['Int'];
  created: Scalars['DateTime'];
  questionary: Questionary;
  samples: Array<Sample>;
  proposal: Proposal;
};

export type ShipmentBasisConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
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
  title?: Maybe<Scalars['String']>;
  creatorId?: Maybe<Scalars['Int']>;
  proposalPk?: Maybe<Scalars['Int']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  status?: Maybe<ShipmentStatus>;
  externalRef?: Maybe<Scalars['String']>;
  shipmentIds?: Maybe<Array<Scalars['Int']>>;
  scheduledEventId?: Maybe<Scalars['Int']>;
};

export type StatusChangingEvent = {
  statusChangingEventId: Scalars['Int'];
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvent: Scalars['String'];
};

export type SubTemplateConfig = {
  minEntries: Maybe<Scalars['Int']>;
  maxEntries: Maybe<Scalars['Int']>;
  templateId: Maybe<Scalars['Int']>;
  templateCategory: Scalars['String'];
  addEntryButtonLabel: Scalars['String'];
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
};

export type SubmitProposalsReviewInput = {
  proposals: Array<ProposalPkWithReviewId>;
};

export type SubmitTechnicalReviewInput = {
  proposalPk: Scalars['Int'];
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  timeAllocation?: Maybe<Scalars['Int']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
};

export type SuccessResponseWrap = {
  rejection: Maybe<Rejection>;
  isSuccess: Maybe<Scalars['Boolean']>;
};

export type TechnicalReview = {
  id: Scalars['Int'];
  proposalPk: Scalars['Int'];
  comment: Maybe<Scalars['String']>;
  publicComment: Maybe<Scalars['String']>;
  timeAllocation: Maybe<Scalars['Int']>;
  status: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
  proposal: Maybe<Proposal>;
  reviewer: Maybe<BasicUserDetails>;
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

export type Template = {
  templateId: Scalars['Int'];
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  steps: Array<TemplateStep>;
  complementaryQuestions: Array<Question>;
  questionaryCount: Scalars['Int'];
  group: TemplateGroup;
  json: Scalars['String'];
};

export type TemplateCategory = {
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
};

export enum TemplateCategoryId {
  PROPOSAL_QUESTIONARY = 'PROPOSAL_QUESTIONARY',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SHIPMENT_DECLARATION = 'SHIPMENT_DECLARATION',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  FEEDBACK = 'FEEDBACK'
}

export type TemplateGroup = {
  groupId: TemplateGroupId;
  categoryId: TemplateCategoryId;
};

export enum TemplateGroupId {
  PROPOSAL = 'PROPOSAL',
  PROPOSAL_ESI = 'PROPOSAL_ESI',
  SAMPLE = 'SAMPLE',
  SAMPLE_ESI = 'SAMPLE_ESI',
  SHIPMENT = 'SHIPMENT',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION',
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  FEEDBACK = 'FEEDBACK'
}

export type TemplateImportWithValidation = {
  json: Scalars['String'];
  version: Scalars['String'];
  exportDate: Scalars['DateTime'];
  isValid: Scalars['Boolean'];
  errors: Array<Scalars['String']>;
  questionComparisons: Array<QuestionComparison>;
};

export type TemplateImportWithValidationWrap = {
  rejection: Maybe<Rejection>;
  validationResult: Maybe<TemplateImportWithValidation>;
};

export type TemplateResponseWrap = {
  rejection: Maybe<Rejection>;
  template: Maybe<Template>;
};

export type TemplateStep = {
  topic: Topic;
  fields: Array<QuestionTemplateRelation>;
};

export type TemplatesFilter = {
  isArchived?: Maybe<Scalars['Boolean']>;
  group?: Maybe<TemplateGroupId>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
};

export type TextInputConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  min: Maybe<Scalars['Int']>;
  max: Maybe<Scalars['Int']>;
  multiline: Scalars['Boolean'];
  placeholder: Scalars['String'];
  htmlQuestion: Maybe<Scalars['String']>;
  isHtmlQuestion: Scalars['Boolean'];
  isCounterHidden: Scalars['Boolean'];
};

export type TokenPayloadUnion = AuthJwtPayload | AuthJwtApiTokenPayload;

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
  title: Scalars['String'];
  templateId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  isEnabled: Scalars['Boolean'];
};


export type Unit = {
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type UnitResponseWrap = {
  rejection: Maybe<Rejection>;
  unit: Maybe<Unit>;
};

export type UpdateAnswerResponseWrap = {
  rejection: Maybe<Rejection>;
  questionId: Maybe<Scalars['String']>;
};

export type UpdateApiAccessTokenInput = {
  accessTokenId: Scalars['String'];
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
};

export type UpdateCallInput = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  endSEPReview?: Maybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalSequence?: Maybe<Scalars['Int']>;
  cycleComment: Scalars['String'];
  submissionMessage?: Maybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  proposalWorkflowId: Scalars['Int'];
  callEnded?: Maybe<Scalars['Int']>;
  callReviewEnded?: Maybe<Scalars['Int']>;
  callSEPReviewEnded?: Maybe<Scalars['Int']>;
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type UpdateProposalStatusInput = {
  id: Scalars['Int'];
  shortCode?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  description: Scalars['String'];
  isDefault?: Maybe<Scalars['Boolean']>;
};

export type UpdateProposalWorkflowInput = {
  id: Scalars['Int'];
  name: Scalars['String'];
  description: Scalars['String'];
};

export type User = {
  id: Scalars['Int'];
  user_title: Scalars['String'];
  firstname: Scalars['String'];
  middlename: Maybe<Scalars['String']>;
  lastname: Scalars['String'];
  username: Scalars['String'];
  preferredname: Maybe<Scalars['String']>;
  orcid: Scalars['String'];
  refreshToken: Scalars['String'];
  gender: Scalars['String'];
  nationality: Maybe<Scalars['Int']>;
  birthdate: Scalars['String'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  telephone: Scalars['String'];
  telephone_alt: Maybe<Scalars['String']>;
  placeholder: Scalars['Boolean'];
  created: Scalars['String'];
  updated: Scalars['String'];
  roles: Array<Role>;
  reviews: Array<Review>;
  proposals: Array<Proposal>;
  seps: Array<Sep>;
  instruments: Array<Instrument>;
};


export type UserReviewsArgs = {
  reviewer?: Maybe<ReviewerFilter>;
  status?: Maybe<ReviewStatus>;
  instrumentId?: Maybe<Scalars['Int']>;
  callId?: Maybe<Scalars['Int']>;
};


export type UserProposalsArgs = {
  filter?: Maybe<UserProposalsFilter>;
};

export type UserProposalsFilter = {
  instrumentId?: Maybe<Scalars['Int']>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
  finalStatus?: Maybe<ProposalEndStatus>;
};

export type UserQueryResult = {
  users: Array<BasicUserDetails>;
  totalCount: Scalars['Int'];
};

export type UserResponseWrap = {
  rejection: Maybe<Rejection>;
  user: Maybe<User>;
};

export enum UserRole {
  USER = 'USER',
  USER_OFFICER = 'USER_OFFICER',
  SEP_CHAIR = 'SEP_CHAIR',
  SEP_SECRETARY = 'SEP_SECRETARY',
  SEP_REVIEWER = 'SEP_REVIEWER',
  INSTRUMENT_SCIENTIST = 'INSTRUMENT_SCIENTIST',
  SAMPLE_SAFETY_REVIEWER = 'SAMPLE_SAFETY_REVIEWER'
}

export type Visit = {
  id: Scalars['Int'];
  proposalPk: Scalars['Int'];
  status: VisitStatus;
  creatorId: Scalars['Int'];
  teamLeadUserId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  proposal: Proposal;
  registrations: Array<VisitRegistration>;
  teamLead: BasicUserDetails;
  samples: Array<Sample>;
};

export type VisitBasisConfig = {
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};

export type VisitRegistration = {
  userId: Scalars['Int'];
  visitId: Scalars['Int'];
  registrationQuestionaryId: Maybe<Scalars['Int']>;
  isRegistrationSubmitted: Scalars['Boolean'];
  trainingExpiryDate: Maybe<Scalars['DateTime']>;
  user: BasicUserDetails;
  questionary: Questionary;
};

export type VisitRegistrationResponseWrap = {
  rejection: Maybe<Rejection>;
  registration: Maybe<VisitRegistration>;
};

export type VisitResponseWrap = {
  rejection: Maybe<Rejection>;
  visit: Maybe<Visit>;
};

export enum VisitStatus {
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
  SUBMITTED = 'SUBMITTED'
}

export type VisitsFilter = {
  creatorId?: Maybe<Scalars['Int']>;
  proposalPk?: Maybe<Scalars['Int']>;
  scheduledEventId?: Maybe<Scalars['Int']>;
};


export type Entity = Call | BasicUserDetails | Proposal | Instrument | User;

export type Service = {
  /** The sdl representing the federated service capabilities. Includes federation directives, removes federation types, and includes rest of full schema after schema directives have been applied */
  sdl: Maybe<Scalars['String']>;
};

export type AssignProposalsToSepMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  sepId: Scalars['Int'];
}>;


export type AssignProposalsToSepMutation = { assignProposalsToSep: { rejection: Maybe<RejectionFragment>, nextProposalStatus: Maybe<Pick<NextProposalStatus, 'id' | 'shortCode' | 'name'>> } };

export type AssignReviewersToSepMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type AssignReviewersToSepMutation = { assignReviewersToSEP: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type AssignChairOrSecretaryMutationVariables = Exact<{
  assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSepInput;
}>;


export type AssignChairOrSecretaryMutation = { assignChairOrSecretary: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type AssignSepReviewersToProposalMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type AssignSepReviewersToProposalMutation = { assignSepReviewersToProposal: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type CreateSepMutationVariables = Exact<{
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type CreateSepMutation = { createSEP: { sep: Maybe<(
      Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<BasicUserDetailsFragment>, sepSecretary: Maybe<BasicUserDetailsFragment> }
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteSepMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteSepMutation = { deleteSEP: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type SepMeetingDecisionFragment = Pick<SepMeetingDecision, 'proposalPk' | 'recommendation' | 'commentForUser' | 'commentForManagement' | 'rankOrder' | 'submitted' | 'submittedBy'>;

export type GetInstrumentsBySepQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetInstrumentsBySepQuery = { instrumentsBySep: Maybe<Array<(
    Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime' | 'submitted'>
    & { scientists: Array<BasicUserDetailsFragment> }
  )>> };

export type GetUserSepsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserSepsQuery = { me: Maybe<{ seps: Array<(
      Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<BasicUserDetailsFragment>, sepSecretary: Maybe<BasicUserDetailsFragment> }
    )> }> };

export type GetSepQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSepQuery = { sep: Maybe<(
    Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
    & { sepChair: Maybe<BasicUserDetailsFragment>, sepSecretary: Maybe<BasicUserDetailsFragment> }
  )> };

export type GetSepMembersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepMembersQuery = { sepMembers: Maybe<Array<(
    Pick<SepReviewer, 'userId' | 'sepId'>
    & { role: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>, user: BasicUserDetailsFragment }
  )>> };

export type GetSepProposalQueryVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type GetSepProposalQuery = { sepProposal: Maybe<(
    Pick<SepProposal, 'proposalPk' | 'sepId' | 'sepTimeAllocation' | 'instrumentSubmitted'>
    & { proposal: (
      { proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment>, questionary: QuestionaryFragment, technicalReview: Maybe<(
        { reviewer: Maybe<BasicUserDetailsFragment> }
        & CoreTechnicalReviewFragment
      )>, reviews: Maybe<Array<(
        Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>> }
      )>>, instrument: Maybe<Pick<Instrument, 'id' | 'name' | 'shortCode'>>, call: Maybe<Pick<Call, 'id' | 'shortCode' | 'allocationTimeUnit'>> }
      & ProposalFragment
    ) }
  )> };

export type GetSepProposalsQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetSepProposalsQuery = { sepProposals: Maybe<Array<(
    Pick<SepProposal, 'proposalPk' | 'dateAssigned' | 'sepId' | 'sepTimeAllocation'>
    & { proposal: (
      Pick<Proposal, 'title' | 'primaryKey' | 'proposalId'>
      & { status: Maybe<ProposalStatusFragment> }
    ), assignments: Maybe<Array<(
      Pick<SepAssignment, 'sepMemberUserId' | 'dateAssigned'>
      & { user: Maybe<BasicUserDetailsFragment>, role: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>, review: Maybe<Pick<Review, 'id' | 'status' | 'comment' | 'grade' | 'sepID'>> }
    )>> }
  )>> };

export type SepProposalsByInstrumentQueryVariables = Exact<{
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type SepProposalsByInstrumentQuery = { sepProposalsByInstrument: Maybe<Array<(
    Pick<SepProposal, 'sepTimeAllocation'>
    & { proposal: (
      Pick<Proposal, 'primaryKey' | 'title' | 'proposalId'>
      & { status: Maybe<ProposalStatusFragment>, sepMeetingDecision: Maybe<SepMeetingDecisionFragment>, reviews: Maybe<Array<Pick<Review, 'id' | 'comment' | 'grade' | 'status'>>>, technicalReview: Maybe<Pick<TechnicalReview, 'publicComment' | 'status' | 'timeAllocation'>> }
    ), assignments: Maybe<Array<Pick<SepAssignment, 'sepMemberUserId'>>> }
  )>> };

export type GetSepReviewersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepReviewersQuery = { sepReviewers: Maybe<Array<(
    Pick<SepReviewer, 'userId' | 'sepId'>
    & { role: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>, user: BasicUserDetailsFragment }
  )>> };

export type GetSePsQueryVariables = Exact<{
  filter: Scalars['String'];
  active?: Maybe<Scalars['Boolean']>;
}>;


export type GetSePsQuery = { seps: Maybe<(
    Pick<SePsQueryResult, 'totalCount'>
    & { seps: Array<(
      Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<BasicUserDetailsFragment>, sepSecretary: Maybe<BasicUserDetailsFragment> }
    )> }
  )> };

export type RemoveProposalsFromSepMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveProposalsFromSepMutation = { removeProposalsFromSep: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type RemoveMemberFromSepMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  roleId: UserRole;
}>;


export type RemoveMemberFromSepMutation = { removeMemberFromSep: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type RemoveMemberFromSepProposalMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type RemoveMemberFromSepProposalMutation = { removeMemberFromSEPProposal: { rejection: Maybe<RejectionFragment>, sep: Maybe<Pick<Sep, 'id'>> } };

export type ReorderSepMeetingDecisionProposalsMutationVariables = Exact<{
  reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput;
}>;


export type ReorderSepMeetingDecisionProposalsMutation = { reorderSepMeetingDecisionProposals: { rejection: Maybe<RejectionFragment>, sepMeetingDecision: Maybe<Pick<SepMeetingDecision, 'proposalPk'>> } };

export type SaveSepMeetingDecisionMutationVariables = Exact<{
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
}>;


export type SaveSepMeetingDecisionMutation = { saveSepMeetingDecision: { rejection: Maybe<RejectionFragment>, sepMeetingDecision: Maybe<Pick<SepMeetingDecision, 'proposalPk'>> } };

export type UpdateSepMutationVariables = Exact<{
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type UpdateSepMutation = { updateSEP: { sep: Maybe<Pick<Sep, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type UpdateSepTimeAllocationMutationVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepTimeAllocation?: Maybe<Scalars['Int']>;
}>;


export type UpdateSepTimeAllocationMutation = { updateSEPTimeAllocation: { rejection: Maybe<RejectionFragment> } };

export type AddClientLogMutationVariables = Exact<{
  error: Scalars['String'];
}>;


export type AddClientLogMutation = { addClientLog: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type CreateApiAccessTokenMutationVariables = Exact<{
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type CreateApiAccessTokenMutation = { createApiAccessToken: { rejection: Maybe<RejectionFragment>, apiAccessToken: Maybe<Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>> } };

export type CreateInstitutionMutationVariables = Exact<{
  name: Scalars['String'];
  verified: Scalars['Boolean'];
}>;


export type CreateInstitutionMutation = { createInstitution: { institution: Maybe<Pick<Institution, 'id' | 'name' | 'verified'>>, rejection: Maybe<RejectionFragment> } };

export type CreateUnitMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateUnitMutation = { createUnit: { unit: Maybe<Pick<Unit, 'id' | 'name'>>, rejection: Maybe<RejectionFragment> } };

export type DeleteApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
}>;


export type DeleteApiAccessTokenMutation = { deleteApiAccessToken: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type DeleteInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstitutionMutation = { deleteInstitution: { institution: Maybe<Pick<Institution, 'id' | 'verified'>>, rejection: Maybe<RejectionFragment> } };

export type DeleteUnitMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUnitMutation = { deleteUnit: { unit: Maybe<Pick<Unit, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type GetAllApiAccessTokensAndPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllApiAccessTokensAndPermissionsQuery = { allAccessTokensAndPermissions: Maybe<Array<Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>>> };

export type GetAllQueriesAndMutationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllQueriesAndMutationsQuery = { queriesAndMutations: Maybe<Pick<QueriesAndMutations, 'queries' | 'mutations'>> };

export type GetFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturesQuery = { features: Array<Pick<Feature, 'id' | 'isEnabled' | 'description'>> };

export type GetInstitutionsQueryVariables = Exact<{
  filter?: Maybe<InstitutionsFilter>;
}>;


export type GetInstitutionsQuery = { institutions: Maybe<Array<Pick<Institution, 'id' | 'name' | 'verified'>>> };

export type GetPageContentQueryVariables = Exact<{
  id: PageName;
}>;


export type GetPageContentQuery = Pick<Query, 'getPageContent'>;

export type GetSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSettingsQuery = { settings: Array<Pick<Settings, 'id' | 'settingsValue' | 'description'>> };

export type GetUnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnitsQuery = { units: Maybe<Array<Pick<Unit, 'id' | 'name'>>> };

export type MergeInstitutionsMutationVariables = Exact<{
  institutionIdFrom: Scalars['Int'];
  institutionIdInto: Scalars['Int'];
  newTitle: Scalars['String'];
}>;


export type MergeInstitutionsMutation = { mergeInstitutions: { institution: Maybe<Pick<Institution, 'id' | 'verified' | 'name'>>, rejection: Maybe<RejectionFragment> } };

export type PrepareDbMutationVariables = Exact<{
  includeSeeds: Scalars['Boolean'];
}>;


export type PrepareDbMutation = { prepareDB: (
    Pick<PrepareDbResponseWrap, 'log'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type RejectionFragment = Pick<Rejection, 'reason' | 'context' | 'exception'>;

export type SetPageContentMutationVariables = Exact<{
  id: PageName;
  text: Scalars['String'];
}>;


export type SetPageContentMutation = { setPageContent: { page: Maybe<Pick<Page, 'id' | 'content'>>, rejection: Maybe<RejectionFragment> } };

export type UpdateApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type UpdateApiAccessTokenMutation = { updateApiAccessToken: { rejection: Maybe<RejectionFragment>, apiAccessToken: Maybe<Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>> } };

export type UpdateInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
}>;


export type UpdateInstitutionMutation = { updateInstitution: { institution: Maybe<Pick<Institution, 'id' | 'verified' | 'name'>>, rejection: Maybe<RejectionFragment> } };

export type AssignInstrumentsToCallMutationVariables = Exact<{
  instrumentIds: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type AssignInstrumentsToCallMutation = { assignInstrumentsToCall: { rejection: Maybe<RejectionFragment>, call: Maybe<Pick<Call, 'id'>> } };

export type CreateCallMutationVariables = Exact<{
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  endSEPReview?: Maybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  submissionMessage?: Maybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
}>;


export type CreateCallMutation = { createCall: { rejection: Maybe<RejectionFragment>, call: Maybe<CallFragment> } };

export type DeleteCallMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteCallMutation = { deleteCall: { rejection: Maybe<(
      RejectionFragment
      & RejectionFragment
    )>, call: Maybe<Pick<Call, 'id'>> } };

export type CallFragment = (
  Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'startReview' | 'endReview' | 'startSEPReview' | 'endSEPReview' | 'startNotify' | 'endNotify' | 'startCycle' | 'endCycle' | 'cycleComment' | 'surveyComment' | 'referenceNumberFormat' | 'proposalWorkflowId' | 'templateId' | 'esiTemplateId' | 'allocationTimeUnit' | 'proposalCount' | 'title' | 'description' | 'submissionMessage'>
  & { instruments: Array<(
    Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime' | 'submitted'>
    & { scientists: Array<BasicUserDetailsFragment> }
  )>, proposalWorkflow: Maybe<Pick<ProposalWorkflow, 'id' | 'name' | 'description'>>, template: Pick<Template, 'templateId' | 'name' | 'isArchived'> }
);

export type GetCallQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetCallQuery = { call: Maybe<CallFragment> };

export type GetCallsQueryVariables = Exact<{
  filter?: Maybe<CallsFilter>;
}>;


export type GetCallsQuery = { calls: Maybe<Array<CallFragment>> };

export type GetCallsByInstrumentScientistQueryVariables = Exact<{
  scientistId: Scalars['Int'];
}>;


export type GetCallsByInstrumentScientistQuery = { callsByInstrumentScientist: Maybe<Array<CallFragment>> };

export type RemoveAssignedInstrumentFromCallMutationVariables = Exact<{
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type RemoveAssignedInstrumentFromCallMutation = { removeAssignedInstrumentFromCall: { rejection: Maybe<RejectionFragment>, call: Maybe<Pick<Call, 'id'>> } };

export type UpdateCallMutationVariables = Exact<{
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  endSEPReview?: Maybe<Scalars['DateTime']>;
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  submissionMessage?: Maybe<Scalars['String']>;
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
}>;


export type UpdateCallMutation = { updateCall: { rejection: Maybe<RejectionFragment>, call: Maybe<CallFragment> } };

export type CreateEsiMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type CreateEsiMutation = { createEsi: { esi: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sampleEsis: Array<(
        { sample: SampleFragment, questionary: Pick<Questionary, 'isCompleted'> }
        & SampleEsiFragment
      )>, proposal: (
        Pick<Proposal, 'primaryKey' | 'proposalId' | 'title'>
        & { samples: Maybe<Array<SampleFragment>>, questionary: QuestionaryFragment }
      ) }
      & EsiFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type EsiFragment = Pick<ExperimentSafetyInput, 'id' | 'creatorId' | 'questionaryId' | 'isSubmitted' | 'created'>;

export type GetEsiQueryVariables = Exact<{
  esiId: Scalars['Int'];
}>;


export type GetEsiQuery = { esi: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), sampleEsis: Array<(
      { sample: SampleFragment, questionary: Pick<Questionary, 'isCompleted'> }
      & SampleEsiFragment
    )>, proposal: (
      Pick<Proposal, 'primaryKey' | 'proposalId' | 'title'>
      & { samples: Maybe<Array<SampleFragment>>, questionary: QuestionaryFragment }
    ) }
    & EsiFragment
  )> };

export type UpdateEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateEsiMutation = { updateEsi: { esi: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sampleEsis: Array<(
        { sample: SampleFragment, questionary: Pick<Questionary, 'isCompleted'> }
        & SampleEsiFragment
      )> }
      & EsiFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type GetEventLogsQueryVariables = Exact<{
  eventType: Scalars['String'];
  changedObjectId: Scalars['String'];
}>;


export type GetEventLogsQuery = { eventLogs: Maybe<Array<(
    Pick<EventLog, 'id' | 'eventType' | 'eventTStamp' | 'rowData' | 'changedObjectId'>
    & { changedBy: Pick<User, 'id' | 'firstname' | 'lastname' | 'email'> }
  )>> };

export type CreateFeedbackMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type CreateFeedbackMutation = { createFeedback: { feedback: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & FeedbackFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type FeedbackFragment = Pick<Feedback, 'id' | 'scheduledEventId' | 'status' | 'questionaryId' | 'creatorId'>;

export type GetFeedbackQueryVariables = Exact<{
  feedbackId: Scalars['Int'];
}>;


export type GetFeedbackQuery = { feedback: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & FeedbackFragment
  )> };

export type UpdateFeedbackMutationVariables = Exact<{
  feedbackId: Scalars['Int'];
  status?: Maybe<FeedbackStatus>;
}>;


export type UpdateFeedbackMutation = { updateFeedback: { feedback: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & FeedbackFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CloneGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
}>;


export type CloneGenericTemplateMutation = { cloneGenericTemplate: { genericTemplate: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & GenericTemplateFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateGenericTemplateMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
}>;


export type CreateGenericTemplateMutation = { createGenericTemplate: { genericTemplate: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & GenericTemplateFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type DeleteGenericTemplateMutation = { deleteGenericTemplate: { genericTemplate: Maybe<GenericTemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type GenericTemplateFragment = Pick<GenericTemplate, 'id' | 'title' | 'creatorId' | 'questionaryId' | 'created' | 'proposalPk' | 'questionId'>;

export type GetGenericTemplateQueryVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type GetGenericTemplateQuery = { genericTemplate: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & GenericTemplateFragment
  )> };

export type GetGenericTemplatesWithProposalDataQueryVariables = Exact<{
  filter?: Maybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithProposalDataQuery = { genericTemplates: Maybe<Array<(
    { proposal: Pick<Proposal, 'primaryKey' | 'proposalId'> }
    & GenericTemplateFragment
  )>> };

export type GetGenericTemplatesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: Maybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithQuestionaryStatusQuery = { genericTemplates: Maybe<Array<(
    { questionary: Pick<Questionary, 'isCompleted'> }
    & GenericTemplateFragment
  )>> };

export type UpdateGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
}>;


export type UpdateGenericTemplateMutation = { updateGenericTemplate: { genericTemplate: Maybe<GenericTemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type AssignProposalsToInstrumentMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  instrumentId: Scalars['Int'];
}>;


export type AssignProposalsToInstrumentMutation = { assignProposalsToInstrument: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type AssignScientistsToInstrumentMutationVariables = Exact<{
  scientistIds: Array<Scalars['Int']> | Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type AssignScientistsToInstrumentMutation = { assignScientistsToInstrument: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type CreateInstrumentMutationVariables = Exact<{
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type CreateInstrumentMutation = { createInstrument: { instrument: Maybe<InstrumentFragment>, rejection: Maybe<RejectionFragment> } };

export type DeleteInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstrumentMutation = { deleteInstrument: { rejection: Maybe<RejectionFragment> } };

export type GetInstrumentsQueryVariables = Exact<{
  callIds?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetInstrumentsQuery = { instruments: Maybe<(
    Pick<InstrumentsQueryResult, 'totalCount'>
    & { instruments: Array<InstrumentFragment> }
  )> };

export type GetUserInstrumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserInstrumentsQuery = { me: Maybe<{ instruments: Array<InstrumentFragment> }> };

export type InstrumentFragment = (
  Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description' | 'managerUserId'>
  & { scientists: Array<BasicUserDetailsFragment> }
);

export type RemoveProposalsFromInstrumentMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type RemoveProposalsFromInstrumentMutation = { removeProposalsFromInstrument: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type RemoveScientistFromInstrumentMutationVariables = Exact<{
  scientistId: Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type RemoveScientistFromInstrumentMutation = { removeScientistFromInstrument: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SetInstrumentAvailabilityTimeMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  availabilityTime: Scalars['Int'];
}>;


export type SetInstrumentAvailabilityTimeMutation = { setInstrumentAvailabilityTime: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SubmitInstrumentMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type SubmitInstrumentMutation = { submitInstrument: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type UpdateInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type UpdateInstrumentMutation = { updateInstrument: { instrument: Maybe<InstrumentFragment>, rejection: Maybe<RejectionFragment> } };

export type AdministrationProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  finalStatus?: Maybe<ProposalEndStatus>;
  statusId?: Maybe<Scalars['Int']>;
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
  managementTimeAllocation?: Maybe<Scalars['Int']>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type AdministrationProposalMutation = { administrationProposal: { proposal: Maybe<Pick<Proposal, 'primaryKey'>>, rejection: Maybe<RejectionFragment> } };

export type ChangeProposalsStatusMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  statusId: Scalars['Int'];
}>;


export type ChangeProposalsStatusMutation = { changeProposalsStatus: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type CloneProposalsMutationVariables = Exact<{
  proposalsToClonePk: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type CloneProposalsMutation = { cloneProposals: { proposals: Array<(
      { proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment>, questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), technicalReview: Maybe<CoreTechnicalReviewFragment>, reviews: Maybe<Array<(
        Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>> }
      )>>, instrument: Maybe<Pick<Instrument, 'id' | 'name' | 'shortCode'>>, call: Maybe<Pick<Call, 'id' | 'shortCode' | 'isActive' | 'referenceNumberFormat'>> }
      & ProposalFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateProposalMutationVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type CreateProposalMutation = { createProposal: { proposal: Maybe<(
      Pick<Proposal, 'primaryKey' | 'proposalId' | 'questionaryId'>
      & { status: Maybe<ProposalStatusFragment>, questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment>, samples: Maybe<Array<(
        { questionary: Pick<Questionary, 'isCompleted'> }
        & SampleFragment
      )>>, genericTemplates: Maybe<Array<(
        { questionary: Pick<Questionary, 'isCompleted'> }
        & GenericTemplateFragment
      )>> }
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type DeleteProposalMutation = { deleteProposal: { rejection: Maybe<RejectionFragment>, proposal: Maybe<Pick<Proposal, 'primaryKey'>> } };

export type CoreTechnicalReviewFragment = Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalPk' | 'submitted'>;

export type ProposalFragment = (
  Pick<Proposal, 'primaryKey' | 'title' | 'abstract' | 'statusId' | 'publicStatus' | 'proposalId' | 'finalStatus' | 'commentForUser' | 'commentForManagement' | 'created' | 'updated' | 'callId' | 'questionaryId' | 'notified' | 'submitted' | 'managementTimeAllocation' | 'managementDecisionSubmitted' | 'technicalReviewAssignee'>
  & { status: Maybe<ProposalStatusFragment>, sepMeetingDecision: Maybe<SepMeetingDecisionFragment> }
);

export type GetInstrumentScientistProposalsQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
  offset?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
}>;


export type GetInstrumentScientistProposalsQuery = { instrumentScientistProposals: Maybe<(
    Pick<ProposalsViewResult, 'totalCount'>
    & { proposals: Array<Pick<ProposalView, 'primaryKey' | 'proposalId' | 'title' | 'submitted' | 'finalStatus' | 'technicalReviewAssignee' | 'technicalStatus' | 'statusName' | 'technicalReviewSubmitted' | 'instrumentId' | 'instrumentName' | 'allocationTimeUnit' | 'callShortCode' | 'sepCode'>> }
  )> };

export type GetMyProposalsQueryVariables = Exact<{
  filter?: Maybe<UserProposalsFilter>;
}>;


export type GetMyProposalsQuery = { me: Maybe<{ proposals: Array<ProposalFragment> }> };

export type GetProposalQueryVariables = Exact<{
  primaryKey: Scalars['Int'];
}>;


export type GetProposalQuery = { proposal: Maybe<(
    { proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment>, questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), technicalReview: Maybe<(
      { reviewer: Maybe<BasicUserDetailsFragment> }
      & CoreTechnicalReviewFragment
    )>, reviews: Maybe<Array<(
      Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
      & { reviewer: Maybe<Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>> }
    )>>, instrument: Maybe<Pick<Instrument, 'id' | 'name' | 'shortCode'>>, call: Maybe<Pick<Call, 'id' | 'shortCode' | 'isActive' | 'allocationTimeUnit' | 'referenceNumberFormat'>>, sep: Maybe<Pick<Sep, 'id' | 'code'>>, samples: Maybe<Array<(
      { questionary: Pick<Questionary, 'isCompleted'> }
      & SampleFragment
    )>>, genericTemplates: Maybe<Array<(
      { questionary: Pick<Questionary, 'isCompleted'> }
      & GenericTemplateFragment
    )>> }
    & ProposalFragment
  )> };

export type GetProposalsQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
}>;


export type GetProposalsQuery = { proposals: Maybe<(
    Pick<ProposalsQueryResult, 'totalCount'>
    & { proposals: Array<(
      { proposer: Maybe<BasicUserDetailsFragment>, reviews: Maybe<Array<(
        Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>> }
      )>>, users: Array<BasicUserDetailsFragment>, technicalReview: Maybe<(
        { reviewer: Maybe<BasicUserDetailsFragment> }
        & CoreTechnicalReviewFragment
      )>, instrument: Maybe<Pick<Instrument, 'id' | 'name'>>, call: Maybe<Pick<Call, 'id' | 'shortCode'>>, sep: Maybe<Pick<Sep, 'id' | 'code'>> }
      & ProposalFragment
    )> }
  )> };

export type GetProposalsCoreQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
}>;


export type GetProposalsCoreQuery = { proposalsView: Maybe<Array<Pick<ProposalView, 'primaryKey' | 'title' | 'statusId' | 'statusName' | 'statusDescription' | 'proposalId' | 'rankOrder' | 'finalStatus' | 'notified' | 'managementTimeAllocation' | 'technicalTimeAllocation' | 'technicalStatus' | 'instrumentName' | 'callShortCode' | 'sepCode' | 'sepId' | 'reviewAverage' | 'reviewDeviation' | 'instrumentId' | 'callId' | 'submitted' | 'allocationTimeUnit'>>> };

export type NotifyProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type NotifyProposalMutation = { notifyProposal: { proposal: Maybe<Pick<Proposal, 'primaryKey'>>, rejection: Maybe<RejectionFragment> } };

export type SubmitProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type SubmitProposalMutation = { submitProposal: { proposal: Maybe<ProposalFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
  proposerId?: Maybe<Scalars['Int']>;
}>;


export type UpdateProposalMutation = { updateProposal: { proposal: Maybe<(
      Pick<Proposal, 'primaryKey' | 'title' | 'abstract'>
      & { proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment> }
    )>, rejection: Maybe<RejectionFragment> } };

export type GetUserProposalBookingsWithEventsQueryVariables = Exact<{
  endsAfter?: Maybe<Scalars['TzLessDateTime']>;
  status?: Maybe<Array<ProposalBookingStatusCore> | ProposalBookingStatusCore>;
  instrumentId?: Maybe<Scalars['Int']>;
}>;


export type GetUserProposalBookingsWithEventsQuery = { me: Maybe<{ proposals: Array<(
      Pick<Proposal, 'primaryKey' | 'title' | 'proposalId' | 'finalStatus' | 'managementDecisionSubmitted'>
      & { proposer: Maybe<BasicUserDetailsFragment>, users: Array<BasicUserDetailsFragment>, proposalBookingCore: Maybe<{ scheduledEvents: Array<(
          Pick<ScheduledEventCore, 'id' | 'startsAt' | 'endsAt' | 'bookingType' | 'status'>
          & { visit: Maybe<(
            { teamLead: BasicUserDetailsFragment, registrations: Array<(
              { user: BasicUserDetailsFragment }
              & VisitRegistrationFragment
            )> }
            & VisitFragment
          )>, esi: Maybe<EsiFragment>, feedback: Maybe<FeedbackFragment>, shipments: Array<ShipmentFragment>, localContact: Maybe<BasicUserDetailsFragment> }
        )> }>, visits: Maybe<Array<VisitFragment>>, instrument: Maybe<Pick<Instrument, 'id' | 'name'>> }
    )> }> };

export type AnswerTopicMutationVariables = Exact<{
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
  answers: Array<AnswerInput> | AnswerInput;
  isPartialSave?: Maybe<Scalars['Boolean']>;
}>;


export type AnswerTopicMutation = { answerTopic: { questionaryStep: Maybe<QuestionaryStepFragment>, rejection: Maybe<RejectionFragment> } };

export type CreateQuestionaryMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CreateQuestionaryMutation = { createQuestionary: { questionary: Maybe<(
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type AnswerFragment = (
  Pick<Answer, 'answerId' | 'sortOrder' | 'topicId' | 'dependenciesOperator' | 'value'>
  & { question: QuestionFragment, config: FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigVisitBasisConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigFeedbackBasisConfigFragment, dependencies: Array<(
    Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: FieldConditionFragment }
  )> }
);

export type QuestionaryFragment = (
  Pick<Questionary, 'questionaryId' | 'templateId' | 'created'>
  & { steps: Array<QuestionaryStepFragment> }
);

export type QuestionaryStepFragment = (
  Pick<QuestionaryStep, 'isCompleted'>
  & { topic: TopicFragment, fields: Array<AnswerFragment> }
);

export type GetBlankQuestionaryQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryQuery = { blankQuestionary: (
    Pick<Questionary, 'isCompleted'>
    & QuestionaryFragment
  ) };

export type GetBlankQuestionaryStepsQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryStepsQuery = { blankQuestionarySteps: Maybe<Array<QuestionaryStepFragment>> };

export type GetFileMetadataQueryVariables = Exact<{
  fileIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type GetFileMetadataQuery = { fileMetadata: Maybe<Array<Pick<FileMetadata, 'fileId' | 'originalFileName' | 'mimeType' | 'sizeInBytes' | 'createdDate'>>> };

export type GetQuestionaryQueryVariables = Exact<{
  questionaryId: Scalars['Int'];
}>;


export type GetQuestionaryQuery = { questionary: Maybe<QuestionaryFragment> };

export type AddTechnicalReviewMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  timeAllocation?: Maybe<Scalars['Int']>;
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
}>;


export type AddTechnicalReviewMutation = { addTechnicalReview: { rejection: Maybe<RejectionFragment>, technicalReview: Maybe<Pick<TechnicalReview, 'id'>> } };

export type AddUserForReviewMutationVariables = Exact<{
  userID: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepID: Scalars['Int'];
}>;


export type AddUserForReviewMutation = { addUserForReview: { rejection: Maybe<RejectionFragment>, review: Maybe<Pick<Review, 'id'>> } };

export type UpdateTechnicalReviewAssigneeMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  userId: Scalars['Int'];
}>;


export type UpdateTechnicalReviewAssigneeMutation = { updateTechnicalReviewAssignee: { proposals: Array<ProposalFragment>, rejection: Maybe<RejectionFragment> } };

export type CoreReviewFragment = Pick<Review, 'id' | 'userID' | 'status' | 'comment' | 'grade' | 'sepID'>;

export type GetProposalReviewsQueryVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type GetProposalReviewsQuery = { proposalReviews: Maybe<Array<Pick<Review, 'id' | 'userID' | 'comment' | 'grade' | 'status' | 'sepID'>>> };

export type GetReviewQueryVariables = Exact<{
  reviewId: Scalars['Int'];
  sepId?: Maybe<Scalars['Int']>;
}>;


export type GetReviewQuery = { review: Maybe<(
    { proposal: Maybe<(
      Pick<Proposal, 'primaryKey' | 'title' | 'abstract'>
      & { proposer: Maybe<Pick<BasicUserDetails, 'id'>> }
    )>, reviewer: Maybe<BasicUserDetailsFragment> }
    & CoreReviewFragment
  )> };

export type RemoveUserForReviewMutationVariables = Exact<{
  reviewId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveUserForReviewMutation = { removeUserForReview: { rejection: Maybe<RejectionFragment> } };

export type SubmitProposalsReviewMutationVariables = Exact<{
  proposals: Array<ProposalPkWithReviewId> | ProposalPkWithReviewId;
}>;


export type SubmitProposalsReviewMutation = { submitProposalsReview: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SubmitTechnicalReviewMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  timeAllocation?: Maybe<Scalars['Int']>;
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
}>;


export type SubmitTechnicalReviewMutation = { submitTechnicalReview: { rejection: Maybe<RejectionFragment>, technicalReview: Maybe<Pick<TechnicalReview, 'id'>> } };

export type AddReviewMutationVariables = Exact<{
  reviewID: Scalars['Int'];
  grade: Scalars['Int'];
  comment: Scalars['String'];
  status: ReviewStatus;
  sepID: Scalars['Int'];
}>;


export type AddReviewMutation = { addReview: { rejection: Maybe<RejectionFragment>, review: Maybe<(
      Pick<ReviewWithNextProposalStatus, 'id' | 'userID' | 'status' | 'comment' | 'grade' | 'sepID'>
      & { nextProposalStatus: Maybe<Pick<NextProposalStatus, 'id' | 'shortCode' | 'name'>> }
    )> } };

export type UserWithReviewsQueryVariables = Exact<{
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
  status?: Maybe<ReviewStatus>;
  reviewer?: Maybe<ReviewerFilter>;
}>;


export type UserWithReviewsQuery = { me: Maybe<(
    Pick<User, 'id' | 'firstname' | 'lastname' | 'organisation'>
    & { reviews: Array<(
      Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'sepID'>
      & { proposal: Maybe<(
        Pick<Proposal, 'primaryKey' | 'title' | 'proposalId'>
        & { call: Maybe<Pick<Call, 'shortCode'>>, instrument: Maybe<Pick<Instrument, 'shortCode'>> }
      )> }
    )> }
  )> };

export type CloneSampleEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  newSampleTitle?: Maybe<Scalars['String']>;
}>;


export type CloneSampleEsiMutation = { cloneSampleEsi: { esi: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sample: SampleFragment }
      & SampleEsiFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type CreateSampleEsiMutation = { createSampleEsi: { esi: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sample: SampleFragment }
      & SampleEsiFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type DeleteSampleEsiMutation = { deleteSampleEsi: { esi: Maybe<SampleEsiFragment>, rejection: Maybe<RejectionFragment> } };

export type SampleEsiFragment = Pick<SampleExperimentSafetyInput, 'sampleId' | 'esiId' | 'questionaryId' | 'isSubmitted'>;

export type GetSampleEsiQueryVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type GetSampleEsiQuery = { sampleEsi: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), sample: SampleFragment }
    & SampleEsiFragment
  )> };

export type UpdateSampleEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateSampleEsiMutation = { updateSampleEsi: { esi: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sample: SampleFragment }
      & SampleEsiFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CloneSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
}>;


export type CloneSampleMutation = { cloneSample: { sample: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & SampleFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateSampleMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
}>;


export type CreateSampleMutation = { createSample: { sample: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & SampleFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type DeleteSampleMutation = { deleteSample: { sample: Maybe<SampleFragment>, rejection: Maybe<RejectionFragment> } };

export type SampleFragment = Pick<Sample, 'id' | 'title' | 'creatorId' | 'questionaryId' | 'safetyStatus' | 'safetyComment' | 'isPostProposalSubmission' | 'created' | 'proposalPk' | 'questionId'>;

export type GetSampleQueryVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type GetSampleQuery = { sample: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & SampleFragment
  )> };

export type GetSamplesByCallIdQueryVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type GetSamplesByCallIdQuery = { samplesByCallId: Maybe<Array<(
    { proposal: Pick<Proposal, 'primaryKey' | 'proposalId'> }
    & SampleFragment
  )>> };

export type GetSamplesWithProposalDataQueryVariables = Exact<{
  filter?: Maybe<SamplesFilter>;
}>;


export type GetSamplesWithProposalDataQuery = { samples: Maybe<Array<(
    { proposal: Pick<Proposal, 'primaryKey' | 'proposalId'> }
    & SampleFragment
  )>> };

export type GetSamplesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: Maybe<SamplesFilter>;
}>;


export type GetSamplesWithQuestionaryStatusQuery = { samples: Maybe<Array<(
    { questionary: Pick<Questionary, 'isCompleted'> }
    & SampleFragment
  )>> };

export type UpdateSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  safetyComment?: Maybe<Scalars['String']>;
  safetyStatus?: Maybe<SampleStatus>;
}>;


export type UpdateSampleMutation = { updateSample: { sample: Maybe<SampleFragment>, rejection: Maybe<RejectionFragment> } };

export type AddProposalWorkflowStatusMutationVariables = Exact<{
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  droppableGroupId: Scalars['String'];
  parentDroppableGroupId?: Maybe<Scalars['String']>;
  proposalStatusId: Scalars['Int'];
  nextProposalStatusId?: Maybe<Scalars['Int']>;
  prevProposalStatusId?: Maybe<Scalars['Int']>;
}>;


export type AddProposalWorkflowStatusMutation = { addProposalWorkflowStatus: { proposalWorkflowConnection: Maybe<Pick<ProposalWorkflowConnection, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type AddStatusChangingEventsToConnectionMutationVariables = Exact<{
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']> | Scalars['String'];
}>;


export type AddStatusChangingEventsToConnectionMutation = { addStatusChangingEventsToConnection: { statusChangingEvents: Maybe<Array<Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>>>, rejection: Maybe<RejectionFragment> } };

export type CreateProposalStatusMutationVariables = Exact<{
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalStatusMutation = { createProposalStatus: { proposalStatus: Maybe<ProposalStatusFragment>, rejection: Maybe<RejectionFragment> } };

export type CreateProposalWorkflowMutationVariables = Exact<{
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalWorkflowMutation = { createProposalWorkflow: { proposalWorkflow: Maybe<(
      Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
      & { proposalWorkflowConnectionGroups: Array<(
        Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
        & { connections: Array<(
          Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
          & { proposalStatus: ProposalStatusFragment, statusChangingEvents: Maybe<Array<Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>>> }
        )> }
      )> }
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalStatusMutation = { deleteProposalStatus: { proposalStatus: Maybe<ProposalStatusFragment>, rejection: Maybe<RejectionFragment> } };

export type DeleteProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalWorkflowMutation = { deleteProposalWorkflow: { proposalWorkflow: Maybe<Pick<ProposalWorkflow, 'id' | 'name' | 'description'>>, rejection: Maybe<RejectionFragment> } };

export type DeleteProposalWorkflowStatusMutationVariables = Exact<{
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type DeleteProposalWorkflowStatusMutation = { deleteProposalWorkflowStatus: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type ProposalStatusFragment = Pick<ProposalStatus, 'id' | 'shortCode' | 'name' | 'description' | 'isDefault'>;

export type GetProposalEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalEventsQuery = { proposalEvents: Maybe<Array<Pick<ProposalEvent, 'name' | 'description'>>> };

export type GetProposalStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalStatusesQuery = { proposalStatuses: Maybe<Array<ProposalStatusFragment>> };

export type GetProposalWorkflowQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetProposalWorkflowQuery = { proposalWorkflow: Maybe<(
    Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
    & { proposalWorkflowConnectionGroups: Array<(
      Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
      & { connections: Array<(
        Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
        & { proposalStatus: ProposalStatusFragment, statusChangingEvents: Maybe<Array<Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>>> }
      )> }
    )> }
  )> };

export type GetProposalWorkflowsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalWorkflowsQuery = { proposalWorkflows: Maybe<Array<Pick<ProposalWorkflow, 'id' | 'name' | 'description'>>> };

export type MoveProposalWorkflowStatusMutationVariables = Exact<{
  from: IndexWithGroupId;
  to: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
}>;


export type MoveProposalWorkflowStatusMutation = { moveProposalWorkflowStatus: { rejection: Maybe<RejectionFragment> } };

export type UpdateProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalStatusMutation = { updateProposalStatus: { proposalStatus: Maybe<ProposalStatusFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalWorkflowMutation = { updateProposalWorkflow: { proposalWorkflow: Maybe<(
      Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
      & { proposalWorkflowConnectionGroups: Array<(
        Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
        & { connections: Array<(
          Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
          & { proposalStatus: Pick<ProposalStatus, 'id' | 'name' | 'description'>, statusChangingEvents: Maybe<Array<Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>>> }
        )> }
      )> }
    )>, rejection: Maybe<RejectionFragment> } };

export type AddSamplesToShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  sampleIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type AddSamplesToShipmentMutation = { addSamplesToShipment: { rejection: Maybe<RejectionFragment>, shipment: Maybe<(
      { samples: Array<SampleFragment> }
      & ShipmentFragment
    )> } };

export type CreateShipmentMutationVariables = Exact<{
  title: Scalars['String'];
  proposalPk: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
}>;


export type CreateShipmentMutation = { createShipment: { shipment: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), samples: Array<SampleFragment> }
      & ShipmentFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type DeleteShipmentMutation = { deleteShipment: { rejection: Maybe<RejectionFragment> } };

export type ShipmentFragment = (
  Pick<Shipment, 'id' | 'title' | 'proposalPk' | 'status' | 'externalRef' | 'questionaryId' | 'scheduledEventId' | 'creatorId' | 'created'>
  & { proposal: Pick<Proposal, 'proposalId'> }
);

export type GetMyShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyShipmentsQuery = { myShipments: Maybe<Array<ShipmentFragment>> };

export type GetShipmentQueryVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type GetShipmentQuery = { shipment: Maybe<(
    { questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), samples: Array<SampleFragment> }
    & ShipmentFragment
  )> };

export type GetShipmentsQueryVariables = Exact<{
  filter?: Maybe<ShipmentsFilter>;
}>;


export type GetShipmentsQuery = { shipments: Maybe<Array<ShipmentFragment>> };

export type SetActiveTemplateMutationVariables = Exact<{
  templateGroupId: TemplateGroupId;
  templateId: Scalars['Int'];
}>;


export type SetActiveTemplateMutation = { setActiveTemplate: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SubmitShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type SubmitShipmentMutation = { submitShipment: { rejection: Maybe<RejectionFragment>, shipment: Maybe<ShipmentFragment> } };

export type UpdateShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
  status?: Maybe<ShipmentStatus>;
}>;


export type UpdateShipmentMutation = { updateShipment: { rejection: Maybe<RejectionFragment>, shipment: Maybe<(
      { questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & ShipmentFragment
    )> } };

export type ImportTemplateMutationVariables = Exact<{
  templateAsJson: Scalars['String'];
  conflictResolutions: Array<ConflictResolution> | ConflictResolution;
}>;


export type ImportTemplateMutation = { importTemplate: { template: Maybe<TemplateFragment>, rejection: Maybe<Pick<Rejection, 'reason' | 'context' | 'exception'>> } };

export type CloneTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CloneTemplateMutation = { cloneTemplate: { template: Maybe<(
      Pick<Template, 'questionaryCount'>
      & TemplateMetadataFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateQuestionMutationVariables = Exact<{
  categoryId: TemplateCategoryId;
  dataType: DataType;
}>;


export type CreateQuestionMutation = { createQuestion: { question: Maybe<QuestionFragment>, rejection: Maybe<RejectionFragment> } };

export type CreateQuestionTemplateRelationMutationVariables = Exact<{
  templateId: Scalars['Int'];
  questionId: Scalars['String'];
  topicId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateQuestionTemplateRelationMutation = { createQuestionTemplateRelation: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type CreateTemplateMutationVariables = Exact<{
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
}>;


export type CreateTemplateMutation = { createTemplate: { template: Maybe<(
      Pick<Template, 'questionaryCount'>
      & TemplateMetadataFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateTopicMutationVariables = Exact<{
  templateId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateTopicMutation = { createTopic: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type DeleteQuestionMutationVariables = Exact<{
  questionId: Scalars['String'];
}>;


export type DeleteQuestionMutation = { deleteQuestion: { question: Maybe<QuestionFragment>, rejection: Maybe<RejectionFragment> } };

export type DeleteQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
}>;


export type DeleteQuestionTemplateRelationMutation = { deleteQuestionTemplateRelation: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type DeleteTemplateMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteTemplateMutation = { deleteTemplate: { template: Maybe<Pick<Template, 'templateId' | 'name'>>, rejection: Maybe<RejectionFragment> } };

export type DeleteTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
}>;


export type DeleteTopicMutation = { deleteTopic: { rejection: Maybe<RejectionFragment> } };

export type FieldConditionFragment = Pick<FieldCondition, 'condition' | 'params'>;

type FieldConfigBooleanConfigFragment = Pick<BooleanConfig, 'small_label' | 'required' | 'tooltip'>;

type FieldConfigDateConfigFragment = Pick<DateConfig, 'small_label' | 'required' | 'tooltip' | 'minDate' | 'maxDate' | 'defaultDate' | 'includeTime'>;

type FieldConfigEmbellishmentConfigFragment = Pick<EmbellishmentConfig, 'html' | 'plain' | 'omitFromPdf'>;

type FieldConfigFileUploadConfigFragment = Pick<FileUploadConfig, 'file_type' | 'max_files' | 'small_label' | 'required' | 'tooltip'>;

type FieldConfigSelectionFromOptionsConfigFragment = Pick<SelectionFromOptionsConfig, 'variant' | 'options' | 'isMultipleSelect' | 'small_label' | 'required' | 'tooltip'>;

type FieldConfigTextInputConfigFragment = Pick<TextInputConfig, 'min' | 'max' | 'multiline' | 'placeholder' | 'small_label' | 'required' | 'tooltip' | 'htmlQuestion' | 'isHtmlQuestion' | 'isCounterHidden'>;

type FieldConfigSampleBasisConfigFragment = Pick<SampleBasisConfig, 'titlePlaceholder'>;

type FieldConfigSampleDeclarationConfigFragment = Pick<SampleDeclarationConfig, 'addEntryButtonLabel' | 'minEntries' | 'maxEntries' | 'templateId' | 'esiTemplateId' | 'templateCategory' | 'required' | 'small_label'>;

type FieldConfigSampleEsiBasisConfigFragment = Pick<SampleEsiBasisConfig, 'tooltip'>;

type FieldConfigSubTemplateConfigFragment = Pick<SubTemplateConfig, 'addEntryButtonLabel' | 'minEntries' | 'maxEntries' | 'templateId' | 'templateCategory' | 'required' | 'small_label'>;

type FieldConfigProposalBasisConfigFragment = Pick<ProposalBasisConfig, 'tooltip'>;

type FieldConfigProposalEsiBasisConfigFragment = Pick<ProposalEsiBasisConfig, 'tooltip'>;

type FieldConfigIntervalConfigFragment = Pick<IntervalConfig, 'units' | 'small_label' | 'required' | 'tooltip'>;

type FieldConfigNumberInputConfigFragment = Pick<NumberInputConfig, 'units' | 'numberValueConstraint' | 'small_label' | 'required' | 'tooltip'>;

type FieldConfigShipmentBasisConfigFragment = Pick<ShipmentBasisConfig, 'small_label' | 'required' | 'tooltip'>;

type FieldConfigRichTextInputConfigFragment = Pick<RichTextInputConfig, 'small_label' | 'required' | 'tooltip' | 'max'>;

type FieldConfigVisitBasisConfigFragment = Pick<VisitBasisConfig, 'small_label' | 'required' | 'tooltip'>;

type FieldConfigGenericTemplateBasisConfigFragment = Pick<GenericTemplateBasisConfig, 'titlePlaceholder' | 'questionLabel'>;

type FieldConfigFeedbackBasisConfigFragment = Pick<FeedbackBasisConfig, 'small_label' | 'required' | 'tooltip'>;

export type FieldConfigFragment = FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigVisitBasisConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigFeedbackBasisConfigFragment;

export type QuestionFragment = (
  Pick<Question, 'id' | 'question' | 'naturalKey' | 'dataType' | 'categoryId'>
  & { config: FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigVisitBasisConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigFeedbackBasisConfigFragment }
);

export type QuestionTemplateRelationFragment = (
  Pick<QuestionTemplateRelation, 'sortOrder' | 'topicId' | 'dependenciesOperator'>
  & { question: QuestionFragment, config: FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigVisitBasisConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigFeedbackBasisConfigFragment, dependencies: Array<(
    Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: FieldConditionFragment }
  )> }
);

export type TemplateFragment = (
  Pick<Template, 'isArchived' | 'questionaryCount' | 'templateId' | 'groupId' | 'name' | 'description'>
  & { steps: Array<{ topic: TopicFragment, fields: Array<QuestionTemplateRelationFragment> }>, complementaryQuestions: Array<QuestionFragment>, group: Pick<TemplateGroup, 'groupId' | 'categoryId'> }
);

export type TemplateMetadataFragment = (
  Pick<Template, 'templateId' | 'name' | 'description' | 'isArchived'>
  & { steps: Array<{ topic: TopicFragment }> }
);

export type TemplateStepFragment = { topic: Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>, fields: Array<QuestionTemplateRelationFragment> };

export type TopicFragment = Pick<Topic, 'title' | 'id' | 'templateId' | 'sortOrder' | 'isEnabled'>;

export type GetActiveTemplateIdQueryVariables = Exact<{
  templateGroupId: TemplateGroupId;
}>;


export type GetActiveTemplateIdQuery = Pick<Query, 'activeTemplateId'>;

export type GetIsNaturalKeyPresentQueryVariables = Exact<{
  naturalKey: Scalars['String'];
}>;


export type GetIsNaturalKeyPresentQuery = Pick<Query, 'isNaturalKeyPresent'>;

export type GetProposalTemplatesQueryVariables = Exact<{
  filter?: Maybe<ProposalTemplatesFilter>;
}>;


export type GetProposalTemplatesQuery = { proposalTemplates: Maybe<Array<Pick<ProposalTemplate, 'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount' | 'callCount'>>> };

export type GetQuestionsQueryVariables = Exact<{
  filter?: Maybe<QuestionsFilter>;
}>;


export type GetQuestionsQuery = { questions: Array<(
    Pick<QuestionWithUsage, 'id' | 'question' | 'naturalKey' | 'dataType' | 'categoryId'>
    & { config: FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigVisitBasisConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigFeedbackBasisConfigFragment, answers: Array<Pick<AnswerBasic, 'questionaryId'>>, templates: Array<Pick<Template, 'templateId'>> }
  )> };

export type GetTemplateQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetTemplateQuery = { template: Maybe<TemplateFragment> };

export type GetTemplateCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTemplateCategoriesQuery = { templateCategories: Maybe<Array<Pick<TemplateCategory, 'categoryId' | 'name'>>> };

export type GetTemplateExportQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetTemplateExportQuery = { template: Maybe<Pick<Template, 'json'>> };

export type GetTemplatesQueryVariables = Exact<{
  filter?: Maybe<TemplatesFilter>;
}>;


export type GetTemplatesQuery = { templates: Maybe<Array<Pick<Template, 'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'>>> };

export type UpdateQuestionMutationVariables = Exact<{
  id: Scalars['String'];
  naturalKey?: Maybe<Scalars['String']>;
  question?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
}>;


export type UpdateQuestionMutation = { updateQuestion: { question: Maybe<QuestionFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  topicId?: Maybe<Scalars['Int']>;
  sortOrder: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
}>;


export type UpdateQuestionTemplateRelationMutation = { updateQuestionTemplateRelation: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateQuestionTemplateRelationSettingsMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput> | FieldDependencyInput;
  dependenciesOperator?: Maybe<DependenciesLogicOperator>;
}>;


export type UpdateQuestionTemplateRelationSettingsMutation = { updateQuestionTemplateRelationSettings: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isArchived?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateTemplateMutation = { updateTemplate: { template: Maybe<TemplateMetadataFragment>, rejection: Maybe<RejectionFragment> } };

export type UpdateTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
  templateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  isEnabled?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateTopicMutation = { updateTopic: { template: Maybe<TemplateFragment>, rejection: Maybe<RejectionFragment> } };

export type ValidateTemplateImportMutationVariables = Exact<{
  templateAsJson: Scalars['String'];
}>;


export type ValidateTemplateImportMutation = { validateTemplateImport: { validationResult: Maybe<(
      Pick<TemplateImportWithValidation, 'json' | 'version' | 'exportDate' | 'isValid' | 'errors'>
      & { questionComparisons: Array<(
        Pick<QuestionComparison, 'status' | 'conflictResolutionStrategy'>
        & { existingQuestion: Maybe<QuestionFragment>, newQuestion: QuestionFragment }
      )> }
    )>, rejection: Maybe<RejectionFragment> } };

export type CheckTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type CheckTokenQuery = { checkToken: Pick<TokenResult, 'isValid'> };

export type CreateUserMutationVariables = Exact<{
  user_title?: Maybe<Scalars['String']>;
  firstname: Scalars['String'];
  middlename?: Maybe<Scalars['String']>;
  lastname: Scalars['String'];
  password: Scalars['String'];
  preferredname?: Maybe<Scalars['String']>;
  orcid: Scalars['String'];
  orcidHash: Scalars['String'];
  refreshToken: Scalars['String'];
  gender: Scalars['String'];
  nationality: Scalars['Int'];
  birthdate: Scalars['String'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: Maybe<Scalars['String']>;
  otherOrganisation?: Maybe<Scalars['String']>;
}>;


export type CreateUserMutation = { createUser: { user: Maybe<Pick<User, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type CreateUserByEmailInviteMutationVariables = Exact<{
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  email: Scalars['String'];
  userRole: UserRole;
}>;


export type CreateUserByEmailInviteMutation = { createUserByEmailInvite: (
    Pick<CreateUserByEmailInviteResponseWrap, 'id'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUserMutation = { deleteUser: { user: Maybe<Pick<User, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type ExternalTokenLoginMutationVariables = Exact<{
  externalToken: Scalars['String'];
}>;


export type ExternalTokenLoginMutation = { externalTokenLogin: (
    Pick<ExternalTokenLoginWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type BasicUserDetailsFragment = Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'preferredname' | 'organisation' | 'position' | 'created' | 'placeholder'>;

export type GetBasicUserDetailsQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetBasicUserDetailsQuery = { basicUserDetails: Maybe<BasicUserDetailsFragment> };

export type GetBasicUserDetailsByEmailQueryVariables = Exact<{
  email: Scalars['String'];
  role?: Maybe<UserRole>;
}>;


export type GetBasicUserDetailsByEmailQuery = { basicUserDetailsByEmail: Maybe<BasicUserDetailsFragment> };

export type GetFieldsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFieldsQuery = { getFields: Maybe<{ nationalities: Array<Pick<Entry, 'id' | 'value'>> }> };

export type GetMyRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyRolesQuery = { me: Maybe<(
    Pick<User, 'firstname' | 'lastname'>
    & { roles: Array<Pick<Role, 'id' | 'shortCode' | 'title'>> }
  )> };

export type GetOrcIdInformationQueryVariables = Exact<{
  authorizationCode: Scalars['String'];
}>;


export type GetOrcIdInformationQuery = { getOrcIDInformation: Maybe<Pick<OrcIdInformation, 'firstname' | 'lastname' | 'orcid' | 'orcidHash' | 'refreshToken' | 'token'>> };

export type GetPreviousCollaboratorsQueryVariables = Exact<{
  userId: Scalars['Int'];
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetPreviousCollaboratorsQuery = { previousCollaborators: Maybe<(
    Pick<UserQueryResult, 'totalCount'>
    & { users: Array<BasicUserDetailsFragment> }
  )> };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { roles: Maybe<Array<Pick<Role, 'id' | 'shortCode' | 'title'>>> };

export type GetTokenMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type GetTokenMutation = { token: (
    Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type GetTokenForUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetTokenForUserMutation = { getTokenForUser: (
    Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type GetUserQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserQuery = { user: Maybe<Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid' | 'emailVerified' | 'placeholder'>> };

export type GetUserMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserMeQuery = { me: Maybe<Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid' | 'emailVerified' | 'placeholder'>> };

export type GetUserProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProposalsQuery = { me: Maybe<{ proposals: Array<(
      Pick<Proposal, 'primaryKey' | 'proposalId' | 'title' | 'publicStatus' | 'statusId' | 'created' | 'finalStatus' | 'notified' | 'submitted'>
      & { status: Maybe<ProposalStatusFragment>, proposer: Maybe<Pick<BasicUserDetails, 'id'>>, call: Maybe<Pick<Call, 'id' | 'shortCode' | 'isActive' | 'referenceNumberFormat'>> }
    )> }> };

export type GetUserWithRolesQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserWithRolesQuery = { user: Maybe<(
    Pick<User, 'firstname' | 'lastname'>
    & { roles: Array<Pick<Role, 'id' | 'shortCode' | 'title'>> }
  )> };

export type GetUsersQueryVariables = Exact<{
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetUsersQuery = { users: Maybe<(
    Pick<UserQueryResult, 'totalCount'>
    & { users: Array<BasicUserDetailsFragment> }
  )> };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { login: (
    Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type LogoutMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type LogoutMutation = { logout: (
    Pick<LogoutTokenWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ResetPasswordMutation = { resetPassword: { rejection: Maybe<RejectionFragment> } };

export type ResetPasswordEmailMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ResetPasswordEmailMutation = { resetPasswordEmail: (
    Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SelectRoleMutationVariables = Exact<{
  token: Scalars['String'];
  selectedRoleId: Scalars['Int'];
}>;


export type SelectRoleMutation = { selectRole: (
    Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type SetUserEmailVerifiedMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserEmailVerifiedMutation = { setUserEmailVerified: { rejection: Maybe<RejectionFragment> } };

export type SetUserNotPlaceholderMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserNotPlaceholderMutation = { setUserNotPlaceholder: { rejection: Maybe<RejectionFragment> } };

export type UpdatePasswordMutationVariables = Exact<{
  id: Scalars['Int'];
  password: Scalars['String'];
}>;


export type UpdatePasswordMutation = { updatePassword: { rejection: Maybe<RejectionFragment> } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Int'];
  user_title?: Maybe<Scalars['String']>;
  firstname: Scalars['String'];
  middlename?: Maybe<Scalars['String']>;
  lastname: Scalars['String'];
  preferredname?: Maybe<Scalars['String']>;
  gender: Scalars['String'];
  nationality: Scalars['Int'];
  birthdate: Scalars['String'];
  organisation: Scalars['Int'];
  department: Scalars['String'];
  position: Scalars['String'];
  email: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: Maybe<Scalars['String']>;
}>;


export type UpdateUserMutation = { updateUser: { user: Maybe<Pick<User, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type UpdateUserRolesMutationVariables = Exact<{
  id: Scalars['Int'];
  roles?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type UpdateUserRolesMutation = { updateUserRoles: { user: Maybe<Pick<User, 'id'>>, rejection: Maybe<RejectionFragment> } };

export type VerifyEmailMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type VerifyEmailMutation = { emailVerification: (
    Pick<EmailVerificationResponseWrap, 'success'>
    & { rejection: Maybe<RejectionFragment> }
  ) };

export type CreateVisitMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
  team: Array<Scalars['Int']> | Scalars['Int'];
  teamLeadUserId: Scalars['Int'];
}>;


export type CreateVisitMutation = { createVisit: { visit: Maybe<(
      { teamLead: BasicUserDetailsFragment, registrations: Array<(
        { user: BasicUserDetailsFragment }
        & VisitRegistrationFragment
      )>, proposal: (
        { instrument: Maybe<Pick<Instrument, 'name'>> }
        & ProposalFragment
      ) }
      & VisitFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type DeleteVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type DeleteVisitMutation = { deleteVisit: { visit: Maybe<VisitFragment>, rejection: Maybe<RejectionFragment> } };

export type VisitFragment = Pick<Visit, 'id' | 'proposalPk' | 'status' | 'creatorId'>;

export type GetVisitQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitQuery = { visit: Maybe<(
    { registrations: Array<(
      { user: BasicUserDetailsFragment }
      & VisitRegistrationFragment
    )>, proposal: (
      { instrument: Maybe<Pick<Instrument, 'name'>> }
      & ProposalFragment
    ) }
    & VisitFragment
  )> };

export type GetVisitsQueryVariables = Exact<{
  filter?: Maybe<VisitsFilter>;
}>;


export type GetVisitsQuery = { visits: Array<(
    { proposal: (
      { instrument: Maybe<Pick<Instrument, 'name'>> }
      & ProposalFragment
    ) }
    & VisitFragment
  )> };

export type UpdateVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
  team?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
  status?: Maybe<VisitStatus>;
  teamLeadUserId?: Maybe<Scalars['Int']>;
}>;


export type UpdateVisitMutation = { updateVisit: { visit: Maybe<(
      { teamLead: BasicUserDetailsFragment, registrations: Array<(
        { user: BasicUserDetailsFragment }
        & VisitRegistrationFragment
      )>, proposal: (
        { instrument: Maybe<Pick<Instrument, 'name'>> }
        & ProposalFragment
      ) }
      & VisitFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type CreateVisitRegistrationQuestionaryMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type CreateVisitRegistrationQuestionaryMutation = { createVisitRegistrationQuestionary: { registration: Maybe<(
      { user: BasicUserDetailsFragment, questionary: (
        Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & VisitRegistrationFragment
    )>, rejection: Maybe<RejectionFragment> } };

export type VisitRegistrationFragment = Pick<VisitRegistration, 'userId' | 'visitId' | 'registrationQuestionaryId' | 'isRegistrationSubmitted' | 'trainingExpiryDate'>;

export type GetVisitRegistrationQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitRegistrationQuery = { visitRegistration: Maybe<(
    { user: BasicUserDetailsFragment, questionary: (
      Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & VisitRegistrationFragment
  )> };

export type UpdateVisitRegistrationMutationVariables = Exact<{
  visitId: Scalars['Int'];
  trainingExpiryDate?: Maybe<Scalars['DateTime']>;
  isRegistrationSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateVisitRegistrationMutation = { updateVisitRegistration: { registration: Maybe<VisitRegistrationFragment>, rejection: Maybe<RejectionFragment> } };

export const RejectionFragmentDoc = gql`
    fragment rejection on Rejection {
  reason
  context
  exception
}
    `;
export const BasicUserDetailsFragmentDoc = gql`
    fragment basicUserDetails on BasicUserDetails {
  id
  firstname
  lastname
  preferredname
  organisation
  position
  created
  placeholder
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
export const CoreTechnicalReviewFragmentDoc = gql`
    fragment coreTechnicalReview on TechnicalReview {
  id
  comment
  publicComment
  timeAllocation
  status
  proposalPk
  submitted
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
  technicalReviewAssignee
  sepMeetingDecision {
    ...sepMeetingDecision
  }
}
    ${ProposalStatusFragmentDoc}
${SepMeetingDecisionFragmentDoc}`;
export const TopicFragmentDoc = gql`
    fragment topic on Topic {
  title
  id
  templateId
  sortOrder
  isEnabled
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
    small_label
    required
    tooltip
  }
  ... on IntervalConfig {
    units
    small_label
    required
    tooltip
  }
  ... on NumberInputConfig {
    units
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
    `;
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
      id
      code
      description
      numberRatingsRequired
      active
      sepChair {
        ...basicUserDetails
      }
      sepSecretary {
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
      id
      code
      description
      numberRatingsRequired
      active
      sepChair {
        ...basicUserDetails
      }
      sepSecretary {
        ...basicUserDetails
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetSepDocument = gql`
    query getSEP($id: Int!) {
  sep(id: $id) {
    id
    code
    description
    numberRatingsRequired
    active
    sepChair {
      ...basicUserDetails
    }
    sepSecretary {
      ...basicUserDetails
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
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
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${CoreTechnicalReviewFragmentDoc}`;
export const GetSepProposalsDocument = gql`
    query getSEPProposals($sepId: Int!, $callId: Int!) {
  sepProposals(sepId: $sepId, callId: $callId) {
    proposalPk
    dateAssigned
    sepId
    sepTimeAllocation
    proposal {
      title
      primaryKey
      proposalId
      status {
        ...proposalStatus
      }
    }
    assignments {
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
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetSePsDocument = gql`
    query getSEPs($filter: String!, $active: Boolean) {
  seps(filter: $filter, active: $active) {
    seps {
      id
      code
      description
      numberRatingsRequired
      active
      sepChair {
        ...basicUserDetails
      }
      sepSecretary {
        ...basicUserDetails
      }
    }
    totalCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
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
    mutation createInstitution($name: String!, $verified: Boolean!) {
  createInstitution(name: $name, verified: $verified) {
    institution {
      id
      name
      verified
    }
    rejection {
      ...rejection
    }
  }
}
    ${RejectionFragmentDoc}`;
export const CreateUnitDocument = gql`
    mutation createUnit($name: String!) {
  createUnit(name: $name) {
    unit {
      id
      name
    }
    rejection {
      ...rejection
    }
  }
}
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
export const DeleteUnitDocument = gql`
    mutation deleteUnit($id: Int!) {
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
export const GetPageContentDocument = gql`
    query getPageContent($id: PageName!) {
  getPageContent(id: $id)
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
export const GetUnitsDocument = gql`
    query getUnits {
  units {
    id
    name
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
    }
    rejection {
      ...rejection
    }
  }
}
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
    mutation updateInstitution($id: Int!, $name: String!, $verified: Boolean!) {
  updateInstitution(id: $id, name: $name, verified: $verified) {
    institution {
      id
      verified
      name
    }
    rejection {
      ...rejection
    }
  }
}
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
    mutation createCall($shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $submissionMessage: String, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $title: String, $description: String) {
  createCall(
    createCallInput: {shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, submissionMessage: $submissionMessage, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, title: $title, description: $description}
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
    query getCall($id: Int!) {
  call(id: $id) {
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
    mutation updateCall($id: Int!, $shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $submissionMessage: String, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $title: String, $description: String) {
  updateCall(
    updateCallInput: {id: $id, shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, submissionMessage: $submissionMessage, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, title: $title, description: $description}
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
      technicalReviewAssignee
      technicalStatus
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
    query getProposalsCore($filter: ProposalsFilter) {
  proposalsView(filter: $filter) {
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
    query getUserProposalBookingsWithEvents($endsAfter: TzLessDateTime, $status: [ProposalBookingStatusCore!], $instrumentId: Int) {
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
    query getFileMetadata($fileIds: [String!]!) {
  fileMetadata(fileIds: $fileIds) {
    fileId
    originalFileName
    mimeType
    sizeInBytes
    createdDate
  }
}
    `;
export const GetQuestionaryDocument = gql`
    query getQuestionary($questionaryId: Int!) {
  questionary(questionaryId: $questionaryId) {
    ...questionary
  }
}
    ${QuestionaryFragmentDoc}`;
export const AddTechnicalReviewDocument = gql`
    mutation addTechnicalReview($proposalPk: Int!, $timeAllocation: Int, $comment: String, $publicComment: String, $status: TechnicalReviewStatus, $submitted: Boolean!, $reviewerId: Int!) {
  addTechnicalReview(
    addTechnicalReviewInput: {proposalPk: $proposalPk, timeAllocation: $timeAllocation, comment: $comment, publicComment: $publicComment, status: $status, submitted: $submitted, reviewerId: $reviewerId}
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
    proposals {
      ...proposal
    }
    rejection {
      ...rejection
    }
  }
}
    ${ProposalFragmentDoc}
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
    query getReview($reviewId: Int!, $sepId: Int) {
  review(reviewId: $reviewId, sepId: $sepId) {
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
export const SubmitTechnicalReviewDocument = gql`
    mutation submitTechnicalReview($proposalPk: Int!, $timeAllocation: Int, $comment: String, $publicComment: String, $status: TechnicalReviewStatus, $submitted: Boolean!, $reviewerId: Int!) {
  submitTechnicalReview(
    submitTechnicalReviewInput: {proposalPk: $proposalPk, timeAllocation: $timeAllocation, comment: $comment, publicComment: $publicComment, status: $status, submitted: $submitted, reviewerId: $reviewerId}
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
export const AddReviewDocument = gql`
    mutation addReview($reviewID: Int!, $grade: Int!, $comment: String!, $status: ReviewStatus!, $sepID: Int!) {
  addReview(
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
    query getProposalWorkflow($id: Int!) {
  proposalWorkflow(id: $id) {
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
    mutation importTemplate($templateAsJson: String!, $conflictResolutions: [ConflictResolution!]!) {
  importTemplate(
    templateAsJson: $templateAsJson
    conflictResolutions: $conflictResolutions
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
      isValid
      errors
      questionComparisons {
        existingQuestion {
          ...question
        }
        newQuestion {
          ...question
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
    ${QuestionFragmentDoc}
${RejectionFragmentDoc}`;
export const CheckTokenDocument = gql`
    query checkToken($token: String!) {
  checkToken(token: $token) {
    isValid
  }
}
    `;
export const CreateUserDocument = gql`
    mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String) {
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
    query getBasicUserDetails($id: Int!) {
  basicUserDetails(id: $id) {
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
export const GetFieldsDocument = gql`
    query getFields {
  getFields {
    nationalities {
      id
      value
    }
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
    query getUser($id: Int!) {
  user(id: $id) {
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
    query getUserWithRoles($id: Int!) {
  user(id: $id) {
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
    query getUsers($filter: String, $first: Int, $offset: Int, $userRole: UserRole, $subtractUsers: [Int!]) {
  users(
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
    mutation updateUser($id: Int!, $user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $preferredname: String, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String) {
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
export const CreateVisitRegistrationQuestionaryDocument = gql`
    mutation createVisitRegistrationQuestionary($visitId: Int!) {
  createVisitRegistrationQuestionary(visitId: $visitId) {
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
    mutation updateVisitRegistration($visitId: Int!, $trainingExpiryDate: DateTime, $isRegistrationSubmitted: Boolean) {
  updateVisitRegistration(
    visitId: $visitId
    trainingExpiryDate: $trainingExpiryDate
    isRegistrationSubmitted: $isRegistrationSubmitted
  ) {
    registration {
      ...visitRegistration
    }
    rejection {
      ...rejection
    }
  }
}
    ${VisitRegistrationFragmentDoc}
${RejectionFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    assignProposalsToSep(variables: AssignProposalsToSepMutationVariables): Promise<AssignProposalsToSepMutation> {
      return withWrapper(() => client.request<AssignProposalsToSepMutation>(print(AssignProposalsToSepDocument), variables));
    },
    assignReviewersToSEP(variables: AssignReviewersToSepMutationVariables): Promise<AssignReviewersToSepMutation> {
      return withWrapper(() => client.request<AssignReviewersToSepMutation>(print(AssignReviewersToSepDocument), variables));
    },
    assignChairOrSecretary(variables: AssignChairOrSecretaryMutationVariables): Promise<AssignChairOrSecretaryMutation> {
      return withWrapper(() => client.request<AssignChairOrSecretaryMutation>(print(AssignChairOrSecretaryDocument), variables));
    },
    assignSepReviewersToProposal(variables: AssignSepReviewersToProposalMutationVariables): Promise<AssignSepReviewersToProposalMutation> {
      return withWrapper(() => client.request<AssignSepReviewersToProposalMutation>(print(AssignSepReviewersToProposalDocument), variables));
    },
    createSEP(variables: CreateSepMutationVariables): Promise<CreateSepMutation> {
      return withWrapper(() => client.request<CreateSepMutation>(print(CreateSepDocument), variables));
    },
    deleteSEP(variables: DeleteSepMutationVariables): Promise<DeleteSepMutation> {
      return withWrapper(() => client.request<DeleteSepMutation>(print(DeleteSepDocument), variables));
    },
    getInstrumentsBySEP(variables: GetInstrumentsBySepQueryVariables): Promise<GetInstrumentsBySepQuery> {
      return withWrapper(() => client.request<GetInstrumentsBySepQuery>(print(GetInstrumentsBySepDocument), variables));
    },
    getUserSeps(variables?: GetUserSepsQueryVariables): Promise<GetUserSepsQuery> {
      return withWrapper(() => client.request<GetUserSepsQuery>(print(GetUserSepsDocument), variables));
    },
    getSEP(variables: GetSepQueryVariables): Promise<GetSepQuery> {
      return withWrapper(() => client.request<GetSepQuery>(print(GetSepDocument), variables));
    },
    getSEPMembers(variables: GetSepMembersQueryVariables): Promise<GetSepMembersQuery> {
      return withWrapper(() => client.request<GetSepMembersQuery>(print(GetSepMembersDocument), variables));
    },
    getSEPProposal(variables: GetSepProposalQueryVariables): Promise<GetSepProposalQuery> {
      return withWrapper(() => client.request<GetSepProposalQuery>(print(GetSepProposalDocument), variables));
    },
    getSEPProposals(variables: GetSepProposalsQueryVariables): Promise<GetSepProposalsQuery> {
      return withWrapper(() => client.request<GetSepProposalsQuery>(print(GetSepProposalsDocument), variables));
    },
    sepProposalsByInstrument(variables: SepProposalsByInstrumentQueryVariables): Promise<SepProposalsByInstrumentQuery> {
      return withWrapper(() => client.request<SepProposalsByInstrumentQuery>(print(SepProposalsByInstrumentDocument), variables));
    },
    getSEPReviewers(variables: GetSepReviewersQueryVariables): Promise<GetSepReviewersQuery> {
      return withWrapper(() => client.request<GetSepReviewersQuery>(print(GetSepReviewersDocument), variables));
    },
    getSEPs(variables: GetSePsQueryVariables): Promise<GetSePsQuery> {
      return withWrapper(() => client.request<GetSePsQuery>(print(GetSePsDocument), variables));
    },
    removeProposalsFromSep(variables: RemoveProposalsFromSepMutationVariables): Promise<RemoveProposalsFromSepMutation> {
      return withWrapper(() => client.request<RemoveProposalsFromSepMutation>(print(RemoveProposalsFromSepDocument), variables));
    },
    removeMemberFromSep(variables: RemoveMemberFromSepMutationVariables): Promise<RemoveMemberFromSepMutation> {
      return withWrapper(() => client.request<RemoveMemberFromSepMutation>(print(RemoveMemberFromSepDocument), variables));
    },
    removeMemberFromSEPProposal(variables: RemoveMemberFromSepProposalMutationVariables): Promise<RemoveMemberFromSepProposalMutation> {
      return withWrapper(() => client.request<RemoveMemberFromSepProposalMutation>(print(RemoveMemberFromSepProposalDocument), variables));
    },
    reorderSepMeetingDecisionProposals(variables: ReorderSepMeetingDecisionProposalsMutationVariables): Promise<ReorderSepMeetingDecisionProposalsMutation> {
      return withWrapper(() => client.request<ReorderSepMeetingDecisionProposalsMutation>(print(ReorderSepMeetingDecisionProposalsDocument), variables));
    },
    saveSepMeetingDecision(variables: SaveSepMeetingDecisionMutationVariables): Promise<SaveSepMeetingDecisionMutation> {
      return withWrapper(() => client.request<SaveSepMeetingDecisionMutation>(print(SaveSepMeetingDecisionDocument), variables));
    },
    updateSEP(variables: UpdateSepMutationVariables): Promise<UpdateSepMutation> {
      return withWrapper(() => client.request<UpdateSepMutation>(print(UpdateSepDocument), variables));
    },
    updateSEPTimeAllocation(variables: UpdateSepTimeAllocationMutationVariables): Promise<UpdateSepTimeAllocationMutation> {
      return withWrapper(() => client.request<UpdateSepTimeAllocationMutation>(print(UpdateSepTimeAllocationDocument), variables));
    },
    addClientLog(variables: AddClientLogMutationVariables): Promise<AddClientLogMutation> {
      return withWrapper(() => client.request<AddClientLogMutation>(print(AddClientLogDocument), variables));
    },
    createApiAccessToken(variables: CreateApiAccessTokenMutationVariables): Promise<CreateApiAccessTokenMutation> {
      return withWrapper(() => client.request<CreateApiAccessTokenMutation>(print(CreateApiAccessTokenDocument), variables));
    },
    createInstitution(variables: CreateInstitutionMutationVariables): Promise<CreateInstitutionMutation> {
      return withWrapper(() => client.request<CreateInstitutionMutation>(print(CreateInstitutionDocument), variables));
    },
    createUnit(variables: CreateUnitMutationVariables): Promise<CreateUnitMutation> {
      return withWrapper(() => client.request<CreateUnitMutation>(print(CreateUnitDocument), variables));
    },
    deleteApiAccessToken(variables: DeleteApiAccessTokenMutationVariables): Promise<DeleteApiAccessTokenMutation> {
      return withWrapper(() => client.request<DeleteApiAccessTokenMutation>(print(DeleteApiAccessTokenDocument), variables));
    },
    deleteInstitution(variables: DeleteInstitutionMutationVariables): Promise<DeleteInstitutionMutation> {
      return withWrapper(() => client.request<DeleteInstitutionMutation>(print(DeleteInstitutionDocument), variables));
    },
    deleteUnit(variables: DeleteUnitMutationVariables): Promise<DeleteUnitMutation> {
      return withWrapper(() => client.request<DeleteUnitMutation>(print(DeleteUnitDocument), variables));
    },
    getAllApiAccessTokensAndPermissions(variables?: GetAllApiAccessTokensAndPermissionsQueryVariables): Promise<GetAllApiAccessTokensAndPermissionsQuery> {
      return withWrapper(() => client.request<GetAllApiAccessTokensAndPermissionsQuery>(print(GetAllApiAccessTokensAndPermissionsDocument), variables));
    },
    getAllQueriesAndMutations(variables?: GetAllQueriesAndMutationsQueryVariables): Promise<GetAllQueriesAndMutationsQuery> {
      return withWrapper(() => client.request<GetAllQueriesAndMutationsQuery>(print(GetAllQueriesAndMutationsDocument), variables));
    },
    getFeatures(variables?: GetFeaturesQueryVariables): Promise<GetFeaturesQuery> {
      return withWrapper(() => client.request<GetFeaturesQuery>(print(GetFeaturesDocument), variables));
    },
    getInstitutions(variables?: GetInstitutionsQueryVariables): Promise<GetInstitutionsQuery> {
      return withWrapper(() => client.request<GetInstitutionsQuery>(print(GetInstitutionsDocument), variables));
    },
    getPageContent(variables: GetPageContentQueryVariables): Promise<GetPageContentQuery> {
      return withWrapper(() => client.request<GetPageContentQuery>(print(GetPageContentDocument), variables));
    },
    getSettings(variables?: GetSettingsQueryVariables): Promise<GetSettingsQuery> {
      return withWrapper(() => client.request<GetSettingsQuery>(print(GetSettingsDocument), variables));
    },
    getUnits(variables?: GetUnitsQueryVariables): Promise<GetUnitsQuery> {
      return withWrapper(() => client.request<GetUnitsQuery>(print(GetUnitsDocument), variables));
    },
    mergeInstitutions(variables: MergeInstitutionsMutationVariables): Promise<MergeInstitutionsMutation> {
      return withWrapper(() => client.request<MergeInstitutionsMutation>(print(MergeInstitutionsDocument), variables));
    },
    prepareDB(variables: PrepareDbMutationVariables): Promise<PrepareDbMutation> {
      return withWrapper(() => client.request<PrepareDbMutation>(print(PrepareDbDocument), variables));
    },
    setPageContent(variables: SetPageContentMutationVariables): Promise<SetPageContentMutation> {
      return withWrapper(() => client.request<SetPageContentMutation>(print(SetPageContentDocument), variables));
    },
    updateApiAccessToken(variables: UpdateApiAccessTokenMutationVariables): Promise<UpdateApiAccessTokenMutation> {
      return withWrapper(() => client.request<UpdateApiAccessTokenMutation>(print(UpdateApiAccessTokenDocument), variables));
    },
    updateInstitution(variables: UpdateInstitutionMutationVariables): Promise<UpdateInstitutionMutation> {
      return withWrapper(() => client.request<UpdateInstitutionMutation>(print(UpdateInstitutionDocument), variables));
    },
    assignInstrumentsToCall(variables: AssignInstrumentsToCallMutationVariables): Promise<AssignInstrumentsToCallMutation> {
      return withWrapper(() => client.request<AssignInstrumentsToCallMutation>(print(AssignInstrumentsToCallDocument), variables));
    },
    createCall(variables: CreateCallMutationVariables): Promise<CreateCallMutation> {
      return withWrapper(() => client.request<CreateCallMutation>(print(CreateCallDocument), variables));
    },
    deleteCall(variables: DeleteCallMutationVariables): Promise<DeleteCallMutation> {
      return withWrapper(() => client.request<DeleteCallMutation>(print(DeleteCallDocument), variables));
    },
    getCall(variables: GetCallQueryVariables): Promise<GetCallQuery> {
      return withWrapper(() => client.request<GetCallQuery>(print(GetCallDocument), variables));
    },
    getCalls(variables?: GetCallsQueryVariables): Promise<GetCallsQuery> {
      return withWrapper(() => client.request<GetCallsQuery>(print(GetCallsDocument), variables));
    },
    getCallsByInstrumentScientist(variables: GetCallsByInstrumentScientistQueryVariables): Promise<GetCallsByInstrumentScientistQuery> {
      return withWrapper(() => client.request<GetCallsByInstrumentScientistQuery>(print(GetCallsByInstrumentScientistDocument), variables));
    },
    removeAssignedInstrumentFromCall(variables: RemoveAssignedInstrumentFromCallMutationVariables): Promise<RemoveAssignedInstrumentFromCallMutation> {
      return withWrapper(() => client.request<RemoveAssignedInstrumentFromCallMutation>(print(RemoveAssignedInstrumentFromCallDocument), variables));
    },
    updateCall(variables: UpdateCallMutationVariables): Promise<UpdateCallMutation> {
      return withWrapper(() => client.request<UpdateCallMutation>(print(UpdateCallDocument), variables));
    },
    createEsi(variables: CreateEsiMutationVariables): Promise<CreateEsiMutation> {
      return withWrapper(() => client.request<CreateEsiMutation>(print(CreateEsiDocument), variables));
    },
    getEsi(variables: GetEsiQueryVariables): Promise<GetEsiQuery> {
      return withWrapper(() => client.request<GetEsiQuery>(print(GetEsiDocument), variables));
    },
    updateEsi(variables: UpdateEsiMutationVariables): Promise<UpdateEsiMutation> {
      return withWrapper(() => client.request<UpdateEsiMutation>(print(UpdateEsiDocument), variables));
    },
    getEventLogs(variables: GetEventLogsQueryVariables): Promise<GetEventLogsQuery> {
      return withWrapper(() => client.request<GetEventLogsQuery>(print(GetEventLogsDocument), variables));
    },
    createFeedback(variables: CreateFeedbackMutationVariables): Promise<CreateFeedbackMutation> {
      return withWrapper(() => client.request<CreateFeedbackMutation>(print(CreateFeedbackDocument), variables));
    },
    getFeedback(variables: GetFeedbackQueryVariables): Promise<GetFeedbackQuery> {
      return withWrapper(() => client.request<GetFeedbackQuery>(print(GetFeedbackDocument), variables));
    },
    updateFeedback(variables: UpdateFeedbackMutationVariables): Promise<UpdateFeedbackMutation> {
      return withWrapper(() => client.request<UpdateFeedbackMutation>(print(UpdateFeedbackDocument), variables));
    },
    cloneGenericTemplate(variables: CloneGenericTemplateMutationVariables): Promise<CloneGenericTemplateMutation> {
      return withWrapper(() => client.request<CloneGenericTemplateMutation>(print(CloneGenericTemplateDocument), variables));
    },
    createGenericTemplate(variables: CreateGenericTemplateMutationVariables): Promise<CreateGenericTemplateMutation> {
      return withWrapper(() => client.request<CreateGenericTemplateMutation>(print(CreateGenericTemplateDocument), variables));
    },
    deleteGenericTemplate(variables: DeleteGenericTemplateMutationVariables): Promise<DeleteGenericTemplateMutation> {
      return withWrapper(() => client.request<DeleteGenericTemplateMutation>(print(DeleteGenericTemplateDocument), variables));
    },
    getGenericTemplate(variables: GetGenericTemplateQueryVariables): Promise<GetGenericTemplateQuery> {
      return withWrapper(() => client.request<GetGenericTemplateQuery>(print(GetGenericTemplateDocument), variables));
    },
    getGenericTemplatesWithProposalData(variables?: GetGenericTemplatesWithProposalDataQueryVariables): Promise<GetGenericTemplatesWithProposalDataQuery> {
      return withWrapper(() => client.request<GetGenericTemplatesWithProposalDataQuery>(print(GetGenericTemplatesWithProposalDataDocument), variables));
    },
    getGenericTemplatesWithQuestionaryStatus(variables?: GetGenericTemplatesWithQuestionaryStatusQueryVariables): Promise<GetGenericTemplatesWithQuestionaryStatusQuery> {
      return withWrapper(() => client.request<GetGenericTemplatesWithQuestionaryStatusQuery>(print(GetGenericTemplatesWithQuestionaryStatusDocument), variables));
    },
    updateGenericTemplate(variables: UpdateGenericTemplateMutationVariables): Promise<UpdateGenericTemplateMutation> {
      return withWrapper(() => client.request<UpdateGenericTemplateMutation>(print(UpdateGenericTemplateDocument), variables));
    },
    assignProposalsToInstrument(variables: AssignProposalsToInstrumentMutationVariables): Promise<AssignProposalsToInstrumentMutation> {
      return withWrapper(() => client.request<AssignProposalsToInstrumentMutation>(print(AssignProposalsToInstrumentDocument), variables));
    },
    assignScientistsToInstrument(variables: AssignScientistsToInstrumentMutationVariables): Promise<AssignScientistsToInstrumentMutation> {
      return withWrapper(() => client.request<AssignScientistsToInstrumentMutation>(print(AssignScientistsToInstrumentDocument), variables));
    },
    createInstrument(variables: CreateInstrumentMutationVariables): Promise<CreateInstrumentMutation> {
      return withWrapper(() => client.request<CreateInstrumentMutation>(print(CreateInstrumentDocument), variables));
    },
    deleteInstrument(variables: DeleteInstrumentMutationVariables): Promise<DeleteInstrumentMutation> {
      return withWrapper(() => client.request<DeleteInstrumentMutation>(print(DeleteInstrumentDocument), variables));
    },
    getInstruments(variables?: GetInstrumentsQueryVariables): Promise<GetInstrumentsQuery> {
      return withWrapper(() => client.request<GetInstrumentsQuery>(print(GetInstrumentsDocument), variables));
    },
    getUserInstruments(variables?: GetUserInstrumentsQueryVariables): Promise<GetUserInstrumentsQuery> {
      return withWrapper(() => client.request<GetUserInstrumentsQuery>(print(GetUserInstrumentsDocument), variables));
    },
    removeProposalsFromInstrument(variables: RemoveProposalsFromInstrumentMutationVariables): Promise<RemoveProposalsFromInstrumentMutation> {
      return withWrapper(() => client.request<RemoveProposalsFromInstrumentMutation>(print(RemoveProposalsFromInstrumentDocument), variables));
    },
    removeScientistFromInstrument(variables: RemoveScientistFromInstrumentMutationVariables): Promise<RemoveScientistFromInstrumentMutation> {
      return withWrapper(() => client.request<RemoveScientistFromInstrumentMutation>(print(RemoveScientistFromInstrumentDocument), variables));
    },
    setInstrumentAvailabilityTime(variables: SetInstrumentAvailabilityTimeMutationVariables): Promise<SetInstrumentAvailabilityTimeMutation> {
      return withWrapper(() => client.request<SetInstrumentAvailabilityTimeMutation>(print(SetInstrumentAvailabilityTimeDocument), variables));
    },
    submitInstrument(variables: SubmitInstrumentMutationVariables): Promise<SubmitInstrumentMutation> {
      return withWrapper(() => client.request<SubmitInstrumentMutation>(print(SubmitInstrumentDocument), variables));
    },
    updateInstrument(variables: UpdateInstrumentMutationVariables): Promise<UpdateInstrumentMutation> {
      return withWrapper(() => client.request<UpdateInstrumentMutation>(print(UpdateInstrumentDocument), variables));
    },
    administrationProposal(variables: AdministrationProposalMutationVariables): Promise<AdministrationProposalMutation> {
      return withWrapper(() => client.request<AdministrationProposalMutation>(print(AdministrationProposalDocument), variables));
    },
    changeProposalsStatus(variables: ChangeProposalsStatusMutationVariables): Promise<ChangeProposalsStatusMutation> {
      return withWrapper(() => client.request<ChangeProposalsStatusMutation>(print(ChangeProposalsStatusDocument), variables));
    },
    cloneProposals(variables: CloneProposalsMutationVariables): Promise<CloneProposalsMutation> {
      return withWrapper(() => client.request<CloneProposalsMutation>(print(CloneProposalsDocument), variables));
    },
    createProposal(variables: CreateProposalMutationVariables): Promise<CreateProposalMutation> {
      return withWrapper(() => client.request<CreateProposalMutation>(print(CreateProposalDocument), variables));
    },
    deleteProposal(variables: DeleteProposalMutationVariables): Promise<DeleteProposalMutation> {
      return withWrapper(() => client.request<DeleteProposalMutation>(print(DeleteProposalDocument), variables));
    },
    getInstrumentScientistProposals(variables?: GetInstrumentScientistProposalsQueryVariables): Promise<GetInstrumentScientistProposalsQuery> {
      return withWrapper(() => client.request<GetInstrumentScientistProposalsQuery>(print(GetInstrumentScientistProposalsDocument), variables));
    },
    getMyProposals(variables?: GetMyProposalsQueryVariables): Promise<GetMyProposalsQuery> {
      return withWrapper(() => client.request<GetMyProposalsQuery>(print(GetMyProposalsDocument), variables));
    },
    getProposal(variables: GetProposalQueryVariables): Promise<GetProposalQuery> {
      return withWrapper(() => client.request<GetProposalQuery>(print(GetProposalDocument), variables));
    },
    getProposals(variables?: GetProposalsQueryVariables): Promise<GetProposalsQuery> {
      return withWrapper(() => client.request<GetProposalsQuery>(print(GetProposalsDocument), variables));
    },
    getProposalsCore(variables?: GetProposalsCoreQueryVariables): Promise<GetProposalsCoreQuery> {
      return withWrapper(() => client.request<GetProposalsCoreQuery>(print(GetProposalsCoreDocument), variables));
    },
    notifyProposal(variables: NotifyProposalMutationVariables): Promise<NotifyProposalMutation> {
      return withWrapper(() => client.request<NotifyProposalMutation>(print(NotifyProposalDocument), variables));
    },
    submitProposal(variables: SubmitProposalMutationVariables): Promise<SubmitProposalMutation> {
      return withWrapper(() => client.request<SubmitProposalMutation>(print(SubmitProposalDocument), variables));
    },
    updateProposal(variables: UpdateProposalMutationVariables): Promise<UpdateProposalMutation> {
      return withWrapper(() => client.request<UpdateProposalMutation>(print(UpdateProposalDocument), variables));
    },
    getUserProposalBookingsWithEvents(variables?: GetUserProposalBookingsWithEventsQueryVariables): Promise<GetUserProposalBookingsWithEventsQuery> {
      return withWrapper(() => client.request<GetUserProposalBookingsWithEventsQuery>(print(GetUserProposalBookingsWithEventsDocument), variables));
    },
    answerTopic(variables: AnswerTopicMutationVariables): Promise<AnswerTopicMutation> {
      return withWrapper(() => client.request<AnswerTopicMutation>(print(AnswerTopicDocument), variables));
    },
    createQuestionary(variables: CreateQuestionaryMutationVariables): Promise<CreateQuestionaryMutation> {
      return withWrapper(() => client.request<CreateQuestionaryMutation>(print(CreateQuestionaryDocument), variables));
    },
    getBlankQuestionary(variables: GetBlankQuestionaryQueryVariables): Promise<GetBlankQuestionaryQuery> {
      return withWrapper(() => client.request<GetBlankQuestionaryQuery>(print(GetBlankQuestionaryDocument), variables));
    },
    getBlankQuestionarySteps(variables: GetBlankQuestionaryStepsQueryVariables): Promise<GetBlankQuestionaryStepsQuery> {
      return withWrapper(() => client.request<GetBlankQuestionaryStepsQuery>(print(GetBlankQuestionaryStepsDocument), variables));
    },
    getFileMetadata(variables: GetFileMetadataQueryVariables): Promise<GetFileMetadataQuery> {
      return withWrapper(() => client.request<GetFileMetadataQuery>(print(GetFileMetadataDocument), variables));
    },
    getQuestionary(variables: GetQuestionaryQueryVariables): Promise<GetQuestionaryQuery> {
      return withWrapper(() => client.request<GetQuestionaryQuery>(print(GetQuestionaryDocument), variables));
    },
    addTechnicalReview(variables: AddTechnicalReviewMutationVariables): Promise<AddTechnicalReviewMutation> {
      return withWrapper(() => client.request<AddTechnicalReviewMutation>(print(AddTechnicalReviewDocument), variables));
    },
    addUserForReview(variables: AddUserForReviewMutationVariables): Promise<AddUserForReviewMutation> {
      return withWrapper(() => client.request<AddUserForReviewMutation>(print(AddUserForReviewDocument), variables));
    },
    updateTechnicalReviewAssignee(variables: UpdateTechnicalReviewAssigneeMutationVariables): Promise<UpdateTechnicalReviewAssigneeMutation> {
      return withWrapper(() => client.request<UpdateTechnicalReviewAssigneeMutation>(print(UpdateTechnicalReviewAssigneeDocument), variables));
    },
    getProposalReviews(variables: GetProposalReviewsQueryVariables): Promise<GetProposalReviewsQuery> {
      return withWrapper(() => client.request<GetProposalReviewsQuery>(print(GetProposalReviewsDocument), variables));
    },
    getReview(variables: GetReviewQueryVariables): Promise<GetReviewQuery> {
      return withWrapper(() => client.request<GetReviewQuery>(print(GetReviewDocument), variables));
    },
    removeUserForReview(variables: RemoveUserForReviewMutationVariables): Promise<RemoveUserForReviewMutation> {
      return withWrapper(() => client.request<RemoveUserForReviewMutation>(print(RemoveUserForReviewDocument), variables));
    },
    submitProposalsReview(variables: SubmitProposalsReviewMutationVariables): Promise<SubmitProposalsReviewMutation> {
      return withWrapper(() => client.request<SubmitProposalsReviewMutation>(print(SubmitProposalsReviewDocument), variables));
    },
    submitTechnicalReview(variables: SubmitTechnicalReviewMutationVariables): Promise<SubmitTechnicalReviewMutation> {
      return withWrapper(() => client.request<SubmitTechnicalReviewMutation>(print(SubmitTechnicalReviewDocument), variables));
    },
    addReview(variables: AddReviewMutationVariables): Promise<AddReviewMutation> {
      return withWrapper(() => client.request<AddReviewMutation>(print(AddReviewDocument), variables));
    },
    userWithReviews(variables?: UserWithReviewsQueryVariables): Promise<UserWithReviewsQuery> {
      return withWrapper(() => client.request<UserWithReviewsQuery>(print(UserWithReviewsDocument), variables));
    },
    cloneSampleEsi(variables: CloneSampleEsiMutationVariables): Promise<CloneSampleEsiMutation> {
      return withWrapper(() => client.request<CloneSampleEsiMutation>(print(CloneSampleEsiDocument), variables));
    },
    createSampleEsi(variables: CreateSampleEsiMutationVariables): Promise<CreateSampleEsiMutation> {
      return withWrapper(() => client.request<CreateSampleEsiMutation>(print(CreateSampleEsiDocument), variables));
    },
    deleteSampleEsi(variables: DeleteSampleEsiMutationVariables): Promise<DeleteSampleEsiMutation> {
      return withWrapper(() => client.request<DeleteSampleEsiMutation>(print(DeleteSampleEsiDocument), variables));
    },
    getSampleEsi(variables: GetSampleEsiQueryVariables): Promise<GetSampleEsiQuery> {
      return withWrapper(() => client.request<GetSampleEsiQuery>(print(GetSampleEsiDocument), variables));
    },
    updateSampleEsi(variables: UpdateSampleEsiMutationVariables): Promise<UpdateSampleEsiMutation> {
      return withWrapper(() => client.request<UpdateSampleEsiMutation>(print(UpdateSampleEsiDocument), variables));
    },
    cloneSample(variables: CloneSampleMutationVariables): Promise<CloneSampleMutation> {
      return withWrapper(() => client.request<CloneSampleMutation>(print(CloneSampleDocument), variables));
    },
    createSample(variables: CreateSampleMutationVariables): Promise<CreateSampleMutation> {
      return withWrapper(() => client.request<CreateSampleMutation>(print(CreateSampleDocument), variables));
    },
    deleteSample(variables: DeleteSampleMutationVariables): Promise<DeleteSampleMutation> {
      return withWrapper(() => client.request<DeleteSampleMutation>(print(DeleteSampleDocument), variables));
    },
    getSample(variables: GetSampleQueryVariables): Promise<GetSampleQuery> {
      return withWrapper(() => client.request<GetSampleQuery>(print(GetSampleDocument), variables));
    },
    getSamplesByCallId(variables: GetSamplesByCallIdQueryVariables): Promise<GetSamplesByCallIdQuery> {
      return withWrapper(() => client.request<GetSamplesByCallIdQuery>(print(GetSamplesByCallIdDocument), variables));
    },
    getSamplesWithProposalData(variables?: GetSamplesWithProposalDataQueryVariables): Promise<GetSamplesWithProposalDataQuery> {
      return withWrapper(() => client.request<GetSamplesWithProposalDataQuery>(print(GetSamplesWithProposalDataDocument), variables));
    },
    getSamplesWithQuestionaryStatus(variables?: GetSamplesWithQuestionaryStatusQueryVariables): Promise<GetSamplesWithQuestionaryStatusQuery> {
      return withWrapper(() => client.request<GetSamplesWithQuestionaryStatusQuery>(print(GetSamplesWithQuestionaryStatusDocument), variables));
    },
    updateSample(variables: UpdateSampleMutationVariables): Promise<UpdateSampleMutation> {
      return withWrapper(() => client.request<UpdateSampleMutation>(print(UpdateSampleDocument), variables));
    },
    addProposalWorkflowStatus(variables: AddProposalWorkflowStatusMutationVariables): Promise<AddProposalWorkflowStatusMutation> {
      return withWrapper(() => client.request<AddProposalWorkflowStatusMutation>(print(AddProposalWorkflowStatusDocument), variables));
    },
    addStatusChangingEventsToConnection(variables: AddStatusChangingEventsToConnectionMutationVariables): Promise<AddStatusChangingEventsToConnectionMutation> {
      return withWrapper(() => client.request<AddStatusChangingEventsToConnectionMutation>(print(AddStatusChangingEventsToConnectionDocument), variables));
    },
    createProposalStatus(variables: CreateProposalStatusMutationVariables): Promise<CreateProposalStatusMutation> {
      return withWrapper(() => client.request<CreateProposalStatusMutation>(print(CreateProposalStatusDocument), variables));
    },
    createProposalWorkflow(variables: CreateProposalWorkflowMutationVariables): Promise<CreateProposalWorkflowMutation> {
      return withWrapper(() => client.request<CreateProposalWorkflowMutation>(print(CreateProposalWorkflowDocument), variables));
    },
    deleteProposalStatus(variables: DeleteProposalStatusMutationVariables): Promise<DeleteProposalStatusMutation> {
      return withWrapper(() => client.request<DeleteProposalStatusMutation>(print(DeleteProposalStatusDocument), variables));
    },
    deleteProposalWorkflow(variables: DeleteProposalWorkflowMutationVariables): Promise<DeleteProposalWorkflowMutation> {
      return withWrapper(() => client.request<DeleteProposalWorkflowMutation>(print(DeleteProposalWorkflowDocument), variables));
    },
    deleteProposalWorkflowStatus(variables: DeleteProposalWorkflowStatusMutationVariables): Promise<DeleteProposalWorkflowStatusMutation> {
      return withWrapper(() => client.request<DeleteProposalWorkflowStatusMutation>(print(DeleteProposalWorkflowStatusDocument), variables));
    },
    getProposalEvents(variables?: GetProposalEventsQueryVariables): Promise<GetProposalEventsQuery> {
      return withWrapper(() => client.request<GetProposalEventsQuery>(print(GetProposalEventsDocument), variables));
    },
    getProposalStatuses(variables?: GetProposalStatusesQueryVariables): Promise<GetProposalStatusesQuery> {
      return withWrapper(() => client.request<GetProposalStatusesQuery>(print(GetProposalStatusesDocument), variables));
    },
    getProposalWorkflow(variables: GetProposalWorkflowQueryVariables): Promise<GetProposalWorkflowQuery> {
      return withWrapper(() => client.request<GetProposalWorkflowQuery>(print(GetProposalWorkflowDocument), variables));
    },
    getProposalWorkflows(variables?: GetProposalWorkflowsQueryVariables): Promise<GetProposalWorkflowsQuery> {
      return withWrapper(() => client.request<GetProposalWorkflowsQuery>(print(GetProposalWorkflowsDocument), variables));
    },
    moveProposalWorkflowStatus(variables: MoveProposalWorkflowStatusMutationVariables): Promise<MoveProposalWorkflowStatusMutation> {
      return withWrapper(() => client.request<MoveProposalWorkflowStatusMutation>(print(MoveProposalWorkflowStatusDocument), variables));
    },
    updateProposalStatus(variables: UpdateProposalStatusMutationVariables): Promise<UpdateProposalStatusMutation> {
      return withWrapper(() => client.request<UpdateProposalStatusMutation>(print(UpdateProposalStatusDocument), variables));
    },
    updateProposalWorkflow(variables: UpdateProposalWorkflowMutationVariables): Promise<UpdateProposalWorkflowMutation> {
      return withWrapper(() => client.request<UpdateProposalWorkflowMutation>(print(UpdateProposalWorkflowDocument), variables));
    },
    addSamplesToShipment(variables: AddSamplesToShipmentMutationVariables): Promise<AddSamplesToShipmentMutation> {
      return withWrapper(() => client.request<AddSamplesToShipmentMutation>(print(AddSamplesToShipmentDocument), variables));
    },
    createShipment(variables: CreateShipmentMutationVariables): Promise<CreateShipmentMutation> {
      return withWrapper(() => client.request<CreateShipmentMutation>(print(CreateShipmentDocument), variables));
    },
    deleteShipment(variables: DeleteShipmentMutationVariables): Promise<DeleteShipmentMutation> {
      return withWrapper(() => client.request<DeleteShipmentMutation>(print(DeleteShipmentDocument), variables));
    },
    getMyShipments(variables?: GetMyShipmentsQueryVariables): Promise<GetMyShipmentsQuery> {
      return withWrapper(() => client.request<GetMyShipmentsQuery>(print(GetMyShipmentsDocument), variables));
    },
    getShipment(variables: GetShipmentQueryVariables): Promise<GetShipmentQuery> {
      return withWrapper(() => client.request<GetShipmentQuery>(print(GetShipmentDocument), variables));
    },
    getShipments(variables?: GetShipmentsQueryVariables): Promise<GetShipmentsQuery> {
      return withWrapper(() => client.request<GetShipmentsQuery>(print(GetShipmentsDocument), variables));
    },
    setActiveTemplate(variables: SetActiveTemplateMutationVariables): Promise<SetActiveTemplateMutation> {
      return withWrapper(() => client.request<SetActiveTemplateMutation>(print(SetActiveTemplateDocument), variables));
    },
    submitShipment(variables: SubmitShipmentMutationVariables): Promise<SubmitShipmentMutation> {
      return withWrapper(() => client.request<SubmitShipmentMutation>(print(SubmitShipmentDocument), variables));
    },
    updateShipment(variables: UpdateShipmentMutationVariables): Promise<UpdateShipmentMutation> {
      return withWrapper(() => client.request<UpdateShipmentMutation>(print(UpdateShipmentDocument), variables));
    },
    importTemplate(variables: ImportTemplateMutationVariables): Promise<ImportTemplateMutation> {
      return withWrapper(() => client.request<ImportTemplateMutation>(print(ImportTemplateDocument), variables));
    },
    cloneTemplate(variables: CloneTemplateMutationVariables): Promise<CloneTemplateMutation> {
      return withWrapper(() => client.request<CloneTemplateMutation>(print(CloneTemplateDocument), variables));
    },
    createQuestion(variables: CreateQuestionMutationVariables): Promise<CreateQuestionMutation> {
      return withWrapper(() => client.request<CreateQuestionMutation>(print(CreateQuestionDocument), variables));
    },
    createQuestionTemplateRelation(variables: CreateQuestionTemplateRelationMutationVariables): Promise<CreateQuestionTemplateRelationMutation> {
      return withWrapper(() => client.request<CreateQuestionTemplateRelationMutation>(print(CreateQuestionTemplateRelationDocument), variables));
    },
    createTemplate(variables: CreateTemplateMutationVariables): Promise<CreateTemplateMutation> {
      return withWrapper(() => client.request<CreateTemplateMutation>(print(CreateTemplateDocument), variables));
    },
    createTopic(variables: CreateTopicMutationVariables): Promise<CreateTopicMutation> {
      return withWrapper(() => client.request<CreateTopicMutation>(print(CreateTopicDocument), variables));
    },
    deleteQuestion(variables: DeleteQuestionMutationVariables): Promise<DeleteQuestionMutation> {
      return withWrapper(() => client.request<DeleteQuestionMutation>(print(DeleteQuestionDocument), variables));
    },
    deleteQuestionTemplateRelation(variables: DeleteQuestionTemplateRelationMutationVariables): Promise<DeleteQuestionTemplateRelationMutation> {
      return withWrapper(() => client.request<DeleteQuestionTemplateRelationMutation>(print(DeleteQuestionTemplateRelationDocument), variables));
    },
    deleteTemplate(variables: DeleteTemplateMutationVariables): Promise<DeleteTemplateMutation> {
      return withWrapper(() => client.request<DeleteTemplateMutation>(print(DeleteTemplateDocument), variables));
    },
    deleteTopic(variables: DeleteTopicMutationVariables): Promise<DeleteTopicMutation> {
      return withWrapper(() => client.request<DeleteTopicMutation>(print(DeleteTopicDocument), variables));
    },
    getActiveTemplateId(variables: GetActiveTemplateIdQueryVariables): Promise<GetActiveTemplateIdQuery> {
      return withWrapper(() => client.request<GetActiveTemplateIdQuery>(print(GetActiveTemplateIdDocument), variables));
    },
    getIsNaturalKeyPresent(variables: GetIsNaturalKeyPresentQueryVariables): Promise<GetIsNaturalKeyPresentQuery> {
      return withWrapper(() => client.request<GetIsNaturalKeyPresentQuery>(print(GetIsNaturalKeyPresentDocument), variables));
    },
    getProposalTemplates(variables?: GetProposalTemplatesQueryVariables): Promise<GetProposalTemplatesQuery> {
      return withWrapper(() => client.request<GetProposalTemplatesQuery>(print(GetProposalTemplatesDocument), variables));
    },
    getQuestions(variables?: GetQuestionsQueryVariables): Promise<GetQuestionsQuery> {
      return withWrapper(() => client.request<GetQuestionsQuery>(print(GetQuestionsDocument), variables));
    },
    getTemplate(variables: GetTemplateQueryVariables): Promise<GetTemplateQuery> {
      return withWrapper(() => client.request<GetTemplateQuery>(print(GetTemplateDocument), variables));
    },
    getTemplateCategories(variables?: GetTemplateCategoriesQueryVariables): Promise<GetTemplateCategoriesQuery> {
      return withWrapper(() => client.request<GetTemplateCategoriesQuery>(print(GetTemplateCategoriesDocument), variables));
    },
    getTemplateExport(variables: GetTemplateExportQueryVariables): Promise<GetTemplateExportQuery> {
      return withWrapper(() => client.request<GetTemplateExportQuery>(print(GetTemplateExportDocument), variables));
    },
    getTemplates(variables?: GetTemplatesQueryVariables): Promise<GetTemplatesQuery> {
      return withWrapper(() => client.request<GetTemplatesQuery>(print(GetTemplatesDocument), variables));
    },
    updateQuestion(variables: UpdateQuestionMutationVariables): Promise<UpdateQuestionMutation> {
      return withWrapper(() => client.request<UpdateQuestionMutation>(print(UpdateQuestionDocument), variables));
    },
    updateQuestionTemplateRelation(variables: UpdateQuestionTemplateRelationMutationVariables): Promise<UpdateQuestionTemplateRelationMutation> {
      return withWrapper(() => client.request<UpdateQuestionTemplateRelationMutation>(print(UpdateQuestionTemplateRelationDocument), variables));
    },
    updateQuestionTemplateRelationSettings(variables: UpdateQuestionTemplateRelationSettingsMutationVariables): Promise<UpdateQuestionTemplateRelationSettingsMutation> {
      return withWrapper(() => client.request<UpdateQuestionTemplateRelationSettingsMutation>(print(UpdateQuestionTemplateRelationSettingsDocument), variables));
    },
    updateTemplate(variables: UpdateTemplateMutationVariables): Promise<UpdateTemplateMutation> {
      return withWrapper(() => client.request<UpdateTemplateMutation>(print(UpdateTemplateDocument), variables));
    },
    updateTopic(variables: UpdateTopicMutationVariables): Promise<UpdateTopicMutation> {
      return withWrapper(() => client.request<UpdateTopicMutation>(print(UpdateTopicDocument), variables));
    },
    validateTemplateImport(variables: ValidateTemplateImportMutationVariables): Promise<ValidateTemplateImportMutation> {
      return withWrapper(() => client.request<ValidateTemplateImportMutation>(print(ValidateTemplateImportDocument), variables));
    },
    checkToken(variables: CheckTokenQueryVariables): Promise<CheckTokenQuery> {
      return withWrapper(() => client.request<CheckTokenQuery>(print(CheckTokenDocument), variables));
    },
    createUser(variables: CreateUserMutationVariables): Promise<CreateUserMutation> {
      return withWrapper(() => client.request<CreateUserMutation>(print(CreateUserDocument), variables));
    },
    createUserByEmailInvite(variables: CreateUserByEmailInviteMutationVariables): Promise<CreateUserByEmailInviteMutation> {
      return withWrapper(() => client.request<CreateUserByEmailInviteMutation>(print(CreateUserByEmailInviteDocument), variables));
    },
    deleteUser(variables: DeleteUserMutationVariables): Promise<DeleteUserMutation> {
      return withWrapper(() => client.request<DeleteUserMutation>(print(DeleteUserDocument), variables));
    },
    externalTokenLogin(variables: ExternalTokenLoginMutationVariables): Promise<ExternalTokenLoginMutation> {
      return withWrapper(() => client.request<ExternalTokenLoginMutation>(print(ExternalTokenLoginDocument), variables));
    },
    getBasicUserDetails(variables: GetBasicUserDetailsQueryVariables): Promise<GetBasicUserDetailsQuery> {
      return withWrapper(() => client.request<GetBasicUserDetailsQuery>(print(GetBasicUserDetailsDocument), variables));
    },
    getBasicUserDetailsByEmail(variables: GetBasicUserDetailsByEmailQueryVariables): Promise<GetBasicUserDetailsByEmailQuery> {
      return withWrapper(() => client.request<GetBasicUserDetailsByEmailQuery>(print(GetBasicUserDetailsByEmailDocument), variables));
    },
    getFields(variables?: GetFieldsQueryVariables): Promise<GetFieldsQuery> {
      return withWrapper(() => client.request<GetFieldsQuery>(print(GetFieldsDocument), variables));
    },
    getMyRoles(variables?: GetMyRolesQueryVariables): Promise<GetMyRolesQuery> {
      return withWrapper(() => client.request<GetMyRolesQuery>(print(GetMyRolesDocument), variables));
    },
    getOrcIDInformation(variables: GetOrcIdInformationQueryVariables): Promise<GetOrcIdInformationQuery> {
      return withWrapper(() => client.request<GetOrcIdInformationQuery>(print(GetOrcIdInformationDocument), variables));
    },
    getPreviousCollaborators(variables: GetPreviousCollaboratorsQueryVariables): Promise<GetPreviousCollaboratorsQuery> {
      return withWrapper(() => client.request<GetPreviousCollaboratorsQuery>(print(GetPreviousCollaboratorsDocument), variables));
    },
    getRoles(variables?: GetRolesQueryVariables): Promise<GetRolesQuery> {
      return withWrapper(() => client.request<GetRolesQuery>(print(GetRolesDocument), variables));
    },
    getToken(variables: GetTokenMutationVariables): Promise<GetTokenMutation> {
      return withWrapper(() => client.request<GetTokenMutation>(print(GetTokenDocument), variables));
    },
    getTokenForUser(variables: GetTokenForUserMutationVariables): Promise<GetTokenForUserMutation> {
      return withWrapper(() => client.request<GetTokenForUserMutation>(print(GetTokenForUserDocument), variables));
    },
    getUser(variables: GetUserQueryVariables): Promise<GetUserQuery> {
      return withWrapper(() => client.request<GetUserQuery>(print(GetUserDocument), variables));
    },
    getUserMe(variables?: GetUserMeQueryVariables): Promise<GetUserMeQuery> {
      return withWrapper(() => client.request<GetUserMeQuery>(print(GetUserMeDocument), variables));
    },
    getUserProposals(variables?: GetUserProposalsQueryVariables): Promise<GetUserProposalsQuery> {
      return withWrapper(() => client.request<GetUserProposalsQuery>(print(GetUserProposalsDocument), variables));
    },
    getUserWithRoles(variables: GetUserWithRolesQueryVariables): Promise<GetUserWithRolesQuery> {
      return withWrapper(() => client.request<GetUserWithRolesQuery>(print(GetUserWithRolesDocument), variables));
    },
    getUsers(variables?: GetUsersQueryVariables): Promise<GetUsersQuery> {
      return withWrapper(() => client.request<GetUsersQuery>(print(GetUsersDocument), variables));
    },
    login(variables: LoginMutationVariables): Promise<LoginMutation> {
      return withWrapper(() => client.request<LoginMutation>(print(LoginDocument), variables));
    },
    logout(variables: LogoutMutationVariables): Promise<LogoutMutation> {
      return withWrapper(() => client.request<LogoutMutation>(print(LogoutDocument), variables));
    },
    resetPassword(variables: ResetPasswordMutationVariables): Promise<ResetPasswordMutation> {
      return withWrapper(() => client.request<ResetPasswordMutation>(print(ResetPasswordDocument), variables));
    },
    resetPasswordEmail(variables: ResetPasswordEmailMutationVariables): Promise<ResetPasswordEmailMutation> {
      return withWrapper(() => client.request<ResetPasswordEmailMutation>(print(ResetPasswordEmailDocument), variables));
    },
    selectRole(variables: SelectRoleMutationVariables): Promise<SelectRoleMutation> {
      return withWrapper(() => client.request<SelectRoleMutation>(print(SelectRoleDocument), variables));
    },
    setUserEmailVerified(variables: SetUserEmailVerifiedMutationVariables): Promise<SetUserEmailVerifiedMutation> {
      return withWrapper(() => client.request<SetUserEmailVerifiedMutation>(print(SetUserEmailVerifiedDocument), variables));
    },
    setUserNotPlaceholder(variables: SetUserNotPlaceholderMutationVariables): Promise<SetUserNotPlaceholderMutation> {
      return withWrapper(() => client.request<SetUserNotPlaceholderMutation>(print(SetUserNotPlaceholderDocument), variables));
    },
    updatePassword(variables: UpdatePasswordMutationVariables): Promise<UpdatePasswordMutation> {
      return withWrapper(() => client.request<UpdatePasswordMutation>(print(UpdatePasswordDocument), variables));
    },
    updateUser(variables: UpdateUserMutationVariables): Promise<UpdateUserMutation> {
      return withWrapper(() => client.request<UpdateUserMutation>(print(UpdateUserDocument), variables));
    },
    updateUserRoles(variables: UpdateUserRolesMutationVariables): Promise<UpdateUserRolesMutation> {
      return withWrapper(() => client.request<UpdateUserRolesMutation>(print(UpdateUserRolesDocument), variables));
    },
    verifyEmail(variables: VerifyEmailMutationVariables): Promise<VerifyEmailMutation> {
      return withWrapper(() => client.request<VerifyEmailMutation>(print(VerifyEmailDocument), variables));
    },
    createVisit(variables: CreateVisitMutationVariables): Promise<CreateVisitMutation> {
      return withWrapper(() => client.request<CreateVisitMutation>(print(CreateVisitDocument), variables));
    },
    deleteVisit(variables: DeleteVisitMutationVariables): Promise<DeleteVisitMutation> {
      return withWrapper(() => client.request<DeleteVisitMutation>(print(DeleteVisitDocument), variables));
    },
    getVisit(variables: GetVisitQueryVariables): Promise<GetVisitQuery> {
      return withWrapper(() => client.request<GetVisitQuery>(print(GetVisitDocument), variables));
    },
    getVisits(variables?: GetVisitsQueryVariables): Promise<GetVisitsQuery> {
      return withWrapper(() => client.request<GetVisitsQuery>(print(GetVisitsDocument), variables));
    },
    updateVisit(variables: UpdateVisitMutationVariables): Promise<UpdateVisitMutation> {
      return withWrapper(() => client.request<UpdateVisitMutation>(print(UpdateVisitDocument), variables));
    },
    createVisitRegistrationQuestionary(variables: CreateVisitRegistrationQuestionaryMutationVariables): Promise<CreateVisitRegistrationQuestionaryMutation> {
      return withWrapper(() => client.request<CreateVisitRegistrationQuestionaryMutation>(print(CreateVisitRegistrationQuestionaryDocument), variables));
    },
    getVisitRegistration(variables: GetVisitRegistrationQueryVariables): Promise<GetVisitRegistrationQuery> {
      return withWrapper(() => client.request<GetVisitRegistrationQuery>(print(GetVisitRegistrationDocument), variables));
    },
    updateVisitRegistration(variables: UpdateVisitRegistrationMutationVariables): Promise<UpdateVisitRegistrationMutation> {
      return withWrapper(() => client.request<UpdateVisitRegistrationMutation>(print(UpdateVisitRegistrationDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;