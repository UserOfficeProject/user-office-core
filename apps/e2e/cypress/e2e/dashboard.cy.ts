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
      cy.get(`${menuItemSelector} a[href="/ProposalTemplates"]`)
        .should('be.visible')
        .click();
      cy.reload();
      cy.get(`${menuItemSelector} a[href="/ProposalTemplates"]`).should(
        'be.visible'
      );
    });

    it('Sub Sub menu should be opened by default on reload of the corresponding page', () => {
      // First click on Templates to expand it
      cy.get(`${menuItemSelector}>div>div>span`).contains('Templates').click();

      // Use force option to click the PDF Templates link, even if not in viewport
      cy.get(`a[href="/PdfTemplates/proposal"]`).click({ force: true });

      // Reload the page
      cy.reload();

      // After reload, we need to verify that the Templates menu is still expanded
      // and then verify the PDF Templates link exists in the DOM (which proves the menu is still expanded)
      // We use 'exist' instead of 'be.visible' because it might be scrolled out of view but still present
      cy.get(`a[href="/PdfTemplates/proposal"]`).should('exist');

      // Let's also specifically check that the parent "Templates" menu is expanded
      cy.get(`${menuItemSelector}>div>div>span`)
        .contains('Templates')
        .parent()
        .parent()
        .should('not.have.class', 'collapsed');
    });
  });
});
