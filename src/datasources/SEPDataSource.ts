import { ProposalIds } from '../models/Proposal';
import { Role } from '../models/Role';
import { SEP, SEPAssignment, SEPMember, SEPProposal } from '../models/SEP';
import { User } from '../models/User';
import { AddSEPMembersRole } from '../resolvers/mutations/AddSEPMembersRoleMutation';
import { UpdateMemberSEPArgs } from '../resolvers/mutations/AssignMembersToSEP';

export interface SEPDataSource {
  isMemberOfSEP(agent: User | null, sepId: number): Promise<boolean>;
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
  get(id: number): Promise<SEP | null>;
  getUserSeps(id: number): Promise<SEP[]>;
  getSEPByProposalId(proposalId: number): Promise<SEP | null>;
  getAll(
    active: boolean,
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
  getMembers(sepId: number): Promise<SEPMember[]>;
  getSEPUserRoles(id: number, sepId: number): Promise<Role[]>;
  getSEPProposalUserRoles(id: number, proposalId: number): Promise<Role[]>;
  addSEPMembersRole(args: AddSEPMembersRole): Promise<SEP>;
  removeSEPMemberRole(args: UpdateMemberSEPArgs): Promise<SEP>;
  assignProposal(proposalId: number, sepId: number): Promise<ProposalIds>;
  removeMemberFromSepProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ): Promise<SEP>;
  removeProposalAssignment(proposalId: number, sepId: number): Promise<SEP>;
  assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ): Promise<SEP>;
  updateTimeAllocation(
    sepId: number,
    proposalId: number,
    sepTimeAllocation: number | null
  ): Promise<SEPProposal>;
}
