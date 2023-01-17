import {
  CreateUserMutation,
  CreateUserMutationVariables,
  ExternalTokenLoginMutation,
  FeatureId,
  GetFeaturesQuery,
  Role,
  SetUserEmailVerifiedMutation,
  SetUserEmailVerifiedMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  UpdateUserRolesMutationVariables,
  User,
} from '@user-office-software-libs/shared-types';
import jwtDecode from 'jwt-decode';

import featureFlags from './featureFlags';
import initialDBData from './initialDBData';
import { getE2EApi } from './utils';

export type TestUserId = keyof typeof initialDBData.users;

type DecodedTokenData = {
  user: User;
  currentRole: Role;
  exp: number;
  isInternalUser: boolean;
};

const extTokenStoreStfc = new Map<TestUserId, string>([
  ['user1', 'user'],
  ['user2', 'user'],
  ['user3', 'user'],
  ['officer', 'officer'],
  ['placeholderUser', 'user'],
  ['reviewer', 'user'],
]);

const { user1, user2, user3, officer, placeholderUser, reviewer } =
  initialDBData.users;
const extTokenStoreOAuth = new Map<TestUserId, string>([
  ['user1', user1.email],
  ['user2', user2.email],
  ['user3', user3.email],
  ['officer', officer.email],
  ['placeholderUser', placeholderUser.email],
  ['reviewer', reviewer.email],
]);

const getAndStoreFeaturesEnabled = (): Cypress.Chainable<GetFeaturesQuery> => {
  const api = getE2EApi();
  const request = api.getFeatures().then((resp) => {
    const enabledFeatures = resp.features.filter((feat) => feat.isEnabled);
    window.localStorage.setItem(
      'enabledFeatures',
      JSON.stringify(enabledFeatures)
    );

    return resp;
  });

  return cy.wrap(request);
};

function changeActiveRole(selectedRoleId: number) {
  const token = window.localStorage.getItem('token');

  if (!token) {
    throw new Error('No logged in user');
  }

  const api = getE2EApi();
  const request = api.selectRole({ selectedRoleId, token }).then((resp) => {
    if (!resp.selectRole.token) {
      return;
    }

    const { currentRole, user, exp, isInternalUser } = jwtDecode(
      resp.selectRole.token
    ) as DecodedTokenData;

    window.localStorage.setItem('token', resp.selectRole.token);
    window.localStorage.setItem(
      'currentRole',
      currentRole.shortCode.toUpperCase()
    );
    window.localStorage.setItem('expToken', `${exp}`);
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.isInternalUser = isInternalUser;
  });

  cy.wrap(request);
}

const getUserIdFromIdOrCredentials = (
  idOrCredentials: TestUserId | { email: string; password: string }
) => {
  const isCredentials = typeof idOrCredentials !== 'string';
  if (isCredentials) {
    const credentials = idOrCredentials;

    const testUserId = Object.keys(initialDBData.users).find(
      (key) =>
        initialDBData.users[key as TestUserId].email === credentials.email &&
        initialDBData.users[key as TestUserId].password === credentials.password
    ) as TestUserId;

    if (!testUserId) {
      throw new Error(
        `initialDBData object has no credentials for ${idOrCredentials.email}`
      );
    }

    return testUserId;
  } else {
    return idOrCredentials as TestUserId;
  }
};

const selectRole = async (token: string, selectedRoleId: number) => {
  const api = getE2EApi();
  const response = await api.selectRole({
    token,
    selectedRoleId,
  });
  if (!response.selectRole.token) {
    throw new Error(
      `Error while selecting role, ${response.selectRole.rejection?.reason}`
    );
  }

  return response.selectRole.token;
};

const login = (
  idOrCredentials: TestUserId | { email: string; password: string },
  role?: number
): Cypress.Chainable<ExternalTokenLoginMutation> => {
  const testUserId = getUserIdFromIdOrCredentials(idOrCredentials);

  const isOauth = featureFlags.getEnabledFeatures().get(FeatureId.OAUTH);

  const extTokenStore = isOauth ? extTokenStoreOAuth : extTokenStoreStfc;
  const externalToken = extTokenStore.get(testUserId)!;

  const api = getE2EApi();
  const request = api
    .externalTokenLogin({
      externalToken,
      redirectUri: '',
    })
    .then(async (resp) => {
      let token = resp.externalTokenLogin.token;

      if (!token) {
        return resp;
      }

      if (role) {
        token = await selectRole(token, role);
      }

      if (!isOauth && !role && testUserId === 'officer') {
        token = await selectRole(token, 2); // It appears that the officer user in UOWS has 2 roles, once the second role is removed this can be removed
      }

      const { user, exp, currentRole } = jwtDecode(token) as DecodedTokenData;

      window.localStorage.setItem('token', token);
      window.localStorage.setItem(
        'currentRole',
        currentRole.shortCode.toUpperCase()
      );

      window.localStorage.setItem('expToken', `${exp}`);
      window.localStorage.setItem('user', JSON.stringify(user));

      return resp;
    });

  return cy.wrap(request);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('expToken');
  localStorage.removeItem('impersonatingUserId');

  cy.visit('/');
};

const createUser = (
  createUserInput: CreateUserMutationVariables
): Cypress.Chainable<CreateUserMutation> => {
  const api = getE2EApi();
  const request = api.createUser(createUserInput);

  return cy.wrap(request);
};

function updateUserDetails(
  updateUserInput: UpdateUserMutationVariables
): Cypress.Chainable<UpdateUserMutation> {
  const api = getE2EApi();
  const request = api.updateUser(updateUserInput);

  return cy.wrap(request);
}

function setUserEmailVerified(
  setUserEmailVerifiedInput: SetUserEmailVerifiedMutationVariables
): Cypress.Chainable<SetUserEmailVerifiedMutation> {
  const api = getE2EApi();
  const request = api.setUserEmailVerified(setUserEmailVerifiedInput);

  return cy.wrap(request);
}

function updateUserRoles(
  updateUserRolesInput: UpdateUserRolesMutationVariables
) {
  const api = getE2EApi();
  const request = api.updateUserRoles(updateUserRolesInput);

  cy.wrap(request);
}

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);
Cypress.Commands.add('createUser', createUser);

Cypress.Commands.add('updateUserRoles', updateUserRoles);
Cypress.Commands.add('updateUserDetails', updateUserDetails);
Cypress.Commands.add('setUserEmailVerified', setUserEmailVerified);

Cypress.Commands.add('changeActiveRole', changeActiveRole);
Cypress.Commands.add('getAndStoreFeaturesEnabled', getAndStoreFeaturesEnabled);
