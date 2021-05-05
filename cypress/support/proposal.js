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

  cy.finishedLoading();

  cy.notification({ variant: 'success', text: 'Saved' });
};

const changeProposalStatus = (statusName = 'DRAFT', proposalTitle) => {
  cy.contains('Proposals').click();

  if (proposalTitle) {
    cy.contains(proposalTitle).parent().find('[type="checkbox"]').check();
  } else {
    cy.get('[type="checkbox"]').first().check();
  }

  cy.get('[data-cy="change-proposal-status"]').click();

  cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
  cy.get('@dialog').contains('Change proposal/s status');

  cy.get('@dialog')
    .find('#mui-component-select-selectedStatusId')
    .should('not.have.class', 'Mui-disabled');

  cy.get('@dialog').find('#mui-component-select-selectedStatusId').click();

  cy.get('[role="listbox"]').contains(statusName).click();

  if (statusName === 'DRAFT') {
    cy.get('[role="alert"] .MuiAlert-message').contains(
      'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
    );
  }

  cy.get('[data-cy="submit-proposal-status-change"]').click();

  cy.notification({
    variant: 'success',
    text: 'status changed successfully',
  });
};

Cypress.Commands.add('createProposal', createProposal);
Cypress.Commands.add('changeProposalStatus', changeProposalStatus);
