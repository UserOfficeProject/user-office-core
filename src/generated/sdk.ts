import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
  IntStringDateBool: any;
};

export type AddSepMembersRole = {
  userIDs: Array<Scalars['Int']>;
  roleID: UserRole;
  SEPID: Scalars['Int'];
};

export type AddUserRoleResponseWrap = {
  __typename?: 'AddUserRoleResponseWrap';
  error: Maybe<Scalars['String']>;
  success: Maybe<Scalars['Boolean']>;
};

export type Answer = {
  __typename?: 'Answer';
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
  config: FieldConfig;
  dependency: Maybe<FieldDependency>;
  value: Maybe<Scalars['IntStringDateBool']>;
};

export type AnswerInput = {
  questionId: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type AnswerResponseWrap = {
  __typename?: 'AnswerResponseWrap';
  error: Maybe<Scalars['String']>;
  answer: Answer;
};

export type AssignQuestionsToTopicResponseWrap = {
  __typename?: 'AssignQuestionsToTopicResponseWrap';
  error: Maybe<Scalars['String']>;
  result: Maybe<Array<Scalars['String']>>;
};

export type BasicUserDetails = {
  __typename?: 'BasicUserDetails';
  id: Scalars['Int'];
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  organisation: Scalars['String'];
  position: Scalars['String'];
  placeholder: Maybe<Scalars['Boolean']>;
  created: Maybe<Scalars['DateTime']>;
};

export type BasicUserDetailsResponseWrap = {
  __typename?: 'BasicUserDetailsResponseWrap';
  error: Maybe<Scalars['String']>;
  user: Maybe<BasicUserDetails>;
};

export type BooleanConfig = {
  __typename?: 'BooleanConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};

export type Call = {
  __typename?: 'Call';
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  templateId: Maybe<Scalars['Int']>;
  instruments: Array<InstrumentWithAvailabilityTime>;
};

export type CallResponseWrap = {
  __typename?: 'CallResponseWrap';
  error: Maybe<Scalars['String']>;
  call: Maybe<Call>;
};

export type CallsFilter = {
  templateIds?: Maybe<Array<Scalars['Int']>>;
  isActive?: Maybe<Scalars['Boolean']>;
};

export type ConfigBase = {
  __typename?: 'ConfigBase';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};

export type CreateUserByEmailInviteResponseWrap = {
  __typename?: 'CreateUserByEmailInviteResponseWrap';
  error: Maybe<Scalars['String']>;
  id: Maybe<Scalars['Int']>;
};

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT',
  SUBTEMPLATE = 'SUBTEMPLATE'
}

export type DateConfig = {
  __typename?: 'DateConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
};


export type EmailVerificationResponseWrap = {
  __typename?: 'EmailVerificationResponseWrap';
  error: Maybe<Scalars['String']>;
  success: Maybe<Scalars['Boolean']>;
};

export type EmbellishmentConfig = {
  __typename?: 'EmbellishmentConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  omitFromPdf: Scalars['Boolean'];
  html: Scalars['String'];
  plain: Scalars['String'];
};

export type Entry = {
  __typename?: 'Entry';
  id: Scalars['Int'];
  value: Scalars['String'];
};

export enum EvaluatorOperator {
  EQ = 'eq',
  NEQ = 'neq'
}

export type EventLog = {
  __typename?: 'EventLog';
  id: Scalars['Int'];
  eventType: Scalars['String'];
  rowData: Scalars['String'];
  eventTStamp: Scalars['DateTime'];
  changedObjectId: Scalars['String'];
  changedBy: User;
};

export type FieldCondition = {
  __typename?: 'FieldCondition';
  condition: EvaluatorOperator;
  params: Scalars['IntStringDateBool'];
};

export type FieldConditionInput = {
  condition: EvaluatorOperator;
  params: Scalars['String'];
};

export type FieldConfig = BooleanConfig | DateConfig | EmbellishmentConfig | FileUploadConfig | SelectionFromOptionsConfig | TextInputConfig | SubtemplateConfig;

export type FieldDependency = {
  __typename?: 'FieldDependency';
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
  __typename?: 'Fields';
  nationalities: Array<Entry>;
  countries: Array<Entry>;
};

export type FileMetadata = {
  __typename?: 'FileMetadata';
  originalFileName: Scalars['String'];
  mimeType: Scalars['String'];
  sizeInBytes: Scalars['Int'];
  createdDate: Scalars['DateTime'];
  fileId: Scalars['String'];
};

export type FileUploadConfig = {
  __typename?: 'FileUploadConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  file_type: Array<Scalars['String']>;
  max_files: Scalars['Int'];
};

export type Institution = {
  __typename?: 'Institution';
  id: Scalars['Int'];
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type InstitutionResponseWrap = {
  __typename?: 'InstitutionResponseWrap';
  error: Maybe<Scalars['String']>;
  institution: Maybe<Institution>;
};

export type Institutions = {
  __typename?: 'Institutions';
  id: Scalars['Int'];
  value: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type InstitutionsFilter = {
  isVerified?: Maybe<Scalars['Boolean']>;
};

export type Instrument = {
  __typename?: 'Instrument';
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  scientists: Array<BasicUserDetails>;
};

export type InstrumentResponseWrap = {
  __typename?: 'InstrumentResponseWrap';
  error: Maybe<Scalars['String']>;
  instrument: Maybe<Instrument>;
};

export type InstrumentsQueryResult = {
  __typename?: 'InstrumentsQueryResult';
  totalCount: Scalars['Int'];
  instruments: Array<Instrument>;
};

export type InstrumentWithAvailabilityTime = {
  __typename?: 'InstrumentWithAvailabilityTime';
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
  scientists: Array<BasicUserDetails>;
  availabilityTime: Maybe<Scalars['Int']>;
};


export type Mutation = {
  __typename?: 'Mutation';
  createInstitution: InstitutionResponseWrap;
  updateInstitution: InstitutionResponseWrap;
  createCall: CallResponseWrap;
  updateCall: CallResponseWrap;
  assignInstrumentToCall: CallResponseWrap;
  removeAssignedInstrumentFromcall: CallResponseWrap;
  assignProposalsToInstrument: SuccessResponseWrap;
  removeProposalFromInstrument: SuccessResponseWrap;
  assignScientistsToInstrument: SuccessResponseWrap;
  removeScientistFromInstrument: SuccessResponseWrap;
  createInstrument: InstrumentResponseWrap;
  updateInstrument: InstrumentResponseWrap;
  setInstrumentAvailabilityTime: SuccessResponseWrap;
  administrationProposal: ProposalResponseWrap;
  updateProposal: ProposalResponseWrap;
  answerTopic: QuestionaryStepResponseWrap;
  createQuestionary: QuestionaryResponseWrap;
  updateAnswer: UpdateAnswerResponseWrap;
  addReview: ReviewResponseWrap;
  addTechnicalReview: TechnicalReviewResponseWrap;
  addUserForReview: ReviewResponseWrap;
  assignChairOrSecretary: SepResponseWrap;
  assignMembers: SepResponseWrap;
  removeMember: SepResponseWrap;
  assignMemberToSEPProposal: SepResponseWrap;
  removeMemberFromSEPProposal: SepResponseWrap;
  assignProposal: SepResponseWrap;
  removeProposalAssignment: SepResponseWrap;
  createSEP: SepResponseWrap;
  updateSEP: SepResponseWrap;
  createQuestion: QuestionResponseWrap;
  createQuestionTemplateRelation: TemplateResponseWrap;
  createTemplate: TemplateResponseWrap;
  createTopic: TemplateResponseWrap;
  deleteQuestionTemplateRelation: TemplateResponseWrap;
  updateQuestion: QuestionResponseWrap;
  updateQuestionTemplateRelation: TemplateResponseWrap;
  updateTemplate: TemplateResponseWrap;
  updateTopic: TopicResponseWrap;
  addUserRole: AddUserRoleResponseWrap;
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap;
  createUser: UserResponseWrap;
  updateUser: UserResponseWrap;
  addClientLog: SuccessResponseWrap;
  applyPatches: PrepareDbResponseWrap;
  assignQuestionsToTopic: AssignQuestionsToTopicResponseWrap;
  cloneTemplate: TemplateResponseWrap;
  createProposal: ProposalResponseWrap;
  deleteInstitution: InstitutionResponseWrap;
  deleteInstrument: InstrumentResponseWrap;
  deleteProposal: ProposalResponseWrap;
  deleteQuestion: QuestionResponseWrap;
  deleteTemplate: TemplateResponseWrap;
  deleteTopic: TemplateResponseWrap;
  deleteUser: UserResponseWrap;
  emailVerification: EmailVerificationResponseWrap;
  getTokenForUser: TokenResponseWrap;
  login: TokenResponseWrap;
  notifyProposal: ProposalResponseWrap;
  prepareDB: PrepareDbResponseWrap;
  removeUserForReview: ReviewResponseWrap;
  resetPasswordEmail: ResetPasswordEmailResponseWrap;
  resetPassword: BasicUserDetailsResponseWrap;
  setPageContent: PageResponseWrap;
  submitProposal: ProposalResponseWrap;
  token: TokenResponseWrap;
  selectRole: TokenResponseWrap;
  updatePassword: BasicUserDetailsResponseWrap;
  updateTopicOrder: UpdateTopicOrderResponseWrap;
};


export type MutationCreateInstitutionArgs = {
  name: Scalars['String'];
  verified: Scalars['Boolean'];
};


export type MutationUpdateInstitutionArgs = {
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateCallArgs = {
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  templateId?: Maybe<Scalars['Int']>;
};


export type MutationUpdateCallArgs = {
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  startCall: Scalars['DateTime'];
  endCall: Scalars['DateTime'];
  startReview: Scalars['DateTime'];
  endReview: Scalars['DateTime'];
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  templateId?: Maybe<Scalars['Int']>;
};


export type MutationAssignInstrumentToCallArgs = {
  instrumentIds: Array<Scalars['Int']>;
  callId: Scalars['Int'];
};


export type MutationRemoveAssignedInstrumentFromcallArgs = {
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
};


export type MutationAssignProposalsToInstrumentArgs = {
  proposalIds: Array<Scalars['Int']>;
  instrumentId: Scalars['Int'];
};


export type MutationRemoveProposalFromInstrumentArgs = {
  proposalId: Scalars['Int'];
  instrumentId: Scalars['Int'];
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
};


export type MutationUpdateInstrumentArgs = {
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
};


export type MutationSetInstrumentAvailabilityTimeArgs = {
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
  availabilityTime: Scalars['Int'];
};


export type MutationAdministrationProposalArgs = {
  id: Scalars['Int'];
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
  finalStatus?: Maybe<ProposalEndStatus>;
  status?: Maybe<ProposalStatus>;
  rankOrder?: Maybe<Scalars['Int']>;
};


export type MutationUpdateProposalArgs = {
  id: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']>>;
  proposerId?: Maybe<Scalars['Int']>;
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


export type MutationAddTechnicalReviewArgs = {
  proposalID: Scalars['Int'];
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  timeAllocation?: Maybe<Scalars['Int']>;
  status?: Maybe<TechnicalReviewStatus>;
};


export type MutationAddUserForReviewArgs = {
  userID: Scalars['Int'];
  proposalID: Scalars['Int'];
  sepID: Scalars['Int'];
};


export type MutationAssignChairOrSecretaryArgs = {
  addSEPMembersRole?: Maybe<AddSepMembersRole>;
};


export type MutationAssignMembersArgs = {
  memberIds: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
};


export type MutationRemoveMemberArgs = {
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationAssignMemberToSepProposalArgs = {
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalId: Scalars['Int'];
};


export type MutationRemoveMemberFromSepProposalArgs = {
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalId: Scalars['Int'];
};


export type MutationAssignProposalArgs = {
  proposalId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationRemoveProposalAssignmentArgs = {
  proposalId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type MutationCreateSepArgs = {
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired?: Maybe<Scalars['Int']>;
  active: Scalars['Boolean'];
};


export type MutationUpdateSepArgs = {
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired?: Maybe<Scalars['Int']>;
  active: Scalars['Boolean'];
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
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};


export type MutationCreateTopicArgs = {
  templateId: Scalars['Int'];
  sortOrder: Scalars['Int'];
};


export type MutationDeleteQuestionTemplateRelationArgs = {
  questionId: Scalars['String'];
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
  sortOrder?: Maybe<Scalars['Int']>;
  config?: Maybe<Scalars['String']>;
  dependency?: Maybe<FieldDependencyInput>;
};


export type MutationUpdateTemplateArgs = {
  templateId: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isArchived?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
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


export type MutationAddClientLogArgs = {
  error: Scalars['String'];
};


export type MutationAssignQuestionsToTopicArgs = {
  templateId: Scalars['Int'];
  topicId: Scalars['Int'];
  questionIds?: Maybe<Array<Scalars['String']>>;
};


export type MutationCloneTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationCreateProposalArgs = {
  callId: Scalars['Int'];
};


export type MutationDeleteInstitutionArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteInstrumentArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteProposalArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['String'];
};


export type MutationDeleteTemplateArgs = {
  templateId: Scalars['Int'];
};


export type MutationDeleteTopicArgs = {
  topicId: Scalars['Int'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int'];
};


export type MutationEmailVerificationArgs = {
  token: Scalars['String'];
};


export type MutationGetTokenForUserArgs = {
  userId: Scalars['Int'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationNotifyProposalArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveUserForReviewArgs = {
  reviewID: Scalars['Int'];
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


export type MutationSubmitProposalArgs = {
  id: Scalars['Int'];
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


export type MutationUpdateTopicOrderArgs = {
  topicOrder: Array<Scalars['Int']>;
};

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
  id: Scalars['Int'];
  content: Maybe<Scalars['String']>;
};

export enum PageName {
  HOMEPAGE = 'HOMEPAGE',
  HELPPAGE = 'HELPPAGE',
  PRIVACYPAGE = 'PRIVACYPAGE',
  COOKIEPAGE = 'COOKIEPAGE',
  REVIEWPAGE = 'REVIEWPAGE'
}

export type PageResponseWrap = {
  __typename?: 'PageResponseWrap';
  error: Maybe<Scalars['String']>;
  page: Maybe<Page>;
};

export type PrepareDbResponseWrap = {
  __typename?: 'PrepareDBResponseWrap';
  error: Maybe<Scalars['String']>;
  log: Scalars['String'];
};

export type Proposal = {
  __typename?: 'Proposal';
  id: Scalars['Int'];
  title: Scalars['String'];
  abstract: Scalars['String'];
  status: ProposalStatus;
  created: Scalars['DateTime'];
  updated: Scalars['DateTime'];
  shortCode: Scalars['String'];
  rankOrder: Maybe<Scalars['Int']>;
  finalStatus: Maybe<ProposalEndStatus>;
  callId: Scalars['Int'];
  questionaryId: Scalars['Int'];
  commentForUser: Maybe<Scalars['String']>;
  commentForManagement: Maybe<Scalars['String']>;
  notified: Scalars['Boolean'];
  users: Array<BasicUserDetails>;
  proposer: BasicUserDetails;
  reviews: Maybe<Array<Review>>;
  technicalReview: Maybe<TechnicalReview>;
  instrument: Maybe<Instrument>;
  sep: Maybe<Sep>;
  call: Maybe<Call>;
  questionary: Questionary;
};

export enum ProposalEndStatus {
  UNSET = 'UNSET',
  ACCEPTED = 'ACCEPTED',
  RESERVED = 'RESERVED',
  REJECTED = 'REJECTED'
}

export type ProposalResponseWrap = {
  __typename?: 'ProposalResponseWrap';
  error: Maybe<Scalars['String']>;
  proposal: Maybe<Proposal>;
};

export type ProposalsFilter = {
  text?: Maybe<Scalars['String']>;
  templateIds?: Maybe<Array<Scalars['Int']>>;
  questionaryIds?: Maybe<Array<Scalars['Int']>>;
  callId?: Maybe<Scalars['Int']>;
  instrumentId?: Maybe<Scalars['Int']>;
};

export type ProposalsQueryResult = {
  __typename?: 'ProposalsQueryResult';
  totalCount: Scalars['Int'];
  proposals: Array<Proposal>;
};

export enum ProposalStatus {
  BLANK = 'BLANK',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ProposalTemplate = {
  __typename?: 'ProposalTemplate';
  templateId: Scalars['Int'];
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
  description: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  steps: Array<TemplateStep>;
  complementaryQuestions: Array<Question>;
  proposalCount: Scalars['Int'];
  callCount: Scalars['Int'];
};

export type ProposalTemplatesFilter = {
  isArchived?: Maybe<Scalars['Boolean']>;
};

export type Query = {
  __typename?: 'Query';
  calls: Maybe<Array<Call>>;
  proposals: Maybe<ProposalsQueryResult>;
  instrumentScientistProposals: Maybe<ProposalsQueryResult>;
  templates: Maybe<Array<Template>>;
  basicUserDetails: Maybe<BasicUserDetails>;
  blankProposal: Maybe<Proposal>;
  call: Maybe<Call>;
  checkEmailExist: Maybe<Scalars['Boolean']>;
  eventLogs: Maybe<Array<EventLog>>;
  fileMetadata: Maybe<Array<FileMetadata>>;
  getFields: Maybe<Fields>;
  getOrcIDInformation: Maybe<OrcIdInformation>;
  getPageContent: Maybe<Scalars['String']>;
  institutions: Maybe<Array<Institution>>;
  instrument: Maybe<Instrument>;
  instruments: Maybe<InstrumentsQueryResult>;
  instrumentsBySep: Maybe<Array<InstrumentWithAvailabilityTime>>;
  isNaturalKeyPresent: Maybe<Scalars['Boolean']>;
  proposal: Maybe<Proposal>;
  proposalTemplates: Maybe<Array<ProposalTemplate>>;
  questionary: Maybe<Questionary>;
  review: Maybe<Review>;
  roles: Maybe<Array<Role>>;
  sep: Maybe<Sep>;
  sepMembers: Maybe<Array<SepMember>>;
  sepProposals: Maybe<Array<SepProposal>>;
  sepProposalsByInstrument: Maybe<Array<SepProposal>>;
  seps: Maybe<SePsQueryResult>;
  templateCategories: Maybe<Array<TemplateCategory>>;
  template: Maybe<Template>;
  user: Maybe<User>;
  me: Maybe<User>;
  users: Maybe<UserQueryResult>;
};


export type QueryCallsArgs = {
  filter?: Maybe<CallsFilter>;
};


export type QueryProposalsArgs = {
  filter?: Maybe<ProposalsFilter>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryInstrumentScientistProposalsArgs = {
  filter?: Maybe<ProposalsFilter>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryTemplatesArgs = {
  filter?: Maybe<TemplatesFilter>;
};


export type QueryBasicUserDetailsArgs = {
  id: Scalars['Int'];
};


export type QueryBlankProposalArgs = {
  callId: Scalars['Int'];
};


export type QueryCallArgs = {
  id: Scalars['Int'];
};


export type QueryCheckEmailExistArgs = {
  email: Scalars['String'];
};


export type QueryEventLogsArgs = {
  changedObjectId: Scalars['String'];
  eventType: Scalars['String'];
};


export type QueryFileMetadataArgs = {
  fileIds: Array<Scalars['String']>;
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


export type QueryInstrumentsBySepArgs = {
  callId: Scalars['Int'];
  sepId: Scalars['Int'];
};


export type QueryIsNaturalKeyPresentArgs = {
  naturalKey: Scalars['String'];
};


export type QueryProposalArgs = {
  id: Scalars['Int'];
};


export type QueryProposalTemplatesArgs = {
  filter?: Maybe<ProposalTemplatesFilter>;
};


export type QueryQuestionaryArgs = {
  questionaryId: Scalars['Int'];
};


export type QueryReviewArgs = {
  id: Scalars['Int'];
};


export type QuerySepArgs = {
  id: Scalars['Int'];
};


export type QuerySepMembersArgs = {
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


export type QuerySepsArgs = {
  active?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int'];
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

export type Question = {
  __typename?: 'Question';
  proposalQuestionId: Scalars['String'];
  categoryId: TemplateCategoryId;
  naturalKey: Scalars['String'];
  dataType: DataType;
  question: Scalars['String'];
  config: FieldConfig;
};

export type Questionary = {
  __typename?: 'Questionary';
  questionaryId: Maybe<Scalars['Int']>;
  templateId: Scalars['Int'];
  created: Scalars['DateTime'];
  steps: Array<QuestionaryStep>;
};

export type QuestionaryResponseWrap = {
  __typename?: 'QuestionaryResponseWrap';
  error: Maybe<Scalars['String']>;
  questionary: Maybe<Questionary>;
};

export type QuestionaryStep = {
  __typename?: 'QuestionaryStep';
  topic: Topic;
  isCompleted: Scalars['Boolean'];
  fields: Array<Answer>;
};

export type QuestionaryStepResponseWrap = {
  __typename?: 'QuestionaryStepResponseWrap';
  error: Maybe<Scalars['String']>;
  questionaryStep: Maybe<QuestionaryStep>;
};

export type QuestionResponseWrap = {
  __typename?: 'QuestionResponseWrap';
  error: Maybe<Scalars['String']>;
  question: Maybe<Question>;
};

export type QuestionTemplateRelation = {
  __typename?: 'QuestionTemplateRelation';
  question: Question;
  sortOrder: Scalars['Int'];
  topicId: Scalars['Int'];
  config: FieldConfig;
  dependency: Maybe<FieldDependency>;
};

export type QuestionTemplateRelationResponseWrap = {
  __typename?: 'QuestionTemplateRelationResponseWrap';
  error: Maybe<Scalars['String']>;
  questionTemplateRelation: Maybe<QuestionTemplateRelation>;
};

export type ResetPasswordEmailResponseWrap = {
  __typename?: 'ResetPasswordEmailResponseWrap';
  error: Maybe<Scalars['String']>;
  success: Maybe<Scalars['Boolean']>;
};

export type ResponseWrapBase = {
  __typename?: 'ResponseWrapBase';
  error: Maybe<Scalars['String']>;
};

export type Review = {
  __typename?: 'Review';
  id: Scalars['Int'];
  userID: Scalars['Int'];
  comment: Maybe<Scalars['String']>;
  grade: Maybe<Scalars['Int']>;
  status: ReviewStatus;
  sepID: Scalars['Int'];
  reviewer: Maybe<User>;
  proposal: Maybe<Proposal>;
};

export type ReviewResponseWrap = {
  __typename?: 'ReviewResponseWrap';
  error: Maybe<Scalars['String']>;
  review: Maybe<Review>;
};

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type Role = {
  __typename?: 'Role';
  id: Scalars['Int'];
  shortCode: Scalars['String'];
  title: Scalars['String'];
};

export type SelectionFromOptionsConfig = {
  __typename?: 'SelectionFromOptionsConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  variant: Scalars['String'];
  options: Array<Scalars['String']>;
};

export type Sep = {
  __typename?: 'SEP';
  id: Scalars['Int'];
  code: Scalars['String'];
  description: Scalars['String'];
  numberRatingsRequired: Scalars['Float'];
  active: Scalars['Boolean'];
};

export type SepAssignment = {
  __typename?: 'SEPAssignment';
  proposalId: Scalars['Int'];
  sepMemberUserId: Maybe<Scalars['Int']>;
  sepId: Scalars['Int'];
  dateAssigned: Scalars['DateTime'];
  reassigned: Scalars['Boolean'];
  dateReassigned: Maybe<Scalars['DateTime']>;
  emailSent: Scalars['Boolean'];
  proposal: Proposal;
  roles: Array<Role>;
  user: Maybe<BasicUserDetails>;
  review: Review;
};

export type SepMember = {
  __typename?: 'SEPMember';
  roleUserId: Scalars['Int'];
  roleId: Scalars['Int'];
  userId: Scalars['Int'];
  sepId: Scalars['Int'];
  roles: Array<Role>;
  user: BasicUserDetails;
};

export type SepMembersRoleResponseWrap = {
  __typename?: 'SEPMembersRoleResponseWrap';
  error: Maybe<Scalars['String']>;
  success: Maybe<Scalars['Boolean']>;
};

export type SepProposal = {
  __typename?: 'SEPProposal';
  proposalId: Scalars['Int'];
  sepId: Scalars['Int'];
  dateAssigned: Scalars['DateTime'];
  proposal: Proposal;
  assignments: Maybe<Array<SepAssignment>>;
};

export type SepResponseWrap = {
  __typename?: 'SEPResponseWrap';
  error: Maybe<Scalars['String']>;
  sep: Maybe<Sep>;
};

export type SePsQueryResult = {
  __typename?: 'SEPsQueryResult';
  totalCount: Scalars['Int'];
  seps: Array<Sep>;
};

export type SubtemplateConfig = {
  __typename?: 'SubtemplateConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  maxEntries: Maybe<Scalars['Int']>;
  templateId: Scalars['Int'];
  addEntryButtonLabel: Scalars['String'];
};

export type SuccessResponseWrap = {
  __typename?: 'SuccessResponseWrap';
  error: Maybe<Scalars['String']>;
  isSuccess: Maybe<Scalars['Boolean']>;
};

export type TechnicalReview = {
  __typename?: 'TechnicalReview';
  id: Scalars['Int'];
  proposalID: Scalars['Int'];
  comment: Maybe<Scalars['String']>;
  publicComment: Maybe<Scalars['String']>;
  timeAllocation: Maybe<Scalars['Int']>;
  status: Maybe<TechnicalReviewStatus>;
  proposal: Maybe<Proposal>;
};

export type TechnicalReviewResponseWrap = {
  __typename?: 'TechnicalReviewResponseWrap';
  error: Maybe<Scalars['String']>;
  technicalReview: Maybe<TechnicalReview>;
};

export enum TechnicalReviewStatus {
  FEASIBLE = 'FEASIBLE',
  PARTIALLY_FEASIBLE = 'PARTIALLY_FEASIBLE',
  UNFEASIBLE = 'UNFEASIBLE'
}

export type Template = {
  __typename?: 'Template';
  templateId: Scalars['Int'];
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
  description: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  steps: Array<TemplateStep>;
  complementaryQuestions: Array<Question>;
};

export type TemplateCategory = {
  __typename?: 'TemplateCategory';
  categoryId: Scalars['Int'];
  name: Scalars['String'];
};

export enum TemplateCategoryId {
  PROPOSAL_QUESTIONARY = 'PROPOSAL_QUESTIONARY',
  SAMPLE_DECLARATION = 'SAMPLE_DECLARATION'
}

export type TemplateResponseWrap = {
  __typename?: 'TemplateResponseWrap';
  error: Maybe<Scalars['String']>;
  template: Maybe<Template>;
};

export type TemplatesFilter = {
  isArchived?: Maybe<Scalars['Boolean']>;
  category?: Maybe<TemplateCategoryId>;
};

export type TemplateStep = {
  __typename?: 'TemplateStep';
  topic: Topic;
  fields: Array<QuestionTemplateRelation>;
};

export type TextInputConfig = {
  __typename?: 'TextInputConfig';
  small_label: Scalars['String'];
  required: Scalars['Boolean'];
  tooltip: Scalars['String'];
  min: Maybe<Scalars['Int']>;
  max: Maybe<Scalars['Int']>;
  multiline: Scalars['Boolean'];
  placeholder: Scalars['String'];
  htmlQuestion: Maybe<Scalars['String']>;
  isHtmlQuestion: Scalars['Boolean'];
};

export type TokenResponseWrap = {
  __typename?: 'TokenResponseWrap';
  error: Maybe<Scalars['String']>;
  token: Maybe<Scalars['String']>;
};

export type Topic = {
  __typename?: 'Topic';
  id: Scalars['Int'];
  title: Scalars['String'];
  sortOrder: Scalars['Int'];
  isEnabled: Scalars['Boolean'];
};

export type TopicResponseWrap = {
  __typename?: 'TopicResponseWrap';
  error: Maybe<Scalars['String']>;
  topic: Maybe<Topic>;
};

export type UpdateAnswerResponseWrap = {
  __typename?: 'UpdateAnswerResponseWrap';
  error: Maybe<Scalars['String']>;
  questionId: Maybe<Scalars['String']>;
};

export type UpdateTopicOrderResponseWrap = {
  __typename?: 'UpdateTopicOrderResponseWrap';
  error: Maybe<Scalars['String']>;
  topicOrder: Maybe<Array<Scalars['Int']>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  user_title: Maybe<Scalars['String']>;
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

export type UserQueryResult = {
  __typename?: 'UserQueryResult';
  users: Array<BasicUserDetails>;
  totalCount: Scalars['Int'];
};

export type UserResponseWrap = {
  __typename?: 'UserResponseWrap';
  error: Maybe<Scalars['String']>;
  user: Maybe<User>;
};

export enum UserRole {
  USER = 'USER',
  USER_OFFICER = 'USER_OFFICER',
  REVIEWER = 'REVIEWER',
  SEP_CHAIR = 'SEP_CHAIR',
  SEP_SECRETARY = 'SEP_SECRETARY',
  SEP_REVIEWER = 'SEP_REVIEWER',
  INSTRUMENT_SCIENTIST = 'INSTRUMENT_SCIENTIST'
}

export type AssignProposalMutationVariables = Exact<{
  proposalId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type AssignProposalMutation = (
  { __typename?: 'Mutation' }
  & { assignProposal: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignMembersMutationVariables = Exact<{
  memberIds: Array<Scalars['Int']>;
  sepId: Scalars['Int'];
}>;


export type AssignMembersMutation = (
  { __typename?: 'Mutation' }
  & { assignMembers: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignChairOrSecretaryMutationVariables = Exact<{
  addSEPMembersRole: AddSepMembersRole;
}>;


export type AssignChairOrSecretaryMutation = (
  { __typename?: 'Mutation' }
  & { assignChairOrSecretary: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignMemberToSepProposalMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalId: Scalars['Int'];
}>;


export type AssignMemberToSepProposalMutation = (
  { __typename?: 'Mutation' }
  & { assignMemberToSEPProposal: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
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
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
    )> }
  ) }
);

export type GetInstrumentsBySepQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetInstrumentsBySepQuery = (
  { __typename?: 'Query' }
  & { instrumentsBySep: Maybe<Array<(
    { __typename?: 'InstrumentWithAvailabilityTime' }
    & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime'>
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
  )> }
);

export type GetSepMembersQueryVariables = Exact<{
  sepId: Scalars['Int'];
}>;


export type GetSepMembersQuery = (
  { __typename?: 'Query' }
  & { sepMembers: Maybe<Array<(
    { __typename?: 'SEPMember' }
    & Pick<SepMember, 'roleUserId' | 'roleId' | 'userId' | 'sepId'>
    & { roles: Array<(
      { __typename?: 'Role' }
      & Pick<Role, 'id' | 'shortCode' | 'title'>
    )>, user: (
      { __typename?: 'BasicUserDetails' }
      & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation'>
    ) }
  )>> }
);

export type GetSepProposalsQueryVariables = Exact<{
  sepId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type GetSepProposalsQuery = (
  { __typename?: 'Query' }
  & { sepProposals: Maybe<Array<(
    { __typename?: 'SEPProposal' }
    & Pick<SepProposal, 'proposalId' | 'dateAssigned' | 'sepId'>
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'title' | 'id' | 'shortCode' | 'status'>
    ), assignments: Maybe<Array<(
      { __typename?: 'SEPAssignment' }
      & Pick<SepAssignment, 'sepMemberUserId' | 'dateAssigned'>
      & { user: Maybe<(
        { __typename?: 'BasicUserDetails' }
        & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation' | 'position'>
      )>, roles: Array<(
        { __typename?: 'Role' }
        & Pick<Role, 'id' | 'shortCode' | 'title'>
      )>, review: (
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'status' | 'comment' | 'grade' | 'sepID'>
      ) }
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
    & { proposal: (
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'title' | 'shortCode' | 'rankOrder' | 'status'>
      & { reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'comment' | 'grade' | 'status'>
      )>>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & Pick<TechnicalReview, 'publicComment' | 'status' | 'timeAllocation'>
      )> }
    ) }
  )>> }
);

export type GetSePsQueryVariables = Exact<{
  filter: Scalars['String'];
  active: Scalars['Boolean'];
}>;


export type GetSePsQuery = (
  { __typename?: 'Query' }
  & { seps: Maybe<(
    { __typename?: 'SEPsQueryResult' }
    & Pick<SePsQueryResult, 'totalCount'>
    & { seps: Array<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
    )> }
  )> }
);

export type RemoveProposalAssignmentMutationVariables = Exact<{
  proposalId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveProposalAssignmentMutation = (
  { __typename?: 'Mutation' }
  & { removeProposalAssignment: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type RemoveMemberMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
}>;


export type RemoveMemberMutation = (
  { __typename?: 'Mutation' }
  & { removeMember: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type RemoveMemberFromSepProposalMutationVariables = Exact<{
  memberId: Scalars['Int'];
  sepId: Scalars['Int'];
  proposalId: Scalars['Int'];
}>;


export type RemoveMemberFromSepProposalMutation = (
  { __typename?: 'Mutation' }
  & { removeMemberFromSEPProposal: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
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
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
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
    & Pick<SuccessResponseWrap, 'isSuccess' | 'error'>
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
    & Pick<InstitutionResponseWrap, 'error'>
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'name' | 'verified'>
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
    & Pick<InstitutionResponseWrap, 'error'>
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'verified'>
    )> }
  ) }
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

export type SetPageContentMutationVariables = Exact<{
  id: PageName;
  text: Scalars['String'];
}>;


export type SetPageContentMutation = (
  { __typename?: 'Mutation' }
  & { setPageContent: (
    { __typename?: 'PageResponseWrap' }
    & Pick<PageResponseWrap, 'error'>
    & { page: Maybe<(
      { __typename?: 'Page' }
      & Pick<Page, 'id' | 'content'>
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
    & Pick<InstitutionResponseWrap, 'error'>
    & { institution: Maybe<(
      { __typename?: 'Institution' }
      & Pick<Institution, 'id' | 'verified' | 'name'>
    )> }
  ) }
);

export type AssignInstrumentToCallMutationVariables = Exact<{
  instrumentIds: Array<Scalars['Int']>;
  callId: Scalars['Int'];
}>;


export type AssignInstrumentToCallMutation = (
  { __typename?: 'Mutation' }
  & { assignInstrumentToCall: (
    { __typename?: 'CallResponseWrap' }
    & Pick<CallResponseWrap, 'error'>
    & { call: Maybe<(
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
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  templateId?: Maybe<Scalars['Int']>;
}>;


export type CreateCallMutation = (
  { __typename?: 'Mutation' }
  & { createCall: (
    { __typename?: 'CallResponseWrap' }
    & Pick<CallResponseWrap, 'error'>
    & { call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'startReview' | 'endReview' | 'startNotify' | 'endNotify' | 'startCycle' | 'endCycle' | 'cycleComment' | 'surveyComment' | 'templateId'>
      & { instruments: Array<(
        { __typename?: 'InstrumentWithAvailabilityTime' }
        & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime'>
      )> }
    )> }
  ) }
);

export type GetCallsQueryVariables = Exact<{
  filter?: Maybe<CallsFilter>;
}>;


export type GetCallsQuery = (
  { __typename?: 'Query' }
  & { calls: Maybe<Array<(
    { __typename?: 'Call' }
    & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'startReview' | 'endReview' | 'startNotify' | 'endNotify' | 'startCycle' | 'endCycle' | 'cycleComment' | 'surveyComment' | 'templateId'>
    & { instruments: Array<(
      { __typename?: 'InstrumentWithAvailabilityTime' }
      & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  )>> }
);

export type RemoveAssignedInstrumentFromcallMutationVariables = Exact<{
  instrumentId: Scalars['Int'];
  callId: Scalars['Int'];
}>;


export type RemoveAssignedInstrumentFromcallMutation = (
  { __typename?: 'Mutation' }
  & { removeAssignedInstrumentFromcall: (
    { __typename?: 'CallResponseWrap' }
    & Pick<CallResponseWrap, 'error'>
    & { call: Maybe<(
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
  startNotify: Scalars['DateTime'];
  endNotify: Scalars['DateTime'];
  startCycle: Scalars['DateTime'];
  endCycle: Scalars['DateTime'];
  cycleComment: Scalars['String'];
  surveyComment: Scalars['String'];
  templateId?: Maybe<Scalars['Int']>;
}>;


export type UpdateCallMutation = (
  { __typename?: 'Mutation' }
  & { updateCall: (
    { __typename?: 'CallResponseWrap' }
    & Pick<CallResponseWrap, 'error'>
    & { call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'startReview' | 'endReview' | 'startNotify' | 'endNotify' | 'startCycle' | 'endCycle' | 'cycleComment' | 'surveyComment' | 'templateId'>
      & { instruments: Array<(
        { __typename?: 'InstrumentWithAvailabilityTime' }
        & Pick<InstrumentWithAvailabilityTime, 'id' | 'name' | 'shortCode' | 'description' | 'availabilityTime'>
      )> }
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

export type AssignProposalsToInstrumentMutationVariables = Exact<{
  proposalIds: Array<Scalars['Int']>;
  instrumentId: Scalars['Int'];
}>;


export type AssignProposalsToInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { assignProposalsToInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'error' | 'isSuccess'>
  ) }
);

export type AssignScientistsToInstrumentMutationVariables = Exact<{
  scientistIds: Array<Scalars['Int']>;
  instrumentId: Scalars['Int'];
}>;


export type AssignScientistsToInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { assignScientistsToInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'error' | 'isSuccess'>
  ) }
);

export type CreateInstrumentMutationVariables = Exact<{
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { createInstrument: (
    { __typename?: 'InstrumentResponseWrap' }
    & Pick<InstrumentResponseWrap, 'error'>
    & { instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
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
    & Pick<InstrumentResponseWrap, 'error'>
  ) }
);

export type GetInstrumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInstrumentsQuery = (
  { __typename?: 'Query' }
  & { instruments: Maybe<(
    { __typename?: 'InstrumentsQueryResult' }
    & Pick<InstrumentsQueryResult, 'totalCount'>
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

export type RemoveProposalFromInstrumentMutationVariables = Exact<{
  proposalId: Scalars['Int'];
  instrumentId: Scalars['Int'];
}>;


export type RemoveProposalFromInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { removeProposalFromInstrument: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'error' | 'isSuccess'>
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
    & Pick<SuccessResponseWrap, 'error' | 'isSuccess'>
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
    & Pick<SuccessResponseWrap, 'error' | 'isSuccess'>
  ) }
);

export type UpdateInstrumentMutationVariables = Exact<{
  id: Scalars['Int'];
  name: Scalars['String'];
  shortCode: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateInstrumentMutation = (
  { __typename?: 'Mutation' }
  & { updateInstrument: (
    { __typename?: 'InstrumentResponseWrap' }
    & Pick<InstrumentResponseWrap, 'error'>
    & { instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode' | 'description'>
      & { scientists: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )> }
    )> }
  ) }
);

export type AdministrationProposalMutationVariables = Exact<{
  id: Scalars['Int'];
  rankOrder?: Maybe<Scalars['Int']>;
  finalStatus?: Maybe<ProposalEndStatus>;
  status?: Maybe<ProposalStatus>;
  commentForUser?: Maybe<Scalars['String']>;
  commentForManagement?: Maybe<Scalars['String']>;
}>;


export type AdministrationProposalMutation = (
  { __typename?: 'Mutation' }
  & { administrationProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id'>
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
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'status' | 'shortCode' | 'questionaryId'>
    )> }
  ) }
);

export type DeleteProposalMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProposalMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id'>
    )> }
  ) }
);

export type CoreTechnicalReviewFragment = (
  { __typename?: 'TechnicalReview' }
  & Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalID'>
);

export type ProposalFragment = (
  { __typename?: 'Proposal' }
  & Pick<Proposal, 'id' | 'title' | 'abstract' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'commentForUser' | 'commentForManagement' | 'created' | 'updated' | 'callId' | 'questionaryId' | 'notified'>
);

export type GetBlankProposalQueryVariables = Exact<{
  callId: Scalars['Int'];
}>;


export type GetBlankProposalQuery = (
  { __typename?: 'Query' }
  & { blankProposal: Maybe<(
    { __typename?: 'Proposal' }
    & { proposer: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), questionary: (
      { __typename?: 'Questionary' }
      & QuestionaryFragment
    ), users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, reviews: Maybe<Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )>> }
    & ProposalFragment
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
      & { proposer: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
        )> }
      )>>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalID'>
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

export type GetProposalQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetProposalQuery = (
  { __typename?: 'Query' }
  & { proposal: Maybe<(
    { __typename?: 'Proposal' }
    & { proposer: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, questionary: (
      { __typename?: 'Questionary' }
      & QuestionaryFragment
    ), technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & CoreTechnicalReviewFragment
    )>, reviews: Maybe<Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )>>, instrument: Maybe<(
      { __typename?: 'Instrument' }
      & Pick<Instrument, 'id' | 'name' | 'shortCode'>
    )>, call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id' | 'shortCode'>
    )> }
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
      & { proposer: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID' | 'sepID'>
        & { reviewer: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
        )> }
      )>>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalID'>
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

export type NotifyProposalMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type NotifyProposalMutation = (
  { __typename?: 'Mutation' }
  & { notifyProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id'>
    )> }
  ) }
);

export type SubmitProposalMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type SubmitProposalMutation = (
  { __typename?: 'Mutation' }
  & { submitProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id'>
    )> }
  ) }
);

export type UpdateProposalMutationVariables = Exact<{
  id: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Scalars['Int']>>;
  proposerId?: Maybe<Scalars['Int']>;
}>;


export type UpdateProposalMutation = (
  { __typename?: 'Mutation' }
  & { updateProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id'>
    )> }
  ) }
);

export type AnswerTopicMutationVariables = Exact<{
  questionaryId: Scalars['Int'];
  topicId: Scalars['Int'];
  answers: Array<AnswerInput>;
  isPartialSave?: Maybe<Scalars['Boolean']>;
}>;


export type AnswerTopicMutation = (
  { __typename?: 'Mutation' }
  & { answerTopic: (
    { __typename?: 'QuestionaryStepResponseWrap' }
    & Pick<QuestionaryStepResponseWrap, 'error'>
    & { questionaryStep: Maybe<(
      { __typename?: 'QuestionaryStep' }
      & QuestionaryStepFragment
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
    & Pick<QuestionaryResponseWrap, 'error'>
    & { questionary: Maybe<(
      { __typename?: 'Questionary' }
      & QuestionaryFragment
    )> }
  ) }
);

export type AnswerFragment = (
  { __typename?: 'Answer' }
  & Pick<Answer, 'sortOrder' | 'topicId' | 'value'>
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
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'SubtemplateConfig' }
    & FieldConfigSubtemplateConfigFragment
  ), dependency: Maybe<(
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
    & Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>
  ), fields: Array<(
    { __typename?: 'Answer' }
    & AnswerFragment
  )> }
);

export type GetFileMetadataQueryVariables = Exact<{
  fileIds: Array<Scalars['String']>;
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
  proposalID: Scalars['Int'];
  timeAllocation?: Maybe<Scalars['Int']>;
  comment?: Maybe<Scalars['String']>;
  publicComment?: Maybe<Scalars['String']>;
  status?: Maybe<TechnicalReviewStatus>;
}>;


export type AddTechnicalReviewMutation = (
  { __typename?: 'Mutation' }
  & { addTechnicalReview: (
    { __typename?: 'TechnicalReviewResponseWrap' }
    & Pick<TechnicalReviewResponseWrap, 'error'>
    & { technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & Pick<TechnicalReview, 'id'>
    )> }
  ) }
);

export type AddUserForReviewMutationVariables = Exact<{
  userID: Scalars['Int'];
  proposalID: Scalars['Int'];
  sepID: Scalars['Int'];
}>;


export type AddUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { addUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & Pick<ReviewResponseWrap, 'error'>
    & { review: Maybe<(
      { __typename?: 'Review' }
      & Pick<Review, 'id'>
    )> }
  ) }
);

export type CoreReviewFragment = (
  { __typename?: 'Review' }
  & Pick<Review, 'id' | 'userID' | 'status' | 'comment' | 'grade' | 'sepID'>
);

export type GetReviewQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetReviewQuery = (
  { __typename?: 'Query' }
  & { review: Maybe<(
    { __typename?: 'Review' }
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'title' | 'abstract'>
      & { proposer: (
        { __typename?: 'BasicUserDetails' }
        & Pick<BasicUserDetails, 'id'>
      ) }
    )> }
    & CoreReviewFragment
  )> }
);

export type RemoveUserForReviewMutationVariables = Exact<{
  reviewID: Scalars['Int'];
}>;


export type RemoveUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { removeUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & Pick<ReviewResponseWrap, 'error'>
  ) }
);

export type UpdateReviewMutationVariables = Exact<{
  reviewID: Scalars['Int'];
  grade: Scalars['Int'];
  comment: Scalars['String'];
  status: ReviewStatus;
  sepID: Scalars['Int'];
}>;


export type UpdateReviewMutation = (
  { __typename?: 'Mutation' }
  & { addReview: (
    { __typename?: 'ReviewResponseWrap' }
    & Pick<ReviewResponseWrap, 'error'>
    & { review: Maybe<(
      { __typename?: 'Review' }
      & CoreReviewFragment
    )> }
  ) }
);

export type UserWithReviewsQueryVariables = Exact<{ [key: string]: never; }>;


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
        & Pick<Proposal, 'id' | 'title' | 'shortCode'>
      )> }
    )> }
  )> }
);

