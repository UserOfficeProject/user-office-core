import 'reflect-metadata';

import { container } from 'tsyringe';

import {
  FapDataSourceMock,
  anotherDummyFap,
  dummyFap,
  dummyFapWithoutCode,
} from '../datasources/mockups/FapDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalPks } from '../models/Proposal';
import { Rejection } from '../models/Rejection';
import { UserRole } from '../models/User';
import FapMutations from './FapMutations';

const FapMutationsInstance = container.resolve(FapMutations);

describe('Test FapMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('A user cannot create Fap', async () => {
    const result = (await FapMutationsInstance.create(
      dummyUserWithRole,
      dummyFap
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can create Fap', () => {
    return expect(
      FapMutationsInstance.create(dummyUserOfficerWithRole, anotherDummyFap)
    ).resolves.toStrictEqual(anotherDummyFap);
  });

  test('A userofficer can not create Fap with bad input arguments', () => {
    return expect(
      FapMutationsInstance.create(dummyUserOfficerWithRole, dummyFapWithoutCode)
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A user cannot update Fap', async () => {
    const result = (await FapMutationsInstance.update(
      dummyUserWithRole,
      dummyFap
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update Fap', () => {
    return expect(
      FapMutationsInstance.update(dummyUserOfficerWithRole, dummyFap)
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A user can not assign Chair to Fap', async () => {
    const result = (await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.FAP_CHAIR,
          userId: 1,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('Officer can assign Chair to Fap if the user has Fap Reviewer role', async () => {
    const result = await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.FAP_CHAIR,
          userId: 1001,
        },
      }
    );

    return expect(result).toStrictEqual(dummyFap);
  });

  test('Officer can assign Secretary to Fap if the user has Fap Reviewer role', async () => {
    const result = await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.FAP_SECRETARY,
          userId: 1001,
        },
      }
    );

    return expect(result).toStrictEqual(dummyFap);
  });

  test('Officer can not assign Chair to Fap if the user has no Fap Reviewer role', async () => {
    const result = await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.FAP_CHAIR,
          userId: 1,
        },
      }
    );

    return expect((result as Rejection).reason).toBe(
      'Can not assign to Fap, because only users with fap reviewer role can be chair or secretary'
    );
  });

  test('Officer can not assign Secretary to Fap if the user has no Fap Reviewer role', async () => {
    const result = await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.FAP_SECRETARY,
          userId: 1,
        },
      }
    );

    return expect((result as Rejection).reason).toBe(
      'Can not assign to Fap, because only users with fap reviewer role can be chair or secretary'
    );
  });

  test('A userofficer can not assign other roles using `assignChairOrSecretaryToFap`', async () => {
    const result = (await FapMutationsInstance.assignChairOrSecretaryToFap(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToFapInput: {
          fapId: 1,
          roleId: UserRole.USER_OFFICER,
          userId: 2,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('Input validation errors');
  });

  test('A user can not assign reviewers to Fap', async () => {
    const result = (await FapMutationsInstance.assignReviewersToFap(
      dummyUserWithRole,
      {
        memberIds: [1],
        fapId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign reviewers to Fap', () => {
    return expect(
      FapMutationsInstance.assignReviewersToFap(dummyUserOfficerWithRole, {
        memberIds: [1],
        fapId: 1,
      })
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A user can not remove member from Fap', async () => {
    const result = (await FapMutationsInstance.removeMemberFromFap(
      dummyUserWithRole,
      {
        memberId: 1,
        fapId: 1,
        roleId: UserRole.FAP_CHAIR,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove member from Fap', () => {
    return expect(
      FapMutationsInstance.removeMemberFromFap(dummyUserOfficerWithRole, {
        memberId: 2,
        fapId: 1,
        roleId: UserRole.FAP_CHAIR,
      })
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A userofficer can assign proposal to Fap', () => {
    return expect(
      FapMutationsInstance.assignProposalsToFap(dummyUserOfficerWithRole, {
        proposals: [{ primaryKey: 1, callId: 1 }],
        fapId: 1,
      })
    ).resolves.toStrictEqual(new ProposalPks([1]));
  });

  test('A user can not remove proposal from Fap', async () => {
    const result = (await FapMutationsInstance.removeProposalsFromFap(
      dummyUserWithRole,
      {
        proposalPks: [1],
        fapId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove proposal from Fap', () => {
    return expect(
      FapMutationsInstance.removeProposalsFromFap(dummyUserOfficerWithRole, {
        proposalPks: [1],
        fapId: 1,
      })
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A user can not assign Fap member to proposal', async () => {
    const result = (await FapMutationsInstance.assignFapReviewersToProposal(
      dummyUserWithRole,
      {
        proposalPk: 1,
        fapId: 1,
        memberIds: [1],
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign Fap member to proposal', () => {
    return expect(
      FapMutationsInstance.assignFapReviewersToProposal(
        dummyUserOfficerWithRole,
        {
          proposalPk: 1,
          fapId: 1,
          memberIds: [1],
        }
      )
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A user can not assign proposals to Fap member', async () => {
    const result = (await FapMutationsInstance.assignFapReviewerToProposals(
      dummyUserWithRole,
      {
        proposalPks: [1],
        fapId: 1,
        memberId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign proposals to Fap member', async () => {
    return expect(
      FapMutationsInstance.assignFapReviewerToProposals(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1],
          fapId: 1,
          memberId: 1,
        }
      )
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A userofficer can assign proposals to Fap members', () => {
    return expect(
      FapMutationsInstance.assignFapReviewerToProposals(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1],
          fapId: 1,
          memberId: 1,
        }
      )
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A user can not mass assign proposals to Fap members', async () => {
    const result = (await FapMutationsInstance.massAssignReviews(
      dummyUserWithRole,
      {
        fapId: 1,
        callId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can mass assign proposals to Fap members', () => {
    return expect(
      FapMutationsInstance.massAssignReviews(dummyUserOfficerWithRole, {
        fapId: 1,
        callId: 1,
      })
    ).resolves.toStrictEqual(dummyFap);
  });

  test('Proposals are evenly assigned to Fap members', async () => {
    const mockAssignMemberToFapProposals = jest.spyOn(
      FapDataSourceMock.prototype,
      'assignMemberToFapProposals'
    );

    await FapMutationsInstance.massAssignReviews(dummyUserOfficerWithRole, {
      fapId: 3,
      callId: 1,
    });
    expect(mockAssignMemberToFapProposals.mock.calls.length).toBe(2);

    expect(mockAssignMemberToFapProposals.mock.calls[0]).toEqual([[1], 3, 1]);
    expect(mockAssignMemberToFapProposals.mock.calls[1]).toEqual([[2], 3, 4]);
  });

  test('No proposals are assigned to Fap members when there are none to assign', async () => {
    const mockAssignMemberToFapProposals = jest.spyOn(
      FapDataSourceMock.prototype,
      'assignMemberToFapProposals'
    );

    await FapMutationsInstance.massAssignReviews(dummyUserOfficerWithRole, {
      fapId: 4,
      callId: 1,
    });

    expect(mockAssignMemberToFapProposals.mock.calls.length).toBe(0);
  });

  test('Proposals are evenly assigned to Fap members who aready have assignments', async () => {
    const mockAssignMemberToFapProposals = jest.spyOn(
      FapDataSourceMock.prototype,
      'assignMemberToFapProposals'
    );

    await FapMutationsInstance.massAssignReviews(dummyUserOfficerWithRole, {
      fapId: 5,
      callId: 1,
    });

    expect(mockAssignMemberToFapProposals.mock.calls.length).toBe(2);
    expect(mockAssignMemberToFapProposals.mock.calls[0]).toEqual([[1], 5, 5]);
    expect(mockAssignMemberToFapProposals.mock.calls[1]).toEqual([
      [2, 3],
      5,
      6,
    ]);
  });

  test('Proposals are not assigned to Fap members they are already assigned to', async () => {
    const mockAssignMemberToFapProposals = jest.spyOn(
      FapDataSourceMock.prototype,
      'assignMemberToFapProposals'
    );

    await FapMutationsInstance.massAssignReviews(dummyUserOfficerWithRole, {
      fapId: 6,
      callId: 1,
    });

    expect(mockAssignMemberToFapProposals.mock.calls.length).toBe(2);
    expect(mockAssignMemberToFapProposals.mock.calls[0]).toEqual([[2], 6, 7]);
    expect(mockAssignMemberToFapProposals.mock.calls[1]).toEqual([
      [1, 3],
      6,
      8,
    ]);
  });
});
