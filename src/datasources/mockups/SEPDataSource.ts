import { SEP, SEPAssignment, SEPMember } from '../../models/SEP';
import { AddSEPMembersRole } from '../../resolvers/mutations/AddSEPMembersRoleMutation';
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

export const dummySEPAssignments = [
  dummySEPAssignment,
  anotherDummySEPAssignment,
];

export const dummySEPMembers = [dummySEPMember, anotherDummySEPMember];

export class SEPDataSourceMock implements SEPDataSource {
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

  async getAssignments(sepId: number) {
    return dummySEPAssignments.filter(assignment => assignment.sepId === sepId);
  }

  async getMembers(sepId: number) {
    return dummySEPMembers.filter(member => member.sepId === sepId);
  }

  async getSEPUserRoles(id: number, sepId: number) {
    return [{ id: 4, shortCode: 'SEP_Chair', title: 'SEP Chair' }];
  }

  async addSEPMembersRole(args: AddSEPMembersRole) {
    const sep = dummySEPs.find(element => element.id === args.SEPID);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.SEPID}`);
  }

  async removeSEPMemberRole(memberId: number, sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignProposal(proposalId: number, sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
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
}