export type AssignQuestionsToTopicMutationVariables = Exact<{
  templateId: Scalars['Int'];
  topicId: Scalars['Int'];
  questionIds?: Maybe<Array<Scalars['String']>>;
}>;


export type AssignQuestionsToTopicMutation = (
  { __typename?: 'Mutation' }
  & { assignQuestionsToTopic: (
    { __typename?: 'AssignQuestionsToTopicResponseWrap' }
    & Pick<AssignQuestionsToTopicResponseWrap, 'error'>
  ) }
);

export type CloneTemplateMutationVariables = Exact<{
  templateId: Scalars['Int'];
}>;


export type CloneTemplateMutation = (
  { __typename?: 'Mutation' }
  & { cloneTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
    )> }
  ) }
);

export type CreateTemplateMutationVariables = Exact<{
  categoryId: TemplateCategoryId;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
}>;


export type CreateTemplateMutation = (
  { __typename?: 'Mutation' }
  & { createTemplate: (
    { __typename?: 'TemplateResponseWrap' }
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
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
    & Pick<QuestionResponseWrap, 'error'>
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
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
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
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
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
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
    & Pick<QuestionResponseWrap, 'error'>
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
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
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
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
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & Pick<Template, 'templateId' | 'name'>
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
    & Pick<TemplateResponseWrap, 'error'>
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
  & Pick<DateConfig, 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigEmbellishmentConfigFragment = (
  { __typename?: 'EmbellishmentConfig' }
  & Pick<EmbellishmentConfig, 'html' | 'plain' | 'small_label' | 'required' | 'tooltip' | 'omitFromPdf'>
);

type FieldConfigFileUploadConfigFragment = (
  { __typename?: 'FileUploadConfig' }
  & Pick<FileUploadConfig, 'file_type' | 'max_files' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigSelectionFromOptionsConfigFragment = (
  { __typename?: 'SelectionFromOptionsConfig' }
  & Pick<SelectionFromOptionsConfig, 'variant' | 'options' | 'small_label' | 'required' | 'tooltip'>
);

type FieldConfigTextInputConfigFragment = (
  { __typename?: 'TextInputConfig' }
  & Pick<TextInputConfig, 'min' | 'max' | 'multiline' | 'placeholder' | 'small_label' | 'required' | 'tooltip' | 'htmlQuestion' | 'isHtmlQuestion'>
);

type FieldConfigSubtemplateConfigFragment = (
  { __typename?: 'SubtemplateConfig' }
  & Pick<SubtemplateConfig, 'addEntryButtonLabel' | 'maxEntries' | 'templateId' | 'small_label' | 'required' | 'tooltip'>
);

export type FieldConfigFragment = FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment | FieldConfigSubtemplateConfigFragment;

export type QuestionFragment = (
  { __typename?: 'Question' }
  & Pick<Question, 'question' | 'proposalQuestionId' | 'naturalKey' | 'dataType' | 'categoryId'>
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
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'SubtemplateConfig' }
    & FieldConfigSubtemplateConfigFragment
  ) }
);

export type QuestionTemplateRelationFragment = (
  { __typename?: 'QuestionTemplateRelation' }
  & Pick<QuestionTemplateRelation, 'sortOrder' | 'topicId'>
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
    { __typename?: 'SelectionFromOptionsConfig' }
    & FieldConfigSelectionFromOptionsConfigFragment
  ) | (
    { __typename?: 'TextInputConfig' }
    & FieldConfigTextInputConfigFragment
  ) | (
    { __typename?: 'SubtemplateConfig' }
    & FieldConfigSubtemplateConfigFragment
  ), dependency: Maybe<(
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
  & Pick<Template, 'templateId' | 'categoryId' | 'name' | 'description'>
  & { steps: Array<(
    { __typename?: 'TemplateStep' }
    & { topic: (
      { __typename?: 'Topic' }
      & Pick<Topic, 'title' | 'id'>
    ), fields: Array<(
      { __typename?: 'QuestionTemplateRelation' }
      & QuestionTemplateRelationFragment
    )> }
  )>, complementaryQuestions: Array<(
    { __typename?: 'Question' }
    & QuestionFragment
  )> }
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
  & Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>
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
    & Pick<ProposalTemplate, 'templateId' | 'name' | 'description' | 'isArchived' | 'proposalCount' | 'callCount'>
  )>> }
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

