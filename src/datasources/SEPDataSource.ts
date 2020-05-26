import { Role } from '../models/Role';
import { SEP, SEPAssignment, SEPMember } from '../models/SEP';
import { AddSEPMembersRole } from '../resolvers/mutations/AddSEPMembersRoleMutation';

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
  get(id: number): Promise<SEP | null>;
  getUserSeps(id: number): Promise<SEP[]>;
  getAll(
    active: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }>;
  getAssignments(sepId: number): Promise<SEPAssignment[]>;
  getMembers(sepId: number): Promise<SEPMember[]>;
  getSEPUserRoles(id: number, sepId: number): Promise<Role[]>;
  addSEPMembersRole(args: AddSEPMembersRole): Promise<SEP>;
  removeSEPMemberRole(memberId: number, sepId: number): Promise<SEP>;
  assignProposal(proposalId: number, sepId: number): Promise<SEP>;
  removeProposalAssignment(proposalId: number, sepId: number): Promise<SEP>;
  assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ): Promise<SEP>;
}
