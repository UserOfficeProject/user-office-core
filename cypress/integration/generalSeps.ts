import faker from 'faker';

function searchMuiTableAsync(search: string) {
  cy.get('[aria-label="Search"]').type(search);

  cy.get('[role="progressbar"]').should('exist');
  cy.get('[role="progressbar"]').should('not.exist');
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

context('General scientific evaluation panel tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
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
    cy.contains('SEPs').click();
    cy.get('[title="Delete"]').last().click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'SEP deleted successfully' });
  });

  it('Officer should be able to create SEPs', () => {
    const { code, description } = sep1;

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

    cy.contains('SEPs').click();

    cy.contains('Create').click();
    cy.get('#code').type(sep2.code);
    cy.get('#description').type(sep2.description);

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'SEP created successfully' });
    cy.contains('Update SEP');
    cy.get('#code').should('contain.value', sep2.code);
    cy.get('#description').should('contain.value', sep2.description);
    cy.url().should('contain', 'SEPPage/3');
  });

  it('Officer should be able to edit existing SEP', () => {
    const newCode = faker.random.words(3);
    const newDescription = faker.random.words(8);

    cy.contains('SEPs').click();
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();
    cy.get('#code').type(newCode);
    cy.get('#description').type(newDescription);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'SEP updated successfully' });

    sep1.code = newCode;
    sep1.description = newDescription;

    cy.contains('SEPs').click();

    let SEPsTable = cy.get('[data-cy="SEPs-table"]');

    SEPsTable.should('contain', newCode);
    SEPsTable.should('contain', newDescription);
  });

  it('Officer should be able to assign SEP Chair to existing SEP', () => {
    let selectedChairUserFirstName = '';
    let selectedChairUserLastName = '';

    cy.contains('SEPs').click();
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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

    cy.contains('Logs').click();

    cy.contains('SEP_MEMBERS_ASSIGNED');

    cy.contains('Members').click();

    cy.get('input[id="SEPChair"]').should((element) => {
      expect(element.val()).to.equal(
        `${selectedChairUserFirstName} ${selectedChairUserLastName}`
      );
    });
  });

  it('Officer should be able to assign SEP Secretary to existing SEP', () => {
    cy.login('officer');

    let selectedSecretaryUserFirstName = '';
    let selectedSecretaryUserLastName = '';

    cy.contains('SEPs').click();
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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

    cy.contains('Logs').click();

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

    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Set SEP Chair"]').should('not.exist');
    cy.get('[title="Set SEP Secretary"]').should('not.exist');

    cy.get('[title="Remove SEP Chair"]').should('not.exist');
    cy.get('[title="Remove SEP Secretary"]').should('not.exist');
  });

  it('SEP Chair should be able to modify SEP Reviewers', () => {
    cy.contains('SEPs').click();

    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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

    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

    cy.contains('Members').click();

    cy.finishedLoading();

    cy.get('[title="Set SEP Chair"]').should('not.exist');
    cy.get('[title="Set SEP Secretary"]').should('not.exist');

    cy.get('[title="Remove SEP Chair"]').should('not.exist');
    cy.get('[title="Remove SEP Secretary"]').should('not.exist');
  });

  it('SEP Secretary should be able to modify SEP Reviewers', () => {
    cy.contains('SEPs').click();

    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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

  it('Officer should be able to remove assigned SEP Chair and SEP Secretary from existing SEP', () => {
    cy.contains('SEPs').click();
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

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
    cy.contains('SEPs').click();
    cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

    cy.contains('Members').click();

    cy.get('[title="Remove reviewer"]').click();

    cy.get('[title="Save"]').click();

    cy.notification({
      variant: 'success',
      text: 'SEP member removed successfully',
    });

    cy.contains('Logs').click();

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
});
