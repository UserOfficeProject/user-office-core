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

import { request } from "graphql-request";

Cypress.Commands.add("resetDB", () => {
  const query = `mutation {
    prepareDB {
      isSuccess
      error
    }
  }`;
  request("http://localhost:3000/graphql", query).then(data =>
    console.log(data)
  );
});

Cypress.Commands.add("login", role => {
  const testCredentialStore = {
    user: {
      email: "Javon4@hotmail.com",
      password: "Test1234!"
    },
    officer: {
      email: "Aaron_Harris49@gmail.com",
      password: "Test1234!"
    }
  };

  const credentials = testCredentialStore[role];

  cy.visit("localhost:3000");

  cy.get("[data-cy=input-email] input")
    .type(credentials.email)
    .should("have.value", credentials.email);

  cy.get("[data-cy=input-password] input")
    .type(credentials.password)
    .should("have.value", credentials.password);

  cy.get("[data-cy=submit]").click();
});

// call cy.presentationMode(); before your test to have delay between clicks.
// Excelent for presentation purposes
Cypress.Commands.add("presentationMode", () => {
  const COMMAND_DELAY = 300;

  for (const command of [
    "visit",
    "click",
    "trigger",
    "type",
    "clear",
    "reload",
    "contains"
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
