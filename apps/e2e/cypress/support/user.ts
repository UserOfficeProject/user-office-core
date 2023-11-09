import {
  CreateUserByEmailInviteMutation,
  CreateUserByEmailInviteMutationVariables,
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
  ['user2', 'externalUser'],
  ['user3', 'user'],
  ['officer', 'officer'],
  ['placeholderUser', 'user'],
  ['reviewer', 'user'],
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
    if (!resp.selectRole) {
      return;
    }

    const { currentRole, user, exp, isInternalUser } = jwtDecode(
      resp.selectRole
    ) as DecodedTokenData;

    window.localStorage.setItem('token', resp.selectRole);
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

const getCredentialsFromUserId = (testUserId: TestUserId) => {
  const user = initialDBData.users[testUserId];

  return {
    email: user.email,
    password: user.password,
  };
};

const selectRole = async (token: string, selectedRoleId: number) => {
  const api = getE2EApi();
  const response = await api.selectRole({
    token,
    selectedRoleId,
  });

  return response.selectRole;
};

const getOauthExternalToken = async (testUserId: TestUserId) => {
  const DEV_AUTH_SERVER_URL = Cypress.env('DEV_AUTH_SERVER_URL');
  const { email, password } = getCredentialsFromUserId(testUserId);
  const params = {
    login: email,
    password: password,
    scopes: 'openid email profile',
  };

  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  };

  return fetch(`${DEV_AUTH_SERVER_URL}/get-code`, options)
    .then((response) => response.json())
    .then((response) => {
      return response.code;
    });
};

const getExternalToken = async (testUserId: TestUserId) => {
  const isOauth = featureFlags.getEnabledFeatures().get(FeatureId.OAUTH);
  if (isOauth) {
    return getOauthExternalToken(testUserId);
  } else {
    return extTokenStoreStfc.get(testUserId)!;
  }
};

const login = (
  idOrCredentials: TestUserId | { email: string; password: string },
  role?: number
): Cypress.Chainable<ExternalTokenLoginMutation> => {
  const testUserId = getUserIdFromIdOrCredentials(idOrCredentials);
  const request = getExternalToken(testUserId).then(async (externalToken) => {
    const api = getE2EApi();

    return api
      .externalTokenLogin({
        externalToken: externalToken as string,
        redirectUri: 'http://localhost:3000/external-auth', // has to be set because it is a required field
      })
      .then(async (resp) => {
        let token = resp.externalTokenLogin;
        if (!token) {
          return resp;
        }
        if (role) {
          token = await selectRole(token, role);
        }

        const isOauth = featureFlags.getEnabledFeatures().get(FeatureId.OAUTH);
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

const createUserByEmailInvite = (
  createUserByEmailInviteInput: CreateUserByEmailInviteMutationVariables
): Cypress.Chainable<CreateUserByEmailInviteMutation> => {
  const api = getE2EApi();
  const request = api.createUserByEmailInvite(createUserByEmailInviteInput);

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
Cypress.Commands.add('createUserByEmailInvite', createUserByEmailInvite);

Cypress.Commands.add('updateUserRoles', updateUserRoles);
Cypress.Commands.add('updateUserDetails', updateUserDetails);
Cypress.Commands.add('setUserEmailVerified', setUserEmailVerified);

Cypress.Commands.add('changeActiveRole', changeActiveRole);
Cypress.Commands.add('getAndStoreFeaturesEnabled', getAndStoreFeaturesEnabled);