export type GetTemplatesQueryVariables = Exact<{
  filter?: Maybe<TemplatesFilter>;
}>;


export type GetTemplatesQuery = (
  { __typename?: 'Query' }
  & { templates: Maybe<Array<(
    { __typename?: 'Template' }
    & Pick<Template, 'templateId' | 'name' | 'description' | 'isArchived'>
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
    & Pick<QuestionResponseWrap, 'error'>
    & { question: Maybe<(
      { __typename?: 'Question' }
      & QuestionFragment
    )> }
  ) }
);

export type UpdateQuestionTemplateRelationMutationVariables = Exact<{
  questionId: Scalars['String'];
  templateId: Scalars['Int'];
  topicId?: Maybe<Scalars['Int']>;
  sortOrder?: Maybe<Scalars['Int']>;
  config?: Maybe<Scalars['String']>;
  dependency?: Maybe<FieldDependencyInput>;
}>;


export type UpdateQuestionTemplateRelationMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestionTemplateRelation: (
    { __typename?: 'TemplateResponseWrap' }
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateFragment
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
    & Pick<TemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'Template' }
      & TemplateMetadataFragment
    )> }
  ) }
);

export type UpdateTopicMutationVariables = Exact<{
  topicId: Scalars['Int'];
  title?: Maybe<Scalars['String']>;
  isEnabled?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateTopicMutation = (
  { __typename?: 'Mutation' }
  & { updateTopic: (
    { __typename?: 'TopicResponseWrap' }
    & Pick<TopicResponseWrap, 'error'>
    & { topic: Maybe<(
      { __typename?: 'Topic' }
      & TopicFragment
    )> }
  ) }
);

export type UpdateTopicOrderMutationVariables = Exact<{
  topicOrder: Array<Scalars['Int']>;
}>;


export type UpdateTopicOrderMutation = (
  { __typename?: 'Mutation' }
  & { updateTopicOrder: (
    { __typename?: 'UpdateTopicOrderResponseWrap' }
    & Pick<UpdateTopicOrderResponseWrap, 'error'>
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
    & Pick<UserResponseWrap, 'error'>
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
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
    & Pick<CreateUserByEmailInviteResponseWrap, 'error' | 'id'>
  ) }
);

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteUserMutation = (
  { __typename?: 'Mutation' }
  & { deleteUser: (
    { __typename?: 'UserResponseWrap' }
    & Pick<UserResponseWrap, 'error'>
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
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
    & Pick<TokenResponseWrap, 'token' | 'error'>
  ) }
);

export type GetTokenForUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type GetTokenForUserMutation = (
  { __typename?: 'Mutation' }
  & { getTokenForUser: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token' | 'error'>
  ) }
);

