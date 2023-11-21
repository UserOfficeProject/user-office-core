import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('User administration tests', () => {
  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const newPrefferedName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.number('0##########');
  const newTelephoneAlt = faker.phone.number('0##########');
  const newOrganisation = faker.company.name();
  const placeholderUser = initialDBData.users.placeholderUser;

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
    });

    cy.login('officer');
    cy.visit('/');
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

  it('Should be able to invite user or fap reviewer by email', () => {
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
      .contains('FAP Reviewer');
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
});
