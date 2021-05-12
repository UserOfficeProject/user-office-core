import faker from 'faker';

function searchMuiTableAsync(search: string) {
  cy.get('[aria-label="Search"]').type(search);

  cy.get('[role="progressbar"]').should('exist');
  cy.get('[role="progressbar"]').should('not.exist');
}

function readWriteReview() {
  cy.get('[role="dialog"]').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information', { matchCase: false });
  cy.get('@dialog').contains('Technical review');
  cy.get('@dialog').contains('Grade').click({ force: true });

  cy.setTinyMceContent('comment', faker.lorem.words(3));

  cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

  cy.get('[role="listbox"] > [role="option"]').first().click();

  cy.get('@dialog').contains('Save').click();

  cy.notification({ variant: 'success', text: 'Updated' });

  cy.get('[aria-label="close"]').click();

  cy.get('@dialog').should('not.exist');
  cy.wait(100);
}

function editFinalRankingForm() {
  cy.get('[role="dialog"] > header + div').scrollTo('top');

  cy.setTinyMceContent('commentForUser', faker.lorem.words(3));
  cy.setTinyMceContent('commentForManagement', faker.lorem.words(3));

  cy.contains('External reviews').parent().find('table').as('reviewsTable');

  cy.get('@reviewsTable').contains('Carl Carlsson');
  cy.get('@reviewsTable').contains('Benjamin Beckley');

  cy.get('[data-cy="save"]').click();

  cy.notification({
    variant: 'success',
    text: 'successfully',
  });
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

const sep1 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
};

const sep2 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
};

const proposal1 = {
  proposalTitle: faker.random.words(3),
};

const proposal2 = {
  proposalTitle: faker.random.words(3),
};

