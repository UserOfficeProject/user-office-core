/// <reference types="Cypress" />
/// <reference types="../types" />

context('Personal information tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1100);
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPreferredName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.phoneNumber('0##########');

  it('Should be able update personal information', () => {
    cy.login('user');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.contains('Profile').click();

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
      .type(newPreferredName);

    cy.get("[name='position']")
      .clear()
      .type(newPosition);

    cy.get("[name='department']")
      .clear()
      .type(newDepartment);

    cy.get("[name='telephone']")
      .clear()
      .type(newTelephone);

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
      .should('eq', newPreferredName);

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

  it('User Officer should be able to see all and change roles if we have multiple', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.wait(1000);

    cy.get('[data-cy="people-table"] table tbody tr')
      .eq(1)
      .find('[title="Edit user"]')
      .click();

    const mainContentElement = cy.get('main');
    mainContentElement.contains('Settings').click();

    cy.wait(1000);

    cy.get('[data-cy="add-role-button"]').click();

    cy.get('[data-cy="role-modal"]')
      .contains('SEP Chair')
      .parent()
      .find('input[type="checkbox"]')
      .click();

    cy.contains('Update').click();

    cy.wait(1000);

    cy.get("[data-cy='profile-page-btn']").click();

    cy.get('.MuiPopover-root .MuiMenuItem-root')
      .contains('Roles')
      .click();

    cy.wait(1000);

    cy.contains('User roles');

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .should(element => {
        expect(element.text()).to.contain('SEP Chair');
        expect(element.text()).to.contain('Use');
      });

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .contains('Use')
      .click();

    cy.wait(1000);

    cy.contains('Proposals to review');

    cy.get('[data-cy="SEPRoles-menu-items"]')
      .find('.MuiListItem-root')
      .should('have.length', 2);
  });

  it('Should be able to see user officer role in use', () => {
    cy.login('officer');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.contains('Roles').click();

    cy.wait(1000);

    cy.contains('User roles');

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .first()
      .should(element => {
        expect(element.text()).to.contain('User Officer');

        expect(element.text()).to.contain('In Use');
      });
  });
});
