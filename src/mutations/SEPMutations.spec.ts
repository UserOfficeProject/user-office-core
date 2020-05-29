import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
  dummySEPWithoutCode,
} from '../datasources/mockups/SEPDataSource';
import {
  dummyUser,
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { UserRole } from '../models/User';
import { Rejection } from '../rejection';
import { UserAuthorization } from '../utils/UserAuthorization';
import SEPMutations from './SEPMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const dummySEPDataSource = new SEPDataSourceMock();
const SEPMutationsInstance = new SEPMutations(
  dummySEPDataSource,
  userAuthorization
);

describe('Test SEPMutations', () => {
  test('A user cannot create SEP', async () => {
    const result = (await SEPMutationsInstance.create(
      dummyUser,
      dummySEP
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can create SEP', () => {
    return expect(
      SEPMutationsInstance.create(dummyUserOfficer, anotherDummySEP)
    ).resolves.toStrictEqual(anotherDummySEP);
  });

  test('A userofficer can not create SEP with bad input arguments', () => {
    return expect(
      SEPMutationsInstance.create(dummyUserOfficer, dummySEPWithoutCode)
    ).resolves.toHaveProperty('reason', 'BAD_REQUEST');
  });

  test('A user cannot update SEP', async () => {
    const result = (await SEPMutationsInstance.update(
      dummyUser,
      dummySEP
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can update SEP', () => {
    return expect(
      SEPMutationsInstance.update(dummyUserOfficer, dummySEP)
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign Chair to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUser,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_CHAIR,
          userID: 1,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign Chair to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficer,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_CHAIR,
          userID: 1,
        },
      }
    )) as Rejection;

    return expect(result).toStrictEqual(dummySEP);
  });

  test('A userofficer can assign Secretary to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficer,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_SECRETARY,
          userID: 2,
        },
      }
    )) as Rejection;

    return expect(result).toStrictEqual(dummySEP);
  });

  test('A userofficer can not assign other roles using `assignChairOrSecretaryToSEP`', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficer,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.USEROFFICER,
          userID: 2,
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('BAD_REQUEST');
  });

  test('A user can not assign members to SEP', async () => {
    const result = (await SEPMutationsInstance.assignMemberToSEP(dummyUser, {
      memberId: 1,
      sepId: 1,
    })) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign members to SEP', () => {
    return expect(
      SEPMutationsInstance.assignMemberToSEP(dummyUserOfficer, {
        memberId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not remove member from SEP', async () => {
    const result = (await SEPMutationsInstance.removeMemberFromSEP(dummyUser, {
      memberId: 1,
      sepId: 1,
    })) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove member from SEP', () => {
    return expect(
      SEPMutationsInstance.removeMemberFromSEP(dummyUserOfficer, {
        memberId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign proposal to SEP', async () => {
    const result = (await SEPMutationsInstance.assignProposalToSEP(dummyUser, {
      proposalId: 1,
      sepId: 1,
    })) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign proposal to SEP', () => {
    return expect(
      SEPMutationsInstance.assignProposalToSEP(dummyUserOfficer, {
        proposalId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not remove proposal from SEP', async () => {
    const result = (await SEPMutationsInstance.removeProposalAssignment(
      dummyUser,
      {
        proposalId: 1,
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove proposal from SEP', () => {
    return expect(
      SEPMutationsInstance.removeProposalAssignment(dummyUserOfficer, {
        proposalId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign SEP member to proposal', async () => {
    const result = (await SEPMutationsInstance.assignMemberToSEPProposal(
      dummyUser,
      {
        proposalId: 1,
        sepId: 1,
        memberId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign SEP member to proposal', () => {
    return expect(
      SEPMutationsInstance.assignMemberToSEPProposal(dummyUserOfficer, {
        proposalId: 1,
        sepId: 1,
        memberId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });
});
