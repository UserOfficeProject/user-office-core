import {
  ProposalEndStatus,
  ProposalIdsWithNextStatus,
} from '../../models/Proposal';
import { Role } from '../../models/Role';
import {
  SEP,
  SEPAssignment,
  SEPReviewer,
  SEPProposal,
  SEPProposalWithReviewGradesAndRanking,
} from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
import { User } from '../../models/User';
import {
  UpdateMemberSEPArgs,
  AssignReviewersToSEPArgs,
  AssignChairOrSecretaryToSEPInput,
} from '../../resolvers/mutations/AssignMembersToSEP';
import { SaveSEPMeetingDecisionInput } from '../../resolvers/mutations/SEPMeetingDecisionMutation';
import { SEPDataSource } from '../SEPDataSource';

export const dummySEP = new SEP(
  1,
  'SEP 1',
  'Scientific evaluation panel 1',
  2,
  true,
  null,
  null
);

export const anotherDummySEP = new SEP(
  2,
  'SEP 2',
  'Scientific evaluation panel 2',
  2,
  false,
  null,
  null
);

export const dummySEPWithoutCode = new SEP(
  2,
  '',
  'Scientific evaluation panel 2',
  2,
  false,
  null,
  null
);

export const dummySEPs = [dummySEP, anotherDummySEP];

export const dummySEPMember = new SEPReviewer(1, 1);
export const anotherDummySEPMember = new SEPReviewer(2, 1);

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

export const dummySepMeetingDecision = new SepMeetingDecision(
  1,
  1,
  ProposalEndStatus.ACCEPTED,
  'Dummy comment for user',
  'Dummy comment for management',
  true,
  1
);

export const dummySEPAssignments = [
  dummySEPAssignment,
  anotherDummySEPAssignment,
];

export const dummySEPProposals = [dummySEPProposal, anotherDummySEPProposal];

export const dummySEPMembers = [dummySEPMember, anotherDummySEPMember];

export class SEPDataSourceMock implements SEPDataSource {
  async delete(id: number): Promise<SEP> {
    return dummySEP;
  }
  async getMembers(sepId: number): Promise<SEPReviewer[]> {
    return dummySEPMembers.filter((member) => member.sepId === sepId);
  }

  async getUserSepsByRoleAndSepId(
    userId: number,
    role: Role,
    sepId?: number
  ): Promise<SEP[]> {
    if (userId && role) {
      return dummySEPs;
    }

    return [];
  }

  async assignChairOrSecretaryToSEP(
    args: AssignChairOrSecretaryToSEPInput
  ): Promise<SEP> {
    const sep = dummySEPs.find((element) => element.id === args.sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async assignReviewersToSEP(args: AssignReviewersToSEPArgs): Promise<SEP> {
    const sep = dummySEPs.find((element) => element.id === args.sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async removeMemberFromSEP(
    args: UpdateMemberSEPArgs,
    isMemberChairOrSecretaryOfSEP: boolean
  ): Promise<SEP> {
    const sep = dummySEPs.find((element) => element.id === args.sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${args.sepId}`);
  }

  async isChairOrSecretaryOfSEP(
    userId: number,
    sepId: number
  ): Promise<boolean> {
    if (userId === 3) {
      return false;
    }

    return true;
  }

  async isChairOrSecretaryOfProposal(
    userId: number,
    proposalId: number
  ): Promise<boolean> {
    return false;
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
    throw new Error('Method not implemented: updateTimeAllocation');
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

    return new SEP(
      id,
      code,
      description,
      numberRatingsRequired,
      active,
      null,
      null
    );
  }

  async update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return new SEP(
      id,
      code,
      description,
      numberRatingsRequired,
      active,
      null,
      null
    );
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
        (sep) => sep.code.includes(filter) || sep.description.includes(filter)
      );
    }

    if (first || offset) {
      dummySEPsCopy = dummySEPsCopy.slice(
        offset || 0,
        first ? first + (offset || 0) : dummySEPsCopy.length
      );
    }

    if (active) {
      dummySEPsCopy = dummySEPsCopy.filter((sep) => sep.active);
    }

    return { totalCount: dummySEPsCopy.length, seps: dummySEPsCopy };
  }

  async getSEPProposals(sepId: number, callId: number) {
    return dummySEPProposals.filter((proposal) => proposal.sepId === sepId);
  }

  async getSEPProposalsByInstrument(
    sepId: number,
    instrumentId: number,
    callId: number
  ) {
    return dummySEPProposals.filter((proposal) => proposal.sepId === sepId);
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
      (assignment) =>
        assignment.sepId === sepId && assignment.proposalId === proposalId
    );
  }

  async getReviewers(sepId: number) {
    return dummySEPMembers.filter((member) => member.sepId === sepId);
  }

  async getSEPUserRole(id: number, sepId: number) {
    if (id === 3) {
      return null;
    }

    return { id: 4, shortCode: 'SEP_Chair', title: 'SEP Chair' };
  }

  async assignProposal(proposalId: number, sepId: number) {
    const sep = dummySEPs.find((element) => element.id === sepId);

    if (sep) {
      return new ProposalIdsWithNextStatus([1]);
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async removeProposalAssignment(proposalId: number, sepId: number) {
    const sep = dummySEPs.find((element) => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignMemberToSEPProposal(
    proposalId: number,
    sepId: number,
    memberIds: number[]
  ) {
    const sep = dummySEPs.find((element) => element.id === sepId);

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
    const sep = dummySEPs.find((element) => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async saveSepMeetingDecision(
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<SepMeetingDecision> {
    return dummySepMeetingDecision;
  }

  async getProposalsSepMeetingDecisions(
    proposalIds: number[]
  ): Promise<SepMeetingDecision[]> {
    return [dummySepMeetingDecision];
  }

  async getSepProposalsWithReviewGradesAndRanking(
    proposalIds: number[]
  ): Promise<SEPProposalWithReviewGradesAndRanking[]> {
    return [new SEPProposalWithReviewGradesAndRanking(1, 1, [7])];
  }
}
