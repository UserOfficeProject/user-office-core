/// <reference types="Cypress" />
var faker = require("faker");

context("Page tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(2000);
  });

  const faqContents = faker.hacker.phrase();
  const ADMIN_EMAIL = "Aaron_Harris49@gmail.com";
  const ADMIN_PASS = "Test1234!";

  it("Should be able update FAQ", () => {
    cy.get("[data-cy=input-email] input")
      .type(ADMIN_EMAIL)
      .should("have.value", ADMIN_EMAIL);

    cy.get("[data-cy=input-password] input")
      .type(ADMIN_PASS)
      .should("have.value", ADMIN_PASS);

    cy.get("[data-cy=submit]").click();

    cy.contains("Edit Pages").click();

    cy.contains("Set user homepage");
    cy.contains("Set help page");
    cy.contains("Set privacy agreement");
    cy.contains("Set cookie policy");

    cy.window().then(win => {
      cy.wait(3000).then(() => {
        win.tinyMCE.editors[0].setContent(faqContents); // faq page editor
        cy.get("#help-update-btn").click({ force: true });
        cy.reload();
        cy.contains("View Proposals").click();
        cy.contains("FAQ").click();
        cy.contains(faqContents);
        cy.contains("Close").click();
        cy.contains("Logout").click();
      });
    });
  });
});
