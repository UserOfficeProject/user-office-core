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
import { GraphQLClient } from 'graphql-request';
const resetDB = () => {
  const query = `mutation {
    prepareDB {
      log
      error
    }
  }`;
  const svc_acc_token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjowLCJ1c2VyX3RpdGxlIjoiTXIuIiwiZmlyc3RuYW1lIjoiU2VydmljZSBBY2NvdW50IiwibWlkZGxlbmFtZSI6IiIsImxhc3RuYW1lIjoiIiwidXNlcm5hbWUiOiJzZXJ2aWNlIiwicHJlZmVycmVkbmFtZSI6IiIsIm9yY2lkIjoiIiwicmVmcmVzaFRva2VuIjoiIiwiZ2VuZGVyIjoibWFsZSIsIm5hdGlvbmFsaXR5IjoxLCJiaXJ0aGRhdGUiOiIyMDAwLTA0LTAxVDIyOjAwOjAwLjAwMFoiLCJvcmdhbmlzYXRpb24iOjEsImRlcGFydG1lbnQiOiIiLCJwb3NpdGlvbiI6IiIsImVtYWlsIjoic2VydmljZUB1c2Vyb2ZmaWNlLmVzcy5ldSIsImVtYWlsVmVyaWZpZWQiOnRydWUsInRlbGVwaG9uZSI6IiIsInRlbGVwaG9uZV9hbHQiOiIiLCJwbGFjZWhvbGRlciI6ZmFsc2UsImNyZWF0ZWQiOiIyMDIwLTA4LTEwVDE2OjQwOjAyLjk1NloiLCJ1cGRhdGVkIjoiMjAyMC0wOC0xMFQxNjo0MDowMy4yNjhaIn0sInJvbGVzIjpbeyJpZCI6Miwic2hvcnRDb2RlIjoidXNlcl9vZmZpY2VyIiwidGl0bGUiOiJVc2VyIE9mZmljZXIifV0sImN1cnJlbnRSb2xlIjp7ImlkIjoyLCJzaG9ydENvZGUiOiJ1c2VyX29mZmljZXIiLCJ0aXRsZSI6IlVzZXIgT2ZmaWNlciJ9LCJpYXQiOjE1OTcwNzc3NjF9.y_coY649frw5dgl549tGjirF99nqwz1-BrUAILhE6pI';
  const authHeader = `Bearer ${svc_acc_token}`;
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

Cypress.Commands.add('resetDB', resetDB);

Cypress.Commands.add('navigateToTemplatesSubmenu', navigateToTemplatesSubmenu);

Cypress.Commands.add('login', login);

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
