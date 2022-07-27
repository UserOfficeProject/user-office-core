import {
  CreateTemplateMutationVariables,
  CreateTemplateMutation,
  CreateTopicMutationVariables,
  CreateQuestionMutationVariables,
  CreateQuestionMutation,
  UpdateQuestionMutationVariables,
  UpdateQuestionMutation,
  CreateQuestionTemplateRelationMutation,
  CreateQuestionTemplateRelationMutationVariables,
  CreateTopicMutation,
  CreateGenericTemplateMutationVariables,
  CreateGenericTemplateMutation,
  AnswerTopicMutationVariables,
  AnswerTopicMutation,
  CreateSampleMutationVariables,
  CreateSampleMutation,
  CloneTemplateMutationVariables,
  CloneTemplateMutation,
  UpdateQuestionTemplateRelationSettingsMutationVariables,
  UpdateQuestionTemplateRelationSettingsMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates question
       *
       * @returns {typeof createQuestion}
       * @memberof Chainable
       * @example
       *    cy.createQuestion(createQuestionInput: CreateQuestionMutationVariables)
       */
      createQuestion: (
        createQuestionInput: CreateQuestionMutationVariables
      ) => Cypress.Chainable<CreateQuestionMutation>;
      /**
       * Updates question
       *
       * @returns {typeof updateQuestion}
       * @memberof Chainable
       * @example
       *    cy.updateQuestion(updateQuestionInput: UpdateQuestionMutationVariables)
       */
      updateQuestion: (
        updateQuestionInput: UpdateQuestionMutationVariables
      ) => Cypress.Chainable<UpdateQuestionMutation>;
      /**
       * Adds question to topic
       *
       * @returns {typeof createQuestionTemplateRelation}
       * @memberof Chainable
       * @example
       *    cy.createQuestionTemplateRelation(createQuestionTemplateRelationInput: CreateQuestionTemplateRelationMutationVariables)
       */
      createQuestionTemplateRelation: (
        createQuestionTemplateRelationInput: CreateQuestionTemplateRelationMutationVariables
      ) => Cypress.Chainable<CreateQuestionTemplateRelationMutation>;
      /**
       * Updates question topic relation settings
       *
       * @returns {typeof updateQuestionTemplateRelationSettings}
       * @memberof Chainable
       * @example
       *    cy.updateQuestionTemplateRelationSettings(updateQuestionTemplateRelationSettingsInput: UpdateQuestionTemplateRelationSettingsMutationVariables)
       */
      updateQuestionTemplateRelationSettings: (
        updateQuestionTemplateRelationSettingsInput: UpdateQuestionTemplateRelationSettingsMutationVariables
      ) => Cypress.Chainable<UpdateQuestionTemplateRelationSettingsMutation>;

      /**
       * Creates boolean question. You have to be in edit template view to call this method
       *
       * @returns {typeof createBooleanQuestion}
       * @memberof Chainable
       * @example
       *    cy.createBooleanQuestion('Is dangerous')
       */
      createBooleanQuestion: (
        title: string,
        options?: { key?: string }
      ) => void;

      /**
       * Creates Text question. You have to be in edit template view to call this method
       *
       * @returns {typeof createTextQuestion}
       * @memberof Chainable
       * @example
       *    cy.createTextQuestion('Question')
       */
      createTextQuestion: (
        title: string,
        options?: {
          key?: string;
          isRequired?: boolean;
          isMultipleLines?: boolean;
          maxCharacters?: number;
        }
      ) => void;

      /**
       * Creates date question. You have to be in edit template view to call this method
       *
       * @returns {typeof createDateQuestion}
       * @memberof Chainable
       * @example
       *    cy.createDateQuestion('Specify visit time', {includeTime:true})
       */
      createDateQuestion: (
        title: string,
        options?: {
          includeTime?: boolean;
          isRequired?: boolean;
        }
      ) => void;

      /**
       * Creates multiple choice question. You have to be in edit template view to call this method
       *
       * @returns {typeof createMultipleChoiceQuestion}
       * @memberof Chainable
       * @example
       *    cy.createMultipleChoiceQuestion('Is dangerous')
       */
      createMultipleChoiceQuestion: (
        title: string,
        options?: {
          option1?: string;
          option2?: string;
          option3?: string;
          isMultipleSelect?: boolean;
          type?: 'radio' | 'dropdown';
          key?: string;
        }
      ) => void;

      /**
       * Creates FileUpload question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createFileUploadQuestion}
       * @memberof Chainable
       * @example
       *    cy.createFileUploadQuestion('Provide a file', ['.pdf', 'image/*'])
       */
      createFileUploadQuestion: (title: string, fileTypes: string[]) => void;

      /**
       * Creates NumberImput question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createNumberInputQuestion}
       * @memberof Chainable
       * @example
       *    cy.createNumberInputQuestion('Specify temperature', ['<0', '>=0'])
       */
      createNumberInputQuestion: (
        title: string,
        options?: { key?: string; isRequired?: boolean; units?: string[] }
      ) => void;

      /**
       * Creates interval question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createIntervalQuestion}
       * @memberof Chainable
       * @example
       *    cy.createIntervalQuestion('Specify temperature interval', ['0-23', '24-30'])
       */
      createIntervalQuestion: (
        title: string,
        options?: { units?: string[] }
      ) => void;

      /**
       * Creates sample question
       *
       * @returns {typeof createSampleQuestion}
       * @memberof Chainable
       * @example
       *    cy.createSampleQuestion('Provide sample', 'default sample template', {minEntries:1, maxEntries:5})
       */
      createSampleQuestion: (
        question: string,
        template: string,
        options?: { minEntries?: number; maxEntries?: number }
      ) => void;

      /**
       * Creates generic template question
       *
       * @returns {typeof createGenericTemplateQuestion}
       * @memberof Chainable
       * @example
       *    cy.createGenericTemplateQuestion('Provide deatails of any grants', 'deafult generic template', 'Add grant' {minEntries:0, maxEntries:5})
       */
      createGenericTemplateQuestion: (
        question: string,
        template: string,
        addButtonLabel: string,
        options?: { minEntries?: number; maxEntries?: number }
      ) => void;

      /**
       * Creates rich text input question
       *
       * @returns {typeof createRichTextInput}
       * @memberof Chainable
       * @example
       *    cy.createRichTextInput('Question', {maxChars:500})
       */
      createRichTextInput: (
        question: string,
        options?: { maxChars?: number }
      ) => void;

      /**
       * Expands templates submenu
       *
       * @returns {typeof expandTemplatesSubmenu}
       * @memberof Chainable
       * @example
       *    cy.expandTemplatesSubmenu()
       */
      navigateToTemplatesSubmenu: (submenuName: string) => void;

      /**
       * Creates template
       *
       * @returns {typeof createTemplate}
       * @memberof Chainable
       * @example
       *    cy.createTemplate('proposal')
       */
      createTemplate: (
        createTemplateInput: CreateTemplateMutationVariables
      ) => Cypress.Chainable<CreateTemplateMutation>;
      /**
       * Clone template
       *
       * @returns {typeof cloneTemplate}
       * @memberof Chainable
       * @example
       *    cy.createTemplate('proposal')
       */
      cloneTemplate: (
        cloneTemplateInput: CloneTemplateMutationVariables
      ) => Cypress.Chainable<CloneTemplateMutation>;
      /**
       * Creates generic template
       *
       * @returns {typeof createGenericTemplate}
       * @memberof Chainable
       * @example
       *    cy.createGenericTemplate('proposal')
       */
      createGenericTemplate: (
        createGenericTemplateInput: CreateGenericTemplateMutationVariables
      ) => Cypress.Chainable<CreateGenericTemplateMutation>;

      /**
       * Creates topic in template
       *
       * @returns {typeof createTopic}
       * @memberof Chainable
       * @example
       *    cy.createTopic(createTopicInput: CreateTopicMutationVariables)
       */
      createTopic: (
        createTopicInput: CreateTopicMutationVariables
      ) => Cypress.Chainable<CreateTopicMutation>;

      /**
       * Answers topic in proposal template
       *
       * @returns {typeof answerTopic}
       * @memberof Chainable
       * @example
       *    cy.answerTopic(answerTopicInput: AnswerTopicMutationVariables)
       */
      answerTopic: (
        answerTopicInput: AnswerTopicMutationVariables
      ) => Cypress.Chainable<AnswerTopicMutation>;

      /**
       * Creates sample
       *
       * @returns {typeof createSample}
       * @memberof Chainable
       * @example
       *    cy.createSample(createSampleInput: CreateSampleMutationVariables)
       */
      createSample: (
        createSampleInput: CreateSampleMutationVariables
      ) => Cypress.Chainable<CreateSampleMutation>;
    }
  }
}

export {};
