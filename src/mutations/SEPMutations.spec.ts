import 'reflect-metadata';
import { InstrumentDataSourceMock } from '../datasources/mockups/InstrumentDataSource';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { ProposalSettingsDataSourceMock } from '../datasources/mockups/ProposalSettingsDataSource';
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
import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { UserRole } from '../models/User';
import { Rejection } from '../rejection';
import { UserAuthorization } from '../utils/UserAuthorization';
import SEPMutations from './SEPMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);
const dummySEPDataSource = new SEPDataSourceMock();
const dummyInstrumentDataSource = new InstrumentDataSourceMock();
const dummyUserDataSource = new UserDataSourceMock();
const dummyProposalSettingsDataSource = new ProposalSettingsDataSourceMock();
const dummyProposalDataSource = new ProposalDataSourceMock();
const SEPMutationsInstance = new SEPMutations(
  dummySEPDataSource,
  dummyInstrumentDataSource,
  userAuthorization,
  dummyUserDataSource,
  dummyProposalSettingsDataSource,
  dummyProposalDataSource
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

    return expect((result as Rejection).reason).toBe('NOT_ALLOWED');
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

    return expect((result as Rejection).reason).toBe('NOT_ALLOWED');
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

    return expect(result.reason).toBe('BAD_REQUEST');
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
        memberId: 1,
        sepId: 1,
        roleId: UserRole.SEP_CHAIR,
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
    ).resolves.toStrictEqual(
      new ProposalIdsWithNextStatus([1], 5, 'SEP_REVIEW', 'SEP Review')
    );
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
    const result = (await SEPMutationsInstance.assignSepReviewersToProposal(
      dummyUserWithRole,
      {
        proposalId: 1,
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
          proposalId: 1,
          sepId: 1,
          memberIds: [1],
        }
      )
    ).resolves.toStrictEqual(dummySEP);
  });
});
