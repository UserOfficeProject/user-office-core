import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
  dummySEPWithoutCode,
} from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserOfficerWithRole,
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
    ).resolves.toHaveProperty('reason', 'BAD_REQUEST');
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
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_CHAIR,
          userIDs: [1],
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign Chair to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_CHAIR,
          userIDs: [1],
        },
      }
    )) as Rejection;

    return expect(result).toStrictEqual(dummySEP);
  });

  test('A userofficer can assign Secretary to SEP', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.SEP_SECRETARY,
          userIDs: [2],
        },
      }
    )) as Rejection;

    return expect(result).toStrictEqual(dummySEP);
  });

  test('A userofficer can not assign other roles using `assignChairOrSecretaryToSEP`', async () => {
    const result = (await SEPMutationsInstance.assignChairOrSecretaryToSEP(
      dummyUserOfficerWithRole,
      {
        addSEPMembersRole: {
          SEPID: 1,
          roleID: UserRole.USER_OFFICER,
          userIDs: [2],
        },
      }
    )) as Rejection;

    return expect(result.reason).toBe('BAD_REQUEST');
  });

  test('A user can not assign members to SEP', async () => {
    const result = (await SEPMutationsInstance.assignMemberToSEP(
      dummyUserWithRole,
      {
        memberIds: [1],
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign members to SEP', () => {
    return expect(
      SEPMutationsInstance.assignMemberToSEP(dummyUserOfficerWithRole, {
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
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove member from SEP', () => {
    return expect(
      SEPMutationsInstance.removeMemberFromSEP(dummyUserOfficerWithRole, {
        memberId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign proposal to SEP', async () => {
    const result = (await SEPMutationsInstance.assignProposalToSEP(
      dummyUserWithRole,
      {
        proposalId: 1,
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign proposal to SEP', () => {
    return expect(
      SEPMutationsInstance.assignProposalToSEP(dummyUserOfficerWithRole, {
        proposalId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not remove proposal from SEP', async () => {
    const result = (await SEPMutationsInstance.removeProposalAssignment(
      dummyUserWithRole,
      {
        proposalId: 1,
        sepId: 1,
      }
    )) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can remove proposal from SEP', () => {
    return expect(
      SEPMutationsInstance.removeProposalAssignment(dummyUserOfficerWithRole, {
        proposalId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A user can not assign SEP member to proposal', async () => {
    const result = (await SEPMutationsInstance.assignMemberToSEPProposal(
      dummyUserWithRole,
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
      SEPMutationsInstance.assignMemberToSEPProposal(dummyUserOfficerWithRole, {
        proposalId: 1,
        sepId: 1,
        memberId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });
});
