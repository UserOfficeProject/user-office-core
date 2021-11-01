import { GraphQLClient } from 'graphql-request';
import { decode } from 'jsonwebtoken';

function addScientistRoleToUser(name) {
  cy.get('[aria-label="Search"]').type(name);

  cy.finishedLoading();

  cy.contains(name).parent().find('button[title="Edit user"]').click();

  cy.get('main').contains('Settings').click();

  cy.get('[data-cy="add-role-button"]').should('not.be.disabled').click();

  cy.finishedLoading();

  cy.get('[data-cy="role-modal"] [aria-label="Search"]').type(
    'Instrument Scientist'
  );

  cy.get('[data-cy="role-modal"]')
    .contains('Instrument Scientist')
    .parent()
    .find('input[type="checkbox"]')
    .click();

  cy.get('[data-cy="role-modal"]').contains('Update').click();

  cy.notification({ variant: 'success', text: 'successfully' });
}

function changeActiveRole(role) {
  cy.get('[data-cy="profile-page-btn"]').click();
  cy.get('[role="presentation"]').contains('Roles').click();

  cy.finishedLoading();

  cy.get("[data-cy='role-selection-table'] table tbody")
    .contains(role)
    .parent()
    .contains('Use')
    .click();

  cy.notification({ variant: 'success', text: 'User role changed' });
}

const login = (roleOrCredentials) => {
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

  const credentials =
    typeof roleOrCredentials === 'string'
      ? testCredentialStore[roleOrCredentials]
      : roleOrCredentials;

  const query = `mutation {
    login(
      email: "${credentials.email}",
      password: "${credentials.password}"
    ) {
      rejection {
        reason
      }
      token
    }
  }`;

  const request = new GraphQLClient('/gateway')
    .rawRequest(query, null)
    .then((resp) => {
      const { currentRole, user, exp } = decode(resp.data.login.token);

      window.localStorage.setItem('token', resp.data.login.token);
      window.localStorage.setItem(
        'currentRole',
        currentRole.shortCode.toUpperCase()
      );
      window.localStorage.setItem('expToken', exp);
      window.localStorage.setItem('user', JSON.stringify(user));
    });

  cy.wrap(request);

  cy.visit('/');
};

const logout = () => {
  cy.get('[data-cy=profile-page-btn]').click();

  cy.get('[data-cy=logout]').click();
};

Cypress.Commands.add('addScientistRoleToUser', addScientistRoleToUser);

Cypress.Commands.add('changeActiveRole', changeActiveRole);

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);
