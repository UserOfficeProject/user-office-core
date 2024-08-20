context('App settings tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.login('officer');
    cy.visit('/');
  });

  describe('Sidebar Menu', () => {
    const menuItemSelector = '[data-cy="officer-menu-items"]';
    const highlightedClass = 'active';
    it('Should highlight the corresponding menu of the opened page', () => {
      cy.get(`${menuItemSelector}>a[href="/Proposals"]`).click();
      cy.get(`${menuItemSelector}>a[href="/Proposals"]`).should(
        'have.class',
        highlightedClass
      );

      cy.reload();

      cy.get(`${menuItemSelector}>a[href="/Proposals"]`).should(
        'have.class',
        highlightedClass
      );
    });

    it('Sub menu should be opened by default on reload of the corresponding page', () => {
      cy.get(`${menuItemSelector}>div>div>span`).contains('Templates').click();
      cy.get(`${menuItemSelector} a[href="/PdfTemplates"]`)
        .should('be.visible')
        .click();
      cy.reload();
      cy.get(`${menuItemSelector} a[href="/PdfTemplates"]`).should(
        'be.visible'
      );
    });
  });
});
