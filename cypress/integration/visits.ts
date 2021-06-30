import faker from 'faker';

faker.seed(1);

context('visits tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/');
  });

  const proposalTitle = faker.lorem.words(2);

  const visitTemplateName = faker.lorem.words(2);
  const visitTemplateDescription = faker.lorem.words(3);

  const startDateQuestionTitle = 'Visit start';
  const endDateQuestionTitle = 'Visit end';

  it('Should be able to create visits template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Visit templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(visitTemplateName)
      .should('have.value', visitTemplateName);

    cy.get('[data-cy=description]').type(visitTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('New visit');

    cy.createDateQuestion(startDateQuestionTitle);
    cy.createDateQuestion(endDateQuestionTitle);

    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Visit templates');

    cy.get("[title='Mark as active']").click();
  });

  it('Should not be able to create visit for proposal that is not accepted', () => {
    cy.login('user');

    cy.createProposal(proposalTitle);

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Visits').click();

    cy.contains('Create').click();

    cy.get("[id='mui-component-select-visit_basis.proposalPk']")
      .first()
      .click();

    cy.should('not.contain', proposalTitle);

    cy.visit('/');

    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[data-cy=view-proposal]').click();
    cy.finishedLoading();
    cy.get('[role="dialog"]').contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('[data-cy="is-management-decision-submitted"]').click();

    cy.get('[data-cy="save-admin-decision"]').click();
  });

  it('Should be able to create visit', () => {
    cy.login('user');

    cy.createProposal(proposalTitle);

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Visits').click();

    cy.contains('Create').click();

    cy.contains('Save and continue').click();

    cy.contains('Proposal is required');

    cy.get("[id='mui-component-select-visit_basis.proposalPk']")
      .first()
      .click();

    cy.contains(proposalTitle).click();

    cy.contains('Proposal is required').should('not.exist');

    cy.get('[title="Add More Visitors"]').click();

    cy.contains('Carlsson').parent().find('[type="checkbox"]').click();
    cy.contains('Beckley').parent().find('[type="checkbox"]').click();

    cy.contains('Update').click();

    cy.contains(startDateQuestionTitle).parent().find('button').click();
    cy.contains('14').click();

    cy.contains(endDateQuestionTitle).parent().find('button').click();
    cy.contains('16').click();

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.notification({ variant: 'success', text: 'Saved' });

    cy.get('[data-cy=confirm-ok]').click();
  });

  it('Visitor should be able to see proposal', () => {
    cy.login({ email: 'ben@inbox.com', password: 'Test1234!' });

    cy.contains(proposalTitle);
  });

  it('Should be able to delete visit', () => {
    cy.login('user');

    cy.contains('Visits').click();

    cy.contains(proposalTitle).parent().get("[title='Delete visit']").click();

    cy.contains('OK').click();

    cy.notification({ variant: 'success', text: 'Visit deleted' });

    cy.should('not.contain', proposalTitle);
  });
});
