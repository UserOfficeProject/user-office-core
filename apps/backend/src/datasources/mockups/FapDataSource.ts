import {
  Fap,
  FapAssignment,
  FapReviewer,
  FapProposal,
  FapProposalWithReviewGradesAndRanking,
} from '../../models/Fap';
import { FapMeetingDecision } from '../../models/FapMeetingDecision';
import { ProposalEndStatus, ProposalPks } from '../../models/Proposal';
import { Review, ReviewStatus } from '../../models/Review';
import { Role } from '../../models/Role';
import { User } from '../../models/User';
import {
  UpdateMemberFapArgs,
  AssignReviewersToFapArgs,
  AssignChairOrSecretaryToFapInput,
} from '../../resolvers/mutations/AssignMembersToFapMutation';
import { AssignProposalsToFapArgs } from '../../resolvers/mutations/AssignProposalsToFapMutation';
import { SaveFapMeetingDecisionInput } from '../../resolvers/mutations/FapMeetingDecisionMutation';
import { FapsFilter } from '../../resolvers/queries/FapsQuery';
import { FapDataSource } from '../FapDataSource';
import { basicDummyUser } from './UserDataSource';

export const dummyFap = new Fap(
  1,
  'Fap 1',
  'Facility access panel 1',
  2,
  '',
  true,
  true,
  null,
  null
);

export const anotherDummyFap = new Fap(
  2,
  'Fap 2',
  'Facility access panel 2',
  2,
  '',
  true,
  false,
  null,
  null
);

export const dummyFapWithoutCode = new Fap(
  2,
  '',
  'Facility access panel 2',
  2,
  '',
  true,
  false,
  null,
  null
);

export const dummyFaps = [dummyFap, anotherDummyFap];

export const dummyFapMember = new FapReviewer(1, 1);
export const anotherDummyFapMember = new FapReviewer(2, 1);

export const dummyFapMemberWithNoReviews = new FapReviewer(1, 3);
export const anotherDummyFapMemberWithNoReviews = new FapReviewer(4, 3);

export const dummyFapMemberForNoReviewsNeeded = new FapReviewer(1, 4);
export const anotherDummyFapMemberForNoReviewsNeeded = new FapReviewer(2, 4);

export const dummyFapMemberUnevenAllocation = new FapReviewer(5, 5);
export const anotherDummyFapMemberUnevenAllocation = new FapReviewer(6, 5);

export const dummyFapMemberAlreadyAssigned = new FapReviewer(7, 6);
export const dummyFapMemberNotAlreadyAssigned = new FapReviewer(8, 6);

export const dummyFapMemberForFap7 = new FapReviewer(9, 7);
export const anotherDummyFapMemberForFap7 = new FapReviewer(10, 7);

