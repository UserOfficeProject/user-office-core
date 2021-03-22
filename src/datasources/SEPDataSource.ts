import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { Role } from '../models/Role';
import { SEP, SEPAssignment, SEPReviewer, SEPProposal } from '../models/SEP';
import { SepMeetingDecision } from '../models/SepMeetingDecision';
import {
  UpdateMemberSEPArgs,
  AssignReviewersToSEPArgs,
  AssignChairOrSecretaryToSEPInput,
} from '../resolvers/mutations/AssignMembersToSEP';
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
  get(id: number): Promise<SEP | null>;
  getUserSepBySepId(userId: number, sepId: number): Promise<SEP | null>;
  getUserSeps(id: number, role: Role): Promise<SEP[]>;
  getSEPByProposalId(proposalId: number): Promise<SEP | null>;
  getAll(
    active?: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }>;
  getSEPProposalAssignments(
    sepId: number,
    proposalId: number,
    reviewerId: number | null
  ): Promise<SEPAssignment[]>;
  getSEPProposals(sepId: number, callId: number): Promise<SEPProposal[]>;
  getSEPProposal(
    sepId: number,
    proposalId: number
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
  assignProposal(
    proposalId: number,
    sepId: number
  ): Promise<ProposalIdsWithNextStatus>;
  removeMemberFromSepProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ): Promise<SEP>;
  removeProposalAssignment(proposalId: number, sepId: number): Promise<SEP>;
  assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberIds: number[]
  ): Promise<SEP>;
  updateTimeAllocation(
    sepId: number,
    proposalId: number,
    sepTimeAllocation: number | null
  ): Promise<SEPProposal>;
  isChairOrSecretaryOfSEP(userId: number, sepId: number): Promise<boolean>;
  isChairOrSecretaryOfProposal(
    userId: number,
    proposalId: number
  ): Promise<boolean>;
  saveSepMeetingDecision(
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<SepMeetingDecision>;
  getProposalSepMeetingDecision(
    proposalId: number
  ): Promise<SepMeetingDecision | null>;
}
