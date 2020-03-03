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

export type AddUserRoleResponseWrap = {
   __typename?: 'AddUserRoleResponseWrap',
  error?: Maybe<Scalars['String']>,
  success?: Maybe<Scalars['Boolean']>,
};

export type BasicUserDetails = {
   __typename?: 'BasicUserDetails',
  id: Scalars['Int'],
  firstname: Scalars['String'],
  lastname: Scalars['String'],
  organisation: Scalars['String'],
  position: Scalars['String'],
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
};

export type CallResponseWrap = {
   __typename?: 'CallResponseWrap',
  error?: Maybe<Scalars['String']>,
  call?: Maybe<Call>,
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
  EQ = 'EQ',
  NEQ = 'NEQ'
}

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
  question_id: Scalars['String'],
  dependency_id: Scalars['String'],
  dependency_natural_key: Scalars['String'],
  condition: FieldCondition,
};

export type FieldDependencyInput = {
  dependency_id: Scalars['String'],
  question_id: Scalars['String'],
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
  addClientLog: SuccessResponseWrap,
  addReview: ReviewResponseWrap,
  addTechnicalReview: TechnicalReviewResponseWrap,
  addUserForReview: ReviewResponseWrap,
  addUserRole: AddUserRoleResponseWrap,
  createCall: CallResponseWrap,
  createProposal: ProposalResponseWrap,
  createTemplateField: TemplateFieldResponseWrap,
  createTopic: ProposalTemplateResponseWrap,
  createUserByEmailInvite: CreateUserByEmailInviteResponseWrap,
  createUser: UserResponseWrap,
  deleteProposal: ProposalResponseWrap,
  deleteTemplateField: ProposalTemplateResponseWrap,
  deleteTopic: ProposalTemplateResponseWrap,
  emailVerification: EmailVerificationResponseWrap,
  getTokenForUser: TokenResponseWrap,
  login: TokenResponseWrap,
  prepareDB: SuccessResponseWrap,
  removeUserForReview: ReviewResponseWrap,
  resetPasswordEmail: ResetPasswordEmailResponseWrap,
  resetPassword: BasicUserDetailsResponseWrap,
  setPageContent: PageResponseWrap,
  submitProposal: ProposalResponseWrap,
  token: TokenResponseWrap,
  updateFieldTopicRel: UpdateFieldTopicRelResponseWrap,
  updatePassword: BasicUserDetailsResponseWrap,
  updateProposalFiles: UpdateProposalFilesResponseWrap,
  updateProposal: ProposalResponseWrap,
  updateProposalTemplateField: ProposalTemplateResponseWrap,
  updateTopic: TopicResponseWrap,
  updateTopicOrder: UpdateTopicOrderResponseWrap,
  updateUser: UserResponseWrap,
};


export type MutationAddClientLogArgs = {
  error: Scalars['String']
};


export type MutationAddReviewArgs = {
  reviewID: Scalars['Int'],
  comment: Scalars['String'],
  grade: Scalars['Int']
};


export type MutationAddTechnicalReviewArgs = {
  proposalID: Scalars['Int'],
  comment: Scalars['String'],
  timeAllocation: Scalars['Int'],
  status: TechnicalReviewStatus
};


export type MutationAddUserForReviewArgs = {
  userID: Scalars['Int'],
  proposalID: Scalars['Int']
};


export type MutationAddUserRoleArgs = {
  userID: Scalars['Int'],
  roleID: Scalars['Int']
};


export type MutationCreateCallArgs = {
  shortCode: Scalars['String'],
  startCall: Scalars['String'],
  endCall: Scalars['String'],
  startReview: Scalars['String'],
  endReview: Scalars['String'],
  startNotify: Scalars['String'],
  endNotify: Scalars['String'],
  cycleComment: Scalars['String'],
  surveyComment: Scalars['String']
};


export type MutationCreateTemplateFieldArgs = {
  topicId: Scalars['Int'],
  dataType: DataType
};


export type MutationCreateTopicArgs = {
  sortOrder: Scalars['Int']
};


