/**
 * Picks a user in the ProposalPeopleSelectorModal autocomplete and submits the
 * dialog. `search` needs at least 3 characters, otherwise the selector does not
 * query.
 */
export function addUserThroughModal(search: string) {
  cy.get('[data-cy="invite-user-autocomplete"]').type(search);
  // Matching on the option itself re-queries the DOM on every retry. Chaining
  // off `[role="presentation"]` does not: that selector also matches the
  // "No options" node rendered between the debounced search firing and the
  // results arriving, and the retries then stay inside that stale node.
  cy.contains('[role="option"]', search).click();
  cy.get('[data-cy="invite-user-submit-button"]').should('be.enabled').click();
}
