import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('User login tests', () => {
  const userThree = 'user3';

  const userThreeInstitutionInfo = {
    institution_ror_id: null,
    institution_country: 'TestCountry',
    institution_name: 'Test Institution3',
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

      cy.login(userThree, initialDBData.roles.user);
      cy.visit('/');
      cy.logout();

      cy.login('officer');
      cy.contains('Institutions').click();

      cy.finishedLoading();

      cy.get('input[aria-label="Search"]')
        .focus()
        .type(userThreeInstitutionInfo.institution_name);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable')
        .contains(userThreeInstitutionInfo.institution_name)
        .parents('tr')
        .within(() => {
          cy.get('td:nth-child(4)')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.eq(
                userThreeInstitutionInfo.institution_ror_id ?? '-'
              );
            });
        });
    });

    it('Should create new entry for country, if the given country is not found', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }

      cy.login(userThree, initialDBData.roles.user);
      cy.visit('/');
      cy.logout();

      cy.login('officer');
      cy.contains('Institutions').click();

      cy.finishedLoading();

      cy.get('input[aria-label="Search"]')
        .focus()
        .type(userThreeInstitutionInfo.institution_name);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable')
        .contains(userThreeInstitutionInfo.institution_name)
        .parents('tr')
        .within(() => {
          cy.get('td:nth-child(3)')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.eq(
                userThreeInstitutionInfo.institution_country
              );
            });
        });
    });
  });

  describe('Role Model', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: initialDBData.users.officer.id,
          roles: [
            initialDBData.roles.user,
            initialDBData.roles.instrumentScientist,
          ],
        });
      }
    });
    it('The role model should be opened if the site is navigated to with the querystring', () => {
      cy.login('officer');
      cy.visit('/');

      //Site is loaded
      cy.contains('Dashboard');

      //Modal is not open if query string is not present
      cy.contains('Assigned Roles').should('not.exist');

      cy.visit('/?selectRoles=true');
      cy.contains('Assigned Roles');

      cy.url().should('not.include', '/?selectRoles=true');

      cy.get('[data-cy="select-role-user"]').click();

      //Site is loaded
      cy.contains('Dashboard');
      cy.contains('Assigned Roles').should('not.exist');
      cy.url().should('not.include', '/?selectRoles=true');
    });

    it('Role modal does not reoccure on refresh', () => {
      cy.login('officer');
      cy.visit('/?selectRoles=true');

      cy.contains('Close').click();

      cy.reload();

      cy.contains('Dashboard');
      cy.contains('Assigned Roles').should('not.exist');
    });
  });
});
