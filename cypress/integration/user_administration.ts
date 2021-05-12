import faker from 'faker';

context('User administration tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1300, 1200);
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPrefferedName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.phoneNumber('0##########');
  const newTelephoneAlt = faker.phone.phoneNumber('0##########');

  it('should be able to verify email manually', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.get('input[aria-label=Search]').type('placeholder');

    cy.get("[title='Edit user']").first().click();

    cy.contains('Email not verified');

    cy.get('[data-cy=btn-verify-email]').click();

    cy.notification({ variant: 'success', text: 'Email verified' });

    cy.contains('Email not verified').should('not.exist');
  });

  it('should be able to remove the placeholder flag', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.get('input[aria-label=Search]').type('placeholder');

    cy.get("[title='Edit user']").first().click();

    cy.contains('Placeholder user');

    cy.get('[data-cy=btn-set-user-not-placeholder]').click();

    cy.notification({
      variant: 'success',
      text: 'User is no longer placeholder',
    });

    cy.contains('Placeholder user').should('not.exist');
  });

  it('Should be able administer user information', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.get("[title='Edit user']").first().click();

    cy.get("[name='firstname']").clear().type(newFirstName);

    cy.get("[name='middlename']").clear().type(newMiddleName);

    cy.get("[name='lastname']").clear().type(newLastName);

    cy.get("[name='preferredname']").clear().type(newPrefferedName);

    cy.get("[name='position']").clear().type(newPosition);

    cy.get("[name='department']").clear().type(newDepartment);

    cy.get("[name='telephone']").clear().type(newTelephone);

    cy.get("[name='telephone_alt']").clear().type(newTelephoneAlt);

    cy.contains('Update Profile').click();

    cy.notification({ variant: 'success', text: 'Updated Information' });

    cy.reload();

    cy.get("[name='firstname']").invoke('val').should('eq', newFirstName);

    cy.get("[name='middlename']").invoke('val').should('eq', newMiddleName);

    cy.get("[name='lastname']").invoke('val').should('eq', newLastName);

    cy.get("[name='preferredname']")
      .invoke('val')
      .should('eq', newPrefferedName);

    cy.get("[name='position']").invoke('val').should('eq', newPosition);

    cy.get("[name='department']").invoke('val').should('eq', newDepartment);

    cy.get("[name='telephone']").invoke('val').should('eq', newTelephone);
  });

  it('Should be able to delete user user information', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.get("[title='Delete']").first().click();

    cy.get("[title='Save']").first().click();

    cy.contains('1-5 of 5');
  });
});
