import faker from 'faker';

import {
  AllocationTimeUnits,
  DataType,
  TemplateCategoryId,
  TemplateGroupId,
} from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

function twoFakes(numberWords: number) {
  return [faker.lorem.words(numberWords), faker.lorem.words(numberWords)];
}

context('GenericTemplates tests', () => {
  const proposalTemplateName = faker.lorem.words(3);
  const genericTemplateName = twoFakes(3);
  const genericTemplateDescription = twoFakes(3);
  const genericTemplateQuestions = twoFakes(3);
  const genericTemplateQuestion = twoFakes(4);
  const proposalTitle = twoFakes(3);
  const addButtonLabel = twoFakes(2);
  const genericTemplateTitle = faker.lorem.words(3);
  const genericTemplateQuestionaryQuestion = twoFakes(3);
  const proposalWorkflow = {
    name: faker.random.words(3),
    description: faker.random.words(5),
  };

  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);

  const updatedCall = {
    id: initialDBData.call.id,
    shortCode: faker.random.alphaNumeric(15),
    startCall: faker.date.past().toISOString().slice(0, 10),
    endCall: faker.date.future().toISOString().slice(0, 10),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: initialDBData.template.name,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(),
    surveyComment: faker.lorem.word(),
  };

  let createdTemplateId: number;
  let createdGenericTemplateId: number;
  let workflowId: number;
  let createdQuestion1Id: string;

  beforeEach(() => {
    cy.resetDB(true);
    cy.viewport(1920, 1080);
  });

  const createTemplateAndAllQuestions = () => {
    cy.createTemplate({
      name: proposalTemplateName,
      groupId: TemplateGroupId.GENERIC_TEMPLATE,
    }).then((result) => {
      if (result.createTemplate.template) {
        createdGenericTemplateId = result.createTemplate.template.templateId;

        const topicId =
          result.createTemplate.template.steps[
            result.createTemplate.template.steps.length - 1
          ].topic.id;
        cy.createQuestion({
          categoryId: TemplateCategoryId.GENERIC_TEMPLATE,
          dataType: DataType.TEXT_INPUT,
        }).then((questionResult) => {
          const createdQuestion1 = questionResult.createQuestion.question;
          if (createdQuestion1) {
            cy.updateQuestion({
              id: createdQuestion1.id,
              question: genericTemplateQuestions[0],
            });

            cy.createQuestionTemplateRelation({
              questionId: createdQuestion1.id,
              templateId: createdGenericTemplateId,
              sortOrder: 0,
              topicId: topicId,
            });
          }
        });
        cy.createQuestion({
          categoryId: TemplateCategoryId.GENERIC_TEMPLATE,
          dataType: DataType.TEXT_INPUT,
        }).then((questionResult) => {
          const createdQuestion2 = questionResult.createQuestion.question;
          if (createdQuestion2) {
            cy.updateQuestion({
              id: createdQuestion2.id,
              question: genericTemplateQuestions[1],
            });

            cy.createQuestionTemplateRelation({
              questionId: createdQuestion2.id,
              templateId: createdGenericTemplateId,
              sortOrder: 1,
              topicId: topicId,
            });
          }
        });

        cy.createTemplate({
          name: proposalTemplateName,
          groupId: TemplateGroupId.PROPOSAL,
        }).then((result) => {
          if (result.createTemplate.template) {
            createdTemplateId = result.createTemplate.template.templateId;

            cy.createTopic({
              templateId: createdTemplateId,
              sortOrder: 1,
            }).then((topicResult) => {
              if (!topicResult.createTopic.template) {
                throw new Error('Can not create topic');
              }

              const topicId =
                topicResult.createTopic.template.steps[
                  topicResult.createTopic.template.steps.length - 1
                ].topic.id;
              cy.createQuestion({
                categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                dataType: DataType.GENERIC_TEMPLATE,
              }).then((questionResult) => {
                if (questionResult.createQuestion.question) {
                  createdQuestion1Id =
                    questionResult.createQuestion.question.id;

                  cy.updateQuestion({
                    id: createdQuestion1Id,
                    question: genericTemplateQuestion[0],
                    config: `{"addEntryButtonLabel":"${addButtonLabel[0]}","minEntries":"1","maxEntries":"2","templateId":${createdGenericTemplateId},"templateCategory":"GENERIC_TEMPLATE","required":false,"small_label":""}`,
                  });

                  cy.createQuestionTemplateRelation({
                    questionId: createdQuestion1Id,
                    templateId: createdTemplateId,
                    sortOrder: 0,
                    topicId: topicId,
                  });
                }
              });
              cy.createQuestion({
                categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                dataType: DataType.GENERIC_TEMPLATE,
              }).then((questionResult) => {
                const createdQuestion2 = questionResult.createQuestion.question;
                if (createdQuestion2) {
                  cy.updateQuestion({
                    id: createdQuestion2.id,
                    question: genericTemplateQuestion[1],
                    config: `{"addEntryButtonLabel":"${addButtonLabel[1]}","minEntries":"0","maxEntries":"2","templateId":${createdGenericTemplateId},"templateCategory":"GENERIC_TEMPLATE","required":false,"small_label":""}`,
                  });

                  cy.createQuestionTemplateRelation({
                    questionId: createdQuestion2.id,
                    templateId: createdTemplateId,
                    sortOrder: 1,
                    topicId: topicId,
                  });
                }
              });
            });
          }
        });
      }
    });
  };

  describe('Generic templates basic tests', () => {
    it('Should be able to create proposal template with genericTemplate', () => {
      cy.createTemplate({
        name: proposalTemplateName,
        groupId: TemplateGroupId.PROPOSAL,
      });
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.navigateToTemplatesSubmenu('Sub Template');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input')
        .type(genericTemplateName[0])
        .should('have.value', genericTemplateName[0]);

      cy.get('[data-cy=description]').type(genericTemplateDescription[0]);

      cy.get('[data-cy=submit]').click();

      cy.get('[data-cy="proposal-question-id"').click();

      cy.get('[data-cy="question"').type(genericTemplateQuestions[0]);

      cy.get('[data-cy="submit"').click();

      cy.contains('New Sub Topic');

      cy.get('[data-cy=show-more-button]').last().click();

      cy.get('[data-cy=add-topic-menu-item]').last().click();

      cy.get('[data-cy="topic-title-edit"]').last().click();

      cy.get('[data-cy=topic-title-input] input')
        .last()
        .clear()
        .type(`${faker.lorem.word()}{enter}`);

      cy.createTextQuestion(genericTemplateQuestionaryQuestion[0]);

      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Sub Template');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input')
        .type(genericTemplateName[1])
        .should('have.value', genericTemplateName[1]);

      cy.get('[data-cy=description]').type(genericTemplateDescription[1]);

      cy.get('[data-cy=submit]').click();

      cy.get('[data-cy="proposal-question-id"').click();

      cy.get('[data-cy="question"').type(genericTemplateQuestions[1]);

      cy.get('[data-cy="submit"').click();

      cy.contains('New Sub Topic');

      cy.get('[data-cy=show-more-button]').last().click();

      cy.get('[data-cy=add-topic-menu-item]').last().click();

      cy.get('[data-cy="topic-title-edit"]').last().click();

      cy.get('[data-cy=topic-title-input] input')
        .last()
        .clear()
        .type(`${faker.lorem.word()}{enter}`);

      cy.createTextQuestion(genericTemplateQuestionaryQuestion[1]);

      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(proposalTemplateName).parent().find('[title="Edit"]').click();

      cy.finishedLoading();

      cy.createGenericTemplateQuestion(
        genericTemplateQuestion[0],
        genericTemplateName[0],
        addButtonLabel[0],
        {
          minEntries: 1,
          maxEntries: 2,
        }
      );

      cy.createGenericTemplateQuestion(
        genericTemplateQuestion[1],
        genericTemplateName[1],
        addButtonLabel[1],
        {
          minEntries: 0,
          maxEntries: 2,
        }
      );

      cy.contains(genericTemplateQuestion[0]); // checking if question in the topic column
      cy.contains(genericTemplateQuestion[1]); // checking if question in the topic column
    });
  });

  describe('Generic templates advanced tests', () => {
    beforeEach(() => {
      createTemplateAndAllQuestions();

      cy.createProposalWorkflow(proposalWorkflow).then((result) => {
        if (result.createProposalWorkflow.proposalWorkflow) {
          workflowId = result.createProposalWorkflow.proposalWorkflow?.id;
        } else {
          throw new Error('Workflow creation failed');
        }
      });
    });

    it('Should have different Question lables for different tables', () => {
      cy.updateCall({
        ...updatedCall,
        templateId: createdTemplateId,
        proposalWorkflowId: workflowId,
      });
      cy.login('user');
      cy.visit('/');

      cy.contains('New proposal', { matchCase: false }).click();
      cy.get('[data-cy=title] input').type(faker.lorem.words(1));

      cy.get('[data-cy=abstract] textarea').first().type(faker.lorem.words(2));

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.contains(addButtonLabel[0]).click();

      cy.contains(genericTemplateQuestions[0]).should('exist');

      cy.get('[data-cy=genericTemplate-declaration-modal]').type('{esc}');

      cy.contains(addButtonLabel[1]).click();

      cy.contains(genericTemplateQuestions[1]).should('exist');
    });

    it('Should be able to create proposal with genericTemplate', () => {
      cy.updateCall({
        ...updatedCall,
        templateId: createdTemplateId,
        proposalWorkflowId: workflowId,
      });
      cy.login('user');
      cy.visit('/');

      cy.contains('New proposal', { matchCase: false }).click();

      cy.get('[data-cy=title] input').type(proposalTitle[1]);

      cy.get('[data-cy=abstract] textarea').first().type(proposalTitle[1]);

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.contains(addButtonLabel[0]).click();

      cy.contains(genericTemplateQuestions[0]);

      cy.get('[data-cy=title-input] input').clear();

      cy.get(
        '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.contains('This is a required field');

      cy.get('[data-cy=title-input] input')
        .clear()
        .type(genericTemplateTitle)
        .should('have.value', genericTemplateTitle);

      cy.get(
        '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.finishedLoading();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy="clone"]').click();

      cy.contains('OK').click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 2);

      cy.get('[data-cy="questionnaires-list-item-completed:true"]').should(
        'have.length',
        2
      );

      cy.contains(addButtonLabel[0]).should('be.disabled'); // Add button should be disabled because of max entry limit

      cy.get('[data-cy="delete"]').eq(1).click();

      cy.contains('OK').click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);
      cy.contains(addButtonLabel[0]).should('not.be.disabled');

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();
    });

    it('Should be able to clone proposal with GenericTemplates', () => {
      cy.updateCall({
        ...updatedCall,
        templateId: createdTemplateId,
        proposalWorkflowId: workflowId,
      });
      cy.createProposal({ callId: updatedCall.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalTitle[1],
            abstract: faker.lorem.words(3),
          });
          cy.createGenericTemplate({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: genericTemplateTitle,
            templateId: createdGenericTemplateId,
            questionId: createdQuestion1Id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.contains(proposalTitle[1])
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get('[title="Clone proposals to call"]').click();

      cy.get('#selectedCallId-input').click();
      cy.get('[role="presentation"]').contains(updatedCall.shortCode).click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s cloned successfully',
      });

      cy.contains(`Copy of ${proposalTitle[1]}`)
        .parent()
        .find('[title="View proposal"]')
        .click();

      cy.contains('Edit proposal').click();

      cy.finishedLoading();

      cy.contains('New topic', { matchCase: false }).click();

      cy.get('[data-cy=questionnaires-list-item]')
        .contains(genericTemplateTitle)
        .click();

      cy.get('[data-cy="genericTemplate-declaration-modal"]').should('exist');
      cy.get(
        '[data-cy="genericTemplate-declaration-modal"] [data-cy=questionary-title]'
      ).contains(genericTemplateTitle);
    });

    it('User should not be able to submit proposal with unfinished genericTemplate', () => {
      cy.updateCall({
        ...updatedCall,
        templateId: createdTemplateId,
        proposalWorkflowId: workflowId,
      });
      cy.createProposal({ callId: updatedCall.id });
      cy.login('user');
      cy.visit('/');

      cy.contains('New proposal', { matchCase: false }).click();

      cy.get('[data-cy=title] input').type(proposalTitle[1]);

      cy.get('[data-cy=abstract] textarea').first().type(proposalTitle[1]);

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.contains(addButtonLabel[0]).click();

      cy.get('[data-cy=title-input] input')
        .clear()
        .type(genericTemplateTitle)
        .should('have.value', genericTemplateTitle)
        .blur();

      cy.get(
        '[data-cy="genericTemplate-declaration-modal"] [data-cy="save-button"]'
      ).click();

      cy.finishedLoading();

      cy.get('body').type('{esc}');

      cy.finishedLoading();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy="save-and-continue-button"]').click();

      cy.contains('All genericTemplates must be completed');

      cy.contains(genericTemplateTitle).click();

      cy.get(
        '[data-cy="genericTemplate-declaration-modal"] [data-cy="save-and-continue-button"]'
      ).click();

      cy.finishedLoading();

      cy.get('.Mui-error').should('not.exist');

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();
    });

    it('Officer should able to delete proposal with genericTemplate', () => {
      cy.updateCall({
        ...updatedCall,
        templateId: createdTemplateId,
        proposalWorkflowId: workflowId,
      });
      cy.createProposal({ callId: updatedCall.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalTitle[1],
            abstract: faker.lorem.words(3),
          });
          cy.createGenericTemplate({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: genericTemplateTitle,
            templateId: createdGenericTemplateId,
            questionId: createdQuestion1Id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.get("input[type='checkbox']").first().click();

      cy.get("[title='Delete proposals']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.contains(proposalTitle[1]).should('not.exist');
    });
  });
});
