import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const tagName = faker.word.words(2);
const tagShortCode = faker.word.words(1);

const scientist1 = initialDBData.users.user1;

const instrument1 = {
  name: faker.word.words(2),
  shortCode: faker.word.words(1),
  description: faker.word.words(5),
  managerUserId: scientist1.id,
};

context('Tag tests', () => {
  beforeEach(function () {
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TAGS)) {
        this.skip();
      }
    });

    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Tag tests User officer', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to create and delete tag', () => {
      cy.visit('/');
      cy.contains('Tag').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="tag-name"]').type(tagName);
      cy.get('[data-cy="shortCode"]').type(tagShortCode);

      cy.get('[data-cy="submit"]').click();

      cy.contains(tagName);
      cy.contains(tagShortCode);
    });

    it('User officer should be able to assign and remove instruments from tags', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.createInstrument(instrument1);
      cy.visit('/Tag');

      cy.contains(tagName);

      cy.contains(instrument1.name).should('not.exist');

      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-instruments"]').click();

      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains(instrument1.name);

      // It persisits after reload
      cy.visit('/Tag');
      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains(instrument1.name);

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains(instrument1.name).should('not.exist');
    });

    it('User officer should be able to assign and remove calls from tags', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.visit('/Tag');

      cy.contains(tagName);

      cy.contains('call 1').should('not.exist');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains('call 1');

      // It persisits after reload
      cy.visit('/Tag');
      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains('call 1');

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains('call 1').should('not.exist');
    });

    it('User officer should not be able to assign instruments to tag that do not share a tag with the selected call', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.createInstrument(instrument1);

      cy.visit('/Tag');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.visit('/Calls');
      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-instrument-to-call"]').click();

      cy.notification({
        variant: 'error',
        text: 'One or more instruments do not share a tag with the selected call',
      });
    });
  });
});
