import 'reflect-metadata';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
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
});