export type GetUserQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid'>
  )> }
);

export type GetUserMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserMeQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid'>
  )> }
);

export type GetUserProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProposalsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'shortCode' | 'title' | 'status' | 'created' | 'finalStatus' | 'notified'>
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
  subtractUsers?: Maybe<Array<Scalars['Int']>>;
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
    & Pick<TokenResponseWrap, 'token' | 'error'>
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
    & Pick<BasicUserDetailsResponseWrap, 'error'>
  ) }
);

export type ResetPasswordEmailMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ResetPasswordEmailMutation = (
  { __typename?: 'Mutation' }
  & { resetPasswordEmail: (
    { __typename?: 'ResetPasswordEmailResponseWrap' }
    & Pick<ResetPasswordEmailResponseWrap, 'error' | 'success'>
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
    & Pick<TokenResponseWrap, 'token' | 'error'>
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
    & Pick<BasicUserDetailsResponseWrap, 'error'>
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
    & Pick<UserResponseWrap, 'error'>
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
    )> }
  ) }
);

export type UpdateUserRolesMutationVariables = Exact<{
  id: Scalars['Int'];
  roles?: Maybe<Array<Scalars['Int']>>;
}>;


export type UpdateUserRolesMutation = (
  { __typename?: 'Mutation' }
  & { updateUser: (
    { __typename?: 'UserResponseWrap' }
    & Pick<UserResponseWrap, 'error'>
    & { user: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id'>
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
    & Pick<EmailVerificationResponseWrap, 'error' | 'success'>
  ) }
);

export const CoreTechnicalReviewFragmentDoc = gql`
    fragment coreTechnicalReview on TechnicalReview {
  id
  comment
  publicComment
  timeAllocation
  status
  proposalID
}
    `;
export const ProposalFragmentDoc = gql`
    fragment proposal on Proposal {
  id
  title
  abstract
  status
  shortCode
  rankOrder
  finalStatus
  commentForUser
  commentForManagement
  created
  updated
  callId
  questionaryId
  notified
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
  }
  ... on EmbellishmentConfig {
    html
    plain
    small_label
    required
    tooltip
    omitFromPdf
  }
  ... on FileUploadConfig {
    file_type
    max_files
    small_label
    required
    tooltip
  }
  ... on SelectionFromOptionsConfig {
    variant
    options
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
  }
  ... on SubtemplateConfig {
    addEntryButtonLabel
    maxEntries
    templateId
    small_label
    required
    tooltip
  }
}
    `;
export const QuestionFragmentDoc = gql`
    fragment question on Question {
  question
  proposalQuestionId
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
  question {
    ...question
  }
  sortOrder
  topicId
  config {
    ...fieldConfig
  }
  dependency {
    questionId
    dependencyId
    dependencyNaturalKey
    condition {
      ...fieldCondition
    }
  }
  value
}
    ${QuestionFragmentDoc}
${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const QuestionaryStepFragmentDoc = gql`
    fragment questionaryStep on QuestionaryStep {
  topic {
    title
    id
    sortOrder
    isEnabled
  }
  isCompleted
  fields {
    ...answer
  }
}
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
  dependency {
    questionId
    dependencyId
    dependencyNaturalKey
    condition {
      ...fieldCondition
    }
  }
}
    ${QuestionFragmentDoc}
