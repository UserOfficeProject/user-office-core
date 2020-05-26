import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  DateTime: any,
  IntStringDateBool: any,
};

export type AddSepMembersRole = {
  userID: Scalars['Int'],
  roleID: UserRole,
  SEPID: Scalars['Int'],
};

export type AddUserRoleResponseWrap = {
   __typename?: 'AddUserRoleResponseWrap',
  error?: Maybe<Scalars['String']>,
  success?: Maybe<Scalars['Boolean']>,
};

export type Answer = {
   __typename?: 'Answer',
  question: Question,
  sortOrder: Scalars['Int'],
  topicId: Scalars['Int'],
  config: FieldConfig,
  dependency?: Maybe<FieldDependency>,
  value?: Maybe<Scalars['IntStringDateBool']>,
};

export type BasicUserDetails = {
   __typename?: 'BasicUserDetails',
  id: Scalars['Int'],
  firstname: Scalars['String'],
  lastname: Scalars['String'],
  organisation: Scalars['String'],
  position: Scalars['String'],
  placeholder?: Maybe<Scalars['Boolean']>,
  created?: Maybe<Scalars['DateTime']>,
};

export type BasicUserDetailsResponseWrap = {
   __typename?: 'BasicUserDetailsResponseWrap',
  error?: Maybe<Scalars['String']>,
  user?: Maybe<BasicUserDetails>,
};

export type BooleanConfig = {
   __typename?: 'BooleanConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
};

export type Call = {
   __typename?: 'Call',
  id: Scalars['Int'],
  shortCode: Scalars['String'],
  startCall: Scalars['DateTime'],
  endCall: Scalars['DateTime'],
  startReview: Scalars['DateTime'],
  endReview: Scalars['DateTime'],
  startNotify: Scalars['DateTime'],
  endNotify: Scalars['DateTime'],
  cycleComment: Scalars['String'],
  surveyComment: Scalars['String'],
  templateId?: Maybe<Scalars['Int']>,
};

export type CallResponseWrap = {
   __typename?: 'CallResponseWrap',
  error?: Maybe<Scalars['String']>,
  call?: Maybe<Call>,
};

export type CallsFilter = {
  templateIds?: Maybe<Array<Scalars['Int']>>,
  isActive?: Maybe<Scalars['Boolean']>,
};

export type ConfigBase = {
   __typename?: 'ConfigBase',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
};

export type CreateUserByEmailInviteResponseWrap = {
   __typename?: 'CreateUserByEmailInviteResponseWrap',
  error?: Maybe<Scalars['String']>,
  id?: Maybe<Scalars['Int']>,
};

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT'
}

export type DateConfig = {
   __typename?: 'DateConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
};


export type EmailVerificationResponseWrap = {
   __typename?: 'EmailVerificationResponseWrap',
  error?: Maybe<Scalars['String']>,
  success?: Maybe<Scalars['Boolean']>,
};

export type EmbellishmentConfig = {
   __typename?: 'EmbellishmentConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
  omitFromPdf: Scalars['Boolean'],
  html: Scalars['String'],
  plain: Scalars['String'],
};

export type Entry = {
   __typename?: 'Entry',
  id: Scalars['Int'],
  value: Scalars['String'],
};

export enum EvaluatorOperator {
  EQ = 'eq',
  NEQ = 'neq'
}

export type EventLog = {
   __typename?: 'EventLog',
  id: Scalars['Int'],
  eventType: Scalars['String'],
  rowData: Scalars['String'],
  eventTStamp: Scalars['DateTime'],
  changedObjectId: Scalars['String'],
  changedBy: User,
};

export type FieldCondition = {
   __typename?: 'FieldCondition',
  condition: EvaluatorOperator,
  params: Scalars['IntStringDateBool'],
};

export type FieldConditionInput = {
  condition: EvaluatorOperator,
  params: Scalars['String'],
};

export type FieldConfig = BooleanConfig | DateConfig | EmbellishmentConfig | FileUploadConfig | SelectionFromOptionsConfig | TextInputConfig;

export type FieldDependency = {
   __typename?: 'FieldDependency',
  questionId: Scalars['String'],
  dependencyId: Scalars['String'],
  dependencyNaturalKey: Scalars['String'],
  condition: FieldCondition,
};

export type FieldDependencyInput = {
  dependencyId: Scalars['String'],
  condition: FieldConditionInput,
};

export type Fields = {
   __typename?: 'Fields',
  nationalities: Array<Entry>,
  countries: Array<Entry>,
  institutions: Array<Entry>,
};

export type FileMetadata = {
   __typename?: 'FileMetadata',
  originalFileName: Scalars['String'],
  mimeType: Scalars['String'],
  sizeInBytes: Scalars['Int'],
  createdDate: Scalars['DateTime'],
  fileId: Scalars['String'],
};

export type FileUploadConfig = {
   __typename?: 'FileUploadConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
  file_type: Array<Scalars['String']>,
  max_files: Scalars['Int'],
};


export type Mutation = {
   __typename?: 'Mutation',
  createCall: CallResponseWrap,
  administrationProposal: ProposalResponseWrap,
  notifyProposal: ProposalResponseWrap,
  updateProposalFiles: UpdateProposalFilesResponseWrap,
  updateProposal: ProposalResponseWrap,
  addReview: ReviewResponseWrap,
  addTechnicalReview: TechnicalReviewResponseWrap,
  addUserForReview: ReviewResponseWrap,
  assignChairOrSecretary: SepResponseWrap,
  assignMember: SepResponseWrap,
  removeMember: SepResponseWrap,
  assignMemberToSEPProposal: SepResponseWrap,
  removeMemberFromSEPProposal: SepResponseWrap,
  assignProposal: SepResponseWrap,
  removeProposalAssignment: SepResponseWrap,
  createSEP: SepResponseWrap,
  updateSEP: SepResponseWrap,
  createQuestion: QuestionResponseWrap,
  createQuestionRel: ProposalTemplateResponseWrap,
  createTopic: ProposalTemplateResponseWrap,
  deleteQuestionRel: ProposalTemplateResponseWrap,
  updateProposalTemplate: ProposalTemplateResponseWrap,
  updateQuestion: QuestionResponseWrap,
  updateQuestionRel: ProposalTemplateResponseWrap,
  updateTopic: TopicResponseWrap,
  addUserRole: AddUserRoleResponseWrap,
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap,
  createUser: UserResponseWrap,
  updateUser: UserResponseWrap,
  addClientLog: SuccessResponseWrap,
  applyPatches: PrepareDbResponseWrap,
  cloneProposalTemplate: ProposalTemplateResponseWrap,
  createProposal: ProposalResponseWrap,
  createProposalTemplate: ProposalTemplateResponseWrap,
  deleteProposal: ProposalResponseWrap,
  deleteProposalTemplate: ProposalTemplateResponseWrap,
  deleteQuestion: QuestionResponseWrap,
  deleteTopic: ProposalTemplateResponseWrap,
  deleteUser: UserResponseWrap,
  emailVerification: EmailVerificationResponseWrap,
  getTokenForUser: TokenResponseWrap,
  login: TokenResponseWrap,
  prepareDB: PrepareDbResponseWrap,
  removeUserForReview: ReviewResponseWrap,
  resetPasswordEmail: ResetPasswordEmailResponseWrap,
  resetPassword: BasicUserDetailsResponseWrap,
  setPageContent: PageResponseWrap,
  submitProposal: ProposalResponseWrap,
  token: TokenResponseWrap,
  updatePassword: BasicUserDetailsResponseWrap,
  updateQuestionsTopicRels: UpdateQuestionsTopicRelsResponseWrap,
  updateTopicOrder: UpdateTopicOrderResponseWrap,
};


export type MutationCreateCallArgs = {
  shortCode: Scalars['String'],
  startCall: Scalars['DateTime'],
  endCall: Scalars['DateTime'],
  startReview: Scalars['DateTime'],
  endReview: Scalars['DateTime'],
  startNotify: Scalars['DateTime'],
  endNotify: Scalars['DateTime'],
  cycleComment: Scalars['String'],
  surveyComment: Scalars['String'],
  templateId?: Maybe<Scalars['Int']>
};


export type MutationAdministrationProposalArgs = {
  id: Scalars['Int'],
  commentForUser?: Maybe<Scalars['String']>,
  commentForManagement?: Maybe<Scalars['String']>,
  finalStatus?: Maybe<ProposalEndStatus>,
  status?: Maybe<ProposalStatus>,
  rankOrder?: Maybe<Scalars['Int']>
};


export type MutationNotifyProposalArgs = {
  id: Scalars['Int']
};


export type MutationUpdateProposalFilesArgs = {
  proposalId: Scalars['Int'],
  questionId: Scalars['String'],
  files: Array<Scalars['String']>
};


export type MutationUpdateProposalArgs = {
  id: Scalars['Int'],
  title?: Maybe<Scalars['String']>,
  abstract?: Maybe<Scalars['String']>,
  answers?: Maybe<Array<ProposalAnswerInput>>,
  topicsCompleted?: Maybe<Array<Scalars['Int']>>,
  users?: Maybe<Array<Scalars['Int']>>,
  proposerId?: Maybe<Scalars['Int']>,
  partialSave?: Maybe<Scalars['Boolean']>
};


export type MutationAddReviewArgs = {
  reviewID: Scalars['Int'],
  comment: Scalars['String'],
  grade: Scalars['Int'],
  status: ReviewStatus
};


export type MutationAddTechnicalReviewArgs = {
  proposalID: Scalars['Int'],
  comment?: Maybe<Scalars['String']>,
  publicComment?: Maybe<Scalars['String']>,
  timeAllocation?: Maybe<Scalars['Int']>,
  status?: Maybe<TechnicalReviewStatus>
};


export type MutationAddUserForReviewArgs = {
  userID: Scalars['Int'],
  proposalID: Scalars['Int']
};


export type MutationAssignChairOrSecretaryArgs = {
  addSEPMembersRole?: Maybe<AddSepMembersRole>
};


export type MutationAssignMemberArgs = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int']
};


export type MutationRemoveMemberArgs = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int']
};


