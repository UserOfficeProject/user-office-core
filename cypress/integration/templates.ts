import path from 'path';

import faker, { lorem } from 'faker';

import {
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
  TemplateCategoryId,
} from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

context('Template tests', () => {
  let boolId: string;
  let textId: string;
  let dateId: string;
  let timeId: string;
  let multipleChoiceId: string;
  let intervalId: string;
  let numberId: string;
  let richTextInputId: string;

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
    newId: faker.lorem.word(),
  };
  const richTextInputQuestion = {
    title: faker.lorem.words(3),
    maxChars: 200,
    answer: faker.lorem.words(3),
  };
  const multipleChoiceQuestion = {
    title: lorem.words(2),
    answers: [faker.lorem.words(3), faker.lorem.words(3), faker.lorem.words(3)],
  };

  const numberQuestion2 = { title: faker.lorem.words(3) };
  const numberQuestion3 = { title: faker.lorem.words(3) };

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
      const createdQuestion = questionResult.createQuestion.question;
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
          const createdQuestion = questionResult.createQuestion.question;
          if (createdQuestion) {
            textId = createdQuestion.id;

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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        intervalId = createdQuestion.id;

        cy.updateQuestion({
          id: createdQuestion.id,
          question: intervalQuestion,
          config: '{"units":["celsius","kelvin"]}',
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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        numberId = createdQuestion.id;

        cy.updateQuestion({
          id: createdQuestion.id,
          question: numberQuestion,
          config: '{"units":["celsius","kelvin"]}',
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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        multipleChoiceId = createdQuestion.id;

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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        dateId = createdQuestion.id;

        cy.updateQuestion({
          id: createdQuestion.id,
          question: dateQuestion.title,
          config: `{"required":true, "includeTime": false,"tooltip": "${dateQuestion.tooltip}"}`,
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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        timeId = createdQuestion.id;

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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        cy.updateQuestion({
          id: createdQuestion.id,
          question: fileQuestion,
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
      const createdQuestion = questionResult.createQuestion.question;
      if (createdQuestion) {
        richTextInputId = createdQuestion.id;

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
    cy.viewport(1920, 1680);
  });

  describe('Proposal templates basic tests', () => {
    it('User officer can modify proposal template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      /* Boolean */

      cy.createBooleanQuestion(booleanQuestion);

      cy.contains(booleanQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          boolId = fieldId;
        });

      /* --- */

      /* Interval */
      cy.createIntervalQuestion(intervalQuestion, {
        units: ['celsius', 'kelvin'],
      });

      cy.contains(intervalQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          intervalId = fieldId;
        });

      /* --- */

      /* Number */

      cy.createNumberInputQuestion(numberQuestion, {
        units: ['celsius', 'kelvin'],
      });

      cy.contains(numberQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          numberId = fieldId;
        });

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
        .invoke('html')
        .then((fieldId) => {
          textId = fieldId;
        });

      /* Update question */

      cy.contains(textQuestion.title).click();

      cy.get('[data-cy="natural-key"]').click();

      cy.get("[data-cy='natural_key']").clear().type(textQuestion.newId);

      cy.contains('Save').click();

      cy.contains(textQuestion.newId);
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
        .invoke('html')
        .then((fieldId) => {
          multipleChoiceId = fieldId;
        });

      cy.finishedLoading();

      cy.contains(multipleChoiceQuestion.title).click();

      cy.get('[data-cy=natural-key]').click();

      cy.get('[index=0]').should(
        'not.contain',
        multipleChoiceQuestion.answers[1]
      );

      cy.contains(multipleChoiceQuestion.answers[1])
        .parent()
        .find('[title=Up]')
        .click();

      cy.get('[index=0]').contains(multipleChoiceQuestion.answers[1]);

      cy.contains(multipleChoiceQuestion.answers[1])
        .parent()
        .find('[title=Down]')
        .click();

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
        .invoke('html')
        .then((fieldId) => {
          dateId = fieldId;
        });

      cy.createDateQuestion(timeQuestion, {
        includeTime: true,
        isRequired: false,
      });

      cy.contains(timeQuestion)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          timeId = fieldId;
        });

      /* --- */

      /* File */

      cy.createFileUploadQuestion(fileQuestion);

      /* --- */

      /* Rich Text Input */

      cy.createRichTextInput(richTextInputQuestion.title, {
        maxChars: richTextInputQuestion.maxChars,
      });

      cy.contains(richTextInputQuestion.title);

      cy.contains(richTextInputQuestion.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          richTextInputId = fieldId;
        });

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
        .find("[title='Edit']")
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
        .find("[title='Clone']")
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
        .find("[title='Delete']")
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
        .find("[title='Archive']")
        .first()
        .click();

      cy.contains('Yes').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains(initialDBData.template.name).should('not.exist');

      cy.contains('Archived').click();

      cy.contains(initialDBData.template.name);

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Unarchive']")
        .first()
        .click();

      cy.contains('Yes').click();
    });

    it('should render the Date field with default value and min max values when set', () => {
      let dateFieldId: string;

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      cy.get('[data-cy=show-more-button]').first().click();

      cy.get('[data-cy=add-question-menu-item]').first().click();

      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .first()
        .click();

      cy.contains('Add Date').click();

      cy.get('[data-cy=question]').clear().type(dateQuestion.title);

      cy.get('[data-cy="minDate"] input').type('2020-01-01');
      cy.get('[data-cy="maxDate"] input').type('2020-01-31');
      cy.get('[data-cy="defaultDate"] input').type('2020-01-10');

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

      cy.get('[data-cy="minDate"] input').should('have.value', '2020-01-01');
      cy.get('[data-cy="maxDate"] input').should('have.value', '2020-01-31');
      cy.get('[data-cy="defaultDate"] input').should(
        'have.value',
        '2020-01-10'
      );

      cy.get('[data-cy="minDate"] input').clear().type('2021-01-01');
      cy.get('[data-cy="maxDate"] input').clear().type('2021-01-31');
      cy.get('[data-cy="defaultDate"] input').clear().type('2021-01-10');

      cy.contains('Update').click();

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.contains(dateQuestion.title);
      cy.get('body').then(() => {
        cy.get(`[data-cy="${dateFieldId}.value"] input`).as('dateField');

        cy.get('@dateField').should('have.value', '2021-01-10');

        cy.get('@dateField').clear().type('2020-01-01');
        cy.contains('Save and continue').click();
        cy.contains('Date must be no earlier than');

        cy.get('@dateField').clear().type('2022-01-01');
        cy.contains('Save and continue').click();
        cy.contains('Date must be no latter than');

        cy.get('@dateField').clear().type('2021-01-15');
        cy.contains('Save and continue').click();
        cy.contains('Date must be no').should('not.exist');
      });
    });

    it('should render the Number field accepting only positive, negative numbers if set', () => {
      let numberField1Id: string;
      let numberField2Id: string;

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      cy.get('[data-cy=show-more-button]').first().click();

      cy.get('[data-cy=add-question-menu-item]').first().click();

      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .first()
        .click();

      cy.contains('Add Number').click();

      cy.get('[data-cy=question]').clear().type(numberQuestion2.title);

      cy.get('[data-cy=units]>[role=button]').click();

      cy.contains('celsius').click();

      cy.contains('kelvin').click();

      cy.get('body').type('{esc}');

      cy.get('[data-cy="numberValueConstraint"]').click();

      cy.contains('Only positive numbers').click();

      cy.contains('Save').click();

      cy.contains(numberQuestion2.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          numberField1Id = fieldId;
        });

      cy.contains(numberQuestion2.title)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);

      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .first()
        .click();

      cy.contains('Add Number').click();

      cy.get('[data-cy=question]').clear().type(numberQuestion3.title);

      cy.get('[data-cy=units]>[role=button]').click();

      cy.contains('celsius').click();

      cy.contains('kelvin').click();

      cy.get('body').type('{esc}');

      cy.get('[data-cy="numberValueConstraint"]').click();

      cy.contains('Only positive numbers').click();

      cy.contains('Save').click();

      cy.contains(numberQuestion3.title)
        .closest('[data-cy=question-container]')
        .find("[data-cy='proposal-question-id']")
        .invoke('html')
        .then((fieldId) => {
          numberField2Id = fieldId;
        });

      cy.contains(numberQuestion3.title)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);

      cy.finishedLoading();

      cy.contains(numberQuestion3.title).click();

      cy.get('[data-cy=units] input').should('have.value', 'celsius,kelvin');
      cy.get('[data-cy="numberValueConstraint"] input').should(
        'have.value',
        'ONLY_POSITIVE'
      );

      cy.get('[data-cy="numberValueConstraint"]').click();

      cy.contains('Only negative numbers').click();

      cy.contains('Update').click();

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.contains(numberQuestion2.title);
      cy.contains(numberQuestion3.title);
      cy.get('body').then(() => {
        cy.get(`[data-cy="${numberField1Id}.value"] input`).as('numberField1');
        cy.get(`[data-cy="${numberField2Id}.value"] input`).as('numberField2');

        cy.get('@numberField1').type('1{leftarrow}-');
        cy.get('@numberField2').type('1');

        cy.contains('Save and continue').click();
        cy.contains('Value must be a negative number');
        cy.contains('Value must be a positive number');

        cy.get('@numberField1').clear().type('1');
        cy.get('@numberField2').clear().type('1{leftarrow}-');

        cy.contains('Value must be a negative number').should('not.exist');
        cy.contains('Value must be a positive number').should('not.exist');
      });
    });

    it('User officer can add multiple choice question as a dependency', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
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
        .find("[title='Edit']")
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

      cy.login('user');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[title="Edit proposal"]')
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

    it('Should not let you create circular dependency chain', () => {
      const field1 = 'boolean_1_' + Date.now();
      const field2 = 'boolean_2_' + Date.now();
      const field3 = 'boolean_3_' + Date.now();
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
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
          cy.get('[role="listbox"]').children().should('have.length', 0);
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

      cy.get('input[type="file"]').attachFixture({
        filePath: fileName,
        fileName: fileName,
        mimeType: 'image/png',
      });

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=conflict-icon]')
        .should('exist');

      cy.get("[data-cy='proposal_basis-accordion']").click();

      cy.get("[data-cy='proposal_basis-accordion']")
        .find("[data-cy='new-question-checkbox']")
        .click();

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=conflict-icon]')
        .should('not.exist');

      cy.get("[data-cy='proposal_basis-accordion']")
        .find('[data-cy=resolved-icon]')
        .should('exist');

      cy.get('[data-cy=import-template-button]').click();

      cy.contains(resolvedQuestionTitle).should('exist');
    });

    it('should export template in compatible format', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .closest('TR')
        .find('[title="Export"]')
        .click();

      cy.fixture('template_export.json').then((expectedExport) => {
        const downloadsFolder = Cypress.config('downloadsFolder');

        cy.readFile(
          path.join(downloadsFolder, `${initialDBData.template.name}.json`)
        ).then((actualExport) => {
          // remove date from the export, because it is not deterministic
          delete expectedExport.exportDate;
          delete actualExport.exportDate;

          expect(expectedExport).to.deep.equal(actualExport);
        });
      });
    });
  });

  describe('Proposal templates advanced tests', () => {
    beforeEach(() => {
      createTopicWithQuestionsAndRelations(true);
    });

    it('User can create proposal with template', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });
      cy.login('user');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[title="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get(`[data-cy="${intervalId}.min"]`).click().type('1');
      cy.get(`[data-cy="${intervalId}.max"]`).click().type('2');
      cy.get(`[data-cy="${numberId}.value"]`).click().type('1');
      cy.get(`#${boolId}`).click();
      cy.get(`#${textId}`).clear().type('this_word_{enter}should_be_multiline');
      cy.contains('this_word_should_be_multiline').should('not.exist');
      cy.get(`#${textId}`).clear().type(textQuestion.answer);
      cy.contains(`${textQuestion.answer.length}/${textQuestion.maxChars}`);
      cy.get(`[data-cy='${dateId}.value'] button`).click();
      cy.contains('15').click();
      cy.get(`[data-cy='${timeId}.value'] input`)
        .clear()
        .type('2022-02-20 20:00');

      cy.get(`#${multipleChoiceId}`).click();
      cy.contains(multipleChoiceQuestion.answers[0]).click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.window().then((win) => {
        return new Cypress.Promise((resolve) => {
          win.tinyMCE.editors[richTextInputId].setContent(
            richTextInputQuestion.answer
          );
          win.tinyMCE.editors[richTextInputId].fire('blur');

          resolve();
        });
      });

      cy.get(`#${richTextInputId}_ifr`)
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .contains(richTextInputQuestion.answer);

      cy.get('[data-cy="rich-text-char-count"]').then((element) => {
        expect(element.text()).to.be.equal(
          `Characters: ${richTextInputQuestion.answer.length} / ${richTextInputQuestion.maxChars}`
        );
      });

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains(proposal.title);
      cy.contains(proposal.abstract);
      cy.contains(textQuestion.answer);
      cy.contains(multipleChoiceQuestion.answers[0]);
      cy.contains(multipleChoiceQuestion.answers[1]).should('not.exist');
      cy.contains(multipleChoiceQuestion.answers[2]);
      cy.contains('20-Feb-2022 20:00');

      cy.contains(richTextInputQuestion.title);
      cy.get(`[data-cy="${richTextInputId}_open"]`).click();
      cy.get('[role="dialog"]').contains(richTextInputQuestion.title);
      cy.get('[role="dialog"]').contains(richTextInputQuestion.answer);
      cy.get('[role="dialog"]').contains('Close').click();

      cy.contains('Dashboard').click();
      cy.contains(proposal.title);
      cy.contains('submitted');
    });

    it('File Upload field could be set as required', () => {
      const fileName = 'file_upload_test.png';

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion).click();

      cy.contains('Is required').click();

      cy.contains('Update').click();

      cy.contains(fileQuestion)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.contains(fileQuestion);
      cy.contains('Save and continue').click();
      cy.contains(fileQuestion)
        .parent()
        .contains('field must have at least 1 items');

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      cy.get('input[type="file"]').attachFixture({
        filePath: fileName,
        fileName: fileName,
        mimeType: 'image/png',
      });

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains(fileQuestion)
        .parent()
        .should('not.contain.text', 'field must have at least 1 items');

      cy.logout();
    });

    it('Officer can delete proposal questions', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      cy.contains(textQuestion.title).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(booleanQuestion).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(dateQuestion.title).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(fileQuestion).click();
      cy.get("[data-cy='remove-from-template']").click();
    });

    it('User officer can add multiple dependencies on a question', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
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
        .find("[title='Edit']")
        .first()
        .click();

      cy.createTextQuestion(templateDependencies.questions.textQuestion.title);

      cy.contains(templateDependencies.questions.textQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[id="dependency-id"]').click();

      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.title)
        .click();

      cy.get('[id="dependencyValue"]').click();

      cy.contains(multipleChoiceQuestion.answers[1]).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[id="dependency-id"]').last().click();

      cy.get('[role="presentation"]').contains(booleanQuestion).click();

      cy.get('[id="dependencyValue"]').last().click();

      cy.contains('true').click();

      cy.get('[data-cy="submit"]').click();

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[title="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.contains(multipleChoiceQuestion.answers[1]).click();
      cy.get('body').type('{esc}');
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(booleanQuestion).click();

      cy.get('main form').should(
        'contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.answers[1])
        .click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );
    });

    it('User officer can change dependency logic operator', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
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

      cy.get('[title="Edit"]').last().click();

      cy.contains(textQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[id="dependency-id"]').last().click();

      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.title)
        .click();

      cy.get('[id="dependencyValue"]').last().click();

      cy.contains(multipleChoiceQuestion.answers[1]).click();

      cy.get('[data-cy="dependencies-operator"]').click();

      cy.get('[data-value="OR"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[title="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get('main form').should('not.contain.text', textQuestion.title);

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.contains(multipleChoiceQuestion.answers[1]).click();
      cy.get('body').type('{esc}');
      cy.contains(textQuestion.title);

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.answers[1])
        .click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.get('main form').should('not.contain.text', textQuestion.title);

      cy.contains(booleanQuestion).click();
      cy.contains(textQuestion.title);
    });

    it('Can delete dependee, which will remove the dependency on depender', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[title='Edit']")
        .first()
        .click();

      cy.contains(textQuestion.title)
        .closest('[data-cy=question-container]')
        .find('[data-cy=dependency-list]')
        .should('exist');
      cy.contains(booleanQuestion).click();
      cy.get('[data-cy=remove-from-template]').click();
      cy.contains(textQuestion.title)
        .closest('[data-cy=question-container]')
        .find('[data-cy=dependency-list]')
        .should('not.exist');
    });

    it('User can add captions after uploading image/* file', () => {
      const fileName = 'file_upload_test.png';
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
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
        .find("[title='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[title="Edit proposal"]')
        .click();
      cy.finishedLoading();

      cy.contains(fileQuestion);

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      cy.get('input[type="file"]').attachFixture({
        filePath: fileName,
        fileName: fileName,
        mimeType: 'image/png',
      });

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.get('[title="Add image caption"]').click();

      cy.get('[data-cy="image-figure"] input').type('Fig_test');
      cy.get('[data-cy="image-caption"] input').type('Test caption');

      cy.get('[data-cy="save-button"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.finishedLoading();

      cy.get('.MuiStep-root').contains('Review').click();

      cy.finishedLoading();

      cy.contains('proposal information', { matchCase: false });

      cy.contains(fileName);

      cy.get('[data-cy="questionary-stepper"]')
        .contains('New proposal')
        .click();

      cy.get('[data-cy="co-proposers"]').should('exist');

      cy.finishedLoading();

      cy.contains(fileQuestion)
        .parent()
        .should('contain.text', fileName)
        .find('[data-cy="image-caption"] input')
        .should('have.value', 'Test caption');
      cy.contains(fileQuestion)
        .parent()
        .find('[data-cy="image-figure"] input')
        .should('have.value', 'Fig_test');
    });
  });
});
