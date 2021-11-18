import { decode } from 'jsonwebtoken';

import {
  CreateUserMutation,
  CreateUserMutationVariables,
  LoginMutation,
  Role,
  SelectRoleMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  UpdateUserRolesMutationVariables,
  User,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

type DecodedTokenData = {
  user: User;
  currentRole: Role;
  exp: number;
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

const login = (
  roleOrCredentials:
    | 'user'
    | 'officer'
    | 'user2'
    | 'placeholderUser'
    | { email: string; password: string }
): Cypress.Chainable<LoginMutation> => {
  const credentials =
    typeof roleOrCredentials === 'string'
      ? testCredentialStore[roleOrCredentials]
      : roleOrCredentials;

  const api = getE2EApi();
  const request = api.login(credentials).then((resp) => {
    if (!resp.login.token) {
      return resp;
    }

    const { currentRole, user, exp } = decode(
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
  cy.get('[data-cy=profile-page-btn]').click();

  cy.get('[data-cy=logout]').click();
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

function updateUserRoles(
  updateUserRolesInput: UpdateUserRolesMutationVariables
) {
  const api = getE2EApi();
  const request = api.updateUserRoles(updateUserRolesInput);

  cy.wrap(request);
  // cy.get('[aria-label="Search"]').type(name);

  // cy.finishedLoading();

  // cy.contains(name).parent().find('button[title="Edit user"]').click();

  // cy.get('main').contains('Settings').click();

  // cy.get('[data-cy="add-role-button"]').should('not.be.disabled').click();

  // cy.finishedLoading();

  // cy.get('[data-cy="role-modal"] [aria-label="Search"]').type(
  //   'Instrument Scientist'
  // );

  // cy.get('[data-cy="role-modal"]')
  //   .contains('Instrument Scientist')
  //   .parent()
  //   .find('input[type="checkbox"]')
  //   .click();

  // cy.get('[data-cy="role-modal"]').contains('Update').click();

  // cy.notification({ variant: 'success', text: 'successfully' });
}

function changeActiveRole(selectRoleInput: SelectRoleMutationVariables) {
  const api = getE2EApi();
  const request = api.selectRole(selectRoleInput).then((resp) => {
    if (!resp.selectRole.token) {
      return;
    }

    const { currentRole, user, exp } = decode(
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
  // cy.get('[data-cy="profile-page-btn"]').click();
  // cy.get('[role="presentation"]').contains('Roles').click();

  // cy.finishedLoading();

  // cy.get("[data-cy='role-selection-table'] table tbody")
  //   .contains(role)
  //   .parent()
  //   .contains('Use')
  //   .click();

  // cy.notification({ variant: 'success', text: 'User role changed' });
}

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);
Cypress.Commands.add('createUser', createUser);

Cypress.Commands.add('updateUserRoles', updateUserRoles);
Cypress.Commands.add('updateUserDetails', updateUserDetails);

Cypress.Commands.add('changeActiveRole', changeActiveRole);
