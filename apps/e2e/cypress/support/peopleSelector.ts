export function addUserThroughModal(search: string) {
  cy.get('[data-cy="invite-user-autocomplete"]').type(search);
  cy.contains('[role="option"]', search).click();
  cy.get('[data-cy="invite-user-submit-button"]').should('be.enabled').click();
}
