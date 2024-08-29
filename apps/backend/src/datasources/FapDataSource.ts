import {
  Fap,
  FapAssignment,
  FapReviewer,
  FapProposal,
  FapProposalWithReviewGradesAndRanking,
} from '../models/Fap';
import { FapMeetingDecision } from '../models/FapMeetingDecision';
import { ProposalPks } from '../models/Proposal';
import { Review, ReviewStatus } from '../models/Review';
import { Role } from '../models/Role';
import { BasicUserDetails } from '../models/User';
import {
  UpdateMemberFapArgs,
  AssignReviewersToFapArgs,
  AssignChairOrSecretaryToFapInput,
} from '../resolvers/mutations/AssignMembersToFapMutation';
import { RemoveProposalsFromFapsArgs } from '../resolvers/mutations/AssignProposalsToFapsMutation';
import { SaveFapMeetingDecisionInput } from '../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../resolvers/queries/FapsQuery';
import {
  FapReviewsRecord,
  AssignProposalsToFapsInput,
} from './postgres/records';

export interface FapDataSource {
  create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    gradeGuide: string,
    customGradeGuide: boolean | null,
    active: boolean
  ): Promise<Fap>;
  update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    gradeGuide: string,
    customGradeGuide: boolean | null,
    active: boolean,
    files: string | null
  ): Promise<Fap>;
  delete(id: number): Promise<Fap>;
  getFap(id: number): Promise<Fap | null>;
  getUserFapsByRoleAndFapId(
    userId: number,
    role: Role,
    fapId?: number
  ): Promise<Fap[]>;
  getUserFaps(id: number, role: Role): Promise<Fap[]>;
  getFapsByCallId(callId: number): Promise<Fap[]>;
  // TODO: This should be removed as we have getFapsByProposalPk and getFapsByProposalPks
  getFapByProposalPk(proposalPk: number): Promise<Fap | null>;
  getFapsByProposalPks(proposalPks: number[]): Promise<FapProposal[]>;
  getFapsByProposalPk(proposalPk: number): Promise<Fap[]>;
  getFaps(filter?: FapsFilter): Promise<{ totalCount: number; faps: Fap[] }>;
  getFapProposalAssignments(
    fapId: number,
    proposalPk: number,
    reviewerId: number | null
  ): Promise<FapAssignment[]>;
  getAllFapProposalAssignments(proposalPk: number): Promise<FapAssignment[]>;
  getFapReviewsByCallAndStatus(
    callIds: number[],
    status: ReviewStatus
  ): Promise<Review[]>;
  setFapReviewNotificationEmailSent(
    reviewId: number,
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  getFapProposals(fapId: number, callId: number | null): Promise<FapProposal[]>;
  getFapUsersByProposalPkAndCallId(
    proposalPk: number,
    callId: number
  ): Promise<BasicUserDetails[]>;
  getFapProposalCount(fapId: number): Promise<number>;
  getCurrentFapProposalCount(fapId: number): Promise<number>;
  getFapReviewerProposalCount(reviewerId: number): Promise<number>;
  getCurrentFapReviewerProposalCount(reviewerId: number): Promise<number>;
  getFapProposal(
    fapId: number,
    proposalPk: number,
    instrumentId?: number
  ): Promise<FapProposal | null>;
  getFapProposalsByInstrument(
    instrumentId: number,
    callId: number,
    { fapId, proposalPk }: { fapId?: number; proposalPk?: number }
  ): Promise<FapProposal[]>;
  getMembers(fapId: number): Promise<FapReviewer[]>;
  getReviewers(fapId: number): Promise<FapReviewer[]>;
  getFapUserRole(id: number, fapId: number): Promise<Role | null>;
  assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap>;
  assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap>;
  removeMemberFromFap(args: UpdateMemberFapArgs): Promise<Fap>;
  assignProposalsToFaps(
    args: AssignProposalsToFapsInput[]
  ): Promise<ProposalPks>;
  removeMemberFromFapProposal(
    proposalPk: number,
    fapId: number,
    memberId: number
  ): Promise<Fap>;
  removeProposalsFromFaps(
    args: RemoveProposalsFromFapsArgs
  ): Promise<FapProposal[]>;
  removeProposalsFromFapsByInstrument(
    proposalPk: number,
    instrumentIds: number[]
  ): Promise<FapProposal[]>;
  assignMembersToFapProposals(
    assignments: { proposalPk: number; memberId: number }[],
    fapId: number
  ): Promise<Fap>;
  updateTimeAllocation(
    fapId: number,
    proposalPk: number,
    fapTimeAllocation: number | null
  ): Promise<FapProposal>;
  isChairOrSecretaryOfFap(userId: number, fapId: number): Promise<boolean>;
  isChairOrSecretaryOfProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  saveFapMeetingDecision(
    saveFapMeetingDecisionInput: SaveFapMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<FapMeetingDecision>;
  getProposalsFapMeetingDecisions(
    proposalPks: number[],
    fapId?: number
  ): Promise<FapMeetingDecision[]>;
  getAllFapMeetingDecisions(fapId: number): Promise<FapMeetingDecision[]>;
  getFapProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<FapProposalWithReviewGradesAndRanking[]>;
  getRelatedUsersOnFap(id: number): Promise<number[]>;
  isFapProposalInstrumentSubmitted(
    proposalPk: number,
    instrumentId?: number | null
  ): Promise<boolean>;
  setReviewerRank(
    proposalPk: number,
    reviewerId: number,
    rank: number
  ): Promise<boolean>;
  getFapReviewData(callId: number, fapId: number): Promise<FapReviewsRecord[]>;
  submitFapMeetings(
    callId: number,
    fapId: number,
    userId?: number
  ): Promise<FapProposal[]>;
}
