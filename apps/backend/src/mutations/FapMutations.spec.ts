import 'reflect-metadata';

import { container } from 'tsyringe';

import {
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
      FapMutationsInstance.assignProposalsToFaps(dummyUserOfficerWithRole, {
        proposals: [{ primaryKey: 1, callId: 1 }],
        fapIds: [1],
        fapInstrumentIds: [1],
      })
    ).resolves.toStrictEqual(new ProposalPks([1]));
  });

  test('A user can not remove proposal from Fap', async () => {
    const result = (await FapMutationsInstance.removeProposalsFromFaps(
      dummyUserWithRole,
      {
        proposalPks: [1],
        fapIds: [1],
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove proposal from Fap', () => {
    return expect(
      FapMutationsInstance.removeProposalsFromFaps(dummyUserOfficerWithRole, {
        proposalPks: [1],
        fapIds: [1],
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
});
