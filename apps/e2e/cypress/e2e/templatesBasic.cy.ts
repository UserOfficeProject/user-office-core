import { faker } from '@faker-js/faker';
import {
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
  FeatureId,
  TemplateCategoryId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Template tests', () => {
  let boolId: string;

  const proposal = {
    title: faker.lorem.words(3),
    abstract: faker.lorem.words(8),
  };

  const booleanQuestion = faker.lorem.words(3);
  const dateQuestion = {
    title: faker.lorem.words(3),
    tooltip: faker.lorem.words(3),
  };
  const timeQuestion = faker.lorem.words(3);
  const fileQuestion = faker.lorem.words(3);
  const intervalQuestion = faker.lorem.words(3);
  const numberQuestion = faker.lorem.words(3);
  const textQuestion = {
    title: faker.lorem.words(3),
    maxChars: 1000,
    answer: faker.lorem.words(5),
    newId: faker.lorem.word(10),
  };
  const richTextInputQuestion = {
    title: faker.lorem.words(3),
    maxChars: 200,
    answer: faker.lorem.words(3),
  };
  const multipleChoiceQuestion = {
    title: faker.lorem.words(2),
    answers: [
      faker.lorem.words(3),
      faker.lorem.words(3),
      faker.lorem.words(3),
      faker.lorem.words(3),
    ],
  };
  const dynamicMultipleChoiceQuestion = {
    title: faker.lorem.words(2),
    url: 'http://localhost:9000',
    jsonPath: '$.*.item',
    answers: {
      arrayString: [
        faker.lorem.words(3),
        faker.lorem.words(3),
        faker.lorem.words(3),
        faker.lorem.words(3),
      ],
      arrayObject: [
        {
          item: faker.lorem.words(3),
        },
        {
          item: faker.lorem.words(3),
        },
        {
          item: faker.lorem.words(3),
        },
      ],
      errorData: {
        item: faker.lorem.words(3),
        item1: faker.lorem.words(3),
        item2: faker.lorem.words(3),
      },
    },
  };

  const templateSearch = {
    title: faker.lorem.words(3),
    description: faker.lorem.words(3),
  };

  const templateDependencies = {
    title: faker.lorem.words(3),
    description: faker.lorem.words(3),
    questions: {
      selectQuestion: {
        title: faker.lorem.words(3),
        answer1: faker.lorem.words(3),
        answer2: faker.lorem.words(3),
      },
      booleanQuestion: {
        title: faker.lorem.words(3),
      },
      textQuestion: {
        title: faker.lorem.words(3),
      },
    },
  };

  const createTopicWithQuestionsAndRelations = (
    shouldAddQuestionsToTemplate = false
  ) => {
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.BOOLEAN,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        boolId = createdQuestion.id;

        cy.updateQuestion({
          id: createdQuestion.id,
          question: booleanQuestion,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 0,
            topicId: initialDBData.template.topic.id,
          });
        }

        cy.createQuestion({
          categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
          dataType: DataType.TEXT_INPUT,
        }).then((questionResult) => {
          const createdQuestion = questionResult.createQuestion;
          if (createdQuestion) {
            cy.updateQuestion({
              id: createdQuestion.id,
              question: textQuestion.title,
              config: `{"max":"${textQuestion.maxChars}","multiline":true,"required":true}`,
            });

            if (shouldAddQuestionsToTemplate) {
              cy.createQuestionTemplateRelation({
                questionId: createdQuestion.id,
                templateId: initialDBData.template.id,
                sortOrder: 3,
                topicId: initialDBData.template.topic.id,
              });

              cy.updateQuestionTemplateRelationSettings({
                questionId: createdQuestion.id,
                templateId: initialDBData.template.id,
                dependenciesOperator: DependenciesLogicOperator.AND,
                dependencies: {
                  condition: {
                    condition: EvaluatorOperator.EQ,
                    params: '{"value":true}',
                  },
                  dependencyId: boolId,
                },
              });
            }
          }
        });
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.INTERVAL,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: intervalQuestion,
          config: `{"units":[
                            {
                              "id": "celsius",
                              "unit": "celsius",
                              "symbol": "c",
                              "quantity": "thermodynamic temperature",
                              "siConversionFormula": "x + 273.15"
                            },
                            {
                                "id": "kelvin",
                                "unit": "kelvin",
                                "symbol": "k",
                                "quantity": "thermodynamic temperature",
                                "siConversionFormula": "x"
                            }
          ]}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 1,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.NUMBER_INPUT,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: numberQuestion,
          config: `{"units":[
            {
              "id": "celsius",
              "unit": "celsius",
              "symbol": "c",
              "quantity": "thermodynamic temperature",
              "siConversionFormula": "x + 273.15"
            },
            {
                "id": "kelvin",
                "unit": "kelvin",
                "symbol": "k",
                "quantity": "thermodynamic temperature",
                "siConversionFormula": "x"
            }
          ]}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 2,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });

    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.SELECTION_FROM_OPTIONS,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: multipleChoiceQuestion.title,
          config: `{"variant":"dropdown","options":["${multipleChoiceQuestion.answers[0]}","${multipleChoiceQuestion.answers[1]}","${multipleChoiceQuestion.answers[2]}"],"isMultipleSelect":true}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 3,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.DATE,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: dateQuestion.title,
          config: `{"required":false, "includeTime": false,"tooltip": "${dateQuestion.tooltip}"}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 4,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.DATE,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: timeQuestion,
          config: `{"includeTime": true}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 5,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.FILE_UPLOAD,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: fileQuestion,
          config: `{"file_type":[".pdf",".docx","image/*"]}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 6,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
    cy.createQuestion({
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      dataType: DataType.RICH_TEXT_INPUT,
    }).then((questionResult) => {
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: richTextInputQuestion.title,
          config: `{"max":"${richTextInputQuestion.maxChars}"}`,
        });

        if (shouldAddQuestionsToTemplate) {
          cy.createQuestionTemplateRelation({
            questionId: createdQuestion.id,
            templateId: initialDBData.template.id,
            sortOrder: 7,
            topicId: initialDBData.template.topic.id,
          });
        }
      }
    });
  };

  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1680);
  });

  describe('Proposal templates basic tests', () => {
    it('User officer can delete active template', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SHIPPING)) {
        this.skip();
      }
      const newName = faker.lorem.words(3);
      const newDescription = faker.lorem.words(5);

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Shipment declaration templates');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input').type(newName);
      cy.get('[data-cy=description]').type(newDescription);

      cy.get('[data-cy=submit]').click();

      cy.visit('/');
      cy.navigateToTemplatesSubmenu('Shipment declaration templates');

      cy.get('[data-cy=mark-as-active]').click();

      cy.get('[data-cy=delete-template]').click();

      cy.get('[data-cy=confirm-ok]').click();

      cy.finishedLoading();

      cy.contains(newName).should('not.exist');
    });

    it('User officer can modify and preview proposal template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      /* Boolean */

      cy.createBooleanQuestion(booleanQuestion);

      cy.contains(booleanQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* --- */

      /* Interval */
      cy.createIntervalQuestion(intervalQuestion, {
        units: ['celsius', 'kelvin'],
      });

      cy.contains(intervalQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* --- */

      /* Number */

      cy.createNumberInputQuestion(numberQuestion, {
        units: ['celsius', 'kelvin'],
      });

      cy.contains(numberQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* --- */

      /* Text input */
      cy.createTextQuestion(textQuestion.title, {
        isRequired: true,
        isMultipleLines: true,
        maxCharacters: textQuestion.maxChars,
      });

      cy.contains(textQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* Update question */

      cy.contains(textQuestion.title).click();

      cy.get('[data-cy="natural-key"]').click();

      cy.get("[data-cy='natural_key']").clear().type(textQuestion.newId);

      cy.contains('Save').click();

      cy.contains(textQuestion.newId);
      /* --- */

      /* Check if template preview works */
      cy.get('[data-cy="preview-questionary-template"]').click();
      cy.get('[aria-labelledby="preview-questionary-template-modal"]').should(
        'exist'
      );

      cy.get('[data-cy="questionary-stepper"] button').last().click();

      cy.get(
        '[aria-labelledby="preview-questionary-template-modal"] form'
      ).contains(booleanQuestion);
      cy.get(
        '[aria-labelledby="preview-questionary-template-modal"] form'
      ).contains(intervalQuestion);
      cy.get(
        '[aria-labelledby="preview-questionary-template-modal"] form'
      ).contains(numberQuestion);
      cy.get(
        '[aria-labelledby="preview-questionary-template-modal"] form'
      ).contains(textQuestion.title);

      cy.closeModal();
      /* --- */

      cy.contains(textQuestion.title).click();

      // Updating dependencies
      cy.get('[data-cy="add-dependency-button"]').click();
      cy.get('#dependency-id').click();
      cy.get('[data-cy=question-relation-dialogue]')
        .get('#menu- > .MuiPaper-root > .MuiList-root > [tabindex="0"]')
        .click(); // get boolean question

      cy.get('#dependencyValue').click();
      cy.get('[data-cy=question-relation-dialogue]')
        .get("#menu- > .MuiPaper-root > .MuiList-root > [tabindex='0']")
        .click(); // get true from dropdown

      cy.contains('Update').click();

      // Check reordering
      cy.contains(textQuestion.title)
        .parent()
        .dragElement([{ direction: 'up', length: 1 }]); // Move item to top, in case it isn't

      cy.contains(initialDBData.template.topic.title)
        .closest('[data-rbd-draggable-context-id]') // new topic column
        .find('[data-rbd-drag-handle-draggable-id]') // all questions
        .first() // first question
        .contains(textQuestion.title);

      cy.contains(textQuestion.title)
        .parent()
        .dragElement([{ direction: 'down', length: 1 }]);

      cy.contains(initialDBData.template.topic.title)
        .closest('[data-rbd-draggable-context-id]') // new topic column
        .find('[data-rbd-drag-handle-draggable-id]') // all questions
        .first() // first question
        .should('not.contain', textQuestion);

      /* Selection from options */
      cy.createMultipleChoiceQuestion(multipleChoiceQuestion.title, {
        option1: multipleChoiceQuestion.answers[0],
        option2: multipleChoiceQuestion.answers[1],
        option3: multipleChoiceQuestion.answers[2],
        isMultipleSelect: true,
      });

      cy.contains(multipleChoiceQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      cy.finishedLoading();

      cy.contains(multipleChoiceQuestion.title).click();

      cy.get('[data-cy=natural-key]').click();

      cy.get('[index=0]').should(
        'not.contain',
        multipleChoiceQuestion.answers[1]
      );

      cy.contains(multipleChoiceQuestion.answers[1])
        .parent()
        .find('[aria-label=Up]')
        .click();

      cy.get('[index=0]').contains(multipleChoiceQuestion.answers[1]);
      cy.get('[index=1]').contains(multipleChoiceQuestion.answers[0]);

      cy.contains(multipleChoiceQuestion.answers[1])
        .parent()
        .find('[aria-label=Down]')
        .click();

      cy.contains(multipleChoiceQuestion.answers[0])
        .parent()
        .find('[aria-label=Up]')
        .find('[type=button]')
        .should('be.disabled');

      cy.contains(multipleChoiceQuestion.answers[0])
        .parent()
        .find('[aria-label=Down]')
        .click();

      cy.contains(multipleChoiceQuestion.answers[0])
        .parent()
        .find('[aria-label=Up]')
        .click();

      cy.contains(multipleChoiceQuestion.answers[2])
        .parent()
        .find('[aria-label=Down]')
        .find('[type=button]')
        .should('be.disabled');

      cy.contains(multipleChoiceQuestion.answers[2])
        .parent()
        .find('[aria-label=Up]')
        .click();

      cy.contains(multipleChoiceQuestion.answers[2])
        .parent()
        .find('[aria-label=Down]')
        .click();

      cy.contains(multipleChoiceQuestion.answers[0])
        .parent()
        .find('[aria-label=Edit]')
        .click()
        .get('[aria-label=Answer]')
        .type(multipleChoiceQuestion.answers[3])
        .get('[aria-label=Save]')
        .click()
        .get('[index=0]')
        .should('contain', multipleChoiceQuestion.answers[3]);

      cy.contains(multipleChoiceQuestion.answers[1])
        .parent()
        .find('[aria-label=Delete]')
        .click()
        .get('[aria-label=Save]')
        .click()
        .should('not.exist');

      cy.contains('Save').click();

      /* --- */

      /* Dynamic multiple choice */
      cy.createDynamicMultipleChoiceQuestion(
        dynamicMultipleChoiceQuestion.title,
        {
          url: dynamicMultipleChoiceQuestion.url,
          isMultipleSelect: true,
        }
      );

      cy.contains(dynamicMultipleChoiceQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      cy.contains(dynamicMultipleChoiceQuestion.title).click();
      cy.get('[data-cy=natural-key]').click();
      cy.contains('Save').click();
      /* --- */

      /* Date */
      cy.createDateQuestion(dateQuestion.title, {
        includeTime: false,
        isRequired: true,
      });

      cy.contains(dateQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      cy.createDateQuestion(timeQuestion, {
        includeTime: true,
        isRequired: false,
      });

      cy.contains(timeQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* --- */

      /* File */

      cy.createFileUploadQuestion(fileQuestion, ['.pdf', 'image/*']);

      /* --- */

      /* Rich Text Input */

      cy.createRichTextInput(richTextInputQuestion.title, {
        maxChars: richTextInputQuestion.maxChars,
      });

      cy.contains(richTextInputQuestion.title);

      cy.contains(richTextInputQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html');

      /* --- */

      /* --- Update templateQuestionRelation */
      cy.contains(dateQuestion.title).click();
      cy.get("[data-cy='tooltip'] input").clear().type(dateQuestion.tooltip);

      cy.contains('Update').click();

      cy.reload();

      cy.contains(dateQuestion.title).click();
      cy.get("[data-cy='tooltip'] input").should(
        'have.value',
        dateQuestion.tooltip
      );
      cy.get('body').type('{esc}');
      /* --- */

      cy.contains(booleanQuestion);
      cy.contains(textQuestion.title);
      cy.contains(dateQuestion.title);
      cy.contains(timeQuestion);
    });

    it('User officer can change template title and description', () => {
      const newName = faker.lorem.words(3);
      const newDescription = faker.lorem.words(5);

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.get('[data-cy=edit-metadata]').click();
      cy.get('[data-cy=template-name] input').clear().type(newName);
      cy.get('[data-cy=template-description] input')
        .clear()
        .type(newDescription);

      cy.get('[data-cy="save-metadata-btn"]').click();

      cy.finishedLoading();

      cy.contains(newName);
      cy.contains(newDescription);
    });

    it('User officer can clone template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Clone']")
        .first()
        .click();

      cy.contains('Yes').click();

      cy.contains(`Copy of ${initialDBData.template.name}`);
    });

    it('User officer can delete template', () => {
      cy.cloneTemplate({ templateId: initialDBData.template.id });
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(`Copy of ${initialDBData.template.name}`)
        .parent()
        .find("[aria-label='Delete']")
        .first()
        .click();

      cy.contains('Yes').click();

      cy.contains(`Copy of ${initialDBData.template.name}`).should('not.exist');
    });

    it('User officer archive and unarchive template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Archive']")
        .first()
        .click();

      cy.contains('Yes').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains(initialDBData.template.name).should('not.exist');

      cy.contains('Archived').click();

      cy.contains(initialDBData.template.name);

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Unarchive']")
        .first()
        .click();

      cy.contains('Yes').click();
    });

    it('User officer can view proposals on template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find('[data-cy=proposals-count]')
        .contains('1')
        .click();

      cy.get('[data-cy=proposals-modal]').contains(
        initialDBData.proposal.title
      );
    });

    it('should render the Date field with default value and min max values when set', () => {
      let dateFieldId: string;
      const minDate = DateTime.fromJSDate(faker.date.past()).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const earlierThanMinDate = DateTime.fromFormat(
        minDate,
        initialDBData.getFormats().dateFormat
      )
        .minus({ day: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);
      const maxDate = DateTime.fromJSDate(faker.date.future()).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const laterThanMaxDate = DateTime.fromFormat(
        maxDate,
        initialDBData.getFormats().dateFormat
      )
        .plus({ day: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);
      const defaultDate = DateTime.now().toFormat(
        initialDBData.getFormats().dateFormat
      );

      const tomorrowDate = DateTime.now()
        .plus({ day: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.get('[data-cy=show-more-button]').first().click();

      cy.get('[data-cy=add-question-menu-item]').first().click();

      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .first()
        .click();

      cy.contains('Add Date').click();

      cy.get('[data-cy=question]').clear().type(dateQuestion.title);

      cy.get('[data-cy="minDate"] input').type(minDate);
      cy.get('[data-cy="maxDate"] input').type(maxDate);
      cy.get('[data-cy="defaultDate"] input').type(defaultDate);

      cy.contains('Save').click();

      cy.contains(dateQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          dateFieldId = fieldId;
        });

      cy.contains(dateQuestion.title)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);

      cy.finishedLoading();

      cy.contains(dateQuestion.title).click();

      cy.get('[data-cy="minDate"] input').should('have.value', minDate);
      cy.get('[data-cy="maxDate"] input').should('have.value', maxDate);
      cy.get('[data-cy="defaultDate"] input').should('have.value', defaultDate);

      cy.get('[data-cy="minDate"] input').clear().type(minDate);
      cy.get('[data-cy="maxDate"] input').clear().type(maxDate);
      cy.get('[data-cy="defaultDate"] input').clear().type(defaultDate);

      cy.contains('Update').click();

      cy.logout();

      cy.login('user1', 1);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.contains(dateQuestion.title);
      cy.get('body').then(() => {
        cy.get(`[data-cy="${dateFieldId}.value"] input`).as('dateField');

        cy.get('@dateField').should('have.value', defaultDate);

        cy.get('@dateField').clear().type(earlierThanMinDate);
        cy.contains('Save and continue').click();
        cy.contains('Date must be no earlier than');

        cy.get('@dateField').clear().type(laterThanMaxDate);
        cy.contains('Save and continue').click();
        cy.contains('Date must be no latter than');

        cy.get('@dateField').clear().type(tomorrowDate);
        cy.contains('Save and continue').click();
        cy.contains('Date must be no').should('not.exist');
      });
    });

    it('should be able to create new unit from the Unit field', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');
      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.get('[data-cy=show-more-button]').first().click();

      cy.get('[data-cy=add-question-menu-item]').first().click();

      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .first()
        .click();

      cy.contains('Add Number').click();

      cy.get('[data-cy=units]')
        .find('#config-units')
        .type('test_cannot_be_found');
      cy.get('[data-cy=add-button]').click();
      cy.get('[data-cy="unit-id"]').clear().type(numberQuestion);
      cy.get('[data-cy="unit-name"]').clear().type(numberQuestion);
      cy.get('[data-cy="unit-quantity"]').click();
      cy.get('[role="presentation"] [role="option"]').first().click();
      cy.get('[data-cy="unit-symbol"]').clear().type(numberQuestion);
      cy.get('[data-cy="unit-siConversionFormula"]').clear().type('x');
      cy.get('[data-cy=unit-modal] [data-cy=submit]').click();
      cy.get('[data-tag-index=0] > span').should(
        'include.text',
        numberQuestion
      );
    });

    it('should render the Number field accepting only positive, negative numbers if set', () => {
      const generateId = () =>
        `${faker.lorem.word()}_${faker.lorem.word()}_${faker.lorem.word()}`;

      const questions = [
        {
          id: generateId(),
          title: faker.lorem.words(3),
          valueConstraint: 'Only positive numbers',
          fieldName: 'numberField2',
          badInput: '1{leftarrow}-',
          goodInput: '1',
          failureMessage: 'Value must be a negative number',
        },
        {
          id: generateId(),
          title: faker.lorem.words(3),
          valueConstraint: 'Only negative numbers',
          fieldName: 'numberField3',
          badInput: '1',
          goodInput: '1{leftarrow}-',
          failureMessage: 'Value must be a positive number',
        },
        {
          id: generateId(),
          title: faker.lorem.words(3),
          valueConstraint: 'Only negative integers',
          fieldName: 'numberField4',
          badInput: '1.1{leftarrow}{leftarrow}{leftarrow}-',
          goodInput: '-1',
          failureMessage: 'Value must be negative whole number',
        },
        {
          id: generateId(),
          title: faker.lorem.words(3),
          valueConstraint: 'Only positive integers',
          fieldName: 'numberField5',
          badInput: '1.1',
          goodInput: '1',
          failureMessage: 'Value must be positive whole number',
        },
      ];

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      /* Create questions */
      for (const question of questions) {
        cy.createNumberInputQuestion(question.title, {
          key: question.id,
          units: ['kelvin'],
          valueConstraint: question.valueConstraint,
          firstTopic: true,
        });
      }

      cy.logout();

      cy.login('user1', 1);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      /* Test questions exist */
      for (const question of questions) {
        cy.contains(question.title);
      }

      /* Test bad inputs */
      for (const question of questions) {
        cy.get(`[data-natural-key="${question.id}"] input`).type(
          question.badInput
        );
      }
      cy.contains('Save and continue').click();
      for (const question of questions) {
        cy.contains(question.failureMessage);
      }

      /* Test good inputs */
      for (const question of questions) {
        cy.get(`[data-natural-key="${question.id}"] input`)
          .clear()
          .type(question.goodInput);
      }
      cy.contains('Save and continue').click();
      for (const question of questions) {
        cy.contains(question.failureMessage).should('not.exist');
      }
    });

    it('User officer can add multiple choice question as a dependency', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.createMultipleChoiceQuestion(
        templateDependencies.questions.selectQuestion.title,
        {
          option1: templateDependencies.questions.selectQuestion.answer1,
          option2: templateDependencies.questions.selectQuestion.answer2,
        }
      );

      cy.createBooleanQuestion(
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(templateDependencies.questions.booleanQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[id="dependency-id"]').click();

      cy.get('[role="presentation"]')
        .contains(templateDependencies.questions.selectQuestion.title)
        .click();

      cy.get('[id="dependencyValue"]').click();

      cy.contains(
        templateDependencies.questions.selectQuestion.answer1
      ).click();

      cy.get('[data-cy="submit"]').click();

      cy.logout();

      cy.login('user1', 1);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      // Dependee is NOT visible
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(templateDependencies.questions.selectQuestion.title)
        .parent()
        .click();
      cy.contains(
        templateDependencies.questions.selectQuestion.answer1
      ).click();

      // Dependee is visible
      cy.get('main form').should(
        'contain.text',
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(templateDependencies.questions.selectQuestion.title)
        .parent()
        .click();
      cy.contains(
        templateDependencies.questions.selectQuestion.answer2
      ).click();

      // Dependee is NOT visible again
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.booleanQuestion.title
      );
    });

    it('User officer can add instrument picker question as a dependency', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.createBooleanQuestion(
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(templateDependencies.questions.booleanQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[id="dependency-id"]').click();

      cy.get('[role="presentation"]')
        .contains(initialDBData.questions.instrumentPicker.text)
        .click();

      cy.get('[id="dependencyValue"]').click();

      cy.contains(initialDBData.instrument1.name).click();

      cy.get('[data-cy="question-relation-dialogue"]')
        .contains(templateDependencies.questions.booleanQuestion.title)
        .click();

      cy.get('[data-cy="submit"]').click();

      cy.get('[data-cy="question-relation-dialogue"]').should('not.exist');

      cy.logout();

      cy.login('user1');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      // Dependee is NOT visible
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(initialDBData.questions.instrumentPicker.text)
        .parent()
        .click();
      cy.contains(initialDBData.instrument1.name).click();

      // Dependee is visible
      cy.get('main form').should(
        'contain.text',
        templateDependencies.questions.booleanQuestion.title
      );

      cy.contains(initialDBData.questions.instrumentPicker.text)
        .parent()
        .click();
      cy.contains(initialDBData.instrument3.name).click();

      // Dependee is NOT visible again
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.booleanQuestion.title
      );
    });

    it('Should not let you create circular dependency chain', () => {
      const field1 = 'boolean_1_' + Date.now();
      const field2 = 'boolean_2_' + Date.now();
      const field3 = 'boolean_3_' + Date.now();
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.createBooleanQuestion(field1);
      cy.createBooleanQuestion(field2);
      cy.createBooleanQuestion(field3);

      function addDependency(
        fieldName: string,
        contains: string[],
        select?: string
      ) {
        cy.contains(fieldName).click();
        cy.get('[data-cy="add-dependency-button"]').click();
        cy.get('[id="dependency-id"]').click();

        contains.forEach((field) => {
          cy.get('[role="listbox"]').contains(field);
        });

        if (contains.length === 0) {
          cy.get('[role="listbox"]').children().should('have.length', 3);
        }

        if (select) {
          cy.get('[role="listbox"]').contains(select).click();

          cy.get('[id="dependencyValue"]').click();
          cy.get('[role="listbox"]').contains('true').click();

          cy.contains('Update').click();

          cy.finishedLoading();
        }
      }

      addDependency(field1, [field2, field3], field2);
      addDependency(field2, [field3], field3);
      addDependency(field3, []);
    });

    it('User officer should be able to search questions', function () {
      createTopicWithQuestionsAndRelations();
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      // Create an empty template so we can search all question from the question picker

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy="name"]').type(templateSearch.title);

      cy.get('[data-cy="description"]').type(templateSearch.description);

      cy.get('[data-cy="submit"]').click();

      cy.get('[data-cy=show-more-button]').click();

      // Search questions
      cy.contains('Add question').click();

      cy.get('[data-cy=search-button]').click();

      // after entering textQuestion, dateQuestion should not be visible
      cy.contains(dateQuestion.title);
      cy.get('[data-cy=search-text] input').clear().type(textQuestion.title);
      cy.contains(textQuestion.title).should('exist');
      cy.contains(dateQuestion.title).should('not.exist');

      cy.get('[data-cy=search-text] input').clear();

      // after entering dateQuestion, textQuestion should not be visible
      cy.contains(textQuestion.title);
      cy.get('[data-cy=search-text] input').clear().type(dateQuestion.title);
      cy.contains(dateQuestion.title).should('exist');
      cy.contains(textQuestion.title).should('not.exist');

      cy.get('[data-cy=search-text] input').clear();
      cy.get('[data-cy=question-list]')
        .contains(booleanQuestion)
        .should('exist'); // this command is here to wait for the list to be clean of the previous search

      // searching by categories

      // Boolean
      cy.get('[data-cy=data-type]').click();
      cy.get('[role=listbox]').contains('Boolean').click();
      cy.get('[data-cy=question-list]')
        .contains(booleanQuestion)
        .should('exist');
      cy.get('[data-cy=question-list]')
        .contains(textQuestion.title)
        .should('not.exist');

      // Date
      cy.get('[data-cy=data-type]').click();
      cy.get('[role=listbox]').contains('Date').click();
      cy.get('[data-cy=question-list]')
        .contains(dateQuestion.title)
        .should('exist');
      cy.get('[data-cy=question-list]')
        .contains(textQuestion.title)
        .should('not.exist');

      // All question types
      cy.get('[data-cy=data-type]').click();
      cy.get('[role=listbox]').contains('All').click();
      cy.get('[data-cy=question-list]')
        .contains(dateQuestion.title)
        .should('exist');
      cy.get('[data-cy=question-list]')
        .contains(textQuestion.title)
        .should('exist');

      // filter with no results
      cy.get('[data-cy=search-text] input')
        .clear()
        .type('string match no results');
      cy.get('[data-cy=question-list] div').should('have.length', 0);

      // closing resets the filter
      cy.get('[data-cy=search-button]').click();
      cy.get('[data-cy=question-list] div').should('have.length.above', 0);
    });

    it('User officer import template', () => {
      const fileName = 'template_import.json';
      const resolvedQuestionTitle = 'General information';

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.get('[data-cy=import-template-button]').click();

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.get('input[type="file"]').selectFile(
        {
          contents: `cypress/fixtures/${fileName}`,
          fileName: fileName,
        },
        { force: true }
      );

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=conflict-icon]')
        .should('exist');

      cy.get("[data-cy='proposal_basis-accordion']").click();

      cy.get("[data-cy='proposal_basis-accordion']")
        .find("[data-cy='new-item-checkbox']")
        .click();

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=conflict-icon]')
        .should('not.exist');

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=resolved-icon]')
        .should('exist');

      cy.get('[data-cy=import-template-button]').click();

      cy.contains(resolvedQuestionTitle).should('exist');

      cy.notification({
        variant: 'success',
        text: 'Template imported successfully',
      });
    });

    it('should export template in compatible format', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .closest('TR')
        .find('[aria-label="Export"]')
        .click();

      cy.fixture('template_export.json').then((expectedExport) => {
        const downloadsFolder = Cypress.config('downloadsFolder');

        cy.readFile(
          `${downloadsFolder}/${initialDBData.template.name}.json`
        ).then((actualExport) => {
          // remove date from the export, because it is not deterministic
          delete expectedExport.metadata.exportDate;
          delete actualExport.metadata.exportDate;

          const exportSubtemplates = expectedExport.data.subTemplates[0];
          const importSubtemplates = actualExport.data.subTemplates[0];

          expect(expectedExport).to.deep.equal(actualExport);

          expect(exportSubtemplates).to.deep.equal(importSubtemplates);
        });
      });
    });

    it('should validate question template relation input', () => {
      createTopicWithQuestionsAndRelations();

      cy.login('officer');
      cy.visit('/ProposalTemplates');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(initialDBData.questions.fileUpload.text).click();

      cy.get('[data-cy=max_files] input').clear().type('1');
      cy.get('[data-cy=submit]').should('not.be.disabled');

      cy.get('[data-cy=max_files] input').clear().type('-1');
      cy.get('[data-cy=submit]').should('be.disabled');
    });
  });

  describe('Dynamic multiple choice external api call tests', () => {
    const createProposalAndClickDropdownBehavior = () => {
      cy.login('user1', 1);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.finishedLoading();

      cy.get('[data-cy=title] input').type('title');
      cy.get('[data-cy=abstract] textarea').first().type('abstract');

      cy.contains(dynamicMultipleChoiceQuestion.title);
      cy.contains(dynamicMultipleChoiceQuestion.title).parent().click();
    };

    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
      cy.navigateToTemplatesSubmenu('Proposal');
      cy.contains(initialDBData.template.name)
        .parent()
        .find('[aria-label=Edit]')
        .first()
        .click();
    });

    it('Should render empty list if JSONPATH syntax is invalid', () => {
      cy.task('mockServer', {
        interceptUrl: dynamicMultipleChoiceQuestion.url,
        fixture: dynamicMultipleChoiceQuestion.answers.arrayObject,
      });
      cy.createDynamicMultipleChoiceQuestion(
        dynamicMultipleChoiceQuestion.title,
        {
          url: dynamicMultipleChoiceQuestion.url,
          jsonPath: '$.[*].item',
          isMultipleSelect: true,
          firstTopic: true,
        }
      );

      createProposalAndClickDropdownBehavior();

      cy.get('[data-cy=dropdown-ul]').children().should('not.contain.value');
    });

    it('Should be able to use JSONPATH library to extract specific data from API response', () => {
      cy.task('mockServer', {
        interceptUrl: dynamicMultipleChoiceQuestion.url,
        fixture: dynamicMultipleChoiceQuestion.answers.arrayObject,
      });
      cy.createDynamicMultipleChoiceQuestion(
        dynamicMultipleChoiceQuestion.title,
        {
          url: dynamicMultipleChoiceQuestion.url,
          jsonPath: dynamicMultipleChoiceQuestion.jsonPath,
          isMultipleSelect: true,
          firstTopic: true,
        }
      );
      createProposalAndClickDropdownBehavior();

      cy.get('[data-cy=dropdown-ul]').children().should('have.length', 3);
      cy.get('[data-cy=dropdown-li]').each(($el) => {
        cy.wrap($el).click();
      });
    });

    it('Should render selectable options from an API response', () => {
      cy.task('mockServer', {
        interceptUrl: dynamicMultipleChoiceQuestion.url,
        fixture: dynamicMultipleChoiceQuestion.answers.arrayString,
      });

      cy.createDynamicMultipleChoiceQuestion(
        dynamicMultipleChoiceQuestion.title,
        {
          url: dynamicMultipleChoiceQuestion.url,
          isMultipleSelect: true,
          firstTopic: true,
        }
      );
      createProposalAndClickDropdownBehavior();

      cy.get('[data-cy=dropdown-ul]').children().should('have.length', 3);
      cy.get('[data-cy=dropdown-li]').each(($el) => {
        cy.wrap($el).click();
      });

      cy.contains(dynamicMultipleChoiceQuestion.answers.arrayString[0]);
    });

    it('Should be able to add headers', () => {
      cy.task('mockServer', {
        interceptUrl: dynamicMultipleChoiceQuestion.url,
        fixture: dynamicMultipleChoiceQuestion.answers.arrayString,
      });

      cy.createDynamicMultipleChoiceQuestion(
        dynamicMultipleChoiceQuestion.title,
        {
          url: dynamicMultipleChoiceQuestion.url,
          isMultipleSelect: true,
          firstTopic: true,
          headers: { Authorization: 'Bearer 1234', 'Content-Type': 'text/' },
        }
      );

      cy.contains(dynamicMultipleChoiceQuestion.title).parent().click();

      cy.get('[data-cy=api-headers-container]').contains('Authorization');
      cy.get('[data-cy=api-headers-container]').contains('Content-Type');
      cy.get('[data-cy=api-headers-container]').contains('Bearer 1234');
      cy.get('[data-cy=api-headers-container]').contains('text');
    });
  });

  describe('File upload tests', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.createFileUploadQuestion(fileQuestion, ['.pdf', '.docx', 'image/*']);

      cy.login('user1', 1);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type('title');

      cy.get('[data-cy=abstract] textarea').first().type('abstract');

      cy.contains(fileQuestion);
    });

    it('File limitation info is displayed', () => {
      cy.contains('Accepted formats: .pdf, .docx, any image');
      cy.contains('Maximum 3 PDF page(s) per file');
      cy.contains('Maximum 3 file(s)');
    });

    it('File without extension cannot be uploaded', () => {
      const fileName = 'file_without_ext';

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
            mimeType: 'application/pdf',
          },
          { force: true }
        );

      cy.contains('Incorrect file type');
    });

    it('File with incorrect content header cannot be uploaded', () => {
      const fileName = 'file_upload_test.png';

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
            mimeType: 'application/octet-stream',
          },
          { force: true }
        );

      cy.contains('Incorrect file type');
    });

    it('Unidentifiable disguised file is uploaded but not accepted', () => {
      const fileName = 'unidentifiable_file.pdf';

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains('Save and continue').click();

      cy.notification({
        variant: 'error',
        text: 'not satisfying a constraint',
      });
    });

    it('Identifiable disguised file is uploaded but not accepted', () => {
      const fileName = 'mp3_file.pdf';

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
            mimeType: 'application/pdf',
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains('Save and continue').click();

      cy.notification({
        variant: 'error',
        text: 'not satisfying a constraint',
      });
    });

    it('Question is not accepted when one of many files is invalid', () => {
      const validFile = 'file_upload_test.png';
      const invalidFile = 'mp3_file.pdf';

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${validFile}`,
            fileName: validFile,
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(validFile);

      cy.contains('Save and continue').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Back').click();

      cy.contains(fileQuestion);
      cy.contains(validFile);

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${invalidFile}`,
            fileName: invalidFile,
            mimeType: 'application/pdf',
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(invalidFile);

      cy.contains('Save and continue').click();

      cy.notification({
        variant: 'error',
        text: 'not satisfying a constraint',
      });
    });

    it('Question is not accepted when PDF file page count is outside limit', () => {
      const fileName = 'pdf_5_pages.pdf';

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
            mimeType: 'application/pdf',
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains('Save and continue').click();

      cy.notification({
        variant: 'error',
        text: 'not satisfying a constraint',
      });
    });

    it('Question accepted when PDF file page count is within limit', () => {
      const fileName = 'pdf_3_pages.pdf';

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
            mimeType: 'application/pdf',
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains('Save and continue').click();

      cy.notification({ variant: 'success', text: 'Saved' });
    });
  });
});
