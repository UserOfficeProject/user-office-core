import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  SEPDataSourceMock,
  dummySEP,
  anotherDummySEP,
} from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventBus } from '../events/eventBus';
import { Rejection } from '../rejection';
import { UserAuthorization } from '../utils/UserAuthorization';
import SEPMutations from './SEPMutations';

const dummySEPDataSource = new SEPDataSourceMock();
const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const SEPMutationsInstance = new SEPMutations(
  dummySEPDataSource,
  userAuthorization,
  dummyEventBus
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
