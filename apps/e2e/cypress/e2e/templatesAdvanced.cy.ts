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
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();
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

      cy.getTinyMceContent(richTextInputId).then((content) =>
        expect(content).to.have.string(richTextInputQuestion.answer)
      );

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

    it('File Upload field could be set as required', () => {
      const fileName = 'file_upload_test.png';

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion).click();

      cy.get('[role="presentation"]').contains('image/*').click();

      cy.get('body').type('{esc}');

      cy.contains('Is required').click();

      cy.contains('Update').click();

      cy.logout();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(faker.lorem.words(2));
      cy.get('[data-cy=abstract] textarea').first().type(faker.lorem.words(2));
      cy.contains('Save and continue').click();

      cy.contains(fileQuestion);
      cy.contains('Save and continue').click();
      cy.contains(fileQuestion)
        .parent()
        .contains('field must have at least 1 items');

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

      cy.contains(fileQuestion)
        .parent()
        .should('not.contain.text', 'field must have at least 1 items');

      cy.logout();
    });

    it('File Upload max files should be required', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion).click();

      cy.get('[role="presentation"]').contains('image/*').click();

      cy.get('body').type('{esc}');

      cy.get('[data-cy="max_files"] input').clear().type('-1');

      cy.contains('Update').should('be.disabled');

      cy.get('[data-cy="max_files"] input').clear();

      cy.get('[data-cy="max_files"] input').should('be.focused');
      cy.get('[data-cy="max_files"] input:invalid').should('have.length', 1);

      cy.get('[data-cy="max_files"] input').clear().type('1');

      cy.contains('Update').click();

      cy.get('[data-cy="question-relation-dialogue"]').should('not.exist');

      cy.logout();
    });

    it('Officer can delete proposal questions', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
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

      cy.get('[aria-label="Edit"]').last().click();

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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
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
        .find("[aria-label='Edit']")
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
      const fileName = 'file_upload_test2.png'; // need to use another file due to bug in cypress, which do not allow the same fixture to be reused
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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();
      cy.finishedLoading();

      cy.contains('Save and continue').click();

      cy.contains(fileQuestion);

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

      cy.get('[aria-label="Add image caption"]').click();

      cy.get('[data-cy="image-figure"] input').type('Fig_test');
      cy.get('[data-cy="image-caption"] input').type('Test caption');

      cy.get('[data-cy="save-button"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.finishedLoading();

      cy.get('.MuiStep-root').contains('Review').click();

      cy.contains(proposal.abstract);

      cy.contains(fileName);

      cy.get('[data-cy="questionary-stepper"]')
        .contains(initialDBData.template.topic.title)
        .click();

      cy.finishedLoading();
      cy.contains('Save and continue');

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
