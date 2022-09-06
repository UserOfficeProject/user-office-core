import { FeatureId, ReviewerFilter } from '../../src/generated/sdk';
import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('App settings tests', () => {
  beforeEach(() => {
    cy.viewport(1920, 2000);
    cy.getAndStoreAppSettings();
    cy.getAndStoreFeaturesEnabled();
    cy.resetDB();
  });

  describe('Modify app settings', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to modify application settings', () => {
      const newDateTimeFormat = initialDBData
        .getFormats()
        .dateTimeFormat.replace(/-/g, '/');

      cy.visit('/Calls');

      cy.get('[data-cy="calls-table"] [data-cy="create-new-entry"]').click();

      cy.get('[data-cy="start-date"] input').should(
        'have.attr',
        'placeholder',
        initialDBData.getFormats().dateTimeFormat
      );

      cy.get('[data-cy="close-modal-btn"]').click();

      cy.get('[data-cy="officer-menu-items"]').contains('Settings').click();
      cy.get('[data-cy="officer-menu-items"]').contains('App settings').click();

      cy.get('[data-cy="settings-table"]')
        .find('button[aria-label="Next Page"]')
        .click();

      cy.get('[data-cy="settings-table"]')
        .contains(initialDBData.settings.dateTimeFormat.id)
        .parent()
        .contains(initialDBData.settings.dateTimeFormat.settingsValue);

      cy.get('[data-cy="settings-table"]')
        .contains(initialDBData.settings.dateTimeFormat.id)
        .parent()
        .find('button[aria-label="Edit"]')
        .click();

      cy.get('[data-cy="settings-table"]')
        .contains(initialDBData.settings.dateTimeFormat.id)
        .parent()
        .find(
          `input[value="${initialDBData.settings.dateTimeFormat.settingsValue}"]`
        )
        .clear()
        .type(newDateTimeFormat);

      cy.get('[data-cy="settings-table"]')
        .contains(initialDBData.settings.dateTimeFormat.id)
        .parent()
        .find('button[aria-label="Save"]')
        .click();

      cy.notification({ text: 'Settings updated', variant: 'success' });

      cy.get('[data-cy="settings-table"]')
        .contains(initialDBData.settings.dateTimeFormat.id)
        .parent()
        .contains(newDateTimeFormat);

      cy.visit('/Calls');

      cy.get('[data-cy="calls-table"] [data-cy="create-new-entry"]').click();

      cy.get('[data-cy="start-date"] input').should(
        'have.attr',
        'placeholder',
        newDateTimeFormat
      );
    });

    it('Instrument Scientist filter should differ based on setting value', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.EXTERNAL_AUTH)) {
        //temporarily skipping, until instr sci login is enabled
        this.skip();
      }
      const scientist2 = initialDBData.users.user2;

      cy.updateUserRoles({
        id: scientist2.id,

        roles: [initialDBData.roles.instrumentScientist],
      });

      cy.login(scientist2);

      cy.visit('/');

      cy.log(
        'hello' + JSON.stringify(initialDBData.getFormats().reviewerFilter)
      );

      cy.contains('Proposals');

      if (initialDBData.getFormats().reviewerFilter === 'ALL') {
        cy.get('[data-cy="reviewer-filter"] input').should(
          'have.value',
          ReviewerFilter.ALL
        );
      } else {
        cy.get('[data-cy="reviewer-filter"] input').should(
          'have.value',
          ReviewerFilter.ME
        );
      }
      if (initialDBData.getFormats().statusFilter === 'ALL') {
        cy.get('[data-cy="status-filter"] input').should('have.value', 0);
      } else {
        cy.get('[data-cy="status-filter"] input').should('have.value', 2);
      }
    });
  });
});
