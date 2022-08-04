import jwtDecode from 'jwt-decode';

import {
  CreateUserMutation,
  CreateUserMutationVariables,
  ExternalTokenLoginMutation,
  LoginMutation,
  Role,
  SetUserEmailVerifiedMutation,
  SetUserEmailVerifiedMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  UpdateUserRolesMutationVariables,
  User,
} from '../../src/generated/sdk';
import clearSession from '../../src/utils/clearSession';
import { getE2EApi } from './utils';

type DecodedTokenData = {
  user: User;
  currentRole: Role;
  exp: number;
};

const testCredentialStoreStfc = {
  user: {
    externalToken: 'user',
  },
  officer: {
    externalToken: 'officer',
  },
  user2: {
    externalToken: 'user',
  },
  placeholderUser: {
    externalToken: 'user',
  },
};

const testCredentialStore = {
  user: {
    email: 'Javon4@hotmail.com',
    password: 'Test1234!',
  },
  officer: {
    email: 'Aaron_Harris49@gmail.com',
    password: 'Test1234!',
  },
  user2: {
    email: 'ben@inbox.com',
    password: 'Test1234!',
  },
  placeholderUser: {
    email: 'unverified-user@example.com',
    password: 'Test1234!',
  },
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

const externalTokenLogin = (
  roleOrCredentials: 'user' | 'officer' | 'user2' | 'placeholderUser'
): Cypress.Chainable<LoginMutation | ExternalTokenLoginMutation> => {
  const credentials = testCredentialStoreStfc[roleOrCredentials];

  const api = getE2EApi();
  const request = api.externalTokenLogin(credentials).then((resp) => {
    if (!resp.externalTokenLogin.token) {
      return resp;
    }

    const { user, exp } = jwtDecode(
      resp.externalTokenLogin.token
    ) as DecodedTokenData;

    window.localStorage.setItem('token', resp.externalTokenLogin.token);
    window.localStorage.setItem(
      'currentRole',
      roleOrCredentials === 'officer' ? 'USER_OFFICER' : 'USER'
    );
    window.localStorage.setItem('expToken', `${exp}`);
    window.localStorage.setItem('user', JSON.stringify(user));

    return resp;
  });

  return cy.wrap(request);
};

const login = (
  roleOrCredentials:
    | 'user'
    | 'officer'
    | 'user2'
    | 'placeholderUser'
    | { email: string; password: string }
): Cypress.Chainable<LoginMutation | ExternalTokenLoginMutation> => {
  const credentials =
    typeof roleOrCredentials === 'string'
      ? testCredentialStore[roleOrCredentials]
      : roleOrCredentials;

  if (Cypress.env('STFC') === true) {
    if (typeof roleOrCredentials !== 'string') {
      throw new Error('Role not authorised to login');
    }

    return externalTokenLogin(roleOrCredentials).then(() =>
      changeActiveRole(roleOrCredentials === 'user' ? 1 : 2)
    );
  }

  const api = getE2EApi();
  const request = api.login(credentials).then((resp) => {
    if (!resp.login.token) {
      return resp;
    }

    const { currentRole, user, exp } = jwtDecode(
      resp.login.token
    ) as DecodedTokenData;

    window.localStorage.setItem('token', resp.login.token);
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
  clearSession();

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
Cypress.Commands.add('externalTokenLogin', externalTokenLogin);

Cypress.Commands.add('logout', logout);
Cypress.Commands.add('createUser', createUser);

Cypress.Commands.add('updateUserRoles', updateUserRoles);
Cypress.Commands.add('updateUserDetails', updateUserDetails);
Cypress.Commands.add('setUserEmailVerified', setUserEmailVerified);

Cypress.Commands.add('changeActiveRole', changeActiveRole);
