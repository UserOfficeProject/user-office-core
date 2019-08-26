/// <reference types="Cypress" />

context(
  "A user should be able to login and submit a proposal and then logout",
  () => {
    beforeEach(() => {
      cy.visit("localhost:3000");
    });
    it(".type() - type into a DOM element", () => {
     cy.get('[data-cy=input-username] input')
        .type("testuser")
        .should("have.value", "testuser");

      cy.get('[data-cy=input-password] input')
        .type("Test1234!")
        .should("have.value", "Test1234!");

      cy.get('[data-cy=submit]').click()

      cy.contains("Your proposals");

      cy.contains("New Proposal").click();

      cy.get("input")
        .eq(0)
        .type("This is my prop")
        .should("have.value", "This is my prop");

      cy.get("input")
        .eq(1)
        .type("This is a abstract for my proposal")
        .should("have.value", "This is a abstract for my proposal");

      cy.contains("Next").click();

      cy.get(".MTableToolbar-actions-877").click();

      cy.contains("testuser");

      cy.get("td")
        .eq(2)
        .click();

      cy.contains("Next").click();

      cy.contains("Submit").click();

      cy.contains("Dashboard").click();

      cy.contains("Title of my prop");

      cy.contains("Logout").click();

      cy.contains("Sign in");
    });
  }
);