${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const TemplateFragmentDoc = gql`
    fragment template on Template {
  steps {
    topic {
      title
      id
    }
    fields {
      ...questionTemplateRelation
    }
  }
  templateId
  categoryId
  name
  description
  complementaryQuestions {
    ...question
  }
}
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
export const TopicFragmentDoc = gql`
    fragment topic on Topic {
  title
  id
  sortOrder
  isEnabled
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
export const AssignProposalDocument = gql`
    mutation assignProposal($proposalId: Int!, $sepId: Int!) {
  assignProposal(proposalId: $proposalId, sepId: $sepId) {
    error
    sep {
      id
    }
  }
}
    `;
export const AssignMembersDocument = gql`
    mutation assignMembers($memberIds: [Int!]!, $sepId: Int!) {
  assignMembers(memberIds: $memberIds, sepId: $sepId) {
    error
    sep {
      id
    }
  }
}
    `;
export const AssignChairOrSecretaryDocument = gql`
    mutation assignChairOrSecretary($addSEPMembersRole: AddSEPMembersRole!) {
  assignChairOrSecretary(addSEPMembersRole: $addSEPMembersRole) {
    error
    sep {
      id
    }
  }
}
    `;
export const AssignMemberToSepProposalDocument = gql`
    mutation assignMemberToSEPProposal($memberId: Int!, $sepId: Int!, $proposalId: Int!) {
  assignMemberToSEPProposal(memberId: $memberId, sepId: $sepId, proposalId: $proposalId) {
    error
    sep {
      id
    }
  }
}
    `;
export const CreateSepDocument = gql`
    mutation createSEP($code: String!, $description: String!, $numberRatingsRequired: Int!, $active: Boolean!) {
  createSEP(code: $code, description: $description, numberRatingsRequired: $numberRatingsRequired, active: $active) {
    sep {
      id
      code
      description
      numberRatingsRequired
      active
    }
    error
  }
}
    `;
export const GetInstrumentsBySepDocument = gql`
    query getInstrumentsBySEP($sepId: Int!, $callId: Int!) {
  instrumentsBySep(sepId: $sepId, callId: $callId) {
    id
    name
    shortCode
    description
    availabilityTime
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
    }
  }
}
    `;
export const GetSepDocument = gql`
    query getSEP($id: Int!) {
  sep(id: $id) {
    id
    code
    description
    numberRatingsRequired
    active
  }
}
    `;
export const GetSepMembersDocument = gql`
    query getSEPMembers($sepId: Int!) {
  sepMembers(sepId: $sepId) {
    roleUserId
    roleId
    userId
    sepId
    roles {
      id
      shortCode
      title
    }
    user {
      id
      firstname
      lastname
      organisation
    }
  }
}
    `;
export const GetSepProposalsDocument = gql`
    query getSEPProposals($sepId: Int!, $callId: Int!) {
  sepProposals(sepId: $sepId, callId: $callId) {
    proposalId
    dateAssigned
    sepId
    proposal {
      title
      id
      shortCode
      status
    }
    assignments {
      sepMemberUserId
      dateAssigned
      user {
        id
        firstname
        lastname
        organisation
        position
      }
      roles {
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
    `;
export const SepProposalsByInstrumentDocument = gql`
    query sepProposalsByInstrument($instrumentId: Int!, $sepId: Int!, $callId: Int!) {
  sepProposalsByInstrument(instrumentId: $instrumentId, sepId: $sepId, callId: $callId) {
    proposal {
      id
      title
      shortCode
      rankOrder
      status
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
  }
}
    `;
export const GetSePsDocument = gql`
    query getSEPs($filter: String!, $active: Boolean!) {
  seps(filter: $filter, active: $active) {
    seps {
      id
      code
      description
      numberRatingsRequired
      active
    }
    totalCount
  }
}
    `;
export const RemoveProposalAssignmentDocument = gql`
    mutation removeProposalAssignment($proposalId: Int!, $sepId: Int!) {
  removeProposalAssignment(proposalId: $proposalId, sepId: $sepId) {
    error
    sep {
      id
    }
  }
}
    `;
export const RemoveMemberDocument = gql`
    mutation removeMember($memberId: Int!, $sepId: Int!) {
  removeMember(memberId: $memberId, sepId: $sepId) {
    error
    sep {
      id
    }
  }
}
    `;
export const RemoveMemberFromSepProposalDocument = gql`
    mutation removeMemberFromSEPProposal($memberId: Int!, $sepId: Int!, $proposalId: Int!) {
  removeMemberFromSEPProposal(memberId: $memberId, sepId: $sepId, proposalId: $proposalId) {
    error
    sep {
      id
    }
  }
}
    `;
export const UpdateSepDocument = gql`
    mutation updateSEP($id: Int!, $code: String!, $description: String!, $numberRatingsRequired: Int!, $active: Boolean!) {
  updateSEP(id: $id, code: $code, description: $description, numberRatingsRequired: $numberRatingsRequired, active: $active) {
    sep {
      id
    }
    error
  }
}
    `;
export const AddClientLogDocument = gql`
    mutation addClientLog($error: String!) {
  addClientLog(error: $error) {
    isSuccess
    error
  }
}
    `;
export const CreateInstitutionDocument = gql`
    mutation createInstitution($name: String!, $verified: Boolean!) {
  createInstitution(name: $name, verified: $verified) {
    institution {
      id
      name
      verified
    }
    error
  }
}
    `;
export const DeleteInstitutionDocument = gql`
    mutation deleteInstitution($id: Int!) {
  deleteInstitution(id: $id) {
    institution {
      id
      verified
    }
    error
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
export const SetPageContentDocument = gql`
    mutation setPageContent($id: PageName!, $text: String!) {
  setPageContent(id: $id, text: $text) {
    page {
      id
      content
    }
    error
  }
}
    `;
export const UpdateInstitutionDocument = gql`
    mutation updateInstitution($id: Int!, $name: String!, $verified: Boolean!) {
  updateInstitution(id: $id, name: $name, verified: $verified) {
    institution {
      id
      verified
      name
    }
    error
  }
}
    `;
export const AssignInstrumentToCallDocument = gql`
    mutation assignInstrumentToCall($instrumentIds: [Int!]!, $callId: Int!) {
  assignInstrumentToCall(instrumentIds: $instrumentIds, callId: $callId) {
    error
    call {
      id
    }
  }
}
    `;
export const CreateCallDocument = gql`
    mutation createCall($shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $surveyComment: String!, $templateId: Int) {
  createCall(shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, surveyComment: $surveyComment, templateId: $templateId) {
    error
    call {
      id
      shortCode
      startCall
      endCall
      startReview
      endReview
      startNotify
      endNotify
      startCycle
      endCycle
      cycleComment
      surveyComment
      templateId
      instruments {
        id
        name
        shortCode
        description
        availabilityTime
      }
    }
  }
}
    `;
export const GetCallsDocument = gql`
    query getCalls($filter: CallsFilter) {
  calls(filter: $filter) {
    id
    shortCode
    startCall
    endCall
    startReview
    endReview
    startNotify
    endNotify
    startCycle
    endCycle
    cycleComment
    surveyComment
    templateId
    instruments {
      id
      name
      shortCode
      description
      availabilityTime
      scientists {
        ...basicUserDetails
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const RemoveAssignedInstrumentFromcallDocument = gql`
    mutation removeAssignedInstrumentFromcall($instrumentId: Int!, $callId: Int!) {
  removeAssignedInstrumentFromcall(instrumentId: $instrumentId, callId: $callId) {
    error
    call {
      id
    }
  }
}
    `;
export const UpdateCallDocument = gql`
    mutation updateCall($id: Int!, $shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startNotify: DateTime!, $endNotify: DateTime!, $startCycle: DateTime!, $endCycle: DateTime!, $cycleComment: String!, $surveyComment: String!, $templateId: Int) {
  updateCall(id: $id, shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startNotify: $startNotify, endNotify: $endNotify, startCycle: $startCycle, endCycle: $endCycle, cycleComment: $cycleComment, surveyComment: $surveyComment, templateId: $templateId) {
    error
    call {
      id
      shortCode
      startCall
      endCall
      startReview
      endReview
      startNotify
      endNotify
      startCycle
      endCycle
      cycleComment
      surveyComment
      templateId
      instruments {
        id
        name
        shortCode
        description
        availabilityTime
      }
    }
  }
}
    `;
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
export const AssignProposalsToInstrumentDocument = gql`
    mutation assignProposalsToInstrument($proposalIds: [Int!]!, $instrumentId: Int!) {
  assignProposalsToInstrument(proposalIds: $proposalIds, instrumentId: $instrumentId) {
    error
    isSuccess
  }
}
    `;
export const AssignScientistsToInstrumentDocument = gql`
    mutation assignScientistsToInstrument($scientistIds: [Int!]!, $instrumentId: Int!) {
  assignScientistsToInstrument(scientistIds: $scientistIds, instrumentId: $instrumentId) {
    error
    isSuccess
  }
}
    `;
export const CreateInstrumentDocument = gql`
    mutation createInstrument($name: String!, $shortCode: String!, $description: String!) {
  createInstrument(name: $name, shortCode: $shortCode, description: $description) {
    instrument {
      id
      name
      shortCode
      description
      scientists {
        ...basicUserDetails
      }
    }
    error
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const DeleteInstrumentDocument = gql`
    mutation deleteInstrument($id: Int!) {
  deleteInstrument(id: $id) {
    error
  }
}
    `;
export const GetInstrumentsDocument = gql`
    query getInstruments {
  instruments {
    instruments {
      id
      name
      shortCode
      description
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
export const RemoveProposalFromInstrumentDocument = gql`
    mutation removeProposalFromInstrument($proposalId: Int!, $instrumentId: Int!) {
  removeProposalFromInstrument(proposalId: $proposalId, instrumentId: $instrumentId) {
    error
    isSuccess
  }
}
    `;
export const RemoveScientistFromInstrumentDocument = gql`
    mutation removeScientistFromInstrument($scientistId: Int!, $instrumentId: Int!) {
  removeScientistFromInstrument(scientistId: $scientistId, instrumentId: $instrumentId) {
    error
    isSuccess
  }
}
    `;
export const SetInstrumentAvailabilityTimeDocument = gql`
    mutation setInstrumentAvailabilityTime($callId: Int!, $instrumentId: Int!, $availabilityTime: Int!) {
  setInstrumentAvailabilityTime(callId: $callId, instrumentId: $instrumentId, availabilityTime: $availabilityTime) {
    error
    isSuccess
  }
}
    `;
export const UpdateInstrumentDocument = gql`
    mutation updateInstrument($id: Int!, $name: String!, $shortCode: String!, $description: String!) {
  updateInstrument(id: $id, name: $name, shortCode: $shortCode, description: $description) {
    instrument {
      id
      name
      shortCode
      description
      scientists {
        ...basicUserDetails
      }
    }
    error
  }
}
    ${BasicUserDetailsFragmentDoc}`;
export const AdministrationProposalDocument = gql`
    mutation administrationProposal($id: Int!, $rankOrder: Int, $finalStatus: ProposalEndStatus, $status: ProposalStatus, $commentForUser: String, $commentForManagement: String) {
  administrationProposal(id: $id, rankOrder: $rankOrder, finalStatus: $finalStatus, status: $status, commentForUser: $commentForUser, commentForManagement: $commentForManagement) {
    proposal {
      id
    }
    error
  }
}
    `;
export const CreateProposalDocument = gql`
    mutation createProposal($callId: Int!) {
  createProposal(callId: $callId) {
    proposal {
      id
      status
      shortCode
      questionaryId
    }
    error
  }
}
    `;
export const DeleteProposalDocument = gql`
    mutation deleteProposal($id: Int!) {
  deleteProposal(id: $id) {
    proposal {
      id
    }
  }
}
    `;
export const GetBlankProposalDocument = gql`
    query getBlankProposal($callId: Int!) {
  blankProposal(callId: $callId) {
    ...proposal
    proposer {
      ...basicUserDetails
    }
    questionary {
      ...questionary
    }
    users {
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
        username
        id
      }
    }
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}`;
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
          username
          id
        }
      }
      users {
        ...basicUserDetails
      }
      technicalReview {
        id
        comment
        publicComment
        timeAllocation
        status
        proposalID
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
${BasicUserDetailsFragmentDoc}`;
export const GetProposalDocument = gql`
    query getProposal($id: Int!) {
  proposal(id: $id) {
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
        username
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
    }
  }
}
    ${ProposalFragmentDoc}
${BasicUserDetailsFragmentDoc}
${QuestionaryFragmentDoc}
${CoreTechnicalReviewFragmentDoc}`;
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
          username
          id
        }
      }
      users {
        ...basicUserDetails
      }
      technicalReview {
        id
        comment
        publicComment
        timeAllocation
        status
        proposalID
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
${BasicUserDetailsFragmentDoc}`;
export const NotifyProposalDocument = gql`
    mutation notifyProposal($id: Int!) {
  notifyProposal(id: $id) {
    proposal {
      id
    }
    error
  }
}
    `;
export const SubmitProposalDocument = gql`
    mutation submitProposal($id: Int!) {
  submitProposal(id: $id) {
    proposal {
      id
    }
    error
  }
}
    `;
export const UpdateProposalDocument = gql`
    mutation updateProposal($id: Int!, $title: String, $abstract: String, $users: [Int!], $proposerId: Int) {
  updateProposal(id: $id, title: $title, abstract: $abstract, users: $users, proposerId: $proposerId) {
    proposal {
      id
    }
    error
  }
}
    `;
export const AnswerTopicDocument = gql`
    mutation answerTopic($questionaryId: Int!, $topicId: Int!, $answers: [AnswerInput!]!, $isPartialSave: Boolean) {
  answerTopic(questionaryId: $questionaryId, topicId: $topicId, answers: $answers, isPartialSave: $isPartialSave) {
    questionaryStep {
      ...questionaryStep
    }
    error
  }
}
    ${QuestionaryStepFragmentDoc}`;
export const CreateQuestionaryDocument = gql`
    mutation createQuestionary($templateId: Int!) {
  createQuestionary(templateId: $templateId) {
    questionary {
      ...questionary
    }
    error
  }
}
    ${QuestionaryFragmentDoc}`;
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
    mutation addTechnicalReview($proposalID: Int!, $timeAllocation: Int, $comment: String, $publicComment: String, $status: TechnicalReviewStatus) {
  addTechnicalReview(proposalID: $proposalID, timeAllocation: $timeAllocation, comment: $comment, publicComment: $publicComment, status: $status) {
    error
    technicalReview {
      id
    }
  }
}
    `;
export const AddUserForReviewDocument = gql`
    mutation addUserForReview($userID: Int!, $proposalID: Int!, $sepID: Int!) {
  addUserForReview(userID: $userID, proposalID: $proposalID, sepID: $sepID) {
    error
    review {
      id
    }
  }
}
    `;
export const GetReviewDocument = gql`
    query getReview($id: Int!) {
  review(id: $id) {
    ...coreReview
    proposal {
      id
      title
      abstract
      proposer {
        id
      }
    }
  }
}
    ${CoreReviewFragmentDoc}`;
export const RemoveUserForReviewDocument = gql`
    mutation removeUserForReview($reviewID: Int!) {
  removeUserForReview(reviewID: $reviewID) {
    error
  }
}
    `;
export const UpdateReviewDocument = gql`
    mutation updateReview($reviewID: Int!, $grade: Int!, $comment: String!, $status: ReviewStatus!, $sepID: Int!) {
  addReview(reviewID: $reviewID, grade: $grade, comment: $comment, status: $status, sepID: $sepID) {
    error
    review {
      ...coreReview
    }
  }
}
    ${CoreReviewFragmentDoc}`;
export const UserWithReviewsDocument = gql`
    query userWithReviews {
  me {
    id
    firstname
    lastname
    organisation
    reviews {
      id
      grade
      comment
      status
      sepID
      proposal {
        id
        title
        shortCode
      }
    }
  }
}
    `;
export const AssignQuestionsToTopicDocument = gql`
    mutation assignQuestionsToTopic($templateId: Int!, $topicId: Int!, $questionIds: [String!]) {
  assignQuestionsToTopic(templateId: $templateId, topicId: $topicId, questionIds: $questionIds) {
    error
  }
}
    `;
export const CloneTemplateDocument = gql`
    mutation cloneTemplate($templateId: Int!) {
  cloneTemplate(templateId: $templateId) {
    template {
      ...templateMetadata
    }
    error
  }
}
    ${TemplateMetadataFragmentDoc}`;
export const CreateTemplateDocument = gql`
    mutation createTemplate($categoryId: TemplateCategoryId!, $name: String!, $description: String) {
  createTemplate(categoryId: $categoryId, name: $name, description: $description) {
    template {
      ...templateMetadata
    }
    error
  }
}
    ${TemplateMetadataFragmentDoc}`;
export const CreateQuestionDocument = gql`
    mutation createQuestion($categoryId: TemplateCategoryId!, $dataType: DataType!) {
  createQuestion(categoryId: $categoryId, dataType: $dataType) {
    question {
      ...question
    }
    error
  }
}
    ${QuestionFragmentDoc}`;
export const CreateQuestionTemplateRelationDocument = gql`
    mutation createQuestionTemplateRelation($templateId: Int!, $questionId: String!, $topicId: Int!, $sortOrder: Int!) {
  createQuestionTemplateRelation(templateId: $templateId, questionId: $questionId, topicId: $topicId, sortOrder: $sortOrder) {
    template {
      ...template
    }
    error
  }
}
    ${TemplateFragmentDoc}`;
export const CreateTopicDocument = gql`
    mutation createTopic($templateId: Int!, $sortOrder: Int!) {
  createTopic(templateId: $templateId, sortOrder: $sortOrder) {
    template {
      ...template
    }
    error
  }
}
    ${TemplateFragmentDoc}`;
export const DeleteQuestionDocument = gql`
    mutation deleteQuestion($questionId: String!) {
  deleteQuestion(questionId: $questionId) {
    question {
      ...question
    }
    error
  }
}
    ${QuestionFragmentDoc}`;
export const DeleteQuestionTemplateRelationDocument = gql`
    mutation deleteQuestionTemplateRelation($questionId: String!, $templateId: Int!) {
  deleteQuestionTemplateRelation(questionId: $questionId, templateId: $templateId) {
    template {
      ...template
    }
    error
  }
}
    ${TemplateFragmentDoc}`;
export const DeleteTemplateDocument = gql`
    mutation deleteTemplate($id: Int!) {
  deleteTemplate(templateId: $id) {
    template {
      templateId
      name
    }
    error
  }
}
    `;
export const DeleteTopicDocument = gql`
    mutation deleteTopic($topicId: Int!) {
  deleteTopic(topicId: $topicId) {
    error
  }
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
    proposalCount
    callCount
  }
}
    `;
export const GetTemplateDocument = gql`
    query getTemplate($templateId: Int!) {
  template(templateId: $templateId) {
    ...template
  }
}
    ${TemplateFragmentDoc}`;
export const GetTemplatesDocument = gql`
    query getTemplates($filter: TemplatesFilter) {
  templates(filter: $filter) {
    templateId
    name
    description
    isArchived
  }
}
    `;
export const UpdateQuestionDocument = gql`
    mutation updateQuestion($id: String!, $naturalKey: String, $question: String, $config: String) {
  updateQuestion(id: $id, naturalKey: $naturalKey, question: $question, config: $config) {
    question {
      ...question
    }
    error
  }
}
    ${QuestionFragmentDoc}`;
export const UpdateQuestionTemplateRelationDocument = gql`
    mutation updateQuestionTemplateRelation($questionId: String!, $templateId: Int!, $topicId: Int, $sortOrder: Int, $config: String, $dependency: FieldDependencyInput) {
  updateQuestionTemplateRelation(questionId: $questionId, templateId: $templateId, topicId: $topicId, sortOrder: $sortOrder, config: $config, dependency: $dependency) {
    template {
      ...template
    }
    error
  }
}
    ${TemplateFragmentDoc}`;
export const UpdateTemplateDocument = gql`
    mutation updateTemplate($templateId: Int!, $name: String, $description: String, $isArchived: Boolean) {
  updateTemplate(templateId: $templateId, name: $name, description: $description, isArchived: $isArchived) {
    template {
      ...templateMetadata
    }
    error
  }
}
    ${TemplateMetadataFragmentDoc}`;
export const UpdateTopicDocument = gql`
    mutation updateTopic($topicId: Int!, $title: String, $isEnabled: Boolean) {
  updateTopic(id: $topicId, title: $title, isEnabled: $isEnabled) {
    topic {
      ...topic
    }
    error
  }
}
    ${TopicFragmentDoc}`;
export const UpdateTopicOrderDocument = gql`
    mutation updateTopicOrder($topicOrder: [Int!]!) {
  updateTopicOrder(topicOrder: $topicOrder) {
    error
  }
}
    `;
export const CreateUserDocument = gql`
    mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String) {
  createUser(user_title: $user_title, firstname: $firstname, middlename: $middlename, lastname: $lastname, password: $password, preferredname: $preferredname, orcid: $orcid, orcidHash: $orcidHash, refreshToken: $refreshToken, gender: $gender, nationality: $nationality, birthdate: $birthdate, organisation: $organisation, department: $department, position: $position, email: $email, telephone: $telephone, telephone_alt: $telephone_alt, otherOrganisation: $otherOrganisation) {
    user {
      id
    }
    error
  }
}
    `;
export const CreateUserByEmailInviteDocument = gql`
    mutation createUserByEmailInvite($firstname: String!, $lastname: String!, $email: String!, $userRole: UserRole!) {
  createUserByEmailInvite(firstname: $firstname, lastname: $lastname, email: $email, userRole: $userRole) {
    error
    id
  }
}
    `;
export const DeleteUserDocument = gql`
    mutation deleteUser($id: Int!) {
  deleteUser(id: $id) {
    user {
      id
    }
    error
  }
}
    `;
export const GetBasicUserDetailsDocument = gql`
    query getBasicUserDetails($id: Int!) {
  basicUserDetails(id: $id) {
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
    error
  }
}
    `;
export const GetTokenForUserDocument = gql`
    mutation getTokenForUser($userId: Int!) {
  getTokenForUser(userId: $userId) {
    token
    error
  }
}
    `;
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
  }
}
    `;
export const GetUserProposalsDocument = gql`
    query getUserProposals {
  me {
    proposals {
      id
      shortCode
      title
      status
      created
      finalStatus
      notified
    }
  }
}
    `;
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
  users(filter: $filter, first: $first, offset: $offset, userRole: $userRole, subtractUsers: $subtractUsers) {
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
    error
  }
}
    `;
export const ResetPasswordDocument = gql`
    mutation resetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password) {
    error
  }
}
    `;
export const ResetPasswordEmailDocument = gql`
    mutation resetPasswordEmail($email: String!) {
  resetPasswordEmail(email: $email) {
    error
    success
  }
}
    `;
export const SelectRoleDocument = gql`
    mutation selectRole($token: String!, $selectedRoleId: Int!) {
  selectRole(token: $token, selectedRoleId: $selectedRoleId) {
    token
    error
  }
}
    `;
export const UpdatePasswordDocument = gql`
    mutation updatePassword($id: Int!, $password: String!) {
  updatePassword(id: $id, password: $password) {
    error
  }
}
    `;
export const UpdateUserDocument = gql`
    mutation updateUser($id: Int!, $user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $preferredname: String, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String) {
  updateUser(id: $id, user_title: $user_title, firstname: $firstname, middlename: $middlename, lastname: $lastname, preferredname: $preferredname, gender: $gender, nationality: $nationality, birthdate: $birthdate, organisation: $organisation, department: $department, position: $position, email: $email, telephone: $telephone, telephone_alt: $telephone_alt) {
    user {
      id
    }
    error
  }
}
    `;
export const UpdateUserRolesDocument = gql`
    mutation updateUserRoles($id: Int!, $roles: [Int!]) {
  updateUser(id: $id, roles: $roles) {
    user {
      id
    }
    error
  }
}
    `;
export const VerifyEmailDocument = gql`
    mutation verifyEmail($token: String!) {
  emailVerification(token: $token) {
    error
    success
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    assignProposal(variables: AssignProposalMutationVariables): Promise<AssignProposalMutation> {
      return withWrapper(() => client.request<AssignProposalMutation>(print(AssignProposalDocument), variables));
    },
    assignMembers(variables: AssignMembersMutationVariables): Promise<AssignMembersMutation> {
      return withWrapper(() => client.request<AssignMembersMutation>(print(AssignMembersDocument), variables));
    },
    assignChairOrSecretary(variables: AssignChairOrSecretaryMutationVariables): Promise<AssignChairOrSecretaryMutation> {
      return withWrapper(() => client.request<AssignChairOrSecretaryMutation>(print(AssignChairOrSecretaryDocument), variables));
    },
    assignMemberToSEPProposal(variables: AssignMemberToSepProposalMutationVariables): Promise<AssignMemberToSepProposalMutation> {
      return withWrapper(() => client.request<AssignMemberToSepProposalMutation>(print(AssignMemberToSepProposalDocument), variables));
    },
    createSEP(variables: CreateSepMutationVariables): Promise<CreateSepMutation> {
      return withWrapper(() => client.request<CreateSepMutation>(print(CreateSepDocument), variables));
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
    getSEPProposals(variables: GetSepProposalsQueryVariables): Promise<GetSepProposalsQuery> {
      return withWrapper(() => client.request<GetSepProposalsQuery>(print(GetSepProposalsDocument), variables));
    },
    sepProposalsByInstrument(variables: SepProposalsByInstrumentQueryVariables): Promise<SepProposalsByInstrumentQuery> {
      return withWrapper(() => client.request<SepProposalsByInstrumentQuery>(print(SepProposalsByInstrumentDocument), variables));
    },
    getSEPs(variables: GetSePsQueryVariables): Promise<GetSePsQuery> {
      return withWrapper(() => client.request<GetSePsQuery>(print(GetSePsDocument), variables));
    },
    removeProposalAssignment(variables: RemoveProposalAssignmentMutationVariables): Promise<RemoveProposalAssignmentMutation> {
      return withWrapper(() => client.request<RemoveProposalAssignmentMutation>(print(RemoveProposalAssignmentDocument), variables));
    },
    removeMember(variables: RemoveMemberMutationVariables): Promise<RemoveMemberMutation> {
      return withWrapper(() => client.request<RemoveMemberMutation>(print(RemoveMemberDocument), variables));
    },
    removeMemberFromSEPProposal(variables: RemoveMemberFromSepProposalMutationVariables): Promise<RemoveMemberFromSepProposalMutation> {
      return withWrapper(() => client.request<RemoveMemberFromSepProposalMutation>(print(RemoveMemberFromSepProposalDocument), variables));
    },
    updateSEP(variables: UpdateSepMutationVariables): Promise<UpdateSepMutation> {
      return withWrapper(() => client.request<UpdateSepMutation>(print(UpdateSepDocument), variables));
    },
    addClientLog(variables: AddClientLogMutationVariables): Promise<AddClientLogMutation> {
      return withWrapper(() => client.request<AddClientLogMutation>(print(AddClientLogDocument), variables));
    },
    createInstitution(variables: CreateInstitutionMutationVariables): Promise<CreateInstitutionMutation> {
      return withWrapper(() => client.request<CreateInstitutionMutation>(print(CreateInstitutionDocument), variables));
    },
    deleteInstitution(variables: DeleteInstitutionMutationVariables): Promise<DeleteInstitutionMutation> {
      return withWrapper(() => client.request<DeleteInstitutionMutation>(print(DeleteInstitutionDocument), variables));
    },
    getInstitutions(variables?: GetInstitutionsQueryVariables): Promise<GetInstitutionsQuery> {
      return withWrapper(() => client.request<GetInstitutionsQuery>(print(GetInstitutionsDocument), variables));
    },
    getPageContent(variables: GetPageContentQueryVariables): Promise<GetPageContentQuery> {
      return withWrapper(() => client.request<GetPageContentQuery>(print(GetPageContentDocument), variables));
    },
    setPageContent(variables: SetPageContentMutationVariables): Promise<SetPageContentMutation> {
      return withWrapper(() => client.request<SetPageContentMutation>(print(SetPageContentDocument), variables));
    },
    updateInstitution(variables: UpdateInstitutionMutationVariables): Promise<UpdateInstitutionMutation> {
      return withWrapper(() => client.request<UpdateInstitutionMutation>(print(UpdateInstitutionDocument), variables));
    },
    assignInstrumentToCall(variables: AssignInstrumentToCallMutationVariables): Promise<AssignInstrumentToCallMutation> {
      return withWrapper(() => client.request<AssignInstrumentToCallMutation>(print(AssignInstrumentToCallDocument), variables));
    },
    createCall(variables: CreateCallMutationVariables): Promise<CreateCallMutation> {
      return withWrapper(() => client.request<CreateCallMutation>(print(CreateCallDocument), variables));
    },
    getCalls(variables?: GetCallsQueryVariables): Promise<GetCallsQuery> {
      return withWrapper(() => client.request<GetCallsQuery>(print(GetCallsDocument), variables));
    },
    removeAssignedInstrumentFromcall(variables: RemoveAssignedInstrumentFromcallMutationVariables): Promise<RemoveAssignedInstrumentFromcallMutation> {
      return withWrapper(() => client.request<RemoveAssignedInstrumentFromcallMutation>(print(RemoveAssignedInstrumentFromcallDocument), variables));
    },
    updateCall(variables: UpdateCallMutationVariables): Promise<UpdateCallMutation> {
      return withWrapper(() => client.request<UpdateCallMutation>(print(UpdateCallDocument), variables));
    },
    getEventLogs(variables: GetEventLogsQueryVariables): Promise<GetEventLogsQuery> {
      return withWrapper(() => client.request<GetEventLogsQuery>(print(GetEventLogsDocument), variables));
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
    removeProposalFromInstrument(variables: RemoveProposalFromInstrumentMutationVariables): Promise<RemoveProposalFromInstrumentMutation> {
      return withWrapper(() => client.request<RemoveProposalFromInstrumentMutation>(print(RemoveProposalFromInstrumentDocument), variables));
    },
    removeScientistFromInstrument(variables: RemoveScientistFromInstrumentMutationVariables): Promise<RemoveScientistFromInstrumentMutation> {
      return withWrapper(() => client.request<RemoveScientistFromInstrumentMutation>(print(RemoveScientistFromInstrumentDocument), variables));
    },
    setInstrumentAvailabilityTime(variables: SetInstrumentAvailabilityTimeMutationVariables): Promise<SetInstrumentAvailabilityTimeMutation> {
      return withWrapper(() => client.request<SetInstrumentAvailabilityTimeMutation>(print(SetInstrumentAvailabilityTimeDocument), variables));
    },
    updateInstrument(variables: UpdateInstrumentMutationVariables): Promise<UpdateInstrumentMutation> {
      return withWrapper(() => client.request<UpdateInstrumentMutation>(print(UpdateInstrumentDocument), variables));
    },
    administrationProposal(variables: AdministrationProposalMutationVariables): Promise<AdministrationProposalMutation> {
      return withWrapper(() => client.request<AdministrationProposalMutation>(print(AdministrationProposalDocument), variables));
    },
    createProposal(variables: CreateProposalMutationVariables): Promise<CreateProposalMutation> {
      return withWrapper(() => client.request<CreateProposalMutation>(print(CreateProposalDocument), variables));
    },
    deleteProposal(variables: DeleteProposalMutationVariables): Promise<DeleteProposalMutation> {
      return withWrapper(() => client.request<DeleteProposalMutation>(print(DeleteProposalDocument), variables));
    },
    getBlankProposal(variables: GetBlankProposalQueryVariables): Promise<GetBlankProposalQuery> {
      return withWrapper(() => client.request<GetBlankProposalQuery>(print(GetBlankProposalDocument), variables));
    },
    getInstrumentScientistProposals(variables?: GetInstrumentScientistProposalsQueryVariables): Promise<GetInstrumentScientistProposalsQuery> {
      return withWrapper(() => client.request<GetInstrumentScientistProposalsQuery>(print(GetInstrumentScientistProposalsDocument), variables));
    },
    getProposal(variables: GetProposalQueryVariables): Promise<GetProposalQuery> {
      return withWrapper(() => client.request<GetProposalQuery>(print(GetProposalDocument), variables));
    },
    getProposals(variables?: GetProposalsQueryVariables): Promise<GetProposalsQuery> {
      return withWrapper(() => client.request<GetProposalsQuery>(print(GetProposalsDocument), variables));
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
    answerTopic(variables: AnswerTopicMutationVariables): Promise<AnswerTopicMutation> {
      return withWrapper(() => client.request<AnswerTopicMutation>(print(AnswerTopicDocument), variables));
    },
    createQuestionary(variables: CreateQuestionaryMutationVariables): Promise<CreateQuestionaryMutation> {
      return withWrapper(() => client.request<CreateQuestionaryMutation>(print(CreateQuestionaryDocument), variables));
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
    getReview(variables: GetReviewQueryVariables): Promise<GetReviewQuery> {
      return withWrapper(() => client.request<GetReviewQuery>(print(GetReviewDocument), variables));
    },
    removeUserForReview(variables: RemoveUserForReviewMutationVariables): Promise<RemoveUserForReviewMutation> {
      return withWrapper(() => client.request<RemoveUserForReviewMutation>(print(RemoveUserForReviewDocument), variables));
    },
    updateReview(variables: UpdateReviewMutationVariables): Promise<UpdateReviewMutation> {
      return withWrapper(() => client.request<UpdateReviewMutation>(print(UpdateReviewDocument), variables));
    },
    userWithReviews(variables?: UserWithReviewsQueryVariables): Promise<UserWithReviewsQuery> {
      return withWrapper(() => client.request<UserWithReviewsQuery>(print(UserWithReviewsDocument), variables));
    },
    assignQuestionsToTopic(variables: AssignQuestionsToTopicMutationVariables): Promise<AssignQuestionsToTopicMutation> {
      return withWrapper(() => client.request<AssignQuestionsToTopicMutation>(print(AssignQuestionsToTopicDocument), variables));
    },
    cloneTemplate(variables: CloneTemplateMutationVariables): Promise<CloneTemplateMutation> {
      return withWrapper(() => client.request<CloneTemplateMutation>(print(CloneTemplateDocument), variables));
    },
    createTemplate(variables: CreateTemplateMutationVariables): Promise<CreateTemplateMutation> {
      return withWrapper(() => client.request<CreateTemplateMutation>(print(CreateTemplateDocument), variables));
    },
    createQuestion(variables: CreateQuestionMutationVariables): Promise<CreateQuestionMutation> {
      return withWrapper(() => client.request<CreateQuestionMutation>(print(CreateQuestionDocument), variables));
    },
    createQuestionTemplateRelation(variables: CreateQuestionTemplateRelationMutationVariables): Promise<CreateQuestionTemplateRelationMutation> {
      return withWrapper(() => client.request<CreateQuestionTemplateRelationMutation>(print(CreateQuestionTemplateRelationDocument), variables));
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
    getIsNaturalKeyPresent(variables: GetIsNaturalKeyPresentQueryVariables): Promise<GetIsNaturalKeyPresentQuery> {
      return withWrapper(() => client.request<GetIsNaturalKeyPresentQuery>(print(GetIsNaturalKeyPresentDocument), variables));
    },
    getProposalTemplates(variables?: GetProposalTemplatesQueryVariables): Promise<GetProposalTemplatesQuery> {
      return withWrapper(() => client.request<GetProposalTemplatesQuery>(print(GetProposalTemplatesDocument), variables));
    },
    getTemplate(variables: GetTemplateQueryVariables): Promise<GetTemplateQuery> {
      return withWrapper(() => client.request<GetTemplateQuery>(print(GetTemplateDocument), variables));
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
    updateTemplate(variables: UpdateTemplateMutationVariables): Promise<UpdateTemplateMutation> {
      return withWrapper(() => client.request<UpdateTemplateMutation>(print(UpdateTemplateDocument), variables));
    },
    updateTopic(variables: UpdateTopicMutationVariables): Promise<UpdateTopicMutation> {
      return withWrapper(() => client.request<UpdateTopicMutation>(print(UpdateTopicDocument), variables));
    },
    updateTopicOrder(variables: UpdateTopicOrderMutationVariables): Promise<UpdateTopicOrderMutation> {
      return withWrapper(() => client.request<UpdateTopicOrderMutation>(print(UpdateTopicOrderDocument), variables));
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
    getFields(variables?: GetFieldsQueryVariables): Promise<GetFieldsQuery> {
      return withWrapper(() => client.request<GetFieldsQuery>(print(GetFieldsDocument), variables));
    },
    getMyRoles(variables?: GetMyRolesQueryVariables): Promise<GetMyRolesQuery> {
      return withWrapper(() => client.request<GetMyRolesQuery>(print(GetMyRolesDocument), variables));
    },
    getOrcIDInformation(variables: GetOrcIdInformationQueryVariables): Promise<GetOrcIdInformationQuery> {
      return withWrapper(() => client.request<GetOrcIdInformationQuery>(print(GetOrcIdInformationDocument), variables));
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
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;