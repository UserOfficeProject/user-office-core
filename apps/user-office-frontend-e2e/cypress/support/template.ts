import {
  AnswerTopicMutation,
  AnswerTopicMutationVariables,
  CloneTemplateMutation,
  CloneTemplateMutationVariables,
  CreateGenericTemplateMutation,
  CreateGenericTemplateMutationVariables,
  CreateQuestionMutation,
  CreateQuestionMutationVariables,
  CreateQuestionTemplateRelationMutation,
  CreateQuestionTemplateRelationMutationVariables,
  CreateSampleMutation,
  CreateSampleMutationVariables,
  CreateTemplateMutation,
  CreateTemplateMutationVariables,
  CreateTopicMutation,
  CreateTopicMutationVariables,
  UpdateQuestionMutation,
  UpdateQuestionMutationVariables,
  UpdateQuestionTemplateRelationSettingsMutation,
  UpdateQuestionTemplateRelationSettingsMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const navigateToTemplatesSubmenu = (submenuName: string) => {
  cy.contains('Templates').click();
  cy.get(`[aria-label='${submenuName}']`).children().first().click();
};

const createTopic = (
  createTopicInput: CreateTopicMutationVariables
): Cypress.Chainable<CreateTopicMutation> => {
  const api = getE2EApi();
  const request = api.createTopic(createTopicInput);

  return cy.wrap(request);
};

const answerTopic = (
  answerTopicInput: AnswerTopicMutationVariables
): Cypress.Chainable<AnswerTopicMutation> => {
  const api = getE2EApi();
  const request = api.answerTopic(answerTopicInput);

  return cy.wrap(request);
};

const typeToMenuTitle = new Map();
typeToMenuTitle.set('proposal', 'Proposal');
typeToMenuTitle.set('sample', 'Sample declaration');
typeToMenuTitle.set('genericTemplate', 'Sub Template');
typeToMenuTitle.set('shipment', 'Shipment declaration templates');
typeToMenuTitle.set('visit', 'Visit registration');
typeToMenuTitle.set('proposalEsi', 'Experiment Safety Input (Proposal)');
typeToMenuTitle.set('sampleEsi', 'Experiment Safety Input (Sample)');

function createTemplate(
  createTemplateInput: CreateTemplateMutationVariables
): Cypress.Chainable<CreateTemplateMutation> {
  const api = getE2EApi();
  const request = api.createTemplate(createTemplateInput);

  return cy.wrap(request);
}

function cloneTemplate(
  cloneTemplateInput: CloneTemplateMutationVariables
): Cypress.Chainable<CloneTemplateMutation> {
  const api = getE2EApi();
  const request = api.cloneTemplate(cloneTemplateInput);

  return cy.wrap(request);
}

function createGenericTemplate(
  createGenericTemplateInput: CreateGenericTemplateMutationVariables
): Cypress.Chainable<CreateGenericTemplateMutation> {
  const api = getE2EApi();
  const request = api.createGenericTemplate(createGenericTemplateInput);

  return cy.wrap(request);
}

function openQuestionsMenu() {
  cy.get('[data-cy=show-more-button]').last().click();

  cy.get('[data-cy=add-question-menu-item]').last().click();

  cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();
}

function closeQuestionsMenu() {
  cy.get('[data-cy=questionPicker] [data-cy=close-button]').click();
}

function createQuestion(
  createQuestionInput: CreateQuestionMutationVariables
): Cypress.Chainable<CreateQuestionMutation> {
  const api = getE2EApi();
  const request = api.createQuestion(createQuestionInput);

  return cy.wrap(request);
}

function updateQuestion(
  updateQuestionInput: UpdateQuestionMutationVariables
): Cypress.Chainable<UpdateQuestionMutation> {
  const api = getE2EApi();
  const request = api.updateQuestion(updateQuestionInput);

  return cy.wrap(request);
}

function createSample(
  createSampleInput: CreateSampleMutationVariables
): Cypress.Chainable<CreateSampleMutation> {
  const api = getE2EApi();
  const request = api.createSample(createSampleInput);

  return cy.wrap(request);
}

function createQuestionTemplateRelation(
  createQuestionTemplateRelationInput: CreateQuestionTemplateRelationMutationVariables
): Cypress.Chainable<CreateQuestionTemplateRelationMutation> {
  const api = getE2EApi();
  const request = api.createQuestionTemplateRelation(
    createQuestionTemplateRelationInput
  );

  return cy.wrap(request);
}

function updateQuestionTemplateRelationSettings(
  updateQuestionTemplateRelationSettingsInput: UpdateQuestionTemplateRelationSettingsMutationVariables
): Cypress.Chainable<UpdateQuestionTemplateRelationSettingsMutation> {
  const api = getE2EApi();
  const request = api.updateQuestionTemplateRelationSettings(
    updateQuestionTemplateRelationSettingsInput
  );

  return cy.wrap(request);
}

function createBooleanQuestion(question: string, options?: { key?: string }) {
  openQuestionsMenu();

  cy.contains('Add Boolean').click();

  if (options?.key) {
    cy.get('[data-cy=natural_key]').clear().type(options.key);
  }

  cy.get('[data-cy=question]').clear().type(question);

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createTextQuestion(
  question: string,
  options?: {
    key?: string;
    isRequired?: boolean;
    isMultipleLines?: boolean;
    maxCharacters?: number;
  }
) {
  openQuestionsMenu();

  cy.contains('Add Text Input').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.key) {
    cy.get('[data-cy=natural_key]').clear().type(options.key);
  }

  if (options?.isRequired) {
    cy.contains('Is required').click();
  }

  if (options?.isRequired) {
    cy.contains('Is required').click();
  }

  if (options?.isMultipleLines) {
    cy.contains('Multiple lines').click();
  }

  if (options?.maxCharacters !== undefined) {
    cy.get('[data-cy=max]').type(options.maxCharacters.toString());
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createDateQuestion(
  question: string,
  options?: {
    includeTime?: boolean;
    isRequired?: boolean;
  }
) {
  openQuestionsMenu();

  cy.contains('Add Date').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.isRequired) {
    cy.contains('Is required').click();
  }

  if (options?.includeTime) {
    cy.contains('Include time').click();
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createMultipleChoiceQuestion(
  question: string,
  options?: {
    key?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    isMultipleSelect?: boolean;
    type?: 'radio' | 'dropdown';
  }
) {
  openQuestionsMenu();

  cy.contains('Add Multiple choice').click();

  if (options?.key) {
    cy.get('[data-cy=natural_key]').clear().type(options.key);
  }

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.type === undefined || options.type === 'dropdown') {
    cy.contains('Radio').click();

    cy.contains('Dropdown').click();
  }

  if (options?.isMultipleSelect === true) {
    cy.contains('Is multiple select').click();
  }

  if (options?.option1) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options?.option1);
    cy.get('[aria-label="Save"]').click();
  }

  if (options?.option2) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options.option2);
    cy.get('[aria-label="Save"]').click();
  }

  if (options?.option3) {
    cy.get('[data-cy=add-answer-button]').closest('button').click();
    cy.get('[placeholder=Answer]').type(options.option3);
    cy.get('[aria-label="Save"]').click();
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createFileUploadQuestion(question: string, fileTypes: string[]) {
  openQuestionsMenu();

  cy.contains('Add File Upload').click();

  cy.get('[data-cy=question]').clear().type(question);

  cy.get('[data-cy="file_type"]').click();

  fileTypes.forEach((type) => {
    cy.get('[role="presentation"]').contains(type).click();
  });

  cy.get('body').type('{esc}');

  cy.get('[data-cy=max_files]').clear().type('3');

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([
      { direction: 'left', length: 2 },
      { direction: 'down', length: 1 },
    ]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createNumberInputQuestion(
  question: string,
  options?: { key?: string; isRequired?: boolean; units?: string[] }
) {
  openQuestionsMenu();

  cy.contains('Add Number').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.key) {
    cy.get('[data-cy=natural_key]').clear().type(options.key);
  }

  if (options?.units && options.units.length > 0) {
    for (const unit of options.units) {
      cy.get('[data-cy=units]').find('[aria-label=Open]').click();
      cy.contains(unit).click();
    }
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

function createIntervalQuestion(
  question: string,
  options?: { units?: string[] }
) {
  openQuestionsMenu();

  cy.contains('Add Interval').click();

  cy.get('[data-cy=question]').clear().type(question);

  if (options?.units && options.units.length > 0) {
    for (const unit of options.units) {
      cy.get('[data-cy=units]').find('[aria-label=Open]').click();
      cy.contains(unit).click();
    }
  }

  cy.contains('Save').click();

  cy.contains(question)
    .parent()
    .dragElement([{ direction: 'left', length: 1 }]);

  cy.finishedLoading();

  closeQuestionsMenu();
}

const createSampleQuestion = (
  question: string,
  templateName: string,
  options?: { minEntries?: number; maxEntries?: number }
) => {
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

const createGenericTemplateQuestion = (
  question: string,
  templateName: string,
  addButtonLabel: string,
  options?: { minEntries?: number; maxEntries?: number }
) => {
  openQuestionsMenu();

  cy.contains('Add Sub Template').click();

  cy.get('[data-cy=question]')
    .clear()
    .type(question)
    .should('have.value', question);

  cy.get('[data-cy=template-id]').click();

  cy.contains(templateName).click();

  if (addButtonLabel) {
    cy.get('[data-cy="addEntryButtonLabel"]').type(addButtonLabel);
  }

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

const createRichTextInput = (
  question: string,
  options?: { maxChars?: number }
) => {
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
Cypress.Commands.add('cloneTemplate', cloneTemplate);
Cypress.Commands.add('createGenericTemplate', createGenericTemplate);

Cypress.Commands.add('navigateToTemplatesSubmenu', navigateToTemplatesSubmenu);

Cypress.Commands.add('createTopic', createTopic);
Cypress.Commands.add('answerTopic', answerTopic);

Cypress.Commands.add('createQuestion', createQuestion);
Cypress.Commands.add('updateQuestion', updateQuestion);
Cypress.Commands.add('createSample', createSample);
Cypress.Commands.add(
  'createQuestionTemplateRelation',
  createQuestionTemplateRelation
);
Cypress.Commands.add(
  'updateQuestionTemplateRelationSettings',
  updateQuestionTemplateRelationSettings
);

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

Cypress.Commands.add(
  'createGenericTemplateQuestion',
  createGenericTemplateQuestion
);
