import initialDBData from '../support/initialDBData';

context('Units tests', () => {
  describe('Template basic unit tests', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
      cy.resetDB();
    });

    it('User officer can create unit', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="unit-id"]').clear().type('test');
      cy.get('[data-cy="unit-name"]').clear().type('test');
      cy.get('[data-cy="unit-quantity"]').click();
      cy.get('#quantity-input-option-0').click();

      cy.get('[data-cy="unit-symbol"]').clear().type('test');
      cy.get('[data-cy="unit-siConversionFormula"]').clear().type('x');

      cy.get('[data-cy="submit"]').click();
      cy.get('[placeholder="Search"]').clear().type('test');

      cy.get('[placeholder="Search"]').clear().type('test');
    });

    it('User officer can delete unit', () => {
      const BECQUEREL_UNIT_TITLE = 'becquerel';
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.contains(BECQUEREL_UNIT_TITLE).should('exist');

      cy.contains(BECQUEREL_UNIT_TITLE)
        .closest('tr')
        .find('[title=Delete]')
        .click();

      cy.get('[title=Save]').click();

      cy.contains(BECQUEREL_UNIT_TITLE).should('not.exist');
    });
  });

  describe('Template advanced unit tests', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
      cy.resetDB(true);
    });

    it('Can search answers with units', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('#call-select').click();
      cy.get('[role=listbox]').contains('call 1').click();
      cy.get('[data-cy=question-search-toggle]').click();
      cy.get('#question-list').click();
      cy.get('#question-list-option-0').click();
      cy.get('body').click();

      cy.get('[data-cy=comparator]').click();
      cy.get('[data-value="LESS_THAN"]').click();

      cy.get('[data-cy="value"]').clear().type('5');

      cy.get('[data-cy=unit-select]').click();
      cy.get('[data-value="centimeter"]').click();

      cy.get('[data-cy=search-btn]').click();

      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=unit-select]').click();
      cy.get('[data-value="meter"]').click();

      cy.get('[data-cy=search-btn]').click();

      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');
    });
  });
});
