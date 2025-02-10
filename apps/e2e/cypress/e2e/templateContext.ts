import { faker } from '@faker-js/faker';
import {
  TemplateCategoryId,
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
  AllocationTimeUnits,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

let boolId: string;
let textId: string;
let dateId: string;
let timeId: string;
let multipleChoiceId: string;
let intervalId: string;
let numberId: string;
let richTextInputId: string;
let richTextInputAllowImagesId: string;

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
  allowImages: false,
  answer: faker.lorem.words(3),
};
const richTextInputQuestionAllowImages = {
  title: faker.lorem.words(3),
  maxChars: 200,
  allowImages: true,
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

const templateSearch = {
  title: faker.lorem.words(3),
  description: faker.lorem.words(3),
};

const currentDayStart = DateTime.now().startOf('day');
const esiTemplateName = faker.lorem.words(2);

const newCall = {
  shortCode: faker.random.alphaNumeric(15),
  startCall: DateTime.fromJSDate(faker.date.past()),
  endCall: DateTime.fromJSDate(faker.date.future()),
  startReview: currentDayStart,
  endReview: currentDayStart,
  startFapReview: currentDayStart,
  endFapReview: currentDayStart,
  startNotify: currentDayStart,
  endNotify: currentDayStart,
  startCycle: currentDayStart,
  endCycle: currentDayStart,
  templateName: initialDBData.template.name,
  templateId: initialDBData.template.id,
  fapReviewTemplateName: initialDBData.fapReviewTemplate.name,
  fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
  technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
  technicalReviewTemplateName: initialDBData.technicalReviewTemplate.name,
  allocationTimeUnit: AllocationTimeUnits.DAY,
  cycleComment: faker.lorem.word(10),
  surveyComment: faker.lorem.word(10),
  esiTemplateName: esiTemplateName,
};

const proposalWorkflow = {
  name: faker.random.words(2),
  description: faker.random.words(5),
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
        config: `{"max":"${richTextInputQuestion.maxChars}", "allowImages": ${richTextInputQuestion.allowImages}}`,
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
  cy.createQuestion({
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    dataType: DataType.RICH_TEXT_INPUT,
  }).then((questionResult) => {
    const createdQuestion = questionResult.createQuestion;
    if (createdQuestion) {
      richTextInputAllowImagesId = createdQuestion.id;

      cy.updateQuestion({
        id: createdQuestion.id,
        question: richTextInputQuestionAllowImages.title,
        config: `{"max":"${richTextInputQuestionAllowImages.maxChars}", "allowImages": ${richTextInputQuestionAllowImages.allowImages}}`,
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

export {
  boolId,
  textId,
  dateId,
  timeId,
  multipleChoiceId,
  intervalId,
  numberId,
  richTextInputId,
  richTextInputAllowImagesId,
  proposal,
  booleanQuestion,
  dateQuestion,
  timeQuestion,
  fileQuestion,
  intervalQuestion,
  numberQuestion,
  textQuestion,
  richTextInputQuestion,
  richTextInputQuestionAllowImages,
  multipleChoiceQuestion,
  dynamicMultipleChoiceQuestion,
  templateDependencies,
  templateSearch,
  newCall,
  proposalWorkflow,
  createTopicWithQuestionsAndRelations,
};