export type MutationAssignMemberToSepProposalArgs = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int'],
  proposalId: Scalars['Int']
};


export type MutationRemoveMemberFromSepProposalArgs = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int'],
  proposalId: Scalars['Int']
};


export type MutationAssignProposalArgs = {
  proposalId: Scalars['Int'],
  sepId: Scalars['Int']
};


export type MutationRemoveProposalAssignmentArgs = {
  proposalId: Scalars['Int'],
  sepId: Scalars['Int']
};


export type MutationCreateSepArgs = {
  code: Scalars['String'],
  description: Scalars['String'],
  numberRatingsRequired?: Maybe<Scalars['Int']>,
  active: Scalars['Boolean']
};


export type MutationUpdateSepArgs = {
  id: Scalars['Int'],
  code: Scalars['String'],
  description: Scalars['String'],
  numberRatingsRequired?: Maybe<Scalars['Int']>,
  active: Scalars['Boolean']
};


export type MutationCreateQuestionArgs = {
  dataType: DataType
};


export type MutationCreateQuestionRelArgs = {
  templateId: Scalars['Int'],
  questionId: Scalars['String'],
  sortOrder: Scalars['Int'],
  topicId: Scalars['Int']
};


export type MutationCreateTopicArgs = {
  templateId: Scalars['Int'],
  sortOrder: Scalars['Int']
};


export type MutationDeleteQuestionRelArgs = {
  questionId: Scalars['String'],
  templateId: Scalars['Int']
};


export type MutationUpdateProposalTemplateArgs = {
  templateId: Scalars['Int'],
  name?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  isArchived?: Maybe<Scalars['Boolean']>
};


export type MutationUpdateQuestionArgs = {
  id: Scalars['String'],
  naturalKey?: Maybe<Scalars['String']>,
  question?: Maybe<Scalars['String']>,
  config?: Maybe<Scalars['String']>
};


export type MutationUpdateQuestionRelArgs = {
  questionId: Scalars['String'],
  templateId: Scalars['Int'],
  topicId?: Maybe<Scalars['Int']>,
  sortOrder?: Maybe<Scalars['Int']>,
  config?: Maybe<Scalars['String']>,
  dependency?: Maybe<FieldDependencyInput>
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'],
  title?: Maybe<Scalars['String']>,
  isEnabled?: Maybe<Scalars['Boolean']>
};


export type MutationAddUserRoleArgs = {
  userID: Scalars['Int'],
  roleID: Scalars['Int']
};


export type MutationCreateUserByEmailInviteArgs = {
  firstname: Scalars['String'],
  lastname: Scalars['String'],
  email: Scalars['String'],
  userRole: UserRole
};


export type MutationCreateUserArgs = {
  user_title?: Maybe<Scalars['String']>,
  firstname: Scalars['String'],
  middlename?: Maybe<Scalars['String']>,
  lastname: Scalars['String'],
  password: Scalars['String'],
  preferredname?: Maybe<Scalars['String']>,
  orcid: Scalars['String'],
  orcidHash: Scalars['String'],
  refreshToken: Scalars['String'],
  gender: Scalars['String'],
  nationality: Scalars['Int'],
  birthdate: Scalars['String'],
  organisation: Scalars['Int'],
  department: Scalars['String'],
  position: Scalars['String'],
  email: Scalars['String'],
  telephone: Scalars['String'],
  telephone_alt?: Maybe<Scalars['String']>,
  otherOrganisation?: Maybe<Scalars['String']>
};


export type MutationUpdateUserArgs = {
  id: Scalars['Int'],
  user_title?: Maybe<Scalars['String']>,
  firstname?: Maybe<Scalars['String']>,
  middlename?: Maybe<Scalars['String']>,
  lastname?: Maybe<Scalars['String']>,
  username?: Maybe<Scalars['String']>,
  preferredname?: Maybe<Scalars['String']>,
  gender?: Maybe<Scalars['String']>,
  nationality?: Maybe<Scalars['Int']>,
  birthdate?: Maybe<Scalars['String']>,
  organisation?: Maybe<Scalars['Int']>,
  department?: Maybe<Scalars['String']>,
  position?: Maybe<Scalars['String']>,
  email?: Maybe<Scalars['String']>,
  telephone?: Maybe<Scalars['String']>,
  telephone_alt?: Maybe<Scalars['String']>,
  placeholder?: Maybe<Scalars['String']>,
  roles?: Maybe<Array<Scalars['Int']>>,
  orcid?: Maybe<Scalars['String']>,
  refreshToken?: Maybe<Scalars['String']>
};


export type MutationAddClientLogArgs = {
  error: Scalars['String']
};


export type MutationCloneProposalTemplateArgs = {
  templateId: Scalars['Int']
};


export type MutationCreateProposalArgs = {
  callId: Scalars['Int']
};


export type MutationCreateProposalTemplateArgs = {
  description?: Maybe<Scalars['String']>,
  name: Scalars['String']
};


export type MutationDeleteProposalArgs = {
  id: Scalars['Int']
};


export type MutationDeleteProposalTemplateArgs = {
  id: Scalars['Int']
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['String']
};


export type MutationDeleteTopicArgs = {
  topicId: Scalars['Int']
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int']
};


export type MutationEmailVerificationArgs = {
  token: Scalars['String']
};


export type MutationGetTokenForUserArgs = {
  userId: Scalars['Int']
};


export type MutationLoginArgs = {
  email: Scalars['String'],
  password: Scalars['String']
};


export type MutationRemoveUserForReviewArgs = {
  reviewID: Scalars['Int']
};


export type MutationResetPasswordEmailArgs = {
  email: Scalars['String']
};


export type MutationResetPasswordArgs = {
  token: Scalars['String'],
  password: Scalars['String']
};


export type MutationSetPageContentArgs = {
  text: Scalars['String'],
  id: PageName
};


export type MutationSubmitProposalArgs = {
  id: Scalars['Int']
};


export type MutationTokenArgs = {
  token: Scalars['String']
};


export type MutationUpdatePasswordArgs = {
  id: Scalars['Int'],
  password: Scalars['String']
};


export type MutationUpdateQuestionsTopicRelsArgs = {
  templateId: Scalars['Int'],
  topicId: Scalars['Int'],
  fieldIds?: Maybe<Array<Scalars['String']>>
};


export type MutationUpdateTopicOrderArgs = {
  topicOrder: Array<Scalars['Int']>
};

export type OrcIdInformation = {
   __typename?: 'OrcIDInformation',
  firstname?: Maybe<Scalars['String']>,
  lastname?: Maybe<Scalars['String']>,
  orcid?: Maybe<Scalars['String']>,
  orcidHash?: Maybe<Scalars['String']>,
  refreshToken?: Maybe<Scalars['String']>,
  token?: Maybe<Scalars['String']>,
};

export type Page = {
   __typename?: 'Page',
  id: Scalars['Int'],
  content?: Maybe<Scalars['String']>,
};

export enum PageName {
  HOMEPAGE = 'HOMEPAGE',
  HELPPAGE = 'HELPPAGE',
  PRIVACYPAGE = 'PRIVACYPAGE',
  COOKIEPAGE = 'COOKIEPAGE',
  REVIEWPAGE = 'REVIEWPAGE'
}

export type PageResponseWrap = {
   __typename?: 'PageResponseWrap',
  error?: Maybe<Scalars['String']>,
  page?: Maybe<Page>,
};

export type PrepareDbResponseWrap = {
   __typename?: 'PrepareDBResponseWrap',
  error?: Maybe<Scalars['String']>,
  log: Scalars['String'],
};

export type Proposal = {
   __typename?: 'Proposal',
  id: Scalars['Int'],
  title: Scalars['String'],
  abstract: Scalars['String'],
  status: ProposalStatus,
  created: Scalars['DateTime'],
  updated: Scalars['DateTime'],
  shortCode: Scalars['String'],
  rankOrder?: Maybe<Scalars['Int']>,
  finalStatus?: Maybe<ProposalEndStatus>,
  callId: Scalars['Int'],
  templateId: Scalars['Int'],
  commentForUser?: Maybe<Scalars['String']>,
  commentForManagement?: Maybe<Scalars['String']>,
  notified: Scalars['Boolean'],
  users: Array<BasicUserDetails>,
  proposer: BasicUserDetails,
  reviews?: Maybe<Array<Review>>,
  technicalReview?: Maybe<TechnicalReview>,
  questionary: Questionary,
};

export type ProposalAnswerInput = {
  proposalQuestionId: Scalars['String'],
  dataType?: Maybe<DataType>,
  value?: Maybe<Scalars['String']>,
};

export enum ProposalEndStatus {
  UNSET = 'UNSET',
  ACCEPTED = 'ACCEPTED',
  RESERVED = 'RESERVED',
  REJECTED = 'REJECTED'
}

export type ProposalResponseWrap = {
   __typename?: 'ProposalResponseWrap',
  error?: Maybe<Scalars['String']>,
  proposal?: Maybe<Proposal>,
};

export type ProposalsFilter = {
  text?: Maybe<Scalars['String']>,
  templateIds?: Maybe<Array<Scalars['Int']>>,
};

export type ProposalsQueryResult = {
   __typename?: 'ProposalsQueryResult',
  totalCount: Scalars['Int'],
  proposals: Array<Proposal>,
};

