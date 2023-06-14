import { faker } from '@faker-js/faker';
import {
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
  TemplateCategoryId,
} from '@user-office-software-libs/shared-types';

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
  });
});
