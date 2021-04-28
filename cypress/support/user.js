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
  };

  const credentials =
    typeof roleOrCredentials === 'string'
      ? testCredentialStore[roleOrCredentials]
      : roleOrCredentials;

  cy.visit('/');

  cy.get('[data-cy=input-email] input')
    .type(credentials.email)
    .should('have.value', credentials.email);

  cy.get('[data-cy=input-password] input')
    .type(credentials.password)
    .should('have.value', credentials.password);

  cy.get('[data-cy=submit]').click();
};

const logout = () => {
  cy.get('[data-cy=profile-page-btn]').click();

  cy.get('[data-cy=logout]').click();
};

Cypress.Commands.add('addScientistRoleToUser', addScientistRoleToUser);

Cypress.Commands.add('changeActiveRole', changeActiveRole);

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);