export enum ProposalStatus {
  BLANK = 'BLANK',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type ProposalTemplate = {
   __typename?: 'ProposalTemplate',
  templateId: Scalars['Int'],
  name: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  isArchived: Scalars['Boolean'],
  proposalCount: Scalars['Int'],
  callCount: Scalars['Int'],
  steps: Array<TemplateStep>,
  complementaryQuestions: Array<Question>,
};

export type ProposalTemplateResponseWrap = {
   __typename?: 'ProposalTemplateResponseWrap',
  error?: Maybe<Scalars['String']>,
  template?: Maybe<ProposalTemplate>,
};

export type ProposalTemplatesFilter = {
  isArchived: Scalars['Boolean'],
};

export type Query = {
   __typename?: 'Query',
  calls?: Maybe<Array<Call>>,
  proposals?: Maybe<ProposalsQueryResult>,
  proposalTemplates: Array<ProposalTemplate>,
  basicUserDetails?: Maybe<BasicUserDetails>,
  blankProposal?: Maybe<Proposal>,
  call?: Maybe<Call>,
  checkEmailExist?: Maybe<Scalars['Boolean']>,
  eventLogs?: Maybe<Array<EventLog>>,
  fileMetadata?: Maybe<Array<FileMetadata>>,
  getFields?: Maybe<Fields>,
  getOrcIDInformation?: Maybe<OrcIdInformation>,
  getPageContent?: Maybe<Scalars['String']>,
  isNaturalKeyPresent?: Maybe<Scalars['Boolean']>,
  proposal?: Maybe<Proposal>,
  proposalTemplate?: Maybe<ProposalTemplate>,
  review?: Maybe<Review>,
  roles?: Maybe<Array<Role>>,
  sep?: Maybe<Sep>,
  sepMembers?: Maybe<Array<SepMember>>,
  sepProposals?: Maybe<Array<SepProposal>>,
  seps?: Maybe<SePsQueryResult>,
  user?: Maybe<User>,
  me?: Maybe<User>,
  users?: Maybe<UserQueryResult>,
};


export type QueryCallsArgs = {
  filter?: Maybe<CallsFilter>
};


export type QueryProposalsArgs = {
  filter?: Maybe<ProposalsFilter>,
  first?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type QueryProposalTemplatesArgs = {
  filter?: Maybe<ProposalTemplatesFilter>
};


export type QueryBasicUserDetailsArgs = {
  id: Scalars['Int']
};


export type QueryBlankProposalArgs = {
  callId: Scalars['Int']
};


export type QueryCallArgs = {
  id: Scalars['Int']
};


export type QueryCheckEmailExistArgs = {
  email: Scalars['String']
};


export type QueryEventLogsArgs = {
  changedObjectId: Scalars['String'],
  eventType: Scalars['String']
};


export type QueryFileMetadataArgs = {
  fileIds: Array<Scalars['String']>
};


export type QueryGetOrcIdInformationArgs = {
  authorizationCode: Scalars['String']
};


export type QueryGetPageContentArgs = {
  id: PageName
};


export type QueryIsNaturalKeyPresentArgs = {
  naturalKey: Scalars['String']
};


export type QueryProposalArgs = {
  id: Scalars['Int']
};


export type QueryProposalTemplateArgs = {
  templateId: Scalars['Int']
};


export type QueryReviewArgs = {
  id: Scalars['Int']
};


export type QuerySepArgs = {
  id: Scalars['Int']
};


export type QuerySepMembersArgs = {
  sepId: Scalars['Int']
};


export type QuerySepProposalsArgs = {
  sepId: Scalars['Int']
};


export type QuerySepsArgs = {
  active?: Maybe<Scalars['Boolean']>,
  filter?: Maybe<Scalars['String']>,
  first?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type QueryUserArgs = {
  id: Scalars['Int']
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>,
  first?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>,
  userRole?: Maybe<UserRole>,
  subtractUsers?: Maybe<Array<Maybe<Scalars['Int']>>>
};

export type Question = {
   __typename?: 'Question',
  proposalQuestionId: Scalars['String'],
  naturalKey: Scalars['String'],
  dataType: DataType,
  question: Scalars['String'],
  config: FieldConfig,
};

export type Questionary = {
   __typename?: 'Questionary',
  steps: Array<QuestionaryStep>,
};

export type QuestionaryStep = {
   __typename?: 'QuestionaryStep',
  topic: Topic,
  isCompleted: Scalars['Boolean'],
  fields: Array<Answer>,
};

export type QuestionRel = {
   __typename?: 'QuestionRel',
  question: Question,
  sortOrder: Scalars['Int'],
  topicId: Scalars['Int'],
  config: FieldConfig,
  dependency?: Maybe<FieldDependency>,
};

export type QuestionRelResponseWrap = {
   __typename?: 'QuestionRelResponseWrap',
  error?: Maybe<Scalars['String']>,
  questionRel?: Maybe<QuestionRel>,
};

export type QuestionResponseWrap = {
   __typename?: 'QuestionResponseWrap',
  error?: Maybe<Scalars['String']>,
  question?: Maybe<Question>,
};

export type ResetPasswordEmailResponseWrap = {
   __typename?: 'ResetPasswordEmailResponseWrap',
  error?: Maybe<Scalars['String']>,
  success?: Maybe<Scalars['Boolean']>,
};

export type ResponseWrapBase = {
   __typename?: 'ResponseWrapBase',
  error?: Maybe<Scalars['String']>,
};

export type Review = {
   __typename?: 'Review',
  id: Scalars['Int'],
  userID: Scalars['Int'],
  comment?: Maybe<Scalars['String']>,
  grade?: Maybe<Scalars['Int']>,
  status: ReviewStatus,
  reviewer?: Maybe<User>,
  proposal?: Maybe<Proposal>,
};

export type ReviewResponseWrap = {
   __typename?: 'ReviewResponseWrap',
  error?: Maybe<Scalars['String']>,
  review?: Maybe<Review>,
};

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

export type Role = {
   __typename?: 'Role',
  id: Scalars['Int'],
  shortCode: Scalars['String'],
  title: Scalars['String'],
};

export type SelectionFromOptionsConfig = {
   __typename?: 'SelectionFromOptionsConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
  variant: Scalars['String'],
  options: Array<Scalars['String']>,
};

export type Sep = {
   __typename?: 'SEP',
  id: Scalars['Int'],
  code: Scalars['String'],
  description: Scalars['String'],
  numberRatingsRequired: Scalars['Float'],
  active: Scalars['Boolean'],
};

export type SepAssignment = {
   __typename?: 'SEPAssignment',
  proposalId: Scalars['Int'],
  sepMemberUserId?: Maybe<Scalars['Int']>,
  sepId: Scalars['Int'],
  dateAssigned: Scalars['DateTime'],
  reassigned: Scalars['Boolean'],
  dateReassigned?: Maybe<Scalars['DateTime']>,
  emailSent: Scalars['Boolean'],
  proposal: Proposal,
  roles: Array<Role>,
  user?: Maybe<BasicUserDetails>,
};

export type SepMember = {
   __typename?: 'SEPMember',
  roleUserId: Scalars['Int'],
  roleId: Scalars['Int'],
  userId: Scalars['Int'],
  sepId: Scalars['Int'],
  roles: Array<Role>,
  user: BasicUserDetails,
};

export type SepMembersRoleResponseWrap = {
   __typename?: 'SEPMembersRoleResponseWrap',
  error?: Maybe<Scalars['String']>,
  success?: Maybe<Scalars['Boolean']>,
};

export type SepProposal = {
   __typename?: 'SEPProposal',
  proposalId: Scalars['Int'],
  sepId: Scalars['Int'],
  dateAssigned: Scalars['DateTime'],
  proposal: Proposal,
  assignments?: Maybe<Array<SepAssignment>>,
};

export type SepResponseWrap = {
   __typename?: 'SEPResponseWrap',
  error?: Maybe<Scalars['String']>,
  sep?: Maybe<Sep>,
};

export type SePsQueryResult = {
   __typename?: 'SEPsQueryResult',
  totalCount: Scalars['Int'],
  seps: Array<Sep>,
};

export type SuccessResponseWrap = {
   __typename?: 'SuccessResponseWrap',
  error?: Maybe<Scalars['String']>,
  isSuccess?: Maybe<Scalars['Boolean']>,
};

export type TechnicalReview = {
   __typename?: 'TechnicalReview',
  id: Scalars['Int'],
  proposalID: Scalars['Int'],
  comment?: Maybe<Scalars['String']>,
  publicComment?: Maybe<Scalars['String']>,
  timeAllocation?: Maybe<Scalars['Int']>,
  status?: Maybe<TechnicalReviewStatus>,
  proposal?: Maybe<Proposal>,
};

export type TechnicalReviewResponseWrap = {
   __typename?: 'TechnicalReviewResponseWrap',
  error?: Maybe<Scalars['String']>,
  technicalReview?: Maybe<TechnicalReview>,
};

export enum TechnicalReviewStatus {
  FEASIBLE = 'FEASIBLE',
  PARTIALLY_FEASIBLE = 'PARTIALLY_FEASIBLE',
  UNFEASIBLE = 'UNFEASIBLE'
}

export type TemplateStep = {
   __typename?: 'TemplateStep',
  topic: Topic,
  fields: Array<QuestionRel>,
};

export type TextInputConfig = {
   __typename?: 'TextInputConfig',
  small_label: Scalars['String'],
  required: Scalars['Boolean'],
  tooltip: Scalars['String'],
  min?: Maybe<Scalars['Int']>,
  max?: Maybe<Scalars['Int']>,
  multiline: Scalars['Boolean'],
  placeholder: Scalars['String'],
  htmlQuestion?: Maybe<Scalars['String']>,
  isHtmlQuestion: Scalars['Boolean'],
};

export type TokenResponseWrap = {
   __typename?: 'TokenResponseWrap',
  error?: Maybe<Scalars['String']>,
  token?: Maybe<Scalars['String']>,
};

export type Topic = {
   __typename?: 'Topic',
  id: Scalars['Int'],
  title: Scalars['String'],
  sortOrder: Scalars['Int'],
  isEnabled: Scalars['Boolean'],
};

export type TopicResponseWrap = {
   __typename?: 'TopicResponseWrap',
  error?: Maybe<Scalars['String']>,
  topic?: Maybe<Topic>,
};

export type UpdateProposalFilesResponseWrap = {
   __typename?: 'UpdateProposalFilesResponseWrap',
  error?: Maybe<Scalars['String']>,
  files: Array<Scalars['String']>,
};

export type UpdateQuestionsTopicRelsResponseWrap = {
   __typename?: 'UpdateQuestionsTopicRelsResponseWrap',
  error?: Maybe<Scalars['String']>,
  result?: Maybe<Array<Scalars['String']>>,
};

export type UpdateTopicOrderResponseWrap = {
   __typename?: 'UpdateTopicOrderResponseWrap',
  error?: Maybe<Scalars['String']>,
  topicOrder?: Maybe<Array<Scalars['Int']>>,
};

export type User = {
   __typename?: 'User',
  id: Scalars['Int'],
  user_title?: Maybe<Scalars['String']>,
  firstname: Scalars['String'],
  middlename?: Maybe<Scalars['String']>,
  lastname: Scalars['String'],
  username: Scalars['String'],
  preferredname?: Maybe<Scalars['String']>,
  orcid: Scalars['String'],
  refreshToken: Scalars['String'],
  gender: Scalars['String'],
  nationality?: Maybe<Scalars['Int']>,
  birthdate: Scalars['String'],
  organisation: Scalars['Int'],
  department: Scalars['String'],
  position: Scalars['String'],
  email: Scalars['String'],
  emailVerified: Scalars['Boolean'],
  telephone: Scalars['String'],
  telephone_alt?: Maybe<Scalars['String']>,
  placeholder: Scalars['Boolean'],
  created: Scalars['String'],
  updated: Scalars['String'],
  roles: Array<Role>,
  reviews: Array<Review>,
  proposals: Array<Proposal>,
};

export type UserQueryResult = {
   __typename?: 'UserQueryResult',
  users: Array<BasicUserDetails>,
  totalCount: Scalars['Int'],
};

export type UserResponseWrap = {
   __typename?: 'UserResponseWrap',
  error?: Maybe<Scalars['String']>,
  user?: Maybe<User>,
};

export enum UserRole {
  USER = 'USER',
  USEROFFICER = 'USEROFFICER',
  REVIEWER = 'REVIEWER',
  SEP_CHAIR = 'SEP_CHAIR',
  SEP_SECRETARY = 'SEP_SECRETARY',
  SEP_MEMBER = 'SEP_MEMBER'
}

export type AssignProposalMutationVariables = {
  proposalId: Scalars['Int'],
  sepId: Scalars['Int']
};


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

export type AssignMemberMutationVariables = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int']
};


export type AssignMemberMutation = (
  { __typename?: 'Mutation' }
  & { assignMember: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type AssignChairOrSecretaryMutationVariables = {
  addSEPMembersRole: AddSepMembersRole
};


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

export type AssignMemberToSepProposalMutationVariables = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int'],
  proposalId: Scalars['Int']
};


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

export type CreateSepMutationVariables = {
  code: Scalars['String'],
  description: Scalars['String'],
  numberRatingsRequired: Scalars['Int'],
  active: Scalars['Boolean']
};


export type CreateSepMutation = (
  { __typename?: 'Mutation' }
  & { createSEP: (
    { __typename?: 'SEPResponseWrap' }
    & Pick<SepResponseWrap, 'error'>
    & { sep: Maybe<(
      { __typename?: 'SEP' }
      & Pick<Sep, 'id'>
    )> }
  ) }
);

export type GetSepQueryVariables = {
  id: Scalars['Int']
};


export type GetSepQuery = (
  { __typename?: 'Query' }
  & { sep: Maybe<(
    { __typename?: 'SEP' }
    & Pick<Sep, 'id' | 'code' | 'description' | 'numberRatingsRequired' | 'active'>
  )> }
);

export type GetSepMembersQueryVariables = {
  sepId: Scalars['Int']
};


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

export type GetSepProposalsQueryVariables = {
  sepId: Scalars['Int']
};


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
      )> }
    )>> }
  )>> }
);

