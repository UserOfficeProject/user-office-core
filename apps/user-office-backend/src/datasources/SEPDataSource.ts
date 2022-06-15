import { ProposalPksWithNextStatus } from '../models/Proposal';
import { Role } from '../models/Role';
import {
  SEP,
  SEPAssignment,
  SEPReviewer,
  SEPProposal,
  SEPProposalWithReviewGradesAndRanking,
} from '../models/SEP';
import { SepMeetingDecision } from '../models/SepMeetingDecision';
import {
  UpdateMemberSEPArgs,
  AssignReviewersToSEPArgs,
  AssignChairOrSecretaryToSEPInput,
} from '../resolvers/mutations/AssignMembersToSEP';
import { AssignProposalsToSepArgs } from '../resolvers/mutations/AssignProposalsToSep';
import { SaveSEPMeetingDecisionInput } from '../resolvers/mutations/SEPMeetingDecisionMutation';

export interface SEPDataSource {
  create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ): Promise<SEP>;
  update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ): Promise<SEP>;
  delete(id: number): Promise<SEP>;
  getSEP(id: number): Promise<SEP | null>;
  getUserSepsByRoleAndSepId(
    userId: number,
    role: Role,
    sepId?: number
  ): Promise<SEP[]>;
  getUserSeps(id: number, role: Role): Promise<SEP[]>;
  getSEPByProposalPk(proposalPk: number): Promise<SEP | null>;
  getSEPs(
    active?: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }>;
  getSEPProposalAssignments(
    sepId: number,
    proposalPk: number,
    reviewerId: number | null
  ): Promise<SEPAssignment[]>;
  getSEPProposals(sepId: number, callId: number | null): Promise<SEPProposal[]>;
  getSEPProposalCount(sepId: number): Promise<number>;
  getSEPReviewerProposalCount(reviewerId: number): Promise<number>;
  getSEPProposal(
    sepId: number,
    proposalPk: number
  ): Promise<SEPProposal | null>;
  getSEPProposalsByInstrument(
    sepId: number,
    instrumentId: number,
    callId: number
  ): Promise<SEPProposal[]>;
  getMembers(sepId: number): Promise<SEPReviewer[]>;
  getReviewers(sepId: number): Promise<SEPReviewer[]>;
  getSEPUserRole(id: number, sepId: number): Promise<Role | null>;
  assignChairOrSecretaryToSEP(
    args: AssignChairOrSecretaryToSEPInput
  ): Promise<SEP>;
  assignReviewersToSEP(args: AssignReviewersToSEPArgs): Promise<SEP>;
  removeMemberFromSEP(
    args: UpdateMemberSEPArgs,
    isMemberChairOrSecretaryOfSEP: boolean
  ): Promise<SEP>;
  assignProposalsToSep(
    args: AssignProposalsToSepArgs
  ): Promise<ProposalPksWithNextStatus>;
  removeMemberFromSepProposal(
    proposalPk: number,
    sepId: number,
    memberId: number
  ): Promise<SEP>;
  removeProposalsFromSep(proposalPks: number[], sepId: number): Promise<SEP>;
  assignMemberToSEPProposal(
    proposalPk: number,
    sepId: number,
    memberIds: number[]
  ): Promise<SEP>;
  updateTimeAllocation(
    sepId: number,
    proposalPk: number,
    sepTimeAllocation: number | null
  ): Promise<SEPProposal>;
  isChairOrSecretaryOfSEP(userId: number, sepId: number): Promise<boolean>;
  isChairOrSecretaryOfProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean>;
  saveSepMeetingDecision(
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<SepMeetingDecision>;
  getProposalsSepMeetingDecisions(
    proposalPks: number[]
  ): Promise<SepMeetingDecision[]>;
  getSepProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<SEPProposalWithReviewGradesAndRanking[]>;
  getRelatedUsersOnSep(id: number): Promise<number[]>;
}
