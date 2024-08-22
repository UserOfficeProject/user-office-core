import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';
import featureFlags from 'cypress/support/featureFlags';

import initialDBData from '../support/initialDBData';

context('Xpress tests', () => {
  const technique1 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique2 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique3 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  // const scientist2 = initialDBData.users.user2;
  // const scientist3 = initialDBData.users.user3;
  // const scientist4 = initialDBData.users.placeholderUser;
  // const scientist5 = initialDBData.users.reviewer;

  // const instrument1 = {
  //   name: faker.word.words(1),
  //   shortCode: faker.string.alphanumeric(15),
  //   description: faker.word.words(5),
  //   managerUserId: scientist1.id,
  // };

  // const instrument2 = {
  //   name: faker.word.words(1),
  //   shortCode: faker.string.alphanumeric(15),
  //   description: faker.word.words(5),
  //   managerUserId: scientist2.id,
  // };

  // const instrument3 = {
  //   name: faker.word.words(1),
  //   shortCode: faker.string.alphanumeric(15),
  //   description: faker.word.words(5),
  //   managerUserId: scientist3.id,
  // };

  const proposalWorkflow = {
    name: faker.word.words(1),
    description: faker.word.words(5),
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.createTechnique(technique1).then((result) => {
      cy.assignScientistsToTechnique({
        scientistIds: [scientist1.id],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique2).then((result) => {
      cy.assignScientistsToTechnique({
        scientistIds: [scientist1.id],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique3).then((result) => {
      cy.assignScientistsToTechnique({
        scientistIds: [scientist1.id],
        techniqueId: result.createTechnique.id,
      });
    });
  });

  it('User should not be able to see Xpress page', () => {
    if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
      this.skip();
    }

    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Xpress');
  });

  it('Xpress proposals can be filtered by date', function () {
    return true;
  });

  it('Xpress proposals can be filtered by technique', function () {
    return true;
  });

  it('Xpress proposals can be filtered by instrument', function () {
    return true;
  });

  describe('Techniques advanced tests', () => {
    beforeEach(() => {
      cy.resetDB();
      cy.getAndStoreFeaturesEnabled();

      cy.login('officer');
      cy.visit('/');

      cy.createTechnique(technique1).then((result) => {
        cy.assignScientistsToTechnique({
          scientistIds: [scientist1.id],
          techniqueId: result.createTechnique.id,
        });
      });
      cy.createTechnique(technique2).then((result) => {
        cy.assignScientistsToTechnique({
          scientistIds: [scientist1.id],
          techniqueId: result.createTechnique.id,
        });
      });
      cy.createTechnique(technique3).then((result) => {
        cy.assignScientistsToTechnique({
          scientistIds: [scientist1.id],
          techniqueId: result.createTechnique.id,
        });
      });
    });

    it('User officer can see all submitted and unsubmitted Xpress proposals', function () {
      return true;
    });

    it('Instrument scientist can only see submitted and unsubmitted Xpress proposals for their techniques', function () {
      return true;
    });
  });
});
