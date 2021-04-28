import faker from 'faker';

const createProposal = (
  proposalTitle = '',
  proposalAbstract = '',
  call = '',
  proposer = ''
) => {
  const title = proposalTitle || faker.random.words(3);
  const abstract = proposalAbstract || faker.random.words(8);

  cy.contains('New Proposal').click();

  if (call) {
    cy.contains(call).click();
  }

  cy.get('[data-cy=title] input').type(title).should('have.value', title);

  cy.get('[data-cy=abstract] textarea')
    .first()
    .type(abstract)
    .should('have.value', abstract);

  if (proposer) {
    cy.get('[data-cy=edit-proposer-button]').click();
    cy.contains(proposer).parent().find("[title='Select user']").click();
  }

  cy.contains('Save and continue').click();

  cy.notification({ variant: 'success', text: 'Saved' });
};

Cypress.Commands.add('createProposal', createProposal);
