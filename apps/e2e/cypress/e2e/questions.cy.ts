import { faker } from '@faker-js/faker';
import {
  DataType,
  TemplateCategoryId,
} from '@user-office-software-libs/shared-types';

import initialDBData from '../support/initialDBData';

context('Questions tests', () => {
  const textQuestion = faker.lorem.words(2);
  const samplesQuestion = initialDBData.questions.addSamples.text;

  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();

    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.TEXT_INPUT,
    }).then((questionResult) => {
      if (questionResult.createQuestion) {
        cy.updateQuestion({
          id: questionResult.createQuestion.id,
          question: textQuestion,
        });
      }
    });
  });

  it('Clicking navigation buttons should render next page', () => {
    cy.login('officer');
    cy.visit(`/`);

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get("[data-cy='questions-table']").contains('1-10 of');

    cy.get("button[aria-label='Next Page']").click();
    cy.get("[data-cy='questions-table']").contains('11-20 of');

    cy.get("button[aria-label='Previous Page']").click();
    cy.get("[data-cy='questions-table']").contains('1-10 of');
  });

  it('Sorting by sortField should sort the table', () => {
    cy.login('officer');
    cy.visit(`/`);

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    // KEY
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('thead')
      .contains('Key')
      .click();

    cy.url().should('include', 'sortField=naturalKey');
    cy.url().should('include', 'sortDirection=asc');

    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody tr')
      .first()
      .contains('boolean_question');

    // KEY DESCENDING
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('thead')
      .contains('Key')
      .click();

    cy.url().should('include', 'sortField=naturalKey');
    cy.url().should('include', 'sortDirection=desc');

    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody tr')
      .first()
      .contains('visitat_basis');

    // CATEGORY
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('thead')
      .contains('Category')
      .click();

    cy.url().should('include', 'sortField=categoryId');
    cy.url().should('include', 'sortDirection=asc');

    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody tr')
      .first()
      .contains('FAP_REVIEW');

    // # ANSWERS
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('thead')
      .contains('# Answers')
      .click();

    cy.url().should('include', 'sortField=answers');
    cy.url().should('include', 'sortDirection=asc');

    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody tr')
      .first()
      .contains('1');

    // # TEMPLATES
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('thead')
      .contains('# Templates')
      .click();

    cy.url().should('include', 'sortField=templates');
    cy.url().should('include', 'sortDirection=asc');

    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody tr')
      .first()
      .contains('1');
  });

  it('Setting URL Query param pageSize to X should render X questions', () => {
    cy.login('officer');

    cy.visit(`/Questions?page=0&pageSize=5`);
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody')
      .find('tr')
      .should('have.length', 5);

    cy.visit(`/Questions?page=0&pageSize=10`);
    cy.get("[data-cy='questions-table'] table")
      .first()
      .find('tbody')
      .find('tr')
      .should('have.length', 10);
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
    cy.get('[placeholder="Search"]')
      .click()
      .clear()
      .type(`${modifiedQuestion}{enter}`);

    cy.contains(textQuestion).should('not.exist');

    cy.get('[placeholder="Search"]')
      .click()
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.contains(textQuestion);
  });

  it('Search text should be trimmed', () => {
    cy.login('officer');
    cy.visit('/');

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    const samplesQuestionWithSpaces = '   ' + samplesQuestion + '   ';

    cy.get('[placeholder="Search"]')
      .click()
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

    cy.get('[placeholder="Search"]')
      .click()
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

    cy.get('[placeholder="Search"]')
      .click()
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.get('[data-cy=questions-table]').contains(textQuestion).should('exist');
    cy.get('[data-cy=questions-table]')
      .contains(textQuestion)
      .closest('tr')
      .find('[data-testid=EditIcon]')
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

    cy.get('[placeholder="Search"]')
      .click()
      .clear()
      .type(`${initialDBData.questions.boolean.text}{enter}`);

    cy.get('[data-cy=open-answer-details-btn]').first().click();

    cy.get('[role=dialog]').contains(initialDBData.proposal.title).click();

    cy.url().should('contain', 'Proposals?reviewModal=1');

    cy.contains(`${initialDBData.proposal.title}`);
  });
});
