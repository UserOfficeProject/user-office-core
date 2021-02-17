import faker from 'faker';

context('Proposal administration tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 900);
    cy.visit('/');
  });

  const proposalName = faker.random.words(3);
  const textUser = faker.random.words(5);

  const textManager = faker.random.words(5);

  it('Should be able to set comment for user/manager and final status', () => {
    cy.login('user');
    cy.createProposal(proposalName);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[data-cy=view-proposal]').click();

    cy.contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('#mui-component-select-proposalStatus').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[id="menu-proposalStatus"] [role="option"]')
      .first()
      .click();

    cy.get('[data-cy=commentForUser]').type(textUser);

    cy.get('[data-cy=commentForManagement]').type(textManager);

    cy.contains('Update').click();

    cy.notification({ variant: 'success', text: 'Updated' });

    cy.reload();

    cy.contains('Admin').click();

    cy.contains(textUser);

    cy.contains(textManager);

    cy.contains('Accepted');

    cy.contains('DRAFT');

    cy.contains('Proposals').click();

    cy.contains('DRAFT');
  });

  it('Download proposal is working with dialog window showing up', () => {
    cy.login('officer');

    cy.get('[data-cy="download-proposal"]')
      .first()
      .click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');
    cy.get('[data-cy="preparing-download-dialog-item"]').contains(proposalName);
  });

  it('Should be able to download proposal pdf', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.request('GET', '/download/pdf/proposal/1').then(response => {
      expect(response.headers['content-type']).to.be.equal('application/pdf');
      expect(response.status).to.be.equal(200);
    });
  });

  it('Should be able to save table selection state in url', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[type="checkbox"]')
      .eq(1)
      .click();

    cy.url().should('contain', 'selection=');

    cy.reload();

    cy.contains('1 row(s) selected');
  });

  it('Should be able to save table search state in url', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[placeholder="Search"]').type('test');

    cy.url().should('contain', 'search=test');

    cy.reload();

    cy.get('[placeholder="Search"]').should('have.value', 'test');
  });

  it('Should be able to save table sort state in url', () => {
    let officerProposalsTableAsTextBeforeSort = '';
    let officerProposalsTableAsTextAfterSort = '';

    cy.login('user');
    // Create a proposal with title that will be always last if sort order by title is 'desc'
    cy.createProposal(
      'Aaaaaaaaa test proposal title',
      'Test proposal descrtiption'
    );
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[data-cy="officer-proposals-table"] table').then(element => {
      officerProposalsTableAsTextBeforeSort = element.text();
    });

    cy.contains('Title').dblclick();

    cy.get('[data-cy="officer-proposals-table"] table').then(element => {
      officerProposalsTableAsTextAfterSort = element.text();
    });

    cy.reload();

    cy.finishedLoading();

    cy.get('[data-cy="officer-proposals-table"] table').then(element => {
      expect(element.text()).to.be.equal(officerProposalsTableAsTextAfterSort);
      expect(element.text()).not.equal(officerProposalsTableAsTextBeforeSort);
    });

    cy.get(
      '.MuiTableSortLabel-active .MuiTableSortLabel-iconDirectionDesc'
    ).should('exist');

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.contains('Short Code').click();

    cy.reload();

    cy.finishedLoading();

    cy.get(
      '.MuiTableSortLabel-active .MuiTableSortLabel-iconDirectionAsc'
    ).should('exist');
  });
});
