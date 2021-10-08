import faker from 'faker';
context('PageTable component tests', () => {
  const emails = new Array(5).fill(0).map(() => faker.internet.email());
  const username1 = 'Benjamin';
  const username2 = 'Unverified';
  const title = faker.random.words(3);
  const abstract = faker.random.words(8);

  before(() => {
    cy.resetDB();
  });

  describe('ProposalPeopleTable component Preserve selected users', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it('should add a new collaborator', () => {
      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('No Previous Collaborators');

      cy.finishedLoading();
      cy.wait(500);

      cy.get('[data-cy=email]').type('ben@inbox.com');
      cy.wait(500);

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"]').contains('Benjamin');

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('[data-cy="email"]').type('Aaron_Harris49@gmail.com');

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').contains('We cannot find that email');

      cy.get('@modal').contains('1 Users(s) Selected');

      cy.get('[data-cy="assign-selected-users"]').click();

      cy.get('@modal').contains('Benjamin');

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

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]')
        .find('tr[index="0"]')
        .contains('Benjamin');
    });

    it('should preserve the selected users', () => {
      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');

      cy.finishedLoading();

      cy.get('[data-cy=email]').type('unverified-user@example.com');

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"] input').uncheck();

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('[data-cy=email]').type('ben@inbox.com');

      cy.get('[data-cy="findUser"]').click();
      cy.finishedLoading();

      cy.get('@modal').find('tr[index="0"]').contains('Benjamin');

      cy.get('@modal').contains('1 user(s) selected');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"]').type('foo bar');

      cy.finishedLoading();

      cy.get('@modal').contains('No Previous Collaborators');
      cy.get('@modal').contains('1 user(s) selected');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"] ~ * > button').click();

      cy.wait(500);

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('tr[index="0"] input:checked');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"]').type('Unverified email');

      //How long before the search fires
      cy.wait(500);

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal').find('tr[index="0"]').contains('Unverified email');
      cy.get('@modal').find('tr[index="0"] input:not(:checked)');

      cy.get('@modal').find('[aria-label="Search"]').clear().type('Benjamin');

      cy.wait(500);

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal').find('tr[index="0"]').contains('Benjamin');
      cy.get('@modal').find('tr[index="0"] input:checked');

      cy.get('[data-cy="assign-selected-users"]').click();
    });

    it('should preserve the selected users after pagination', () => {
      cy.wait(1000);

      cy.request({
        url: '/graphql',
        method: 'POST',
        headers: {
          authorization: `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`,
        },
        body: new Array(5).fill(0).map((elem, index) => {
          return {
            query: ` mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String) {
              createUser(user_title: $user_title, firstname: $firstname, middlename: $middlename, lastname: $lastname, password: $password, preferredname: $preferredname, orcid: $orcid, orcidHash: $orcidHash, refreshToken: $refreshToken, gender: $gender, nationality: $nationality, birthdate: $birthdate, organisation: $organisation, department: $department, position: $position, email: $email, telephone: $telephone, telephone_alt: $telephone_alt, otherOrganisation: $otherOrganisation) {
                user {
                  id
                }
              }
            }`,
            variables: {
              user_title: faker.name.prefix(),
              firstname: faker.name.firstName(),
              lastname: faker.name.lastName(),
              password: 'Test1234!',
              orcid: '0000-0000-0000-0000',
              orcidHash: 'WRMVXa',
              refreshToken: '-',
              gender: '-',
              nationality: 1,
              birthdate: faker.date.between('1950', '1990'),
              organisation: 1,
              department: faker.commerce.department(),
              position: faker.name.jobTitle(),
              email: emails[index],
              telephone: faker.phone.phoneNumber('0##########'),
            },
          };
        }),
      });

      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.finishedLoading();

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
      cy.get('@modal').find('[title="Next Page"]').click();

      cy.get('@modal').find('tr[index="0"] input').check();
      cy.get('@modal').contains('3 user(s) selected');

      cy.get('@modal').find('[title="Previous Page"]').click();

      cy.get('@modal').find('tr[index="1"] input:checked');
      cy.get('@modal').contains('3 user(s) selected');

      cy.get('@modal').find('thead th input').check();
      cy.get('@modal').contains('6 user(s) selected');
      cy.get('@modal').find('thead th input').uncheck();
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[title="Next Page"]').click();
      cy.get('@modal').find('tr[index="0"] input:checked');
      cy.get('@modal').contains('1 user(s) selected');
    });
  });

  describe('PeopleTable component preserves selected users', () => {
    before(() => {
      cy.resetDB();
    });

    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it('should preserve the selected users', () => {
      cy.login('user');

      cy.contains('New Proposal').click();

      cy.createProposal();

      cy.logout();

      cy.login('officer');

      cy.get('[data-cy=view-proposal]').click();

      cy.get('[data-cy=toggle-edit-proposal]').click();

      cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('@modal').contains(username1).parent().find('input').check();

      cy.get('@modal').contains('1 user(s) selected');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"]').type('foo bar');

      cy.wait(500);

      cy.finishedLoading();

      cy.get('@modal').contains('No Users Found');

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"] ~ * > button').click();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal')
        .contains(username1)
        .parent()
        .find('input')
        .should('be.checked');

      cy.finishedLoading();

      cy.get('@modal').find('[aria-label="Search"]').type(username2);

      cy.wait(500);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(username2)
        .parent()
        .find('input')
        .should('not.be.checked');

      cy.get('@modal').find('[aria-label="Search"]').clear().type(username1);

      cy.wait(500);

      cy.finishedLoading();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal')
        .contains(username1)
        .parent()
        .find('input')
        .should('be.checked');

      cy.get('[data-cy="assign-selected-users"]').click();
    });

    it('should preserve the selected users after pagination', () => {
      cy.wait(1000);

      cy.request({
        url: '/graphql',
        method: 'POST',
        headers: {
          authorization: `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`,
        },
        body: new Array(5).fill(0).map(() => {
          return {
            query: ` mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String) {
              createUser(user_title: $user_title, firstname: $firstname, middlename: $middlename, lastname: $lastname, password: $password, preferredname: $preferredname, orcid: $orcid, orcidHash: $orcidHash, refreshToken: $refreshToken, gender: $gender, nationality: $nationality, birthdate: $birthdate, organisation: $organisation, department: $department, position: $position, email: $email, telephone: $telephone, telephone_alt: $telephone_alt, otherOrganisation: $otherOrganisation) {
                user {
                  id
                }
              }
            }`,
            variables: {
              user_title: faker.name.prefix(),
              firstname: faker.name.firstName(),
              lastname: faker.name.lastName(),
              password: 'Test1234!',
              orcid: '0000-0000-0000-0000',
              orcidHash: 'WRMVXa',
              refreshToken: '-',
              gender: '-',
              nationality: 1,
              birthdate: faker.date.between('1950', '1990'),
              organisation: 1,
              department: faker.commerce.department(),
              position: faker.name.jobTitle(),
              email: faker.internet.email(),
              telephone: faker.phone.phoneNumber('0##########'),
            },
          };
        }),
      });
      cy.login('officer');

      cy.get('[data-cy=view-proposal]').click();

      cy.get('[data-cy=toggle-edit-proposal]').click();

      cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');
      cy.get('@modal').contains(/1-5 of [0-9]+/);

      cy.get('@modal').find('tr[index="1"] input').check();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[title="Next Page"]').click();

      cy.get('@modal').find('tr[index="0"] input').check();
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('[title="Previous Page"]').click();

      cy.get('@modal').find('tr[index="1"] input:checked');
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('thead th input').check();
      cy.get('@modal').contains('6 user(s) selected');
      cy.get('@modal').find('thead th input').uncheck();
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[title="Next Page"]').click();
      cy.get('@modal').find('tr[index="0"] input:checked');
      cy.get('@modal').contains('1 user(s) selected');
    });
  });
});
