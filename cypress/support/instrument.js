function createInstrument({ name, shortCode, description }, scientist) {
  cy.contains('Instruments').click();
  cy.contains('Create').click();
  cy.get('#name').type(name);
  cy.get('#shortCode').type(shortCode);
  cy.get('#description').type(description);

  cy.get('[data-cy=beamline-manager]').click();
  cy.get('[role=presentation]').contains(scientist).click();

  cy.get('[data-cy="submit"]').click();

  cy.contains(name);
  cy.contains(shortCode);
  cy.contains(description);
  cy.contains(scientist);

  cy.notification({ variant: 'success', text: 'created successfully' });
}

function assignScientistsToInstrument(instrument) {
  cy.contains(instrument).parent().find('[title="Assign scientist"]').click();

  cy.get('[data-cy="co-proposers"] input[type="checkbox"]').first().click();

  cy.get('.MuiDialog-root').contains('Update').click();

  cy.notification({
    variant: 'success',
    text: 'Scientist assigned to instrument',
  });
}

const assignInstrumentToCall = (call, instrument) => {
  cy.contains(call).parent().find('[title="Assign Instrument"]').click();

  cy.contains(instrument).parent().find('[type="checkbox"]').check();

  cy.contains('Assign instrument').click();

  cy.notification({
    variant: 'success',
    text: 'Instrument/s assigned successfully',
  });
};

const assignInstrumentToProposal = (proposal, instrument) => {
  cy.contains(proposal).parent().find('[type="checkbox"]').as('checkbox');

  cy.get('@checkbox').check();

  cy.get('[data-cy="assign-remove-instrument"]').click();

  cy.get('[data-cy="proposals-instrument-assignment"]')
    .contains('Loading...')
    .should('not.exist');

  cy.get("[id='mui-component-select-selectedInstrumentId']").first().click();

  cy.get("[id='menu-selectedInstrumentId'] li").contains(instrument).click();

  cy.get('[data-cy="submit-assign-remove-instrument"]').click();

  cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

  cy.notification({
    variant: 'success',
    text: 'Proposal/s assigned to the selected instrument successfully!',
  });

  cy.get('@checkbox').uncheck();

  cy.contains(proposal).parent().contains(instrument);
};

const assignReviewer = (proposalTitle, reviewerName) => {
  cy.contains('Proposals');

  cy.get('[data-cy="status-filter"]').click();
  cy.get('[role="listbox"] [data-value="0"]').click();

  cy.contains(proposalTitle).parent().find('[data-cy="view-proposal"]').click();
  cy.get('[role="dialog"]').as('dialog');
  cy.finishedLoading();
  cy.get('@dialog').contains('Technical review').click();

  cy.get('[data-cy=re-assign]').click();
  cy.get('[data-cy=user-list]').click();
  cy.contains(reviewerName).click();
  cy.get('[data-cy=re-assign-submit]').click();
  cy.get('[role=presentation]').contains('OK').click();
};

Cypress.Commands.add('createInstrument', createInstrument);
Cypress.Commands.add(
  'assignScientistsToInstrument',
  assignScientistsToInstrument
);
Cypress.Commands.add('assignInstrumentToProposal', assignInstrumentToProposal);

Cypress.Commands.add('assignInstrumentToCall', assignInstrumentToCall);

Cypress.Commands.add('assignReviewer', assignReviewer);