context(
  'Scientific evaluation panel tests',
  {
    scrollBehavior: 'center',
  },
  () => {
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

    it('SEP REviewer should not able to see SEPs page', () => {
      cy.login(sepMembers.reviewer);

      cy.get('[data-cy="profile-page-btn"]').should('exist');

      let userMenuItems = cy.get('[data-cy="SEPReviewer-menu-items"]');

      userMenuItems.should('not.contain', 'SEPs');
    });

    it('Officer should be able to assign SEP Reviewer role', () => {
      cy.login('officer');

      cy.contains('People').click();
      searchMuiTableAsync(sepMembers.chair.surname);
      cy.get('[title="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[aria-label="Search"]').type('SEP Reviewer');
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
      cy.contains('People').click();

      searchMuiTableAsync(sepMembers.secretary.surname);
      cy.get('[title="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[aria-label="Search"]').type('SEP Reviewer');
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
    });

    it('Officer should be able to delete SEP', () => {
      const { code, description } = sep1;

      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('[title="Delete"]').last().click();

      cy.get('[title="Save"]').click();

      cy.notification({ variant: 'success', text: 'SEP deleted successfully' });
    });

    it('Officer should be able to create SEP', () => {
      const { code, description } = sep1;

      cy.login('officer');

      cy.contains('SEPs').click();
      cy.contains('Create').click();
      cy.get('#code').type(code);
      cy.get('#description').type(description);

      cy.get('[data-cy="sepActive"] input').should('be.checked');
      cy.get('[data-cy="sepActive"] input').uncheck();
      cy.get('[data-cy="sepActive"] input').should('not.be.checked');
      cy.get('[data-cy="sepActive"] input').check();
      cy.get('[data-cy="sepActive"] input').should('be.checked');

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
      cy.get('button[title="Edit"]').first().click();
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
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Members').click();

      cy.get('[title="Set SEP Chair"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.chair.surname);

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .first()
        .then((element) => {
          selectedChairUserFirstName = element.text();
        });

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .eq(1)
        .then((element) => {
          selectedChairUserLastName = element.text();
        });

      cy.get('[title="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP chair assigned successfully',
      });

      cy.contains('Logs').click({ force: true });

      cy.contains('SEP_MEMBERS_ASSIGNED');

      cy.contains('Members').click();

      cy.get('input[id="SEPChair"]').should((element) => {
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
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Members').click();

      cy.get('[title="Set SEP Secretary"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.secretary.surname);

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .first()
        .then((element) => {
          selectedSecretaryUserFirstName = element.text();
        });

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .eq(1)
        .then((element) => {
          selectedSecretaryUserLastName = element.text();
        });

      cy.get('[title="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP secretary assigned successfully',
      });

      cy.reload();

      cy.contains('Logs').click({ force: true });

      cy.contains('SEP_MEMBERS_ASSIGNED');

      cy.contains('Members').click();

      cy.get('input[id="SEPSecretary"]').should((element) => {
        expect(element.val()).to.contain(
          `${selectedSecretaryUserFirstName} ${selectedSecretaryUserLastName}`
        );
      });
    });

    it('SEP Chair should not be able to modify SEP Chair and SEP Secretary', () => {
      cy.login(sepMembers.chair);

      cy.changeActiveRole('SEP Chair');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.surname);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.surname);

      cy.closeNotification();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.surname);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.surname);

      cy.closeNotification();

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
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Members').click();

      cy.get('[title="Add Member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.surname);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.surname);

      cy.contains('Logs').click();

      cy.contains('SEP_MEMBERS_ASSIGNED');
    });

    it('Officer should be able to assign proposal to existing SEP', () => {
      cy.login('user');
      cy.createProposal(proposal1.proposalTitle);
      cy.contains('Submit').click();
      cy.contains('OK').click();
      cy.logout();

      cy.login('officer');

      cy.get('[type="checkbox"]').first().check();

      cy.get("[title='Assign proposals to SEP']").first().click();

      cy.get("[id='mui-component-select-selectedSEPId']").should(
        'not.have.class',
        'Mui-disabled'
      );

      cy.get("[id='mui-component-select-selectedSEPId']").first().click();

      cy.get("[id='menu-selectedSEPId'] li").first().click();

      cy.contains('Assign to SEP').click();

      // Manually changing the proposal status to be shown in the SEPs. -------->
      cy.changeProposalStatus('SEP_REVIEW', proposal1.proposalTitle);

      cy.contains(proposal1.proposalTitle)
        .parent()
        .find('[title="View proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Technical').click();
      cy.get('[data-cy="timeAllocation"]').type('51');
      cy.get('[data-cy="technical-review-status"]').click();
      cy.contains('Feasible').click();

      cy.get('[data-cy=save-technical-review] > .MuiButton-label').click();
      // <------------------------------------------

      cy.closeModal();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .should('have.length', 9);

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .last()
        .then((element) => {
          expect(element.text()).length.to.be.greaterThan(0);
        });
    });

    it('Officer should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle)
        .parent()
        .get('[title="View Proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.proposalTitle);
      cy.get('[role="dialog"]').contains('Download PDF');
    });

    it('Proposal should contain standard deviation field inside proposals and assignments', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[data-cy="sep-assignments-table"] thead').contains('Deviation');
    });

    it('Officer should be able to assign SEP member to proposal in existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[title='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.reviewer.surname)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get("[title='Show Reviewers']").first().click();
      cy.contains(sepMembers.reviewer.surname);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.get("[title='Last Page'] button").first().click();

      cy.contains('SEP_MEMBER_ASSIGNED_TO_PROPOSAL');
    });

    it('SEP Chair should be able to assign SEP member to proposal in existing SEP', () => {
      cy.login(sepMembers.chair);
      cy.changeActiveRole('SEP Chair');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[title='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.chair.surname)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get("[title='Show Reviewers']").first().click();

      cy.contains(sepMembers.chair.surname);
    });

    it('SEP Secretary should be able to assign SEP member to proposal in existing SEP', () => {
      cy.login(sepMembers.secretary);
      cy.changeActiveRole('SEP Secretary');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[title='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.secretary.surname)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get("[title='Show Reviewers']").first().click();

      cy.contains(sepMembers.secretary.surname);
    });

    it('Officer should be able to read/write reviews', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

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

    it('SEP Chair should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.login(sepMembers.chair);
      cy.changeActiveRole('SEP Chair');

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle)
        .parent()
        .get('[title="View Proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.proposalTitle);
      cy.get('[role="dialog"]').contains('Download PDF');
    });

    it('SEP Chair should be able to read/write reviews', () => {
      cy.login(sepMembers.chair);
      cy.changeActiveRole('SEP Chair');

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

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

    it('SEP Reviewer should be able to filter their reviews by status and bulk submit them', () => {
      cy.login(sepMembers.reviewer);

      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Draft').click();

      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle);

      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Submitted').click();

      cy.finishedLoading();

      cy.contains('No records to display');
      cy.contains(proposal1.proposalTitle).should('not.exist');

      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle).parent().contains('DRAFT');

      cy.contains(proposal1.proposalTitle)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="submit-proposal-reviews"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal review submitted successfully!',
      });

      cy.contains(proposal1.proposalTitle).parent().contains('SUBMITTED');
    });

    it('Officer should get error when trying to delete proposal which has dependencies (like reviews)', () => {
      cy.login('officer');

      cy.contains('Proposals').click();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[title="Delete proposals"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

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
      cy.get('[title="Assign Instrument"]').first().click();

      cy.get('[type="checkbox"]').first().check();

      cy.contains('Assign instrument').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Proposals').click();

      cy.get('table tbody [type="checkbox"]').first().check();

      cy.get("[title='Assign proposals to instrument']").first().click();

      cy.get("[id='mui-component-select-selectedInstrumentId']").should(
        'not.have.class',
        'Mui-disabled'
      );

      cy.get("[id='mui-component-select-selectedInstrumentId']")
        .first()
        .click();

      cy.get("[id='menu-selectedInstrumentId'] li").first().click();

      cy.contains('Assign to Instrument').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s assigned to the selected instrument',
      });

      cy.get('[title="Remove assigned instrument"]').should('exist');

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.contains(name);

      cy.get("[title='Submit instrument']").should('exist');

      cy.get("[title='Show proposals']").first().click();

      cy.get('[data-cy="sep-instrument-proposals-table"] thead').contains(
        'Deviation'
      );

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] [title="View proposal details"]'
      ).click();

      cy.finishedLoading();

      cy.contains('SEP Meeting form');
      cy.contains('Proposal details');
      cy.contains('External reviews');
    });

    it('Officer should not be able to submit an instrument if all proposals are not submitted in SEP meetings', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get("[title='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'error',
        text: 'All proposal SEP meetings should be submitted',
      });

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Submit instrument"]').should('not.be.disabled');
    });

    it('Officer should be able to see calculated availability time on instrument per SEP inside meeting components', () => {
      const { code, description } = sep2;

      cy.login('user');
      cy.createProposal(proposal2.proposalTitle);
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

      cy.contains('Members').click();

      cy.get('[title="Set SEP Chair"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.secretary.surname);

      cy.get('[title="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP chair assigned successfully',
      });

      cy.get('[title="Set SEP Secretary"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.chair.surname);

      cy.get('[title="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP secretary assigned successfully',
      });

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="1"]').click();

      cy.get('table tbody [type="checkbox"]').first().check();

      cy.get("[title='Assign proposals to SEP']").first().click();

      cy.get("[id='mui-component-select-selectedSEPId']").should(
        'not.have.class',
        'Mui-disabled'
      );

      cy.get("[id='mui-component-select-selectedSEPId']").first().click();

      cy.get("[id='menu-selectedSEPId'] li").first().click();

      cy.contains('Assign to SEP').click();

      cy.get('table tbody [type="checkbox"]').first().check();

      cy.get("[title='Assign proposals to instrument']").first().click();

      cy.get("[id='mui-component-select-selectedInstrumentId']").should(
        'not.have.class',
        'Mui-disabled'
      );

      cy.get("[id='mui-component-select-selectedInstrumentId']")
        .first()
        .click();

      cy.get("[id='menu-selectedInstrumentId'] li").first().click();

      cy.contains('Assign to Instrument').click();

      cy.changeProposalStatus('SEP_REVIEW', proposal2.proposalTitle);

      cy.contains(proposal2.proposalTitle)
        .parent()
        .find('[title="View proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Technical').click();
      cy.get('[data-cy="timeAllocation"]').type('51');
      cy.get('[data-cy="technical-review-status"]').click();
      cy.contains('Feasible').click();

      cy.get('[data-cy=save-technical-review] > .MuiButton-label').click();
      cy.closeModal();

      cy.contains('Calls').click();

      cy.get("[title='Show Instruments']").first().click();

      cy.get('[data-cy="call-instrument-assignments-table"] [title="Edit"]')
        .first()
        .click();

      cy.get("[data-cy='availability-time']").type('50');

      cy.get("[title='Save']").first().click();

      cy.notification({
        variant: 'success',
        text: 'Availability time set successfully',
      });

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[data-cy="SEP-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', '25');
    });

    it('SEP Chair should only see SEPs where they have SEP Chair role', () => {
      cy.login(sepMembers.chair);

      cy.changeActiveRole('SEP Chair');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code);
      cy.contains(sep2.code).should('not.exist');
    });

    it('SEP Secretary should only see SEPs where they have SEP Secretary role', () => {
      cy.login(sepMembers.secretary);

      cy.changeActiveRole('SEP Secretary');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code);
      cy.contains(sep2.code).should('not.exist');
    });

    it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
      cy.login('officer');

      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Show proposals"]').first().click();
      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
    });

    it('Officer should be able to edit SEP Meeting form', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[title="Show proposals"]').click();

      cy.finishedLoading();

      cy.get('[title="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Officer should be able to set SEP time allocation', () => {
      cy.login('officer');
      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Show proposals"]').click();

      cy.get('[title="View proposal details"]').click();

      cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-sep-time-allocation"]').click();

      cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

      cy.get('@timeAllocation').should('have.value', '');

      cy.get('@timeAllocation').type('-1').blur();
      cy.contains('Must be greater than or equal to');

      cy.get('@timeAllocation').clear().type('987654321').blur();
      cy.contains('Must be less than or equal to');

      cy.get('@timeAllocation').clear().type('9999');
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.contains('9999 (Overwritten)');

      cy.get('[aria-label="close"]').click();
      cy.contains('9999');

      cy.reload();
      cy.contains('Meeting Components').click();
      cy.get('[title="Show proposals"]').click();

      cy.get('[title="View proposal details"]').click();

      cy.get('[data-cy="edit-sep-time-allocation"]').click();
      cy.get('@timeAllocation').should('have.value', '9999');
      cy.get('@timeAllocation').clear();
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.get('body').should('not.contain', '9999 (Overwritten)');
    });

    it('should use SEP time allocation (if set) when calculating if they fit in available time', () => {
      cy.login('officer');
      cy.contains('SEPs').click();

      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Show proposals"]').click();

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

      cy.get('[title="View proposal details"]').click();

      cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-sep-time-allocation"]').click();

      cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

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

    it('Officer should be able to submit an instrument if all proposals SEP meetings are submitted in existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Show proposals"]').first().click();

      cy.get('[title="View proposal details"]').first().click();

      cy.get('[role="dialog"] > header + div').scrollTo('top');

      cy.setTinyMceContent('commentForUser', 'Test');
      cy.setTinyMceContent('commentForManagement', 'Test');

      cy.get('[data-cy="is-sep-meeting-submitted"]').click();
      cy.get('[data-cy="saveAndContinue"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP meeting decision submitted successfully',
      });

      cy.get("[title='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Instrument submitted',
      });

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .find('td')
        .eq(6)
        .should('not.contain.text', '-')
        .should('contain.text', '1');

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[title="Submit instrument"] button').should('be.disabled');
    });

    it('Officer should be able to edit SEP Meeting form after instrument is submitted', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

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

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[title="Show proposals"]').click();

      cy.finishedLoading();

      cy.get('[title="View proposal details"]').click();

      cy.get('#commentForUser')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('#commentForManagement')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('[data-cy="save"]').should('not.exist');
      cy.get('[data-cy="saveAndContinue"]').should('not.exist');
    });

    it('SEP Secretary should not be able to edit SEP Meeting form after instrument is submitted', () => {
      cy.login(sepMembers.secretary);
      cy.changeActiveRole('SEP Secretary');

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[title="Show proposals"]').click();

      cy.finishedLoading();

      cy.get('[title="View proposal details"]').click();

      cy.get('#commentForUser')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('#commentForManagement')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('[data-cy="save"]').should('not.exist');
      cy.get('[data-cy="saveAndContinue"]').should('not.exist');
    });

    it('Download SEP is working with dialog window showing up', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

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

      cy.request('GET', '/download/xlsx/sep/2/call/1').then((response) => {
        expect(response.headers['content-type']).to.be.equal(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        expect(response.status).to.be.equal(200);
      });
    });

    it('Officer should be able to remove assigned SEP member from proposal in existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[title='Show Reviewers']").first().click();

      cy.get('[data-cy="sep-reviewer-assignments-table"] table tbody tr').as(
        'rows'
      );

      // we testing a bug here, where the list didn't update
      // properly after removing an assignment
      function assertAndRemoveAssignment(length: number) {
        cy.get('@rows').should('have.length', length);

        cy.get('[title="Remove assignment"]').first().click();
        cy.get('[title="Save"]').click();

        cy.notification({
          variant: 'success',
          text: 'Reviewer removed',
        });
      }

      assertAndRemoveAssignment(3);
      cy.finishedLoading();
      assertAndRemoveAssignment(2);
      cy.finishedLoading();

      cy.get('@rows').should('have.length', 1);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.get("[title='Last Page'] button").first().click();

      cy.contains('SEP_MEMBER_REMOVED_FROM_PROPOSAL');
    });

    it('SEP Reviewer should be able to see reviews even if he/she is not direct reviewer but only member of the SEP', () => {
      cy.login(sepMembers.reviewer);
      cy.finishedLoading();

      cy.get('main table tbody').contains('No records to display');

      cy.get('[data-cy="reviewer-filter"]').click();

      cy.get('[data-value="ALL"]').click();

      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle)
        .parent()
        .find('[title="Review proposal"]')
        .click();

      cy.finishedLoading();

      cy.contains(proposal1.proposalTitle);
      cy.get('[role="dialog"]').contains('Grade').click();
      cy.get('textarea[id="comment"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('SEP Chair should not be able to remove assigned proposal from existing SEP', () => {
      cy.login(sepMembers.chair);
      cy.changeActiveRole('SEP Chair');

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[title="Remove assigned proposal"]').should('not.exist');
    });

    it('SEP Secretary should not be able to remove assigned proposal from existing SEP', () => {
      cy.login(sepMembers.secretary);
      cy.changeActiveRole('SEP Secretary');

      cy.finishedLoading();

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').first().click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[title="Remove assigned proposal"]').should('not.exist');
    });

    it('Officer should be able to remove assigned proposal from existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[title="Remove assigned proposal"]').click();
      cy.get('[title="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Assignment removed',
      });

      cy.closeNotification();

      cy.contains('Logs').click({ force: true });

      cy.finishedLoading();

      cy.contains('Assignments').click();

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .last()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });

    it('Officer should be able to remove assigned SEP Chair and SEP Secretary from existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[title="Remove SEP Chair"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.get('[title="Remove SEP Secretary"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });
    });

    it('Officer should be able to remove SEP Reviewers from existing SEP', () => {
      cy.login('officer');

      cy.contains('SEPs').click();
      cy.get('button[title="Edit"]').eq(1).click();

      cy.contains('Members').click();

      cy.get('[title="Remove reviewer"]').click();

      cy.get('[title="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.closeNotification();

      cy.contains('Logs').click({ force: true });

      cy.finishedLoading();

      cy.get("[title='Last Page'] button").first().click();

      cy.contains('SEP_MEMBER_REMOVED');

      cy.contains('Members').click();

      cy.get('[data-cy="sep-reviewers-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="sep-reviewers-table"]')
        .find('tbody td')
        .first()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });
  }
);
