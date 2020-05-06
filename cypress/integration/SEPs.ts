/// <reference types="Cypress" />
/// <reference types="../types" />

context('Scientific evaluation panel tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(1000);
  });

  it('User should not be able to see SEPs page', () => {
    cy.login('user');

    cy.wait(1000);

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'SEPs');
  });

  it('Officer should be able to create SEP', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.contains('Create SEP').click();
    cy.get('#code').type(code);
    cy.get('#description').type(description);
    cy.contains('Add SEP').click();

    cy.wait(1000);

    let SEPsTable = cy.get('[data-cy="SEPs-table"]');

    SEPsTable.should('contain', code);
    SEPsTable.should('contain', description);
  });

  it('Officer should be able to edit existing SEP', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();
    cy.get('#code').type(code);
    cy.get('#description').type(description);
    cy.contains('Update SEP').click();

    cy.wait(1000);

    cy.contains('SEPs').click();

    let SEPsTable = cy.get('[data-cy="SEPs-table"]');

    SEPsTable.should('contain', code);
    SEPsTable.should('contain', description);
  });

  it('Officer should be able to assign SEP Chair and SEP Secretary to existing SEP', () => {
    let selectedChairUser = '';
    let selectedSecretaryUser = '';

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[id="mui-component-select-SEPChair"]').click();

    cy.get('.MuiMenu-list')
      .find('[data-value="1"]')
      .then(element => {
        selectedChairUser = element.text();
      });

    cy.get('.MuiMenu-list [data-value="1"]').click();

    cy.get('[id="mui-component-select-SEPSecretary"]').click();
    cy.get('.MuiMenu-list')
      .find('[data-value="2"]')
      .then(element => {
        selectedSecretaryUser = element.text();
      });
    cy.get('.MuiMenu-list [data-value="2"]').click();

    cy.contains('Save SEP Members').click();

    cy.wait(1000);

    cy.contains('Logs').click();

    cy.wait(1000);

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[id="mui-component-select-SEPChair"]').should(element => {
      expect(selectedChairUser).to.equal(element.text());
    });

    cy.get('[id="mui-component-select-SEPSecretary"]').should(element => {
      expect(selectedSecretaryUser).to.equal(element.text());
    });
  });

  it('Officer should be able to assign SEP Reviewers to existing SEP', () => {
    cy.login('officer');

    cy.contains('User Officer').click();

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[title="Add Member"]').click();

    cy.wait(1000);

    cy.get('[title="Select user"]').click();

    cy.wait(1000);

    cy.contains('Logs').click();

    cy.wait(1000);

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[data-cy="sep-reviewers-table"]')
      .find('tbody td')
      .should('have.length', 4);

    cy.get('[data-cy="sep-reviewers-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).length.to.be.greaterThan(0);
      });
  });

  it('Officer should be able to remove SEP Reviewers from existing SEP', () => {
    cy.login('officer');

    cy.contains('User Officer').click();

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[title="Delete"]').click();

    cy.get('[title="Save"]').click();

    cy.wait(1000);

    cy.contains('Logs').click();

    cy.wait(1000);

    cy.contains('SEP_MEMBER_REMOVED');

    cy.contains('Members').click();

    cy.wait(1000);

    cy.get('[data-cy="sep-reviewers-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="sep-reviewers-table"]')
      .find('tbody td')
      .first()
      .then(element => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });

  it('Officer should be able to assign proposal to existing SEP', () => {
    const title = faker.random.words(3);
    const abstract = faker.random.words(8);
    cy.login('user');
    cy.contains('User').click();
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.wait(500);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.contains('Logout').click();

    cy.login('officer');
    cy.contains('User Officer').click();

    cy.get('[type="checkbox"]')
      .first()
      .check();

    cy.get("[title='Assign proposals to SEP']")
      .first()
      .click();

    cy.get("[id='mui-component-select-selectedSEPId']")
      .first()
      .click();

    cy.get("[id='menu-selectedSEPId'] li")
      .first()
      .click();

    cy.contains('Assign to SEP').click();

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();

    cy.contains('Assignments').click();

    cy.wait(1000);

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .should('have.length', 6);

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).length.to.be.greaterThan(0);
      });
  });

  it('Officer should be able to remove assigned proposal from existing SEP', () => {
    cy.login('officer');
    cy.contains('User Officer').click();

    cy.contains('SEPs').click();
    cy.get('button[title="Edit SEP"]')
      .first()
      .click();

    cy.contains('Assignments').click();

    cy.wait(1000);

    cy.get('[title="Delete"]').click();
    cy.get('[title="Save"]').click();

    cy.wait(1000);

    cy.contains('Logs').click();

    cy.wait(1000);

    cy.contains('Assignments').click();

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });
});
