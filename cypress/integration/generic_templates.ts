import faker from 'faker';
function twoFakes(numberWords: number) {
  return [faker.lorem.words(numberWords), faker.lorem.words(numberWords)];
}

context('GenericTemplates tests', () => {
  before(() => {
    cy.resetDB(true);
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const proposalTemplateName = faker.lorem.words(2);
  const genericTemplateTemplateName = twoFakes(2);
  const genericTemplateTemplateQuestions = twoFakes(2);
  const genericTemplateTemplateDescription = twoFakes(2);
  const genericTemplateQuestion = twoFakes(4);
  const proposalTitle = twoFakes(2);
  const addButtonLabel = twoFakes(1);
  const genericTemplateTitle = faker.lorem.words(2);
  const proposalTitleUpdated = faker.lorem.words(2);
  const genericTemplateQuestionaryQuestion = twoFakes(2);
  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  it('Should be able to create proposal template with genericTemplate', () => {
    cy.login('officer');

    cy.finishedLoading();

    cy.createTemplate(
      'genericTemplate',
      genericTemplateTemplateName[0],
      genericTemplateTemplateDescription[0]
    );

    cy.get('[data-cy="proposal-question-id"').click();

    cy.get('[data-cy="question"').type(genericTemplateTemplateQuestions[0]);

    cy.get('[data-cy="submit"').click();

    cy.contains('New Sub Topic');

    cy.createTopic(faker.lorem.word());

    cy.createTextQuestion(genericTemplateQuestionaryQuestion[0]);

    cy.visit('/');

    cy.createTemplate(
      'genericTemplate',
      genericTemplateTemplateName[1],
      genericTemplateTemplateDescription[1]
    );

    cy.get('[data-cy="proposal-question-id"').click();

    cy.get('[data-cy="question"').type(genericTemplateTemplateQuestions[1]);

    cy.get('[data-cy="submit"').click();

    cy.contains('New Sub Topic');

    cy.createTopic(faker.lorem.word());

    cy.createTextQuestion(genericTemplateQuestionaryQuestion[1]);

    cy.visit('/');

    cy.createTemplate('proposal', proposalTemplateName);

    cy.createTopic('New topic');

    cy.createGenericTemplateQuestion(
      genericTemplateQuestion[0],
      genericTemplateTemplateName[0],
      addButtonLabel[0],
      {
        minEntries: 1,
        maxEntries: 2,
      }
    );

    cy.createGenericTemplateQuestion(
      genericTemplateQuestion[1],
      genericTemplateTemplateName[1],
      addButtonLabel[1],
      {
        minEntries: 0,
        maxEntries: 2,
      }
    );

    cy.contains(genericTemplateQuestion[0]); // checking if question in the topic column
    cy.contains(genericTemplateQuestion[1]); // checking if question in the topic column
  });

  it('Should be possible to change template in a call', () => {
    cy.login('officer');

    cy.createProposalWorkflow(
      proposalWorkflow.name,
      proposalWorkflow.description
    );

    cy.contains('Calls').click();

    cy.get('[title="Edit"]').click();

    cy.get('[data-cy=call-template]').click();

    cy.contains(proposalTemplateName).click();

    cy.get('[data-cy="call-workflow"]').click();
    cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({ text: 'Call updated successfully', variant: 'success' });
  });

  it('Should have different Question lables for different tables', () => {
    cy.login('user');

    cy.createProposal(proposalTitle[0]);

    cy.contains(addButtonLabel[0]).click();

    cy.contains(genericTemplateTemplateQuestions[0]).should('exist');

    cy.get('[data-cy=genericTemplate-declaration-modal]').type('{esc}');

    cy.contains(addButtonLabel[1]).click();

    cy.contains(genericTemplateTemplateQuestions[1]).should('exist');
  });

  it('Should be able to create proposal with genericTemplate', () => {
    cy.login('user');

    cy.createProposal(proposalTitle[1]);

    cy.contains(addButtonLabel[0]).click();

    cy.contains(genericTemplateTemplateQuestions[0]);

    cy.get('[data-cy=title-input] input').clear();

    cy.get(
      '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
    ).click();

    cy.contains('This is a required field');

    cy.get('[data-cy=title-input] input')
      .clear()
      .type(genericTemplateTitle)
      .should('have.value', genericTemplateTitle);

    cy.get(
      '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
    ).click();

    cy.finishedLoading();

    cy.get(
      '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
    ).click();

    cy.finishedLoading();

    cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

    cy.get('[data-cy="clone"]').click();

    cy.contains('OK').click();

    cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 2);

    cy.get('[data-cy="questionnaires-list-item-completed:true"]').should(
      'have.length',
      2
    );

    cy.contains(addButtonLabel[0]).should('be.disabled'); // Add button should be disabled because of max entry limit

    cy.get('[data-cy="delete"]').eq(1).click();

    cy.contains('OK').click();

    cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);
    cy.contains(addButtonLabel[0]).should('not.be.disabled');

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();
  });

  it('Should be able to clone proposal with GenericTemplates', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.contains(proposalTitle[1])
      .parent()
      .find('input[type="checkbox"]')
      .click();

    cy.get('[title="Clone proposals to call"]').click();

    cy.get('#selectedCallId-input').click();
    cy.get('[role="presentation"]').contains('call 1').click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal/s cloned successfully',
    });

    cy.contains(`Copy of ${proposalTitle[1]}`)
      .parent()
      .find('[title="View proposal"]')
      .click();

    cy.contains('Edit proposal').click();

    cy.contains('New topic').click();

    cy.get('[data-cy=questionnaires-list-item]')
      .contains(genericTemplateTitle)
      .click();

    cy.get('[data-cy="genericTemplate-declaration-modal"]').should('exist');
    cy.get(
      '[data-cy="genericTemplate-declaration-modal"] [data-cy=questionary-title]'
    ).contains(genericTemplateTitle);
  });

  it('User should not be able to submit proposal with unfinished genericTemplate', () => {
    cy.login('user');

    cy.createProposal();

    cy.contains(addButtonLabel[0]).click();

    cy.get('[data-cy=title-input] input')
      .clear()
      .type(genericTemplateTitle)
      .should('have.value', genericTemplateTitle);

    cy.get(
      '[data-cy="genericTemplate-declaration-modal"] [data-cy="save-and-continue-button"]'
    ).click();

    cy.finishedLoading();

    cy.get('body').type('{esc}');

    cy.finishedLoading();

    cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

    cy.get('[data-cy="save-and-continue-button"]').click();

    cy.contains('All genericTemplates must be completed');

    cy.contains(genericTemplateTitle).click();

    cy.get(
      '[data-cy="genericTemplate-declaration-modal"] [data-cy="save-and-continue-button"]'
    ).click();

    cy.get('.Mui-error').should('not.exist');

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();
  });

  it('Officer should able to delete proposal with genericTemplate', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get("input[type='checkbox']").first().click();

    cy.get("[title='Delete proposals']").first().click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.contains(proposalTitle[1]).should('not.exist');
  });
});
