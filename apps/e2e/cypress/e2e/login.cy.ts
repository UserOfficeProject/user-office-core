import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('User login tests', () => {
  const userOne = 'user1';
  const userTwo = 'user2';
  const userOneInstitutionInfo = {
    institution_ror_id: 'Test_ror_id_1',
    institution_country: 'China',
    institution_name: 'Test Institution',
  };

  const userTwoInstitutionInfo = {
    institution_ror_id: 'Test_ror_id_2',
    institution_country: 'TestCountry',
    institution_name: 'Test Institution2',
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.login('officer');
    cy.visit('/');
  });
  describe('OAuth login', () => {
    it('Should create new entry for institution, if a users institution is not present', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }

      cy.login(userOne, initialDBData.roles.user);
      cy.visit('/');
      cy.logout();

      cy.login('officer');
      cy.contains('Institutions').click();

      cy.get('input[aria-label="Search"]')
        .focus()
        .type(userOneInstitutionInfo.institution_name);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable')
        .contains(userOneInstitutionInfo.institution_name)
        .parents('tr')
        .within(() => {
          cy.get('td:nth-child(4)')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.eq(
                userOneInstitutionInfo.institution_ror_id
              );
            });
        });
    });

    it('Should create new entry for country, if the given country is not found', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }

      cy.login(userTwo, initialDBData.roles.user);
      cy.visit('/');
      cy.logout();

      cy.login('officer');
      cy.contains('Institutions').click();

      cy.get('input[aria-label="Search"]')
        .focus()
        .type(userOneInstitutionInfo.institution_name);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable')
        .contains(userTwoInstitutionInfo.institution_name)
        .parents('tr')
        .within(() => {
          cy.get('td:nth-child(3)')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.eq(
                userTwoInstitutionInfo.institution_country
              );
            });
        });
    });
  });
});
