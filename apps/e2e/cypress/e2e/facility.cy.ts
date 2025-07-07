import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const facilityName = faker.word.words(2);
const facilityShortCode = faker.word.words(1);

const scientist1 = initialDBData.users.user1;

const instrument1 = {
  name: faker.word.words(2),
  shortCode: faker.word.words(1),
  description: faker.word.words(5),
  managerUserId: scientist1.id,
};

context('Facility tests', () => {
  beforeEach(function () {
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FACILITIES)) {
        this.skip();
      }
    });

    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Facility tests User officer', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to create and delete facility', () => {
      cy.visit('/');
      cy.contains('Facility').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="facility-name"]').type(facilityName);
      cy.get('[data-cy="shortCode"]').type(facilityShortCode);

      cy.get('[data-cy="submit"]').click();

      cy.contains(facilityName);
      cy.contains(facilityShortCode);
    });

    it('User officer should be able to assign and remove instruments from facilities', () => {
      cy.createFacility({ name: facilityName, shortCode: facilityShortCode });
      cy.createInstrument(instrument1);
      cy.visit('/Facility');

      cy.contains(facilityName);

      cy.contains(instrument1.name).should('not.exist');

      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-instruments"]').click();

      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains(instrument1.name);

      // It persisits after reload
      cy.visit('/Facility');
      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains(instrument1.name);

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains(instrument1.name).should('not.exist');
    });

    it('User officer should be able to assign and remove calls from facilities', () => {
      cy.createFacility({ name: facilityName, shortCode: facilityShortCode });
      cy.visit('/Facility');

      cy.contains(facilityName);

      cy.contains('call 1').should('not.exist');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains('call 1');

      // It persisits after reload
      cy.visit('/Facility');
      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains('call 1');

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains('call 1').should('not.exist');
    });

    it('User officer should not be able to assign instruments to facility that do not share a facility with the selected call', () => {
      cy.createFacility({ name: facilityName, shortCode: facilityShortCode });
      cy.createInstrument(instrument1);

      cy.visit('/Facility');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.visit('/Calls');
      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-instrument-to-call"]').click();

      cy.notification({
        variant: 'error',
        text: 'One or more instruments do not share a facility with the selected call',
      });
    });
  });
});
