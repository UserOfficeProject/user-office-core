import jwtDecode from 'jwt-decode';

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
} from '../../src/generated/sdk';
import featureFlags from './featureFlags';
import initialDBData from './initialDBData';
import { getE2EApi } from './utils';

export type TestUserId = keyof typeof initialDBData.users;

type DecodedTokenData = {
  user: User;
  currentRole: Role;
  exp: number;
};

const tokenStoreStfc = new Map<TestUserId, string>([
  ['user1', 'user'],
  ['user2', 'user'],
  ['user3', 'user'],
  ['officer', 'officer'],
  ['placeholderUser', 'user'],
]);

const tokenStoreOAuth = new Map<TestUserId, string>([
  ['user1', initialDBData.users.user1.email],
  ['user2', initialDBData.users.user2.email],
  ['user3', initialDBData.users.user3.email],
  ['officer', initialDBData.users.officer.email],
  ['placeholderUser', initialDBData.users.placeholderUser.email],
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

    const { currentRole, user, exp } = jwtDecode(
      resp.selectRole.token
    ) as DecodedTokenData;

    window.localStorage.setItem('token', resp.selectRole.token);
    window.localStorage.setItem(
      'currentRole',
      currentRole.shortCode.toUpperCase()
    );
    window.localStorage.setItem('expToken', `${exp}`);
    window.localStorage.setItem('user', JSON.stringify(user));
  });

  cy.wrap(request);
}

const login = (
  idOrCredentials: TestUserId | { email: string; password: string }
): Cypress.Chainable<ExternalTokenLoginMutation> => {
  let testUserId: TestUserId;
  const isCredentials = typeof idOrCredentials !== 'string';
  if (isCredentials) {
    const credentials = idOrCredentials;
    testUserId = Object.keys(initialDBData.users).find(
      (key) =>
        initialDBData.users[key as TestUserId].email === credentials.email &&
        initialDBData.users[key as TestUserId].password === credentials.password
    ) as TestUserId;

    if (!testUserId) {
      throw new Error('Invalid credentials');
    }
  } else {
    testUserId = idOrCredentials as TestUserId;
  }
  const isOauth = featureFlags.getEnabledFeatures().get(FeatureId.OAUTH);

  const credentialStore = isOauth ? tokenStoreOAuth : tokenStoreStfc;
  const token = credentialStore.get(testUserId)!;

  const api = getE2EApi();
  const request = api
    .externalTokenLogin({
      externalToken: token,
      redirectUri: '',
    })
    .then((resp) => {
      if (!resp.externalTokenLogin.token) {
        return resp;
      }

      const { user, exp, currentRole } = jwtDecode(
        resp.externalTokenLogin.token
      ) as DecodedTokenData;

      window.localStorage.setItem('token', resp.externalTokenLogin.token);
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
