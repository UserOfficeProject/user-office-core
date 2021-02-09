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
  const request = new GraphQLClient('/graphql', {
    headers: { authorization: authHeader },
  }).rawRequest(query, null);

  cy.wrap(request);
};

const navigateToTemplatesSubmenu = submenuName => {
  cy.contains('Templates').click();
  cy.get(`[title='${submenuName}']`)
    .first()
    .click();
};

const login = roleOrCredentials => {
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
    if (text instanceof RegExp) {
      notification.and($el => expect($el.text()).to.match(text));
    } else {
      notification.and('contains.text', text);
    }
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

  cy.notification({ variant: 'success', text: 'Saved' });
};

const createTopic = title => {
  cy.get('[data-cy=show-more-button]').click();

  cy.get('[data-cy=add-topic-menu-item]').click();

  cy.get('[data-cy=topic-title]')
    .last()
    .click();

  cy.get('[data-cy=topic-title-input]')
    .last()
    .clear()
    .type(`${title}{enter}`);
};

function createTemplate(type, title, description) {
  const templateTitle = title || faker.random.words(2);
  const templateDescription = description || faker.random.words(3);

  const typeToMenuTitle = new Map();
  typeToMenuTitle.set('proposal', 'Proposal templates');
  typeToMenuTitle.set('sample', 'Sample declaration templates');
  typeToMenuTitle.set('shipment', 'Shipment declaration templates');

  const menuTitle = typeToMenuTitle.get(type);
  if (!menuTitle) {
    throw new Error(`Type ${type} not supported`);
  }

  cy.navigateToTemplatesSubmenu(menuTitle);

  cy.get('[data-cy=create-new-button]').click();

  cy.get('[data-cy=name] input')
    .type(templateTitle)
    .should('have.value', templateTitle);

  cy.get('[data-cy=description]').type(templateDescription);

  cy.get('[data-cy=submit]').click();
}

const dragElement = (element, moveArgs) => {
  const focusedElement = cy.get(element);

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

const createSampleQuestion = (
  question,
  templateName,
  minEntries,
  maxEntries
) => {
  cy.get('[data-cy=show-more-button]')
    .last()
    .click();

  cy.get('[data-cy=add-question-menu-item]')
    .last()
    .click();

  cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

  cy.contains('Add Sample Declaration').click();

  cy.get('[data-cy=question]')
    .clear()
    .type(question)
    .should('have.value', question);

  cy.get('[data-cy=template-id]').click();

  cy.contains(templateName).click();

  if (minEntries) {
    cy.get('[data-cy=min-entries] input')
      .clear()
      .type(minEntries);
  }

  if (maxEntries) {
    cy.get('[data-cy=max-entries] input')
      .clear()
      .type(maxEntries);
  }

  cy.contains('Save').click();
};

function changeActiveRole(role) {
  cy.get('[data-cy="profile-page-btn"]').click();
  cy.contains('Roles').click();

  cy.finishedLoading();

  cy.get("[data-cy='role-selection-table'] table tbody")
    .contains(role)
    .parent()
    .contains('Use')
    .click();

  cy.notification({ variant: 'success', text: 'User role changed' });
}

Cypress.Commands.add('resetDB', resetDB);

Cypress.Commands.add('navigateToTemplatesSubmenu', navigateToTemplatesSubmenu);

Cypress.Commands.add('login', login);

Cypress.Commands.add('logout', logout);

Cypress.Commands.add('notification', notification);

Cypress.Commands.add('finishedLoading', finishedLoading);

Cypress.Commands.add('createTemplate', createTemplate);

Cypress.Commands.add('createProposal', createProposal);
Cypress.Commands.add(
  'dragElement',
  { prevSubject: 'element' },
  (element, args) => {
    dragElement(element, args);
  }
);

Cypress.Commands.add('createTopic', createTopic);

Cypress.Commands.add('createSampleQuestion', createSampleQuestion);

Cypress.Commands.add('changeActiveRole', changeActiveRole);

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
