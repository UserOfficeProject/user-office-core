/// <reference types="Cypress" />
/// <reference types="../types" />

context('User administration tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 900);
    cy.visit('/');
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPrefferedName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.phoneNumber('0##########');
  const newTelephoneAlt = faker.phone.phoneNumber('0##########');

  it('Should be able administer user information', () => {
    cy.login('officer');

    cy.contains('View People').click();

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

    cy.get("[name='telephone_alt']")
      .clear()
      .type(newTelephoneAlt);

    cy.contains('Update Profile').click();

    cy.wait(1000);

    cy.reload();

    cy.get("[name='firstname']")
      .invoke('val')
      .should('eq', newFirstName);

    cy.get("[name='middlename']")
      .invoke('val')
      .should('eq', newMiddleName);

    cy.get("[name='lastname']")
      .invoke('val')
      .should('eq', newLastName);

    cy.get("[name='preferredname']")
      .invoke('val')
      .should('eq', newPrefferedName);

    cy.get("[name='position']")
      .invoke('val')
      .should('eq', newPosition);

    cy.get("[name='department']")
      .invoke('val')
      .should('eq', newDepartment);

    cy.get("[name='telephone']")
      .invoke('val')
      .should('eq', newTelephone);
  });

  it('Should be able to delete user user information', () => {
    cy.login('officer');

    cy.contains('View People').click();

    cy.get("[title='Delete']")
      .first()
      .click();

    cy.get("[title='Save']")
      .first()
      .click();

    cy.contains('1-2 of 2');
  });
});