export type GetSePsQueryVariables = {
  filter: Scalars['String'],
  active: Scalars['Boolean']
};


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

export type RemoveProposalAssignmentMutationVariables = {
  proposalId: Scalars['Int'],
  sepId: Scalars['Int']
};


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

export type RemoveMemberMutationVariables = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int']
};


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

export type RemoveMemberFromSepProposalMutationVariables = {
  memberId: Scalars['Int'],
  sepId: Scalars['Int'],
  proposalId: Scalars['Int']
};


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

export type UpdateSepMutationVariables = {
  id: Scalars['Int'],
  code: Scalars['String'],
  description: Scalars['String'],
  numberRatingsRequired: Scalars['Int'],
  active: Scalars['Boolean']
};


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

export type AddClientLogMutationVariables = {
  error: Scalars['String']
};


export type AddClientLogMutation = (
  { __typename?: 'Mutation' }
  & { addClientLog: (
    { __typename?: 'SuccessResponseWrap' }
    & Pick<SuccessResponseWrap, 'isSuccess' | 'error'>
  ) }
);

export type GetPageContentQueryVariables = {
  id: PageName
};


export type GetPageContentQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'getPageContent'>
);

export type SetPageContentMutationVariables = {
  id: PageName,
  text: Scalars['String']
};


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

export type CreateCallMutationVariables = {
  shortCode: Scalars['String'],
  startCall: Scalars['DateTime'],
  endCall: Scalars['DateTime'],
  startReview: Scalars['DateTime'],
  endReview: Scalars['DateTime'],
  startNotify: Scalars['DateTime'],
  endNotify: Scalars['DateTime'],
  cycleComment: Scalars['String'],
  surveyComment: Scalars['String'],
  templateId?: Maybe<Scalars['Int']>
};


export type CreateCallMutation = (
  { __typename?: 'Mutation' }
  & { createCall: (
    { __typename?: 'CallResponseWrap' }
    & Pick<CallResponseWrap, 'error'>
    & { call: Maybe<(
      { __typename?: 'Call' }
      & Pick<Call, 'id'>
    )> }
  ) }
);

export type GetCallsQueryVariables = {
  filter?: Maybe<CallsFilter>
};


export type GetCallsQuery = (
  { __typename?: 'Query' }
  & { calls: Maybe<Array<(
    { __typename?: 'Call' }
    & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall' | 'templateId'>
  )>> }
);

export type GetEventLogsQueryVariables = {
  eventType: Scalars['String'],
  changedObjectId: Scalars['String']
};


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

export type AdministrationProposalMutationVariables = {
  id: Scalars['Int'],
  rankOrder?: Maybe<Scalars['Int']>,
  finalStatus?: Maybe<ProposalEndStatus>,
  status?: Maybe<ProposalStatus>,
  commentForUser?: Maybe<Scalars['String']>,
  commentForManagement?: Maybe<Scalars['String']>
};


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

export type CreateProposalMutationVariables = {
  callId: Scalars['Int']
};


export type CreateProposalMutation = (
  { __typename?: 'Mutation' }
  & { createProposal: (
    { __typename?: 'ProposalResponseWrap' }
    & Pick<ProposalResponseWrap, 'error'>
    & { proposal: Maybe<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'status' | 'shortCode'>
    )> }
  ) }
);

export type DeleteProposalMutationVariables = {
  id: Scalars['Int']
};


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
  ), dependency: Maybe<(
    { __typename?: 'FieldDependency' }
    & Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: (
      { __typename?: 'FieldCondition' }
      & FieldConditionFragment
    ) }
  )> }
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

export type FieldConfigFragment = FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment;

export type QuestionFragment = (
  { __typename?: 'Question' }
  & Pick<Question, 'question' | 'proposalQuestionId' | 'naturalKey' | 'dataType'>
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
  ) }
);

export type QuestionRelFragment = (
  { __typename?: 'QuestionRel' }
  & Pick<QuestionRel, 'sortOrder' | 'topicId'>
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
  ), dependency: Maybe<(
    { __typename?: 'FieldDependency' }
    & Pick<FieldDependency, 'questionId' | 'dependencyId' | 'dependencyNaturalKey'>
    & { condition: (
      { __typename?: 'FieldCondition' }
      & FieldConditionFragment
    ) }
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

export type TemplateStepFragment = (
  { __typename?: 'TemplateStep' }
  & { topic: (
    { __typename?: 'Topic' }
    & Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>
  ), fields: Array<(
    { __typename?: 'QuestionRel' }
    & QuestionRelFragment
  )> }
);

export type TopicFragment = (
  { __typename?: 'Topic' }
  & Pick<Topic, 'title' | 'id' | 'sortOrder' | 'isEnabled'>
);

export type GetBlankProposalQueryVariables = {
  callId: Scalars['Int']
};


export type GetBlankProposalQuery = (
  { __typename?: 'Query' }
  & { blankProposal: Maybe<(
    { __typename?: 'Proposal' }
    & Pick<Proposal, 'id' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'title' | 'abstract' | 'created' | 'updated' | 'callId' | 'templateId' | 'notified'>
    & { proposer: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), questionary: (
      { __typename?: 'Questionary' }
      & { steps: Array<(
        { __typename?: 'QuestionaryStep' }
        & QuestionaryStepFragment
      )> }
    ), users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, reviews: Maybe<Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )>> }
  )> }
);

export type GetFileMetadataQueryVariables = {
  fileIds: Array<Scalars['String']>
};


export type GetFileMetadataQuery = (
  { __typename?: 'Query' }
  & { fileMetadata: Maybe<Array<(
    { __typename?: 'FileMetadata' }
    & Pick<FileMetadata, 'fileId' | 'originalFileName' | 'mimeType' | 'sizeInBytes' | 'createdDate'>
  )>> }
);

export type GetProposalQueryVariables = {
  id: Scalars['Int']
};


export type GetProposalQuery = (
  { __typename?: 'Query' }
  & { proposal: Maybe<(
    { __typename?: 'Proposal' }
    & Pick<Proposal, 'id' | 'title' | 'abstract' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'commentForUser' | 'commentForManagement' | 'created' | 'updated' | 'callId' | 'templateId' | 'notified'>
    & { proposer: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, questionary: (
      { __typename?: 'Questionary' }
      & { steps: Array<(
        { __typename?: 'QuestionaryStep' }
        & QuestionaryStepFragment
      )> }
    ), technicalReview: Maybe<(
      { __typename?: 'TechnicalReview' }
      & Pick<TechnicalReview, 'id' | 'comment' | 'publicComment' | 'timeAllocation' | 'status' | 'proposalID'>
    )>, reviews: Maybe<Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )>> }
  )> }
);

