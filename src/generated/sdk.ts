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
  /** DateTime without timezone in 'yyyy-MM-dd HH:mm:ss' format */
  TzLessDateTime: string;
};

export type ActivateScheduledEventInput = {
  id: Scalars['Int'];
};

export type AddProposalWorkflowStatusInput = {
  droppableGroupId: Scalars['String'];
  nextProposalStatusId?: Maybe<Scalars['Int']>;
  parentDroppableGroupId?: Maybe<Scalars['String']>;
  prevProposalStatusId?: Maybe<Scalars['Int']>;
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
};

export type AddStatusChangingEventsToConnectionInput = {
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']>;
};

export type AddTechnicalReviewInput = {
  comment?: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  publicComment?: Maybe<Scalars['String']>;
  reviewerId?: Maybe<Scalars['Int']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted?: Maybe<Scalars['Boolean']>;
  timeAllocation?: Maybe<Scalars['Int']>;
};

export type AddUserRoleResponseWrap = {
  __typename?: 'AddUserRoleResponseWrap';
  rejection: Maybe<Rejection>;
  success: Maybe<Scalars['Boolean']>;
};

export enum AllocationTimeUnits {
  DAY = 'Day',
  HOUR = 'Hour'
}

export type Answer = {
  __typename?: 'Answer';
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
  __typename?: 'AnswerBasic';
  answer: Scalars['IntStringDateBoolArray'];
  answerId: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  questionId: Scalars['String'];
  questionaryId: Scalars['Int'];
};

