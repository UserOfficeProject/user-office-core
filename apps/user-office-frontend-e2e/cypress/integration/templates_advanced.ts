import { faker } from '@faker-js/faker';
import {
  TemplateCategoryId,
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

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
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        intervalId = createdQuestion.id;

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
        numberId = createdQuestion.id;

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
      const createdQuestion = questionResult.createQuestion;
      if (createdQuestion) {
        dateId = createdQuestion.id;

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
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1680);
  });

  describe('Proposal templates advanced tests', () => {
    beforeEach(() => {
      createTopicWithQuestionsAndRelations(true);
    });

    it('User can create proposal with template', () => {
      const dateTimeFieldValue = DateTime.fromJSDate(
        faker.date.past()
      ).toFormat(initialDBData.getFormats().dateTimeFormat);
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
      cy.login('user1');
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
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
        .type(dateTimeFieldValue);

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
      cy.contains(dateTimeFieldValue);

      cy.contains(richTextInputQuestion.title);
      cy.get(`[data-cy="${richTextInputId}_open"]`).click();
      cy.get('[role="dialog"]').contains(richTextInputQuestion.title);
      cy.get('[role="dialog"]').contains(richTextInputQuestion.answer);
      cy.get('[role="dialog"]').contains('Close').click();

      cy.contains('Dashboard').click();
      cy.contains(proposal.title);
      cy.contains('submitted');
    });
  });
});
