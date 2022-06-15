import initialDBData from '../support/initialDBData';

context('App settings tests', () => {
  beforeEach(() => {
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

      cy.get('body').type('{esc}');

      cy.get('[data-cy="officer-menu-items"]').contains('Settings').click();
      cy.get('[data-cy="officer-menu-items"]').contains('App settings').click();

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
  });
});