export type MutationCreateUserByEmailInviteArgs = {
  firstname: Scalars['String'],
  lastname: Scalars['String'],
  email: Scalars['String']
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


export type MutationDeleteProposalArgs = {
  id: Scalars['Int']
};


export type MutationDeleteTemplateFieldArgs = {
  id: Scalars['String']
};


export type MutationDeleteTopicArgs = {
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


export type MutationUpdateFieldTopicRelArgs = {
  topic_id: Scalars['Int'],
  field_ids?: Maybe<Array<Scalars['String']>>
};


export type MutationUpdatePasswordArgs = {
  id: Scalars['Int'],
  password: Scalars['String']
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
  partialSave?: Maybe<Scalars['Boolean']>,
  rankOrder?: Maybe<Scalars['Int']>,
  finalStatus?: Maybe<ProposalEndStatus>
};


export type MutationUpdateProposalTemplateFieldArgs = {
  id: Scalars['String'],
  naturalKey?: Maybe<Scalars['String']>,
  question?: Maybe<Scalars['String']>,
  config?: Maybe<Scalars['String']>,
  isEnabled?: Maybe<Scalars['Boolean']>,
  dependencies: Array<FieldDependencyInput>
};


export type MutationUpdateTopicArgs = {
  id: Scalars['Int'],
  title?: Maybe<Scalars['String']>,
  isEnabled?: Maybe<Scalars['Boolean']>
};


export type MutationUpdateTopicOrderArgs = {
  topicOrder: Array<Scalars['Int']>
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
  COOKIEPAGE = 'COOKIEPAGE'
}

export type PageResponseWrap = {
   __typename?: 'PageResponseWrap',
  error?: Maybe<Scalars['String']>,
  page?: Maybe<Page>,
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
  users: Array<BasicUserDetails>,
  proposer: BasicUserDetails,
  reviews: Array<Review>,
  technicalReview?: Maybe<TechnicalReview>,
  questionary: Questionary,
};

export type ProposalAnswerInput = {
  proposal_question_id: Scalars['String'],
  data_type?: Maybe<DataType>,
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
  steps: Array<TemplateStep>,
};

export type ProposalTemplateField = {
   __typename?: 'ProposalTemplateField',
  proposal_question_id: Scalars['String'],
  natural_key: Scalars['String'],
  data_type: DataType,
  sort_order: Scalars['Int'],
  question: Scalars['String'],
  config: FieldConfig,
  topic_id: Scalars['Int'],
  dependencies?: Maybe<Array<FieldDependency>>,
};

export type ProposalTemplateResponseWrap = {
   __typename?: 'ProposalTemplateResponseWrap',
  error?: Maybe<Scalars['String']>,
  template?: Maybe<ProposalTemplate>,
};

export type Query = {
   __typename?: 'Query',
  basicUserDetails?: Maybe<BasicUserDetails>,
  blankProposal?: Maybe<Proposal>,
  call?: Maybe<Call>,
  calls?: Maybe<Array<Call>>,
  checkEmailExist?: Maybe<Scalars['Boolean']>,
  fileMetadata?: Maybe<Array<FileMetadata>>,
  getFields?: Maybe<Fields>,
  getOrcIDInformation?: Maybe<OrcIdInformation>,
  getPageContent?: Maybe<Scalars['String']>,
  isNaturalKeyPresent?: Maybe<Scalars['Boolean']>,
  proposal?: Maybe<Proposal>,
  proposals?: Maybe<ProposalsQueryResult>,
  proposalTemplate?: Maybe<ProposalTemplate>,
  review?: Maybe<Review>,
  roles?: Maybe<Array<Role>>,
  user?: Maybe<User>,
  users?: Maybe<UserQueryResult>,
};


export type QueryBasicUserDetailsArgs = {
  id: Scalars['Int']
};


export type QueryCallArgs = {
  id: Scalars['Int']
};


export type QueryCheckEmailExistArgs = {
  email: Scalars['String']
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


export type QueryProposalsArgs = {
  filter?: Maybe<Scalars['String']>,
  first?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type QueryReviewArgs = {
  id: Scalars['Int']
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

export type Questionary = {
   __typename?: 'Questionary',
  steps: Array<QuestionaryStep>,
};

export type QuestionaryField = {
   __typename?: 'QuestionaryField',
  proposal_question_id: Scalars['String'],
  natural_key: Scalars['String'],
  data_type: DataType,
  sort_order: Scalars['Int'],
  question: Scalars['String'],
  config: FieldConfig,
  topic_id: Scalars['Int'],
  dependencies?: Maybe<Array<FieldDependency>>,
  value: Scalars['IntStringDateBool'],
};

export type QuestionaryStep = {
   __typename?: 'QuestionaryStep',
  topic: Topic,
  isCompleted: Scalars['Boolean'],
  fields: Array<QuestionaryField>,
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

export type SuccessResponseWrap = {
   __typename?: 'SuccessResponseWrap',
  error?: Maybe<Scalars['String']>,
  isSuccess?: Maybe<Scalars['Boolean']>,
};

export type TechnicalReview = {
   __typename?: 'TechnicalReview',
  id: Scalars['Int'],
  proposalID: Scalars['Int'],
  comment: Scalars['String'],
  timeAllocation: Scalars['Int'],
  status: TechnicalReviewStatus,
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

export type TemplateFieldResponseWrap = {
   __typename?: 'TemplateFieldResponseWrap',
  error?: Maybe<Scalars['String']>,
  field?: Maybe<ProposalTemplateField>,
};

export type TemplateStep = {
   __typename?: 'TemplateStep',
  topic: Topic,
  fields: Array<ProposalTemplateField>,
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
};

export type TokenResponseWrap = {
   __typename?: 'TokenResponseWrap',
  error?: Maybe<Scalars['String']>,
  token: Scalars['String'],
};

export type Topic = {
   __typename?: 'Topic',
  topic_id: Scalars['Int'],
  topic_title: Scalars['String'],
  sort_order: Scalars['Int'],
  is_enabled: Scalars['Boolean'],
};

export type TopicResponseWrap = {
   __typename?: 'TopicResponseWrap',
  error?: Maybe<Scalars['String']>,
  topic?: Maybe<Topic>,
};

export type UpdateFieldTopicRelResponseWrap = {
   __typename?: 'UpdateFieldTopicRelResponseWrap',
  error?: Maybe<Scalars['String']>,
  result?: Maybe<Array<Scalars['String']>>,
};

export type UpdateProposalFilesResponseWrap = {
   __typename?: 'UpdateProposalFilesResponseWrap',
  error?: Maybe<Scalars['String']>,
  files: Array<Scalars['String']>,
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
  nationality: Scalars['Int'],
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
  REVIEWER = 'REVIEWER'
}

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
  startCall: Scalars['String'],
  endCall: Scalars['String'],
  startReview: Scalars['String'],
  endReview: Scalars['String'],
  startNotify: Scalars['String'],
  endNotify: Scalars['String'],
  cycleComment: Scalars['String'],
  surveyComment: Scalars['String']
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

export type GetCallsQueryVariables = {};


export type GetCallsQuery = (
  { __typename?: 'Query' }
  & { calls: Maybe<Array<(
    { __typename?: 'Call' }
    & Pick<Call, 'id' | 'shortCode' | 'startCall' | 'endCall'>
  )>> }
);

export type CreateProposalMutationVariables = {};


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

export type CreateTemplateFieldMutationVariables = {
  topicId: Scalars['Int'],
  dataType: DataType
};


export type CreateTemplateFieldMutation = (
  { __typename?: 'Mutation' }
  & { createTemplateField: (
    { __typename?: 'TemplateFieldResponseWrap' }
    & Pick<TemplateFieldResponseWrap, 'error'>
    & { field: Maybe<(
      { __typename?: 'ProposalTemplateField' }
      & ProposalTemplateFieldFragment
    )> }
  ) }
);

export type CreateTopicMutationVariables = {
  sortOrder: Scalars['Int']
};


export type CreateTopicMutation = (
  { __typename?: 'Mutation' }
  & { createTopic: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & { steps: Array<(
        { __typename?: 'TemplateStep' }
        & { topic: (
          { __typename?: 'Topic' }
          & TopicFragment
        ), fields: Array<(
          { __typename?: 'ProposalTemplateField' }
          & ProposalTemplateFieldFragment
        )> }
      )> }
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

export type DeleteTemplateFieldMutationVariables = {
  id: Scalars['String']
};


export type DeleteTemplateFieldMutation = (
  { __typename?: 'Mutation' }
  & { deleteTemplateField: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & { steps: Array<(
        { __typename?: 'TemplateStep' }
        & { topic: (
          { __typename?: 'Topic' }
          & TopicFragment
        ), fields: Array<(
          { __typename?: 'ProposalTemplateField' }
          & ProposalTemplateFieldFragment
        )> }
      )> }
    )> }
  ) }
);

export type DeleteTopicMutationVariables = {
  id: Scalars['Int']
};


export type DeleteTopicMutation = (
  { __typename?: 'Mutation' }
  & { deleteTopic: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
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
  & Pick<TextInputConfig, 'min' | 'max' | 'multiline' | 'placeholder' | 'small_label' | 'required' | 'tooltip' | 'htmlQuestion'>
);

export type FieldConfigFragment = FieldConfigBooleanConfigFragment | FieldConfigDateConfigFragment | FieldConfigEmbellishmentConfigFragment | FieldConfigFileUploadConfigFragment | FieldConfigSelectionFromOptionsConfigFragment | FieldConfigTextInputConfigFragment;

export type ProposalTemplateFieldFragment = (
  { __typename?: 'ProposalTemplateField' }
  & Pick<ProposalTemplateField, 'proposal_question_id' | 'natural_key' | 'data_type' | 'sort_order' | 'question' | 'topic_id'>
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
  ), dependencies: Maybe<Array<(
    { __typename?: 'FieldDependency' }
    & Pick<FieldDependency, 'question_id' | 'dependency_id' | 'dependency_natural_key'>
    & { condition: (
      { __typename?: 'FieldCondition' }
      & FieldConditionFragment
    ) }
  )>> }
);

export type QuestionaryFragment = (
  { __typename?: 'Questionary' }
  & { steps: Array<(
    { __typename?: 'QuestionaryStep' }
    & Pick<QuestionaryStep, 'isCompleted'>
    & { topic: (
      { __typename?: 'Topic' }
      & Pick<Topic, 'topic_title' | 'topic_id' | 'sort_order' | 'is_enabled'>
    ), fields: Array<(
      { __typename?: 'QuestionaryField' }
      & Pick<QuestionaryField, 'proposal_question_id' | 'natural_key' | 'data_type' | 'sort_order' | 'question' | 'topic_id' | 'value'>
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
      ), dependencies: Maybe<Array<(
        { __typename?: 'FieldDependency' }
        & Pick<FieldDependency, 'question_id' | 'dependency_id' | 'dependency_natural_key'>
        & { condition: (
          { __typename?: 'FieldCondition' }
          & FieldConditionFragment
        ) }
      )>> }
    )> }
  )> }
);

export type TopicFragment = (
  { __typename?: 'Topic' }
  & Pick<Topic, 'topic_title' | 'topic_id' | 'sort_order' | 'is_enabled'>
);

export type GetBlankProposalQueryVariables = {};


export type GetBlankProposalQuery = (
  { __typename?: 'Query' }
  & { blankProposal: Maybe<(
    { __typename?: 'Proposal' }
    & Pick<Proposal, 'id' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'title' | 'abstract' | 'created' | 'updated'>
    & { proposer: (
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    ), questionary: (
      { __typename?: 'Questionary' }
      & QuestionaryFragment
    ), users: Array<(
      { __typename?: 'BasicUserDetails' }
      & BasicUserDetailsFragment
    )>, reviews: Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )> }
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

export type GetIsNaturalKeyPresentQueryVariables = {
  naturalKey: Scalars['String']
};


export type GetIsNaturalKeyPresentQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'isNaturalKeyPresent'>
);

export type GetProposalQueryVariables = {
  id: Scalars['Int']
};


export type GetProposalQuery = (
  { __typename?: 'Query' }
  & { proposal: Maybe<(
    { __typename?: 'Proposal' }
    & Pick<Proposal, 'id' | 'title' | 'abstract' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'created' | 'updated'>
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
      & Pick<TechnicalReview, 'id' | 'comment' | 'timeAllocation' | 'status' | 'proposalID'>
    )>, reviews: Array<(
      { __typename?: 'Review' }
      & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
      & { reviewer: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
      )> }
    )> }
  )> }
);

export type GetProposalTemplateQueryVariables = {};


export type GetProposalTemplateQuery = (
  { __typename?: 'Query' }
  & { proposalTemplate: Maybe<(
    { __typename?: 'ProposalTemplate' }
    & { steps: Array<(
      { __typename?: 'TemplateStep' }
      & { topic: (
        { __typename?: 'Topic' }
        & Pick<Topic, 'topic_title' | 'topic_id'>
      ), fields: Array<(
        { __typename?: 'ProposalTemplateField' }
        & ProposalTemplateFieldFragment
      )> }
    )> }
  )> }
);

export type GetProposalsQueryVariables = {
  filter: Scalars['String']
};


export type GetProposalsQuery = (
  { __typename?: 'Query' }
  & { proposals: Maybe<(
    { __typename?: 'ProposalsQueryResult' }
    & Pick<ProposalsQueryResult, 'totalCount'>
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'title' | 'abstract' | 'status' | 'shortCode' | 'rankOrder' | 'finalStatus' | 'created' | 'updated'>
      & { proposer: (
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      ), reviews: Array<(
        { __typename?: 'Review' }
        & Pick<Review, 'id' | 'grade' | 'comment' | 'status' | 'userID'>
        & { reviewer: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'firstname' | 'lastname' | 'username' | 'id'>
        )> }
      )>, users: Array<(
        { __typename?: 'BasicUserDetails' }
        & BasicUserDetailsFragment
      )>, technicalReview: Maybe<(
        { __typename?: 'TechnicalReview' }
        & Pick<TechnicalReview, 'id' | 'comment' | 'timeAllocation' | 'status' | 'proposalID'>
      )> }
    )> }
  )> }
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

