import faker from 'faker';

before(() => {
  cy.resetDB();
});

describe('PageTable component tests', () => {
  describe('Preserve selected users', () => {
    beforeEach(() => {
      cy.viewport(1300, 1200);
    });

    it('should preserve the selected users', () => {
      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');

      cy.get('@modal').find('tr[index="1"] input').click();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"]').type('foo bar');

      cy.get('@modal').contains('No records to display');
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[aria-label="Search"] ~ * > button').click();

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal').find('tr[index="1"] input:checked');

      cy.get('@modal').find('[aria-label="Search"]').type('Carlsson');

      cy.get('@modal').contains('1 user(s) selected');
      cy.get('@modal').find('tr[index="0"]').contains('Carlsson');
      cy.get('@modal').find('tr[index="0"] input:not(:checked)');

      cy.get('@modal').find('[aria-label="Search"]').clear().type('Benjamin');

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
        body: new Array(5).fill(0).map(() => {
          return {
            query: ` mutation createUser($user_title: String, $firstname: String!, $middlename: String, $lastname: String!, $password: String!, $preferredname: String, $orcid: String!, $orcidHash: String!, $refreshToken: String!, $gender: String!, $nationality: Int!, $birthdate: String!, $organisation: Int!, $department: String!, $position: String!, $email: String!, $telephone: String!, $telephone_alt: String, $otherOrganisation: String) {
              createUser(user_title: $user_title, firstname: $firstname, middlename: $middlename, lastname: $lastname, password: $password, preferredname: $preferredname, orcid: $orcid, orcidHash: $orcidHash, refreshToken: $refreshToken, gender: $gender, nationality: $nationality, birthdate: $birthdate, organisation: $organisation, department: $department, position: $position, email: $email, telephone: $telephone, telephone_alt: $telephone_alt, otherOrganisation: $otherOrganisation) {
                user {
                  id
                }
                error
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

      cy.login('user');

      cy.contains('New Proposal').click();

      cy.get('[title="Add Co-Proposers"]').click();

      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal').contains('0 user(s) selected');
      cy.get('@modal').contains('1-5 of 8');

      cy.get('@modal').find('tr[index="1"] input').click();

      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[title="Next Page"]').click();

      cy.get('@modal').find('tr[index="0"] input').click();
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('[title="Previous Page"]').click();

      cy.get('@modal').find('tr[index="1"] input:checked');
      cy.get('@modal').contains('2 user(s) selected');

      cy.get('@modal').find('thead th input').click();
      cy.get('@modal').contains('6 user(s) selected');
      cy.get('@modal').find('thead th input').click();
      cy.get('@modal').contains('1 user(s) selected');

      cy.get('@modal').find('[title="Next Page"]').click();
      cy.get('@modal').find('tr[index="0"] input:checked');
      cy.get('@modal').contains('1 user(s) selected');
    });
  });
});
