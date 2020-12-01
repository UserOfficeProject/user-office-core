before(() => {
  cy.resetDB();
});

describe('PageTable component tests', () => {
  describe('Preserve selected users', () => {
    it('should preserve the selected users', () => {
      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.contains('0 user(s) selected');

      cy.get('[data-cy="co-proposers"] tr[index="0"] input').click();

      cy.contains('1 user(s) selected');

      cy.get('[data-cy="co-proposers"] [aria-label="Search"]').type('foo bar');

      cy.contains('No records to display');
      cy.contains('1 user(s) selected');

      cy.get(
        '[data-cy="co-proposers"] [aria-label="Search"] ~ * > button'
      ).click();

      cy.contains('1 user(s) selected');
      cy.contains('Carlsson');

      cy.get('[data-cy="co-proposers"] tr[index="0"] input:checked');

      cy.get('[data-cy="co-proposers"] [aria-label="Search"]').type('Carlsson');

      cy.contains('1 user(s) selected');
      cy.contains('Carlsson');

      cy.get('[data-cy="co-proposers"] tr[index="0"] input:checked');

      cy.get('[data-cy="assign-selected-users"]').click();
    });
  });
});
