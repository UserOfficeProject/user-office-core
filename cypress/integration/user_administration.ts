/// <reference types="Cypress" />
var faker = require("faker");

context("User administration tests", () => {
  before(() => {
    //@ts-ignore
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 900);
    cy.visit("/");
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPrefferedName = faker.hacker.noun();
  const newPosition = faker.random.word().split(" ")[0];
  const newTelephone = faker.phone.phoneNumber();

  it("Should be able administer user information", () => {
    //@ts-ignore
    cy.login("officer");

    cy.contains("View People").click();

    cy.get("[title='Edit user']")
      .first()
      .click();

    cy.get("[name='firstname']")
      .clear()
      .type(newFirstName);

    cy.get("[name='middlename']")
      .clear()
      .type(newMiddleName);

    cy.get("[name='lastname']")
      .clear()
      .type(newLastName);

    cy.get("[name='preferredname']")
      .clear()
      .type(newPrefferedName);

    cy.get("[name='position']")
      .clear()
      .type(newPosition);

    cy.get("[name='department']")
      .clear()
      .type(newDepartment);

    cy.get("[name='telephone']")
      .clear()
      .type(newTelephone);

    cy.contains("Update Profile").click();

    cy.reload();

    cy.get("[name='firstname']")
      .invoke("val")
      .should("eq", newFirstName);

    cy.get("[name='middlename']")
      .invoke("val")
      .should("eq", newMiddleName);

    cy.get("[name='lastname']")
      .invoke("val")
      .should("eq", newLastName);

    cy.get("[name='preferredname']")
      .invoke("val")
      .should("eq", newPrefferedName);

    cy.get("[name='position']")
      .invoke("val")
      .should("eq", newPosition);

    cy.get("[name='department']")
      .invoke("val")
      .should("eq", newDepartment);

    cy.get("[name='telephone']")
      .invoke("val")
      .should("eq", newTelephone);
  });
});
