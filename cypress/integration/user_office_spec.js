/// <reference types="Cypress" />
const faker = require("faker");

context("User Officer tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  const shortCode = faker.commerce.color();
  const startDate = faker.date
    .past()
    .toISOString()
    .slice(0, 10);

  const endDate = faker.date
    .future()
    .toISOString()
    .slice(0, 10);

  it("A user-officer should be able to add a call", () => {
    cy.get("[data-cy=input-email] input")
      .type("Aaron_Harris49@gmail.com")
      .should("have.value", "Aaron_Harris49@gmail.com");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("Proposals");

    cy.contains("View Calls").click();

    cy.get("[data-cy=add-call]").click();

    cy.get("[data-cy=short-code] input")
      .type(shortCode)
      .should("have.value", shortCode);

    cy.get("[data-cy=start-date] input").clear();
    cy.get("[data-cy=start-date] input")
      .type(startDate)
      .should("have.value", startDate);

    cy.get("[data-cy=end-date] input").clear();
    cy.get("[data-cy=end-date] input")
      .type(endDate)
      .should("have.value", endDate);

    cy.get("[data-cy=survey-comment] input").type(faker.random.word());

    cy.get("[data-cy=cycle-comment] input").type(faker.random.word());

    cy.get("[data-cy=submit]").click();

    cy.contains(shortCode);
  });
});
