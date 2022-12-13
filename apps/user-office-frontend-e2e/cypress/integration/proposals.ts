import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  DataType,
  TemplateCategoryId,
  TemplateGroupId,
  FeatureId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Proposal tests', () => {
  const title = faker.lorem.words(2);
  const abstract = faker.lorem.words(3);
  const newProposalTitle = faker.lorem.words(2);
  const newProposalAbstract = faker.lorem.words(3);
  const proposalTitleUpdated = faker.lorem.words(2);
  const clonedProposalTitle = `Copy of ${newProposalTitle}`;
  const clonedProposalInternalTitle = `Copy of ${title}`;
  const proposer = initialDBData.users.user1;
  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  const proposalInternalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  let createdWorkflowId: number;
  let createdProposalPk: number;
  const textQuestion = faker.random.words(2);

  const currentDayStart = DateTime.now().startOf('day');
  const yesterday = currentDayStart.plus({ days: -1 });
  const twoDaysAgo = currentDayStart.plus({ days: -2 });
  const tomorrow = currentDayStart.plus({ days: 1 });

  const newCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: faker.date.past().toISOString(),
    endCall: faker.date.future().toISOString(),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: initialDBData.template.name,
    templateId: initialDBData.template.id,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(10),
    surveyComment: faker.lorem.word(10),
  };

  const createTopicAndQuestionToExistingTemplate = () => {
    cy.createTopic({
      templateId: initialDBData.template.id,
      sortOrder: 1,
    }).then((topicResult) => {
      if (topicResult.createTopic.template) {
        const topicId =
          topicResult.createTopic.template.steps[
            topicResult.createTopic.template.steps.length - 1
          ].topic.id;
        cy.createQuestion({
          categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
          dataType: DataType.TEXT_INPUT,
        }).then((result) => {
          if (result.createQuestion.question) {
            cy.updateQuestion({
              id: result.createQuestion.question.id,
              question: textQuestion,
            });

            cy.createQuestionTemplateRelation({
              templateId: initialDBData.template.id,
              sortOrder: 0,
              topicId: topicId,
              questionId: result.createQuestion.question.id,
            });
          }
        });
      }
    });
  };

  describe('Proposal basic tests', () => {
    beforeEach(() => {
      cy.getAndStoreFeaturesEnabled();
      cy.resetDB();
      cy.createTemplate({
        name: 'default esi template',
        groupId: TemplateGroupId.PROPOSAL_ESI,
      });
      cy.createProposalWorkflow({
        name: proposalWorkflow.name,
        description: proposalWorkflow.description,
      }).then((result) => {
        if (result.createProposalWorkflow.proposalWorkflow) {
          createdWorkflowId = result.createProposalWorkflow.proposalWorkflow.id;
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          createdProposalPk = result.createProposal.proposal.primaryKey;

          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: newProposalTitle,
            abstract: newProposalAbstract,
            proposerId: proposer.id,
          });
        }
      });
    });

    it('Copy to clipboard should work for Proposal ID', () => {
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[data-testid="ContentCopyIcon"]').realClick();

      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          cy.get('[role="alert"]').should('contain', text);
        });
      });
    });

    it('Should be able create proposal', () => {
      cy.login('user1');
      cy.visit('/');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );

      cy.get('[data-cy=edit-proposer-button]').click();

      cy.finishedLoading();

      cy.get('[data-cy=email]').type('ben@inbox.com');

      cy.get('[data-cy=findUser]').click();

      cy.contains('Benjamin')
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Title is required');
      cy.contains('Abstract is required');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

      cy.get('[data-cy=edit-proposer-button]').click();
      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal')
        .contains(proposer.firstName)
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');

      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('exist')
        .click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');

      cy.get('[aria-label="View proposal"]').should('exist');
    });

    it('Officer should be able to edit proposal', () => {
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains('Edit proposal').click();

      cy.contains('New proposal').click();

      cy.get('[data-cy=title] input')
        .clear()
        .type(proposalTitleUpdated)
        .should('have.value', proposalTitleUpdated);

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.contains('Close').click();

      cy.contains(proposalTitleUpdated);
    });

    it('User officer should be able to save proposal column selection', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SEP_REVIEW)) {
        this.skip();
      }
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper').contains('Call').click();
      cy.get('.MuiPopover-paper').contains('SEP').click();

      cy.get('body').click();

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('Proposals').click();

      cy.contains('Call');
      cy.contains('SEP');
    });

    it('User officer should be able to select all prefetched proposals in the table', function () {
      const NUMBER_OF_PROPOSALS = 6;
      const DEFAULT_ROWS_PER_PAGE = 5;

      for (let index = 0; index < NUMBER_OF_PROPOSALS; index++) {
        cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
          if (result.createProposal.proposal) {
            cy.updateProposal({
              proposalPk: result.createProposal.proposal.primaryKey,
              title: newProposalTitle + index,
              abstract: newProposalAbstract + index,
              proposerId: proposer.id,
            });
          }
        });
      }

      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();
      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"]').contains(newProposalTitle);
      cy.get('[data-cy="officer-proposals-table"]').should(
        'not.contain',
        `${newProposalTitle}${NUMBER_OF_PROPOSALS - 1}`
      );
      cy.get('[data-cy="officer-proposals-table"] tfoot').contains(
        `${DEFAULT_ROWS_PER_PAGE} rows`
      );

      cy.get(
        '[data-cy="officer-proposals-table"] thead [aria-label="Select All Rows"][type="checkbox"]'
      ).check();

      cy.get(
        '[data-cy="officer-proposals-table"] [data-cy="select-all-toolbar"]'
      ).contains(`${DEFAULT_ROWS_PER_PAGE} row(s) selected`);
      cy.get(
        '[data-cy="officer-proposals-table"] [data-cy="select-all-toolbar"] [data-cy="select-all-proposals"] [data-cy="select-all-prefetched-proposals"]'
      ).click();

      cy.get(
        '[data-cy="officer-proposals-table"] [data-cy="select-all-toolbar"] [data-cy="select-all-proposals"]'
      ).contains('All proposals are selected');

      cy.get(
        '[data-cy="officer-proposals-table"] tfoot button[aria-label="Next Page"]'
      ).click();

      cy.get('[data-cy="officer-proposals-table"]')
        .contains(`${newProposalTitle}${NUMBER_OF_PROPOSALS - 1}`)
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.get(
        '[data-cy="officer-proposals-table"] [data-cy="select-all-toolbar"] [data-cy="select-all-proposals"] [data-cy="clear-all-selection"]'
      ).click();

      cy.get(
        '[data-cy="officer-proposals-table"] [data-cy="select-all-toolbar"] [data-cy="select-all-proposals"]'
      ).should('not.exist');

      cy.get(
        '[data-cy="officer-proposals-table"] tfoot button[aria-label="Previous Page"]'
      ).click();

      cy.get('[data-cy="officer-proposals-table"]')
        .contains(newProposalTitle)
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });

    it('Should be able to see proposal allocation time unit on the proposal', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper').contains('Technical time allocation').click();
      cy.get('.MuiPopover-paper').contains('Final time allocation').click();

      cy.get('body').click();

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"] input').clear().type('10');

      cy.get('[data-cy="technical-review-status"]').click();
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Feasible')
        .click();

      cy.get('[data-cy="save-technical-review"]').click();

      cy.closeModal();

      cy.contains(newProposalTitle).parent().contains('10(Days)');

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.get('[aria-label="Edit"]').first().click();

      cy.get('[data-cy="call-workflow"]').click();
      cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

      cy.get('[data-cy="allocation-time-unit"]').click();
      cy.contains('Hour').click();

      cy.get('[data-cy="call-esi-template"]').click();
      cy.get('[role="listbox"] li').first().click();

      cy.get('[data-cy="next-step"]').click();
      cy.get('[data-cy="next-step"]').click();
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Proposals').click();
      cy.contains(newProposalTitle).parent().contains('10(Hours)');
    });

    it('Should be able clone proposal to another call', () => {
      cy.createCall({
        ...newCall,
        proposalWorkflowId: createdWorkflowId,
      });
      cy.submitProposal({ proposalPk: createdProposalPk });

      cy.login('user1');
      cy.visit('/');

      cy.contains(newProposalTitle);
      cy.contains('submitted');

      cy.get('[aria-label="View proposal"]').should('exist');

      cy.get('[aria-label="Clone proposal"]').first().click();

      cy.get('[data-cy="call-selection"]').click();
      cy.get('[data-cy="call-selection-options"]')
        .contains(newCall.shortCode)
        .click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal cloned successfully',
      });

      cy.contains(clonedProposalTitle)
        .parent()
        .should('contain.text', newCall.shortCode);
    });

    it('User officer should be able to change status to one or multiple proposals', () => {
      cy.cloneProposals({
        callId: initialDBData.call.id,
        proposalsToClonePk: [createdProposalPk],
      });
      cy.login('officer');
      cy.visit('/');

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal/s status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('DRAFT').click();

      cy.get('[role="alert"] .MuiAlert-message').contains(
        'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
      );

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal/s status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('SEP Meeting').click();

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.contains(newProposalTitle)
        .parent()
        .should('contain.text', 'SEP Meeting');
      cy.contains(clonedProposalTitle)
        .parent()
        .should('contain.text', 'SEP Meeting');
    });

    it('User officer should be able to see proposal status when opening change status modal', () => {
      cy.cloneProposals({
        callId: initialDBData.call.id,
        proposalsToClonePk: [createdProposalPk],
      });
      cy.changeProposalsStatus({
        statusId: initialDBData.proposalStatuses.sepMeeting.id,
        proposals: [
          { primaryKey: createdProposalPk, callId: initialDBData.call.id },
        ],
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains(clonedProposalTitle)
        .parent()
        .find('[type="checkbox"]')
        .check();

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-selection"] input').should(
        'have.value',
        `${initialDBData.proposalStatuses.draft.name}`
      );

      // Close the modal
      cy.get('body').trigger('keydown', { keyCode: 27 });

      cy.contains(clonedProposalTitle)
        .parent()
        .find('[type="checkbox"]')
        .uncheck();

      cy.contains('SEP Meeting').parent().find('[type="checkbox"]').check();
      cy.get('[data-cy="change-proposal-status"]').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-selection"] input').should(
        'have.value',
        `${initialDBData.proposalStatuses.sepMeeting.name}`
      );

      // Close the modal
      cy.get('body').trigger('keydown', { keyCode: 27 });

      cy.changeProposalsStatus({
        statusId: initialDBData.proposalStatuses.sepReview.id,
        proposals: [
          { primaryKey: createdProposalPk, callId: initialDBData.call.id },
        ],
      });

      cy.contains(clonedProposalTitle)
        .parent()
        .find('[type="checkbox"]')
        .check();
      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[data-cy="status-selection"] input').should('not.have.value');

      cy.get('[data-cy="proposal-different-statuses-change"]')
        .should('exist')
        .should(
          'have.text',
          'Be aware that selected proposals have different statuses and changing status will affect all of them.'
        );
    });

    it('Should be able to delete proposal', () => {
      cy.login('user1');
      cy.visit('/');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="Delete proposal"]')
        .click();

      cy.contains('OK').click();

      cy.contains(newProposalTitle).should('not.exist');
    });

    it('User should not be able to create and submit proposal on a call that is ended', () => {
      createTopicAndQuestionToExistingTemplate();
      cy.login('user1');
      cy.visit('/');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('Save and continue').click();

      cy.contains('label', textQuestion).then(($elem) => {
        cy.get(`#${$elem.attr('for')}`).type(faker.random.word());
      });
      cy.contains('Save and continue').click();
      cy.notification({ text: 'Saved', variant: 'success' });

      cy.updateCall({
        id: initialDBData.call.id,
        ...newCall,
        startCall: twoDaysAgo,
        endCall: yesterday,
        endCallInternal: yesterday,
        proposalWorkflowId: createdWorkflowId,
      });

      cy.visit('/');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains('Submit').should('be.disabled');

      cy.get('[data-cy="user-menu-items"]')
        .find('[aria-label="New Proposal"]')
        .should('have.css', 'pointer-events', 'none');
    });

    it('User cannot select inactive call for new proposal', () => {
      let createdCallId: number;
      const createdCallTitle = 'Created call';

      cy.login('user1');
      cy.visit('/');

      cy.createCall({
        ...newCall,
        title: createdCallTitle,
        endCall: tomorrow,
        proposalWorkflowId: createdWorkflowId,
      }).then((response) => {
        if (response.createCall.call) {
          createdCallId = response.createCall.call.id;
        }

        cy.contains('New Proposal').click();

        cy.contains(createdCallTitle);

        cy.updateCall({
          id: createdCallId,
          ...newCall,
          endCall: yesterday,
          proposalWorkflowId: createdWorkflowId,
        });

        cy.reload();

        cy.contains(createdCallTitle).should('not.exist');
      });
    });
  });

  describe('Proposal advanced tests', () => {
    beforeEach(() => {
      cy.getAndStoreFeaturesEnabled();
      cy.resetDB(true);
    });

    it('User officer should reopen proposal', () => {
      cy.login('user1');
      cy.visit('/');
      cy.get('[aria-label="View proposal"]').click();
      cy.get('[role="tablist"]').contains('Proposal').click();
      cy.get('[data-cy=button-submit-proposal]').should('be.disabled');

      cy.login('officer');
      cy.visit('/');

      cy.get('[index="0"] input').check();
      cy.get('[data-cy="change-proposal-status"]').click();
      cy.get('#selectedStatusId-input').click();
      cy.get('[role="listbox"]').contains('EDITABLE_SUBMITTED').click();
      cy.get('[data-cy="submit-proposal-status-change"] ').click();

      cy.login('user1');
      cy.visit('/');
      cy.get('[aria-label="Edit proposal"]').click();
      cy.get('[role="tablist"]').contains('Proposal').click();
      cy.get('[data-cy=save-and-continue-button]').should('not.be.disabled');

      cy.get('[data-cy=questionary-stepper]').contains('Review').click();

      cy.get('[data-cy=button-submit-proposal]').should('be.disabled');
    });
  });

  describe('Proposal internal  basic tests', () => {
    beforeEach(() => {
      cy.getAndStoreFeaturesEnabled();
      cy.resetDB();
      cy.createTemplate({
        name: 'default esi template',
        groupId: TemplateGroupId.PROPOSAL_ESI,
      });

      cy.createProposalWorkflow({
        name: proposalInternalWorkflow.name,
        description: proposalInternalWorkflow.description,
      }).then((result) => {
        if (result.createProposalWorkflow.proposalWorkflow) {
          createdWorkflowId = result.createProposalWorkflow.proposalWorkflow.id;
          cy.updateCall({
            id: initialDBData.call.id,
            ...newCall,
            endCall: yesterday,
            endCallInternal: faker.date.future(),
            proposalWorkflowId:
              result.createProposalWorkflow.proposalWorkflow.id,
          });
        }
      });
    });

    it('Internal user should be able to create and clone  and delete an internal  proposal', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.login('user1');
      cy.visit('/');
      cy.contains('New Proposal').click();

      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );

      cy.get('[data-cy=edit-proposer-button]').click();

      cy.finishedLoading();

      cy.get('[data-cy=email]').type('ben@inbox.com');

      cy.get('[data-cy=findUser]').click();

      cy.contains('Benjamin')
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Title is required');
      cy.contains('Abstract is required');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

      cy.get('[data-cy=edit-proposer-button]').click();
      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal')
        .contains(proposer.firstName)
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');

      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('exist')
        .click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');

      cy.get('[aria-label="View proposal"]').should('exist');

      cy.visit('/');
      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.createCall({
        ...newCall,
        proposalWorkflowId: createdWorkflowId,
      });

      cy.contains(title);
      cy.contains('submitted');

      cy.get('[aria-label="View proposal"]').should('exist');

      cy.get('[aria-label="Clone proposal"]').first().click();

      cy.get('[data-cy="call-selection"]').click();
      cy.get('[data-cy="call-selection-options"]')
        .contains(newCall.shortCode)
        .click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal cloned successfully',
      });

      cy.contains(clonedProposalInternalTitle)
        .parent()
        .should('contain.text', newCall.shortCode);

      cy.visit('/');
      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.contains(clonedProposalInternalTitle).parent().contains('draft');
      cy.contains(clonedProposalInternalTitle)
        .parent()
        .find('[aria-label="Delete proposal"]')
        .click();

      cy.contains('OK').click();

      cy.contains(clonedProposalInternalTitle).should('not.exist');
    });

    it('User should not be able to create and submit proposal with inactive internal call', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.login('user1');
      cy.visit('/');
      createTopicAndQuestionToExistingTemplate();
      cy.login('user1');
      cy.visit('/');
      cy.contains('New Proposal').click();

      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );

      cy.get('[data-cy=edit-proposer-button]').click();

      cy.finishedLoading();

      cy.get('[data-cy=email]').type('ben@inbox.com');

      cy.get('[data-cy=findUser]').click();

      cy.contains('Benjamin')
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Title is required');
      cy.contains('Abstract is required');

      cy.contains('New Proposal').click();

      cy.get('[data-cy=title] input')
        .type(newProposalTitle)
        .should('have.value', newProposalTitle);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

      cy.get('[data-cy=edit-proposer-button]').click();
      cy.get('[role="presentation"]').as('modal');

      cy.get('@modal')
        .contains(proposer.firstName)
        .parent()
        .find("[aria-label='Select user']")
        .click();

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.visit('/');
      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.contains(newProposalTitle).parent().contains('draft');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('label', textQuestion).then(($elem) => {
        cy.get(`#${$elem.attr('for')}`).type(faker.random.word());
      });
      cy.contains('Save and continue').click();
      cy.notification({ text: 'Saved', variant: 'success' });

      cy.updateCall({
        id: initialDBData.call.id,
        ...newCall,
        startCall: twoDaysAgo,
        endCall: yesterday,
        endCallInternal: yesterday,
        proposalWorkflowId: createdWorkflowId,
      });

      cy.visit('/');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains('Submit').should('be.disabled');

      cy.get('[data-cy="user-menu-items"]')
        .find('[aria-label="New Proposal"]')
        .should('have.css', 'pointer-events', 'none');
    });

    it('User cannot select inactive internal call for new proposal', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.login('user1');
      cy.visit('/');
      let createdCallId: number;
      const createdCallTitle = 'Created call';

      cy.createCall({
        ...newCall,
        title: createdCallTitle,
        endCall: yesterday,
        endCallInternal: tomorrow,
        proposalWorkflowId: createdWorkflowId,
      }).then((response) => {
        if (response.createCall.call) {
          createdCallId = response.createCall.call.id;
        }

        cy.contains('New Proposal').click();

        cy.contains(createdCallTitle);

        cy.updateCall({
          id: createdCallId,
          ...newCall,
          endCallInternal: yesterday,
          proposalWorkflowId: createdWorkflowId,
        });

        cy.reload();

        cy.contains(createdCallTitle).should('not.exist');
      });
    });
  });
});
