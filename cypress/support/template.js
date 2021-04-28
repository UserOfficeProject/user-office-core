import faker from 'faker';

const navigateToTemplatesSubmenu = (submenuName) => {
  cy.contains('Templates').click();
  cy.get(`[title='${submenuName}']`).first().click();
};

const createTopic = (title) => {
  cy.get('[data-cy=show-more-button]').click();

  cy.get('[data-cy=add-topic-menu-item]').click();

  cy.wait(500);

  cy.get('[data-cy=topic-title]').last().click();

  cy.get('[data-cy=topic-title-input]').last().clear().type(`${title}{enter}`);
};

function createTemplate(type, title, description) {
  const templateTitle = title || faker.random.words(2);
  const templateDescription = description || faker.random.words(3);

  const typeToMenuTitle = new Map();
  typeToMenuTitle.set('proposal', 'Proposal templates');
  typeToMenuTitle.set('sample', 'Sample declaration templates');
  typeToMenuTitle.set('shipment', 'Shipment declaration templates');

  const menuTitle = typeToMenuTitle.get(type);
  if (!menuTitle) {
    throw new Error(`Type ${type} not supported`);
  }

  cy.navigateToTemplatesSubmenu(menuTitle);

  cy.get('[data-cy=create-new-button]').click();

  cy.get('[data-cy=name] input')
    .type(templateTitle)
    .should('have.value', templateTitle);

  cy.get('[data-cy=description]').type(templateDescription);

  cy.get('[data-cy=submit]').click();
}

function openQuestionsMenu() {
  cy.get('[data-cy=show-more-button]').last().click();

  cy.get('[data-cy=add-question-menu-item]').last().click();

  cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();
}

function closeQuestionsMenu() {
  cy.get('[data-cy=questionPicker] [data-cy=close-button]').click();
}

function createBooleanQuestion(question) {
  openQuestionsMenu();

  cy.contains('Add Boolean').click();

  cy.get('[data-cy=question]').clear().type(question);

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createTextQuestion(question, options) {
  openQuestionsMenu();

  cy.contains('Add Text Input').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.isRequired) {
    cy.contains('Is required').click();
  }

  if (options?.isMultipleLines) {
    cy.contains('Multiple lines').click();
  }

  if (options?.minimumCharacters !== undefined) {
    cy.get('[data-cy=max]').type(options.minimumCharacters.toString());
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }])
    .wait(500);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createDateQuestion(question) {
  openQuestionsMenu();

  cy.contains('Add Date').click();

  cy.get('[data-cy=question]').clear().type(question);

  cy.contains('Is required').click();

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createMultipleChoiceQuestion(question, options) {
  openQuestionsMenu();

  cy.contains('Add Multiple choice').click();

  cy.get('[data-cy=question]').clear().type(question);

  cy.contains('Radio').click();

  cy.contains('Dropdown').click();

  cy.contains('Is multiple select').click();

  cy.contains('Items').click();

  if (options.option1) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options.option1);
    cy.get('[title="Save"]').click();
  }

  if (options.option2) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options.option2);
    cy.get('[title="Save"]').click();
  }

  if (options.option3) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options.option3);
    cy.get('[title="Save"]').click();
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createFileUploadQuestion(question) {
  openQuestionsMenu();

  cy.contains('Add File Upload').click();

  cy.get('[data-cy=question]').clear().type(question);

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createNumberInputQuestion(question, options) {
  openQuestionsMenu();

  cy.contains('Add Number').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.units?.length > 0) {
    cy.get('[data-cy=units]>[role=button]').click({ force: true });
    for (let unit of options.units) {
      cy.contains(unit).click();
    }
    cy.get('body').type('{esc}');
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createIntervalQuestion(question, options) {
  openQuestionsMenu();

  cy.contains('Add Interval').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.units?.length > 0) {
    cy.get('[data-cy=units]>[role=button]').click({ force: true });
    for (let unit of options.units) {
      cy.contains(unit).click();
    }
    cy.get('body').type('{esc}');
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

const createSampleQuestion = (question, templateName, options) => {
  openQuestionsMenu();

  cy.contains('Add Sample Declaration').click();

  cy.get('[data-cy=question]')
    .clear()
    .type(question)
    .should('have.value', question);

  cy.get('[data-cy=template-id]').click();

  cy.contains(templateName).click();

  if (options?.minEntries) {
    cy.get('[data-cy=min-entries] input')
      .clear()
      .type(options.minEntries.toString());
  }

  if (options?.maxEntries) {
    cy.get('[data-cy=max-entries] input')
      .clear()
      .type(options.maxEntries.toString());
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
};

const createRichTextInput = (question, options) => {
  openQuestionsMenu();

  cy.contains('Add Rich Text Input').click();

  cy.get('[data-cy=question]')
    .clear()
    .type(question)
    .should('have.value', question);

  if (options?.maxChars) {
    cy.get('[data-cy="max"] input').clear().type(`${options.maxChars}`);
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
};

Cypress.Commands.add('createTemplate', createTemplate);

Cypress.Commands.add('navigateToTemplatesSubmenu', navigateToTemplatesSubmenu);

Cypress.Commands.add('createTopic', createTopic);

Cypress.Commands.add('createBooleanQuestion', createBooleanQuestion);

Cypress.Commands.add('createTextQuestion', createTextQuestion);

Cypress.Commands.add('createDateQuestion', createDateQuestion);

Cypress.Commands.add(
  'createMultipleChoiceQuestion',
  createMultipleChoiceQuestion
);

Cypress.Commands.add('createFileUploadQuestion', createFileUploadQuestion);

Cypress.Commands.add('createNumberInputQuestion', createNumberInputQuestion);

Cypress.Commands.add('createIntervalQuestion', createIntervalQuestion);

Cypress.Commands.add('createSampleQuestion', createSampleQuestion);

Cypress.Commands.add('createRichTextInput', createRichTextInput);