export const dummyFapAssignment = new FapAssignment(
  1,
  2,
  1,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const anotherDummyFapAssignment = new FapAssignment(
  1,
  3,
  2,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const andAnotherDummyFapAssignment = new FapAssignment(
  5,
  5,
  5,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const yetAnotherDummyFapAssignment = new FapAssignment(
  2,
  7,
  6,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const dummyFapReview = new Review(1, 1, 1, 'Dummy Fap review', 7, 0, 1);

export const dummyFapProposal = new FapProposal(
  1,
  1,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const anotherDummyFapProposal = new FapProposal(
  2,
  2,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const dummyFapProposalForMassAssignment = new FapProposal(
  1,
  3,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const anotherDummyFapProposalForMassAssignment = new FapProposal(
  2,
  3,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const firstDummyFapProposalForUnevenMassAssignment = new FapProposal(
  1,
  5,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const secondDummyFapProposalForUnevenMassAssignment = new FapProposal(
  2,
  5,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const thirdDummyFapProposalForUnevenMassAssignment = new FapProposal(
  3,
  5,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const firstDummyFapProposalForAlreadyAssigned = new FapProposal(
  1,
  6,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const secondDummyFapProposalForAlreadyAssigned = new FapProposal(
  2,
  6,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const thirdDummyFapProposalForAlreadyAssigned = new FapProposal(
  3,
  6,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const dummyFapProposalForMassAssignmentNeedsTwoReviews = new FapProposal(
  1,
  7,
  new Date('2020-04-20 08:25:12.23043+00'),
  null
);

export const dummyFapMeetingDecision = new FapMeetingDecision(
  1,
  1,
  ProposalEndStatus.ACCEPTED,
  'Dummy comment for user',
  'Dummy comment for management',
  true,
  1
);

export const dummyFapAssignments = [
  dummyFapAssignment,
  anotherDummyFapAssignment,
  andAnotherDummyFapAssignment,
  yetAnotherDummyFapAssignment,
];

export const dummyFapProposals = [dummyFapProposal, anotherDummyFapProposal];

export const dummyFapMembers = [
  dummyFapMember,
  anotherDummyFapMember,
  dummyFapMemberWithNoReviews,
  anotherDummyFapMemberWithNoReviews,
  dummyFapMemberForNoReviewsNeeded,
  anotherDummyFapMemberForNoReviewsNeeded,
  dummyFapMemberUnevenAllocation,
  anotherDummyFapMemberUnevenAllocation,
  dummyFapMemberAlreadyAssigned,
  dummyFapMemberNotAlreadyAssigned,
  dummyFapMemberForFap7,
  anotherDummyFapMemberForFap7,
];

export const dummyFapProposalToNumReviewsNeededMap = new Map<
  FapProposal,
  number
>([
  [dummyFapProposalForMassAssignment, 1],
  [anotherDummyFapProposalForMassAssignment, 1],
]);

export const dummyFapProposalToNumReviewsNeededMapUneven = new Map<
  FapProposal,
  number
>([
  [firstDummyFapProposalForUnevenMassAssignment, 1],
  [secondDummyFapProposalForUnevenMassAssignment, 1],
  [thirdDummyFapProposalForUnevenMassAssignment, 1],
]);

export const dummyFapProposalToNumReviewsNeededMapAlreadyAssigned = new Map<
  FapProposal,
  number
>([
  [firstDummyFapProposalForAlreadyAssigned, 1],
  [secondDummyFapProposalForAlreadyAssigned, 1],
  [thirdDummyFapProposalForAlreadyAssigned, 1],
]);

export const dummyFapProposalToNoReviewsNeededMap = new Map<
  FapProposal,
  number
>([
  [dummyFapProposalForMassAssignment, 0],
  [anotherDummyFapProposalForMassAssignment, 0],
]);

export const dummyFapProposalTwoReviewsNeeded = new Map<FapProposal, number>([
  [dummyFapProposalForMassAssignmentNeedsTwoReviews, 2],
]);

export class FapDataSourceMock implements FapDataSource {
  async delete(id: number): Promise<Fap> {
    return dummyFap;
  }
  async getMembers(fapId: number): Promise<FapReviewer[]> {
    return dummyFapMembers.filter((member) => member.fapId === fapId);
  }

  async getUserFapsByRoleAndFapId(
    userId: number,
    role: Role,
    fapId?: number
  ): Promise<Fap[]> {
    if (userId && role) {
      return dummyFaps;
    }

    return [];
  }

  async assignChairOrSecretaryToFap(
    args: AssignChairOrSecretaryToFapInput
  ): Promise<Fap> {
    const fap = dummyFaps.find((element) => element.id === args.fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${args.fapId}`);
  }

  async assignReviewersToFap(args: AssignReviewersToFapArgs): Promise<Fap> {
    const fap = dummyFaps.find((element) => element.id === args.fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${args.fapId}`);
  }

  async removeMemberFromFap(args: UpdateMemberFapArgs): Promise<Fap> {
    const fap = dummyFaps.find((element) => element.id === args.fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${args.fapId}`);
  }

  async isChairOrSecretaryOfFap(
    userId: number,
    fapId: number
  ): Promise<boolean> {
    if (userId === 3) {
      return false;
    }

    return true;
  }

  async isChairOrSecretaryOfProposal(
    userId: number,
    proposalPk: number
  ): Promise<boolean> {
    return false;
  }

  async getFapProposal(
    fapId: number,
    proposalPk: number
  ): Promise<FapProposal | null> {
    throw new Error('Method not implemented.');
  }

  updateTimeAllocation(
    fapId: number,
    proposalPk: number,
    fapTimeAllocation: number | null
  ): Promise<FapProposal> {
    throw new Error('Method not implemented: updateTimeAllocation');
  }

  async isMemberOfFap(agent: User | null, fapId: number) {
    return true;
  }

  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    gradeGuide: string,
    customGradeGuide: boolean | null,
    active: boolean
  ) {
    const id = 2;

    return new Fap(
      id,
      code,
      description,
      numberRatingsRequired,
      gradeGuide,
      customGradeGuide,
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
    gradeGuide: string,
    customGradeGuide: boolean | null,
    active: boolean
  ) {
    return new Fap(
      id,
      code,
      description,
      numberRatingsRequired,
      gradeGuide,
      customGradeGuide,
      active,
      null,
      null
    );
  }

  async getFap(id: number) {
    if (id && id > 0) {
      if (id == dummyFap.id) {
        return dummyFap;
      }
    }

    return null;
  }

  async getUserFaps(id: number): Promise<Fap[]> {
    return [dummyFap];
  }

  async getFaps({ active, filter, first, offset }: FapsFilter) {
    // NOTE: Copy sorted by id 'desc'
    let dummyFapsCopy = [...dummyFaps.sort((a, b) => b.id - a.id)];

    if (filter) {
      dummyFapsCopy = dummyFapsCopy.filter(
        (fap) => fap.code.includes(filter) || fap.description.includes(filter)
      );
    }

    if (first || offset) {
      dummyFapsCopy = dummyFapsCopy.slice(
        offset || 0,
        first ? first + (offset || 0) : dummyFapsCopy.length
      );
    }

    if (active) {
      dummyFapsCopy = dummyFapsCopy.filter((fap) => fap.active);
    }

    return { totalCount: dummyFapsCopy.length, faps: dummyFapsCopy };
  }

  async getFapProposals(fapId: number, callId: number | null) {
    return dummyFapProposals.filter((proposal) => proposal.fapId === fapId);
  }

  async getFapProposalCount(fapId: number) {
    return dummyFapProposals.length;
  }

  async getFapReviewerProposalCount(reviewerId: number) {
    return dummyFapProposals.length;
  }

  async getFapReviewerProposalCountCurrentRound(reviewerId: number) {
    return dummyFapAssignments.filter(
      (assignment) => assignment.fapMemberUserId === reviewerId
    ).length;
  }

  async getFapReviewsByCallAndStatus(callIds: number[], status: ReviewStatus) {
    return [dummyFapReview];
  }

  async setFapReviewNotificationEmailSent(
    reviewId: number,
    userId: number,
    proposalPk: number
  ) {
    return true;
  }

  async getFapProposalsByInstrument(
    fapId: number,
    instrumentId: number,
    callId: number
  ) {
    return dummyFapProposals.filter((proposal) => proposal.fapId === fapId);
  }

  async getFapByProposalPk(proposalPk: number) {
    return dummyFap;
  }

  async getFapsByProposalPks(proposalPks: number[]) {
    return [dummyFapProposal];
  }

  async getFapsByCallId(callId: number): Promise<Fap[]> {
    return [dummyFap];
  }

  async getFapProposalAssignments(
    fapId: number,
    proposalPk: number,
    reviewerId: number | null
  ) {
    return dummyFapAssignments.filter(
      (assignment) =>
        assignment.fapId === fapId &&
        assignment.proposalPk === proposalPk &&
        (reviewerId !== null ? assignment.fapMemberUserId === reviewerId : true)
    );
  }

  async getReviewers(fapId: number) {
    return dummyFapMembers.filter((member) => member.fapId === fapId);
  }

  async getFapUsersByProposalPkAndCallId(proposalPk: number, callId: number) {
    return [basicDummyUser];
  }

  async getFapUserRole(id: number, fapId: number) {
    if (id === 3) {
      return null;
    }

    return { id: 4, shortCode: 'fap_chair', title: 'Fap Chair' };
  }

  async assignProposalsToFap({ proposals, fapId }: AssignProposalsToFapArgs) {
    const fap = dummyFaps.find((element) => element.id === fapId);

    if (fap) {
      return new ProposalPks([1]);
    }

    throw new Error(`Fap not found ${fapId}`);
  }

  async removeProposalsFromFap(proposalPks: number[], fapId: number) {
    const fap = dummyFaps.find((element) => element.id === fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${fapId}`);
  }

  async assignMemberToFapProposal(
    proposalPk: number,
    fapId: number,
    memberIds: number[]
  ) {
    const fap = dummyFaps.find((element) => element.id === fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${fapId}`);
  }

  async assignMemberToFapProposals(
    proposalPk: number[],
    fapId: number,
    memberIds: number
  ) {
    const fap = dummyFaps.find((element) => element.id === fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${fapId}`);
  }

  async getFapProposalToNumReviewsNeededMap(fapId: number) {
    let fapProposalToNumReviewsNeededMap: Map<FapProposal, number>;
    switch (fapId) {
      case 4:
        fapProposalToNumReviewsNeededMap = dummyFapProposalToNoReviewsNeededMap;
        break;
      case 5:
        fapProposalToNumReviewsNeededMap = new Map(
          dummyFapProposalToNumReviewsNeededMapUneven
        );
        break;
      case 6:
        fapProposalToNumReviewsNeededMap = new Map(
          dummyFapProposalToNumReviewsNeededMapAlreadyAssigned
        );
        break;
      case 7:
        fapProposalToNumReviewsNeededMap = new Map(
          dummyFapProposalTwoReviewsNeeded
        );
        break;
      default:
        fapProposalToNumReviewsNeededMap = new Map(
          dummyFapProposalToNumReviewsNeededMap
        );
        break;
    }

    return fapProposalToNumReviewsNeededMap;
  }

  async removeMemberFromFapProposal(
    proposalPk: number,
    fapId: number,
    memberId: number
  ) {
    const fap = dummyFaps.find((element) => element.id === fapId);

    if (fap) {
      return fap;
    }

    throw new Error(`Fap not found ${fapId}`);
  }

  async saveFapMeetingDecision(
    saveFapMeetingDecisionInput: SaveFapMeetingDecisionInput,
    submittedBy?: number | null
  ): Promise<FapMeetingDecision> {
    return dummyFapMeetingDecision;
  }

  async getProposalsFapMeetingDecisions(
    proposalPks: number[]
  ): Promise<FapMeetingDecision[]> {
    return [dummyFapMeetingDecision];
  }

  async getFapProposalsWithReviewGradesAndRanking(
    proposalPks: number[]
  ): Promise<FapProposalWithReviewGradesAndRanking[]> {
    return [new FapProposalWithReviewGradesAndRanking(1, 1, [7])];
  }

  async getRelatedUsersOnFap(id: number): Promise<number[]> {
    return [];
  }

  async getCallInReviewForFap(fapId: number): Promise<number> {
    return 1;
  }
}