export type AnswerInput = {
  questionId: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type ApiAccessTokenResponseWrap = {
  __typename?: 'ApiAccessTokenResponseWrap';
  apiAccessToken: Maybe<PermissionsWithAccessToken>;
  rejection: Maybe<Rejection>;
};

export type AssignChairOrSecretaryToSepInput = {
  roleId: UserRole;
  sepId: Scalars['Int'];
  userId: Scalars['Int'];
};

export type AssignEquipmentsToScheduledEventInput = {
  equipmentIds: Array<Scalars['Int']>;
  proposalBookingId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
};

export type AssignInstrumentsToCallInput = {
  callId: Scalars['Int'];
  instrumentIds: Array<Scalars['Int']>;
};

export type AuthJwtApiTokenPayload = {
  __typename?: 'AuthJwtApiTokenPayload';
  accessTokenId: Scalars['String'];
};

export type AuthJwtPayload = {
  __typename?: 'AuthJwtPayload';
  currentRole: Role;
  roles: Array<Role>;
  user: User;
};

export type BasicUserDetails = {
  __typename?: 'BasicUserDetails';
  created: Maybe<Scalars['DateTime']>;
  firstname: Scalars['String'];
  id: Scalars['Int'];
  lastname: Scalars['String'];
  organisation: Scalars['String'];
  placeholder: Maybe<Scalars['Boolean']>;
  position: Scalars['String'];
};

export type BasicUserDetailsResponseWrap = {
  __typename?: 'BasicUserDetailsResponseWrap';
  rejection: Maybe<Rejection>;
  user: Maybe<BasicUserDetails>;
};

export type BooleanConfig = {
  __typename?: 'BooleanConfig';
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type BulkUpsertLostTimesInput = {
  lostTimes: Array<SimpleLostTimeInput>;
  proposalBookingId: Scalars['Int'];
};

export type Call = {
  __typename?: 'Call';
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
  proposalCount: Scalars['Int'];
  proposalSequence: Maybe<Scalars['Int']>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  proposalWorkflowId: Maybe<Scalars['Int']>;
  referenceNumberFormat: Maybe<Scalars['String']>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview: Maybe<Scalars['DateTime']>;
  surveyComment: Scalars['String'];
  template: Template;
  templateId: Scalars['Int'];
  title: Maybe<Scalars['String']>;
};

export type CallResponseWrap = {
  __typename?: 'CallResponseWrap';
  call: Maybe<Call>;
  rejection: Maybe<Rejection>;
};

export type CallsFilter = {
  isActive?: Maybe<Scalars['Boolean']>;
  isEnded?: Maybe<Scalars['Boolean']>;
  isReviewEnded?: Maybe<Scalars['Boolean']>;
  isSEPReviewEnded?: Maybe<Scalars['Boolean']>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
};

export type ChangeProposalsStatusInput = {
  proposals: Array<ProposalPkWithCallId>;
  statusId: Scalars['Int'];
};

export type CheckExternalTokenWrap = {
  __typename?: 'CheckExternalTokenWrap';
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type CloneProposalsInput = {
  callId: Scalars['Int'];
  proposalsToClonePk: Array<Scalars['Int']>;
};

export type ConfirmEquipmentAssignmentInput = {
  equipmentId: Scalars['Int'];
  newStatus: EquipmentAssignmentStatus;
  scheduledEventId: Scalars['Int'];
};

export type CreateApiAccessTokenInput = {
  accessPermissions: Scalars['String'];
  name: Scalars['String'];
};

export type CreateCallInput = {
  allocationTimeUnit: AllocationTimeUnits;
  cycleComment: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  endCall: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  endSEPReview?: Maybe<Scalars['DateTime']>;
  esiTemplateId?: Maybe<Scalars['Int']>;
  proposalSequence?: Maybe<Scalars['Int']>;
  proposalWorkflowId: Scalars['Int'];
  referenceNumberFormat?: Maybe<Scalars['String']>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  surveyComment: Scalars['String'];
  templateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
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
  __typename?: 'CreateUserByEmailInviteResponseWrap';
  id: Maybe<Scalars['Int']>;
  rejection: Maybe<Rejection>;
};

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
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
  __typename?: 'DateConfig';
  defaultDate: Maybe<Scalars['String']>;
  includeTime: Scalars['Boolean'];
  maxDate: Maybe<Scalars['String']>;
  minDate: Maybe<Scalars['String']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};


export type DbStat = {
  __typename?: 'DbStat';
  state: Maybe<Scalars['String']>;
  total: Scalars['Float'];
};

export type DeleteApiAccessTokenInput = {
  accessTokenId: Scalars['String'];
};

export type DeleteEquipmentAssignmentInput = {
  equipmentId: Scalars['Int'];
  proposalBookingId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
};

export type DeleteProposalWorkflowStatusInput = {
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
};

export type DeleteScheduledEventsInput = {
  ids: Array<Scalars['Int']>;
  instrumentId: Scalars['Int'];
  proposalBookingId: Scalars['Int'];
};

export enum DependenciesLogicOperator {
  AND = 'AND',
  OR = 'OR'
}

export type EmailVerificationResponseWrap = {
  __typename?: 'EmailVerificationResponseWrap';
  rejection: Maybe<Rejection>;
  success: Maybe<Scalars['Boolean']>;
};

export type EmbellishmentConfig = {
  __typename?: 'EmbellishmentConfig';
  html: Scalars['String'];
  omitFromPdf: Scalars['Boolean'];
  plain: Scalars['String'];
};

export type Entry = {
  __typename?: 'Entry';
  id: Scalars['Int'];
  value: Scalars['String'];
};

export type Equipment = {
  __typename?: 'Equipment';
  autoAccept: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  description: Maybe<Scalars['String']>;
  equipmentResponsible: Array<User>;
  events: Array<ScheduledEvent>;
  id: Scalars['Int'];
  maintenanceEndsAt: Maybe<Scalars['TzLessDateTime']>;
  maintenanceStartsAt: Maybe<Scalars['TzLessDateTime']>;
  name: Scalars['String'];
  owner: Maybe<User>;
  updatedAt: Scalars['DateTime'];
};


export type EquipmentEventsArgs = {
  endsAt: Scalars['TzLessDateTime'];
  startsAt: Scalars['TzLessDateTime'];
};

export enum EquipmentAssignmentStatus {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export type EquipmentInput = {
  autoAccept: Scalars['Boolean'];
  description: Scalars['String'];
  maintenanceEndsAt?: Maybe<Scalars['TzLessDateTime']>;
  maintenanceStartsAt?: Maybe<Scalars['TzLessDateTime']>;
  name: Scalars['String'];
};

export type EquipmentResponseWrap = {
  __typename?: 'EquipmentResponseWrap';
  equipment: Maybe<Equipment>;
  error: Maybe<Scalars['String']>;
};

export type EquipmentResponsibleInput = {
  equipmentId: Scalars['Int'];
  userIds: Array<Scalars['Int']>;
};

export type EquipmentWithAssignmentStatus = {
  __typename?: 'EquipmentWithAssignmentStatus';
  autoAccept: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  description: Maybe<Scalars['String']>;
  equipmentResponsible: Array<User>;
  events: Array<ScheduledEvent>;
  id: Scalars['Int'];
  maintenanceEndsAt: Maybe<Scalars['TzLessDateTime']>;
  maintenanceStartsAt: Maybe<Scalars['TzLessDateTime']>;
  name: Scalars['String'];
  owner: Maybe<User>;
  status: EquipmentAssignmentStatus;
  updatedAt: Scalars['DateTime'];
};


export type EquipmentWithAssignmentStatusEventsArgs = {
  endsAt: Scalars['TzLessDateTime'];
  startsAt: Scalars['TzLessDateTime'];
};

export type EsiResponseWrap = {
  __typename?: 'EsiResponseWrap';
  esi: Maybe<ExperimentSafetyInput>;
  rejection: Maybe<Rejection>;
};

export enum EvaluatorOperator {
  EQ = 'eq',
  NEQ = 'neq'
}

export enum Event {
  CALL_ENDED = 'CALL_ENDED',
  CALL_REVIEW_ENDED = 'CALL_REVIEW_ENDED',
  CALL_SEP_REVIEW_ENDED = 'CALL_SEP_REVIEW_ENDED',
  EMAIL_INVITE = 'EMAIL_INVITE',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_ALL_SEP_REVIEWERS_SELECTED = 'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
  PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED = 'PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED',
  PROPOSAL_BOOKING_TIME_ACTIVATED = 'PROPOSAL_BOOKING_TIME_ACTIVATED',
  PROPOSAL_BOOKING_TIME_COMPLETED = 'PROPOSAL_BOOKING_TIME_COMPLETED',
  PROPOSAL_BOOKING_TIME_SLOTS_REMOVED = 'PROPOSAL_BOOKING_TIME_SLOTS_REMOVED',
  PROPOSAL_BOOKING_TIME_SLOT_ADDED = 'PROPOSAL_BOOKING_TIME_SLOT_ADDED',
  PROPOSAL_BOOKING_TIME_UPDATED = 'PROPOSAL_BOOKING_TIME_UPDATED',
  PROPOSAL_CLONED = 'PROPOSAL_CLONED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
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
  SEP_UPDATED = 'SEP_UPDATED',
  TOPIC_ANSWERED = 'TOPIC_ANSWERED',
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
  USER_PASSWORD_RESET_EMAIL = 'USER_PASSWORD_RESET_EMAIL',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_UPDATED = 'USER_UPDATED'
}

export type EventLog = {
  __typename?: 'EventLog';
  changedBy: User;
  changedObjectId: Scalars['String'];
  eventTStamp: Scalars['DateTime'];
  eventType: Scalars['String'];
  id: Scalars['Int'];
  rowData: Scalars['String'];
};

export type ExperimentSafetyInput = {
  __typename?: 'ExperimentSafetyInput';
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

export type Feature = {
  __typename?: 'Feature';
  description: Scalars['String'];
  id: FeatureId;
  isEnabled: Scalars['Boolean'];
};

export enum FeatureId {
  EXTERNAL_AUTH = 'EXTERNAL_AUTH',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  SCHEDULER = 'SCHEDULER',
  SHIPPING = 'SHIPPING'
}

export type FieldCondition = {
  __typename?: 'FieldCondition';
  condition: EvaluatorOperator;
  params: Scalars['IntStringDateBoolArray'];
};

export type FieldConditionInput = {
  condition: EvaluatorOperator;
  params: Scalars['String'];
};

export type FieldConfig = BooleanConfig | DateConfig | EmbellishmentConfig | FileUploadConfig | GenericTemplateBasisConfig | IntervalConfig | NumberInputConfig | ProposalBasisConfig | ProposalEsiBasisConfig | RichTextInputConfig | SampleBasisConfig | SampleDeclarationConfig | SampleEsiBasisConfig | SelectionFromOptionsConfig | ShipmentBasisConfig | SubTemplateConfig | TextInputConfig | VisitBasisConfig;

export type FieldDependency = {
  __typename?: 'FieldDependency';
  condition: FieldCondition;
  dependencyId: Scalars['String'];
  dependencyNaturalKey: Scalars['String'];
  questionId: Scalars['String'];
};

export type FieldDependencyInput = {
  condition: FieldConditionInput;
  dependencyId: Scalars['String'];
};

export type Fields = {
  __typename?: 'Fields';
  countries: Array<Entry>;
  nationalities: Array<Entry>;
};

export type FileMetadata = {
  __typename?: 'FileMetadata';
  createdDate: Scalars['DateTime'];
  fileId: Scalars['String'];
  mimeType: Scalars['String'];
  originalFileName: Scalars['String'];
  sizeInBytes: Scalars['Int'];
};

export type FileUploadConfig = {
  __typename?: 'FileUploadConfig';
  file_type: Array<Scalars['String']>;
  max_files: Scalars['Int'];
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type FinalizeScheduledEventInput = {
  action: ProposalBookingFinalizeAction;
  id: Scalars['Int'];
};

export type GenericTemplate = {
  __typename?: 'GenericTemplate';
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
  __typename?: 'GenericTemplateBasisConfig';
  questionLabel: Scalars['String'];
  titlePlaceholder: Scalars['String'];
};

export type GenericTemplateResponseWrap = {
  __typename?: 'GenericTemplateResponseWrap';
  genericTemplate: Maybe<GenericTemplate>;
  rejection: Maybe<Rejection>;
};

export type GenericTemplatesFilter = {
  creatorId?: Maybe<Scalars['Int']>;
  genericTemplateIds?: Maybe<Array<Scalars['Int']>>;
  proposalPk?: Maybe<Scalars['Int']>;
  questionId?: Maybe<Scalars['String']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  title?: Maybe<Scalars['String']>;
};

export type HealthStats = {
  __typename?: 'HealthStats';
  dbStats: Array<DbStat>;
  message: Scalars['String'];
};

export type IndexWithGroupId = {
  droppableId: Scalars['String'];
  index: Scalars['Int'];
};

export type Institution = {
  __typename?: 'Institution';
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type InstitutionResponseWrap = {
  __typename?: 'InstitutionResponseWrap';
  institution: Maybe<Institution>;
  rejection: Maybe<Rejection>;
};

export type InstitutionsFilter = {
  isVerified?: Maybe<Scalars['Boolean']>;
};

export type Instrument = {
  __typename?: 'Instrument';
  description: Scalars['String'];
  id: Scalars['Int'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  scientists: Array<BasicUserDetails>;
  shortCode: Scalars['String'];
};

export type InstrumentResponseWrap = {
  __typename?: 'InstrumentResponseWrap';
  instrument: Maybe<Instrument>;
  rejection: Maybe<Rejection>;
};

export type InstrumentWithAvailabilityTime = {
  __typename?: 'InstrumentWithAvailabilityTime';
  availabilityTime: Maybe<Scalars['Int']>;
  description: Scalars['String'];
  id: Scalars['Int'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  scientists: Array<BasicUserDetails>;
  shortCode: Scalars['String'];
  submitted: Maybe<Scalars['Boolean']>;
};

export type InstrumentsQueryResult = {
  __typename?: 'InstrumentsQueryResult';
  instruments: Array<Instrument>;
  totalCount: Scalars['Int'];
};


export type IntervalConfig = {
  __typename?: 'IntervalConfig';
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  units: Maybe<Array<Scalars['String']>>;
};

export type LostTime = {
  __typename?: 'LostTime';
  createdAt: Scalars['DateTime'];
  endsAt: Scalars['TzLessDateTime'];
  id: Scalars['Int'];
  proposalBookingId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
  startsAt: Scalars['TzLessDateTime'];
  updatedAt: Scalars['DateTime'];
};

export type LostTimesResponseWrap = {
  __typename?: 'LostTimesResponseWrap';
  error: Maybe<Scalars['String']>;
  lostTime: Maybe<Array<LostTime>>;
};

export type MoveProposalWorkflowStatusInput = {
  from: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
  to: IndexWithGroupId;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateProposalBooking: ProposalBookingResponseWrap;
  activateScheduledEvent: ScheduledEventResponseWrap;
  addClientLog: SuccessResponseWrap;
  addEquipmentResponsible: Scalars['Boolean'];
  addProposalWorkflowStatus: ProposalWorkflowConnectionResponseWrap;
  addReview: ReviewWithNextStatusResponseWrap;
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
  assignToScheduledEvents: Scalars['Boolean'];
  bulkUpsertLostTimes: LostTimesResponseWrap;
  changeProposalsStatus: SuccessResponseWrap;
  checkExternalToken: CheckExternalTokenWrap;
  cloneGenericTemplate: GenericTemplateResponseWrap;
  cloneProposals: ProposalsResponseWrap;
  cloneSample: SampleResponseWrap;
  cloneTemplate: TemplateResponseWrap;
  confirmEquipmentAssignment: Scalars['Boolean'];
  createApiAccessToken: ApiAccessTokenResponseWrap;
  createCall: CallResponseWrap;
  createEquipment: EquipmentResponseWrap;
  createEsi: EsiResponseWrap;
  createGenericTemplate: GenericTemplateResponseWrap;
  createInstitution: InstitutionResponseWrap;
  createInstrument: InstrumentResponseWrap;
  createProposal: ProposalResponseWrap;
  createProposalStatus: ProposalStatusResponseWrap;
  createProposalWorkflow: ProposalWorkflowResponseWrap;
  createQuestion: QuestionResponseWrap;
  createQuestionTemplateRelation: TemplateResponseWrap;
  createQuestionary: QuestionaryResponseWrap;
  createSEP: SepResponseWrap;
  createSample: SampleResponseWrap;
  createSampleEsi: SampleEsiResponseWrap;
  createScheduledEvent: ScheduledEventResponseWrap;
  createShipment: ShipmentResponseWrap;
  createTemplate: TemplateResponseWrap;
  createTopic: TemplateResponseWrap;
  createUnit: UnitResponseWrap;
  createUser: UserResponseWrap;
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap;
  createVisit: VisitResponseWrap;
  createVisitRegistrationQuestionary: VisitRegistrationResponseWrap;
  deleteApiAccessToken: SuccessResponseWrap;
  deleteCall: CallResponseWrap;
  deleteEquipmentAssignment: Scalars['Boolean'];
  deleteGenericTemplate: GenericTemplateResponseWrap;
  deleteInstitution: InstitutionResponseWrap;
  deleteInstrument: InstrumentResponseWrap;
  deleteProposal: ProposalResponseWrap;
  deleteProposalStatus: ProposalStatusResponseWrap;
  deleteProposalWorkflow: ProposalWorkflowResponseWrap;
  deleteProposalWorkflowStatus: SuccessResponseWrap;
  deleteQuestion: QuestionResponseWrap;
  deleteQuestionTemplateRelation: TemplateResponseWrap;
  deleteSEP: SepResponseWrap;
  deleteSample: SampleResponseWrap;
  deleteSampleEsi: SampleEsiResponseWrap;
  deleteScheduledEvents: ScheduledEventsResponseWrap;
  deleteShipment: ShipmentResponseWrap;
  deleteTemplate: TemplateResponseWrap;
  deleteTopic: TemplateResponseWrap;
  deleteUnit: UnitResponseWrap;
  deleteUser: UserResponseWrap;
  deleteVisit: VisitResponseWrap;
  emailVerification: EmailVerificationResponseWrap;
  finalizeProposalBooking: ProposalBookingResponseWrap;
  finalizeScheduledEvent: ScheduledEventResponseWrap;
  getTokenForUser: TokenResponseWrap;
  login: TokenResponseWrap;
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
  resetPassword: BasicUserDetailsResponseWrap;
  resetPasswordEmail: SuccessResponseWrap;
  resetSchedulerDb: Scalars['String'];
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
  submitTechnicalReview: TechnicalReviewResponseWrap;
  token: TokenResponseWrap;
  updateAnswer: UpdateAnswerResponseWrap;
  updateApiAccessToken: ApiAccessTokenResponseWrap;
  updateCall: CallResponseWrap;
  updateEquipment: EquipmentResponseWrap;
  updateEsi: EsiResponseWrap;
  updateGenericTemplate: GenericTemplateResponseWrap;
  updateInstitution: InstitutionResponseWrap;
  updateInstrument: InstrumentResponseWrap;
  updatePassword: BasicUserDetailsResponseWrap;
  updateProposal: ProposalResponseWrap;
  updateProposalStatus: ProposalStatusResponseWrap;
  updateProposalWorkflow: ProposalWorkflowResponseWrap;
  updateQuestion: QuestionResponseWrap;
  updateQuestionTemplateRelation: TemplateResponseWrap;
  updateQuestionTemplateRelationSettings: TemplateResponseWrap;
  updateSEP: SepResponseWrap;
  updateSEPTimeAllocation: SepProposalResponseWrap;
  updateSample: SampleResponseWrap;
  updateSampleEsi: SampleEsiResponseWrap;
  updateScheduledEvent: ScheduledEventResponseWrap;
  updateShipment: ShipmentResponseWrap;
  updateTechnicalReviewAssignee: ProposalsResponseWrap;
  updateTemplate: TemplateResponseWrap;
  updateTopic: TemplateResponseWrap;
  updateUser: UserResponseWrap;
  updateUserRoles: UserResponseWrap;
  updateVisit: VisitResponseWrap;
  updateVisitRegistration: VisitRegistrationResponseWrap;
};


export type MutationActivateProposalBookingArgs = {
  id: Scalars['Int'];
};


export type MutationActivateScheduledEventArgs = {
  activateScheduledEvent: ActivateScheduledEventInput;
};


export type MutationAddClientLogArgs = {
  error: Scalars['String'];
};


export type MutationAddEquipmentResponsibleArgs = {
  equipmentResponsibleInput: EquipmentResponsibleInput;
};


export type MutationAddProposalWorkflowStatusArgs = {
  newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput;
};


export type MutationAddReviewArgs = {
  comment: Scalars['String'];
  grade: Scalars['Int'];
  reviewID: Scalars['Int'];
  sepID: Scalars['Int'];
  status: ReviewStatus;
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
  commentForManagement?: Maybe<Scalars['String']>;
  commentForUser?: Maybe<Scalars['String']>;
  finalStatus?: Maybe<ProposalEndStatus>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
  managementTimeAllocation?: Maybe<Scalars['Int']>;
  proposalPk: Scalars['Int'];
  statusId?: Maybe<Scalars['Int']>;
};


export type MutationAnswerTopicArgs = {
  answers: Array<AnswerInput>;
  isPartialSave?: Maybe<Scalars['Boolean']>;
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


export type MutationAssignToScheduledEventsArgs = {
  assignEquipmentsToScheduledEventInput: AssignEquipmentsToScheduledEventInput;
};


export type MutationBulkUpsertLostTimesArgs = {
  bulkUpsertLostTimes: BulkUpsertLostTimesInput;
};


export type MutationChangeProposalsStatusArgs = {
  changeProposalsStatusInput: ChangeProposalsStatusInput;
};


export type MutationCheckExternalTokenArgs = {
  externalToken: Scalars['String'];
};


export type MutationCloneGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
};


export type MutationCloneProposalsArgs = {
  cloneProposalsInput: CloneProposalsInput;
};


export type MutationCloneSampleArgs = {
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
};


export type MutationCloneTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationConfirmEquipmentAssignmentArgs = {
  confirmEquipmentAssignmentInput: ConfirmEquipmentAssignmentInput;
};


export type MutationCreateApiAccessTokenArgs = {
  createApiAccessTokenInput: CreateApiAccessTokenInput;
};


export type MutationCreateCallArgs = {
  createCallInput: CreateCallInput;
};


export type MutationCreateEquipmentArgs = {
  newEquipmentInput: EquipmentInput;
};


export type MutationCreateEsiArgs = {
  scheduledEventId: Scalars['Int'];
};


export type MutationCreateGenericTemplateArgs = {
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationCreateInstitutionArgs = {
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};


export type MutationCreateInstrumentArgs = {
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
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
  numberRatingsRequired?: Maybe<Scalars['Int']>;
};


export type MutationCreateSampleArgs = {
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationCreateSampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type MutationCreateScheduledEventArgs = {
  newScheduledEvent: NewScheduledEventInput;
};


export type MutationCreateShipmentArgs = {
  proposalPk: Scalars['Int'];
  title: Scalars['String'];
  visitId: Scalars['Int'];
};


export type MutationCreateTemplateArgs = {
  description?: Maybe<Scalars['String']>;
  groupId: TemplateGroupId;
  name: Scalars['String'];
};


export type MutationCreateTopicArgs = {
  sortOrder?: Maybe<Scalars['Int']>;
  templateId: Scalars['Int'];
  title?: Maybe<Scalars['Int']>;
};


export type MutationCreateUnitArgs = {
  name: Scalars['String'];
};


export type MutationCreateUserArgs = {
  birthdate: Scalars['String'];
  department: Scalars['String'];
  email: Scalars['String'];
  firstname: Scalars['String'];
  gender: Scalars['String'];
  lastname: Scalars['String'];
  middlename?: Maybe<Scalars['String']>;
  nationality: Scalars['Int'];
  orcid: Scalars['String'];
  orcidHash: Scalars['String'];
  organisation: Scalars['Int'];
  otherOrganisation?: Maybe<Scalars['String']>;
  password: Scalars['String'];
  position: Scalars['String'];
  preferredname?: Maybe<Scalars['String']>;
  refreshToken: Scalars['String'];
  telephone: Scalars['String'];
  telephone_alt?: Maybe<Scalars['String']>;
  user_title?: Maybe<Scalars['String']>;
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


export type MutationCreateVisitRegistrationQuestionaryArgs = {
  visitId: Scalars['Int'];
};


export type MutationDeleteApiAccessTokenArgs = {
  deleteApiAccessTokenInput: DeleteApiAccessTokenInput;
};


export type MutationDeleteCallArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteEquipmentAssignmentArgs = {
  deleteEquipmentAssignmentInput: DeleteEquipmentAssignmentInput;
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


export type MutationDeleteScheduledEventsArgs = {
  deleteScheduledEventsInput: DeleteScheduledEventsInput;
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


export type MutationFinalizeProposalBookingArgs = {
  action: ProposalBookingFinalizeAction;
  id: Scalars['Int'];
};


export type MutationFinalizeScheduledEventArgs = {
  finalizeScheduledEvent: FinalizeScheduledEventInput;
};


export type MutationGetTokenForUserArgs = {
  userId: Scalars['Int'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationMoveProposalWorkflowStatusArgs = {
  moveProposalWorkflowStatusInput: MoveProposalWorkflowStatusInput;
};


export type MutationNotifyProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type MutationPrepareDbArgs = {
  includeSeeds?: Maybe<Scalars['Boolean']>;
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


export type MutationResetPasswordArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationResetPasswordEmailArgs = {
  email: Scalars['String'];
};


export type MutationResetSchedulerDbArgs = {
  includeSeeds?: Maybe<Scalars['Boolean']>;
};


export type MutationSaveSepMeetingDecisionArgs = {
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
};


export type MutationSelectRoleArgs = {
  selectedRoleId?: Maybe<Scalars['Int']>;
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


export type MutationSubmitTechnicalReviewArgs = {
  submitTechnicalReviewInput: SubmitTechnicalReviewInput;
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


export type MutationUpdateEquipmentArgs = {
  id: Scalars['Int'];
  updateEquipmentInput: EquipmentInput;
};


export type MutationUpdateEsiArgs = {
  esiId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
  safetyComment?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationUpdateInstitutionArgs = {
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
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


export type MutationUpdateProposalArgs = {
  abstract?: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  proposerId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']>>;
};


export type MutationUpdateProposalStatusArgs = {
  updatedProposalStatusInput: UpdateProposalStatusInput;
};


export type MutationUpdateProposalWorkflowArgs = {
  updatedProposalWorkflowInput: UpdateProposalWorkflowInput;
};


export type MutationUpdateQuestionArgs = {
  config?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  naturalKey?: Maybe<Scalars['String']>;
  question?: Maybe<Scalars['String']>;
};


export type MutationUpdateQuestionTemplateRelationArgs = {
  config?: Maybe<Scalars['String']>;
  questionId: Scalars['String'];
  sortOrder: Scalars['Int'];
  templateId: Scalars['Int'];
  topicId?: Maybe<Scalars['Int']>;
};


export type MutationUpdateQuestionTemplateRelationSettingsArgs = {
  config?: Maybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput>;
  dependenciesOperator?: Maybe<DependenciesLogicOperator>;
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
};


export type MutationUpdateSepArgs = {
  active: Scalars['Boolean'];
  code: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Int'];
  numberRatingsRequired?: Maybe<Scalars['Int']>;
};


export type MutationUpdateSepTimeAllocationArgs = {
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
  sepTimeAllocation?: Maybe<Scalars['Int']>;
};


export type MutationUpdateSampleArgs = {
  safetyComment?: Maybe<Scalars['String']>;
  safetyStatus?: Maybe<SampleStatus>;
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
};


export type MutationUpdateSampleEsiArgs = {
  esiId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
  sampleId: Scalars['Int'];
};


export type MutationUpdateScheduledEventArgs = {
  updateScheduledEvent: UpdateScheduledEventInput;
};


export type MutationUpdateShipmentArgs = {
  externalRef?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
  shipmentId: Scalars['Int'];
  status?: Maybe<ShipmentStatus>;
  title?: Maybe<Scalars['String']>;
};


export type MutationUpdateTechnicalReviewAssigneeArgs = {
  proposalPks: Array<Scalars['Int']>;
  userId: Scalars['Int'];
};


export type MutationUpdateTemplateArgs = {
  description?: Maybe<Scalars['String']>;
  isArchived?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  templateId: Scalars['Int'];
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'];
  isEnabled?: Maybe<Scalars['Boolean']>;
  sortOrder?: Maybe<Scalars['Int']>;
  templateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationUpdateUserArgs = {
  birthdate?: Maybe<Scalars['String']>;
  department?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  firstname?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  lastname?: Maybe<Scalars['String']>;
  middlename?: Maybe<Scalars['String']>;
  nationality?: Maybe<Scalars['Int']>;
  orcid?: Maybe<Scalars['String']>;
  organisation?: Maybe<Scalars['Int']>;
  placeholder?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['String']>;
  preferredname?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Scalars['Int']>>;
  telephone?: Maybe<Scalars['String']>;
  telephone_alt?: Maybe<Scalars['String']>;
  user_title?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};


export type MutationUpdateUserRolesArgs = {
  id: Scalars['Int'];
  roles?: Maybe<Array<Scalars['Int']>>;
};


export type MutationUpdateVisitArgs = {
  status?: Maybe<VisitStatus>;
  team?: Maybe<Array<Scalars['Int']>>;
  teamLeadUserId?: Maybe<Scalars['Int']>;
  visitId: Scalars['Int'];
};


export type MutationUpdateVisitRegistrationArgs = {
  isRegistrationSubmitted?: Maybe<Scalars['Boolean']>;
  trainingExpiryDate?: Maybe<Scalars['DateTime']>;
  visitId: Scalars['Int'];
};

export type NewScheduledEventInput = {
  bookingType: ScheduledEventBookingType;
  description?: Maybe<Scalars['String']>;
  endsAt: Scalars['TzLessDateTime'];
  instrumentId: Scalars['Int'];
  proposalBookingId?: Maybe<Scalars['Int']>;
  startsAt: Scalars['TzLessDateTime'];
};

export type NextProposalStatus = {
  __typename?: 'NextProposalStatus';
  description: Maybe<Scalars['String']>;
  id: Maybe<Scalars['Int']>;
  isDefault: Maybe<Scalars['Boolean']>;
  name: Maybe<Scalars['String']>;
  shortCode: Maybe<Scalars['String']>;
};

export type NextProposalStatusResponseWrap = {
  __typename?: 'NextProposalStatusResponseWrap';
  nextProposalStatus: Maybe<NextProposalStatus>;
  rejection: Maybe<Rejection>;
};

export type NumberInputConfig = {
  __typename?: 'NumberInputConfig';
  numberValueConstraint: Maybe<NumberValueConstraint>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  units: Maybe<Array<Scalars['String']>>;
};

export enum NumberValueConstraint {
  NONE = 'NONE',
  ONLY_NEGATIVE = 'ONLY_NEGATIVE',
  ONLY_POSITIVE = 'ONLY_POSITIVE'
}

export type OrcIdInformation = {
  __typename?: 'OrcIDInformation';
  firstname: Maybe<Scalars['String']>;
  lastname: Maybe<Scalars['String']>;
  orcid: Maybe<Scalars['String']>;
  orcidHash: Maybe<Scalars['String']>;
  refreshToken: Maybe<Scalars['String']>;
  token: Maybe<Scalars['String']>;
};

export type Page = {
  __typename?: 'Page';
  content: Maybe<Scalars['String']>;
  id: Scalars['Int'];
};

export enum PageName {
  COOKIEPAGE = 'COOKIEPAGE',
  FOOTERCONTENT = 'FOOTERCONTENT',
  HELPPAGE = 'HELPPAGE',
  HOMEPAGE = 'HOMEPAGE',
  PRIVACYPAGE = 'PRIVACYPAGE',
  REVIEWPAGE = 'REVIEWPAGE'
}

export type PageResponseWrap = {
  __typename?: 'PageResponseWrap';
  page: Maybe<Page>;
  rejection: Maybe<Rejection>;
};

export type PermissionsWithAccessToken = {
  __typename?: 'PermissionsWithAccessToken';
  accessPermissions: Scalars['String'];
  accessToken: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};

export type PrepareDbResponseWrap = {
  __typename?: 'PrepareDBResponseWrap';
  log: Maybe<Scalars['String']>;
  rejection: Maybe<Rejection>;
};

export type Proposal = {
  __typename?: 'Proposal';
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
  proposalBooking: Maybe<ProposalBooking>;
  proposalBookingCore: Maybe<ProposalBookingCore>;
  proposalId: Scalars['String'];
  proposer: Maybe<BasicUserDetails>;
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
  technicalReviewAssignee: Maybe<Scalars['Int']>;
  title: Scalars['String'];
  updated: Scalars['DateTime'];
  users: Array<BasicUserDetails>;
  visits: Maybe<Array<Visit>>;
};


export type ProposalProposalBookingArgs = {
  filter?: Maybe<ProposalProposalBookingFilter>;
};


export type ProposalProposalBookingCoreArgs = {
  filter?: Maybe<ProposalBookingFilter>;
};

export type ProposalBasisConfig = {
  __typename?: 'ProposalBasisConfig';
  tooltip: Scalars['String'];
};

export type ProposalBooking = {
  __typename?: 'ProposalBooking';
  allocatedTime: Scalars['Int'];
  call: Maybe<Call>;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  instrument: Maybe<Instrument>;
  proposal: Maybe<Proposal>;
  scheduledEvents: Array<ScheduledEvent>;
  status: ProposalBookingStatusCore;
  updatedAt: Scalars['DateTime'];
};


export type ProposalBookingScheduledEventsArgs = {
  filter: ProposalBookingScheduledEventFilter;
};

export type ProposalBookingCore = {
  __typename?: 'ProposalBookingCore';
  id: Scalars['Int'];
  scheduledEvents: Array<ScheduledEventCore>;
};


export type ProposalBookingCoreScheduledEventsArgs = {
  filter: ProposalBookingScheduledEventFilterCore;
};

export type ProposalBookingFilter = {
  status?: Maybe<Array<ProposalBookingStatusCore>>;
};

export enum ProposalBookingFinalizeAction {
  COMPLETE = 'COMPLETE',
  RESTART = 'RESTART'
}

export type ProposalBookingResponseWrap = {
  __typename?: 'ProposalBookingResponseWrap';
  error: Maybe<Scalars['String']>;
  proposalBooking: Maybe<ProposalBooking>;
};

export type ProposalBookingScheduledEventFilter = {
  bookingType?: Maybe<ScheduledEventBookingType>;
  endsAfter?: Maybe<Scalars['TzLessDateTime']>;
  endsBefore?: Maybe<Scalars['TzLessDateTime']>;
};

export type ProposalBookingScheduledEventFilterCore = {
  bookingType?: Maybe<ScheduledEventBookingType>;
  endsAfter?: Maybe<Scalars['TzLessDateTime']>;
  endsBefore?: Maybe<Scalars['TzLessDateTime']>;
  status?: Maybe<Array<ProposalBookingStatusCore>>;
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
  __typename?: 'ProposalEsiBasisConfig';
  tooltip: Scalars['String'];
};

export type ProposalEvent = {
  __typename?: 'ProposalEvent';
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

export type ProposalProposalBookingFilter = {
  status?: Maybe<Array<ProposalBookingStatusCore>>;
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
  __typename?: 'ProposalResponseWrap';
  proposal: Maybe<Proposal>;
  rejection: Maybe<Rejection>;
};

export type ProposalStatus = {
  __typename?: 'ProposalStatus';
  description: Scalars['String'];
  id: Scalars['Int'];
  isDefault: Scalars['Boolean'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
};

export type ProposalStatusChangingEventResponseWrap = {
  __typename?: 'ProposalStatusChangingEventResponseWrap';
  rejection: Maybe<Rejection>;
  statusChangingEvents: Maybe<Array<StatusChangingEvent>>;
};

export type ProposalStatusResponseWrap = {
  __typename?: 'ProposalStatusResponseWrap';
  proposalStatus: Maybe<ProposalStatus>;
  rejection: Maybe<Rejection>;
};

export type ProposalTemplate = {
  __typename?: 'ProposalTemplate';
  callCount: Scalars['Int'];
  complementaryQuestions: Array<Question>;
  description: Maybe<Scalars['String']>;
  group: TemplateGroup;
  groupId: TemplateGroupId;
  isArchived: Scalars['Boolean'];
  name: Scalars['String'];
  questionaryCount: Scalars['Int'];
  steps: Array<TemplateStep>;
  templateId: Scalars['Int'];
};

export type ProposalTemplatesFilter = {
  isArchived?: Maybe<Scalars['Boolean']>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
};

export type ProposalView = {
  __typename?: 'ProposalView';
  allocationTimeUnit: AllocationTimeUnits;
  callId: Scalars['Int'];
  callShortCode: Maybe<Scalars['String']>;
  finalStatus: Maybe<ProposalEndStatus>;
  instrumentId: Maybe<Scalars['Int']>;
  instrumentName: Maybe<Scalars['String']>;
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
  technicalStatus: Maybe<TechnicalReviewStatus>;
  timeAllocation: Maybe<Scalars['Int']>;
  title: Scalars['String'];
};

export type ProposalWorkflow = {
  __typename?: 'ProposalWorkflow';
  description: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  proposalWorkflowConnectionGroups: Array<ProposalWorkflowConnectionGroup>;
};

export type ProposalWorkflowConnection = {
  __typename?: 'ProposalWorkflowConnection';
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
  __typename?: 'ProposalWorkflowConnectionGroup';
  connections: Array<ProposalWorkflowConnection>;
  groupId: Scalars['String'];
  parentGroupId: Maybe<Scalars['String']>;
};

export type ProposalWorkflowConnectionResponseWrap = {
  __typename?: 'ProposalWorkflowConnectionResponseWrap';
  proposalWorkflowConnection: Maybe<ProposalWorkflowConnection>;
  rejection: Maybe<Rejection>;
};

export type ProposalWorkflowResponseWrap = {
  __typename?: 'ProposalWorkflowResponseWrap';
  proposalWorkflow: Maybe<ProposalWorkflow>;
  rejection: Maybe<Rejection>;
};

export type ProposalsFilter = {
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
  proposalStatusId?: Maybe<Scalars['Int']>;
  questionFilter?: Maybe<QuestionFilterInput>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  shortCodes?: Maybe<Array<Scalars['String']>>;
  text?: Maybe<Scalars['String']>;
};

export type ProposalsQueryResult = {
  __typename?: 'ProposalsQueryResult';
  proposals: Array<Proposal>;
  totalCount: Scalars['Int'];
};

export type ProposalsResponseWrap = {
  __typename?: 'ProposalsResponseWrap';
  proposals: Array<Proposal>;
  rejection: Maybe<Rejection>;
};

export type QueriesAndMutations = {
  __typename?: 'QueriesAndMutations';
  mutations: Array<Scalars['String']>;
  queries: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  accessTokenAndPermissions: Maybe<PermissionsWithAccessToken>;
  activeTemplateId: Maybe<Scalars['Int']>;
  allAccessTokensAndPermissions: Maybe<Array<PermissionsWithAccessToken>>;
  availableEquipments: Array<Equipment>;
  basicUserDetails: Maybe<BasicUserDetails>;
  basicUserDetailsByEmail: Maybe<BasicUserDetails>;
  blankQuestionary: Questionary;
  blankQuestionarySteps: Maybe<Array<QuestionaryStep>>;
  call: Maybe<Call>;
  calls: Maybe<Array<Call>>;
  callsByInstrumentScientist: Maybe<Array<Call>>;
  checkEmailExist: Maybe<Scalars['Boolean']>;
  checkToken: TokenResult;
  equipment: Maybe<Equipment>;
  equipments: Array<Equipment>;
  esi: Maybe<ExperimentSafetyInput>;
  eventLogs: Maybe<Array<EventLog>>;
  factoryVersion: Scalars['String'];
  features: Array<Feature>;
  fileMetadata: Maybe<Array<FileMetadata>>;
  genericTemplate: Maybe<GenericTemplate>;
  genericTemplates: Maybe<Array<GenericTemplate>>;
  getFields: Maybe<Fields>;
  getOrcIDInformation: Maybe<OrcIdInformation>;
  getPageContent: Maybe<Scalars['String']>;
  healthCheck: HealthStats;
  institutions: Maybe<Array<Institution>>;
  instrument: Maybe<Instrument>;
  instrumentProposalBookings: Array<ProposalBooking>;
  instrumentScientistHasAccess: Maybe<Scalars['Boolean']>;
  instrumentScientistHasInstrument: Maybe<Scalars['Boolean']>;
  instrumentScientistProposals: Maybe<ProposalsQueryResult>;
  instruments: Maybe<InstrumentsQueryResult>;
  instrumentsBySep: Maybe<Array<InstrumentWithAvailabilityTime>>;
  isNaturalKeyPresent: Maybe<Scalars['Boolean']>;
  me: Maybe<User>;
  myShipments: Maybe<Array<Shipment>>;
  myVisits: Array<Visit>;
  previousCollaborators: Maybe<UserQueryResult>;
  proposal: Maybe<Proposal>;
  proposalBooking: Maybe<ProposalBooking>;
  proposalBookingLostTimes: Array<LostTime>;
  proposalBookingScheduledEvent: Maybe<ScheduledEvent>;
  proposalBookingScheduledEvents: Array<ScheduledEvent>;
  proposalEvents: Maybe<Array<ProposalEvent>>;
  proposalReviews: Maybe<Array<Review>>;
  proposalStatus: Maybe<ProposalStatus>;
  proposalStatuses: Maybe<Array<ProposalStatus>>;
  proposalTemplates: Maybe<Array<ProposalTemplate>>;
  proposalWorkflow: Maybe<ProposalWorkflow>;
  proposalWorkflows: Maybe<Array<ProposalWorkflow>>;
  proposals: Maybe<ProposalsQueryResult>;
  proposalsView: Maybe<Array<ProposalView>>;
  queriesAndMutations: Maybe<QueriesAndMutations>;
  questionary: Maybe<Questionary>;
  questions: Array<QuestionWithUsage>;
  review: Maybe<Review>;
  roles: Maybe<Array<Role>>;
  sample: Maybe<Sample>;
  sampleEsi: Maybe<SampleExperimentSafetyInput>;
  samples: Maybe<Array<Sample>>;
  samplesByCallId: Maybe<Array<Sample>>;
  scheduledEvent: Maybe<ScheduledEvent>;
  scheduledEvents: Array<ScheduledEvent>;
  schedulerConfig: SchedulerConfig;
  schedulerVersion: Scalars['String'];
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
  user: Maybe<User>;
  userHasAccessToProposal: Maybe<Scalars['Boolean']>;
  userInstruments: Maybe<InstrumentsQueryResult>;
  users: Maybe<UserQueryResult>;
  version: Scalars['String'];
  visit: Maybe<Visit>;
  visitRegistration: Maybe<VisitRegistration>;
  visits: Array<Visit>;
};


export type QueryAccessTokenAndPermissionsArgs = {
  accessTokenId: Scalars['String'];
};


export type QueryActiveTemplateIdArgs = {
  templateGroupId: TemplateGroupId;
};


export type QueryAvailableEquipmentsArgs = {
  scheduledEventId: Scalars['Int'];
};


export type QueryBasicUserDetailsArgs = {
  id: Scalars['Int'];
};


export type QueryBasicUserDetailsByEmailArgs = {
  email: Scalars['String'];
  role?: Maybe<UserRole>;
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


export type QueryCallsArgs = {
  filter?: Maybe<CallsFilter>;
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


export type QueryEquipmentArgs = {
  id: Scalars['Int'];
};


export type QueryEquipmentsArgs = {
  equipmentIds?: Maybe<Array<Scalars['Int']>>;
};


export type QueryEsiArgs = {
  esiId: Scalars['Int'];
};


export type QueryEventLogsArgs = {
  changedObjectId: Scalars['String'];
  eventType: Scalars['String'];
};


export type QueryFileMetadataArgs = {
  fileIds: Array<Scalars['String']>;
};


export type QueryGenericTemplateArgs = {
  genericTemplateId: Scalars['Int'];
};


export type QueryGenericTemplatesArgs = {
  filter?: Maybe<GenericTemplatesFilter>;
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


export type QueryInstrumentProposalBookingsArgs = {
  instrumentIds: Array<Scalars['Int']>;
};


export type QueryInstrumentScientistHasAccessArgs = {
  instrumentId: Scalars['Int'];
  proposalPk: Scalars['Int'];
};


export type QueryInstrumentScientistHasInstrumentArgs = {
  instrumentId: Scalars['Int'];
};


export type QueryInstrumentScientistProposalsArgs = {
  filter?: Maybe<ProposalsFilter>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryInstrumentsArgs = {
  callIds?: Maybe<Array<Scalars['Int']>>;
};


export type QueryInstrumentsBySepArgs = {
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QueryIsNaturalKeyPresentArgs = {
  naturalKey: Scalars['String'];
};


export type QueryPreviousCollaboratorsArgs = {
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  subtractUsers?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userId: Scalars['Int'];
  userRole?: Maybe<UserRole>;
};


export type QueryProposalArgs = {
  primaryKey: Scalars['Int'];
};


export type QueryProposalBookingArgs = {
  id: Scalars['Int'];
};


export type QueryProposalBookingLostTimesArgs = {
  proposalBookingId: Scalars['Int'];
  scheduledEventId?: Maybe<Scalars['Int']>;
};


export type QueryProposalBookingScheduledEventArgs = {
  proposalBookingId: Scalars['Int'];
  scheduledEventId: Scalars['Int'];
};


export type QueryProposalBookingScheduledEventsArgs = {
  proposalBookingId: Scalars['Int'];
};


export type QueryProposalReviewsArgs = {
  proposalPk: Scalars['Int'];
};


export type QueryProposalStatusArgs = {
  id: Scalars['Int'];
};


export type QueryProposalTemplatesArgs = {
  filter?: Maybe<ProposalTemplatesFilter>;
};


export type QueryProposalWorkflowArgs = {
  id: Scalars['Int'];
};


export type QueryProposalsArgs = {
  filter?: Maybe<ProposalsFilter>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryProposalsViewArgs = {
  filter?: Maybe<ProposalsFilter>;
};


export type QueryQuestionaryArgs = {
  questionaryId: Scalars['Int'];
};


export type QueryQuestionsArgs = {
  filter?: Maybe<QuestionsFilter>;
};


export type QueryReviewArgs = {
  reviewId: Scalars['Int'];
  sepId?: Maybe<Scalars['Int']>;
};


export type QuerySampleArgs = {
  sampleId: Scalars['Int'];
};


export type QuerySampleEsiArgs = {
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
};


export type QuerySamplesArgs = {
  filter?: Maybe<SamplesFilter>;
};


export type QuerySamplesByCallIdArgs = {
  callId: Scalars['Int'];
};


export type QueryScheduledEventArgs = {
  id: Scalars['Int'];
};


export type QueryScheduledEventsArgs = {
  filter: ScheduledEventFilter;
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
  callId: Scalars['Int'];
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
  active?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryShipmentArgs = {
  shipmentId: Scalars['Int'];
};


export type QueryShipmentsArgs = {
  filter?: Maybe<ShipmentsFilter>;
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int'];
};


export type QueryTemplatesArgs = {
  filter?: Maybe<TemplatesFilter>;
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};


export type QueryUserHasAccessToProposalArgs = {
  proposalPk: Scalars['Int'];
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  subtractUsers?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userRole?: Maybe<UserRole>;
};


export type QueryVisitArgs = {
  visitId: Scalars['Int'];
};


export type QueryVisitRegistrationArgs = {
  visitId: Scalars['Int'];
};


export type QueryVisitsArgs = {
  filter?: Maybe<VisitsFilter>;
};

export type Question = {
  __typename?: 'Question';
  categoryId: TemplateCategoryId;
  config: FieldConfig;
  dataType: DataType;
  id: Scalars['String'];
  naturalKey: Scalars['String'];
  question: Scalars['String'];
};

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
  __typename?: 'QuestionResponseWrap';
  question: Maybe<Question>;
  rejection: Maybe<Rejection>;
};

export type QuestionTemplateRelation = {
  __typename?: 'QuestionTemplateRelation';
  config: FieldConfig;
  dependencies: Array<FieldDependency>;
  dependenciesOperator: Maybe<DependenciesLogicOperator>;
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
};

export type QuestionWithUsage = {
  __typename?: 'QuestionWithUsage';
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
  __typename?: 'Questionary';
  created: Scalars['DateTime'];
  isCompleted: Scalars['Boolean'];
  questionaryId: Scalars['Int'];
  steps: Array<QuestionaryStep>;
  templateId: Scalars['Int'];
};

export type QuestionaryResponseWrap = {
  __typename?: 'QuestionaryResponseWrap';
  questionary: Maybe<Questionary>;
  rejection: Maybe<Rejection>;
};

export type QuestionaryStep = {
  __typename?: 'QuestionaryStep';
  fields: Array<Answer>;
  isCompleted: Scalars['Boolean'];
  topic: Topic;
};

export type QuestionaryStepResponseWrap = {
  __typename?: 'QuestionaryStepResponseWrap';
  questionaryStep: Maybe<QuestionaryStep>;
  rejection: Maybe<Rejection>;
};

export type QuestionsFilter = {
  category?: Maybe<TemplateCategoryId>;
  dataType?: Maybe<Array<DataType>>;
  excludeDataType?: Maybe<Array<DataType>>;
  text?: Maybe<Scalars['String']>;
};

export type Rejection = {
  __typename?: 'Rejection';
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
  __typename?: 'Review';
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
  __typename?: 'ReviewResponseWrap';
  rejection: Maybe<Rejection>;
  review: Maybe<Review>;
};

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ReviewWithNextProposalStatus = {
  __typename?: 'ReviewWithNextProposalStatus';
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
  __typename?: 'ReviewWithNextStatusResponseWrap';
  rejection: Maybe<Rejection>;
  review: Maybe<ReviewWithNextProposalStatus>;
};

export enum ReviewerFilter {
  ALL = 'ALL',
  YOU = 'YOU'
}

export type RichTextInputConfig = {
  __typename?: 'RichTextInputConfig';
  max: Maybe<Scalars['Int']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  title: Scalars['String'];
};

export type Sep = {
  __typename?: 'SEP';
  active: Scalars['Boolean'];
  code: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Int'];
  numberRatingsRequired: Scalars['Float'];
  sepChair: Maybe<BasicUserDetails>;
  sepSecretary: Maybe<BasicUserDetails>;
};

export type SepAssignment = {
  __typename?: 'SEPAssignment';
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
  __typename?: 'SEPProposal';
  assignments: Maybe<Array<SepAssignment>>;
  dateAssigned: Scalars['DateTime'];
  instrumentSubmitted: Scalars['Boolean'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  sepId: Scalars['Int'];
  sepTimeAllocation: Maybe<Scalars['Int']>;
};

export type SepProposalResponseWrap = {
  __typename?: 'SEPProposalResponseWrap';
  rejection: Maybe<Rejection>;
  sepProposal: Maybe<SepProposal>;
};

export type SepResponseWrap = {
  __typename?: 'SEPResponseWrap';
  rejection: Maybe<Rejection>;
  sep: Maybe<Sep>;
};

export type SepReviewer = {
  __typename?: 'SEPReviewer';
  role: Maybe<Role>;
  sepId: Scalars['Int'];
  user: BasicUserDetails;
  userId: Scalars['Int'];
};

export type SePsQueryResult = {
  __typename?: 'SEPsQueryResult';
  seps: Array<Sep>;
  totalCount: Scalars['Int'];
};

export type Sample = {
  __typename?: 'Sample';
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
  __typename?: 'SampleBasisConfig';
  titlePlaceholder: Scalars['String'];
};

export type SampleDeclarationConfig = {
  __typename?: 'SampleDeclarationConfig';
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
  __typename?: 'SampleEsiBasisConfig';
  tooltip: Scalars['String'];
};

export type SampleEsiResponseWrap = {
  __typename?: 'SampleEsiResponseWrap';
  esi: Maybe<SampleExperimentSafetyInput>;
  rejection: Maybe<Rejection>;
};

export type SampleExperimentSafetyInput = {
  __typename?: 'SampleExperimentSafetyInput';
  esiId: Scalars['Int'];
  isSubmitted: Scalars['Boolean'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  sample: Sample;
  sampleId: Scalars['Int'];
};

export type SampleResponseWrap = {
  __typename?: 'SampleResponseWrap';
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
  creatorId?: Maybe<Scalars['Int']>;
  proposalPk?: Maybe<Scalars['Int']>;
  questionId?: Maybe<Scalars['String']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  sampleIds?: Maybe<Array<Scalars['Int']>>;
  status?: Maybe<SampleStatus>;
  title?: Maybe<Scalars['String']>;
  visitId?: Maybe<Scalars['Int']>;
};

export type SaveSepMeetingDecisionInput = {
  commentForManagement?: Maybe<Scalars['String']>;
  commentForUser?: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  rankOrder?: Maybe<Scalars['Int']>;
  recommendation?: Maybe<ProposalEndStatus>;
  submitted?: Maybe<Scalars['Boolean']>;
};

export type ScheduledEvent = {
  __typename?: 'ScheduledEvent';
  bookingType: ScheduledEventBookingType;
  createdAt: Scalars['DateTime'];
  description: Maybe<Scalars['String']>;
  endsAt: Scalars['TzLessDateTime'];
  equipmentAssignmentStatus: Maybe<EquipmentAssignmentStatus>;
  equipmentId: Maybe<Scalars['Int']>;
  equipments: Array<EquipmentWithAssignmentStatus>;
  id: Scalars['Int'];
  instrument: Maybe<Instrument>;
  proposalBooking: Maybe<ProposalBooking>;
  proposalBookingId: Maybe<Scalars['Int']>;
  scheduledBy: Maybe<User>;
  startsAt: Scalars['TzLessDateTime'];
  status: ProposalBookingStatusCore;
  updatedAt: Scalars['DateTime'];
};

export enum ScheduledEventBookingType {
  COMMISSIONING = 'COMMISSIONING',
  EQUIPMENT = 'EQUIPMENT',
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  USER_OPERATIONS = 'USER_OPERATIONS'
}

export type ScheduledEventCore = {
  __typename?: 'ScheduledEventCore';
  bookingType: ScheduledEventBookingType;
  endsAt: Scalars['TzLessDateTime'];
  esi: Maybe<ExperimentSafetyInput>;
  id: Scalars['Int'];
  startsAt: Scalars['TzLessDateTime'];
  visit: Maybe<Visit>;
};

export type ScheduledEventFilter = {
  endsAt: Scalars['TzLessDateTime'];
  instrumentIds?: Maybe<Array<Scalars['Int']>>;
  startsAt: Scalars['TzLessDateTime'];
};

export type ScheduledEventResponseWrap = {
  __typename?: 'ScheduledEventResponseWrap';
  error: Maybe<Scalars['String']>;
  scheduledEvent: Maybe<ScheduledEvent>;
};

export type ScheduledEventsResponseWrap = {
  __typename?: 'ScheduledEventsResponseWrap';
  error: Maybe<Scalars['String']>;
  scheduledEvents: Maybe<Array<ScheduledEvent>>;
};

export type SchedulerConfig = {
  __typename?: 'SchedulerConfig';
  authRedirect: Scalars['String'];
};

export type SelectionFromOptionsConfig = {
  __typename?: 'SelectionFromOptionsConfig';
  isMultipleSelect: Scalars['Boolean'];
  options: Array<Scalars['String']>;
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
  variant: Scalars['String'];
};

export type SepMeetingDecision = {
  __typename?: 'SepMeetingDecision';
  commentForManagement: Maybe<Scalars['String']>;
  commentForUser: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  rankOrder: Maybe<Scalars['Int']>;
  recommendation: Maybe<ProposalEndStatus>;
  submitted: Scalars['Boolean'];
  submittedBy: Maybe<Scalars['Int']>;
};

export type SepMeetingDecisionResponseWrap = {
  __typename?: 'SepMeetingDecisionResponseWrap';
  rejection: Maybe<Rejection>;
  sepMeetingDecision: Maybe<SepMeetingDecision>;
};

export type Settings = {
  __typename?: 'Settings';
  description: Maybe<Scalars['String']>;
  id: SettingsId;
  settingsValue: Maybe<Scalars['String']>;
};

export enum SettingsId {
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
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
  PROFILE_PAGE_LINK = 'PROFILE_PAGE_LINK'
}

export type Shipment = {
  __typename?: 'Shipment';
  created: Scalars['DateTime'];
  creatorId: Scalars['Int'];
  externalRef: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  questionary: Questionary;
  questionaryId: Scalars['Int'];
  samples: Array<Sample>;
  status: ShipmentStatus;
  title: Scalars['String'];
  visitId: Scalars['Int'];
};

export type ShipmentBasisConfig = {
  __typename?: 'ShipmentBasisConfig';
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type ShipmentResponseWrap = {
  __typename?: 'ShipmentResponseWrap';
  rejection: Maybe<Rejection>;
  shipment: Maybe<Shipment>;
};

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ShipmentsFilter = {
  creatorId?: Maybe<Scalars['Int']>;
  externalRef?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  shipmentIds?: Maybe<Array<Scalars['Int']>>;
  status?: Maybe<ShipmentStatus>;
  title?: Maybe<Scalars['String']>;
  visitId?: Maybe<Scalars['Int']>;
};

export type SimpleLostTimeInput = {
  endsAt: Scalars['TzLessDateTime'];
  id: Scalars['Int'];
  newlyCreated?: Maybe<Scalars['Boolean']>;
  scheduledEventId?: Maybe<Scalars['Int']>;
  startsAt: Scalars['TzLessDateTime'];
};

export type StatusChangingEvent = {
  __typename?: 'StatusChangingEvent';
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvent: Scalars['String'];
  statusChangingEventId: Scalars['Int'];
};

export type SubTemplateConfig = {
  __typename?: 'SubTemplateConfig';
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
  comment?: Maybe<Scalars['String']>;
  proposalPk: Scalars['Int'];
  publicComment?: Maybe<Scalars['String']>;
  reviewerId: Scalars['Int'];
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  timeAllocation?: Maybe<Scalars['Int']>;
};

export type SuccessResponseWrap = {
  __typename?: 'SuccessResponseWrap';
  isSuccess: Maybe<Scalars['Boolean']>;
  rejection: Maybe<Rejection>;
};

export type TechnicalReview = {
  __typename?: 'TechnicalReview';
  comment: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  proposal: Maybe<Proposal>;
  proposalPk: Scalars['Int'];
  publicComment: Maybe<Scalars['String']>;
  reviewer: Maybe<BasicUserDetails>;
  reviewerId: Scalars['Int'];
  status: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  timeAllocation: Maybe<Scalars['Int']>;
};

export type TechnicalReviewResponseWrap = {
  __typename?: 'TechnicalReviewResponseWrap';
  rejection: Maybe<Rejection>;
  technicalReview: Maybe<TechnicalReview>;
};

export enum TechnicalReviewStatus {
  FEASIBLE = 'FEASIBLE',
  PARTIALLY_FEASIBLE = 'PARTIALLY_FEASIBLE',
  UNFEASIBLE = 'UNFEASIBLE'
}

export type Template = {
  __typename?: 'Template';
  complementaryQuestions: Array<Question>;
  description: Maybe<Scalars['String']>;
  group: TemplateGroup;
  groupId: TemplateGroupId;
  isArchived: Scalars['Boolean'];
  name: Scalars['String'];
  questionaryCount: Scalars['Int'];
  steps: Array<TemplateStep>;
  templateId: Scalars['Int'];
};

export type TemplateCategory = {
  __typename?: 'TemplateCategory';
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
};

export enum TemplateCategoryId {
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  PROPOSAL_QUESTIONARY = 'PROPOSAL_QUESTIONARY',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION',
  SHIPMENT_DECLARATION = 'SHIPMENT_DECLARATION',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION'
}

export type TemplateGroup = {
  __typename?: 'TemplateGroup';
  categoryId: TemplateCategoryId;
  groupId: TemplateGroupId;
};

export enum TemplateGroupId {
  GENERIC_TEMPLATE = 'GENERIC_TEMPLATE',
  PROPOSAL = 'PROPOSAL',
  PROPOSAL_ESI = 'PROPOSAL_ESI',
  SAMPLE = 'SAMPLE',
  SAMPLE_ESI = 'SAMPLE_ESI',
  SHIPMENT = 'SHIPMENT',
  VISIT_REGISTRATION = 'VISIT_REGISTRATION'
}

export type TemplateResponseWrap = {
  __typename?: 'TemplateResponseWrap';
  rejection: Maybe<Rejection>;
  template: Maybe<Template>;
};

export type TemplateStep = {
  __typename?: 'TemplateStep';
  fields: Array<QuestionTemplateRelation>;
  topic: Topic;
};

export type TemplatesFilter = {
  group?: Maybe<TemplateGroupId>;
  isArchived?: Maybe<Scalars['Boolean']>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
};

export type TextInputConfig = {
  __typename?: 'TextInputConfig';
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

export type TokenPayloadUnion = AuthJwtApiTokenPayload | AuthJwtPayload;

export type TokenResponseWrap = {
  __typename?: 'TokenResponseWrap';
  rejection: Maybe<Rejection>;
  token: Maybe<Scalars['String']>;
};

export type TokenResult = {
  __typename?: 'TokenResult';
  isValid: Scalars['Boolean'];
  payload: Maybe<TokenPayloadUnion>;
};

export type Topic = {
  __typename?: 'Topic';
  id: Scalars['Int'];
  isEnabled: Scalars['Boolean'];
  sortOrder: Scalars['Int'];
  templateId: Scalars['Int'];
  title: Scalars['String'];
};


export type Unit = {
  __typename?: 'Unit';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type UnitResponseWrap = {
  __typename?: 'UnitResponseWrap';
  rejection: Maybe<Rejection>;
  unit: Maybe<Unit>;
};

export type UpdateAnswerResponseWrap = {
  __typename?: 'UpdateAnswerResponseWrap';
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
  callEnded?: Maybe<Scalars['Int']>;
  callReviewEnded?: Maybe<Scalars['Int']>;
  callSEPReviewEnded?: Maybe<Scalars['Int']>;
  cycleComment: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  endCall: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  endSEPReview?: Maybe<Scalars['DateTime']>;
  esiTemplateId?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  proposalSequence?: Maybe<Scalars['Int']>;
  proposalWorkflowId: Scalars['Int'];
  referenceNumberFormat?: Maybe<Scalars['String']>;
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  startSEPReview?: Maybe<Scalars['DateTime']>;
  surveyComment: Scalars['String'];
  templateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
};

export type UpdateProposalStatusInput = {
  description: Scalars['String'];
  id: Scalars['Int'];
  isDefault?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  shortCode?: Maybe<Scalars['String']>;
};

export type UpdateProposalWorkflowInput = {
  description: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type UpdateScheduledEventInput = {
  endsAt: Scalars['TzLessDateTime'];
  scheduledEventId: Scalars['Int'];
  startsAt: Scalars['TzLessDateTime'];
};

export type User = {
  __typename?: 'User';
  birthdate: Scalars['String'];
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
  filter?: Maybe<UserProposalsFilter>;
};


export type UserReviewsArgs = {
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
  reviewer?: Maybe<ReviewerFilter>;
  status?: Maybe<ReviewStatus>;
};

export type UserProposalsFilter = {
  finalStatus?: Maybe<ProposalEndStatus>;
  instrumentId?: Maybe<Scalars['Int']>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
};

export type UserQueryResult = {
  __typename?: 'UserQueryResult';
  totalCount: Scalars['Int'];
  users: Array<BasicUserDetails>;
};

export type UserResponseWrap = {
  __typename?: 'UserResponseWrap';
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
  __typename?: 'Visit';
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  proposal: Proposal;
  proposalPk: Scalars['Int'];
  registrations: Array<VisitRegistration>;
  samples: Array<Sample>;
  scheduledEventId: Scalars['Int'];
  shipments: Array<Shipment>;
  status: VisitStatus;
  teamLead: BasicUserDetails;
  teamLeadUserId: Scalars['Int'];
};

export type VisitBasisConfig = {
  __typename?: 'VisitBasisConfig';
  required: Scalars['Boolean'];
  small_label: Scalars['String'];
  tooltip: Scalars['String'];
};

export type VisitRegistration = {
  __typename?: 'VisitRegistration';
  isRegistrationSubmitted: Scalars['Boolean'];
  questionary: Questionary;
  registrationQuestionaryId: Maybe<Scalars['Int']>;
  trainingExpiryDate: Maybe<Scalars['DateTime']>;
  user: BasicUserDetails;
  userId: Scalars['Int'];
  visitId: Scalars['Int'];
};

export type VisitRegistrationResponseWrap = {
  __typename?: 'VisitRegistrationResponseWrap';
  registration: Maybe<VisitRegistration>;
  rejection: Maybe<Rejection>;
};

export type VisitResponseWrap = {
  __typename?: 'VisitResponseWrap';
  rejection: Maybe<Rejection>;
  visit: Maybe<Visit>;
};

export enum VisitStatus {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type VisitsFilter = {
  creatorId?: Maybe<Scalars['Int']>;
  proposalPk?: Maybe<Scalars['Int']>;
  scheduledEventId?: Maybe<Scalars['Int']>;
};

export type AssignProposalsToSepMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  sepId: Scalars['Int'];
}>;


export type AssignProposalsToSepMutation = (
  { __typename?: 'Mutation' }
  & { assignProposalsToSep: (
    { __typename?: 'NextProposalStatusResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, nextProposalStatus: Maybe<(
      { __typename?: 'NextProposalStatus' }
      & Pick<NextProposalStatus, 'id' | 'shortCode' | 'name'>
    )> }
  ) }
);

export type AssignReviewersToSepMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type AssignReviewersToSepMutation = (
  { __typename?: 'Mutation' }
  & { assignReviewersToSEP: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignChairOrSecretaryMutationVariables = Exact<{
  assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSepInput;
}>;


export type AssignChairOrSecretaryMutation = (
  { __typename?: 'Mutation' }
  & { assignChairOrSecretary: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignSepReviewersToProposalMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type AssignSepReviewersToProposalMutation = (
  { __typename?: 'Mutation' }
  & { assignSepReviewersToProposal: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type CreateSepMutationVariables = Exact<{
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type CreateSepMutation = (
  { __typename?: 'Mutation' }
  & { createSEP: (
    { __typename?: 'SEPResponseWrap' }
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, sepSecretary: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteSepMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteSepMutation = (
  { __typename?: 'Mutation' }
  & { deleteSEP: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type SepMeetingDecisionFragment = (
  { __typename?: 'SepMeetingDecision' }
  & Pick<SepMeetingDecision, 'proposalPk' | 'recommendation' | 'commentForUser' | 'commentForManagement' | 'rankOrder' | 'submitted' | 'submittedBy'>
);

export type GetInstrumentsBySepQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetInstrumentsBySepQuery = (
  { __typename?: 'Query' }
  & { instrumentsBySep: Maybe<Array<(
    { __typename?: 'InstrumentWithAvailabilityTime' }
    & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime' | 'submitted'>
    & { scientists: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
  )>> }
);

export type GetUserSepsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserSepsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { seps: Array<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, sepSecretary: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  )> }
);

export type GetSepQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetSepQuery = (
  { __typename?: 'Query' }
  & { sep: Maybe<(
    { __typename?: 'SEP' }
    & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
    & { sepChair: Maybe<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, sepSecretary: Maybe<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
  )> }
);

export type GetSepMembersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepMembersQuery = (
  { __typename?: 'Query' }
  & { sepMembers: Maybe<Array<(
    { __typename?: 'SEPReviewer' }
    & Pick<SepReviewer, 'userId' | 'sepId'>
    & { role: Maybe<(
      { __typename?: 'Role' }
      & Pick<Role, 'id' | 'shortCode' | 'title'>
    )>, user: (
      { __typename?: 'BasicUserDetails' }
      & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation' | 'position' | 'placeholder' | 'created'>
    ) }
  )>> }
);

export type GetSepProposalQueryVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type GetSepProposalQuery = (
  { __typename?: 'Query' }
  & { sepProposal: Maybe<(
    { __typename?: 'SEPProposal' }
    & Pick<SepProposal, 'proposalPk' | 'sepId' | 'sepTimeAllocation' | 'instrumentSubmitted'>
    & { proposal: (
      { __typename?: 'Proposal' }
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, questionary: (
        { __typename?: 'Questionary' }
        & QuestionaryFragment
      ), technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & BasicUserDetailsFragment
        )> }
        & CoreTechnicalReviewFragment
      )>, reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>
        )> }
      )>>, instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'id' | 'name' | 'shortCode'>
      )>, call: Maybe<(
        { __typename?: 'Call' }
        & Pick<Call, 'id' | 'shortCode' | 'allocationTimeUnit'>
      )> }
      & ProposalFragment
    ) }
  )> }
);

export type GetSepProposalsQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetSepProposalsQuery = (
  { __typename?: 'Query' }
  & { sepProposals: Maybe<Array<(
    { __typename?: 'SEPProposal' }
    & Pick<SepProposal, 'proposalPk' | 'dateAssigned' | 'sepId' | 'sepTimeAllocation'>
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'title' | 'primaryKey' | 'proposalId'>
      & { status: Maybe<(
        { __typename?: 'ProposalStatus' }
        & ProposalStatusFragment
      )> }
    ), assignments: Maybe<Array<(
      { __typename?: 'SEPAssignment' }
      & Pick<SepAssignment, 'sepMemberUserId' | 'dateAssigned'>
      & { user: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, role: Maybe<(
        { __typename?: 'Role' }
        & Pick<Role, 'id' | 'shortCode' | 'title'>
      )>, review: Maybe<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'status' | 'comment' | 'grade' | 'sepID'>
      )> }
    )>> }
  )>> }
);

export type SepProposalsByInstrumentQueryVariables = Exact<{
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type SepProposalsByInstrumentQuery = (
  { __typename?: 'Query' }
  & { sepProposalsByInstrument: Maybe<Array<(
    { __typename?: 'SEPProposal' }
    & Pick<SepProposal, 'sepTimeAllocation'>
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'title' | 'proposalId'>
      & { status: Maybe<(
        { __typename?: 'ProposalStatus' }
        & ProposalStatusFragment
      )>, sepMeetingDecision: Maybe<(
        { __typename?: 'SepMeetingDecision' }
        & SepMeetingDecisionFragment
      )>, reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'comment' | 'grade' | 'status'>
      )>>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & Pick<TechnicalReview, 'publicComment' | 'status' | 'timeAllocation'>
      )> }
    ), assignments: Maybe<Array<(
      { __typename?: 'SEPAssignment' }
      & Pick<SepAssignment, 'sepMemberUserId'>
    )>> }
  )>> }
);

export type GetSepReviewersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepReviewersQuery = (
  { __typename?: 'Query' }
  & { sepReviewers: Maybe<Array<(
    { __typename?: 'SEPReviewer' }
    & Pick<SepReviewer, 'userId' | 'sepId'>
    & { role: Maybe<(
      { __typename?: 'Role' }
      & Pick<Role, 'id' | 'shortCode' | 'title'>
    )>, user: (
      { __typename?: 'BasicUserDetails' }
      & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation' | 'position' | 'placeholder' | 'created'>
    ) }
  )>> }
);

export type GetSePsQueryVariables = Exact<{
  filter: Scalars['String'];
  active?: Maybe<Scalars['Boolean']>;
}>;


export type GetSePsQuery = (
  { __typename?: 'Query' }
  & { seps: Maybe<(
    { __typename?: 'SEPsQueryResult' }
    & Pick<SePsQueryResult, 'totalCount'>
    & { seps: Array<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
      & { sepChair: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, sepSecretary: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  )> }
);

export type RemoveProposalsFromSepMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveProposalsFromSepMutation = (
  { __typename?: 'Mutation' }
  & { removeProposalsFromSep: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type RemoveMemberFromSepMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  roleId: UserRole;
}>;


export type RemoveMemberFromSepMutation = (
  { __typename?: 'Mutation' }
  & { removeMemberFromSep: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type RemoveMemberFromSepProposalMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
}>;


export type RemoveMemberFromSepProposalMutation = (
  { __typename?: 'Mutation' }
  & { removeMemberFromSEPProposal: (
    { __typename?: 'SEPResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type ReorderSepMeetingDecisionProposalsMutationVariables = Exact<{
  reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput;
}>;


export type ReorderSepMeetingDecisionProposalsMutation = (
  { __typename?: 'Mutation' }
  & { reorderSepMeetingDecisionProposals: (
    { __typename?: 'SepMeetingDecisionResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sepMeetingDecision: Maybe<(
      { __typename?: 'SepMeetingDecision' }
      & Pick<SepMeetingDecision, 'proposalPk'>
    )> }
  ) }
);

export type SaveSepMeetingDecisionMutationVariables = Exact<{
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionInput;
}>;


export type SaveSepMeetingDecisionMutation = (
  { __typename?: 'Mutation' }
  & { saveSepMeetingDecision: (
    { __typename?: 'SepMeetingDecisionResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, sepMeetingDecision: Maybe<(
      { __typename?: 'SepMeetingDecision' }
      & Pick<SepMeetingDecision, 'proposalPk'>
    )> }
  ) }
);

export type UpdateSepMutationVariables = Exact<{
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Int'];
  active: Scalars['Boolean'];
}>;


export type UpdateSepMutation = (
  { __typename?: 'Mutation' }
  & { updateSEP: (
    { __typename?: 'SEPResponseWrap' }
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateSepTimeAllocationMutationVariables = Exact<{
  sepId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepTimeAllocation?: Maybe<Scalars['Int']>;
}>;


export type UpdateSepTimeAllocationMutation = (
  { __typename?: 'Mutation' }
  & { updateSEPTimeAllocation: (
    { __typename?: 'SEPProposalResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AddClientLogMutationVariables = Exact<{
  error: Scalars['String'];
}>;


export type AddClientLogMutation = (
  { __typename?: 'Mutation' }
  & { addClientLog: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateApiAccessTokenMutationVariables = Exact<{
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type CreateApiAccessTokenMutation = (
  { __typename?: 'Mutation' }
  & { createApiAccessToken: (
    { __typename?: 'ApiAccessTokenResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, apiAccessToken: Maybe<(
      { __typename?: 'PermissionsWithAccessToken' }
      & Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>
    )> }
  ) }
);

export type CreateInstitutionMutationVariables = Exact<{
  name: Scalars['String'];
  verified: Scalars['Boolean'];
}>;


export type CreateInstitutionMutation = (
  { __typename?: 'Mutation' }
  & { createInstitution: (
    { __typename?: 'InstitutionResponseWrap' }
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'name' | 'verified'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateUnitMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateUnitMutation = (
  { __typename?: 'Mutation' }
  & { createUnit: (
    { __typename?: 'UnitResponseWrap' }
    & { unit: Maybe<(
      { __typename?: 'Unit' }
      & Pick<Unit, 'id' | 'name'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
}>;


export type DeleteApiAccessTokenMutation = (
  { __typename?: 'Mutation' }
  & { deleteApiAccessToken: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstitutionMutation = (
  { __typename?: 'Mutation' }
  & { deleteInstitution: (
    { __typename?: 'InstitutionResponseWrap' }
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'verified'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteUnitMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUnitMutation = (
  { __typename?: 'Mutation' }
  & { deleteUnit: (
    { __typename?: 'UnitResponseWrap' }
    & { unit: Maybe<(
      { __typename?: 'Unit' }
      & Pick<Unit, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetAllApiAccessTokensAndPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllApiAccessTokensAndPermissionsQuery = (
  { __typename?: 'Query' }
  & { allAccessTokensAndPermissions: Maybe<Array<(
    { __typename?: 'PermissionsWithAccessToken' }
    & Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>
  )>> }
);

export type GetAllQueriesAndMutationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllQueriesAndMutationsQuery = (
  { __typename?: 'Query' }
  & { queriesAndMutations: Maybe<(
    { __typename?: 'QueriesAndMutations' }
    & Pick<QueriesAndMutations, 'queries' | 'mutations'>
  )> }
);

export type GetFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturesQuery = (
  { __typename?: 'Query' }
  & { features: Array<(
    { __typename?: 'Feature' }
    & Pick<Feature, 'id' | 'isEnabled' | 'description'>
  )> }
);

export type GetInstitutionsQueryVariables = Exact<{
  filter?: Maybe<InstitutionsFilter>;
}>;


export type GetInstitutionsQuery = (
  { __typename?: 'Query' }
  & { institutions: Maybe<Array<(
    { __typename?: 'Institution' }
    & Pick<Institution, 'id' | 'name' | 'verified'>
  )>> }
);

export type GetPageContentQueryVariables = Exact<{
  id: PageName;
}>;


export type GetPageContentQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'getPageContent'>
);

export type GetSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSettingsQuery = (
  { __typename?: 'Query' }
  & { settings: Array<(
    { __typename?: 'Settings' }
    & Pick<Settings, 'id' | 'settingsValue' | 'description'>
  )> }
);

export type GetUnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnitsQuery = (
  { __typename?: 'Query' }
  & { units: Maybe<Array<(
    { __typename?: 'Unit' }
    & Pick<Unit, 'id' | 'name'>
  )>> }
);

export type RejectionFragment = (
  { __typename?: 'Rejection' }
  & Pick<Rejection, 'reason' | 'context' | 'exception'>
);

export type SetPageContentMutationVariables = Exact<{
  id: PageName;
  text: Scalars['String'];
}>;


export type SetPageContentMutation = (
  { __typename?: 'Mutation' }
  & { setPageContent: (
    { __typename?: 'PageResponseWrap' }
    & { page: Maybe<(
      { __typename?: 'Page' }
      & Pick<Page, 'id' | 'content'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateApiAccessTokenMutationVariables = Exact<{
  accessTokenId: Scalars['String'];
  name: Scalars['String'];
  accessPermissions: Scalars['String'];
}>;


export type UpdateApiAccessTokenMutation = (
  { __typename?: 'Mutation' }
  & { updateApiAccessToken: (
    { __typename?: 'ApiAccessTokenResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, apiAccessToken: Maybe<(
      { __typename?: 'PermissionsWithAccessToken' }
      & Pick<PermissionsWithAccessToken, 'id' | 'name' | 'accessToken' | 'accessPermissions'>
    )> }
  ) }
);

export type UpdateInstitutionMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
}>;


export type UpdateInstitutionMutation = (
  { __typename?: 'Mutation' }
  & { updateInstitution: (
    { __typename?: 'InstitutionResponseWrap' }
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'verified' | 'name'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AssignInstrumentsToCallMutationVariables = Exact<{
  instrumentIds: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type AssignInstrumentsToCallMutation = (
  { __typename?: 'Mutation' }
  & { assignInstrumentsToCall: (
    { __typename?: 'CallResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id'>
    )> }
  ) }
);

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
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
}>;


export type CreateCallMutation = (
  { __typename?: 'Mutation' }
  & { createCall: (
    { __typename?: 'CallResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & CallFragment
    )> }
  ) }
);

export type DeleteCallMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteCallMutation = (
  { __typename?: 'Mutation' }
  & { deleteCall: (
    { __typename?: 'CallResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
      & RejectionFragment
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id'>
    )> }
  ) }
);

export type CallFragment = (
  { __typename?: 'Call' }
  & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'startReview' | 'endReview' | 'startSEPReview' | 'endSEPReview' | 'startNotify' | 'endNotify' | 'startCycle' | 'endCycle' | 'cycleComment' | 'surveyComment' | 'referenceNumberFormat' | 'proposalWorkflowId' | 'templateId' | 'esiTemplateId' | 'allocationTimeUnit' | 'proposalCount' | 'title' | 'description'>
  & { instruments: Array<(
    { __typename?: 'InstrumentWithAvailabilityTime' }
    & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime' | 'submitted'>
    & { scientists: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
  )>, proposalWorkflow: Maybe<(
    { __typename?: 'ProposalWorkflow' }
    & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
  )>, template: (
    { __typename?: 'Template' }
    & Pick<Template, 'templateId' | 'name' | 'isArchived'>
  ) }
);

export type GetCallQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetCallQuery = (
  { __typename?: 'Query' }
  & { call: Maybe<(
    { __typename?: 'Call' }
    & CallFragment
  )> }
);

export type GetCallsQueryVariables = Exact<{
  filter?: Maybe<CallsFilter>;
}>;


export type GetCallsQuery = (
  { __typename?: 'Query' }
  & { calls: Maybe<Array<(
    { __typename?: 'Call' }
    & CallFragment
  )>> }
);

export type GetCallsByInstrumentScientistQueryVariables = Exact<{
  scientistId: Scalars['Int'];
}>;


export type GetCallsByInstrumentScientistQuery = (
  { __typename?: 'Query' }
  & { callsByInstrumentScientist: Maybe<Array<(
    { __typename?: 'Call' }
    & CallFragment
  )>> }
);

export type RemoveAssignedInstrumentFromCallMutationVariables = Exact<{
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type RemoveAssignedInstrumentFromCallMutation = (
  { __typename?: 'Mutation' }
  & { removeAssignedInstrumentFromCall: (
    { __typename?: 'CallResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id'>
    )> }
  ) }
);

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
  surveyComment: Scalars['String'];
  allocationTimeUnit: AllocationTimeUnits;
  referenceNumberFormat?: Maybe<Scalars['String']>;
  proposalWorkflowId: Scalars['Int'];
  templateId: Scalars['Int'];
  esiTemplateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
}>;


export type UpdateCallMutation = (
  { __typename?: 'Mutation' }
  & { updateCall: (
    { __typename?: 'CallResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & CallFragment
    )> }
  ) }
);

export type CreateEsiMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
}>;


export type CreateEsiMutation = (
  { __typename?: 'Mutation' }
  & { createEsi: (
    { __typename?: 'EsiResponseWrap' }
    & { esi: Maybe<(
      { __typename?: 'ExperimentSafetyInput' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sampleEsis: Array<(
        { __typename?: 'SampleExperimentSafetyInput' }
        & { sample: (
          { __typename?: 'Sample' }
          & SampleFragment
        ), questionary: (
          { __typename?: 'Questionary' }
          & Pick<Questionary, 'isCompleted'>
        ) }
        & SampleEsiFragment
      )>, proposal: (
        { __typename?: 'Proposal' }
        & Pick<Proposal, 'primaryKey' | 'proposalId' | 'title'>
        & { samples: Maybe<Array<(
          { __typename?: 'Sample' }
          & SampleFragment
        )>>, questionary: (
          { __typename?: 'Questionary' }
          & QuestionaryFragment
        ) }
      ) }
      & EsiFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type EsiFragment = (
  { __typename?: 'ExperimentSafetyInput' }
  & Pick<ExperimentSafetyInput, 'id' | 'creatorId' | 'questionaryId' | 'isSubmitted' | 'created'>
);

export type GetEsiQueryVariables = Exact<{
  esiId: Scalars['Int'];
}>;


export type GetEsiQuery = (
  { __typename?: 'Query' }
  & { esi: Maybe<(
    { __typename?: 'ExperimentSafetyInput' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), sampleEsis: Array<(
      { __typename?: 'SampleExperimentSafetyInput' }
      & { sample: (
        { __typename?: 'Sample' }
        & SampleFragment
      ), questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
      ) }
      & SampleEsiFragment
    )>, proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId' | 'title'>
      & { samples: Maybe<Array<(
        { __typename?: 'Sample' }
        & SampleFragment
      )>>, questionary: (
        { __typename?: 'Questionary' }
        & QuestionaryFragment
      ) }
    ) }
    & EsiFragment
  )> }
);

export type UpdateEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateEsiMutation = (
  { __typename?: 'Mutation' }
  & { updateEsi: (
    { __typename?: 'EsiResponseWrap' }
    & { esi: Maybe<(
      { __typename?: 'ExperimentSafetyInput' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sampleEsis: Array<(
        { __typename?: 'SampleExperimentSafetyInput' }
        & { sample: (
          { __typename?: 'Sample' }
          & SampleFragment
        ), questionary: (
          { __typename?: 'Questionary' }
          & Pick<Questionary, 'isCompleted'>
        ) }
        & SampleEsiFragment
      )> }
      & EsiFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetEventLogsQueryVariables = Exact<{
  eventType: Scalars['String'];
  changedObjectId: Scalars['String'];
}>;


export type GetEventLogsQuery = (
  { __typename?: 'Query' }
  & { eventLogs: Maybe<Array<(
    { __typename?: 'EventLog' }
    & Pick<EventLog, 'id' | 'eventType' | 'eventTStamp' | 'rowData' | 'changedObjectId'>
    & { changedBy: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'firstname' | 'lastname' | 'email'>
    ) }
  )>> }
);

export type CloneGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
}>;


export type CloneGenericTemplateMutation = (
  { __typename?: 'Mutation' }
  & { cloneGenericTemplate: (
    { __typename?: 'GenericTemplateResponseWrap' }
    & { genericTemplate: Maybe<(
      { __typename?: 'GenericTemplate' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & GenericTemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateGenericTemplateMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
}>;


export type CreateGenericTemplateMutation = (
  { __typename?: 'Mutation' }
  & { createGenericTemplate: (
    { __typename?: 'GenericTemplateResponseWrap' }
    & { genericTemplate: Maybe<(
      { __typename?: 'GenericTemplate' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & GenericTemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type DeleteGenericTemplateMutation = (
  { __typename?: 'Mutation' }
  & { deleteGenericTemplate: (
    { __typename?: 'GenericTemplateResponseWrap' }
    & { genericTemplate: Maybe<(
      { __typename?: 'GenericTemplate' }
      & GenericTemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GenericTemplateFragment = (
  { __typename?: 'GenericTemplate' }
  & Pick<GenericTemplate, 'id' | 'title' | 'creatorId' | 'questionaryId' | 'created' | 'proposalPk' | 'questionId'>
);

export type GetGenericTemplateQueryVariables = Exact<{
  genericTemplateId: Scalars['Int'];
}>;


export type GetGenericTemplateQuery = (
  { __typename?: 'Query' }
  & { genericTemplate: Maybe<(
    { __typename?: 'GenericTemplate' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & GenericTemplateFragment
  )> }
);

export type GetGenericTemplatesWithProposalDataQueryVariables = Exact<{
  filter?: Maybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithProposalDataQuery = (
  { __typename?: 'Query' }
  & { genericTemplates: Maybe<Array<(
    { __typename?: 'GenericTemplate' }
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId'>
    ) }
    & GenericTemplateFragment
  )>> }
);

export type GetGenericTemplatesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: Maybe<GenericTemplatesFilter>;
}>;


export type GetGenericTemplatesWithQuestionaryStatusQuery = (
  { __typename?: 'Query' }
  & { genericTemplates: Maybe<Array<(
    { __typename?: 'GenericTemplate' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
    ) }
    & GenericTemplateFragment
  )>> }
);

export type UpdateGenericTemplateMutationVariables = Exact<{
  genericTemplateId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
}>;


export type UpdateGenericTemplateMutation = (
  { __typename?: 'Mutation' }
  & { updateGenericTemplate: (
    { __typename?: 'GenericTemplateResponseWrap' }
    & { genericTemplate: Maybe<(
      { __typename?: 'GenericTemplate' }
      & GenericTemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AssignProposalsToInstrumentMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  instrumentId: Scalars['Int'];
}>;


export type AssignProposalsToInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { assignProposalsToInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AssignScientistsToInstrumentMutationVariables = Exact<{
  scientistIds: Array<Scalars['Int']> | Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type AssignScientistsToInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { assignScientistsToInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateInstrumentMutationVariables = Exact<{
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type CreateInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { createInstrument: (
    { __typename?: 'InstrumentResponseWrap' }
    & { instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description' | 'managerUserId'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { deleteInstrument: (
    { __typename?: 'InstrumentResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetInstrumentsQueryVariables = Exact<{
  callIds?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetInstrumentsQuery = (
  { __typename?: 'Query' }
  & { instruments: Maybe<(
    { __typename?: 'InstrumentsQueryResult' }
    & Pick<InstrumentsQueryResult, 'totalCount'>
    & { instruments: Array<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description' | 'managerUserId'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  )> }
);

export type GetUserInstrumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserInstrumentsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { instruments: Array<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  )> }
);

export type RemoveProposalsFromInstrumentMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type RemoveProposalsFromInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { removeProposalsFromInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type RemoveScientistFromInstrumentMutationVariables = Exact<{
  scientistId: Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type RemoveScientistFromInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { removeScientistFromInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SetInstrumentAvailabilityTimeMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  availabilityTime: Scalars['Int'];
}>;


export type SetInstrumentAvailabilityTimeMutation = (
  { __typename?: 'Mutation' }
  & { setInstrumentAvailabilityTime: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SubmitInstrumentMutationVariables = Exact<{
  callId: Scalars['Int'];
  instrumentId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type SubmitInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { submitInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  managerUserId: Scalars['Int'];
}>;


export type UpdateInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { updateInstrument: (
    { __typename?: 'InstrumentResponseWrap' }
    & { instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description' | 'managerUserId'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AdministrationProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  finalStatus?: Maybe<ProposalEndStatus>;
  statusId?: Maybe<Scalars['Int']>;
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
  managementTimeAllocation?: Maybe<Scalars['Int']>;
  managementDecisionSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type AdministrationProposalMutation = (
  { __typename?: 'Mutation' }
  & { administrationProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type ChangeProposalsStatusMutationVariables = Exact<{
  proposals: Array<ProposalPkWithCallId> | ProposalPkWithCallId;
  statusId: Scalars['Int'];
}>;


export type ChangeProposalsStatusMutation = (
  { __typename?: 'Mutation' }
  & { changeProposalsStatus: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CloneProposalsMutationVariables = Exact<{
  proposalsToClonePk: Array<Scalars['Int']> | Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type CloneProposalsMutation = (
  { __typename?: 'Mutation' }
  & { cloneProposals: (
    { __typename?: 'ProposalsResponseWrap' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & CoreTechnicalReviewFragment
      )>, reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>
        )> }
      )>>, instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'id' | 'name' | 'shortCode'>
      )>, call: Maybe<(
        { __typename?: 'Call' }
        & Pick<Call, 'id' | 'shortCode' | 'isActive'>
      )> }
      & ProposalFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateProposalMutationVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type CreateProposalMutation = (
  { __typename?: 'Mutation' }
  & { createProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId' | 'questionaryId'>
      & { status: Maybe<(
        { __typename?: 'ProposalStatus' }
        & ProposalStatusFragment
      )>, questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, samples: Maybe<Array<(
        { __typename?: 'Sample' }
        & { questionary: (
          { __typename?: 'Questionary' }
          & Pick<Questionary, 'isCompleted'>
        ) }
        & SampleFragment
      )>>, genericTemplates: Maybe<Array<(
        { __typename?: 'GenericTemplate' }
        & { questionary: (
          { __typename?: 'Questionary' }
          & Pick<Questionary, 'isCompleted'>
        ) }
        & GenericTemplateFragment
      )>> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type DeleteProposalMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey'>
    )> }
  ) }
);

export type CoreTechnicalReviewFragment = (
  { __typename?: 'TechnicalReview' }
  & Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalPk' | 'submitted'>
);

export type ProposalFragment = (
  { __typename?: 'Proposal' }
  & Pick<Proposal, 'primaryKey' | 'title' | 'abstract' | 'statusId' | 'publicStatus' | 'proposalId' | 'finalStatus' | 'commentForUser' | 'commentForManagement' | 'created' | 'updated' | 'callId' | 'questionaryId' | 'notified' | 'submitted' | 'managementTimeAllocation' | 'managementDecisionSubmitted' | 'technicalReviewAssignee'>
  & { status: Maybe<(
    { __typename?: 'ProposalStatus' }
    & ProposalStatusFragment
  )>, sepMeetingDecision: Maybe<(
    { __typename?: 'SepMeetingDecision' }
    & SepMeetingDecisionFragment
  )> }
);

export type GetInstrumentScientistProposalsQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
}>;


export type GetInstrumentScientistProposalsQuery = (
  { __typename?: 'Query' }
  & { instrumentScientistProposals: Maybe<(
    { __typename?: 'ProposalsQueryResult' }
    & Pick<ProposalsQueryResult, 'totalCount'>
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>
        )> }
      )>>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & CoreTechnicalReviewFragment
      )>, instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'id' | 'name'>
      )>, call: Maybe<(
        { __typename?: 'Call' }
        & Pick<Call, 'id' | 'shortCode' | 'allocationTimeUnit'>
      )>, sep: Maybe<(
        { __typename?: 'SEP' }
        & Pick<Sep, 'id' | 'code'>
      )> }
      & ProposalFragment
    )> }
  )> }
);

export type GetMyProposalsQueryVariables = Exact<{
  filter?: Maybe<UserProposalsFilter>;
}>;


export type GetMyProposalsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & ProposalFragment
    )> }
  )> }
);

export type GetProposalQueryVariables = Exact<{
  primaryKey: Scalars['Int'];
}>;


export type GetProposalQuery = (
  { __typename?: 'Query' }
  & { proposal: Maybe<(
    { __typename?: 'Proposal' }
    & { proposer: Maybe<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & { reviewer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
      & CoreTechnicalReviewFragment
    )>, reviews: Maybe<Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
      & { reviewer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>
      )> }
    )>>, instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode'>
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id' | 'shortCode' | 'isActive' | 'allocationTimeUnit'>
    )>, sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code'>
    )>, samples: Maybe<Array<(
      { __typename?: 'Sample' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
      ) }
      & SampleFragment
    )>>, genericTemplates: Maybe<Array<(
      { __typename?: 'GenericTemplate' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
      ) }
      & GenericTemplateFragment
    )>> }
    & ProposalFragment
  )> }
);

export type GetProposalsQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
}>;


export type GetProposalsQuery = (
  { __typename?: 'Query' }
  & { proposals: Maybe<(
    { __typename?: 'ProposalsQueryResult' }
    & Pick<ProposalsQueryResult, 'totalCount'>
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & Pick<BasicUserDetails, 'firstname' | 'lastname' | 'id'>
        )> }
      )>>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & { reviewer: Maybe<(
          { __typename?: 'BasicUserDetails' }
          & BasicUserDetailsFragment
        )> }
        & CoreTechnicalReviewFragment
      )>, instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'id' | 'name'>
      )>, call: Maybe<(
        { __typename?: 'Call' }
        & Pick<Call, 'id' | 'shortCode'>
      )>, sep: Maybe<(
        { __typename?: 'SEP' }
        & Pick<Sep, 'id' | 'code'>
      )> }
      & ProposalFragment
    )> }
  )> }
);

export type GetProposalsCoreQueryVariables = Exact<{
  filter?: Maybe<ProposalsFilter>;
}>;


export type GetProposalsCoreQuery = (
  { __typename?: 'Query' }
  & { proposalsView: Maybe<Array<(
    { __typename?: 'ProposalView' }
    & Pick<ProposalView, 'primaryKey' | 'title' | 'statusId' | 'statusName' | 'statusDescription' | 'proposalId' | 'rankOrder' | 'finalStatus' | 'notified' | 'timeAllocation' | 'technicalStatus' | 'instrumentName' | 'callShortCode' | 'sepCode' | 'sepId' | 'reviewAverage' | 'reviewDeviation' | 'instrumentId' | 'callId' | 'submitted' | 'allocationTimeUnit'>
  )>> }
);

export type NotifyProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type NotifyProposalMutation = (
  { __typename?: 'Mutation' }
  & { notifyProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SubmitProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type SubmitProposalMutation = (
  { __typename?: 'Mutation' }
  & { submitProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & ProposalFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateProposalMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
  proposerId?: Maybe<Scalars['Int']>;
}>;


export type UpdateProposalMutation = (
  { __typename?: 'Mutation' }
  & { updateProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'title' | 'abstract'>
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetUserProposalBookingsWithEventsQueryVariables = Exact<{
  endsAfter?: Maybe<Scalars['TzLessDateTime']>;
  status?: Maybe<Array<ProposalBookingStatusCore> | ProposalBookingStatusCore>;
  instrumentId?: Maybe<Scalars['Int']>;
}>;


export type GetUserProposalBookingsWithEventsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'title' | 'proposalId' | 'finalStatus' | 'managementDecisionSubmitted'>
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, proposalBookingCore: Maybe<(
        { __typename?: 'ProposalBookingCore' }
        & { scheduledEvents: Array<(
          { __typename?: 'ScheduledEventCore' }
          & Pick<ScheduledEventCore, 'id' | 'startsAt' | 'endsAt' | 'bookingType'>
          & { visit: Maybe<(
            { __typename?: 'Visit' }
            & { teamLead: (
              { __typename?: 'BasicUserDetails' }
              & BasicUserDetailsFragment
            ), shipments: Array<(
              { __typename?: 'Shipment' }
              & ShipmentFragment
            )>, registrations: Array<(
              { __typename?: 'VisitRegistration' }
              & { user: (
                { __typename?: 'BasicUserDetails' }
                & BasicUserDetailsFragment
              ) }
              & VisitRegistrationFragment
            )> }
            & VisitFragment
          )>, esi: Maybe<(
            { __typename?: 'ExperimentSafetyInput' }
            & EsiFragment
          )> }
        )> }
      )>, visits: Maybe<Array<(
        { __typename?: 'Visit' }
        & VisitFragment
      )>>, instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'id' | 'name'>
      )> }
    )> }
  )> }
);

export type AnswerTopicMutationVariables = Exact<{
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
  answers: Array<AnswerInput> | AnswerInput;
  isPartialSave?: Maybe<Scalars['Boolean']>;
}>;


export type AnswerTopicMutation = (
  { __typename?: 'Mutation' }
  & { answerTopic: (
    { __typename?: 'QuestionaryStepResponseWrap' }
    & { questionaryStep: Maybe<(
      { __typename?: 'QuestionaryStep' }
      & QuestionaryStepFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateQuestionaryMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CreateQuestionaryMutation = (
  { __typename?: 'Mutation' }
  & { createQuestionary: (
    { __typename?: 'QuestionaryResponseWrap' }
    & { questionary: Maybe<(
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AnswerFragment = (
  { __typename?: 'Answer' }
  & Pick<Answer, 'answerId' | 'sortOrder' | 'topicId' | 'dependenciesOperator' | 'value'>
  & { question: (
    { __typename?: 'Question' }
    & QuestionFragment
  ), config: (
    { __typename?: 'BooleanConfig' }
    & FieldConfigBooleanConfigFragment
  ) | (
    { __typename?: 'DateConfig' }
    & FieldConfigDateConfigFragment
  ) | (
    { __typename?: 'EmbellishmentConfig' }
    & FieldConfigEmbellishmentConfigFragment
  ) | (
    { __typename?: 'FileUploadConfig' }
    & FieldConfigFileUploadConfigFragment
  ) | (
    { __typename?: 'GenericTemplateBasisConfig' }
    & FieldConfigGenericTemplateBasisConfigFragment
  ) | (
    { __typename?: 'IntervalConfig' }
    & FieldConfigIntervalConfigFragment
  ) | (
    { __typename?: 'NumberInputConfig' }
    & FieldConfigNumberInputConfigFragment
  ) | (
    { __typename?: 'ProposalBasisConfig' }
    & FieldConfigProposalBasisConfigFragment
  ) | (
    { __typename?: 'ProposalEsiBasisConfig' }
    & FieldConfigProposalEsiBasisConfigFragment
  ) | (
    { __typename?: 'RichTextInputConfig' }
    & FieldConfigRichTextInputConfigFragment
  ) | (
    { __typename?: 'SampleBasisConfig' }
    & FieldConfigSampleBasisConfigFragment
  ) | (
    { __typename?: 'SampleDeclarationConfig' }
    & FieldConfigSampleDeclarationConfigFragment
  ) | (
    { __typename?: 'SampleEsiBasisConfig' }
    & FieldConfigSampleEsiBasisConfigFragment
  ) | (
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'ShipmentBasisConfig' }
    & FieldConfigShipmentBasisConfigFragment
  ) | (
    { __typename?: 'SubTemplateConfig' }
    & FieldConfigSubTemplateConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'VisitBasisConfig' }
    & FieldConfigVisitBasisConfigFragment
  ), dependencies: Array<(
    { __typename?: 'FieldDependency' }
    & Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: (
      { __typename?: 'FieldCondition' }
      & FieldConditionFragment
    ) }
  )> }
);

export type QuestionaryFragment = (
  { __typename?: 'Questionary' }
  & Pick<Questionary, 'questionaryId' | 'templateId' | 'created'>
  & { steps: Array<(
    { __typename?: 'QuestionaryStep' }
    & QuestionaryStepFragment
  )> }
);

export type QuestionaryStepFragment = (
  { __typename?: 'QuestionaryStep' }
  & Pick<QuestionaryStep, 'isCompleted'>
  & { topic: (
    { __typename?: 'Topic' }
    & TopicFragment
  ), fields: Array<(
    { __typename?: 'Answer' }
    & AnswerFragment
  )> }
);

export type GetBlankQuestionaryQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryQuery = (
  { __typename?: 'Query' }
  & { blankQuestionary: (
    { __typename?: 'Questionary' }
    & Pick<Questionary, 'isCompleted'>
    & QuestionaryFragment
  ) }
);

export type GetBlankQuestionaryStepsQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetBlankQuestionaryStepsQuery = (
  { __typename?: 'Query' }
  & { blankQuestionarySteps: Maybe<Array<(
    { __typename?: 'QuestionaryStep' }
    & QuestionaryStepFragment
  )>> }
);

export type GetFileMetadataQueryVariables = Exact<{
  fileIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type GetFileMetadataQuery = (
  { __typename?: 'Query' }
  & { fileMetadata: Maybe<Array<(
    { __typename?: 'FileMetadata' }
    & Pick<FileMetadata, 'fileId' | 'originalFileName' | 'mimeType' | 'sizeInBytes' | 'createdDate'>
  )>> }
);

export type GetQuestionaryQueryVariables = Exact<{
  questionaryId: Scalars['Int'];
}>;


export type GetQuestionaryQuery = (
  { __typename?: 'Query' }
  & { questionary: Maybe<(
    { __typename?: 'Questionary' }
    & QuestionaryFragment
  )> }
);

export type AddTechnicalReviewMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  timeAllocation?: Maybe<Scalars['Int']>;
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
}>;


export type AddTechnicalReviewMutation = (
  { __typename?: 'Mutation' }
  & { addTechnicalReview: (
    { __typename?: 'TechnicalReviewResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & Pick<TechnicalReview, 'id'>
    )> }
  ) }
);

export type AddUserForReviewMutationVariables = Exact<{
  userID: Scalars['Int'];
  proposalPk: Scalars['Int'];
  sepID: Scalars['Int'];
}>;


export type AddUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { addUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, review: Maybe<(
      { __typename?: 'Review' }
      & Pick<Review, 'id'>
    )> }
  ) }
);

export type UpdateTechnicalReviewAssigneeMutationVariables = Exact<{
  proposalPks: Array<Scalars['Int']> | Scalars['Int'];
  userId: Scalars['Int'];
}>;


export type UpdateTechnicalReviewAssigneeMutation = (
  { __typename?: 'Mutation' }
  & { updateTechnicalReviewAssignee: (
    { __typename?: 'ProposalsResponseWrap' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & ProposalFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CoreReviewFragment = (
  { __typename?: 'Review' }
  & Pick<Review, 'id' | 'userID' | 'status' | 'comment' | 'grade' | 'sepID'>
);

export type GetProposalReviewsQueryVariables = Exact<{
  proposalPk: Scalars['Int'];
}>;


export type GetProposalReviewsQuery = (
  { __typename?: 'Query' }
  & { proposalReviews: Maybe<Array<(
    { __typename?: 'Review' }
    & Pick<Review, 'id' | 'userID' | 'comment' | 'grade' | 'status' | 'sepID'>
  )>> }
);

export type GetReviewQueryVariables = Exact<{
  reviewId: Scalars['Int'];
  sepId?: Maybe<Scalars['Int']>;
}>;


export type GetReviewQuery = (
  { __typename?: 'Query' }
  & { review: Maybe<(
    { __typename?: 'Review' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'title' | 'abstract'>
      & { proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & Pick<BasicUserDetails, 'id'>
      )> }
    )>, reviewer: Maybe<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
    & CoreReviewFragment
  )> }
);

export type RemoveUserForReviewMutationVariables = Exact<{
  reviewId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { removeUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SubmitProposalsReviewMutationVariables = Exact<{
  proposals: Array<ProposalPkWithReviewId> | ProposalPkWithReviewId;
}>;


export type SubmitProposalsReviewMutation = (
  { __typename?: 'Mutation' }
  & { submitProposalsReview: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SubmitTechnicalReviewMutationVariables = Exact<{
  proposalPk: Scalars['Int'];
  timeAllocation?: Maybe<Scalars['Int']>;
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  status?: Maybe<TechnicalReviewStatus>;
  submitted: Scalars['Boolean'];
  reviewerId: Scalars['Int'];
}>;


export type SubmitTechnicalReviewMutation = (
  { __typename?: 'Mutation' }
  & { submitTechnicalReview: (
    { __typename?: 'TechnicalReviewResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & Pick<TechnicalReview, 'id'>
    )> }
  ) }
);

export type AddReviewMutationVariables = Exact<{
  reviewID: Scalars['Int'];
  grade: Scalars['Int'];
  comment: Scalars['String'];
  status: ReviewStatus;
  sepID: Scalars['Int'];
}>;


export type AddReviewMutation = (
  { __typename?: 'Mutation' }
  & { addReview: (
    { __typename?: 'ReviewWithNextStatusResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, review: Maybe<(
      { __typename?: 'ReviewWithNextProposalStatus' }
      & Pick<ReviewWithNextProposalStatus, 'id' | 'userID' | 'status' | 'comment' | 'grade' | 'sepID'>
      & { nextProposalStatus: Maybe<(
        { __typename?: 'NextProposalStatus' }
        & Pick<NextProposalStatus, 'id' | 'shortCode' | 'name'>
      )> }
    )> }
  ) }
);

export type UserWithReviewsQueryVariables = Exact<{
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
  status?: Maybe<ReviewStatus>;
  reviewer?: Maybe<ReviewerFilter>;
}>;


export type UserWithReviewsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'firstname' | 'lastname' | 'organisation'>
    & { reviews: Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'sepID'>
      & { proposal: Maybe<(
        { __typename?: 'Proposal' }
        & Pick<Proposal, 'primaryKey' | 'title' | 'proposalId'>
        & { call: Maybe<(
          { __typename?: 'Call' }
          & Pick<Call, 'shortCode'>
        )>, instrument: Maybe<(
          { __typename?: 'Instrument' }
          & Pick<Instrument, 'shortCode'>
        )> }
      )> }
    )> }
  )> }
);

export type CreateSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type CreateSampleEsiMutation = (
  { __typename?: 'Mutation' }
  & { createSampleEsi: (
    { __typename?: 'SampleEsiResponseWrap' }
    & { esi: Maybe<(
      { __typename?: 'SampleExperimentSafetyInput' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sample: (
        { __typename?: 'Sample' }
        & SampleFragment
      ) }
      & SampleEsiFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteSampleEsiMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type DeleteSampleEsiMutation = (
  { __typename?: 'Mutation' }
  & { deleteSampleEsi: (
    { __typename?: 'SampleEsiResponseWrap' }
    & { esi: Maybe<(
      { __typename?: 'SampleExperimentSafetyInput' }
      & SampleEsiFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SampleEsiFragment = (
  { __typename?: 'SampleExperimentSafetyInput' }
  & Pick<SampleExperimentSafetyInput, 'sampleId' | 'esiId' | 'questionaryId' | 'isSubmitted'>
);

export type GetSampleEsiQueryVariables = Exact<{
  sampleId: Scalars['Int'];
  esiId: Scalars['Int'];
}>;


export type GetSampleEsiQuery = (
  { __typename?: 'Query' }
  & { sampleEsi: Maybe<(
    { __typename?: 'SampleExperimentSafetyInput' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), sample: (
      { __typename?: 'Sample' }
      & SampleFragment
    ) }
    & SampleEsiFragment
  )> }
);

export type UpdateSampleEsiMutationVariables = Exact<{
  esiId: Scalars['Int'];
  sampleId: Scalars['Int'];
  isSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateSampleEsiMutation = (
  { __typename?: 'Mutation' }
  & { updateSampleEsi: (
    { __typename?: 'SampleEsiResponseWrap' }
    & { esi: Maybe<(
      { __typename?: 'SampleExperimentSafetyInput' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), sample: (
        { __typename?: 'Sample' }
        & SampleFragment
      ) }
      & SampleEsiFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CloneSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
}>;


export type CloneSampleMutation = (
  { __typename?: 'Mutation' }
  & { cloneSample: (
    { __typename?: 'SampleResponseWrap' }
    & { sample: Maybe<(
      { __typename?: 'Sample' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & SampleFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateSampleMutationVariables = Exact<{
  title: Scalars['String'];
  templateId: Scalars['Int'];
  proposalPk: Scalars['Int'];
  questionId: Scalars['String'];
  isPostProposalSubmission?: Maybe<Scalars['Boolean']>;
}>;


export type CreateSampleMutation = (
  { __typename?: 'Mutation' }
  & { createSample: (
    { __typename?: 'SampleResponseWrap' }
    & { sample: Maybe<(
      { __typename?: 'Sample' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & SampleFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type DeleteSampleMutation = (
  { __typename?: 'Mutation' }
  & { deleteSample: (
    { __typename?: 'SampleResponseWrap' }
    & { sample: Maybe<(
      { __typename?: 'Sample' }
      & SampleFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SampleFragment = (
  { __typename?: 'Sample' }
  & Pick<Sample, 'id' | 'title' | 'creatorId' | 'questionaryId' | 'safetyStatus' | 'safetyComment' | 'isPostProposalSubmission' | 'created' | 'proposalPk' | 'questionId'>
);

export type GetSampleQueryVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type GetSampleQuery = (
  { __typename?: 'Query' }
  & { sample: Maybe<(
    { __typename?: 'Sample' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & SampleFragment
  )> }
);

export type GetSamplesByCallIdQueryVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type GetSamplesByCallIdQuery = (
  { __typename?: 'Query' }
  & { samplesByCallId: Maybe<Array<(
    { __typename?: 'Sample' }
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId'>
    ) }
    & SampleFragment
  )>> }
);

export type GetSamplesWithProposalDataQueryVariables = Exact<{
  filter?: Maybe<SamplesFilter>;
}>;


export type GetSamplesWithProposalDataQuery = (
  { __typename?: 'Query' }
  & { samples: Maybe<Array<(
    { __typename?: 'Sample' }
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId'>
    ) }
    & SampleFragment
  )>> }
);

export type GetSamplesWithQuestionaryStatusQueryVariables = Exact<{
  filter?: Maybe<SamplesFilter>;
}>;


export type GetSamplesWithQuestionaryStatusQuery = (
  { __typename?: 'Query' }
  & { samples: Maybe<Array<(
    { __typename?: 'Sample' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
    ) }
    & SampleFragment
  )>> }
);

export type UpdateSampleMutationVariables = Exact<{
  sampleId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  safetyComment?: Maybe<Scalars['String']>;
  safetyStatus?: Maybe<SampleStatus>;
}>;


export type UpdateSampleMutation = (
  { __typename?: 'Mutation' }
  & { updateSample: (
    { __typename?: 'SampleResponseWrap' }
    & { sample: Maybe<(
      { __typename?: 'Sample' }
      & SampleFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AddProposalWorkflowStatusMutationVariables = Exact<{
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
  droppableGroupId: Scalars['String'];
  parentDroppableGroupId?: Maybe<Scalars['String']>;
  proposalStatusId: Scalars['Int'];
  nextProposalStatusId?: Maybe<Scalars['Int']>;
  prevProposalStatusId?: Maybe<Scalars['Int']>;
}>;


export type AddProposalWorkflowStatusMutation = (
  { __typename?: 'Mutation' }
  & { addProposalWorkflowStatus: (
    { __typename?: 'ProposalWorkflowConnectionResponseWrap' }
    & { proposalWorkflowConnection: Maybe<(
      { __typename?: 'ProposalWorkflowConnection' }
      & Pick<ProposalWorkflowConnection, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AddStatusChangingEventsToConnectionMutationVariables = Exact<{
  proposalWorkflowConnectionId: Scalars['Int'];
  statusChangingEvents: Array<Scalars['String']> | Scalars['String'];
}>;


export type AddStatusChangingEventsToConnectionMutation = (
  { __typename?: 'Mutation' }
  & { addStatusChangingEventsToConnection: (
    { __typename?: 'ProposalStatusChangingEventResponseWrap' }
    & { statusChangingEvents: Maybe<Array<(
      { __typename?: 'StatusChangingEvent' }
      & Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>
    )>>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateProposalStatusMutationVariables = Exact<{
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalStatusMutation = (
  { __typename?: 'Mutation' }
  & { createProposalStatus: (
    { __typename?: 'ProposalStatusResponseWrap' }
    & { proposalStatus: Maybe<(
      { __typename?: 'ProposalStatus' }
      & ProposalStatusFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateProposalWorkflowMutationVariables = Exact<{
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateProposalWorkflowMutation = (
  { __typename?: 'Mutation' }
  & { createProposalWorkflow: (
    { __typename?: 'ProposalWorkflowResponseWrap' }
    & { proposalWorkflow: Maybe<(
      { __typename?: 'ProposalWorkflow' }
      & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
      & { proposalWorkflowConnectionGroups: Array<(
        { __typename?: 'ProposalWorkflowConnectionGroup' }
        & Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
        & { connections: Array<(
          { __typename?: 'ProposalWorkflowConnection' }
          & Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
          & { proposalStatus: (
            { __typename?: 'ProposalStatus' }
            & ProposalStatusFragment
          ), statusChangingEvents: Maybe<Array<(
            { __typename?: 'StatusChangingEvent' }
            & Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>
          )>> }
        )> }
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalStatusMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposalStatus: (
    { __typename?: 'ProposalStatusResponseWrap' }
    & { proposalStatus: Maybe<(
      { __typename?: 'ProposalStatus' }
      & ProposalStatusFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalWorkflowMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposalWorkflow: (
    { __typename?: 'ProposalWorkflowResponseWrap' }
    & { proposalWorkflow: Maybe<(
      { __typename?: 'ProposalWorkflow' }
      & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteProposalWorkflowStatusMutationVariables = Exact<{
  proposalStatusId: Scalars['Int'];
  proposalWorkflowId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type DeleteProposalWorkflowStatusMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposalWorkflowStatus: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type ProposalStatusFragment = (
  { __typename?: 'ProposalStatus' }
  & Pick<ProposalStatus, 'id' | 'shortCode' | 'name' | 'description' | 'isDefault'>
);

export type GetProposalEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalEventsQuery = (
  { __typename?: 'Query' }
  & { proposalEvents: Maybe<Array<(
    { __typename?: 'ProposalEvent' }
    & Pick<ProposalEvent, 'name' | 'description'>
  )>> }
);

export type GetProposalStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalStatusesQuery = (
  { __typename?: 'Query' }
  & { proposalStatuses: Maybe<Array<(
    { __typename?: 'ProposalStatus' }
    & ProposalStatusFragment
  )>> }
);

export type GetProposalWorkflowQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetProposalWorkflowQuery = (
  { __typename?: 'Query' }
  & { proposalWorkflow: Maybe<(
    { __typename?: 'ProposalWorkflow' }
    & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
    & { proposalWorkflowConnectionGroups: Array<(
      { __typename?: 'ProposalWorkflowConnectionGroup' }
      & Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
      & { connections: Array<(
        { __typename?: 'ProposalWorkflowConnection' }
        & Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
        & { proposalStatus: (
          { __typename?: 'ProposalStatus' }
          & ProposalStatusFragment
        ), statusChangingEvents: Maybe<Array<(
          { __typename?: 'StatusChangingEvent' }
          & Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>
        )>> }
      )> }
    )> }
  )> }
);

export type GetProposalWorkflowsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProposalWorkflowsQuery = (
  { __typename?: 'Query' }
  & { proposalWorkflows: Maybe<Array<(
    { __typename?: 'ProposalWorkflow' }
    & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
  )>> }
);

export type MoveProposalWorkflowStatusMutationVariables = Exact<{
  from: IndexWithGroupId;
  to: IndexWithGroupId;
  proposalWorkflowId: Scalars['Int'];
}>;


export type MoveProposalWorkflowStatusMutation = (
  { __typename?: 'Mutation' }
  & { moveProposalWorkflowStatus: (
    { __typename?: 'ProposalWorkflowConnectionResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateProposalStatusMutationVariables = Exact<{
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalStatusMutation = (
  { __typename?: 'Mutation' }
  & { updateProposalStatus: (
    { __typename?: 'ProposalStatusResponseWrap' }
    & { proposalStatus: Maybe<(
      { __typename?: 'ProposalStatus' }
      & ProposalStatusFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateProposalWorkflowMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateProposalWorkflowMutation = (
  { __typename?: 'Mutation' }
  & { updateProposalWorkflow: (
    { __typename?: 'ProposalWorkflowResponseWrap' }
    & { proposalWorkflow: Maybe<(
      { __typename?: 'ProposalWorkflow' }
      & Pick<ProposalWorkflow, 'id' | 'name' | 'description'>
      & { proposalWorkflowConnectionGroups: Array<(
        { __typename?: 'ProposalWorkflowConnectionGroup' }
        & Pick<ProposalWorkflowConnectionGroup, 'groupId' | 'parentGroupId'>
        & { connections: Array<(
          { __typename?: 'ProposalWorkflowConnection' }
          & Pick<ProposalWorkflowConnection, 'id' | 'sortOrder' | 'proposalWorkflowId' | 'proposalStatusId' | 'nextProposalStatusId' | 'prevProposalStatusId' | 'droppableGroupId'>
          & { proposalStatus: (
            { __typename?: 'ProposalStatus' }
            & Pick<ProposalStatus, 'id' | 'name' | 'description'>
          ), statusChangingEvents: Maybe<Array<(
            { __typename?: 'StatusChangingEvent' }
            & Pick<StatusChangingEvent, 'statusChangingEventId' | 'proposalWorkflowConnectionId' | 'statusChangingEvent'>
          )>> }
        )> }
      )> }
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type AddSamplesToShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  sampleIds: Array<Scalars['Int']> | Scalars['Int'];
}>;


export type AddSamplesToShipmentMutation = (
  { __typename?: 'Mutation' }
  & { addSamplesToShipment: (
    { __typename?: 'ShipmentResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, shipment: Maybe<(
      { __typename?: 'Shipment' }
      & { samples: Array<(
        { __typename?: 'Sample' }
        & SampleFragment
      )> }
      & ShipmentFragment
    )> }
  ) }
);

export type CreateShipmentMutationVariables = Exact<{
  title: Scalars['String'];
  proposalPk: Scalars['Int'];
  visitId: Scalars['Int'];
}>;


export type CreateShipmentMutation = (
  { __typename?: 'Mutation' }
  & { createShipment: (
    { __typename?: 'ShipmentResponseWrap' }
    & { shipment: Maybe<(
      { __typename?: 'Shipment' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ), samples: Array<(
        { __typename?: 'Sample' }
        & SampleFragment
      )> }
      & ShipmentFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type DeleteShipmentMutation = (
  { __typename?: 'Mutation' }
  & { deleteShipment: (
    { __typename?: 'ShipmentResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type ShipmentFragment = (
  { __typename?: 'Shipment' }
  & Pick<Shipment, 'id' | 'title' | 'proposalPk' | 'status' | 'externalRef' | 'questionaryId' | 'visitId' | 'creatorId' | 'created'>
  & { proposal: (
    { __typename?: 'Proposal' }
    & Pick<Proposal, 'proposalId'>
  ) }
);

export type GetMyShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyShipmentsQuery = (
  { __typename?: 'Query' }
  & { myShipments: Maybe<Array<(
    { __typename?: 'Shipment' }
    & ShipmentFragment
  )>> }
);

export type GetShipmentQueryVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type GetShipmentQuery = (
  { __typename?: 'Query' }
  & { shipment: Maybe<(
    { __typename?: 'Shipment' }
    & { questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ), samples: Array<(
      { __typename?: 'Sample' }
      & SampleFragment
    )> }
    & ShipmentFragment
  )> }
);

export type GetShipmentsQueryVariables = Exact<{
  filter?: Maybe<ShipmentsFilter>;
}>;


export type GetShipmentsQuery = (
  { __typename?: 'Query' }
  & { shipments: Maybe<Array<(
    { __typename?: 'Shipment' }
    & ShipmentFragment
  )>> }
);

export type SetActiveTemplateMutationVariables = Exact<{
  templateGroupId: TemplateGroupId;
  templateId: Scalars['Int'];
}>;


export type SetActiveTemplateMutation = (
  { __typename?: 'Mutation' }
  & { setActiveTemplate: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SubmitShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
}>;


export type SubmitShipmentMutation = (
  { __typename?: 'Mutation' }
  & { submitShipment: (
    { __typename?: 'ShipmentResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, shipment: Maybe<(
      { __typename?: 'Shipment' }
      & ShipmentFragment
    )> }
  ) }
);

export type UpdateShipmentMutationVariables = Exact<{
  shipmentId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  proposalPk?: Maybe<Scalars['Int']>;
  status?: Maybe<ShipmentStatus>;
}>;


export type UpdateShipmentMutation = (
  { __typename?: 'Mutation' }
  & { updateShipment: (
    { __typename?: 'ShipmentResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )>, shipment: Maybe<(
      { __typename?: 'Shipment' }
      & { questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & ShipmentFragment
    )> }
  ) }
);

export type CloneTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CloneTemplateMutation = (
  { __typename?: 'Mutation' }
  & { cloneTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateQuestionMutationVariables = Exact<{
  categoryId: TemplateCategoryId;
  dataType: DataType;
}>;


export type CreateQuestionMutation = (
  { __typename?: 'Mutation' }
  & { createQuestion: (
    { __typename?: 'QuestionResponseWrap' }
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateQuestionTemplateRelationMutationVariables = Exact<{
  templateId: Scalars['Int'];
  questionId: Scalars['String'];
  topicId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateQuestionTemplateRelationMutation = (
  { __typename?: 'Mutation' }
  & { createQuestionTemplateRelation: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateTemplateMutationVariables = Exact<{
  groupId: TemplateGroupId;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
}>;


export type CreateTemplateMutation = (
  { __typename?: 'Mutation' }
  & { createTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateTopicMutationVariables = Exact<{
  templateId: Scalars['Int'];
  sortOrder: Scalars['Int'];
}>;


export type CreateTopicMutation = (
  { __typename?: 'Mutation' }
  & { createTopic: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteQuestionMutationVariables = Exact<{
  questionId: Scalars['String'];
}>;


export type DeleteQuestionMutation = (
  { __typename?: 'Mutation' }
  & { deleteQuestion: (
    { __typename?: 'QuestionResponseWrap' }
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
}>;


export type DeleteQuestionTemplateRelationMutation = (
  { __typename?: 'Mutation' }
  & { deleteQuestionTemplateRelation: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteTemplateMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteTemplateMutation = (
  { __typename?: 'Mutation' }
  & { deleteTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & Pick<Template, 'templateId' | 'name'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
}>;


export type DeleteTopicMutation = (
  { __typename?: 'Mutation' }
  & { deleteTopic: (
    { __typename?: 'TemplateResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type FieldConditionFragment = (
  { __typename?: 'FieldCondition' }
  & Pick<FieldCondition, 'condition' | 'params'>
);

type FieldConfigBooleanConfigFragment = (
  { __typename?: 'BooleanConfig' }
  & Pick<BooleanConfig, 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigDateConfigFragment = (
  { __typename?: 'DateConfig' }
  & Pick<DateConfig, 'small_label' | 'required' | 'tooltip' | 'minDate' | 'maxDate' | 'defaultDate' | 'includeTime'>
);

type FieldConfigEmbellishmentConfigFragment = (
  { __typename?: 'EmbellishmentConfig' }
  & Pick<EmbellishmentConfig, 'html' | 'plain' | 'omitFromPdf'>
);

type FieldConfigFileUploadConfigFragment = (
  { __typename?: 'FileUploadConfig' }
  & Pick<FileUploadConfig, 'file_type' | 'max_files' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigGenericTemplateBasisConfigFragment = (
  { __typename?: 'GenericTemplateBasisConfig' }
  & Pick<GenericTemplateBasisConfig, 'titlePlaceholder' | 'questionLabel'>
);

type FieldConfigIntervalConfigFragment = (
  { __typename?: 'IntervalConfig' }
  & Pick<IntervalConfig, 'units' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigNumberInputConfigFragment = (
  { __typename?: 'NumberInputConfig' }
  & Pick<NumberInputConfig, 'units' | 'numberValueConstraint' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigProposalBasisConfigFragment = (
  { __typename?: 'ProposalBasisConfig' }
  & Pick<ProposalBasisConfig, 'tooltip'>
);

type FieldConfigProposalEsiBasisConfigFragment = (
  { __typename?: 'ProposalEsiBasisConfig' }
  & Pick<ProposalEsiBasisConfig, 'tooltip'>
);

type FieldConfigRichTextInputConfigFragment = (
  { __typename?: 'RichTextInputConfig' }
  & Pick<RichTextInputConfig, 'small_label' | 'required' | 'tooltip' | 'max'>
);

type FieldConfigSampleBasisConfigFragment = (
  { __typename?: 'SampleBasisConfig' }
  & Pick<SampleBasisConfig, 'titlePlaceholder'>
);

type FieldConfigSampleDeclarationConfigFragment = (
  { __typename?: 'SampleDeclarationConfig' }
  & Pick<SampleDeclarationConfig, 'addEntryButtonLabel' | 'minEntries' | 'maxEntries' | 'templateId' | 'esiTemplateId' | 'templateCategory' | 'required' | 'small_label'>
);

type FieldConfigSampleEsiBasisConfigFragment = (
  { __typename?: 'SampleEsiBasisConfig' }
  & Pick<SampleEsiBasisConfig, 'tooltip'>
);

type FieldConfigSelectionFromOptionsConfigFragment = (
  { __typename?: 'SelectionFromOptionsConfig' }
  & Pick<SelectionFromOptionsConfig, 'variant' | 'options' | 'isMultipleSelect' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigShipmentBasisConfigFragment = (
  { __typename?: 'ShipmentBasisConfig' }
  & Pick<ShipmentBasisConfig, 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigSubTemplateConfigFragment = (
  { __typename?: 'SubTemplateConfig' }
  & Pick<SubTemplateConfig, 'addEntryButtonLabel' | 'minEntries' | 'maxEntries' | 'templateId' | 'templateCategory' | 'required' | 'small_label'>
);

type FieldConfigTextInputConfigFragment = (
  { __typename?: 'TextInputConfig' }
  & Pick<TextInputConfig, 'min' | 'max' | 'multiline' | 'placeholder' | 'small_label' | 'required' | 'tooltip' | 'htmlQuestion' | 'isHtmlQuestion' | 'isCounterHidden'>
);

type FieldConfigVisitBasisConfigFragment = (
  { __typename?: 'VisitBasisConfig' }
  & Pick<VisitBasisConfig, 'small_label' | 'required' | 'tooltip'>
);

export type FieldConfigFragment = FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigGenericTemplateBasisConfigFragment | FieldConfigIntervalConfigFragment | FieldConfigNumberInputConfigFragment | FieldConfigProposalBasisConfigFragment | FieldConfigProposalEsiBasisConfigFragment | FieldConfigRichTextInputConfigFragment | FieldConfigSampleBasisConfigFragment | FieldConfigSampleDeclarationConfigFragment | FieldConfigSampleEsiBasisConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigShipmentBasisConfigFragment | FieldConfigSubTemplateConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigVisitBasisConfigFragment;

export type QuestionFragment = (
  { __typename?: 'Question' }
  & Pick<Question, 'id' | 'question' | 'naturalKey' | 'dataType' | 'categoryId'>
  & { config: (
    { __typename?: 'BooleanConfig' }
    & FieldConfigBooleanConfigFragment
  ) | (
    { __typename?: 'DateConfig' }
    & FieldConfigDateConfigFragment
  ) | (
    { __typename?: 'EmbellishmentConfig' }
    & FieldConfigEmbellishmentConfigFragment
  ) | (
    { __typename?: 'FileUploadConfig' }
    & FieldConfigFileUploadConfigFragment
  ) | (
    { __typename?: 'GenericTemplateBasisConfig' }
    & FieldConfigGenericTemplateBasisConfigFragment
  ) | (
    { __typename?: 'IntervalConfig' }
    & FieldConfigIntervalConfigFragment
  ) | (
    { __typename?: 'NumberInputConfig' }
    & FieldConfigNumberInputConfigFragment
  ) | (
    { __typename?: 'ProposalBasisConfig' }
    & FieldConfigProposalBasisConfigFragment
  ) | (
    { __typename?: 'ProposalEsiBasisConfig' }
    & FieldConfigProposalEsiBasisConfigFragment
  ) | (
    { __typename?: 'RichTextInputConfig' }
    & FieldConfigRichTextInputConfigFragment
  ) | (
    { __typename?: 'SampleBasisConfig' }
    & FieldConfigSampleBasisConfigFragment
  ) | (
    { __typename?: 'SampleDeclarationConfig' }
    & FieldConfigSampleDeclarationConfigFragment
  ) | (
    { __typename?: 'SampleEsiBasisConfig' }
    & FieldConfigSampleEsiBasisConfigFragment
  ) | (
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'ShipmentBasisConfig' }
    & FieldConfigShipmentBasisConfigFragment
  ) | (
    { __typename?: 'SubTemplateConfig' }
    & FieldConfigSubTemplateConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'VisitBasisConfig' }
    & FieldConfigVisitBasisConfigFragment
  ) }
);

export type QuestionTemplateRelationFragment = (
  { __typename?: 'QuestionTemplateRelation' }
  & Pick<QuestionTemplateRelation, 'sortOrder' | 'topicId' | 'dependenciesOperator'>
  & { question: (
    { __typename?: 'Question' }
    & QuestionFragment
  ), config: (
    { __typename?: 'BooleanConfig' }
    & FieldConfigBooleanConfigFragment
  ) | (
    { __typename?: 'DateConfig' }
    & FieldConfigDateConfigFragment
  ) | (
    { __typename?: 'EmbellishmentConfig' }
    & FieldConfigEmbellishmentConfigFragment
  ) | (
    { __typename?: 'FileUploadConfig' }
    & FieldConfigFileUploadConfigFragment
  ) | (
    { __typename?: 'GenericTemplateBasisConfig' }
    & FieldConfigGenericTemplateBasisConfigFragment
  ) | (
    { __typename?: 'IntervalConfig' }
    & FieldConfigIntervalConfigFragment
  ) | (
    { __typename?: 'NumberInputConfig' }
    & FieldConfigNumberInputConfigFragment
  ) | (
    { __typename?: 'ProposalBasisConfig' }
    & FieldConfigProposalBasisConfigFragment
  ) | (
    { __typename?: 'ProposalEsiBasisConfig' }
    & FieldConfigProposalEsiBasisConfigFragment
  ) | (
    { __typename?: 'RichTextInputConfig' }
    & FieldConfigRichTextInputConfigFragment
  ) | (
    { __typename?: 'SampleBasisConfig' }
    & FieldConfigSampleBasisConfigFragment
  ) | (
    { __typename?: 'SampleDeclarationConfig' }
    & FieldConfigSampleDeclarationConfigFragment
  ) | (
    { __typename?: 'SampleEsiBasisConfig' }
    & FieldConfigSampleEsiBasisConfigFragment
  ) | (
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'ShipmentBasisConfig' }
    & FieldConfigShipmentBasisConfigFragment
  ) | (
    { __typename?: 'SubTemplateConfig' }
    & FieldConfigSubTemplateConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'VisitBasisConfig' }
    & FieldConfigVisitBasisConfigFragment
  ), dependencies: Array<(
    { __typename?: 'FieldDependency' }
    & Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: (
      { __typename?: 'FieldCondition' }
      & FieldConditionFragment
    ) }
  )> }
);

export type TemplateFragment = (
  { __typename?: 'Template' }
  & Pick<Template, 'isArchived' | 'questionaryCount' | 'templateId' | 'groupId' | 'name' | 'description'>
  & { steps: Array<(
    { __typename?: 'TemplateStep' }
    & { topic: (
      { __typename?: 'Topic' }
      & TopicFragment
    ), fields: Array<(
      { __typename?: 'QuestionTemplateRelation' }
      & QuestionTemplateRelationFragment
    )> }
  )>, complementaryQuestions: Array<(
    { __typename?: 'Question' }
    & QuestionFragment
  )>, group: (
    { __typename?: 'TemplateGroup' }
    & Pick<TemplateGroup, 'groupId' | 'categoryId'>
  ) }
);

export type TemplateMetadataFragment = (
  { __typename?: 'Template' }
  & Pick<Template, 'templateId' | 'name' | 'description' | 'isArchived'>
);

export type TemplateStepFragment = (
  { __typename?: 'TemplateStep' }
  & { topic: (
    { __typename?: 'Topic' }
    & Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>
  ), fields: Array<(
    { __typename?: 'QuestionTemplateRelation' }
    & QuestionTemplateRelationFragment
  )> }
);

export type TopicFragment = (
  { __typename?: 'Topic' }
  & Pick<Topic, 'title' | 'id' | 'templateId' | 'sortOrder' | 'isEnabled'>
);

export type GetActiveTemplateIdQueryVariables = Exact<{
  templateGroupId: TemplateGroupId;
}>;


export type GetActiveTemplateIdQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'activeTemplateId'>
);

export type GetIsNaturalKeyPresentQueryVariables = Exact<{
  naturalKey: Scalars['String'];
}>;


export type GetIsNaturalKeyPresentQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'isNaturalKeyPresent'>
);

export type GetProposalTemplatesQueryVariables = Exact<{
  filter?: Maybe<ProposalTemplatesFilter>;
}>;


export type GetProposalTemplatesQuery = (
  { __typename?: 'Query' }
  & { proposalTemplates: Maybe<Array<(
    { __typename?: 'ProposalTemplate' }
    & Pick<ProposalTemplate, 'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount' | 'callCount'>
  )>> }
);

export type GetQuestionsQueryVariables = Exact<{
  filter?: Maybe<QuestionsFilter>;
}>;


export type GetQuestionsQuery = (
  { __typename?: 'Query' }
  & { questions: Array<(
    { __typename?: 'QuestionWithUsage' }
    & Pick<QuestionWithUsage, 'id' | 'question' | 'naturalKey' | 'dataType' | 'categoryId'>
    & { config: (
      { __typename?: 'BooleanConfig' }
      & FieldConfigBooleanConfigFragment
    ) | (
      { __typename?: 'DateConfig' }
      & FieldConfigDateConfigFragment
    ) | (
      { __typename?: 'EmbellishmentConfig' }
      & FieldConfigEmbellishmentConfigFragment
    ) | (
      { __typename?: 'FileUploadConfig' }
      & FieldConfigFileUploadConfigFragment
    ) | (
      { __typename?: 'GenericTemplateBasisConfig' }
      & FieldConfigGenericTemplateBasisConfigFragment
    ) | (
      { __typename?: 'IntervalConfig' }
      & FieldConfigIntervalConfigFragment
    ) | (
      { __typename?: 'NumberInputConfig' }
      & FieldConfigNumberInputConfigFragment
    ) | (
      { __typename?: 'ProposalBasisConfig' }
      & FieldConfigProposalBasisConfigFragment
    ) | (
      { __typename?: 'ProposalEsiBasisConfig' }
      & FieldConfigProposalEsiBasisConfigFragment
    ) | (
      { __typename?: 'RichTextInputConfig' }
      & FieldConfigRichTextInputConfigFragment
    ) | (
      { __typename?: 'SampleBasisConfig' }
      & FieldConfigSampleBasisConfigFragment
    ) | (
      { __typename?: 'SampleDeclarationConfig' }
      & FieldConfigSampleDeclarationConfigFragment
    ) | (
      { __typename?: 'SampleEsiBasisConfig' }
      & FieldConfigSampleEsiBasisConfigFragment
    ) | (
      { __typename?: 'SelectionFromOptionsConfig' }
      & FieldConfigSelectionFromOptionsConfigFragment
    ) | (
      { __typename?: 'ShipmentBasisConfig' }
      & FieldConfigShipmentBasisConfigFragment
    ) | (
      { __typename?: 'SubTemplateConfig' }
      & FieldConfigSubTemplateConfigFragment
    ) | (
      { __typename?: 'TextInputConfig' }
      & FieldConfigTextInputConfigFragment
    ) | (
      { __typename?: 'VisitBasisConfig' }
      & FieldConfigVisitBasisConfigFragment
    ), answers: Array<(
      { __typename?: 'AnswerBasic' }
      & Pick<AnswerBasic, 'questionaryId'>
    )>, templates: Array<(
      { __typename?: 'Template' }
      & Pick<Template, 'templateId'>
    )> }
  )> }
);

export type GetTemplateQueryVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type GetTemplateQuery = (
  { __typename?: 'Query' }
  & { template: Maybe<(
    { __typename?: 'Template' }
    & TemplateFragment
  )> }
);

export type GetTemplateCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTemplateCategoriesQuery = (
  { __typename?: 'Query' }
  & { templateCategories: Maybe<Array<(
    { __typename?: 'TemplateCategory' }
    & Pick<TemplateCategory, 'categoryId' | 'name'>
  )>> }
);

export type GetTemplatesQueryVariables = Exact<{
  filter?: Maybe<TemplatesFilter>;
}>;


export type GetTemplatesQuery = (
  { __typename?: 'Query' }
  & { templates: Maybe<Array<(
    { __typename?: 'Template' }
    & Pick<Template, 'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'>
  )>> }
);

export type UpdateQuestionMutationVariables = Exact<{
  id: Scalars['String'];
  naturalKey?: Maybe<Scalars['String']>;
  question?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
}>;


export type UpdateQuestionMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestion: (
    { __typename?: 'QuestionResponseWrap' }
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  topicId?: Maybe<Scalars['Int']>;
  sortOrder: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
}>;


export type UpdateQuestionTemplateRelationMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestionTemplateRelation: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateQuestionTemplateRelationSettingsMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  config?: Maybe<Scalars['String']>;
  dependencies: Array<FieldDependencyInput> | FieldDependencyInput;
  dependenciesOperator?: Maybe<DependenciesLogicOperator>;
}>;


export type UpdateQuestionTemplateRelationSettingsMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestionTemplateRelationSettings: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isArchived?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateTemplateMutation = (
  { __typename?: 'Mutation' }
  & { updateTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
  templateId?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  isEnabled?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateTopicMutation = (
  { __typename?: 'Mutation' }
  & { updateTopic: (
    { __typename?: 'TemplateResponseWrap' }
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CheckExternalTokenMutationVariables = Exact<{
  externalToken: Scalars['String'];
}>;


export type CheckExternalTokenMutation = (
  { __typename?: 'Mutation' }
  & { checkExternalToken: (
    { __typename?: 'CheckExternalTokenWrap' }
    & Pick<CheckExternalTokenWrap, 'token'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CheckTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type CheckTokenQuery = (
  { __typename?: 'Query' }
  & { checkToken: (
    { __typename?: 'TokenResult' }
    & Pick<TokenResult, 'isValid'>
  ) }
);

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


export type CreateUserMutation = (
  { __typename?: 'Mutation' }
  & { createUser: (
    { __typename?: 'UserResponseWrap' }
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateUserByEmailInviteMutationVariables = Exact<{
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  email: Scalars['String'];
  userRole: UserRole;
}>;


export type CreateUserByEmailInviteMutation = (
  { __typename?: 'Mutation' }
  & { createUserByEmailInvite: (
    { __typename?: 'CreateUserByEmailInviteResponseWrap' }
    & Pick<CreateUserByEmailInviteResponseWrap, 'id'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUserMutation = (
  { __typename?: 'Mutation' }
  & { deleteUser: (
    { __typename?: 'UserResponseWrap' }
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type BasicUserDetailsFragment = (
  { __typename?: 'BasicUserDetails' }
  & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation' | 'position' | 'created' | 'placeholder'>
);

export type GetBasicUserDetailsQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetBasicUserDetailsQuery = (
  { __typename?: 'Query' }
  & { basicUserDetails: Maybe<(
    { __typename?: 'BasicUserDetails' }
    & BasicUserDetailsFragment
  )> }
);

export type GetBasicUserDetailsByEmailQueryVariables = Exact<{
  email: Scalars['String'];
  role?: Maybe<UserRole>;
}>;


export type GetBasicUserDetailsByEmailQuery = (
  { __typename?: 'Query' }
  & { basicUserDetailsByEmail: Maybe<(
    { __typename?: 'BasicUserDetails' }
    & BasicUserDetailsFragment
  )> }
);

export type GetFieldsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFieldsQuery = (
  { __typename?: 'Query' }
  & { getFields: Maybe<(
    { __typename?: 'Fields' }
    & { nationalities: Array<(
      { __typename?: 'Entry' }
      & Pick<Entry, 'id' | 'value'>
    )> }
  )> }
);

export type GetMyRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyRolesQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'firstname' | 'lastname'>
    & { roles: Array<(
      { __typename?: 'Role' }
      & Pick<Role, 'id' | 'shortCode' | 'title'>
    )> }
  )> }
);

export type GetOrcIdInformationQueryVariables = Exact<{
  authorizationCode: Scalars['String'];
}>;


export type GetOrcIdInformationQuery = (
  { __typename?: 'Query' }
  & { getOrcIDInformation: Maybe<(
    { __typename?: 'OrcIDInformation' }
    & Pick<OrcIdInformation, 'firstname' | 'lastname' | 'orcid' | 'orcidHash' | 'refreshToken' | 'token'>
  )> }
);

export type GetPreviousCollaboratorsQueryVariables = Exact<{
  userId: Scalars['Int'];
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetPreviousCollaboratorsQuery = (
  { __typename?: 'Query' }
  & { previousCollaborators: Maybe<(
    { __typename?: 'UserQueryResult' }
    & Pick<UserQueryResult, 'totalCount'>
    & { users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
  )> }
);

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = (
  { __typename?: 'Query' }
  & { roles: Maybe<Array<(
    { __typename?: 'Role' }
    & Pick<Role, 'id' | 'shortCode' | 'title'>
  )>> }
);

export type GetTokenMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type GetTokenMutation = (
  { __typename?: 'Mutation' }
  & { token: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetTokenForUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetTokenForUserMutation = (
  { __typename?: 'Mutation' }
  & { getTokenForUser: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type GetUserQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid' | 'emailVerified' | 'placeholder'>
  )> }
);

export type GetUserMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserMeQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid' | 'emailVerified' | 'placeholder'>
  )> }
);

export type GetUserProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProposalsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'primaryKey' | 'proposalId' | 'title' | 'publicStatus' | 'statusId' | 'created' | 'finalStatus' | 'notified' | 'submitted'>
      & { status: Maybe<(
        { __typename?: 'ProposalStatus' }
        & ProposalStatusFragment
      )>, proposer: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & Pick<BasicUserDetails, 'id'>
      )>, call: Maybe<(
        { __typename?: 'Call' }
        & Pick<Call, 'id' | 'shortCode' | 'isActive'>
      )> }
    )> }
  )> }
);

export type GetUserWithRolesQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserWithRolesQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'firstname' | 'lastname'>
    & { roles: Array<(
      { __typename?: 'Role' }
      & Pick<Role, 'id' | 'shortCode' | 'title'>
    )> }
  )> }
);

export type GetUsersQueryVariables = Exact<{
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userRole?: Maybe<UserRole>;
  subtractUsers?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GetUsersQuery = (
  { __typename?: 'Query' }
  & { users: Maybe<(
    { __typename?: 'UserQueryResult' }
    & Pick<UserQueryResult, 'totalCount'>
    & { users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )> }
  )> }
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ResetPasswordMutation = (
  { __typename?: 'Mutation' }
  & { resetPassword: (
    { __typename?: 'BasicUserDetailsResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type ResetPasswordEmailMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ResetPasswordEmailMutation = (
  { __typename?: 'Mutation' }
  & { resetPasswordEmail: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SelectRoleMutationVariables = Exact<{
  token: Scalars['String'];
  selectedRoleId: Scalars['Int'];
}>;


export type SelectRoleMutation = (
  { __typename?: 'Mutation' }
  & { selectRole: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SetUserEmailVerifiedMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserEmailVerifiedMutation = (
  { __typename?: 'Mutation' }
  & { setUserEmailVerified: (
    { __typename?: 'UserResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type SetUserNotPlaceholderMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SetUserNotPlaceholderMutation = (
  { __typename?: 'Mutation' }
  & { setUserNotPlaceholder: (
    { __typename?: 'UserResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdatePasswordMutationVariables = Exact<{
  id: Scalars['Int'];
  password: Scalars['String'];
}>;


export type UpdatePasswordMutation = (
  { __typename?: 'Mutation' }
  & { updatePassword: (
    { __typename?: 'BasicUserDetailsResponseWrap' }
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

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


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser: (
    { __typename?: 'UserResponseWrap' }
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type UpdateUserRolesMutationVariables = Exact<{
  id: Scalars['Int'];
  roles?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type UpdateUserRolesMutation = (
  { __typename?: 'Mutation' }
  & { updateUserRoles: (
    { __typename?: 'UserResponseWrap' }
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type VerifyEmailMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type VerifyEmailMutation = (
  { __typename?: 'Mutation' }
  & { emailVerification: (
    { __typename?: 'EmailVerificationResponseWrap' }
    & Pick<EmailVerificationResponseWrap, 'success'>
    & { rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateVisitMutationVariables = Exact<{
  scheduledEventId: Scalars['Int'];
  team: Array<Scalars['Int']> | Scalars['Int'];
  teamLeadUserId: Scalars['Int'];
}>;


export type CreateVisitMutation = (
  { __typename?: 'Mutation' }
  & { createVisit: (
    { __typename?: 'VisitResponseWrap' }
    & { visit: Maybe<(
      { __typename?: 'Visit' }
      & { teamLead: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), registrations: Array<(
        { __typename?: 'VisitRegistration' }
        & { user: (
          { __typename?: 'BasicUserDetails' }
          & BasicUserDetailsFragment
        ) }
        & VisitRegistrationFragment
      )>, proposal: (
        { __typename?: 'Proposal' }
        & { instrument: Maybe<(
          { __typename?: 'Instrument' }
          & Pick<Instrument, 'name'>
        )> }
        & ProposalFragment
      ), shipments: Array<(
        { __typename?: 'Shipment' }
        & ShipmentFragment
      )> }
      & VisitFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type DeleteVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type DeleteVisitMutation = (
  { __typename?: 'Mutation' }
  & { deleteVisit: (
    { __typename?: 'VisitResponseWrap' }
    & { visit: Maybe<(
      { __typename?: 'Visit' }
      & VisitFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type VisitFragment = (
  { __typename?: 'Visit' }
  & Pick<Visit, 'id' | 'proposalPk' | 'status' | 'creatorId'>
);

export type GetVisitQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitQuery = (
  { __typename?: 'Query' }
  & { visit: Maybe<(
    { __typename?: 'Visit' }
    & { registrations: Array<(
      { __typename?: 'VisitRegistration' }
      & { user: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ) }
      & VisitRegistrationFragment
    )>, proposal: (
      { __typename?: 'Proposal' }
      & { instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'name'>
      )> }
      & ProposalFragment
    ) }
    & VisitFragment
  )> }
);

export type GetVisitsQueryVariables = Exact<{
  filter?: Maybe<VisitsFilter>;
}>;


export type GetVisitsQuery = (
  { __typename?: 'Query' }
  & { visits: Array<(
    { __typename?: 'Visit' }
    & { proposal: (
      { __typename?: 'Proposal' }
      & { instrument: Maybe<(
        { __typename?: 'Instrument' }
        & Pick<Instrument, 'name'>
      )> }
      & ProposalFragment
    ) }
    & VisitFragment
  )> }
);

export type UpdateVisitMutationVariables = Exact<{
  visitId: Scalars['Int'];
  team?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
  status?: Maybe<VisitStatus>;
  teamLeadUserId?: Maybe<Scalars['Int']>;
}>;


export type UpdateVisitMutation = (
  { __typename?: 'Mutation' }
  & { updateVisit: (
    { __typename?: 'VisitResponseWrap' }
    & { visit: Maybe<(
      { __typename?: 'Visit' }
      & { teamLead: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), registrations: Array<(
        { __typename?: 'VisitRegistration' }
        & { user: (
          { __typename?: 'BasicUserDetails' }
          & BasicUserDetailsFragment
        ) }
        & VisitRegistrationFragment
      )>, proposal: (
        { __typename?: 'Proposal' }
        & { instrument: Maybe<(
          { __typename?: 'Instrument' }
          & Pick<Instrument, 'name'>
        )> }
        & ProposalFragment
      ), shipments: Array<(
        { __typename?: 'Shipment' }
        & ShipmentFragment
      )> }
      & VisitFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type CreateVisitRegistrationQuestionaryMutationVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type CreateVisitRegistrationQuestionaryMutation = (
  { __typename?: 'Mutation' }
  & { createVisitRegistrationQuestionary: (
    { __typename?: 'VisitRegistrationResponseWrap' }
    & { registration: Maybe<(
      { __typename?: 'VisitRegistration' }
      & { user: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), questionary: (
        { __typename?: 'Questionary' }
        & Pick<Questionary, 'isCompleted'>
        & QuestionaryFragment
      ) }
      & VisitRegistrationFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

export type VisitRegistrationFragment = (
  { __typename?: 'VisitRegistration' }
  & Pick<VisitRegistration, 'userId' | 'visitId' | 'registrationQuestionaryId' | 'isRegistrationSubmitted' | 'trainingExpiryDate'>
);

export type GetVisitRegistrationQueryVariables = Exact<{
  visitId: Scalars['Int'];
}>;


export type GetVisitRegistrationQuery = (
  { __typename?: 'Query' }
  & { visitRegistration: Maybe<(
    { __typename?: 'VisitRegistration' }
    & { user: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), questionary: (
      { __typename?: 'Questionary' }
      & Pick<Questionary, 'isCompleted'>
      & QuestionaryFragment
    ) }
    & VisitRegistrationFragment
  )> }
);

export type UpdateVisitRegistrationMutationVariables = Exact<{
  visitId: Scalars['Int'];
  trainingExpiryDate?: Maybe<Scalars['DateTime']>;
  isRegistrationSubmitted?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateVisitRegistrationMutation = (
  { __typename?: 'Mutation' }
  & { updateVisitRegistration: (
    { __typename?: 'VisitRegistrationResponseWrap' }
    & { registration: Maybe<(
      { __typename?: 'VisitRegistration' }
      & VisitRegistrationFragment
    )>, rejection: Maybe<(
      { __typename?: 'Rejection' }
      & RejectionFragment
    )> }
  ) }
);

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
  visitId
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
}
    `;
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
      id
      firstname
      lastname
      organisation
      position
      placeholder
      created
    }
  }
}
    `;
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
      id
      firstname
      lastname
      organisation
      position
      placeholder
      created
    }
  }
}
    `;
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
    mutation createCall($shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $title: String, $description: String) {
  createCall(
    createCallInput: {shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, title: $title, description: $description}
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
    mutation updateCall($id: Int!, $shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startSEPReview: DateTime, $endSEPReview: DateTime, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $surveyComment: String!, $allocationTimeUnit: AllocationTimeUnits!, $referenceNumberFormat: String, $proposalWorkflowId: Int!, $templateId: Int!, $esiTemplateId: Int, $title: String, $description: String) {
  updateCall(
    updateCallInput: {id: $id, shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startSEPReview: $startSEPReview, endSEPReview: $endSEPReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, surveyComment: $surveyComment, allocationTimeUnit: $allocationTimeUnit, referenceNumberFormat: $referenceNumberFormat, proposalWorkflowId: $proposalWorkflowId, templateId: $templateId, esiTemplateId: $esiTemplateId, title: $title, description: $description}
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
      id
      name
      shortCode
      description
      managerUserId
      scientists {
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
      id
      name
      shortCode
      description
      managerUserId
      scientists {
        ...basicUserDetails
      }
    }
    totalCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const GetUserInstrumentsDocument = gql`
    query getUserInstruments {
  me {
    instruments {
      id
      name
      shortCode
      description
      scientists {
        ...basicUserDetails
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
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
      id
      name
      shortCode
      description
      managerUserId
      scientists {
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
    query getInstrumentScientistProposals($filter: ProposalsFilter) {
  instrumentScientistProposals(filter: $filter) {
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
      }
      instrument {
        id
        name
      }
      call {
        id
        shortCode
        allocationTimeUnit
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
    timeAllocation
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
          visit {
            ...visit
            teamLead {
              ...basicUserDetails
            }
            shipments {
              ...shipment
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
${ShipmentFragmentDoc}
${VisitRegistrationFragmentDoc}
${EsiFragmentDoc}`;
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
    mutation cloneSample($sampleId: Int!, $title: String) {
  cloneSample(sampleId: $sampleId, title: $title) {
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
    mutation createShipment($title: String!, $proposalPk: Int!, $visitId: Int!) {
  createShipment(title: $title, proposalPk: $proposalPk, visitId: $visitId) {
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
export const CloneTemplateDocument = gql`
    mutation cloneTemplate($templateId: Int!) {
  cloneTemplate(templateId: $templateId) {
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
export const CheckExternalTokenDocument = gql`
    mutation checkExternalToken($externalToken: String!) {
  checkExternalToken(externalToken: $externalToken) {
    token
    rejection {
      ...rejection
    }
  }
}
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
      shipments {
        ...shipment
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
${ShipmentFragmentDoc}
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
      shipments {
        ...shipment
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
${ShipmentFragmentDoc}
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
    checkExternalToken(variables: CheckExternalTokenMutationVariables): Promise<CheckExternalTokenMutation> {
      return withWrapper(() => client.request<CheckExternalTokenMutation>(print(CheckExternalTokenDocument), variables));
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