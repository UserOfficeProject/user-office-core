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
import { updatedCall } from '../support/utils';

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
  const instrument1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: initialDBData.users.user1.id,
  };

  const proposalInternalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  let createdWorkflowId: number;
  let createdProposalPk: number;
  let createdProposalId: string;
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
    startFapReview: currentDayStart,
    endFapReview: currentDayStart,
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
      if (topicResult.createTopic) {
        const topicId =
          topicResult.createTopic.steps[
            topicResult.createTopic.steps.length - 1
          ].topic.id;
        cy.createQuestion({
          categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
          dataType: DataType.TEXT_INPUT,
        }).then((result) => {
          if (result.createQuestion) {
            cy.updateQuestion({
              id: result.createQuestion.id,
              question: textQuestion,
            });

            cy.createQuestionTemplateRelation({
              templateId: initialDBData.template.id,
              sortOrder: 0,
              topicId: topicId,
              questionId: result.createQuestion.id,
            });
          }
        });
      }
    });
  };

  describe('Proposal basic tests', () => {
    beforeEach(() => {
      // NOTE: Stop the web application and clearly separate the end-to-end tests by visiting the blank about page after each test.
      // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
      cy.window().then((win) => {
        win.location.href = 'about:blank';
      });

      cy.resetDB();
      cy.getAndStoreFeaturesEnabled();
      cy.createTemplate({
        name: 'default esi template',
        groupId: TemplateGroupId.PROPOSAL_ESI,
      });
      cy.createProposalWorkflow({
        name: proposalWorkflow.name,
        description: proposalWorkflow.description,
      }).then((result) => {
        if (result.createProposalWorkflow) {
          createdWorkflowId = result.createProposalWorkflow.id;
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
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

    it('Principal investigator in the proposal table should not be empty', () => {
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.contains('td', newProposalTitle)
        .parents('tbody tr')
        .first()
        .find('td')
        .eq(4)
        .should('not.contain.text', '-')
        .should('contain.text', 'Carl');
    });

    it('Should be able create proposal', () => {
      cy.login('user1', initialDBData.roles.user);

      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

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

      cy.get('[data-cy=title]').type(' ');
      cy.get('[data-cy=abstract]').type(' ');

      cy.contains('Save and continue').click();

      cy.contains('Title is required');
      cy.contains('Abstract is required');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

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

    it('Officer should be able to navigate to proposal using proposal ID', () => {
      cy.login('officer');

      cy.visit('/', {
        qs: {
          proposalid: createdProposalId,
        },
      });
      cy.url().should('contain', `proposalid=${createdProposalId}`);

      cy.contains(newProposalTitle);

      cy.closeModal();

      cy.url().should('not.contain', `proposalid=${createdProposalId}`);
    });

    it('User officer should be able to save proposal column selection', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FAP_REVIEW)) {
        this.skip();
      }
      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals').click();

      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper')
        .contains('Call')
        .parent()
        .find('input')
        .uncheck();
      cy.get('.MuiPopover-paper')
        .contains('Fap')
        .parent()
        .find('input')
        .uncheck();

      cy.get('body').click();

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('Proposals').click();

      cy.get('[data-cy="officer-proposals-table"] table').should(
        'not.contain',
        'Call'
      );
      cy.get('[data-cy="officer-proposals-table"] table').should(
        'not.contain',
        'Fap'
      );

      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper')
        .contains('Call')
        .parent()
        .find('input')
        .check();
      cy.get('.MuiPopover-paper')
        .contains('Fap')
        .parent()
        .find('input')
        .check();

      cy.reload();

      cy.get('[data-cy="officer-proposals-table"] table').should(
        'contain',
        'Call'
      );
      cy.get('[data-cy="officer-proposals-table"] table').should(
        'contain',
        'Fap'
      );
    });

    it('User officer should be able to select all prefetched proposals in the table', function () {
      const NUMBER_OF_PROPOSALS = 11;
      const DEFAULT_ROWS_PER_PAGE = 10;

      for (let index = 0; index < NUMBER_OF_PROPOSALS; index++) {
        cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
          if (result.createProposal) {
            cy.updateProposal({
              proposalPk: result.createProposal.primaryKey,
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

      const allocationTime = '10';
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: result.createInstrument.id }],
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [result.createInstrument.id],
            proposalPks: [createdProposalPk],
          });
        }
      });
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

      cy.get('[data-cy="timeAllocation"] input').clear().type(allocationTime);

      cy.get('[data-cy="technical-review-status"]').click();
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Feasible')
        .click();

      cy.get('[data-cy="save-technical-review"]').click();

      cy.closeModal();

      cy.contains(newProposalTitle)
        .parent()
        .contains(`${allocationTime} (${AllocationTimeUnits.DAY}s)`);

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.get('[aria-label="Edit"]').first().click();

      cy.get('[data-cy="call-workflow"]').click();
      cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

      cy.get('[data-cy="allocation-time-unit"]').click();
      cy.contains(AllocationTimeUnits.HOUR).click();

      if (featureFlags.getEnabledFeatures().get(FeatureId.RISK_ASSESSMENT)) {
        cy.get('[data-cy="call-esi-template"]').click();
        cy.get('[role="listbox"] li').first().click();
      }

      cy.get('[data-cy="next-step"]').click();
      cy.get('[data-cy="next-step"]').click();
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Proposals').click();
      cy.contains(newProposalTitle)
        .parent()
        .contains(`${allocationTime} (${AllocationTimeUnits.HOUR}s)`);
    });

    it('Should be able clone proposal to another call', () => {
      cy.createCall({
        ...newCall,
        proposalWorkflowId: createdWorkflowId,
      });
      cy.submitProposal({ proposalPk: createdProposalPk });

      cy.login('user1', initialDBData.roles.user);
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

      cy.get('[role="listbox"]')
        .contains(initialDBData.proposalStatuses.fapMeeting.name)
        .click();

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.contains(newProposalTitle)
        .parent()
        .should('contain.text', initialDBData.proposalStatuses.fapMeeting.name);
      cy.contains(clonedProposalTitle)
        .parent()
        .should('contain.text', initialDBData.proposalStatuses.fapMeeting.name);
    });

    it('User officer should be able to see proposal status when opening change status modal', () => {
      cy.cloneProposals({
        callId: initialDBData.call.id,
        proposalsToClonePk: [createdProposalPk],
      });
      cy.changeProposalsStatus({
        statusId: initialDBData.proposalStatuses.fapMeeting.id,
        proposalPks: [createdProposalPk],
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

      cy.contains(initialDBData.proposalStatuses.fapMeeting.name)
        .parent()
        .find('[type="checkbox"]')
        .check();
      cy.get('[data-cy="change-proposal-status"]').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-selection"] input').should(
        'have.value',
        `${initialDBData.proposalStatuses.fapMeeting.name}`
      );

      // Close the modal
      cy.get('body').trigger('keydown', { keyCode: 27 });

      cy.changeProposalsStatus({
        statusId: initialDBData.proposalStatuses.fapReview.id,
        proposalPks: [createdProposalPk],
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
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(newProposalTitle)
        .parent()
        .find('[aria-label="Delete proposal"]')
        .click();

      cy.contains('OK').click();

      cy.contains(newProposalTitle).should('not.exist');
    });

    it('Proposals with long title should fit in one line rows', () => {
      const longProposalTitle = faker.lorem.paragraph(2);
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            title: longProposalTitle,
            abstract: newProposalAbstract,
            proposerId: proposer.id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains(longProposalTitle).should(
        'have.attr',
        'title',
        longProposalTitle
      );

      cy.contains(longProposalTitle).invoke('outerWidth').should('be.gt', 400);
      cy.contains(longProposalTitle)
        .parent()
        .invoke('outerWidth')
        .should('be.gte', 400)
        .should('be.lt', 410);

      cy.contains(longProposalTitle)
        .parent()
        .should('have.css', 'text-overflow', 'ellipsis')
        .and('have.css', 'white-space', 'nowrap');
    });

    it('User should not be able to create and submit proposal on a call that is ended', () => {
      createTopicAndQuestionToExistingTemplate();
      cy.login('user1', initialDBData.roles.user);
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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.createCall({
        ...newCall,
        title: createdCallTitle,
        endCall: tomorrow,
        proposalWorkflowId: createdWorkflowId,
      }).then((response) => {
        if (response.createCall) {
          createdCallId = response.createCall.id;
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

    it('During Proposal creation, User should not lose data when refreshing the page', () => {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.finishedLoading();

      cy.get('[data-cy=title]').type(title);
      cy.get('[data-cy=abstract]').type(abstract);

      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.url().should('contains', '/ProposalEdit');

      cy.reload();

      cy.finishedLoading();

      cy.contains('Back').click();

      cy.get('[data-cy=title] input').should('have.value', title);
      cy.get('[data-cy=abstract] textarea').should('have.value', abstract);

      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');

      cy.get('[aria-label="View proposal"]').should('exist');
    });
  });

  describe('Proposal advanced tests', () => {
    beforeEach(() => {
      // NOTE: Stop the web application and clearly faparate the end-to-end tests by visiting the blank about page after each test.
      // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
      cy.window().then((win) => {
        win.location.href = 'about:blank';
      });

      cy.resetDB(true);
      cy.getAndStoreFeaturesEnabled();
    });

    it('Should be able to redeem proposal invite user information', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }
      cy.login('user2');
      cy.visit('/');
      cy.finishedLoading();
      cy.get('[data-cy="proposal-table"]').should(
        'not.contain.text',
        initialDBData.proposal.shortCode
      );
      cy.get('[data-cy="join-proposal-btn"]').click();
      cy.get('#code').clear();
      cy.get('#code').type(initialDBData.redeemCodes.validRedeemCode.code);
      cy.get('[data-cy="invitation-submit"]').click();
      cy.get('[data-cy="proposal-table"]').should(
        'contain.text',
        initialDBData.proposal.shortCode
      );
    });

    it('User officer should reopen proposal', () => {
      cy.login('user1', initialDBData.roles.user);
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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.get('[aria-label="Edit proposal"]').click();
      cy.get('[role="tablist"]').contains('Proposal').click();
      cy.get('[data-cy=save-and-continue-button]').should('not.be.disabled');

      cy.get('[data-cy=questionary-stepper]').contains('Review').click();

      cy.get('[data-cy=button-submit-proposal]').should('be.disabled');
    });
  });

  describe('Proposal internal and external basic tests', () => {
    beforeEach(() => {
      // NOTE: Stop the web application and clearly faparate the end-to-end tests by visiting the blank about page after each test.
      // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
      cy.window().then((win) => {
        win.location.href = 'about:blank';
      });

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
        if (result.createProposalWorkflow) {
          createdWorkflowId = result.createProposalWorkflow.id;
        }
      });
    });

    it('Internal user should be able to create proposal with active internal call', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.updateCall({
        id: initialDBData.call.id,
        ...updatedCall,
        endCall: yesterday,
        endCallInternal: faker.date.future(),
        proposalWorkflowId: createdWorkflowId,
      });
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

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
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

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
    });

    it('Internal user should be able to clone proposal to an active internal calls', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.createProposal({ callId: initialDBData.call.id })
        .then((result) => {
          const createdProposal = result.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: title,
              abstract: abstract,
              proposerId: initialDBData.users.user1.id,
            });
          }
        })
        .then(() => {
          cy.updateCall({
            id: initialDBData.call.id,
            ...updatedCall,
            endCall: yesterday,
            endCallInternal: faker.date.future(),
            proposalWorkflowId: createdWorkflowId,
          });
          cy.createCall({
            ...newCall,
            endCall: yesterday,
            endCallInternal: faker.date.future(),
            proposalWorkflowId: createdWorkflowId,
          });
        });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');

      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('exist')
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');

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
    });

    it('Internal user should be able to delete draft proposal with active internal call', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.createProposal({ callId: initialDBData.call.id })
        .then((result) => {
          const createdProposal = result.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: title,
              abstract: abstract,
              proposerId: initialDBData.users.user1.id,
            });
          }
        })
        .then(() => {
          cy.updateCall({
            id: initialDBData.call.id,
            ...updatedCall,
            endCall: yesterday,
            endCallInternal: faker.date.future(),
            proposalWorkflowId: createdWorkflowId,
          });
          cy.createCall({
            ...newCall,
            endCall: yesterday,
            endCallInternal: faker.date.future(),
            proposalWorkflowId: createdWorkflowId,
          });
        });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');
      cy.contains(title)
        .parent()
        .find('[aria-label="Delete proposal"]')
        .click();

      cy.contains('OK').click();

      cy.contains(title).should('not.exist');
    });

    it('User should not be able to edit proposal with inactive internal call', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.createProposal({ callId: initialDBData.call.id })
        .then((result) => {
          const createdProposal = result.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: title,
              abstract: abstract,
              proposerId: initialDBData.users.user1.id,
            });
          }
        })
        .then(() => {
          cy.updateCall({
            id: initialDBData.call.id,
            ...newCall,
            startCall: twoDaysAgo,
            endCall: yesterday,
            endCallInternal: yesterday,
            proposalWorkflowId: createdWorkflowId,
          });
        });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');

      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('not.exist');

      cy.contains(title)
        .parent()
        .find('[aria-label="View proposal"]')
        .should('exist');
    });

    it('User cannot select inactive internal call for new proposal', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      let createdCallId: number;
      const createdCallTitle = faker.random.alphaNumeric(15);

      cy.createCall({
        ...newCall,
        shortCode: createdCallTitle,
        endCall: yesterday,
        endCallInternal: tomorrow,
        proposalWorkflowId: createdWorkflowId,
      }).then((response) => {
        if (response.createCall) {
          createdCallId = response.createCall.id;
        }

        cy.contains('New Proposal').click();

        cy.get('[data-cy=call-list]').should('contain', createdCallTitle);

        cy.updateCall({
          id: createdCallId,
          ...newCall,
          endCall: yesterday,
          endCallInternal: yesterday,
          proposalWorkflowId: createdWorkflowId,
        });

        cy.reload();

        cy.finishedLoading();

        cy.get('[data-cy=call-list]').should('not.contain', createdCallTitle);
      });
    });

    it('External user should not be able to select an active internal call for a new proposal', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      let createdCallId: number;
      const createdCallTitle = faker.random.alphaNumeric(15);
      cy.createCall({
        ...newCall,
        shortCode: createdCallTitle,
        proposalWorkflowId: createdWorkflowId,
      }).then((response) => {
        if (response.createCall) {
          createdCallId = response.createCall.id;
        }
        cy.login('placeholderUser', initialDBData.roles.user);
        cy.visit('/');

        cy.contains('New Proposal').click();

        cy.finishedLoading();

        cy.get('[data-cy=call-list]').should('contain', createdCallTitle);

        cy.updateCall({
          id: createdCallId,
          ...updatedCall,
          endCall: yesterday,
          endCallInternal: tomorrow,
          proposalWorkflowId: createdWorkflowId,
        });

        cy.reload();

        cy.finishedLoading();
        cy.get('[data-cy=call-list]').should(
          'not.contain',
          updatedCall.shortCode
        );
      });
    });

    it('External user should not be able to submit draft proposal with active internal call', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.createProposal({ callId: initialDBData.call.id })
        .then((result) => {
          if (result.createProposal) {
            createdProposalPk = result.createProposal.primaryKey;

            cy.updateProposal({
              proposalPk: result.createProposal.primaryKey,
              title: title,
              abstract: abstract,
              proposerId: initialDBData.users.placeholderUser.id,
            });
          }
        })
        .then(() => {
          cy.updateCall({
            id: initialDBData.call.id,
            ...newCall,
            startCall: twoDaysAgo,
            endCall: yesterday,
            endCallInternal: tomorrow,
            proposalWorkflowId: createdWorkflowId,
          });
        });

      cy.login('placeholderUser', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('Dashboard').click();

      cy.contains(title).parent().contains('draft');

      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('not.exist');

      cy.contains(title)
        .parent()
        .find('[aria-label="View proposal"]')
        .should('exist');
    });
  });

  describe('Automatic Instrument assignment', () => {
    const instrumentPickerQuestion = 'Select your Instrument';
    const instrument = {
      name: 'Instrument 1',
      shortCode: 'Instrument 1',
      description: 'Instrument 1',
      managerUserId: initialDBData.users.user1.id,
    };
    const instrument2 = {
      name: 'Instrument 2',
      shortCode: 'Instrument 2',
      description: 'Instrument 2',
      managerUserId: initialDBData.users.user1.id,
    };
    let topicId: number;
    let instrumentPickerQuestionId: string;

    beforeEach(() => {
      // NOTE: Stop the web application and clearly faparate the end-to-end tests by visiting the blank about page after each test.
      // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
      cy.window().then((win) => {
        win.location.href = 'about:blank';
      });
      cy.resetDB();
      cy.getAndStoreFeaturesEnabled();
      cy.createTemplate({
        name: 'Proposal Template with Instrument Picker',
        groupId: TemplateGroupId.PROPOSAL_ESI,
      });
      cy.createProposalWorkflow({
        name: proposalWorkflow.name,
        description: proposalWorkflow.description,
      }).then((result) => {
        if (result.createProposalWorkflow) {
          createdWorkflowId = result.createProposalWorkflow.id;
        }
      });
      cy.createInstrument(instrument).then((result) => {
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: result.createInstrument.id }],
        });
      });
      cy.createInstrument(instrument2).then((result) => {
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: result.createInstrument.id }],
        });
      });
      cy.createTopic({
        templateId: initialDBData.template.id,
        sortOrder: 1,
      }).then((topicResult) => {
        if (topicResult.createTopic) {
          topicId =
            topicResult.createTopic.steps[
              topicResult.createTopic.steps.length - 1
            ].topic.id;
          cy.createQuestion({
            categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
            dataType: DataType.INSTRUMENT_PICKER,
          }).then((result) => {
            instrumentPickerQuestionId = result.createQuestion.id;
            cy.updateQuestion({
              id: result.createQuestion.id,
              question: instrumentPickerQuestion,
              config: `{"variant":"dropdown","isMultipleSelect":false,"required":true}`,
            });
            cy.createQuestionTemplateRelation({
              questionId: instrumentPickerQuestionId,
              templateId: initialDBData.template.id,
              sortOrder: 0,
              topicId: topicId,
            });
          });
        }
      });
    });
    it('Instrument should be automatically assigned to the proposal', () => {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );
      cy.finishedLoading();
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.get('[role="button"]').first().click();
      cy.get('[role="option"]').contains('Instrument 1').click();
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
      cy.login('officer');
      cy.visit('/');
      cy.contains('Proposals').click();
      cy.contains(title).parent().contains(instrument.name);
      cy.contains(title).parent().find('[aria-label="View proposal"]').click();
      cy.contains('td', instrument.name).should('exist');
    });

    it('Multiple instruments should be automatically assigned to the proposal', () => {
      cy.updateQuestionTemplateRelationSettings({
        questionId: instrumentPickerQuestionId,
        templateId: initialDBData.template.id,
        config: `{"variant":"dropdown","isMultipleSelect":true,"required":true}`,
        dependencies: [],
      });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );
      cy.finishedLoading();
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.get('[role="button"]').first().click();
      cy.get('[role="option"]').contains('Instrument 1').click();
      cy.get('[role="option"]').contains('Instrument 2').click();
      cy.get('body').type('{esc}');
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
      cy.login('officer');
      cy.visit('/');
      cy.contains('Proposals').click();
      cy.contains(title).parent().contains(instrument.name);
      cy.contains(title).parent().contains(instrument2.name);
      cy.contains(title).parent().find('[aria-label="View proposal"]').click();
      cy.contains('td', instrument.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
    });
  });
});
