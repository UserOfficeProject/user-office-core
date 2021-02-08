import faker from 'faker';
import { curry } from 'cypress/types/lodash';

function searchUser(search: string) {
  cy.get('[aria-label="Search"]').type(search);

  cy.get('[role="progressbar"]').should('exist');
  cy.get('[role="progressbar"]').should('not.exist');
}

function readWriteReview() {
  cy.get('[role="dialog"').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information');
  cy.get('@dialog').contains('Technical Review');
  cy.get('@dialog')
    .contains('Grade')
    .click({ force: true });

  cy.get('@dialog')
    .get('textarea[name="comment"]')
    .clear()
    .type(faker.lorem.words(3));
  cy.get('@dialog')
    .get('[id="mui-component-select-grade"]')
    .click();

  cy.get('[role="listbox"] > [role="option"]')
    .first()
    .click();

  cy.get('@dialog')
    .contains('Save')
    .click();

  cy.notification({ variant: 'success', text: 'Updated' });

  cy.get('[aria-label="close"]').click();

  cy.get('@dialog').should('not.exist');
  cy.wait(100);
}

function editFinalRankingForm() {
  cy.get('[role="dialog"]').should('exist');

  cy.get('#commentForUser').scrollIntoView();
  cy.get('#commentForUser')
    .clear()
    .type(faker.lorem.words(3));

  cy.get('#commentForManagement')
    .clear()
    .type(faker.lorem.words(3));

  cy.get('#rankOrder')
    .clear()
    .type('5');

  cy.contains('External reviews')
    .parent()
    .find('table')
    .as('reviewsTable');

  cy.get('@reviewsTable').contains('Carl Carlsson');
  cy.get('@reviewsTable').contains('Benjamin Beckley');

  cy.get('[data-cy="save"]').click();

  cy.notification({ variant: 'success', text: 'Saved!' });
}

const sepMembers = {
  chair: {
    email: 'ben@inbox.com',
    password: 'Test1234!',
    surname: 'Beckley',
  },
  secretary: {
    email: 'Javon4@hotmail.com',
    password: 'Test1234!',
    surname: 'Carlsson',
  },
  reviewer: {
    email: 'nils@ess.se',
    password: 'Test1234!',
    surname: 'Nilsson',
  },
};

