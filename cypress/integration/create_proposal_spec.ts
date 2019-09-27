/// <reference types="Cypress" />
var faker = require("faker")

context("Proposaltests", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

const title = faker.random.words(3);
const abstract = faker.random.words(8);
const fasta = faker.random.words(1);
const amino = faker.random.words(1);

  it("User should be able to create proposal", () => {
    cy.get("[data-cy=input-username] input")
      .type("testuser")
      .should("have.value", "testuser");

    cy.get("[data-cy=input-password] input")
      .type("Test1234!")
      .should("have.value", "Test1234!");

    cy.get("[data-cy=submit]").click();

    cy.contains("New Proposal").click();

    cy.get("#title")
    .type(title);

    cy.get("#abstract")
    .type(abstract);

    cy.contains("Save and continue").click();

    cy.get("#has_crystallization").click();

    cy.get("#crystallization_molecule_name")
    .type(fasta, {force:true});

    cy.get("#amino_seq")
    .type(amino, {force:true});

    cy.contains("Save and continue").click();
    cy.contains("Save and continue").click();
    cy.contains("Save and continue").click();
    cy.contains("Save and continue").click();
    
    cy.get("#title").should('have.value', title)
    cy.get("#abstract").should('have.value', abstract)
    cy.contains(fasta);
    cy.contains(amino);
  });
});
