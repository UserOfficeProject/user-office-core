import faker from 'faker';

faker.seed(1);

context('visitations tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const proposalTitle = faker.lorem.words(2);

  const visitationTemplateName = faker.lorem.words(2);
  const visitationTemplateDescription = faker.lorem.words(3);

  const startDateQuestionTitle = 'Visitation start';
  const endDateQuestionTitle = 'Visitation end';

  it('Should be able to create visitations template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Visitation templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(visitationTemplateName)
      .should('have.value', visitationTemplateName);

    cy.get('[data-cy=description]').type(visitationTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('New visitation');

    cy.createDateQuestion(startDateQuestionTitle);
    cy.createDateQuestion(endDateQuestionTitle);

    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Visitation templates');

    cy.get("[title='Mark as active']").click();
  });

  it('Should be able to create visitation', () => {
    cy.login('user');

    cy.createProposal(proposalTitle);

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('My visitations').click();

    cy.contains('Create').click();

    cy.contains('Save and continue').click();

    cy.contains('Proposal is required');

    cy.get("[id='mui-component-select-visitation_basis.proposalId']")
      .first()
      .click();

    cy.contains(proposalTitle).click();

    cy.contains('Proposal is required').should('not.exist');

    cy.get('[title="Add More Visitors"]').click();

    cy.contains('Carlsson').parent().find('[type="checkbox"]').click();

    cy.contains('Update').click();

    cy.contains(startDateQuestionTitle).parent().find('button').click();
    cy.contains('14').click();

    cy.contains(endDateQuestionTitle).parent().find('button').click();
    cy.contains('16').click();

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.notification({ variant: 'success', text: 'Saved' });

    cy.get('[data-cy=confirm-ok]').click();

    cy.get('body').type('{esc}');

    cy.contains(proposalTitle);
  });

  it('Should be able to delete visitation', () => {
    cy.login('user');

    cy.contains('My visitations').click();

    cy.contains(proposalTitle)
      .parent()
      .get("[title='Delete visitation']")
      .click();

    cy.contains('OK').click();

    cy.notification({ variant: 'success', text: 'Visitation deleted' });

    cy.should('not.contain', proposalTitle);
  });
});