export type GetProposalsQueryVariables = {
  filter?: Maybe<ProposalsFilter>
};


export type GetProposalsQuery = (
  { __typename?: 'Query' }
  & { proposals: Maybe<(
    { __typename?: 'ProposalsQueryResult' }
    & Pick<ProposalsQueryResult, 'totalCount'>
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'title' | 'abstract' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'commentForUser' | 'commentForManagement' | 'created' | 'updated' | 'callId' | 'templateId' | 'notified'>
      & { proposer: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), reviews: Maybe<Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
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
      )> }
    )> }
  )> }
);

export type NotifyProposalMutationVariables = {
  id: Scalars['Int']
};


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

export type SubmitProposalMutationVariables = {
  id: Scalars['Int']
};


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

export type UpdateProposalMutationVariables = {
  id: Scalars['Int'],
  title?: Maybe<Scalars['String']>,
  abstract?: Maybe<Scalars['String']>,
  answers?: Maybe<Array<ProposalAnswerInput>>,
  topicsCompleted?: Maybe<Array<Scalars['Int']>>,
  users?: Maybe<Array<Scalars['Int']>>,
  proposerId?: Maybe<Scalars['Int']>,
  partialSave?: Maybe<Scalars['Boolean']>
};


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

export type UpdateProposalFilesMutationVariables = {
  proposalId: Scalars['Int'],
  questionId: Scalars['String'],
  files: Array<Scalars['String']>
};


export type UpdateProposalFilesMutation = (
  { __typename?: 'Mutation' }
  & { updateProposalFiles: (
    { __typename?: 'UpdateProposalFilesResponseWrap' }
    & Pick<UpdateProposalFilesResponseWrap, 'files' | 'error'>
  ) }
);

export type AddTechnicalReviewMutationVariables = {
  proposalID: Scalars['Int'],
  timeAllocation?: Maybe<Scalars['Int']>,
  comment?: Maybe<Scalars['String']>,
  publicComment?: Maybe<Scalars['String']>,
  status?: Maybe<TechnicalReviewStatus>
};


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

export type AddUserForReviewMutationVariables = {
  userID: Scalars['Int'],
  proposalID: Scalars['Int']
};


export type AddUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { addUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & Pick<ReviewResponseWrap, 'error'>
  ) }
);

export type CoreReviewFragment = (
  { __typename?: 'Review' }
  & Pick<Review, 'id' | 'userID' | 'status' | 'comment' | 'grade'>
);

export type GetReviewQueryVariables = {
  id: Scalars['Int']
};


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

export type RemoveUserForReviewMutationVariables = {
  reviewID: Scalars['Int']
};


export type RemoveUserForReviewMutation = (
  { __typename?: 'Mutation' }
  & { removeUserForReview: (
    { __typename?: 'ReviewResponseWrap' }
    & Pick<ReviewResponseWrap, 'error'>
  ) }
);

export type UpdateReviewMutationVariables = {
  reviewID: Scalars['Int'],
  grade: Scalars['Int'],
  comment: Scalars['String'],
  status: ReviewStatus
};


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

export type UserWithReviewsQueryVariables = {};


export type UserWithReviewsQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'firstname' | 'lastname' | 'organisation'>
    & { reviews: Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status'>
      & { proposal: Maybe<(
        { __typename?: 'Proposal' }
        & Pick<Proposal, 'id' | 'title' | 'shortCode'>
      )> }
    )> }
  )> }
);

export type CloneProposalTemplateMutationVariables = {
  templateId: Scalars['Int']
};


export type CloneProposalTemplateMutation = (
  { __typename?: 'Mutation' }
  & { cloneProposalTemplate: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateMetadataFragment
    )> }
  ) }
);

export type CreateProposalTemplateMutationVariables = {
  name: Scalars['String'],
  description?: Maybe<Scalars['String']>
};


export type CreateProposalTemplateMutation = (
  { __typename?: 'Mutation' }
  & { createProposalTemplate: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateMetadataFragment
    )> }
  ) }
);

export type CreateQuestionMutationVariables = {
  dataType: DataType
};


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

export type CreateQuestionRelMutationVariables = {
  templateId: Scalars['Int'],
  questionId: Scalars['String'],
  topicId: Scalars['Int'],
  sortOrder: Scalars['Int']
};


export type CreateQuestionRelMutation = (
  { __typename?: 'Mutation' }
  & { createQuestionRel: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateFragment
    )> }
  ) }
);

export type CreateTopicMutationVariables = {
  templateId: Scalars['Int'],
  sortOrder: Scalars['Int']
};


export type CreateTopicMutation = (
  { __typename?: 'Mutation' }
  & { createTopic: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateFragment
    )> }
  ) }
);

export type DeleteProposalTemplateMutationVariables = {
  id: Scalars['Int']
};


export type DeleteProposalTemplateMutation = (
  { __typename?: 'Mutation' }
  & { deleteProposalTemplate: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & Pick<ProposalTemplate, 'templateId' | 'name'>
    )> }
  ) }
);

export type DeleteQuestionMutationVariables = {
  questionId: Scalars['String']
};


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

export type DeleteQuestionRelMutationVariables = {
  questionId: Scalars['String'],
  templateId: Scalars['Int']
};


export type DeleteQuestionRelMutation = (
  { __typename?: 'Mutation' }
  & { deleteQuestionRel: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateFragment
    )> }
  ) }
);

export type DeleteTopicMutationVariables = {
  topicId: Scalars['Int']
};


export type DeleteTopicMutation = (
  { __typename?: 'Mutation' }
  & { deleteTopic: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
  ) }
);

export type ProposalTemplateFragment = (
  { __typename?: 'ProposalTemplate' }
  & Pick<ProposalTemplate, 'templateId' | 'name' | 'description'>
  & { steps: Array<(
    { __typename?: 'TemplateStep' }
    & { topic: (
      { __typename?: 'Topic' }
      & Pick<Topic, 'title' | 'id'>
    ), fields: Array<(
      { __typename?: 'QuestionRel' }
      & QuestionRelFragment
    )> }
  )>, complementaryQuestions: Array<(
    { __typename?: 'Question' }
    & QuestionFragment
  )> }
);

export type ProposalTemplateMetadataFragment = (
  { __typename?: 'ProposalTemplate' }
  & Pick<ProposalTemplate, 'templateId' | 'name' | 'description' | 'isArchived' | 'proposalCount' | 'callCount'>
);

export type GetIsNaturalKeyPresentQueryVariables = {
  naturalKey: Scalars['String']
};


export type GetIsNaturalKeyPresentQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'isNaturalKeyPresent'>
);

export type GetProposalTemplateQueryVariables = {
  templateId: Scalars['Int']
};


export type GetProposalTemplateQuery = (
  { __typename?: 'Query' }
  & { proposalTemplate: Maybe<(
    { __typename?: 'ProposalTemplate' }
    & ProposalTemplateFragment
  )> }
);

export type GetProposalTemplatesQueryVariables = {
  filter?: Maybe<ProposalTemplatesFilter>
};


export type GetProposalTemplatesQuery = (
  { __typename?: 'Query' }
  & { proposalTemplates: Array<(
    { __typename?: 'ProposalTemplate' }
    & Pick<ProposalTemplate, 'templateId' | 'name' | 'description' | 'isArchived' | 'proposalCount' | 'callCount'>
  )> }
);

export type UpdateProposalTemplateMutationVariables = {
  templateId: Scalars['Int'],
  name?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  isArchived?: Maybe<Scalars['Boolean']>
};


export type UpdateProposalTemplateMutation = (
  { __typename?: 'Mutation' }
  & { updateProposalTemplate: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateMetadataFragment
    )> }
  ) }
);

export type UpdateQuestionMutationVariables = {
  id: Scalars['String'],
  naturalKey?: Maybe<Scalars['String']>,
  question?: Maybe<Scalars['String']>,
  config?: Maybe<Scalars['String']>
};


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

export type UpdateQuestionRelMutationVariables = {
  questionId: Scalars['String'],
  templateId: Scalars['Int'],
  topicId?: Maybe<Scalars['Int']>,
  sortOrder?: Maybe<Scalars['Int']>,
  config?: Maybe<Scalars['String']>,
  dependency?: Maybe<FieldDependencyInput>
};


export type UpdateQuestionRelMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestionRel: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & ProposalTemplateFragment
    )> }
  ) }
);

export type UpdateQuestionsTopicRelsMutationVariables = {
  templateId: Scalars['Int'],
  topicId: Scalars['Int'],
  fieldIds?: Maybe<Array<Scalars['String']>>
};


export type UpdateQuestionsTopicRelsMutation = (
  { __typename?: 'Mutation' }
  & { updateQuestionsTopicRels: (
    { __typename?: 'UpdateQuestionsTopicRelsResponseWrap' }
    & Pick<UpdateQuestionsTopicRelsResponseWrap, 'error'>
  ) }
);

export type UpdateTopicMutationVariables = {
  topicId: Scalars['Int'],
  title?: Maybe<Scalars['String']>,
  isEnabled?: Maybe<Scalars['Boolean']>
};


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

export type UpdateTopicOrderMutationVariables = {
  topicOrder: Array<Scalars['Int']>
};


export type UpdateTopicOrderMutation = (
  { __typename?: 'Mutation' }
  & { updateTopicOrder: (
    { __typename?: 'UpdateTopicOrderResponseWrap' }
    & Pick<UpdateTopicOrderResponseWrap, 'error'>
  ) }
);

export type CreateUserMutationVariables = {
  user_title?: Maybe<Scalars['String']>,
  firstname: Scalars['String'],
  middlename?: Maybe<Scalars['String']>,
  lastname: Scalars['String'],
  password: Scalars['String'],
  preferredname?: Maybe<Scalars['String']>,
  orcid: Scalars['String'],
  orcidHash: Scalars['String'],
  refreshToken: Scalars['String'],
  gender: Scalars['String'],
  nationality: Scalars['Int'],
  birthdate: Scalars['String'],
  organisation: Scalars['Int'],
  department: Scalars['String'],
  position: Scalars['String'],
  email: Scalars['String'],
  telephone: Scalars['String'],
  telephone_alt?: Maybe<Scalars['String']>,
  otherOrganisation?: Maybe<Scalars['String']>
};


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

