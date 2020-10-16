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

  it('User should not be able to see SEPs page', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'SEPs');
  });

  it('Officer should be able to create SEP', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.contains('Create').click();
    cy.get('#code').type(code);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'SEP created successfully' });

    cy.contains('Update SEP');

    cy.get('#code').should('contain.value', code);
    cy.get('#description').should('contain.value', description);

    cy.url().should('contain', 'SEPPage/2');
  });

  it('Officer should be able to edit existing SEP', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();
    cy.get('#code').type(code);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'SEP updated successfully' });

    cy.contains('SEPs').click();

    let SEPsTable = cy.get('[data-cy="SEPs-table"]');

    SEPsTable.should('contain', code);
    SEPsTable.should('contain', description);
  });

  it('Officer should be able to assign SEP Chair to existing SEP', () => {
    let selectedChairUserFirstName = '';
    let selectedChairUserLastName = '';

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[title="Set SEP Chair"]').click();

    cy.finishedLoading();

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr')
      .eq(1)
      .find('td.MuiTableCell-alignLeft')
      .first()
      .then(element => {
        selectedChairUserFirstName = element.text();
      });

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr')
      .eq(1)
      .find('td.MuiTableCell-alignLeft')
      .eq(1)
      .then(element => {
        selectedChairUserLastName = element.text();
      });

    cy.get('[title="Select user"]')
      .eq(1)
      .click();

    cy.notification({
      variant: 'success',
      text: 'SEP chair assigned successfully',
    });

    cy.contains('Logs').click({ force: true });

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.get('input[id="SEPChair"]').should(element => {
      expect(element.val()).to.equal(
        `${selectedChairUserFirstName} ${selectedChairUserLastName}`
      );
    });
  });

  it('Officer should be able to assign SEP Secretary to existing SEP', () => {
    let selectedSecretaryUserFirstName = '';
    let selectedSecretaryUserLastName = '';

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[title="Set SEP Secretary"]').click();

    cy.finishedLoading();

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr[level="0"]')
      .eq(2)
      .find('td.MuiTableCell-alignLeft')
      .first()
      .then(element => {
        selectedSecretaryUserFirstName = element.text();
      });

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr[level="0"]')
      .eq(2)
      .find('td.MuiTableCell-alignLeft')
      .eq(1)
      .then(element => {
        selectedSecretaryUserLastName = element.text();
      });

    cy.get('[title="Select user"]')
      .eq(2)
      .click();

    cy.notification({
      variant: 'success',
      text: 'SEP secretary assigned successfully',
    });

    cy.contains('Logs').click({ force: true });

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.get('input[id="SEPSecretary"]').should(element => {
      expect(element.val()).to.contain(
        `${selectedSecretaryUserFirstName} ${selectedSecretaryUserLastName}`
      );
    });
  });

  it('Officer should be able to assign SEP Reviewers to existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[title="Add Member"]').click();

    cy.finishedLoading();

    cy.get('input[type="checkbox"')
      .eq(1)
      .click();

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member assigned successfully',
    });

    cy.contains('Logs').click({ force: true });

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

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

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[title="Delete"]').click();

    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });

    cy.contains('Logs').click({ force: true });

    cy.finishedLoading();

    cy.get("[title='Last Page'] button")
      .first()
      .click({ force: true });

    cy.contains('SEP_MEMBER_REMOVED');

    cy.contains('Members').click();

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
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

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
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .should('have.length', 8);

    cy.get('[data-cy="sep-assignments-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).length.to.be.greaterThan(0);
      });
  });

  it('Officer should be able to assign SEP member to proposal in existing SEP', () => {
    let selectedReviewerFirstName = '';
    let selectedReviewerLastName = '';
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get("[title='Assign SEP Member']")
      .first()
      .click();

    cy.finishedLoading();

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr[level="0"]')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .first()
      .then(element => {
        selectedReviewerFirstName = element.text();
      });

    cy.get('.MuiDialog-container [role="dialog"] table tbody tr[level="0"]')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .eq(1)
      .then(element => {
        selectedReviewerLastName = element.text();
      });

    cy.get("[title='Add reviewer']")
      .first()
      .click();

    cy.notification({
      variant: 'success',
      text: 'assigned',
    });

    cy.contains('Logs').click({ force: true });

    cy.finishedLoading();

    cy.get("[title='Last Page'] button")
      .first()
      .click({ force: true });

    cy.contains('SEP_MEMBER_ASSIGNED_TO_PROPOSAL');

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get("[title='Show Reviewers']")
      .first()
      .click();

    cy.get('[data-cy="sep-reviewer-assignments-table"]').should(element => {
      expect(element.text()).to.contain(selectedReviewerFirstName);
      expect(element.text()).to.contain(selectedReviewerLastName);
    });
  });

  it('Officer should be able to assign proposal to instrument and instrument to call to see it in meeting components', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.alphaNumeric(15);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'created successfully' });

    cy.contains('Calls').click();
    cy.get('[title="Assign Instrument"]')
      .first()
      .click();

    cy.get('[type="checkbox"]')
      .first()
      .check();

    cy.contains('Assign instrument').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('Proposals').click();

    cy.get('table tbody [type="checkbox"]')
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

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.contains(name);

    cy.get("[title='Submit instrument']").should('exist');

    cy.get("[title='Show proposals']")
      .first()
      .click();

    cy.get(
      '[data-cy="sep-instrument-proposals-table"] [title="View proposal details"]'
    ).click();

    cy.finishedLoading();

    cy.contains('SEP Meeting form');
    cy.contains('Proposal details');
    cy.contains('External reviews');
  });

  it('Officer should be able to see calculated availability time on instrument per SEP inside meeting components', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    const title = faker.random.words(3);
    const abstract = faker.random.words(8);

    cy.login('user');
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('SEPs').click();
    cy.contains('Create').click();
    cy.get('#code').type(code);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'SEP created successfully' });

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('table tbody [type="checkbox"]')
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

    cy.contains('Calls').click();

    cy.get("[title='Show Instruments']")
      .first()
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"] [title="Edit"]')
      .first()
      .click();

    cy.get("[data-cy='availability-time']").type('50');

    cy.get("[title='Save']")
      .first()
      .click();

    cy.notification({
      variant: 'success',
      text: 'Availability time set successfully',
    });

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[data-cy="SEP-meeting-components-table"] tbody tr:first-child td')
      .eq(5)
      .should('have.text', '25');
  });

  it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
    cy.login('officer');

    cy.get('[data-cy="view-proposal"]')
      .first()
      .click();

    cy.contains('Technical').click();
    cy.get('[data-cy="timeAllocation"]').type('51');

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'Technical review updated successfully',
    });

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Show proposals"]')
      .first()
      .click();
    cy.get(
      '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
    ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
  });

  it('Officer should be able to submit an instrument in existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get("[title='Submit instrument']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains('Yes');

    cy.get('[title="Submit instrument"] button').should('be.disabled');
  });

  it('Officer should be able to remove assigned SEP member from proposal in existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get("[title='Show Reviewers']")
      .first()
      .click();

    cy.get(
      '[data-cy="sep-reviewer-assignments-table"] [title="Delete"]'
    ).click();
    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'Reviewer removed',
    });

    cy.contains('Logs').click({ force: true });

    cy.finishedLoading();

    cy.get("[title='Last Page'] button")
      .first()
      .click({ force: true });

    cy.contains('SEP_MEMBER_REMOVED_FROM_PROPOSAL');

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get("[title='Show Reviewers']")
      .first()
      .click();

    cy.get('[data-cy="sep-reviewer-assignments-table"]').should(element => {
      expect(element.text()).to.contain('No records to display');
    });
  });

  it('Officer should be able to remove assigned proposal from existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get('[title="Delete"]').click();
    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'Assignment removed',
    });

    cy.contains('Logs').click({ force: true });

    cy.finishedLoading();

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
