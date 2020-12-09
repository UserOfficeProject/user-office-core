context('Instrument tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  it('User should not be able to see Instruments page', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'Instruments');
  });

  it('User Officer should be able to create Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.alphaNumeric(15);
    const description = faker.random.words(5);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'created successfully' });

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should be able to update Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.alphaNumeric(15);
    const description = faker.random.words(5);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.get('[title="Edit"]').click();
    cy.get('#name').clear();
    cy.get('#name').type(name);
    cy.get('#shortCode').clear();
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'updated successfully' });

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should be able to assign proposal to existing instrument', () => {
    cy.login('user');
    cy.createProposal();
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Calls').click();
    cy.get('[title="Assign Instrument"]')
      .first()
      .click();

    cy.get('[type="checkbox"]')
      .first()
      .check();

    cy.contains('Assign instrument').click();

    cy.notification({
      variant: 'success',
      text: 'Instrument/s assigned successfully',
    });

    cy.contains('Proposals').click();

    cy.get('tbody [type="checkbox"]')
      .first()
      .check();

    cy.get("[title='Assign proposals to instrument']")
      .first()
      .click();

    cy.get("[id='mui-component-select-selectedInstrumentId']")
      .first()
      .click();

    cy.get("[id='menu-selectedInstrumentId'] li")
      .first()
      .click();

    cy.contains('Assign to Instrument').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal/s assigned to the selected instrument',
    });

    cy.get('[title="Remove assigned instrument"]').should('exist');
  });

  it('User Officer should be able to assign and unassign instrument to proposal without page refresh', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('tbody [type="checkbox"]')
      .first()
      .check();

    cy.get('[title="Remove assigned instrument"]')
      .first()
      .click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal removed from the instrument successfully!',
    });

    cy.get('[data-cy="assign-proposals-to-instrument"]')
      .first()
      .click();

    cy.get("[id='mui-component-select-selectedInstrumentId']")
      .first()
      .click();

    cy.get("[id='menu-selectedInstrumentId'] li")
      .first()
      .click();

    cy.contains('Assign to Instrument').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal/s assigned to the selected instrument',
    });

    cy.get('[title="Remove assigned instrument"]')
      .first()
      .click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal removed from the instrument successfully!',
    });

    cy.get('[data-cy="assign-proposals-to-instrument"]')
      .first()
      .click();

    cy.get("[id='mui-component-select-selectedInstrumentId']")
      .first()
      .click();

    cy.get("[id='menu-selectedInstrumentId'] li")
      .first()
      .click();

    cy.contains('Assign to Instrument').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal/s assigned to the selected instrument',
    });

    cy.get('[title="Remove assigned instrument"]').should('exist');
  });

  it('User Officer should be able to assign scientist to instrument and instrument scientist should be able to see instruments he is assigned to', () => {
    cy.login('officer');

    cy.contains('People').click();

    cy.contains('Carlsson')
      .parent()
      .find('button[title="Edit user"]')
      .click();

    const mainContentElement = cy.get('main');
    mainContentElement.contains('Settings').click();

    cy.get('[data-cy="add-role-button"]')
      .should('not.be.disabled')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="role-modal"] [title="Last Page"]').click();

    cy.get('[data-cy="role-modal"]')
      .contains('Instrument Scientist')
      .parent()
      .find('input[type="checkbox"]')
      .click();

    cy.get('[data-cy="role-modal"]')
      .contains('Update')
      .click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('Instruments').click();

    cy.get('[title="Assign scientist"]').click();

    cy.get('[data-cy="co-proposers"] tbody input[type="checkbox"]')
      .first()
      .click();

    cy.get('.MuiDialog-root')
      .contains('Update')
      .click();

    cy.notification({
      variant: 'success',
      text: 'Scientist assigned to instrument',
    });

    cy.logout();

    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').click();
    cy.contains('Roles').click();

    cy.finishedLoading();

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .contains('Use')
      .click();

    cy.notification({ variant: 'success', text: 'User role changed' });

    cy.contains('Instruments').click();

    cy.get('[title="Show Scientists"]').should('exist');
  });

  it('Instrument scientist should be able to see proposals assigned to instrument where he is instrument scientist', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').click();
    cy.contains('Roles').click();

    cy.finishedLoading();

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .contains('Use')
      .click();

    cy.notification({ variant: 'success', text: 'User role changed' });

    cy.contains('Proposals');

    cy.get('[data-cy="status-filter"]').click();
    cy.get('[role="listbox"] [data-value="0"]').click();

    cy.get('[data-cy="view-proposal"]').should('exist');
  });

  it('Instrument scientist should be able to do technical review on proposal where he is instrument scientist', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').click();
    cy.contains('Roles').click();

    cy.finishedLoading();

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .contains('Use')
      .click();

    cy.notification({ variant: 'success', text: 'User role changed' });

    cy.contains('Proposals');

    cy.get('[data-cy="status-filter"]').click();
    cy.get('[role="listbox"] [data-value="0"]').click();

    cy.get('[data-cy="view-proposal"]').click();
    cy.contains('Technical').click();

    cy.get('[data-cy="timeAllocation"]').type('20');

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'Technical review updated successfully',
    });

    cy.contains('Proposals').click();

    cy.get('[data-cy="status-filter"]').click();
    cy.get('[role="listbox"] [data-value="0"]').click();

    cy.contains('20');
  });

  it('User Officer should be able to remove assigned proposal from instrument', () => {
    cy.login('officer');

    cy.get('[title="Remove assigned instrument"]').click();

    cy.get('.MuiDialog-root')
      .contains('Yes')
      .click();

    cy.notification({
      variant: 'success',
      text: 'Proposal removed from the instrument',
    });

    cy.get('[title="Remove assigned instrument"]').should('not.exist');
  });

  it('User Officer should be able to remove assigned scientist from instrument', () => {
    cy.login('officer');

    cy.contains('Instruments').click();

    cy.get('[title="Show Scientists"]')
      .first()
      .click();

    cy.get(
      '[data-cy="instrument-scientist-assignments-table"] [title="Delete"]'
    )
      .first()
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'Scientist removed from instrument',
    });

    cy.get('[data-cy="instruments-table"] table tbody tr')
      .first()
      .find('td')
      .last()
      .then(element => {
        expect(element.text()).to.be.equal('-');
      });
  });

  it('User Officer should be able to delete Instrument', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[title="Delete"]')
      .first()
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'Assigned instrument removed successfully',
    });

    cy.contains('Instruments').click();

    cy.get('[title="Delete"]').click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'Instrument removed' });

    cy.get('[data-cy="instruments-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="instruments-table"]')
      .find('tbody td')
      .first()
      .then(element => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });
});