export type CreateUserByEmailInviteMutationVariables = {
  firstname: Scalars['String'],
  lastname: Scalars['String'],
  email: Scalars['String'],
  userRole: UserRole
};


export type CreateUserByEmailInviteMutation = (
  { __typename?: 'Mutation' }
  & { createUserByEmailInvite: (
    { __typename?: 'CreateUserByEmailInviteResponseWrap' }
    & Pick<CreateUserByEmailInviteResponseWrap, 'error' | 'id'>
  ) }
);

export type DeleteUserMutationVariables = {
  id: Scalars['Int']
};


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
  & Pick<BasicUserDetails, 'id' | 'firstname' | 'lastname' | 'organisation' | 'position'>
);

export type GetBasicUserDetailsQueryVariables = {
  id: Scalars['Int']
};


export type GetBasicUserDetailsQuery = (
  { __typename?: 'Query' }
  & { basicUserDetails: Maybe<(
    { __typename?: 'BasicUserDetails' }
    & BasicUserDetailsFragment
  )> }
);

export type GetFieldsQueryVariables = {};


export type GetFieldsQuery = (
  { __typename?: 'Query' }
  & { getFields: Maybe<(
    { __typename?: 'Fields' }
    & { institutions: Array<(
      { __typename?: 'Entry' }
      & Pick<Entry, 'id' | 'value'>
    )>, nationalities: Array<(
      { __typename?: 'Entry' }
      & Pick<Entry, 'id' | 'value'>
    )> }
  )> }
);

export type GetOrcIdInformationQueryVariables = {
  authorizationCode: Scalars['String']
};


export type GetOrcIdInformationQuery = (
  { __typename?: 'Query' }
  & { getOrcIDInformation: Maybe<(
    { __typename?: 'OrcIDInformation' }
    & Pick<OrcIdInformation, 'firstname' | 'lastname' | 'orcid' | 'orcidHash' | 'refreshToken' | 'token'>
  )> }
);

export type GetRolesQueryVariables = {};


export type GetRolesQuery = (
  { __typename?: 'Query' }
  & { roles: Maybe<Array<(
    { __typename?: 'Role' }
    & Pick<Role, 'id' | 'shortCode' | 'title'>
  )>> }
);

export type GetTokenMutationVariables = {
  token: Scalars['String']
};


export type GetTokenMutation = (
  { __typename?: 'Mutation' }
  & { token: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token' | 'error'>
  ) }
);

export type GetTokenForUserMutationVariables = {
  userId: Scalars['Int']
};


export type GetTokenForUserMutation = (
  { __typename?: 'Mutation' }
  & { getTokenForUser: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token' | 'error'>
  ) }
);

export type GetUserQueryVariables = {
  id: Scalars['Int']
};


export type GetUserQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid'>
  )> }
);

export type GetUserMeQueryVariables = {};


export type GetUserMeQuery = (
  { __typename?: 'Query' }
  & { me: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'user_title' | 'username' | 'firstname' | 'middlename' | 'lastname' | 'preferredname' | 'gender' | 'nationality' | 'birthdate' | 'organisation' | 'department' | 'position' | 'email' | 'telephone' | 'telephone_alt' | 'orcid'>
  )> }
);

export type GetUserProposalsQueryVariables = {};


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

export type GetUserWithRolesQueryVariables = {
  id: Scalars['Int']
};


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

export type GetUsersQueryVariables = {
  filter?: Maybe<Scalars['String']>,
  first?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>,
  userRole?: Maybe<UserRole>,
  subtractUsers?: Maybe<Array<Scalars['Int']>>
};


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

export type LoginMutationVariables = {
  email: Scalars['String'],
  password: Scalars['String']
};


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'TokenResponseWrap' }
    & Pick<TokenResponseWrap, 'token' | 'error'>
  ) }
);

export type ResetPasswordMutationVariables = {
  token: Scalars['String'],
  password: Scalars['String']
};


export type ResetPasswordMutation = (
  { __typename?: 'Mutation' }
  & { resetPassword: (
    { __typename?: 'BasicUserDetailsResponseWrap' }
    & Pick<BasicUserDetailsResponseWrap, 'error'>
  ) }
);

export type ResetPasswordEmailMutationVariables = {
  email: Scalars['String']
};


export type ResetPasswordEmailMutation = (
  { __typename?: 'Mutation' }
  & { resetPasswordEmail: (
    { __typename?: 'ResetPasswordEmailResponseWrap' }
    & Pick<ResetPasswordEmailResponseWrap, 'error' | 'success'>
  ) }
);

export type UpdatePasswordMutationVariables = {
  id: Scalars['Int'],
  password: Scalars['String']
};


export type UpdatePasswordMutation = (
  { __typename?: 'Mutation' }
  & { updatePassword: (
    { __typename?: 'BasicUserDetailsResponseWrap' }
    & Pick<BasicUserDetailsResponseWrap, 'error'>
  ) }
);

export type UpdateUserMutationVariables = {
  id: Scalars['Int'],
  user_title?: Maybe<Scalars['String']>,
  firstname: Scalars['String'],
  middlename?: Maybe<Scalars['String']>,
  lastname: Scalars['String'],
  preferredname?: Maybe<Scalars['String']>,
  gender: Scalars['String'],
  nationality: Scalars['Int'],
  birthdate: Scalars['String'],
  organisation: Scalars['Int'],
  department: Scalars['String'],
  position: Scalars['String'],
  email: Scalars['String'],
  telephone: Scalars['String'],
  telephone_alt?: Maybe<Scalars['String']>
};


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

export type UpdateUserRolesMutationVariables = {
  id: Scalars['Int'],
  roles?: Maybe<Array<Scalars['Int']>>
};


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

export type VerifyEmailMutationVariables = {
  token: Scalars['String']
};


