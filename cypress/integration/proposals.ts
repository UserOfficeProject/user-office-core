/// <reference types="Cypress" />
var faker = require("faker");
context("Proposaltests", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
    // slowExecutionMode();
  });

  afterEach(() => {
    //cy.wait(2000);
  });

  var textId;
  var boolId;
  var dateId;
  const textQuestion = faker.random.words(5);
  const booleanQuestion = faker.random.words(4);
  const dateQuestion = faker.random.words(1);

  const title = faker.random.words(3);
  const abstract = faker.random.words(8);
  const textAnswer = faker.random.words(5);

  it("Should be able to modify proposal", () => {
    cy.viewport(1100, 800);

    cy.get("[data-cy=input-email] input")
      .type("Aaron_Harris49@gmail.com")
      .should("have.value", "Aaron_Harris49@gmail.com");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("Edit Questionary").click();

    cy.contains("Add topic").click();

    cy.get("[data-cy=topic-title]").click();

    cy.get("[data-cy=topic-title-input]")
      .clear()
      .type("E2E testing{enter}");

    /* Text input */
    cy.get("[data-cy=show-more-button]").click();

    cy.contains("Add Text input").click();

    cy.get("[data-cy=question]")
      .clear()
      .type(textQuestion);

    cy.contains("Is required").click();

    cy.contains("Save").click();

    cy.contains(textQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke("html")
      .then(fieldId => {
        textId = fieldId;
      });

    /* Select from options */
    cy.get("[data-cy=show-more-button]").click();

    cy.contains("Add Boolean").click();

    cy.get("[data-cy=question]")
      .clear()
      .type(booleanQuestion);

    cy.contains("Save").click();

    cy.contains(booleanQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke("html")
      .then(fieldId => {
        boolId = fieldId;
      });
    /* --- */

    /* Date */
    cy.get("[data-cy=show-more-button]").click();

    cy.contains("Add Date").click();

    cy.get("[data-cy=question]")
      .clear()
      .type(dateQuestion);

    cy.contains("Is required").click();

    cy.contains("Save").click();

    cy.contains(dateQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke("html")
      .then(fieldId => {
        dateId = fieldId;
      });
    /* --- */

    cy.contains(textQuestion);
    cy.contains(booleanQuestion);
    cy.contains(dateQuestion);
  });

  it("User should be able to create proposal", () => {
    cy.viewport(1100, 1000);

    cy.get("[data-cy=input-email] input")
      .type("Javon4@hotmail.com")
      .should("have.value", "Javon4@hotmail.com");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("New Proposal").click();

    cy.get("#title").type(title);

    cy.get("#abstract").type(abstract);

    cy.get("[data-cy=co-proposers] button")
      .first()
      .click();
    cy.get("[title='Add Participants']")
      .first()
      .click();

    cy.contains("Save and continue").click();
    cy.get(`#${textId}`).type(textAnswer);
    cy.get(`#${boolId}`).click();
    cy.get(`[data-cy='${dateId}_field'] button`).click();
    cy.wait(300);
    cy.get(`[data-cy='${dateId}_field'] button`).click({ force: true }); // click twice because ui hangs sometime
    cy.contains("15").click();
    cy.contains("OK").click();

    cy.contains("Save and continue").click();

    cy.contains("Submit").click();

    cy.contains("OK").click();

    cy.contains(title);
    cy.contains(abstract);
    cy.contains(textAnswer);

    cy.contains("Dashboard").click();
    cy.contains(title);
    cy.contains("Submitted");
  });

  it("Office should be able to delete proposal", () => {
    cy.viewport(1100, 1000);

    cy.get("[data-cy=input-email] input")
      .type("Aaron_Harris49@gmail.com")
      .should("have.value", "Aaron_Harris49@gmail.com");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("View Proposals").click();

    cy.get("[title=Delete]")
      .first()
      .click();
    cy.get("[title=Save]")
      .first()
      .click();
  });

  it("Office should be able to delete proposal questions", () => {
    cy.viewport(1100, 1000);

    cy.get("[data-cy=input-email] input")
      .type("Aaron_Harris49@gmail.com")
      .should("have.value", "Aaron_Harris49@gmail.com");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("Edit Questionary").click();

    cy.contains(textQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.contains(booleanQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.contains(dateQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.get("[data-cy=show-more-button]").click();
    cy.contains("Delete topic").click();
  });
});

function slowExecutionMode() {
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
}