context('Scientific evaluation panel tests', () => {
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

    searchUser(sepMembers.chair.surname);

    cy.get('[role="dialog"] table tbody tr')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .first()
      .then(element => {
        selectedChairUserFirstName = element.text();
      });

    cy.get('[role="dialog"] table tbody tr')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .eq(1)
      .then(element => {
        selectedChairUserLastName = element.text();
      });

    cy.get('[title="Select user"]')
      .first()
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

    searchUser(sepMembers.secretary.surname);

    cy.get('[role="dialog"] table tbody tr')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .first()
      .then(element => {
        selectedSecretaryUserFirstName = element.text();
      });

    cy.get('[role="dialog"] table tbody tr')
      .first()
      .find('td.MuiTableCell-alignLeft')
      .eq(1)
      .then(element => {
        selectedSecretaryUserLastName = element.text();
      });

    cy.get('[title="Select user"]')
      .first()
      .click();

    cy.notification({
      variant: 'success',
      text: 'SEP secretary assigned successfully',
    });

    cy.reload();

    cy.contains('Logs').click({ force: true });

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.get('input[id="SEPSecretary"]').should(element => {
      expect(element.val()).to.contain(
        `${selectedSecretaryUserFirstName} ${selectedSecretaryUserLastName}`
      );
    });
  });

  it('SEP Chair should not be able to modify SEP Chair and SEP Secretary', () => {
    cy.login(sepMembers.chair);

    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Set SEP Chair"]').should('not.exist');
    cy.get('[title="Set SEP Secretary"]').should('not.exist');

    cy.get('[title="Remove SEP Chair"]').should('not.exist');
    cy.get('[title="Remove SEP Secretary"]').should('not.exist');
  });

  it('SEP Chair should be able to modify SEP Reviewers', () => {
    cy.login(sepMembers.chair);

    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[data-cy="add-member"]').click();

    cy.finishedLoading();

    searchUser(sepMembers.reviewer.surname);

    cy.get('input[type="checkbox"')
      .eq(1)
      .click();

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member assigned successfully',
    });

    cy.contains(sepMembers.reviewer.surname);

    cy.get('[title="Remove reviewer"]').click();
    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });

    cy.get('body').should('not.contain', sepMembers.reviewer.surname);
    cy.contains('No records to display');
  });

  it('SEP Secretary should not be able to modify SEP Chair and SEP Secretary', () => {
    cy.login(sepMembers.secretary);

    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Set SEP Chair"]').should('not.exist');
    cy.get('[title="Set SEP Secretary"]').should('not.exist');

    cy.get('[title="Remove SEP Chair"]').should('not.exist');
    cy.get('[title="Remove SEP Secretary"]').should('not.exist');
  });

  it('SEP Secretary should be able to modify SEP Reviewers', () => {
    cy.login(sepMembers.secretary);

    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.get('[data-cy="add-member"]').click();

    cy.finishedLoading();

    searchUser(sepMembers.reviewer.surname);

    cy.get('input[type="checkbox"')
      .eq(1)
      .click();

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member assigned successfully',
    });

    cy.contains(sepMembers.reviewer.surname);

    cy.get('[title="Remove reviewer"]').click();
    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });

    cy.get('body').should('not.contain', sepMembers.reviewer.surname);
    cy.contains('No records to display');
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

    searchUser(sepMembers.reviewer.surname);

    cy.get('input[type="checkbox"')
      .eq(1)
      .click();

    cy.contains('Update').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member assigned successfully',
    });

    cy.contains(sepMembers.reviewer.surname);

    cy.contains('Logs').click();

    cy.contains('SEP_MEMBERS_ASSIGNED');
  });

  it('SEP Reviewer should not be able to modify SEP members', () => {
    cy.login(sepMembers.reviewer);

    cy.changeActiveRole('SEP Reviewer');

    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Set SEP Chair"]').should('not.exist');
    cy.get('[title="Set SEP Secretary"]').should('not.exist');

    cy.get('[title="Remove SEP Chair"]').should('not.exist');
    cy.get('[title="Remove SEP Secretary"]').should('not.exist');

    cy.get('[data-cy="add-member"]').should('not.exist');
    cy.get('[title="Remove reviewer"]').should('not.exist');
  });

  it('Officer should be able to assign proposal to existing SEP', () => {
    cy.login('user');
    cy.createProposal();
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

    // Manually changing the proposal status to be shown in the SEPs. -------->
    cy.get('[title="View proposal"]')
      .first()
      .click();

    cy.contains('Admin').click();

    cy.get('#mui-component-select-proposalStatus').click();

    cy.contains('SEP_REVIEW').click();

    cy.get('[type="submit"]').click();
    // <------------------------------------------

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

    cy.get('[role="dialog"]')
      .contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Add reviewer"]')
      .click();

    cy.notification({
      variant: 'success',
      text: 'assigned',
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.get("[title='Show Reviewers']")
      .first()
      .click();
    cy.contains(sepMembers.reviewer.surname);

    cy.contains('Logs').click();

    cy.finishedLoading();

    cy.get("[title='Last Page'] button")
      .first()
      .click();

    cy.contains('SEP_MEMBER_ASSIGNED_TO_PROPOSAL');
  });

  it('SEP Chair should be able to assign SEP member to proposal in existing SEP', () => {
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

    cy.get('[role="dialog"]')
      .contains(sepMembers.chair.surname)
      .parent()
      .find('[title="Add reviewer"]')
      .click();

    cy.notification({
      variant: 'success',
      text: 'assigned',
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.get("[title='Show Reviewers']")
      .first()
      .click();

    cy.contains(sepMembers.chair.surname);
  });

  it('SEP Secretary should be able to assign SEP member to proposal in existing SEP', () => {
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

    cy.get('[role="dialog"]')
      .contains(sepMembers.secretary.surname)
      .parent()
      .find('[title="Add reviewer"]')
      .click();

    cy.notification({
      variant: 'success',
      text: 'assigned',
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.get("[title='Show Reviewers']")
      .first()
      .click();

    cy.contains(sepMembers.secretary.surname);
  });

  it('SEP Reviewer should not be able to assign SEP member to proposal', () => {
    cy.login(sepMembers.reviewer);
    cy.changeActiveRole('SEP Reviewer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get("[title='Assign SEP Member']").should('not.exist');
  });

  it('Officer should be able to read/write reviews', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get('[title="Show Reviewers"]').click();

    cy.contains(sepMembers.chair.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.secretary.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();
  });

  it('SEP Chair should be able to read/write reviews', () => {
    cy.login(sepMembers.chair);
    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get('[title="Show Reviewers"]').click();

    cy.contains(sepMembers.chair.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.secretary.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();
  });

  it('SEP Secretary should be able to read/write reviews', () => {
    cy.login(sepMembers.secretary);
    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get('[title="Show Reviewers"]').click();

    cy.contains(sepMembers.chair.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.secretary.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();

    cy.contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();
  });

  it('SEP Reviewers should only be able to access their own reviews', () => {
    cy.login(sepMembers.reviewer);
    cy.changeActiveRole('SEP Reviewer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get('[title="Show Reviewers"]').click();

    cy.get('body').should('not.contain', sepMembers.chair.surname);
    cy.get('body').should('not.contain', sepMembers.secretary.surname);

    cy.contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Review proposal"]')
      .click();
    readWriteReview();
  });

  it('Officer should get error when trying to delete proposal which has dependencies (like reviews)', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[type="checkbox"]')
      .first()
      .check();

    cy.get('[title="Delete proposals"]').click();
    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'error',
      text: /Failed to delete proposal with ID "([^"]+)", it has dependencies which need to be deleted first/i,
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

  it('Officer should not be able to submit an instrument if all proposals are not ranked in SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get("[title='Submit instrument']")
      .first()
      .click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'error',
      text: 'All proposals must have rankings',
    });

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Submit instrument"]').should('not.be.disabled');
  });

  it('Officer should be able to see calculated availability time on instrument per SEP inside meeting components', () => {
    const code = faker.random.words(3);
    const description = faker.random.words(8);

    cy.login('user');
    cy.createProposal();
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

  it('Officer should be able to edit SEP Meeting form', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    editFinalRankingForm();
  });

  it('SEP Chair should be able to edit SEP Meeting form', () => {
    cy.login(sepMembers.chair);
    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    editFinalRankingForm();
  });

  it('SEP Secretary should be able to edit SEP Meeting form', () => {
    cy.login(sepMembers.secretary);
    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    editFinalRankingForm();
  });

  it('SEP Reviewer should not be able to edit SEP Meeting form', () => {
    cy.login(sepMembers.reviewer);
    cy.changeActiveRole('SEP Reviewer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    cy.get('#commentForUser').should('be.disabled');

    cy.get('#commentForManagement').should('be.disabled');

    cy.get('#rankOrder').should('be.disabled');

    cy.get('[data-cy="save"]').should('not.exist');
    cy.get('[data-cy="saveAndContinue"]').should('not.exist');
    cy.get('[role="presentation"]').should('not.contain', 'External reviews');
  });

  it('SEP Reviewer should not be able to access details proposal view if they are not assigned to the proposal', () => {
    // remove SEP Reviewer
    cy.login(sepMembers.chair);
    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();
    cy.finishedLoading();

    cy.get('[title="Show Reviewers"').click();

    cy.contains(sepMembers.reviewer.surname)
      .parent()
      .find('[title="Remove assignment"]')
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'Reviewer removed' });

    cy.logout();

    // Check as a SEP Reviewer
    cy.login(sepMembers.reviewer);
    cy.changeActiveRole('SEP Reviewer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').should('not.exist');
  });

  it('Officer should be able to set SEP time allocation', () => {
    cy.login('officer');
    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.get('[title="View proposal details"]').click();

    cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
    cy.get('[data-cy="edit-sep-time-allocation"]').click();

    cy.get('[data-cy="timeAllocation"] input').as('timeAllocation');

    cy.get('@timeAllocation').should('have.value', '');
    cy.get('@timeAllocation').type('987654321');
    cy.get('[data-cy="save-time-allocation"]').click();

    cy.finishedLoading();

    cy.contains('987654321 (Overwritten)');

    cy.get('[aria-label="close"]').click();
    cy.contains('987654321');

    cy.reload();
    cy.contains('Meeting Components').click();
    cy.get('[title="Show proposals"]').click();

    cy.get('[title="View proposal details"]').click();

    cy.get('[data-cy="edit-sep-time-allocation"]').click();
    cy.get('@timeAllocation').should('have.value', '987654321');
    cy.get('@timeAllocation').clear();
    cy.get('[data-cy="save-time-allocation"]').click();

    cy.finishedLoading();

    cy.get('body').should('not.contain', '987654321 (Overwritten)');
  });

  it('should use SEP time allocation (if set) when calculating if they fit in available time', () => {
    cy.login('officer');
    cy.contains('SEPs').click();

    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.get(
      '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
    ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

    cy.get('[title="View proposal details"]').click();

    cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
    cy.get('[data-cy="edit-sep-time-allocation"]').click();

    cy.get('[data-cy="timeAllocation"] input').as('timeAllocation');

    cy.get('@timeAllocation').should('be.empty');
    cy.get('@timeAllocation').type('15');
    cy.get('[data-cy="save-time-allocation"]').click();

    cy.finishedLoading();

    cy.contains('15 (Overwritten)');

    cy.get('[aria-label="close"]').click();

    cy.get(
      '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
    ).should('not.have.css', 'background-color', 'rgb(246, 104, 94)');
  });

  it('Officer should be able to submit an instrument if all proposals are ranked in existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Show proposals"]')
      .first()
      .click();

    cy.get('[title="View proposal details"]')
      .first()
      .click();

    cy.get('#commentForUser').scrollIntoView();
    cy.get('#commentForUser').type('Test');
    cy.get('#commentForManagement').type('Test');
    cy.get('#rankOrder').type('1');

    cy.get('[data-cy="saveAndContinue"]').click();

    cy.notification({ variant: 'success', text: 'Saved' });

    cy.get("[title='Submit instrument']")
      .first()
      .click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.get('[title="Submit instrument"] button').should('be.disabled');
  });

  it('Officer should be able to edit SEP Meeting form after instrument is submitted', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    editFinalRankingForm();
  });

  it('SEP Chair should not be able to edit SEP Meeting form after instrument is submitted', () => {
    cy.login(sepMembers.chair);
    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    cy.get('#commentForUser').should('be.disabled');

    cy.get('#commentForManagement').should('be.disabled');

    cy.get('#rankOrder').should('be.disabled');

    cy.get('[data-cy="save"]').should('not.exist');
    cy.get('[data-cy="saveAndContinue"]').should('not.exist');
  });

  it('SEP Secretary should be able to edit SEP Meeting form after instrument is submitted', () => {
    cy.login(sepMembers.secretary);
    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Meeting Components').click();
    cy.finishedLoading();

    cy.get('[title="Show proposals"]').click();

    cy.finishedLoading();

    cy.get('[title="View proposal details"]').click();

    cy.get('#commentForUser').should('be.disabled');

    cy.get('#commentForManagement').should('be.disabled');

    cy.get('#rankOrder').should('be.disabled');

    cy.get('[data-cy="save"]').should('not.exist');
    cy.get('[data-cy="saveAndContinue"]').should('not.exist');
  });

  it('Download SEP is working with dialog window showing up', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Meeting Components').click();

    cy.finishedLoading();

    cy.wait(500);

    cy.get('[data-cy="download-sep-xlsx"]').click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');
    cy.get('[data-cy="preparing-download-dialog-item"]').contains('call 1');
  });

  it('Should be able to download SEP as Excel file', () => {
    cy.login('officer');

    cy.contains('Sample safety').click();

    cy.request('GET', '/download/xlsx/sep/2/call/1').then(response => {
      expect(response.headers['content-type']).to.be.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.status).to.be.equal(200);
    });
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

    cy.get('[data-cy="sep-reviewer-assignments-table"] table tbody tr').as(
      'rows'
    );

    // we testing a bug here, where the list didn't update
    // properly after removing an assignment
    function assertAndRemoveAssignment(length: number) {
      cy.get('@rows').should('have.length', length);

      cy.get('[title="Remove assignment"]')
        .first()
        .click();
      cy.get('[title="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Reviewer removed',
      });
    }

    assertAndRemoveAssignment(2);
    assertAndRemoveAssignment(1);

    cy.get('@rows')
      .parent()
      .contains('No records to display');

    cy.contains('Logs').click();

    cy.finishedLoading();

    cy.get("[title='Last Page'] button")
      .first()
      .click();

    cy.contains('SEP_MEMBER_REMOVED_FROM_PROPOSAL');
  });

  it('SEP Chair should not be able to remove assigned proposal from existing SEP', () => {
    cy.login(sepMembers.chair);
    cy.changeActiveRole('SEP Chair');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get('[title="Remove assigned proposal"]').should('not.exist');
  });

  it('SEP Secretary should not be able to remove assigned proposal from existing SEP', () => {
    cy.login(sepMembers.secretary);
    cy.changeActiveRole('SEP Secretary');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .first()
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get('[title="Remove assigned proposal"]').should('not.exist');
  });

  it('Officer should be able to remove assigned proposal from existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Proposals and Assignments').click();

    cy.finishedLoading();

    cy.get('[title="Remove assigned proposal"]').click();
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

  it('Officer should be able to remove assigned SEP Chair and SEP Secretary from existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Remove SEP Chair"]').click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });

    cy.get('[title="Remove SEP Secretary"]').click();

    cy.get('[data-cy="confirm-yes"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });
  });

  it('Officer should be able to remove SEP Reviewers from existing SEP', () => {
    cy.login('officer');

    cy.contains('SEPs').click();
    cy.get('button[title="Edit"]')
      .eq(1)
      .click();

    cy.contains('Members').click();

    cy.get('[title="Remove reviewer"]').click();

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
});
