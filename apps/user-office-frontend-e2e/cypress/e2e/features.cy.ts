import initialDBData from '../support/initialDBData';

context('Features tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Enable and disable features', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to disable and enable features', () => {
      cy.visit('/');

      cy.get('[data-cy="officer-proposals-table"] thead th').should(
        'include.text',
        'Instrument'
      );

      cy.get('[data-cy="officer-menu-items"]').contains('Settings').click();
      cy.get('[data-cy="officer-menu-items"]').contains('Features').click();

      cy.get('[data-cy="features-table"]')
        .contains(initialDBData.features.instrumentManagement.id)
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.get('[data-cy="features-table"]')
        .contains(initialDBData.features.instrumentManagement.id)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get('[data-cy="confirmation-dialog"]')
        .find('[data-cy="confirm-ok"]')
        .click();

      cy.notification({ text: 'Feature disabled', variant: 'success' });

      cy.get('[data-cy="features-table"]')
        .contains(initialDBData.features.instrumentManagement.id)
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      cy.get('[data-cy="officer-menu-items"]').contains('Proposals').click();

      cy.get('[data-cy="officer-proposals-table"] thead th').should(
        'not.include.text',
        'Instrument'
      );
    });
  });
});
