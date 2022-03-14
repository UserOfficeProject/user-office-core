import faker from 'faker';

import { DataType, TemplateCategoryId } from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

context('Questions tests', () => {
  beforeEach(() => {
    cy.resetDB(true);
    cy.viewport(1920, 1080);
  });

  const textQuestion = faker.lorem.words(2);
  const samplesQuestion = initialDBData.questions.addSamples.text;

  it('User officer search questions', () => {
    cy.login('officer');
    cy.visit('/');

    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.TEXT_INPUT,
    }).then((questionResult) => {
      if (questionResult.createQuestion.question) {
        cy.updateQuestion({
          id: questionResult.createQuestion.question.id,
          question: textQuestion,
        });
      }
    });

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=category-dropdown]').click();
    cy.get('[role=presentation] ').contains('Sample declaration').click();

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=category-dropdown]').click();
    cy.get('[role=presentation]').contains('Proposal').click();

    cy.get('[data-cy=type-dropdown]').click();
    cy.get('[role=presentation] ').contains('Boolean').click();

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=type-dropdown]').click();
    cy.get('[role=presentation]')
      .find(`[data-value="${DataType.TEXT_INPUT}"]`)
      .click();

    cy.contains(textQuestion);

    const modifiedQuestion = textQuestion.split('').reverse().join();
    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${modifiedQuestion}{enter}`);

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.contains(textQuestion);
  });

  it('Search text should be trimmed', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    const samplesQuestionWithSpaces = '   ' + samplesQuestion + '   ';

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${samplesQuestionWithSpaces}{enter}`);

    cy.get('[data-cy=questions-table]')
      .contains(samplesQuestion)
      .should('exist');
  });

  it('Officer can delete question', () => {
    cy.login('officer');
    cy.visit('/');

    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.TEXT_INPUT,
    }).then((questionResult) => {
      if (questionResult.createQuestion.question) {
        cy.updateQuestion({
          id: questionResult.createQuestion.question.id,
          question: textQuestion,
        });
      }
    });

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.contains(textQuestion).should('exist');
    cy.contains(textQuestion).closest('tr').find('[title=Delete]').click();
    cy.get('[title=Save]').click();
    cy.finishedLoading();
    cy.contains(textQuestion).should('not.exist');
  });
});
