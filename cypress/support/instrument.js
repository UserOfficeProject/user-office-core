function createInstrument({ name, shortCode, description }) {
  cy.contains('Create').click();
  cy.get('#name').type(name);
  cy.get('#shortCode').type(shortCode);
  cy.get('#description').type(description);
  cy.get('[data-cy="submit"]').click();

  cy.contains(name);
  cy.contains(shortCode);
  cy.contains(description);

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

  cy.get("[title='Assign proposals to instrument']").click();

  cy.get("[id='mui-component-select-selectedInstrumentId']").should(
    'not.have.class',
    'Mui-disabled'
  );

  cy.get("[id='mui-component-select-selectedInstrumentId']").first().click();

  cy.get("[id='menu-selectedInstrumentId'] li").contains(instrument).click();

  cy.contains('Assign to Instrument').click();

  cy.notification({
    variant: 'success',
    text: 'Proposal/s assigned to the selected instrument',
  });

  cy.get('@checkbox').uncheck();

  cy.contains(proposal)
    .parent()
    .find('[title="Remove assigned instrument"]')
    .should('exist');
};

Cypress.Commands.add('createInstrument', createInstrument);
Cypress.Commands.add(
  'assignScientistsToInstrument',
  assignScientistsToInstrument
);
Cypress.Commands.add('assignInstrumentToProposal', assignInstrumentToProposal);

Cypress.Commands.add('assignInstrumentToCall', assignInstrumentToCall);
