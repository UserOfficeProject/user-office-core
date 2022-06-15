import {
  DataType,
  TemplateCategoryId,
} from '@user-office-software-libs/shared-types';
import faker from 'faker';

import initialDBData from '../support/initialDBData';

context('Questions tests', () => {
  const textQuestion = faker.lorem.words(2);
  const samplesQuestion = initialDBData.questions.addSamples.text;

  beforeEach(() => {
    cy.resetDB(true);

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
  });

  it('User officer search questions', () => {
    cy.login('officer');
    cy.visit('/');

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

  it('Officer can delete question with action button', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.get('[data-cy=questions-table]').contains(textQuestion).should('exist');
    cy.get('[data-cy=questions-table]')
      .contains(textQuestion)
      .closest('tr')
      .find('[aria-label=Delete]')
      .click();
    cy.get('[aria-label=Save]').click();
    cy.finishedLoading();
    cy.contains(textQuestion).should('not.exist');
  });

  it('Officer can delete question from edit view', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.get('[data-cy=questions-table]').contains(textQuestion).should('exist');
    cy.get('[data-cy=questions-table]')
      .contains(textQuestion)
      .closest('tr')
      .find('[aria-label=Edit]')
      .click();

    cy.finishedLoading();

    cy.get('[role=dialog]').get('[data-cy=delete]').click();

    cy.get('[data-cy=confirm-ok]').click();

    cy.finishedLoading();

    cy.contains(textQuestion).should('not.exist');
  });

  it('Officer can open template', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=open-template-details-btn]').first().click();

    cy.finishedLoading();

    cy.get('[role=dialog]').contains(initialDBData.template.name).click();

    cy.url().should('contain', '/QuestionaryEditor/');

    cy.get('[data-cy=edit-metadata]').contains(initialDBData.template.name);
  });

  it('Officer can open proposal', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${initialDBData.questions.boolean.text}{enter}`);

    cy.get('[data-cy=open-answer-details-btn]').first().click();

    cy.get('[role=dialog]').contains(initialDBData.proposal.title).click();

    cy.url().should('contain', 'Proposals?reviewModal=1');

    cy.contains(`${initialDBData.proposal.title}`);
  });
});
