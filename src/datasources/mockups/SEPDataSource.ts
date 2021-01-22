import { ProposalIds } from '../../models/Proposal';
import { Role } from '../../models/Role';
import { SEP, SEPAssignment, SEPMember, SEPProposal } from '../../models/SEP';
import { User } from '../../models/User';
import { AddSEPMembersRole } from '../../resolvers/mutations/AddSEPMembersRoleMutation';
import { UpdateMemberSEPArgs } from '../../resolvers/mutations/AssignMembersToSEP';
import { SEPDataSource } from '../SEPDataSource';

export const dummySEP = new SEP(
  1,
  'SEP 1',
  'Scientific evaluation panel 1',
  2,
  true
);

export const anotherDummySEP = new SEP(
  2,
  'SEP 2',
  'Scientific evaluation panel 2',
  2,
  false
);

export const dummySEPWithoutCode = new SEP(
  2,
  '',
  'Scientific evaluation panel 2',
  2,
  false
);

export const dummySEPs = [dummySEP, anotherDummySEP];

export const dummySEPMember = new SEPMember(1, 4, 1, 1);
export const anotherDummySEPMember = new SEPMember(2, 5, 2, 1);

export const dummySEPAssignment = new SEPAssignment(
  1,
  2,
  1,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const anotherDummySEPAssignment = new SEPAssignment(
  1,
  3,
  2,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const dummySEPProposal = new SEPProposal(
  1,
  1,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const anotherDummySEPProposal = new SEPProposal(
  2,
  2,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const dummySEPAssignments = [
  dummySEPAssignment,
  anotherDummySEPAssignment,
];

export const dummySEPProposals = [dummySEPProposal, anotherDummySEPProposal];

export const dummySEPMembers = [dummySEPMember, anotherDummySEPMember];

export class SEPDataSourceMock implements SEPDataSource {
  async getSEPProposalUserRoles(
    id: number,
    proposalId: number
  ): Promise<Role[]> {
    return [];
  }

  async getSEPProposal(
    sepId: number,
    proposalId: number
  ): Promise<SEPProposal | null> {
    throw new Error('Method not implemented.');
  }
  updateTimeAllocation(
    sepId: number,
    proposalId: number,
    sepTimeAllocation: number | null
  ): Promise<SEPProposal> {
    throw new Error('Method not implemented.');
  }
  async isMemberOfSEP(agent: User | null, sepId: number) {
    return true;
  }

  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    const id = 2;

    return new SEP(id, code, description, numberRatingsRequired, active);
  }

  async update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return new SEP(id, code, description, numberRatingsRequired, active);
  }

  async get(id: number) {
    if (id && id > 0) {
      if (id == dummySEP.id) {
        return dummySEP;
      }
    }

    return null;
  }

  async getUserSeps(id: number): Promise<SEP[]> {
    return [dummySEP];
  }

  async getAll(
    active: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    // NOTE: Copy sorted by id 'desc'
    let dummySEPsCopy = [...dummySEPs.sort((a, b) => b.id - a.id)];

    if (filter) {
      dummySEPsCopy = dummySEPsCopy.filter(
        sep => sep.code.includes(filter) || sep.description.includes(filter)
      );
    }

    if (first || offset) {
      dummySEPsCopy = dummySEPsCopy.slice(
        offset || 0,
        first ? first + (offset || 0) : dummySEPsCopy.length
      );
    }

    if (active) {
      dummySEPsCopy = dummySEPsCopy.filter(sep => sep.active);
    }

    return { totalCount: dummySEPsCopy.length, seps: dummySEPsCopy };
  }

  async getSEPProposals(sepId: number, callId: number) {
    return dummySEPProposals.filter(proposal => proposal.sepId === sepId);
  }

  async getSEPProposalsByInstrument(
    sepId: number,
    instrumentId: number,
    callId: number
  ) {
    return dummySEPProposals.filter(proposal => proposal.sepId === sepId);
  }

  async getSEPByProposalId(proposalId: number) {
    return dummySEP;
  }

  async getSEPProposalAssignments(
    sepId: number,
    proposalId: number,
    reviewerId: number | null
  ) {
    return dummySEPAssignments.filter(
      assignment =>
        assignment.sepId === sepId && assignment.proposalId === proposalId
    );
  }

  async getMembers(sepId: number) {
    return dummySEPMembers.filter(member => member.sepId === sepId);
  }

  async getSEPUserRoles(id: number, sepId: number) {
    if (id === 3) {
      return [];
    }

    return [{ id: 4, shortCode: 'SEP_Chair', title: 'SEP Chair' }];
  }

  async addSEPMembersRole(args: AddSEPMembersRole) {
    const sep = dummySEPs.find(element => element.id === args.SEPID);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.SEPID}`);
  }

  async removeSEPMemberRole(args: UpdateMemberSEPArgs) {
    const sep = dummySEPs.find(element => element.id === args.sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async assignProposal(proposalId: number, sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return new ProposalIds([1]);
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeMemberFromSepProposal(
    proposalId: number,
    sepId: number,
    memberId: number
  ) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }
}
