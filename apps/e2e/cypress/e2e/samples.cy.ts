import { faker } from '@faker-js/faker';
import {
  DataType,
  TemplateCategoryId,
  TemplateGroupId,
  FeatureId,
  WorkflowType,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import { updatedCall } from '../support/utils';

context('Samples tests', () => {
  const existingUser = initialDBData.users.user1;
  const booleanQuestion = faker.lorem.words(3);
  const proposalTemplateName = faker.lorem.words(2);
  const sampleTemplateName = faker.lorem.words(2);
  const sampleTemplateDescription = faker.lorem.words(4);
  const sampleQuestion = faker.lorem.words(4);
  const proposalTitle = faker.lorem.words(2);
  const safetyComment = faker.lorem.words(5);
  const sampleTitle = faker.lorem.words(2);
  const sampleQuestionaryQuestion = faker.lorem.words(2);
  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
    entityType: WorkflowType.PROPOSAL,
  };

  let createdWorkflowId: number;
  let createdSampleTemplateId: number;
  let createdSampleQuestionId: string;

  const createProposalTemplateWithSampleQuestionAndUseTemplateInCall = () => {
    cy.createTemplate({
      name: sampleTemplateName,
      groupId: TemplateGroupId.SAMPLE,
    }).then((result) => {
      if (result.createTemplate) {
        createdSampleTemplateId = result.createTemplate.templateId;
        cy.createTopic({
          templateId: createdSampleTemplateId,
          sortOrder: 1,
        }).then((topicResult) => {
          if (topicResult.createTopic) {
            const topicId =
              topicResult.createTopic.steps[
                topicResult.createTopic.steps.length - 1
              ].topic.id;
            cy.createQuestion({
              dataType: DataType.TEXT_INPUT,
              categoryId: TemplateCategoryId.SAMPLE_DECLARATION,
            }).then((questionResult) => {
              if (questionResult.createQuestion) {
                cy.updateQuestion({
                  id: questionResult.createQuestion.id,
                  question: sampleQuestion,
                });
                cy.createQuestionTemplateRelation({
                  questionId: questionResult.createQuestion.id,
                  sortOrder: 0,
                  templateId: createdSampleTemplateId,
                  topicId: topicId,
                });
              }
            });
          }
        });
        cy.createTemplate({
          groupId: TemplateGroupId.PROPOSAL,
          name: proposalTemplateName,
        }).then((result) => {
          if (result.createTemplate) {
            const templateId = result.createTemplate.templateId;
            cy.createTopic({
              templateId: templateId,
              sortOrder: 1,
            }).then((topicResult) => {
              if (topicResult.createTopic) {
                const topicId =
                  topicResult.createTopic.steps[
                    topicResult.createTopic.steps.length - 1
                  ].topic.id;
                cy.createQuestion({
                  dataType: DataType.SAMPLE_DECLARATION,
                  categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                }).then((questionResult) => {
                  if (questionResult.createQuestion.question) {
                    createdSampleQuestionId = questionResult.createQuestion.id;

                    cy.updateQuestion({
                      id: createdSampleQuestionId,
                      question: sampleQuestionaryQuestion,
                      config: `{"addEntryButtonLabel":"Add","minEntries":"1","maxEntries":"2","templateId":${createdSampleTemplateId},"templateCategory":"${TemplateCategoryId.SAMPLE_DECLARATION}"}`,
                    });

                    cy.createQuestionTemplateRelation({
                      questionId: createdSampleQuestionId,
                      sortOrder: 0,
                      templateId: templateId,
                      topicId: topicId,
                    });
                  }
                });

                cy.createQuestion({
                  categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                  dataType: DataType.BOOLEAN,
                }).then((questionResult) => {
                  const createdQuestion = questionResult.createQuestion;
                  if (createdQuestion) {
                    cy.updateQuestion({
                      id: createdQuestion.id,
                      question: booleanQuestion,
                    });

                    cy.createQuestionTemplateRelation({
                      questionId: createdQuestion.id,
                      templateId: templateId,
                      sortOrder: 0,
                      topicId: topicId,
                    });
                  }
                });
              }
            });

            cy.updateCall({
              id: initialDBData.call.id,
              ...updatedCall,
              proposalWorkflowId: createdWorkflowId,
              templateId: templateId,
            });
          }
        });
      }
    });
  };

  beforeEach(() => {
    // NOTE: Stop the web application and clearly separate the end-to-end tests by visiting the blank about page after each test.
    // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    });

    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Samples basic tests', () => {
    beforeEach(() => {
      cy.createWorkflow(proposalWorkflow).then((result) => {
        if (result.createWorkflow) {
          createdWorkflowId = result.createWorkflow.id;
        }
      });
    });

    it('Should be able to create proposal template with sample', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Sample declaration');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input')
        .type(sampleTemplateName)
        .should('have.value', sampleTemplateName);

      cy.get('[data-cy=description]').type(sampleTemplateDescription);

      cy.get('[data-cy=submit]').click();

      cy.contains('New sample');

      cy.get('[data-cy=show-more-button]').last().click();

      cy.get('[data-cy=add-topic-menu-item]').last().click();

      cy.finishedLoading();

      cy.createTextQuestion(sampleQuestionaryQuestion);

      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input')
        .type(proposalTemplateName)
        .should('have.value', proposalTemplateName);

      cy.get('[data-cy=submit]').click();

      cy.get('[data-cy=show-more-button]').last().click();

      cy.get('[data-cy=add-topic-menu-item]').last().click();

      cy.finishedLoading();

      cy.createSampleQuestion(sampleQuestion, sampleTemplateName, {
        minEntries: 1,
        maxEntries: 2,
      });

      cy.contains(sampleQuestion); // checking if question in the topic column
    });

    it('Should be possible to change template in a call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL,
        name: proposalTemplateName,
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Calls').click();

      cy.get('[aria-label="Edit"]').click();

      cy.get('[data-cy=call-template]').click();

      cy.contains(proposalTemplateName).click();

      cy.get('[data-cy="call-workflow"]').click();
      cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="submit"]').click();
    });
    it('Should be able to create proposal with sample', () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('new proposal', { matchCase: false }).click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(proposalTitle);

      cy.get('[data-cy=abstract] textarea').first().type(proposalTitle);

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.get('[data-cy=add-button]').click();

      cy.get('[data-cy=title-input] input').clear();

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.contains('This is a required field');

      cy.get('[data-cy=title-input] input')
        .clear()
        .type(sampleTitle)
        .should('have.value', sampleTitle);

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.finishedLoading();

      cy.get('span.MuiStepLabel-label')
        .last()
        .should('have.class', 'Mui-active');

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
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

      cy.get('[data-cy=add-button]').should('be.disabled'); // Add button should be disabled because of max entry limit

      cy.get('[data-cy="delete"]').eq(1).click();

      cy.contains('OK').click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy=add-button]').should('not.be.disabled');

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();
    });

    it('Should be able to modify sample declaration question and all other questions without loosing information', () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('new proposal', { matchCase: false }).click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(proposalTitle);

      cy.get('[data-cy=abstract] textarea').first().type(proposalTitle);

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.get('[data-cy=add-button]').click();

      cy.get('[data-cy=title-input] input').clear();

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.contains('This is a required field');

      cy.get('[data-cy=title-input] input')
        .clear()
        .type(sampleTitle)
        .should('have.value', sampleTitle);

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.finishedLoading();

      cy.get('span.MuiStepLabel-label')
        .last()
        .should('have.class', 'Mui-active');

      cy.get(
        '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
      ).click();

      cy.finishedLoading();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.contains(booleanQuestion)
        .parent()
        .find('input')
        .should('have.value', 'false')
        .click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy="clone"]').click();

      cy.contains('OK').click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 2);

      cy.get('[data-cy="questionnaires-list-item-completed:true"]').should(
        'have.length',
        2
      );

      cy.contains(booleanQuestion)
        .parent()
        .find('input')
        .should('have.value', 'true')
        .click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 2);

      cy.get('[data-cy=add-button]').should('be.disabled'); // Add button should be disabled because of max entry limit

      cy.get('[data-cy="delete"]').eq(1).click();

      cy.contains('OK').click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.contains(booleanQuestion)
        .parent()
        .find('input')
        .should('have.value', 'false')
        .click();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy=add-button]').should('not.be.disabled');

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();
    });
  });

  describe('Samples advanced tests', () => {
    let createdProposalId: string;
    let createdProposalPk: number;

    beforeEach(() => {
      cy.createWorkflow(proposalWorkflow).then((result) => {
        if (result.createWorkflow) {
          createdWorkflowId = result.createWorkflow.id;
        }
      });

      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposalTitle,
            abstract: proposalTitle,
            proposerId: existingUser.id,
          });
        }
      });

      cy.login('officer');
    });

    it('Officer should able to delete proposal with sample', () => {
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.contains(proposalTitle)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get("[aria-label='Delete proposals']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.contains(proposalTitle).should('not.exist');
    });

    it('Should be able to clone proposal with samples', () => {
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.contains(proposalTitle)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get('[aria-label="Clone proposals to call"]').click();

      cy.get('#selectedCallId-input').click();
      cy.get('[role="presentation"]').contains(updatedCall.shortCode).click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s cloned successfully',
      });

      cy.contains(`Copy of ${proposalTitle}`)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains('Edit proposal').click();

      cy.contains('new topic', { matchCase: false }).click();

      cy.get('[data-cy=questionnaires-list-item]')
        .contains(sampleTitle)
        .click();

      cy.get('[data-cy="sample-declaration-modal"]').should('exist');
      cy.get(
        '[data-cy="sample-declaration-modal"] [data-cy=questionary-title]'
      ).contains(sampleTitle);
    });

    it('User should not be able to submit proposal with unfinished sample', () => {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposalTitle)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('Save and continue').click();

      cy.get('[data-cy=add-button]').click();

      cy.get('[data-cy=title-input] input')
        .clear()
        .type(sampleTitle)
        .should('have.value', sampleTitle);

      cy.get(
        '[data-cy="sample-declaration-modal"] [data-cy="save-and-continue-button"]'
      ).click();

      cy.finishedLoading();

      cy.get('body').type('{esc}');

      cy.finishedLoading();

      cy.get('[data-cy="questionnaires-list-item"]').should('have.length', 1);

      cy.get('[data-cy="save-and-continue-button"]').click();

      cy.contains('All samples must be completed');

      cy.contains(sampleTitle).click();

      cy.get(
        '[data-cy="sample-declaration-modal"] [data-cy="save-and-continue-button"]'
      ).click();

      cy.finishedLoading();

      cy.get('.Mui-error').should('not.exist');

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();
    });

    it('Officer should be able to evaluate sample', function () {
      if (
        !featureFlags
          .getEnabledFeatures()
          .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
      ) {
        this.skip();
      }
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.submitProposal({ proposalPk: createdProposalPk });
      cy.visit('/');

      cy.contains('Experiment Safety').click();

      cy.get('[data-cy=experiment-safety-forms-table]').contains(
        createdProposalId
      );

      cy.get('[placeholder=Search]').click().clear().type(createdProposalId);

      cy.get('[data-cy=experiment-safety-forms-table]').contains(
        createdProposalId
      );

      cy.get('[data-cy=experiment-safety-forms-table]').should(
        'not.contain',
        '999999'
      );

      cy.get('[placeholder=Search]').click().clear();

      cy.get('[data-cy=experiment-safety-forms-table]').contains('999999');

      cy.contains(createdProposalId)
        .last()
        .parent()
        .find('[aria-label="Experiment Safety Review"]')
        .click();

      cy.get('[data-cy="safety-status"]').click();

      cy.get('[role=presentation]').contains('Low risk').click();

      cy.get('[data-cy="safety-comment"]').type(safetyComment);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'submitted' });

      cy.reload();

      cy.contains(createdProposalId)
        .last()
        .parent()
        .find('[aria-label="Experiment Safety Review"]')
        .last()
        .click();

      cy.contains(safetyComment); // test if comment entered is present after reload

      cy.get('[data-cy="safety-status"]').click();

      cy.contains('High risk').click();

      cy.get('[data-cy="submit"]').click();

      cy.contains('HIGH_RISK'); // test if status has changed
    });

    it('Experiment Safety Reviewer should be able to evaluate sample', function () {
      if (
        !featureFlags
          .getEnabledFeatures()
          .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
      ) {
        this.skip();
      }
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.submitProposal({ proposalPk: createdProposalPk });

      const experimentSafetyReviewer = initialDBData.users.user1;

      cy.updateUserRoles({
        id: experimentSafetyReviewer.id,

        roles: [initialDBData.roles.experimentSafetyReviewer],
      });

      cy.login(experimentSafetyReviewer);

      cy.visit('/');

      cy.contains('Experiment Safety').click();

      cy.get('[data-cy=experiment-safety-forms-table]').contains(
        createdProposalId
      );

      cy.get('[placeholder=Search]').click().clear().type(createdProposalId);

      cy.get('[data-cy=experiment-safety-forms-table]').contains(
        createdProposalId
      );

      cy.get('[data-cy=experiment-safety-forms-table]').should(
        'not.contain',
        '999999'
      );

      cy.get('[placeholder=Search]').click().clear();

      cy.get('[data-cy=experiment-safety-forms-table]').contains('999999');

      cy.contains(createdProposalId)
        .last()
        .parent()
        .find('[aria-label="Experiment Safety Review"]')
        .click();

      cy.get('[data-cy="safety-status"]').click();

      cy.get('[role=presentation]').contains('Low risk').click();

      cy.get('[data-cy="safety-comment"]').type(safetyComment);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'submitted' });

      cy.reload();

      cy.contains(createdProposalId)
        .last()
        .parent()
        .find('[aria-label="Experiment Safety Review"]')
        .last()
        .click();

      cy.contains(safetyComment); // test if comment entered is present after reload

      cy.get('[data-cy="safety-status"]').click();

      cy.contains('High risk').click();

      cy.get('[data-cy="submit"]').click();

      cy.contains('HIGH_RISK'); // test if status has changed
    });

    it('Download samples is working with dialog window showing up', function () {
      if (
        !featureFlags
          .getEnabledFeatures()
          .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
      ) {
        this.skip();
      }
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.visit('/');

      cy.contains('Experiment Safety').click();

      cy.get('[data-cy=experiment-safety-forms-table]')
        .contains(sampleTitle)
        .first()
        .closest('tr')
        .find('[data-cy="download-sample"]')
        .click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        sampleTitle
      );
    });

    it('Should be able to download sample pdf', function () {
      if (
        !featureFlags
          .getEnabledFeatures()
          .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
      ) {
        this.skip();
      }
      cy.createSample({
        proposalPk: createdProposalPk,
        templateId: createdSampleTemplateId,
        questionId: createdSampleQuestionId,
        title: sampleTitle,
      });
      cy.visit('/');

      cy.contains('Experiment Safety').click();

      const token = window.localStorage.getItem('token');

      cy.request({
        url: '/download/pdf/sample/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        expect(response.headers['content-type']).to.be.equal('application/pdf');
        expect(response.status).to.be.equal(200);
      });
    });
  });
});
