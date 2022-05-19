import faker from 'faker';

import initialDBData from '../support/initialDBData';

context('PageTable component tests', () => {
  const emails = new Array(10).fill(0).map(() => faker.internet.email());
  const title = faker.random.words(3);
  const abstract = faker.random.words(8);

  beforeEach(() => {
    cy.resetDB();
  });

  describe('ProposalPeopleTable component Preserve selected users', () => {
    it('Should add a new collaborator and that collaborator should stay as suggestion in the collaborators list', () => {
      cy.login('user');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"] [data-cy="co-proposers"]').as('modal');

      cy.get('@modal').contains('No Previous Collaborators');

      cy.finishedLoading();

      cy.get('[data-cy=email]').type(initialDBData.users.user2.email);

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal')
        .find('tr[index="0"]')
        .contains(initialDBData.users.user2.firstName);

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('[data-cy="email"]').type(initialDBData.users.userOfficer.email);

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('[role="presentation"] .MuiAlert-message').contains(
        'We cannot find that email'
      );

      cy.get('@modal').contains('1 Users(s) Selected');

      cy.get('[data-cy="assign-selected-users"]').click();

      cy.get('@modal').should('not.exist');

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Submit').click();

      cy.get('[data-cy=confirm-ok]').click();

      cy.contains('Dashboard').click();

      cy.contains('New Proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"]')
        .find('tr[index="0"]')
        .contains(initialDBData.users.user2.firstName);
    });

    it('Should preserve the selected users', () => {
      cy.login('user');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"] [data-cy="co-proposers"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('[data-cy=email]').type(initialDBData.users.placeholder.email);

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"] input').uncheck();

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('[data-cy=email]').type('ben@inbox.com');

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal')
        .find('tr[index="0"]')
        .contains(initialDBData.users.user2.firstName);

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"]').type('foo bar');

      cy.finishedLoading();

      cy.get('@modal').contains('No Previous Collaborators');
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"] ~ * > button').click();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal')
        .contains(initialDBData.users.user2.firstName)
        .parent()
        .find('input')
        .should('be.checked');

      cy.finishedLoading();

      cy.get('@modal')
        .find('[aria-label="Search"]')
        .type(initialDBData.users.placeholder.firstName);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(initialDBData.users.placeholder.firstName)
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      cy.get('@modal')
        .find('[aria-label="Search"]')
        .clear()
        .type(initialDBData.users.user2.firstName);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(initialDBData.users.user2.firstName)
        .parent()
        .find('input')
        .should('be.checked');

      cy.get('[data-cy="assign-selected-users"]').click();
    });

    it('should preserve the selected users after pagination', () => {
      // NOTE: Create 5 users
      new Array(5).fill(0).map((elem, index) => {
        cy.createUser({
          user_title: faker.name.prefix(),
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          password: 'Test1234!',
          orcid: '0000-0000-0000-0000',
          orcidHash: 'WRMVXa',
          refreshToken: '-',
          gender: '-',
          nationality: 1,
          birthdate: faker.date.between('1950', '1990').toISOString(),
          organisation: 1,
          department: faker.commerce.department(),
          position: faker.name.jobTitle(),
          email: emails[index],
          telephone: faker.phone.phoneNumber('0##########'),
        });
      });

      cy.login('user');
      cy.visit('/');

      cy.finishedLoading();
      cy.contains('New Proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.finishedLoading();

      cy.contains('10 rows').click();
      cy.get('[data-value=5]').click();

      for (const email of emails) {
        cy.finishedLoading();
        cy.get('[data-cy=email]').clear().type(email);

        cy.get('[data-cy="findUser"]').click();
        cy.finishedLoading();

        cy.get('@modal').find('tr[index="0"] input').uncheck();
      }

      cy.finishedLoading();
      cy.get('[data-cy=email]').clear().type('ben@inbox.com');

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal').contains(/1-5 of [0-9]+/);

      cy.get('@modal').find('tr[index="1"] input').check();

      cy.get('@modal').contains('2 user(s) selected');

      cy.finishedLoading();
      cy.get('@modal').find('button[aria-label="Next Page"]').click();

      cy.get('@modal').find('tr[index="0"] input').check();
      cy.get('@modal').contains('3 user(s) selected');

      cy.get('@modal').find('button[aria-label="Previous Page"]').click();

      cy.get('@modal').find('tr[index="1"] input:checked');
      cy.get('@modal').contains('3 user(s) selected');

      cy.get('@modal').find('thead th input').check();
      cy.get('@modal').contains('6 user(s) selected');
      cy.get('@modal').find('thead th input').uncheck();
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('button[aria-label="Next Page"]').click();
      cy.get('@modal').find('tr[index="0"] input:checked');
      cy.get('@modal').contains('1 user(s) selected');
      cy.get('[data-cy="assign-selected-users"]').click();

      cy.logout();
    });
  });

  describe('PeopleTable component preserves selected users', () => {
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id });
    });

    it('Should preserve the selected users', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=view-proposal]').click();

      cy.get('[data-cy=toggle-edit-proposal]').click();

      cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('@modal')
        .contains(initialDBData.users.user2.firstName)
        .parent()
        .find('input')
        .check();

      cy.get('@modal').contains('1 user(s) selected');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"]').type('foo bar');

      cy.finishedLoading();

      cy.get('@modal').contains('No Users');

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"] ~ * > button').click();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal')
        .contains(initialDBData.users.user2.firstName)
        .parent()
        .find('input')
        .should('be.checked');

      cy.finishedLoading();

      cy.get('@modal')
        .find('[aria-label="Search"]')
        .type(initialDBData.users.placeholder.firstName);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(initialDBData.users.placeholder.firstName)
        .parent()
        .find('input')
        .should('not.be.checked');

      cy.get('@modal')
        .find('[aria-label="Search"]')
        .clear()
        .type(initialDBData.users.user2.firstName);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(initialDBData.users.user2.firstName)
        .parent()
        .find('input')
        .should('be.checked');

      cy.get('[data-cy="assign-selected-users"]').click();
    });

    it('Should preserve the selected users after pagination', () => {
      // NOTE: Create 10 users
      new Array(10).fill(0).map((elem, index) => {
        cy.createUser({
          user_title: faker.name.prefix(),
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          password: 'Test1234!',
          orcid: '0000-0000-0000-0000',
          orcidHash: 'WRMVXa',
          refreshToken: '-',
          gender: '-',
          nationality: 1,
          birthdate: faker.date.between('1950', '1990').toISOString(),
          organisation: 1,
          department: faker.commerce.department(),
          position: faker.name.jobTitle(),
          email: emails[index],
          telephone: faker.phone.phoneNumber('0##########'),
        });
      });
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=view-proposal]').click();

      cy.get('[data-cy=toggle-edit-proposal]').click();

      cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.contains('10 rows').click();
      cy.get('[data-value=5]').click();

      cy.get('@modal').contains('0 user(s) selected');
      cy.get('@modal').contains(/1-5 of [0-9]+/);

      cy.get('@modal').find('tr[index="1"] input').check();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('button[aria-label="Next Page"]').click();

      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"] input').check();
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('button[aria-label="Previous Page"]').click();

      cy.finishedLoading();

      cy.get('@modal').find('tr[index="1"] input:checked');
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('thead th input').check();
      cy.get('@modal').contains('6 user(s) selected');
      cy.get('@modal').find('thead th input').uncheck();
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('button[aria-label="Next Page"]').click();

      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"] input:checked');
      cy.get('@modal').contains('1 user(s) selected');
    });
  });

  describe('PeopleTable sort', () => {
    it('PeopleTable should sort all people when using column sort', () => {
      // NOTE: Create 5 users
      new Array(5).fill(0).map((elem, index) => {
        cy.createUser({
          user_title: faker.name.prefix(),
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          password: 'Test1234!',
          orcid: '0000-0000-0000-0000',
          orcidHash: 'WRMVXa',
          refreshToken: '-',
          gender: '-',
          nationality: 1,
          birthdate: faker.date.between('1950', '1990').toISOString(),
          organisation: 1,
          department: faker.commerce.department(),
          position: faker.name.jobTitle(),
          email: emails[index],
          telephone: faker.phone.phoneNumber('0##########'),
        });
      });
      let firstTableRowTextBeforeSorting: string;
      let firstTableRowTextAfterSorting: string;
      cy.login('officer');
      cy.visit('/People');

      cy.finishedLoading();

      cy.get('[data-cy="people-table"]').should('exist');

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          firstTableRowTextBeforeSorting = element.text();
        });

      cy.intercept('POST', '/graphql', (req) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(req.continue()), 1000); // delay by 1 second to see the loader
        });
      }).as('delayedRequest');

      cy.get('[data-cy="people-table"] thead')
        .contains('Firstname')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.get('[data-cy="people-table"] [role="progressbar"]').should('exist');

      cy.wait('@delayedRequest');

      cy.finishedLoading();

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          firstTableRowTextAfterSorting = element.text();
          expect(firstTableRowTextBeforeSorting).not.equal(
            firstTableRowTextAfterSorting
          );
        });

      cy.get('[data-cy="people-table"] thead')
        .contains('Firstname')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.get('[data-cy="people-table"] [role="progressbar"]').should('exist');

      cy.wait('@delayedRequest');

      cy.finishedLoading();

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          expect(firstTableRowTextAfterSorting).not.equal(element.text());
        });
    });
  });
});
