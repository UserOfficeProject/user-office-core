import faker from 'faker';

import initialDBData from '../support/initialDBData';

context('User administration tests', () => {
  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPrefferedName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.phoneNumber('0##########');
  const newTelephoneAlt = faker.phone.phoneNumber('0##########');
  const newOrganisation = faker.company.companyName();
  const placeholderUser = initialDBData.users.placeholder;

  beforeEach(() => {
    cy.resetDB();

    cy.login('officer');
    cy.visit('/');
  });

  it('should be able to verify email manually', () => {
    cy.contains('People').click();

    cy.contains(placeholderUser.firstName)
      .parent()
      .find("[aria-label='Edit user']")
      .click();

    cy.contains('Email not verified');

    cy.get('[data-cy=btn-verify-email]').click();

    cy.notification({ variant: 'success', text: 'Email verified' });

    cy.contains('Email not verified').should('not.exist');

    cy.logout();

    cy.login('placeholderUser');
    cy.visit('/');

    cy.get('[data-cy="active-user-profile"]').click();

    cy.contains('Email not verified').should('not.exist');
    cy.contains('Placeholder').should('exist');
  });

  it('should be able to remove the placeholder flag', () => {
    cy.setUserEmailVerified({ id: placeholderUser.id });
    cy.contains('People').click();

    cy.get('input[aria-label=Search]').type('placeholder');

    cy.contains(placeholderUser.firstName)
      .parent()
      .find("[aria-label='Edit user']")
      .click();

    cy.contains('Placeholder user');

    cy.get('[data-cy=btn-set-user-not-placeholder]').click();

    cy.notification({
      variant: 'success',
      text: 'User is no longer placeholder',
    });

    cy.contains('Placeholder user').should('not.exist');

    cy.logout();

    cy.login('placeholderUser');
    cy.visit('/');

    cy.get('[data-cy="active-user-profile"]').click();

    cy.contains('Email not verified').should('not.exist');
    cy.contains('Placeholder user').should('not.exist');
  });

  it('Should be able administer user information', () => {
    cy.contains('People').click();

    cy.get("[aria-label='Edit user']").first().click();

    cy.get("[name='firstname']").clear().type(newFirstName);

    cy.get("[name='middlename']").clear().type(newMiddleName);

    cy.get("[name='lastname']").clear().type(newLastName);

    cy.get("[name='preferredname']").clear().type(newPrefferedName);

    cy.get("[name='position']").clear().type(newPosition);

    cy.get("[name='department']").clear().type(newDepartment);

    cy.get("[name='telephone']").clear().type(newTelephone);

    cy.get("[name='telephone_alt']").clear().type(newTelephoneAlt);

    cy.get("[name='otherOrganisation']").clear().type(newOrganisation);

    cy.get('[data-cy="organizationCountry"] input').click();
    cy.get('[data-cy="organizationCountry-options"]').first().click();

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

  it('Should be able to invite user or sep reviewer by email', () => {
    const userFirstName = faker.name.firstName();
    const userLastName = faker.name.lastName();
    const userEmail = faker.internet.email();
    const reviewerFirstName = faker.name.firstName();
    const reviewerLastName = faker.name.lastName();
    const reviewerEmail = faker.internet.email();
    cy.contains('People').click();

    cy.get('[data-cy="invite-user-button"]').click();

    cy.get('[data-cy="firstname"] input').clear().type(userFirstName);
    cy.get('[data-cy="lastname"] input').clear().type(userLastName);
    cy.get('[data-cy="email"] input').clear().type(userEmail);

    cy.get('[data-cy="invitation-submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Invitation sent successfully',
    });

    cy.get('[data-cy="co-proposers"]').contains(userFirstName);
    cy.get('[data-cy="co-proposers"]')
      .contains(userLastName)
      .parent()
      .find('[aria-label="Edit user"]')
      .click();

    cy.finishedLoading();

    cy.get('[name="email"]').should('have.value', userEmail);

    cy.get('[role="tablist"]').contains('Settings').click();

    cy.finishedLoading();

    cy.get('[data-cy="user-roles-table"] table tbody tr')
      .first()
      .contains('User');

    cy.contains('People').click();

    cy.get('[data-cy="invite-reviewer-button"]').click();

    cy.get('[data-cy="firstname"] input').clear().type(reviewerFirstName);
    cy.get('[data-cy="lastname"] input').clear().type(reviewerLastName);
    cy.get('[data-cy="email"] input').clear().type(reviewerEmail);

    cy.get('[data-cy="invitation-submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Invitation sent successfully',
    });

    cy.get('[data-cy="co-proposers"]').contains(reviewerFirstName);
    cy.get('[data-cy="co-proposers"]')
      .contains(reviewerLastName)
      .parent()
      .find('[aria-label="Edit user"]')
      .click();

    cy.finishedLoading();

    cy.get('[name="email"]').should('have.value', reviewerEmail);

    cy.get('[role="tablist"]').contains('Settings').click();

    cy.finishedLoading();

    cy.get('[data-cy="user-roles-table"] table tbody tr')
      .first()
      .contains('SEP Reviewer');
  });

  it('Should be able to delete user information', () => {
    cy.contains('People').click();
    cy.contains(placeholderUser.firstName)
      .parent()
      .find("[aria-label='Delete']")
      .click();

    cy.get("[data-cy=co-proposers] [aria-label='Save']").click();

    cy.notification({ variant: 'success', text: 'User removed successfully' });
  });

  it('Should be able to send email for password reset', () => {
    cy.logout();
    cy.visit('/SignIn');
    cy.contains('Forgot password?').click();

    cy.get('[data-cy="reset-password-email"] input').type(
      'Aaron_Harris49@gmail.com'
    );

    cy.get('[type="submit"]').click();

    cy.contains('A mail has been sent to the provided email.');

    cy.get('[data-cy="reset-password-email"] input')
      .clear()
      .type('test@test.com');

    cy.get('[type="submit"]').click();

    cy.contains('No account found for this email address.');
  });
});