export type UpdateFieldTopicRelMutationVariables = {
  topicId: Scalars['Int'],
  fieldIds?: Maybe<Array<Scalars['String']>>
};


export type UpdateFieldTopicRelMutation = (
  { __typename?: 'Mutation' }
  & { updateFieldTopicRel: (
    { __typename?: 'UpdateFieldTopicRelResponseWrap' }
    & Pick<UpdateFieldTopicRelResponseWrap, 'error'>
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
  partialSave?: Maybe<Scalars['Boolean']>,
  rankOrder?: Maybe<Scalars['Int']>,
  finalStatus?: Maybe<ProposalEndStatus>
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

export type UpdateProposalTemplateFieldMutationVariables = {
  id: Scalars['String'],
  naturalKey?: Maybe<Scalars['String']>,
  question?: Maybe<Scalars['String']>,
  config?: Maybe<Scalars['String']>,
  isEnabled?: Maybe<Scalars['Boolean']>,
  dependencies: Array<FieldDependencyInput>
};


export type UpdateProposalTemplateFieldMutation = (
  { __typename?: 'Mutation' }
  & { updateProposalTemplateField: (
    { __typename?: 'ProposalTemplateResponseWrap' }
    & Pick<ProposalTemplateResponseWrap, 'error'>
    & { template: Maybe<(
      { __typename?: 'ProposalTemplate' }
      & { steps: Array<(
        { __typename?: 'TemplateStep' }
        & { topic: (
          { __typename?: 'Topic' }
          & TopicFragment
        ), fields: Array<(
          { __typename?: 'ProposalTemplateField' }
          & ProposalTemplateFieldFragment
        )> }
      )> }
    )> }
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

export type AddReviewMutationVariables = {
  reviewID: Scalars['Int'],
  grade: Scalars['Int'],
  comment: Scalars['String']
};


export type AddReviewMutation = (
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

export type AddTechnicalReviewMutationVariables = {
  proposalID: Scalars['Int'],
  timeAllocation: Scalars['Int'],
  comment: Scalars['String'],
  status: TechnicalReviewStatus
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

export type UserWithReviewsQueryVariables = {
  id: Scalars['Int']
};


export type UserWithReviewsQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
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
  email: Scalars['String']
};


export type CreateUserByEmailInviteMutation = (
  { __typename?: 'Mutation' }
  & { createUserByEmailInvite: (
    { __typename?: 'CreateUserByEmailInviteResponseWrap' }
    & Pick<CreateUserByEmailInviteResponseWrap, 'error' | 'id'>
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

export type GetUserProposalsQueryVariables = {
  id: Scalars['Int']
};


export type GetUserProposalsQuery = (
  { __typename?: 'Query' }
  & { user: Maybe<(
    { __typename?: 'User' }
    & { proposals: Array<(
      { __typename?: 'Proposal' }
      & Pick<Proposal, 'id' | 'shortCode' | 'title' | 'status' | 'created'>
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
  }
}
    `;
export const FieldConditionFragmentDoc = gql`
    fragment fieldCondition on FieldCondition {
  condition
  params
}
    `;
export const ProposalTemplateFieldFragmentDoc = gql`
    fragment proposalTemplateField on ProposalTemplateField {
  proposal_question_id
  natural_key
  data_type
  sort_order
  question
  config {
    ...fieldConfig
  }
  topic_id
  dependencies {
    question_id
    dependency_id
    dependency_natural_key
    condition {
      ...fieldCondition
    }
  }
}
    ${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const QuestionaryFragmentDoc = gql`
    fragment questionary on Questionary {
  steps {
    topic {
      topic_title
      topic_id
      sort_order
      is_enabled
    }
    isCompleted
    fields {
      proposal_question_id
      natural_key
      data_type
      sort_order
      question
      config {
        ...fieldConfig
      }
      topic_id
      dependencies {
        question_id
        dependency_id
        dependency_natural_key
        condition {
          ...fieldCondition
        }
      }
      value
    }
  }
}
    ${FieldConfigFragmentDoc}
${FieldConditionFragmentDoc}`;
export const TopicFragmentDoc = gql`
    fragment topic on Topic {
  topic_title
  topic_id
  sort_order
  is_enabled
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
export const BasicUserDetailsFragmentDoc = gql`
    fragment basicUserDetails on BasicUserDetails {
  id
  firstname
  lastname
  organisation
  position
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
    mutation createCall($shortCode: String!, $startCall: String!, $endCall: String!, $startReview: String!, $endReview: String!, $startNotify: String!, $endNotify: String!, $cycleComment: String!, $surveyComment: String!) {
  createCall(shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview, endReview: $endReview, startNotify: $startNotify, endNotify: $endNotify, cycleComment: $cycleComment, surveyComment: $surveyComment) {
    error
    call {
      id
    }
  }
}
    `;
export const GetCallsDocument = gql`
    query getCalls {
  calls {
    id
    shortCode
    startCall
    endCall
  }
}
    `;
export const CreateProposalDocument = gql`
    mutation createProposal {
  createProposal {
    proposal {
      id
      status
      shortCode
    }
    error
  }
}
    `;
export const CreateTemplateFieldDocument = gql`
    mutation createTemplateField($topicId: Int!, $dataType: DataType!) {
  createTemplateField(topicId: $topicId, dataType: $dataType) {
    field {
      ...proposalTemplateField
    }
    error
  }
}
    ${ProposalTemplateFieldFragmentDoc}`;
export const CreateTopicDocument = gql`
    mutation createTopic($sortOrder: Int!) {
  createTopic(sortOrder: $sortOrder) {
    template {
      steps {
        topic {
          ...topic
        }
        fields {
          ...proposalTemplateField
        }
      }
    }
    error
  }
}
    ${TopicFragmentDoc}
${ProposalTemplateFieldFragmentDoc}`;
export const DeleteProposalDocument = gql`
    mutation deleteProposal($id: Int!) {
  deleteProposal(id: $id) {
    proposal {
      id
    }
  }
}
    `;
export const DeleteTemplateFieldDocument = gql`
    mutation deleteTemplateField($id: String!) {
  deleteTemplateField(id: $id) {
    template {
      steps {
        topic {
          ...topic
        }
        fields {
          ...proposalTemplateField
        }
      }
    }
    error
  }
}
    ${TopicFragmentDoc}
${ProposalTemplateFieldFragmentDoc}`;
export const DeleteTopicDocument = gql`
    mutation deleteTopic($id: Int!) {
  deleteTopic(id: $id) {
    error
  }
}
    `;
export const GetBlankProposalDocument = gql`
    query getBlankProposal {
  blankProposal {
    id
    status
    shortCode
    rankOrder
    finalStatus
    title
    abstract
    created
    updated
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
export const GetIsNaturalKeyPresentDocument = gql`
    query getIsNaturalKeyPresent($naturalKey: String!) {
  isNaturalKeyPresent(naturalKey: $naturalKey)
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
    created
    updated
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
      id
      comment
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
${QuestionaryFragmentDoc}`;
export const GetProposalTemplateDocument = gql`
    query getProposalTemplate {
  proposalTemplate {
    steps {
      topic {
        topic_title
        topic_id
      }
      fields {
        ...proposalTemplateField
      }
    }
  }
}
    ${ProposalTemplateFieldFragmentDoc}`;
export const GetProposalsDocument = gql`
    query getProposals($filter: String!) {
  proposals(filter: $filter) {
    proposals {
      id
      title
      abstract
      status
      shortCode
      rankOrder
      finalStatus
      created
      updated
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
        timeAllocation
        status
        proposalID
      }
    }
    totalCount
  }
}
    ${BasicUserDetailsFragmentDoc}`;
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
export const UpdateFieldTopicRelDocument = gql`
    mutation updateFieldTopicRel($topicId: Int!, $fieldIds: [String!]) {
  updateFieldTopicRel(topic_id: $topicId, field_ids: $fieldIds) {
    error
  }
}
    `;
export const UpdateProposalDocument = gql`
    mutation updateProposal($id: Int!, $title: String, $abstract: String, $answers: [ProposalAnswerInput!], $topicsCompleted: [Int!], $users: [Int!], $proposerId: Int, $partialSave: Boolean, $rankOrder: Int, $finalStatus: ProposalEndStatus) {
  updateProposal(id: $id, title: $title, abstract: $abstract, answers: $answers, topicsCompleted: $topicsCompleted, users: $users, proposerId: $proposerId, partialSave: $partialSave, rankOrder: $rankOrder, finalStatus: $finalStatus) {
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
export const UpdateProposalTemplateFieldDocument = gql`
    mutation updateProposalTemplateField($id: String!, $naturalKey: String, $question: String, $config: String, $isEnabled: Boolean, $dependencies: [FieldDependencyInput!]!) {
  updateProposalTemplateField(id: $id, naturalKey: $naturalKey, question: $question, config: $config, isEnabled: $isEnabled, dependencies: $dependencies) {
    template {
      steps {
        topic {
          ...topic
        }
        fields {
          ...proposalTemplateField
        }
      }
    }
    error
  }
}
    ${TopicFragmentDoc}
${ProposalTemplateFieldFragmentDoc}`;
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
export const AddReviewDocument = gql`
    mutation addReview($reviewID: Int!, $grade: Int!, $comment: String!) {
  addReview(reviewID: $reviewID, grade: $grade, comment: $comment) {
    error
    review {
      ...coreReview
    }
  }
}
    ${CoreReviewFragmentDoc}`;
export const AddTechnicalReviewDocument = gql`
    mutation addTechnicalReview($proposalID: Int!, $timeAllocation: Int!, $comment: String!, $status: TechnicalReviewStatus!) {
  addTechnicalReview(proposalID: $proposalID, timeAllocation: $timeAllocation, comment: $comment, status: $status) {
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
export const UserWithReviewsDocument = gql`
    query userWithReviews($id: Int!) {
  user(id: $id) {
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
    mutation createUserByEmailInvite($firstname: String!, $lastname: String!, $email: String!) {
  createUserByEmailInvite(firstname: $firstname, lastname: $lastname, email: $email) {
    error
    id
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
export const GetUserProposalsDocument = gql`
    query getUserProposals($id: Int!) {
  user(id: $id) {
    proposals {
      id
      shortCode
      title
      status
      created
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
    createProposal(variables?: CreateProposalMutationVariables): Promise<CreateProposalMutation> {
      return client.request<CreateProposalMutation>(print(CreateProposalDocument), variables);
    },
    createTemplateField(variables: CreateTemplateFieldMutationVariables): Promise<CreateTemplateFieldMutation> {
      return client.request<CreateTemplateFieldMutation>(print(CreateTemplateFieldDocument), variables);
    },
    createTopic(variables: CreateTopicMutationVariables): Promise<CreateTopicMutation> {
      return client.request<CreateTopicMutation>(print(CreateTopicDocument), variables);
    },
    deleteProposal(variables: DeleteProposalMutationVariables): Promise<DeleteProposalMutation> {
      return client.request<DeleteProposalMutation>(print(DeleteProposalDocument), variables);
    },
    deleteTemplateField(variables: DeleteTemplateFieldMutationVariables): Promise<DeleteTemplateFieldMutation> {
      return client.request<DeleteTemplateFieldMutation>(print(DeleteTemplateFieldDocument), variables);
    },
    deleteTopic(variables: DeleteTopicMutationVariables): Promise<DeleteTopicMutation> {
      return client.request<DeleteTopicMutation>(print(DeleteTopicDocument), variables);
    },
    getBlankProposal(variables?: GetBlankProposalQueryVariables): Promise<GetBlankProposalQuery> {
      return client.request<GetBlankProposalQuery>(print(GetBlankProposalDocument), variables);
    },
    getFileMetadata(variables: GetFileMetadataQueryVariables): Promise<GetFileMetadataQuery> {
      return client.request<GetFileMetadataQuery>(print(GetFileMetadataDocument), variables);
    },
    getIsNaturalKeyPresent(variables: GetIsNaturalKeyPresentQueryVariables): Promise<GetIsNaturalKeyPresentQuery> {
      return client.request<GetIsNaturalKeyPresentQuery>(print(GetIsNaturalKeyPresentDocument), variables);
    },
    getProposal(variables: GetProposalQueryVariables): Promise<GetProposalQuery> {
      return client.request<GetProposalQuery>(print(GetProposalDocument), variables);
    },
    getProposalTemplate(variables?: GetProposalTemplateQueryVariables): Promise<GetProposalTemplateQuery> {
      return client.request<GetProposalTemplateQuery>(print(GetProposalTemplateDocument), variables);
    },
    getProposals(variables: GetProposalsQueryVariables): Promise<GetProposalsQuery> {
      return client.request<GetProposalsQuery>(print(GetProposalsDocument), variables);
    },
    submitProposal(variables: SubmitProposalMutationVariables): Promise<SubmitProposalMutation> {
      return client.request<SubmitProposalMutation>(print(SubmitProposalDocument), variables);
    },
    updateFieldTopicRel(variables: UpdateFieldTopicRelMutationVariables): Promise<UpdateFieldTopicRelMutation> {
      return client.request<UpdateFieldTopicRelMutation>(print(UpdateFieldTopicRelDocument), variables);
    },
    updateProposal(variables: UpdateProposalMutationVariables): Promise<UpdateProposalMutation> {
      return client.request<UpdateProposalMutation>(print(UpdateProposalDocument), variables);
    },
    updateProposalFiles(variables: UpdateProposalFilesMutationVariables): Promise<UpdateProposalFilesMutation> {
      return client.request<UpdateProposalFilesMutation>(print(UpdateProposalFilesDocument), variables);
    },
    updateProposalTemplateField(variables: UpdateProposalTemplateFieldMutationVariables): Promise<UpdateProposalTemplateFieldMutation> {
      return client.request<UpdateProposalTemplateFieldMutation>(print(UpdateProposalTemplateFieldDocument), variables);
    },
    updateTopic(variables: UpdateTopicMutationVariables): Promise<UpdateTopicMutation> {
      return client.request<UpdateTopicMutation>(print(UpdateTopicDocument), variables);
    },
    updateTopicOrder(variables: UpdateTopicOrderMutationVariables): Promise<UpdateTopicOrderMutation> {
      return client.request<UpdateTopicOrderMutation>(print(UpdateTopicOrderDocument), variables);
    },
    addReview(variables: AddReviewMutationVariables): Promise<AddReviewMutation> {
      return client.request<AddReviewMutation>(print(AddReviewDocument), variables);
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
    userWithReviews(variables: UserWithReviewsQueryVariables): Promise<UserWithReviewsQuery> {
      return client.request<UserWithReviewsQuery>(print(UserWithReviewsDocument), variables);
    },
    createUser(variables: CreateUserMutationVariables): Promise<CreateUserMutation> {
      return client.request<CreateUserMutation>(print(CreateUserDocument), variables);
    },
    createUserByEmailInvite(variables: CreateUserByEmailInviteMutationVariables): Promise<CreateUserByEmailInviteMutation> {
      return client.request<CreateUserByEmailInviteMutation>(print(CreateUserByEmailInviteDocument), variables);
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
    getUserProposals(variables: GetUserProposalsQueryVariables): Promise<GetUserProposalsQuery> {
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