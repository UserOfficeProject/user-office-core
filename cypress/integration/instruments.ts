/// <reference types="Cypress" />
/// <reference types="../types" />

context('Instrument tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(500);
  });

  it('User should not be able to see Instruments page', () => {
    cy.login('user');

    cy.wait(1000);

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'Instruments');
  });

  it('User Officer should be able to create Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.words(1);
    const description = faker.random.words(5);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.wait(1000);

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should be able to update Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.words(1);
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

    cy.wait(1000);

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should be able to assign proposal to existing instrument', () => {
    const title = faker.random.words(3);
    const abstract = faker.random.words(5);
    cy.login('user');
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.wait(500);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.contains('Logout').click();

    cy.login('officer');

    cy.get('[type="checkbox"]')
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

    cy.wait(500);

    cy.get('[title="Remove assigned instrument"]').should('exist');
  });

  it('User Officer should be able to remove assigned proposal from instrument', () => {
    cy.login('officer');

    cy.get('[title="Remove assigned instrument"]').click();

    cy.contains('Yes').click();

    cy.wait(500);

    cy.get('[title="Remove assigned instrument"]').should('not.exist');
  });

  it('User Officer should be able to assign scientist to instrument and instrument scientist should be able to see instruments he is assigned to', () => {
    cy.login('officer');

    cy.contains('View People').click();
    cy.get('[title="Edit user"]')
      .last()
      .click();
    cy.wait(500);
    cy.contains('Settings').click();
    cy.wait(500);
    cy.contains('Add role').click();
    cy.get('[data-cy="role-modal"] [title="Last Page"]').click();

    cy.get('[data-cy="role-modal"]')
      .contains('Instrument Scientist')
      .parent()
      .find('[title="Select role"]')
      .click();
    cy.wait(500);

    cy.contains('Instruments').click();
    cy.wait(500);

    cy.get('[title="Assign scientist"]').click();
    cy.wait(500);

    cy.get('[title="Select user"]')
      .first()
      .click();

    cy.wait(500);

    cy.contains('Logout').click();

    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').click();
    cy.contains('Roles').click();
    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .eq(1)
      .contains('Use')
      .click();
    cy.wait(1000);

    cy.contains('Instruments');

    cy.get('[title="Edit"]').should('exist');
  });

  it('User Officer should be able to remove assigned scientist from instrument', () => {
    cy.login('officer');

    cy.contains('Instruments').click();
    cy.wait(500);

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get(
      '[data-cy="instrument-scientist-assignments-table"] [title="Delete"]'
    )
      .first()
      .click();

    cy.get('[title="Save"]').click();

    cy.wait(1000);

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

    cy.contains('Instruments').click();

    cy.get('[title="Delete"]').click();

    cy.get('[title="Save"]').click();

    cy.wait(1000);

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
