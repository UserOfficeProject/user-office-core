import gql from 'graphql-tag';

import { AllocationTimeUnits } from '../../models/Call';
import { ProposalEndStatus } from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { User } from './User';

export const typeDefs = gql`
  type ProposalViewBatched {
    primaryKey: Int!
    title: String!
    principalInvestigatorId: Int!
    statusId: Int!
    statusName: String!
    statusDescription: String!
    proposalId: String!
    rankOrder: Int
    finalStatus: ProposalEndStatus
    notified: Boolean!
    submitted: Boolean!
    technicalTimeAllocation: Int
    managementTimeAllocation: Int
    technicalReviewAssigneeId: Int
    technicalReviewAssigneeFirstName: String
    technicalReviewAssigneeLastName: String
    technicalStatus: TechnicalReviewStatus
    technicalReviewSubmitted: Int
    instrumentName: String
    callShortCode: String
    sepCode: String
    sepId: Int
    reviewAverage: Float
    reviewDeviation: Float
    instrumentId: Int
    callId: Int!
    workflowId: Int!
    allocationTimeUnit: AllocationTimeUnits!
    principalInvestigator: User
  }
  type User {
    firstname: String
    lastname: String
    preferredname: String
    organisation: Int
    email: String
  }
  type Query {
    instrumentScientistProposalsBatched(
      offset: Int
      first: Int
      filter: ProposalsFilter
    ): ProposalsViewBatchedResult

    proposalsViewBatched(
      filter: ProposalsFilter
      first: Int
      offset: Int
      sortField: String
      sortDirection: String
      searchText: String
    ): ProposalsViewBatchedQueryResult
  }
  type ProposalsViewBatchedQueryResult {
    totalCount: Int!
    proposalViews: [ProposalViewBatched!]!
  }
  type ProposalsViewBatchedResult {
    totalCount: Int!
    proposals: [ProposalViewBatched!]!
  }
  input ProposalsFilter {
    text: String
    questionaryIds: [Int!]
    reviewer: ReviewerFilter
    callId: Int
    instrumentId: Int
    proposalStatusId: Int
    shortCodes: [String!]
    questionFilter: QuestionFilterInput
    referenceNumbers: [String!]
  }
  enum ReviewerFilter {
    ME
    ALL
  }
  input QuestionFilterInput {
    questionId: String!
    value: String!
    compareOperator: QuestionFilterCompareOperator!
    dataType: DataType!
  }
  enum QuestionFilterCompareOperator {
    GREATER_THAN
    LESS_THAN
    EQUALS
    INCLUDES
    EXISTS
  }
  enum DataType {
    BOOLEAN
    DATE
    EMBELLISHMENT
    FILE_UPLOAD
    GENERIC_TEMPLATE
    SELECTION_FROM_OPTIONS
    TEXT_INPUT
    SAMPLE_DECLARATION
    SAMPLE_BASIS
    PROPOSAL_BASIS
    INTERVAL
    NUMBER_INPUT
    SHIPMENT_BASIS
    RICH_TEXT_INPUT
    VISIT_BASIS
    GENERIC_TEMPLATE_BASIS
    PROPOSAL_ESI_BASIS
    SAMPLE_ESI_BASIS
    FEEDBACK_BASIS
    DYNAMIC_MULTIPLE_CHOICE
    INSTRUMENT_PICKER
  }
  enum ProposalEndStatus {
    UNSET
    ACCEPTED
    RESERVED
    REJECTED
  }
  enum TechnicalReviewStatus {
    FEASIBLE
    PARTIALLY_FEASIBLE
    UNFEASIBLE
  }
  enum AllocationTimeUnits {
    Day
    Hour
  }
`;

export type ProposalViewBatched = {
  primaryKey: number;
  title: string;
  principalInvestigatorId: number;
  statusId: number;
  statusName: string;
  statusDescription: string;
  proposalId: string;
  rankOrder: number;
  finalStatus: ProposalEndStatus;
  notified: boolean;
  submitted: boolean;
  technicalTimeAllocation: number;
  managementTimeAllocation: number;
  technicalReviewAssigneeId: number;
  technicalReviewAssigneeFirstName: string;
  technicalReviewAssigneeLastName: string;
  technicalStatus: TechnicalReviewStatus;
  technicalReviewSubmitted: number;
  instrumentName: string;
  callShortCode: string;
  sepCode: string;
  sepId: number;
  reviewAverage: number;
  reviewDeviation: number;
  instrumentId: number;
  callId: number;
  workflowId: number;
  allocationTimeUnit: AllocationTimeUnits;
  principalInvestigator: User;
};

export default typeDefs;
