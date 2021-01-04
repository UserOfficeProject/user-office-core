// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import faker from 'faker';
import { GraphQLClient } from 'graphql-request';

const KEY_CODES = {
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

const resetDB = () => {
  const query = `mutation {
    prepareDB {
      log
      error
    }
  }`;
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
  new GraphQLClient('/graphql', { headers: { authorization: authHeader } })
    .rawRequest(query, null)
    .then(data => console.log(data));
};

const navigateToTemplatesSubmenu = submenuName => {
  cy.contains('Templates').click();
  cy.get(`[title='${submenuName}']`)
    .first()
    .click();
};

const login = role => {
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

  const credentials = testCredentialStore[role];

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

const notification = ({ variant, text }) => {
  let notificationQuerySelector = '';
  let bgColor = '';

  switch (variant) {
    case 'error':
      notificationQuerySelector = '.snackbar-error [role="alert"]';
      bgColor = 'rgb(211, 47, 47)';
      break;

    default:
      notificationQuerySelector = '.snackbar-success [role="alert"]';
      bgColor = 'rgb(67, 160, 71)';
      break;
  }
  let notification = cy
    .get(notificationQuerySelector)
    .should('exist')
    .and('have.css', 'background-color', bgColor);

  if (text) {
    notification.and('contains.text', text);
  }
};

const finishedLoading = () => {
  cy.get('[role="progressbar"]').should('not.exist');
};

const createProposal = (proposalTitle = '', proposalAbstract = '') => {
  const title = proposalTitle || faker.random.words(3);
  const abstract = proposalAbstract || faker.random.words(8);

  cy.contains('New Proposal').click();

  cy.get('[data-cy=title] input')
    .type(title)
    .should('have.value', title);

  cy.get('[data-cy=abstract] textarea')
    .first()
    .type(abstract)
    .should('have.value', abstract);

  cy.contains('Save and continue').click();
};

const dragElement = (element, moveArgs) => {
  const focusedElement = cy.get(element).focus();

  focusedElement.trigger('keydown', { keyCode: KEY_CODES.space });

  moveArgs.forEach(({ direction, length }) => {
    for (let i = 1; i <= length; i++) {
      focusedElement.trigger('keydown', {
        keyCode: KEY_CODES[direction],
        force: true,
      });
    }
  });

  focusedElement.trigger('keydown', { keyCode: KEY_CODES.space, force: true });

  return element;
};

Cypress.Commands.add('resetDB', resetDB);

Cypress.Commands.add('navigateToTemplatesSubmenu', navigateToTemplatesSubmenu);

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);

Cypress.Commands.add('notification', notification);

Cypress.Commands.add('finishedLoading', finishedLoading);

Cypress.Commands.add('createProposal', createProposal);
Cypress.Commands.add(
  'dragElement',
  { prevSubject: 'element' },
  (element, args) => {
    dragElement(element, args);
  }
);

// call cy.presentationMode(); before your test to have delay between clicks.
// Excellent for presentation purposes
Cypress.Commands.add('presentationMode', () => {
  const COMMAND_DELAY = 300;

  for (const command of [
    'visit',
    'click',
    'trigger',
    'type',
    'clear',
    'reload',
    'contains',
  ]) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
      const origVal = originalFn(...args);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(origVal);
        }, COMMAND_DELAY);
      });
    });
  }
});