export type VerifyEmailMutation = (
  { __typename?: 'Mutation' }
  & { emailVerification: (
    { __typename?: 'EmailVerificationResponseWrap' }
    & Pick<EmailVerificationResponseWrap, 'error' | 'success'>
  ) }
);

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
}
    `;
export const QuestionFragmentDoc = gql`
    fragment question on Question {
  question
  proposalQuestionId
  naturalKey
  dataType
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
export const QuestionRelFragmentDoc = gql`
    fragment questionRel on QuestionRel {
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
export const TemplateStepFragmentDoc = gql`
    fragment templateStep on TemplateStep {
  topic {
    title
    id
    sortOrder
    isEnabled
  }
  fields {
    ...questionRel
  }
}
    ${QuestionRelFragmentDoc}`;
export const TopicFragmentDoc = gql`
    fragment topic on Topic {
  title
  id
  sortOrder
  isEnabled
}
    `;
export const CoreReviewFragmentDoc = gql`
    fragment coreReview on Review {
  id
  userID
  status
  comment
  grade
}
    `;
export const ProposalTemplateFragmentDoc = gql`
    fragment proposalTemplate on ProposalTemplate {
  steps {
    topic {
      title
      id
    }
    fields {
      ...questionRel
    }
  }
  templateId
  name
  description
  complementaryQuestions {
    ...question
  }
}
    ${QuestionRelFragmentDoc}
${QuestionFragmentDoc}`;
export const ProposalTemplateMetadataFragmentDoc = gql`
    fragment proposalTemplateMetadata on ProposalTemplate {
  templateId
  name
  description
  isArchived
  proposalCount
  callCount
}
    `;
export const BasicUserDetailsFragmentDoc = gql`
    fragment basicUserDetails on BasicUserDetails {
  id
  firstname
  lastname
  organisation
  position
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
export const AssignMemberDocument = gql`
    mutation assignMember($memberId: Int!, $sepId: Int!) {
  assignMember(memberId: $memberId, sepId: $sepId) {
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
    }
    error
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
    query getSEPProposals($sepId: Int!) {
  sepProposals(sepId: $sepId) {
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
export const CreateCallDocument = gql`
    mutation createCall($shortCode: String!, $startCall: DateTime!, $endCall: DateTime!, $startReview: DateTime!, $endReview: DateTime!, $startNotify: DateTime!, $endNotify: DateTime!, $cycleComment: String!, $surveyComment: String!, $templateId: Int) {
  createCall(shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startNotify: $startNotify, endNotify: $endNotify, cycleComment: $cycleComment, surveyComment: $surveyComment, templateId: $templateId) {
    error
    call {
      id
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
    templateId
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
    id
    status
    shortCode
    rankOrder
    finalStatus
    title
    abstract
    created
    updated
    callId
    templateId
    notified
    proposer {
      ...basicUserDetails
    }
    questionary {
      steps {
        ...questionaryStep
      }
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
      reviewer {
        firstname
        lastname
        username
        id
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}
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
export const GetProposalDocument = gql`
    query getProposal($id: Int!) {
  proposal(id: $id) {
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
    templateId
    notified
    proposer {
      ...basicUserDetails
    }
    users {
      ...basicUserDetails
    }
    questionary {
      steps {
        ...questionaryStep
      }
    }
    technicalReview {
      id
      comment
      publicComment
      timeAllocation
      status
      proposalID
    }
    reviews {
      id
      grade
      comment
      status
      userID
      reviewer {
        firstname
        lastname
        username
        id
      }
    }
  }
}
    ${BasicUserDetailsFragmentDoc}
${QuestionaryStepFragmentDoc}`;
export const GetProposalsDocument = gql`
    query getProposals($filter: ProposalsFilter) {
  proposals(filter: $filter) {
    proposals {
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
      templateId
      notified
      proposer {
        ...basicUserDetails
      }
      reviews {
        id
        grade
        comment
        status
        userID
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
    }
    totalCount
  }
}
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
    mutation updateProposal($id: Int!, $title: String, $abstract: String, $answers: [ProposalAnswerInput!], $topicsCompleted: [Int!], $users: [Int!], $proposerId: Int, $partialSave: Boolean) {
  updateProposal(id: $id, title: $title, abstract: $abstract, answers: $answers, topicsCompleted: $topicsCompleted, users: $users, proposerId: $proposerId, partialSave: $partialSave) {
    proposal {
      id
    }
    error
  }
}
    `;
export const UpdateProposalFilesDocument = gql`
    mutation updateProposalFiles($proposalId: Int!, $questionId: String!, $files: [String!]!) {
  updateProposalFiles(proposalId: $proposalId, questionId: $questionId, files: $files) {
    files
    error
  }
}
    `;
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
    mutation addUserForReview($userID: Int!, $proposalID: Int!) {
  addUserForReview(userID: $userID, proposalID: $proposalID) {
    error
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
    mutation updateReview($reviewID: Int!, $grade: Int!, $comment: String!, $status: ReviewStatus!) {
  addReview(reviewID: $reviewID, grade: $grade, comment: $comment, status: $status) {
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
      proposal {
        id
        title
        shortCode
      }
    }
  }
}
    `;
export const CloneProposalTemplateDocument = gql`
    mutation cloneProposalTemplate($templateId: Int!) {
  cloneProposalTemplate(templateId: $templateId) {
    template {
      ...proposalTemplateMetadata
    }
    error
  }
}
    ${ProposalTemplateMetadataFragmentDoc}`;
export const CreateProposalTemplateDocument = gql`
    mutation createProposalTemplate($name: String!, $description: String) {
  createProposalTemplate(name: $name, description: $description) {
    template {
      ...proposalTemplateMetadata
    }
    error
  }
}
    ${ProposalTemplateMetadataFragmentDoc}`;
export const CreateQuestionDocument = gql`
    mutation createQuestion($dataType: DataType!) {
  createQuestion(dataType: $dataType) {
    question {
      ...question
    }
    error
  }
}
    ${QuestionFragmentDoc}`;
export const CreateQuestionRelDocument = gql`
    mutation createQuestionRel($templateId: Int!, $questionId: String!, $topicId: Int!, $sortOrder: Int!) {
  createQuestionRel(templateId: $templateId, questionId: $questionId, topicId: $topicId, sortOrder: $sortOrder) {
    template {
      ...proposalTemplate
    }
    error
  }
}
    ${ProposalTemplateFragmentDoc}`;
export const CreateTopicDocument = gql`
    mutation createTopic($templateId: Int!, $sortOrder: Int!) {
  createTopic(templateId: $templateId, sortOrder: $sortOrder) {
    template {
      ...proposalTemplate
    }
    error
  }
}
    ${ProposalTemplateFragmentDoc}`;
export const DeleteProposalTemplateDocument = gql`
    mutation deleteProposalTemplate($id: Int!) {
  deleteProposalTemplate(id: $id) {
    template {
      templateId
      name
    }
    error
  }
}
    `;
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
export const DeleteQuestionRelDocument = gql`
    mutation deleteQuestionRel($questionId: String!, $templateId: Int!) {
  deleteQuestionRel(questionId: $questionId, templateId: $templateId) {
    template {
      ...proposalTemplate
    }
    error
  }
}
    ${ProposalTemplateFragmentDoc}`;
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
export const GetProposalTemplateDocument = gql`
    query getProposalTemplate($templateId: Int!) {
  proposalTemplate(templateId: $templateId) {
    ...proposalTemplate
  }
}
    ${ProposalTemplateFragmentDoc}`;
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
export const UpdateProposalTemplateDocument = gql`
    mutation updateProposalTemplate($templateId: Int!, $name: String, $description: String, $isArchived: Boolean) {
  updateProposalTemplate(templateId: $templateId, name: $name, description: $description, isArchived: $isArchived) {
    template {
      ...proposalTemplateMetadata
    }
    error
  }
}
    ${ProposalTemplateMetadataFragmentDoc}`;
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
export const UpdateQuestionRelDocument = gql`
    mutation updateQuestionRel($questionId: String!, $templateId: Int!, $topicId: Int, $sortOrder: Int, $config: String, $dependency: FieldDependencyInput) {
  updateQuestionRel(questionId: $questionId, templateId: $templateId, topicId: $topicId, sortOrder: $sortOrder, config: $config, dependency: $dependency) {
    template {
      ...proposalTemplate
    }
    error
  }
}
    ${ProposalTemplateFragmentDoc}`;
export const UpdateQuestionsTopicRelsDocument = gql`
    mutation updateQuestionsTopicRels($templateId: Int!, $topicId: Int!, $fieldIds: [String!]) {
  updateQuestionsTopicRels(templateId: $templateId, topicId: $topicId, fieldIds: $fieldIds) {
    error
  }
}
    `;
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
    institutions {
      id
      value
    }
    nationalities {
      id
      value
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
export function getSdk(client: GraphQLClient) {
  return {
    assignProposal(variables: AssignProposalMutationVariables): Promise<AssignProposalMutation> {
      return client.request<AssignProposalMutation>(print(AssignProposalDocument), variables);
    },
    assignMember(variables: AssignMemberMutationVariables): Promise<AssignMemberMutation> {
      return client.request<AssignMemberMutation>(print(AssignMemberDocument), variables);
    },
    assignChairOrSecretary(variables: AssignChairOrSecretaryMutationVariables): Promise<AssignChairOrSecretaryMutation> {
      return client.request<AssignChairOrSecretaryMutation>(print(AssignChairOrSecretaryDocument), variables);
    },
    assignMemberToSEPProposal(variables: AssignMemberToSepProposalMutationVariables): Promise<AssignMemberToSepProposalMutation> {
      return client.request<AssignMemberToSepProposalMutation>(print(AssignMemberToSepProposalDocument), variables);
    },
    createSEP(variables: CreateSepMutationVariables): Promise<CreateSepMutation> {
      return client.request<CreateSepMutation>(print(CreateSepDocument), variables);
    },
    getSEP(variables: GetSepQueryVariables): Promise<GetSepQuery> {
      return client.request<GetSepQuery>(print(GetSepDocument), variables);
    },
    getSEPMembers(variables: GetSepMembersQueryVariables): Promise<GetSepMembersQuery> {
      return client.request<GetSepMembersQuery>(print(GetSepMembersDocument), variables);
    },
    getSEPProposals(variables: GetSepProposalsQueryVariables): Promise<GetSepProposalsQuery> {
      return client.request<GetSepProposalsQuery>(print(GetSepProposalsDocument), variables);
    },
    getSEPs(variables: GetSePsQueryVariables): Promise<GetSePsQuery> {
      return client.request<GetSePsQuery>(print(GetSePsDocument), variables);
    },
    removeProposalAssignment(variables: RemoveProposalAssignmentMutationVariables): Promise<RemoveProposalAssignmentMutation> {
      return client.request<RemoveProposalAssignmentMutation>(print(RemoveProposalAssignmentDocument), variables);
    },
    removeMember(variables: RemoveMemberMutationVariables): Promise<RemoveMemberMutation> {
      return client.request<RemoveMemberMutation>(print(RemoveMemberDocument), variables);
    },
    removeMemberFromSEPProposal(variables: RemoveMemberFromSepProposalMutationVariables): Promise<RemoveMemberFromSepProposalMutation> {
      return client.request<RemoveMemberFromSepProposalMutation>(print(RemoveMemberFromSepProposalDocument), variables);
    },
    updateSEP(variables: UpdateSepMutationVariables): Promise<UpdateSepMutation> {
      return client.request<UpdateSepMutation>(print(UpdateSepDocument), variables);
    },
    addClientLog(variables: AddClientLogMutationVariables): Promise<AddClientLogMutation> {
      return client.request<AddClientLogMutation>(print(AddClientLogDocument), variables);
    },
    getPageContent(variables: GetPageContentQueryVariables): Promise<GetPageContentQuery> {
      return client.request<GetPageContentQuery>(print(GetPageContentDocument), variables);
    },
    setPageContent(variables: SetPageContentMutationVariables): Promise<SetPageContentMutation> {
      return client.request<SetPageContentMutation>(print(SetPageContentDocument), variables);
    },
    createCall(variables: CreateCallMutationVariables): Promise<CreateCallMutation> {
      return client.request<CreateCallMutation>(print(CreateCallDocument), variables);
    },
    getCalls(variables?: GetCallsQueryVariables): Promise<GetCallsQuery> {
      return client.request<GetCallsQuery>(print(GetCallsDocument), variables);
    },
    getEventLogs(variables: GetEventLogsQueryVariables): Promise<GetEventLogsQuery> {
      return client.request<GetEventLogsQuery>(print(GetEventLogsDocument), variables);
    },
    administrationProposal(variables: AdministrationProposalMutationVariables): Promise<AdministrationProposalMutation> {
      return client.request<AdministrationProposalMutation>(print(AdministrationProposalDocument), variables);
    },
    createProposal(variables: CreateProposalMutationVariables): Promise<CreateProposalMutation> {
      return client.request<CreateProposalMutation>(print(CreateProposalDocument), variables);
    },
    deleteProposal(variables: DeleteProposalMutationVariables): Promise<DeleteProposalMutation> {
      return client.request<DeleteProposalMutation>(print(DeleteProposalDocument), variables);
    },
    getBlankProposal(variables: GetBlankProposalQueryVariables): Promise<GetBlankProposalQuery> {
      return client.request<GetBlankProposalQuery>(print(GetBlankProposalDocument), variables);
    },
    getFileMetadata(variables: GetFileMetadataQueryVariables): Promise<GetFileMetadataQuery> {
      return client.request<GetFileMetadataQuery>(print(GetFileMetadataDocument), variables);
    },
    getProposal(variables: GetProposalQueryVariables): Promise<GetProposalQuery> {
      return client.request<GetProposalQuery>(print(GetProposalDocument), variables);
    },
    getProposals(variables?: GetProposalsQueryVariables): Promise<GetProposalsQuery> {
      return client.request<GetProposalsQuery>(print(GetProposalsDocument), variables);
    },
    notifyProposal(variables: NotifyProposalMutationVariables): Promise<NotifyProposalMutation> {
      return client.request<NotifyProposalMutation>(print(NotifyProposalDocument), variables);
    },
    submitProposal(variables: SubmitProposalMutationVariables): Promise<SubmitProposalMutation> {
      return client.request<SubmitProposalMutation>(print(SubmitProposalDocument), variables);
    },
    updateProposal(variables: UpdateProposalMutationVariables): Promise<UpdateProposalMutation> {
      return client.request<UpdateProposalMutation>(print(UpdateProposalDocument), variables);
    },
    updateProposalFiles(variables: UpdateProposalFilesMutationVariables): Promise<UpdateProposalFilesMutation> {
      return client.request<UpdateProposalFilesMutation>(print(UpdateProposalFilesDocument), variables);
    },
    addTechnicalReview(variables: AddTechnicalReviewMutationVariables): Promise<AddTechnicalReviewMutation> {
      return client.request<AddTechnicalReviewMutation>(print(AddTechnicalReviewDocument), variables);
    },
    addUserForReview(variables: AddUserForReviewMutationVariables): Promise<AddUserForReviewMutation> {
      return client.request<AddUserForReviewMutation>(print(AddUserForReviewDocument), variables);
    },
    getReview(variables: GetReviewQueryVariables): Promise<GetReviewQuery> {
      return client.request<GetReviewQuery>(print(GetReviewDocument), variables);
    },
    removeUserForReview(variables: RemoveUserForReviewMutationVariables): Promise<RemoveUserForReviewMutation> {
      return client.request<RemoveUserForReviewMutation>(print(RemoveUserForReviewDocument), variables);
    },
    updateReview(variables: UpdateReviewMutationVariables): Promise<UpdateReviewMutation> {
      return client.request<UpdateReviewMutation>(print(UpdateReviewDocument), variables);
    },
    userWithReviews(variables?: UserWithReviewsQueryVariables): Promise<UserWithReviewsQuery> {
      return client.request<UserWithReviewsQuery>(print(UserWithReviewsDocument), variables);
    },
    cloneProposalTemplate(variables: CloneProposalTemplateMutationVariables): Promise<CloneProposalTemplateMutation> {
      return client.request<CloneProposalTemplateMutation>(print(CloneProposalTemplateDocument), variables);
    },
    createProposalTemplate(variables: CreateProposalTemplateMutationVariables): Promise<CreateProposalTemplateMutation> {
      return client.request<CreateProposalTemplateMutation>(print(CreateProposalTemplateDocument), variables);
    },
    createQuestion(variables: CreateQuestionMutationVariables): Promise<CreateQuestionMutation> {
      return client.request<CreateQuestionMutation>(print(CreateQuestionDocument), variables);
    },
    createQuestionRel(variables: CreateQuestionRelMutationVariables): Promise<CreateQuestionRelMutation> {
      return client.request<CreateQuestionRelMutation>(print(CreateQuestionRelDocument), variables);
    },
    createTopic(variables: CreateTopicMutationVariables): Promise<CreateTopicMutation> {
      return client.request<CreateTopicMutation>(print(CreateTopicDocument), variables);
    },
    deleteProposalTemplate(variables: DeleteProposalTemplateMutationVariables): Promise<DeleteProposalTemplateMutation> {
      return client.request<DeleteProposalTemplateMutation>(print(DeleteProposalTemplateDocument), variables);
    },
    deleteQuestion(variables: DeleteQuestionMutationVariables): Promise<DeleteQuestionMutation> {
      return client.request<DeleteQuestionMutation>(print(DeleteQuestionDocument), variables);
    },
    deleteQuestionRel(variables: DeleteQuestionRelMutationVariables): Promise<DeleteQuestionRelMutation> {
      return client.request<DeleteQuestionRelMutation>(print(DeleteQuestionRelDocument), variables);
    },
    deleteTopic(variables: DeleteTopicMutationVariables): Promise<DeleteTopicMutation> {
      return client.request<DeleteTopicMutation>(print(DeleteTopicDocument), variables);
    },
    getIsNaturalKeyPresent(variables: GetIsNaturalKeyPresentQueryVariables): Promise<GetIsNaturalKeyPresentQuery> {
      return client.request<GetIsNaturalKeyPresentQuery>(print(GetIsNaturalKeyPresentDocument), variables);
    },
    getProposalTemplate(variables: GetProposalTemplateQueryVariables): Promise<GetProposalTemplateQuery> {
      return client.request<GetProposalTemplateQuery>(print(GetProposalTemplateDocument), variables);
    },
    getProposalTemplates(variables?: GetProposalTemplatesQueryVariables): Promise<GetProposalTemplatesQuery> {
      return client.request<GetProposalTemplatesQuery>(print(GetProposalTemplatesDocument), variables);
    },
    updateProposalTemplate(variables: UpdateProposalTemplateMutationVariables): Promise<UpdateProposalTemplateMutation> {
      return client.request<UpdateProposalTemplateMutation>(print(UpdateProposalTemplateDocument), variables);
    },
    updateQuestion(variables: UpdateQuestionMutationVariables): Promise<UpdateQuestionMutation> {
      return client.request<UpdateQuestionMutation>(print(UpdateQuestionDocument), variables);
    },
    updateQuestionRel(variables: UpdateQuestionRelMutationVariables): Promise<UpdateQuestionRelMutation> {
      return client.request<UpdateQuestionRelMutation>(print(UpdateQuestionRelDocument), variables);
    },
    updateQuestionsTopicRels(variables: UpdateQuestionsTopicRelsMutationVariables): Promise<UpdateQuestionsTopicRelsMutation> {
      return client.request<UpdateQuestionsTopicRelsMutation>(print(UpdateQuestionsTopicRelsDocument), variables);
    },
    updateTopic(variables: UpdateTopicMutationVariables): Promise<UpdateTopicMutation> {
      return client.request<UpdateTopicMutation>(print(UpdateTopicDocument), variables);
    },
    updateTopicOrder(variables: UpdateTopicOrderMutationVariables): Promise<UpdateTopicOrderMutation> {
      return client.request<UpdateTopicOrderMutation>(print(UpdateTopicOrderDocument), variables);
    },
    createUser(variables: CreateUserMutationVariables): Promise<CreateUserMutation> {
      return client.request<CreateUserMutation>(print(CreateUserDocument), variables);
    },
    createUserByEmailInvite(variables: CreateUserByEmailInviteMutationVariables): Promise<CreateUserByEmailInviteMutation> {
      return client.request<CreateUserByEmailInviteMutation>(print(CreateUserByEmailInviteDocument), variables);
    },
    deleteUser(variables: DeleteUserMutationVariables): Promise<DeleteUserMutation> {
      return client.request<DeleteUserMutation>(print(DeleteUserDocument), variables);
    },
    getBasicUserDetails(variables: GetBasicUserDetailsQueryVariables): Promise<GetBasicUserDetailsQuery> {
      return client.request<GetBasicUserDetailsQuery>(print(GetBasicUserDetailsDocument), variables);
    },
    getFields(variables?: GetFieldsQueryVariables): Promise<GetFieldsQuery> {
      return client.request<GetFieldsQuery>(print(GetFieldsDocument), variables);
    },
    getOrcIDInformation(variables: GetOrcIdInformationQueryVariables): Promise<GetOrcIdInformationQuery> {
      return client.request<GetOrcIdInformationQuery>(print(GetOrcIdInformationDocument), variables);
    },
    getRoles(variables?: GetRolesQueryVariables): Promise<GetRolesQuery> {
      return client.request<GetRolesQuery>(print(GetRolesDocument), variables);
    },
    getToken(variables: GetTokenMutationVariables): Promise<GetTokenMutation> {
      return client.request<GetTokenMutation>(print(GetTokenDocument), variables);
    },
    getTokenForUser(variables: GetTokenForUserMutationVariables): Promise<GetTokenForUserMutation> {
      return client.request<GetTokenForUserMutation>(print(GetTokenForUserDocument), variables);
    },
    getUser(variables: GetUserQueryVariables): Promise<GetUserQuery> {
      return client.request<GetUserQuery>(print(GetUserDocument), variables);
    },
    getUserMe(variables?: GetUserMeQueryVariables): Promise<GetUserMeQuery> {
      return client.request<GetUserMeQuery>(print(GetUserMeDocument), variables);
    },
    getUserProposals(variables?: GetUserProposalsQueryVariables): Promise<GetUserProposalsQuery> {
      return client.request<GetUserProposalsQuery>(print(GetUserProposalsDocument), variables);
    },
    getUserWithRoles(variables: GetUserWithRolesQueryVariables): Promise<GetUserWithRolesQuery> {
      return client.request<GetUserWithRolesQuery>(print(GetUserWithRolesDocument), variables);
    },
    getUsers(variables?: GetUsersQueryVariables): Promise<GetUsersQuery> {
      return client.request<GetUsersQuery>(print(GetUsersDocument), variables);
    },
    login(variables: LoginMutationVariables): Promise<LoginMutation> {
      return client.request<LoginMutation>(print(LoginDocument), variables);
    },
    resetPassword(variables: ResetPasswordMutationVariables): Promise<ResetPasswordMutation> {
      return client.request<ResetPasswordMutation>(print(ResetPasswordDocument), variables);
    },
    resetPasswordEmail(variables: ResetPasswordEmailMutationVariables): Promise<ResetPasswordEmailMutation> {
      return client.request<ResetPasswordEmailMutation>(print(ResetPasswordEmailDocument), variables);
    },
    updatePassword(variables: UpdatePasswordMutationVariables): Promise<UpdatePasswordMutation> {
      return client.request<UpdatePasswordMutation>(print(UpdatePasswordDocument), variables);
    },
    updateUser(variables: UpdateUserMutationVariables): Promise<UpdateUserMutation> {
      return client.request<UpdateUserMutation>(print(UpdateUserDocument), variables);
    },
    updateUserRoles(variables: UpdateUserRolesMutationVariables): Promise<UpdateUserRolesMutation> {
      return client.request<UpdateUserRolesMutation>(print(UpdateUserRolesDocument), variables);
    },
    verifyEmail(variables: VerifyEmailMutationVariables): Promise<VerifyEmailMutation> {
      return client.request<VerifyEmailMutation>(print(VerifyEmailDocument), variables);
    }
  };
}