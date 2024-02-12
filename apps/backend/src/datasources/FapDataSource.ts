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
import { AssignProposalsToFapArgs } from '../resolvers/mutations/AssignProposalsToFapMutation';
import { SaveFapMeetingDecisionInput } from '../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../resolvers/queries/FapsQuery';

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
    active: boolean
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
  getFapByProposalPk(proposalPk: number): Promise<Fap | null>;
  getFapsByProposalPks(proposalPks: number[]): Promise<FapProposal[]>;
  getFaps(filter?: FapsFilter): Promise<{ totalCount: number; faps: Fap[] }>;
  getFapProposalAssignments(
    fapId: number,
    proposalPk: number,
    reviewerId: number | null
  ): Promise<FapAssignment[]>;
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
  getFapReviewerProposalCount(reviewerId: number): Promise<number>;
  getFapProposal(
    fapId: number,
    proposalPk: number
  ): Promise<FapProposal | null>;
  getFapProposalsByInstrument(
    fapId: number,
    instrumentId: number,
    callId: number
  ): Promise<FapProposal[]>;
  getMembers(fapId: number): Promise<FapReviewer[]>;
  getReviewers(fapId: number): Promise<FapReviewer[]>;
  getFapUserRole(id: number, fapId: number): Promise<Role | null>;
  assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap>;
  assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap>;
  removeMemberFromFap(
    args: UpdateMemberFapArgs,
    isMemberChairOrSecretaryOfFap: boolean
  ): Promise<Fap>;
  assignProposalsToFap(args: AssignProposalsToFapArgs): Promise<ProposalPks>;
  removeMemberFromFapProposal(
    proposalPk: number,
    fapId: number,
    memberId: number
  ): Promise<Fap>;
  removeProposalsFromFap(proposalPks: number[], fapId: number): Promise<Fap>;
  assignMemberToFapProposal(
    proposalPk: number,
    fapId: number,
    memberIds: number[]
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
    proposalPks: number[]
  ): Promise<FapMeetingDecision[]>;
  getFapProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<FapProposalWithReviewGradesAndRanking[]>;
  getRelatedUsersOnFap(id: number): Promise<number[]>;
  setReviewerRank(
    proposalPk: number,
    reviewerId: number,
    rank: number
  ): Promise<boolean>;
}
