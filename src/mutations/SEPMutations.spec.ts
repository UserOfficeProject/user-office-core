import 'reflect-metadata';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
  dummySEPWithoutCode,
} from '../datasources/mockups/SEPDataSource';
import {
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { Rejection } from '../rejection';
import SEPMutations from './SEPMutations';

const dummySEPDataSource = new SEPDataSourceMock();
const SEPMutationsInstance = new SEPMutations(dummySEPDataSource);

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

  test('A user can not assign members to SEP', async () => {
    const result = (await SEPMutationsInstance.assignMember(dummyUser, {
      memberId: 1,
      sepId: 1,
    })) as Rejection;

    return expect(result.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });

  test('A userofficer can assign members to SEP', () => {
    return expect(
      SEPMutationsInstance.assignMember(dummyUserOfficer, {
        memberId: 1,
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A userofficer can assign chair and secretary to SEP', () => {
    return expect(
      SEPMutationsInstance.assignChairAndSecretary(dummyUserOfficer, {
        memberIds: [1, 2],
        sepId: 1,
      })
    ).resolves.toStrictEqual(dummySEP);
  });
});
