import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('User login tests', () => {
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

      const institutionRorId = 'https://ror.org/not-in-db';

      cy.upsertUserByOidc({
        oidcSub: 'some-unique-sub',
        email: 'email@example.com',
        institution: {
          rorId: institutionRorId,
        },
        firstName: 'Test',
        lastName: 'User',
        position: 'Researcher',
        username: 'testuser',
      });

      cy.contains('Institutions').click();

      cy.finishedLoading();

      cy.get('input[aria-label="Search"]').focus().type(institutionRorId);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable').contains(institutionRorId);
    });

    it('Should create new entry for country, if the given country is not found', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }

      const institutionCountry = 'NewCountry';
      const institutionName = 'Test Institution NewCountry';

      cy.upsertUserByOidc({
        oidcSub: 'some-unique-sub',
        email: 'email@example.com',
        firstName: 'Test',
        lastName: 'User',
        position: 'Researcher',
        institution: {
          manual: {
            name: institutionName,
            country: institutionCountry,
          },
        },
        username: 'testuser',
      });

      cy.contains('Institutions').click();

      cy.finishedLoading();

      cy.get('input[aria-label="Search"]').focus().type(institutionName);

      cy.get('[data-cy="institutions-table"]').as('institutionsTable');
      cy.get('@institutionsTable')
        .contains(institutionName)
        .parents('tr')
        .within(() => {
          cy.get('td:nth-child(3)')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.eq(institutionCountry);
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
