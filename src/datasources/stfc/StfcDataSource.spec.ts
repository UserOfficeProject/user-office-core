import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { StfcDataSource } from './StfcDataSource';

jest.mock('./UOWSSoapInterface');

const dataSource = new StfcDataSource();
const dummyUserNumber = 12345;
const userRoleDbId = 0;
const userOfficerRoleDbId = 2;
const instrumentScientistRoleDbId = 7;

test('When getting roles for a user, the User role is the first role in the list', async () => {
  const roles = await dataSource.getUserRoles(dummyUserNumber);

  return expect(roles[0]).toEqual(
    expect.objectContaining(new Role(userRoleDbId, Roles.USER, 'User'))
  );
});

test('When getting roles for a user, STFC roles are translated into ESS roles', async () => {
  return expect(dataSource.getUserRoles(dummyUserNumber)).resolves.toEqual([
    new Role(userRoleDbId, Roles.USER, 'User'),
    new Role(
      instrumentScientistRoleDbId,
      Roles.INSTRUMENT_SCIENTIST,
      'Instrument Scientist'
    ),
    new Role(userOfficerRoleDbId, Roles.USER_OFFICER, 'User Officer'),
  ]);
});
