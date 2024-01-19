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
  const title = faker.lorem.words(2);
  const abstract = faker.lorem.words(3);

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.login('officer');
    cy.visit('/');
  });

  it('Should be able administer user information', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      this.skip();
    }
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

  it('Should be able to invite user or fap reviewer by email', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      this.skip();
    }
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

  it('Should be able to delete user information', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      this.skip();
    }
    cy.contains('People').click();
    cy.contains(placeholderUser.firstName)
      .parent()
      .find("[aria-label='Delete']")
      .click();

    cy.get("[data-cy=co-proposers] [aria-label='Save']").click();

    cy.notification({ variant: 'success', text: 'User removed successfully' });
  });
  it('User should be able to have and a preferred name', function () {
    if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      cy.updateUserDetails({
        id: 4,
        user_title: 'Mr.',
        firstname: 'Benjamin',
        lastname: 'Beckley',
        preferredname: 'Ben',
        gender: 'male',
        nationality: 1,
        birthdate: new Date('2000/04/02'),
        organisation: 1,
        department: 'IT deparment',
        position: 'Management',
        email: 'ben@inbox.com',
        telephone: '(288) 221-4533',
        organizationCountry: 1,
      });
    }
    cy.login('user2', initialDBData.roles.user);
    cy.visit('/');
    cy.contains('New Proposal').click();
    cy.get('[data-cy=call-list]').find('li:first-child').click();

    cy.get('[data-cy=principal-investigator] input').should(
      'contain.value',
      'Ben '
    );

    cy.get('[data-cy=title] input').type(title).should('have.value', title);

    cy.get('[data-cy=abstract] textarea')
      .first()
      .type(abstract)
      .should('have.value', abstract);

    cy.contains('Save and continue').click();

    cy.finishedLoading();
    cy.notification({ variant: 'success', text: 'Saved' });

    cy.contains('Dashboard').click();
    cy.contains(title).parent().find('[aria-label="Edit proposal"]').click();
    cy.contains('Ben ');

    cy.login('officer');
    cy.visit('/');
    cy.contains('Proposals').click();
    cy.contains(title).parent().find('[aria-label="View proposal"]').click();
    cy.contains('Ben ');
  });

  it('User should be able to not have a preferred name', function () {
    if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      cy.updateUserDetails({
        id: 6,
        user_title: 'Mr.',
        firstname: 'David',
        lastname: 'Dawson',
        preferredname: '',
        gender: 'male',
        nationality: 1,
        birthdate: new Date('1995/04/01'),
        organisation: 1,
        department: 'Maxillofacial surgeon',
        position: 'Management',
        email: 'david@teleworm.us',
        telephone: '(288) 221-4533',
        organizationCountry: 1,
      });
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.contains('New Proposal').click();
    cy.get('[data-cy=call-list]').find('li:first-child').click();
    cy.get('[data-cy=principal-investigator] input').should(
      'contain.value',
      'David '
    );
  });
});
