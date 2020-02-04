/// <reference types="Cypress" />
var faker = require("faker");

context("Personal information tests", () => {
  before(() => {
    //@ts-ignore
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(1100, 1100);
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPreferredName = faker.hacker.noun();
  const newPosition = faker.random.word();
  const newTelephone = faker.phone.phoneNumber();

  it("Should be able update personal information", () => {
    //@ts-ignore
    cy.login("user");

    cy.get("[data-cy='profile-page-btn']").click();

    cy.get("[name='firstname']")
      .clear()
      .type(newFirstName, { force: true });

    cy.get("[name='middlename']")
      .clear()
      .type(newMiddleName, { force: true });

    cy.get("[name='lastname']")
      .clear()
      .type(newLastName, { force: true });

    cy.get("[name='preferredname']")
      .clear()
      .type(newPreferredName, { force: true });

    cy.get("[name='position']")
      .clear()
      .type(newPosition, { force: true });

    cy.get("[name='department']")
      .clear()
      .type(newDepartment, { force: true });

    cy.get("[name='telephone']")
      .clear()
      .type(newTelephone, { force: true });

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
      .should("eq", newPreferredName);

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
