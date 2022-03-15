import 'reflect-metadata';

import { container } from 'tsyringe';

import {
  anotherDummySEP,
  dummySEP,
  dummySEPWithoutCode,
} from '../datasources/mockups/SEPDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalPksWithNextStatus } from '../models/Proposal';
import { Rejection } from '../models/Rejection';
import { UserRole } from '../models/User';
import SEPMutations from './SEPMutations';

const SEPMutationsInstance = container.resolve(SEPMutations);

describe('Test SEPMutations', () => {
  test('A user cannot create SEP', async () => {
    const result = (await SEPMutationsInstance.create(
      dummyUserWithRole,
      dummySEP
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can create SEP', () => {
    return expect(
      SEPMutationsInstance.create(dummyUserOfficerWithRole, anotherDummySEP)
    ).resolves.toStrictEqual(anotherDummySEP);
  });

  test('A userofficer can not create SEP with bad input arguments', () => {
    return expect(
      SEPMutationsInstance.create(dummyUserOfficerWithRole, dummySEPWithoutCode)
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A user cannot update SEP', async () => {
    const result = (await SEPMutationsInstance.update(
      dummyUserWithRole,
      dummySEP
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update SEP', () => {
    return expect(
      SEPMutationsInstance.update(dummyUserOfficerWithRole, dummySEP)
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign Chair to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.SEP_CHAIR,
          userId: 1,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('Officer can assign Chair to SEP if the user has SEP Reviewer role', async () => {
    const result = await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.SEP_CHAIR,
          userId: 1001,
        },
      }
    );

    return expect(result).toStrictEqual(dummySEP);
  });

  test('Officer can assign Secretary to SEP if the user has SEP Reviewer role', async () => {
    const result = await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.SEP_SECRETARY,
          userId: 1001,
        },
      }
    );

    return expect(result).toStrictEqual(dummySEP);
  });

  test('Officer can not assign Chair to SEP if the user has no SEP Reviewer role', async () => {
    const result = await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.SEP_CHAIR,
          userId: 1,
        },
      }
    );

    return expect((result as Rejection).reason).toBe(
      'Can not assign to SEP, because only users with sep reviewer role can be chair or secretary'
    );
  });

  test('Officer can not assign Secretary to SEP if the user has no SEP Reviewer role', async () => {
    const result = await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.SEP_SECRETARY,
          userId: 1,
        },
      }
    );

    return expect((result as Rejection).reason).toBe(
      'Can not assign to SEP, because only users with sep reviewer role can be chair or secretary'
    );
  });

  test('A userofficer can not assign other roles using `assignChairOrSecretaryToSEP`', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        assignChairOrSecretaryToSEPInput: {
          sepId: 1,
          roleId: UserRole.USER_OFFICER,
          userId: 2,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('Input validation errors');
  });

  test('A user can not assign reviewers to SEP', async () => {
    const result = (await SEPMutationsInstance.assignReviewersToSEP(
      dummyUserWithRole,
      {
        memberIds: [1],
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign reviewers to SEP', () => {
    return expect(
      SEPMutationsInstance.assignReviewersToSEP(dummyUserOfficerWithRole, {
        memberIds: [1],
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not remove member from SEP', async () => {
    const result = (await SEPMutationsInstance.removeMemberFromSEP(
      dummyUserWithRole,
      {
        memberId: 1,
        sepId: 1,
        roleId: UserRole.SEP_CHAIR,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove member from SEP', () => {
    return expect(
      SEPMutationsInstance.removeMemberFromSEP(dummyUserOfficerWithRole, {
        memberId: 2,
        sepId: 1,
        roleId: UserRole.SEP_CHAIR,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign proposal to SEP', async () => {
    const result = (await SEPMutationsInstance.assignProposalsToSep(
      dummyUserWithRole,
      {
        proposals: [{ primaryKey: 1, callId: 1 }],
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign proposal to SEP', () => {
    return expect(
      SEPMutationsInstance.assignProposalsToSep(dummyUserOfficerWithRole, {
        proposals: [{ primaryKey: 1, callId: 1 }],
        sepId: 1,
      })
    ).resolves.toStrictEqual(
      new ProposalPksWithNextStatus([1], 5, 'SEP_REVIEW', 'SEP Review')
    );
  });

  test('A user can not remove proposal from SEP', async () => {
    const result = (await SEPMutationsInstance.removeProposalsFromSep(
      dummyUserWithRole,
      {
        proposalPks: [1],
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove proposal from SEP', () => {
    return expect(
      SEPMutationsInstance.removeProposalsFromSep(dummyUserOfficerWithRole, {
        proposalPks: [1],
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign SEP member to proposal', async () => {
    const result = (await SEPMutationsInstance.assignSepReviewersToProposal(
      dummyUserWithRole,
      {
        proposalPk: 1,
        sepId: 1,
        memberIds: [1],
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign SEP member to proposal', () => {
    return expect(
      SEPMutationsInstance.assignSepReviewersToProposal(
        dummyUserOfficerWithRole,
        {
          proposalPk: 1,
          sepId: 1,
          memberIds: [1],
        }
      )
    ).resolves.toStrictEqual(dummySEP);
  });
});
