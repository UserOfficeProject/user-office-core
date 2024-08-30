import { faker } from '@faker-js/faker';
import {
  ProposalEndStatus,
  ReviewStatus,
  TechnicalReviewStatus,
  UserRole,
  UpdateUserMutationVariables,
  TemplateGroupId,
  FeatureId,
  UserJwt,
  SettingsId,
  Event,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import settings from '../support/settings';
import { updatedCall, closedCall } from '../support/utils';

faker.seed(1);

const fapMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user3,
  reviewer: initialDBData.users.reviewer,
  reviewer2: initialDBData.users.user3,
};

function clickConfirmOk() {
  if (
    featureFlags
      .getEnabledFeatures()
      .get(FeatureId.CONFLICT_OF_INTEREST_WARNING)
  ) {
    cy.get('[data-cy="confirm-ok"]').click();
  }
}

function readWriteReview(
  { shouldSubmit, isReviewer } = { shouldSubmit: false, isReviewer: false }
) {
  cy.get('[role="dialog"]').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information', { matchCase: false });
  cy.get('@dialog').contains('Technical review');
  cy.get('@dialog').contains('Grade');

  cy.contains('New fap review').click();

  const commentContent = faker.lorem.words(3);

  cy.setTinyMceContent('comment', commentContent);

  cy.getTinyMceContent('comment').then((content) =>
    expect(content).to.have.string(commentContent)
  );

  if (settings.getEnabledSettings().get(SettingsId.GRADE_PRECISION) === '1') {
    cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

    cy.get('[role="listbox"] > [role="option"]').first().click();

    cy.get('[data-cy="grade-proposal"] input').should('have.value', '1');
  } else {
    cy.get('@dialog').get('[data-cy="grade-proposal"]').click().type('1');
  }

  cy.get(`#comment_ifr`).first().focus().click();

  if (shouldSubmit) {
    if (isReviewer) {
      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.contains('Submit').click();
      cy.contains('OK').click();
    } else {
      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.get('[data-cy="is-grade-submitted"]').click();
    }
  }

  if (!isReviewer) {
    cy.get('[data-cy=save-button]').focus().click();
    cy.notification({ variant: 'success', text: 'Saved' });
  }

  cy.closeModal();

  cy.get('@dialog').should('not.exist');
}

function editFinalRankingForm() {
  cy.get('[role="dialog"] > header + div').scrollTo('top');

  cy.setTinyMceContent('commentForUser', faker.lorem.words(3));
  cy.setTinyMceContent('commentForManagement', faker.lorem.words(3));

  cy.contains('External reviews').parent().find('table').as('reviewsTable');

  cy.get('@reviewsTable').contains(fapMembers.reviewer.lastName);

  cy.get('[data-cy="save"]').click();

  cy.notification({
    variant: 'success',
    text: 'successfully',
  });
}

function updateUsersRoles() {
  if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
    cy.updateUserRoles({
      id: fapMembers.chair.id,
      roles: [initialDBData.roles.fapReviewer],
    });
    cy.updateUserRoles({
      id: fapMembers.secretary.id,
      roles: [initialDBData.roles.fapReviewer],
    });
    cy.updateUserRoles({
      id: fapMembers.reviewer.id,
      roles: [initialDBData.roles.fapReviewer],
    });
    cy.updateUserRoles({
      id: fapMembers.reviewer2.id,
      roles: [initialDBData.roles.fapReviewer],
    });
  }
}

const instrumentAvailabilityTime = 20;
const instrumentNewAvailabilityTime = 50;
const firstProposalTimeAllocation = 25;
const secondProposalTimeAllocation = 5;
const secondProposalNewTimeAllocation = 25;

const fap1 = {
  code: faker.lorem.word(10),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

const fap2 = {
  code: faker.lorem.words(1),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

const proposal1 = {
  title: faker.random.words(3),
  abstract: faker.random.words(5),
};

const proposal2 = {
  title: faker.random.words(3),
  abstract: faker.random.words(5),
};

const scientist = initialDBData.users.user1;

const instrument = {
  name: faker.random.words(2),
  shortCode: faker.random.alphaNumeric(15),
  description: faker.random.words(8),
  managerUserId: scientist.id,
};

const scientist1 = initialDBData.users.user1;
const instrument1 = {
  name: faker.random.words(2),
  shortCode: faker.random.alphaNumeric(15),
  description: faker.random.words(5),
  managerUserId: scientist1.id,
};
const instrument2 = {
  name: faker.random.words(2),
  shortCode: faker.random.alphaNumeric(15),
  description: faker.random.words(5),
  managerUserId: scientist1.id,
};

let createdFapId: number;
let createdCallId: number;
let firstCreatedProposalPk: number;
let firstCreatedProposalId: string;
let secondCreatedProposalPk: number;
let createdWorkflowId: number;
let createdEsiTemplateId: number;
let newlyCreatedInstrumentId: number;

function createWorkflowAndEsiTemplate() {
  const workflowName = faker.lorem.words(2);
  const workflowDescription = faker.lorem.words(5);

  cy.createProposalWorkflow({
    name: workflowName,
    description: workflowDescription,
  }).then((result) => {
    const workflow = result.createProposalWorkflow;
    if (workflow) {
      createdWorkflowId = workflow.id;
      if (
        settings
          .getEnabledSettings()
          .get(SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS) !==
        'FEASIBILITY'
      ) {
        cy.addProposalWorkflowStatus({
          droppableGroupId: 'proposalWorkflowConnections_0',
          proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
          proposalWorkflowId: createdWorkflowId,
          sortOrder: 1,
          prevProposalStatusId: 1,
        });
      }

      cy.createTemplate({
        name: 'default esi template',
        groupId: TemplateGroupId.PROPOSAL_ESI,
      }).then((result) => {
        if (result.createTemplate) {
          createdEsiTemplateId = result.createTemplate.templateId;
        }
      });
    }
  });
}

function initializationBeforeTests() {
  createWorkflowAndEsiTemplate();
  cy.then(() => {
    cy.createInstrument(instrument).then((result) => {
      const createdInstrument = result.createInstrument;
      if (createdInstrument) {
        newlyCreatedInstrumentId = createdInstrument.id;
      }
    });

    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      const createdProposal = result.createProposal;
      cy.wrap(createdProposal.proposalId).as('proposal1Id');
      if (createdProposal) {
        firstCreatedProposalPk = createdProposal.primaryKey;
        firstCreatedProposalId = createdProposal.proposalId;

        cy.updateProposal({
          proposalPk: createdProposal.primaryKey,
          title: proposal1.title,
          abstract: proposal1.abstract,
          proposerId: initialDBData.users.user1.id,
        });

        cy.submitProposal({ proposalPk: createdProposal.primaryKey });

        // Manually changing the proposal status to be shown in the Faps. -------->
        cy.changeProposalsStatus({
          statusId: initialDBData.proposalStatuses.fapReview.id,
          proposalPks: [firstCreatedProposalPk],
        });

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: { instrumentId: newlyCreatedInstrumentId },
        });

        cy.assignProposalsToInstruments({
          instrumentIds: [newlyCreatedInstrumentId],
          proposalPks: [firstCreatedProposalPk],
        });
      }
    });
    cy.createFap({
      code: fap1.code,
      description: fap1.description,
      numberRatingsRequired: 2,
      gradeGuide: fap1.gradeGuide,
      active: true,
    }).then((result) => {
      if (result.createFap) {
        createdFapId = result.createFap.id;

        cy.createCall({
          ...updatedCall,
          esiTemplateId: createdEsiTemplateId,
          proposalWorkflowId: createdWorkflowId,
          faps: [createdFapId],
        }).then((result) => {
          createdCallId = result.createCall.id;

          cy.assignInstrumentToCall({
            callId: createdCallId,
            instrumentFapIds: { instrumentId: newlyCreatedInstrumentId },
          });

          cy.createProposal({ callId: createdCallId }).then((result) => {
            const createdProposal = result.createProposal;
            if (createdProposal) {
              secondCreatedProposalPk = createdProposal.primaryKey;

              cy.updateProposal({
                proposalPk: createdProposal.primaryKey,
                title: proposal2.title,
                abstract: proposal2.abstract,
                proposerId: initialDBData.users.user1.id,
              });

              // Manually changing the proposal status to be shown in the Faps. -------->
              cy.changeProposalsStatus({
                statusId: initialDBData.proposalStatuses.fapReview.id,
                proposalPks: [secondCreatedProposalPk],
              });

              cy.assignProposalsToInstruments({
                instrumentIds: [newlyCreatedInstrumentId],
                proposalPks: [secondCreatedProposalPk],
              });
            }
          });

          cy.updateCall({
            id: createdCallId,
            ...closedCall,
            proposalWorkflowId: createdWorkflowId,
            esiTemplateId: createdEsiTemplateId,
            faps: [createdFapId],
          });
        });
      }
    });
  });
}

context('Fap reviews tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FAP_REVIEW)) {
        this.skip();
      }
      updateUsersRoles();
    });
    initializationBeforeTests();
    cy.getAndStoreAppSettings();
  });

  describe('User officer role', () => {
    it('Copy to clipboard should work for Code in Faps page', () => {
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(firstCreatedProposalId).realClick();

      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          cy.get('[role="alert"]').should('contain', text);
        });
      });
    });

    it('Officer should be able to assign proposal to existing Fap', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.get('[data-cy="fap-assignments-table"]').should(
        'not.contain.text',
        proposal1.title
      );

      cy.contains('Proposals').click();

      cy.contains(proposal1.title).parent().find('[type="checkbox"]').check();

      cy.get("[aria-label='Assign proposals to Fap']").first().click();

      cy.get('[data-cy="fap-selection"] input').should(
        'not.have.class',
        'Mui-disabled'
      );
      cy.get('[data-cy="fap-selection"]').contains(instrument.name);
      cy.get('[data-cy="fap-selection"]').click();
      cy.get('[role="listbox"] li[role="option"]').contains(fap1.code).click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        text: 'Proposal/s assigned to the selected Fap successfully',
        variant: 'success',
      });

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[data-cy="fap-assignments-table"]').should(
        'contain.text',
        proposal1.title
      );
    });

    it('Officer should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.title);
      cy.get('[role="dialog"]').contains('Download PDF');

      cy.closeModal();
    });

    it('Proposal should contain standard deviation field inside proposals and assignments', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[data-cy="fap-assignments-table"] thead').contains('Deviation');
    });

    it('Officer should be able to assign Fap member to proposal in existing Fap', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(fapMembers.reviewer.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'success',
        text: 'Member assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.contains(fapMembers.reviewer.lastName);

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="rank-reviewer"]')
        .click();

      cy.get('[data-cy="rank-input"]').type('4564654');

      cy.get('[data-cy="rank-submit"]').click();

      cy.contains(fapMembers.reviewer.lastName).parent().contains('4564654');

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains(Event.FAP_MEMBER_ASSIGNED_TO_PROPOSAL);
    });

    it('Should be able to assign Fap members to proposals in existing Fap', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk, secondCreatedProposalPk],
      });

      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id, fapMembers.reviewer2.id],
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').find('input[type="checkbox"]').first().click();
      cy.contains('2 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.contains(fapMembers.reviewer.lastName);
      cy.contains(fapMembers.reviewer2.lastName);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains(Event.FAP_MEMBER_ASSIGNED_TO_PROPOSAL);
    });

    it('Duplicate Fap review assignment should not happen', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });

      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(fapMembers.reviewer.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'error',
        text: 'The FAP member is already assigned to the selected proposal',
      });
    });

    it('Duplicate Fap review assignments should not happen', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk, secondCreatedProposalPk],
      });

      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });

      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer2.id],
      });

      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer2.id,
          proposalPk: secondCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').find('input[type="checkbox"]').first().click();
      cy.contains('2 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get('[data-cy="fap-reviewer-assignments-table"]')
        .first()
        .contains(fapMembers.reviewer.lastName)
        .should('have.length', 1);
      cy.get('[data-cy="fap-reviewer-assignments-table"]')
        .first()
        .contains(fapMembers.reviewer2.lastName)
        .should('have.length', 1);

      cy.get('[aria-label="Detail panel visibility toggle"]').eq(1).click();
      cy.get('[data-cy="fap-reviewer-assignments-table"]')
        .eq(1)
        .contains(fapMembers.reviewer.lastName)
        .should('have.length', 1);
      cy.get('[data-cy="fap-reviewer-assignments-table"]')
        .eq(1)
        .contains(fapMembers.reviewer2.lastName)
        .should('have.length', 1);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains(Event.FAP_MEMBER_ASSIGNED_TO_PROPOSAL);
    });

    it('Officer should be able to read/write reviews', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      readWriteReview();
    });

    it('Officer should be able to submit and un-submit reviews', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      readWriteReview({ shouldSubmit: true, isReviewer: false });

      cy.contains(fapMembers.reviewer.lastName).parent().contains('SUBMITTED');
      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="view-proposal-details-icon"]')
        .click();

      cy.get('[role="presentation"] [role="tab"]').contains('Grade').click();

      cy.contains('New fap review').click();
      cy.get('[data-cy="save-and-continue-button"]').focus().click();

      cy.get('[data-cy="is-grade-submitted"]').click();

      cy.get('[data-cy=save-button]').focus().click();
      cy.notification({ variant: 'success', text: 'Saved' });

      cy.closeModal();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[role="tab"]').contains('Members').click();
      cy.get('[role="tab"]')
        .contains('Proposals and assignments', { matchCase: false })
        .click();
      cy.finishedLoading();
      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(fapMembers.reviewer.lastName).parent().contains('DRAFT');
    });

    it('Officer should get error when trying to delete proposal which has dependencies (like reviews)', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });
      cy.on('uncaught:exception', (err) => {
        expect(err.message).to.include(
          'Failed to delete proposal because, it has dependencies which need to be deleted first'
        );

        // return false to prevent the error from
        // failing this test
        return false;
      });
      cy.login('officer');
      cy.visit('/Proposals');

      cy.get('[data-cy="officer-proposals-table"]').should('exist');

      cy.get('[type="checkbox"]').first().check();

      cy.get('[aria-label="Delete proposals"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'error',
        text: 'Failed to delete proposal because, it has dependencies which need to be deleted first',
      });
    });

    it('Should be able to see how many proposals are assigned to a fap', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.login('officer');

      cy.visit(`/Faps`);

      cy.contains(fap1.code).parent().parent().contains('1');

      cy.updateCall({
        id: initialDBData.call.id,
        proposalWorkflowId: createdWorkflowId,
        esiTemplateId: createdEsiTemplateId,
        faps: [createdFapId],
        callFapReviewEnded: true,
      });

      cy.visit(`/Faps`);

      cy.contains(fap1.code).parent().parent().contains('0');
    });

    it('Should be able to see how many proposals are assigned to a reviewer', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.login('officer');

      cy.visit(`/FapPage/${createdFapId}?tab=1`);
      cy.get('[data-cy="fap-reviewers-table"]').contains('1');

      cy.updateCall({
        id: initialDBData.call.id,
        proposalWorkflowId: createdWorkflowId,
        esiTemplateId: createdEsiTemplateId,
        faps: [createdFapId],
        callFapReviewEnded: true,
      });

      cy.visit(`/FapPage/${createdFapId}?tab=1`);
      cy.get('[data-cy="fap-reviewers-table"]').contains('0');
    });

    it('Should be able to see how many proposals are assigned to a chair and secretary', () => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.chair.id,
          roleId: UserRole.FAP_CHAIR,
        },
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.secretary.id,
          roleId: UserRole.FAP_SECRETARY,
        },
      });

      cy.login('officer');

      cy.visit(`/FapPage/${createdFapId}?tab=1`);

      cy.get(`[data-cy="proposal-count-${fapMembers.chair.id}"]`).contains('0');
      cy.get(`[data-cy="proposal-count-${fapMembers.secretary.id}"]`).contains(
        '0'
      );

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(fapMembers.chair.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get('[role="dialog"]')
        .contains(fapMembers.secretary.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.contains('Update').click();

      clickConfirmOk();

      //The count are maintained in frontend so cannot reload the page
      cy.contains('Members').click();

      cy.get(`[data-cy="proposal-count-${fapMembers.chair.id}"]`).contains('1');
      cy.get(`[data-cy="proposal-count-${fapMembers.secretary.id}"]`).contains(
        '1'
      );

      //Now test with reload
      cy.visit(`/FapPage/${createdFapId}?tab=1`);
      cy.get(`[data-cy="proposal-count-${fapMembers.chair.id}"]`).contains('1');
      cy.get(`[data-cy="proposal-count-${fapMembers.secretary.id}"]`).contains(
        '1'
      );
    });
  });

  describe('Fap Chair role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.chair.id,
          roleId: UserRole.FAP_CHAIR,
        },
      });
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });

      cy.login(fapMembers.chair);
      cy.changeActiveRole(initialDBData.roles.fapChair);
    });

    it('Fap Chair should be able to assign Fap member to proposal in existing Fap', () => {
      const loggedInUser = window.localStorage.getItem('user');

      if (!loggedInUser) {
        throw new Error('No logged in user');
      }

      const loggedInUserParsed = JSON.parse(loggedInUser) as UserJwt;

      // NOTE: Change organization before assigning to avoid warning in the FAP reviewers assignment
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserDetails({
          ...loggedInUserParsed,
          institutionId: 1,
          telephone: faker.phone.number('+4670#######'),
          user_title: 'Dr.',
          gender: 'male',
          nationality: 1,
          birthdate: new Date('2000/01/01'),
          department: 'IT',
          position: 'Dirrector',
        } as UpdateUserMutationVariables);
      }
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(fapMembers.chair.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'success',
        text: 'Member assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(fapMembers.chair.lastName);

      cy.get('[role="tablist"] [role="tab"]').contains('Members').click();

      cy.get(`[data-cy="proposal-count-${fapMembers.chair.id}"]`).contains('1');
    });

    it('Fap Chair should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.title);
      cy.get('[role="dialog"]').contains('Download PDF');
    });

    it('Fap Chair should be able to read/write/submit non-submitted reviews', () => {
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.contains('0 / 1').should('be.visible');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('not.exist');
      readWriteReview();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.contains('Submit').click();
      cy.contains('OK').click();
      cy.contains('Submitted').should('be.disabled');

      cy.visit(`/FapPage/${createdFapId}?tab=3`);
      cy.finishedLoading();
      cy.contains('1 / 1').should('be.visible');
    });
  });

  describe('Fap Secretary role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.secretary.id,
          roleId: UserRole.FAP_SECRETARY,
        },
      });
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.login(fapMembers.secretary);
      cy.changeActiveRole(initialDBData.roles.fapSecretary);
    });

    it('Fap Secretary should be able to assign Fap member to proposal in existing Fap', () => {
      const loggedInUser = window.localStorage.getItem('user');

      if (!loggedInUser) {
        throw new Error('No logged in user');
      }

      const loggedInUserParsed = JSON.parse(loggedInUser) as UserJwt;

      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        // NOTE: Change organization before assigning to avoid warning in the FAP reviewers assignment
        cy.updateUserDetails({
          ...loggedInUserParsed,
          institutionId: 1,
          telephone: faker.phone.number('+4670#######'),
          telephone_alt: faker.phone.number('+4670#######'),
          user_title: 'Dr.',
          gender: 'male',
          nationality: 1,
          birthdate: new Date('2000/01/01'),
          department: 'IT',
          position: 'Dirrector',
        } as UpdateUserMutationVariables);
      }

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get('[data-cy="assign-fap-members"]').click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(fapMembers.secretary.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      clickConfirmOk();

      cy.notification({
        variant: 'success',
        text: 'Member assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(fapMembers.secretary.lastName);

      cy.get('[role="tablist"] [role="tab"]').contains('Members').click();

      cy.get(`[data-cy="proposal-count-${fapMembers.secretary.id}"]`).contains(
        '1'
      );
    });

    it('Fap Secretary should be able to read/write non-submitted reviews', () => {
      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('not.exist');
      readWriteReview();

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.contains('Submit').click();
      cy.contains('OK').click();
      cy.contains('Submitted').should('be.disabled');

      cy.finishedLoading();
    });
  });

  describe('Fap Reviewer role', () => {
    beforeEach(() => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });

      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer2.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.assignFapReviewersToProposals({
        assignments: {
          memberId: fapMembers.reviewer.id,
          proposalPk: firstCreatedProposalPk,
        },
        fapId: createdFapId,
      });

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          const createdProposal2Pk = createdProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposal2Pk,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [newlyCreatedInstrumentId],
            proposalPks: [createdProposal2Pk],
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal2Pk],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal2Pk,
            },
            fapId: createdFapId,
          });

          cy.getProposalReviews({
            proposalPk: createdProposal2Pk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              cy.updateReview({
                reviewID: proposalReviews[0].id,
                comment: faker.random.words(5),
                grade: 2,
                status: ReviewStatus.SUBMITTED,
                fapID: createdFapId,
                questionaryID: proposalReviews[0].questionaryID,
              });
            }
          });
        }
      });
      cy.login(fapMembers.reviewer);

      cy.changeActiveRole(initialDBData.roles.fapReviewer);
      cy.visit('/');
    });

    it('Fap Reviewer should be able to filter their reviews by status and bulk submit them', () => {
      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Draft').click();

      cy.finishedLoading();

      cy.contains(proposal1.title);

      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Submitted').click();

      cy.finishedLoading();

      cy.contains(proposal2.title);
      cy.contains(proposal1.title).should('not.exist');

      cy.get('[data-cy="review-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.contains(proposal1.title).parent().contains('Draft');

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();
      cy.contains(proposal2.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="submit-proposal-reviews"]').click();

      cy.contains(
        `Please correct the grade and comment for the proposal(s) with ID: ${firstCreatedProposalId}`
      ).should('exist');

      cy.get('[data-cy="confirm-cancel"]').click();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.setTinyMceContent('comment', faker.lorem.words(3));

      if (
        settings.getEnabledSettings().get(SettingsId.GRADE_PRECISION) === '1'
      ) {
        cy.get('[data-cy="grade-proposal"]').click();
        cy.get('[data-cy="grade-proposal-options"] [role="option"]')
          .first()
          .click();
      } else {
        cy.get('[data-cy="grade-proposal"]').click().click().type('1');
      }

      cy.get(`#comment_ifr`).first().focus().click();

      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.get('[data-cy="button-submit-proposal"]').focus().click();
      cy.contains('OK').click();

      cy.finishedLoading();

      cy.closeModal();

      cy.get('[data-cy="submit-proposal-reviews"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        text: 'Proposals review submitted successfully',
        variant: 'success',
      });
    });

    it('FAP review should be removed if proposal is removed from instrument', () => {
      cy.contains(proposal1.title);

      cy.removeProposalsFromInstrument({
        proposalPks: [firstCreatedProposalPk],
      });

      cy.reload();

      cy.finishedLoading();

      cy.get('table tbody').should('not.contain.text', proposal1.title);
    });

    it('Fap Reviewer should be able to see Faps he is part of', () => {
      cy.get('[data-cy="FapRoles-menu-items"]').contains('FAPs').click();

      cy.finishedLoading();

      cy.get('[data-cy="Faps-table"]')
        .contains(fap1.code)
        .closest('tr')
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[role="tablist"] [role="tab"]').should('have.length', 2);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="fap-reviewer-assignments-table"]').should(
        'not.contain',
        fapMembers.reviewer2.firstName
      );

      cy.contains(fapMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.getProposalReviews({
        proposalPk: firstCreatedProposalPk,
      }).then(({ proposalReviews }) => {
        if (proposalReviews) {
          cy.updateReview({
            reviewID: proposalReviews[0].id,
            comment: faker.random.words(5),
            grade: 5,
            status: ReviewStatus.SUBMITTED,
            fapID: createdFapId,
            questionaryID: proposalReviews[0].questionaryID,
          });
        }
      });

      readWriteReview({ shouldSubmit: true, isReviewer: true });

      cy.finishedLoading();

      cy.contains(fapMembers.reviewer.lastName).parent().contains('SUBMITTED');
      cy.contains(fapMembers.reviewer2.lastName).parent().contains('SUBMITTED');
    });
  });
});

context('Fap meeting components tests', () => {
  let createdInstrumentId: number;

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
    });
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FAP_REVIEW)) {
        this.skip();
      }
      updateUsersRoles();
    });
    initializationBeforeTests();
    cy.getAndStoreAppSettings();
    cy.then(() => {
      cy.assignProposalsToFaps({
        fapInstruments: [
          { instrumentId: newlyCreatedInstrumentId, fapId: createdFapId },
        ],
        proposalPks: [firstCreatedProposalPk],
      });
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.updateUserRoles({
        id: scientist.id,
        roles: [initialDBData.roles.instrumentScientist],
      });
      cy.addProposalTechnicalReview({
        proposalPk: firstCreatedProposalPk,
        status: TechnicalReviewStatus.FEASIBLE,
        timeAllocation: firstProposalTimeAllocation,
        submitted: true,
        reviewerId: 0,
        instrumentId: newlyCreatedInstrumentId,
      });
      cy.createInstrument(instrument1).then((result) => {
        const createdInstrument = result.createInstrument;
        if (createdInstrument) {
          createdInstrumentId = createdInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrumentId }],
          });
          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [firstCreatedProposalPk],
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [firstCreatedProposalPk],
          });
          cy.updateUserRoles({
            id: scientist.id,
            roles: [initialDBData.roles.instrumentScientist],
          });
          cy.addProposalTechnicalReview({
            proposalPk: firstCreatedProposalPk,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: firstProposalTimeAllocation,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.setInstrumentAvailabilityTime({
            callId: initialDBData.call.id,
            instrumentId: createdInstrumentId,
            availabilityTime: instrumentAvailabilityTime,
          });

          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
        }
      });
      // NOTE: Assign Fap to a call.
      cy.updateCall({
        id: initialDBData.call.id,
        ...updatedCall,
        proposalWorkflowId: createdWorkflowId,
        esiTemplateId: createdEsiTemplateId,
        faps: [createdFapId],
      });
    });
  });

  describe('User Officer role', () => {
    it('Officer should be able to assign proposal to instrument and instrument to call to see it in meeting components', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.contains(instrument1.name);

      cy.get("[aria-label='Submit instrument']").should('exist');

      cy.get("[aria-label='Detail panel visibility toggle']").first().click();

      cy.get('[data-cy="fap-instrument-proposals-table"] thead').contains(
        'Deviation'
      );

      cy.get(
        '[data-cy="fap-instrument-proposals-table"] [aria-label="View proposal details"]'
      ).click();

      cy.finishedLoading();

      cy.contains('Fap Meeting form');
      cy.contains('Proposal details');
      cy.contains('External reviews');

      cy.closeModal();
    });

    it('Officer should not be able to submit an instrument if all proposals are not submitted in Fap meetings', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get("[aria-label='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'error',
        text: 'All proposal Fap meetings should be submitted',
      });

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Submit instrument"]').should('not.be.disabled');
    });

    it('Only one modal should be open when multiple instruments with proposals are expanded', () => {
      cy.createInstrument(instrument2).then((result) => {
        const createdInstrument2Id = result.createInstrument.id;
        if (createdInstrument2Id) {
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrument2Id }],
          });

          cy.createProposal({ callId: initialDBData.call.id }).then(
            (result) => {
              const createdProposal = result.createProposal;
              if (createdProposal) {
                cy.updateProposal({
                  proposalPk: createdProposal.primaryKey,
                  title: proposal2.title,
                  abstract: proposal2.abstract,
                  proposerId: initialDBData.users.user1.id,
                });

                cy.assignProposalsToInstruments({
                  instrumentIds: [createdInstrument2Id],
                  proposalPks: [createdProposal.primaryKey],
                });

                cy.assignProposalsToFaps({
                  fapInstruments: [
                    { instrumentId: createdInstrument2Id, fapId: createdFapId },
                  ],
                  proposalPks: [createdProposal.primaryKey],
                });

                // Manually changing the proposal status to be shown in the Faps. -------->
                cy.changeProposalsStatus({
                  statusId: initialDBData.proposalStatuses.fapReview.id,
                  proposalPks: [createdProposal.primaryKey],
                });
              }
            }
          );
        }
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get('[aria-label="Detail panel visibility toggle"]').last().click();

      cy.contains(proposal1.title)
        .parent()
        .parent()
        .find('[aria-label="View proposal details"]')
        .click();

      cy.get('[role="presentation"][data-cy="Fap-meeting-modal"]')
        .should('exist')
        .and('have.length', 1);
    });

    it('Officer should be able to reorder proposal with drag and drop', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });
          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: secondProposalTimeAllocation,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });
        }
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.finishedLoading();

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal1.title);

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal2.title);

      cy.get('[data-cy="drag-icon"]').first().as('firstDragIcon');
      cy.get('[data-cy="drag-icon"]').last().as('secondDragIcon');
      cy.get('@firstDragIcon').trigger('dragstart');

      cy.get('@secondDragIcon').trigger('dragenter');

      cy.get('@secondDragIcon').trigger('dragend');

      cy.get(
        '[data-cy="fap-instrument-proposals-table"] [role="progressbar"]'
      ).should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'Reordering of proposals saved successfully',
      });

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal2.title);

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .first()
        .should(
          'have.attr',
          'unallocated-time-information',
          `Unallocated time: ${
            instrumentAvailabilityTime - secondProposalTimeAllocation
          } ${initialDBData.call.allocationTimeUnit}s`
        );

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal1.title);
    });

    it('Proposals in Fap meeting components should be ordered by standard deviation as second order parameter if there is no ranking', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.assignReviewersToFap({
            fapId: createdFapId,
            memberIds: [fapMembers.reviewer2.id],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });

          cy.getProposalReviews({
            proposalPk: firstCreatedProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.getProposalReviews({
            proposalPk: createdProposal.primaryKey,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make second proposal with higher standard deviation. Grades are 1 and 5
                  grade: index ? 1 : 5,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });
        }
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.finishedLoading();

      // NOTE: Proposal with higher standard deviation but same average score should be shown first on initial sort
      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal2.title);

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal1.title);
    });

    it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get(
        '[data-cy="fap-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
    });

    it('Officer should be able to update avaliblity time', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get("[aria-label='Update instrument Time']").click();

      cy.get('[data-cy="availability-time"]').type('10');
      cy.get('[data-cy="submit-update-time"]').click();

      cy.contains('Availability time updated successfully!');
    });

    it('Officer should be able to edit Fap Meeting form', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Officer should be able to see calculated availability time on instrument per Fap inside meeting components', () => {
      cy.setInstrumentAvailabilityTime({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        availabilityTime: instrumentNewAvailabilityTime,
      });
      cy.createProposal({ callId: initialDBData.call.id }).then(
        (proposalResult) => {
          const createdProposal = proposalResult.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });
            cy.assignProposalsToInstruments({
              instrumentIds: [createdInstrumentId],
              proposalPks: [createdProposal.primaryKey],
            });
            cy.addProposalTechnicalReview({
              proposalPk: createdProposal.primaryKey,
              status: TechnicalReviewStatus.FEASIBLE,
              timeAllocation: secondProposalNewTimeAllocation,
              submitted: true,
              reviewerId: 0,
              instrumentId: createdInstrumentId,
            });
            cy.createFap({
              code: fap2.code,
              description: fap2.description,
              active: true,
              numberRatingsRequired: 2,
              gradeGuide: fap2.gradeGuide,
            }).then((fapResult) => {
              if (fapResult.createFap) {
                cy.assignProposalsToFaps({
                  fapInstruments: [
                    {
                      instrumentId: createdInstrumentId,
                      fapId: fapResult.createFap.id,
                    },
                  ],
                  proposalPks: [createdProposal.primaryKey],
                });
              }
            });
          }
        }
      );

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[data-cy="Fap-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', secondProposalNewTimeAllocation);
      cy.get('[data-cy="Fap-meeting-components-table"] thead').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );
      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get(
        '[data-cy="Fap-meeting-components-table"] [data-cy="fap-instrument-proposals-table"] thead'
      ).should('include.text', initialDBData.call.allocationTimeUnit);
    });

    it('Calculated availability time should be rounded down in the .5 cases', () => {
      const localInstrumentAvailabilityTime = 5;
      const proposalTimeAllocation = 2;

      cy.setInstrumentAvailabilityTime({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        availabilityTime: localInstrumentAvailabilityTime,
      });
      cy.createProposal({ callId: initialDBData.call.id }).then(
        (proposalResult) => {
          const createdProposal = proposalResult.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });
            cy.assignProposalsToInstruments({
              instrumentIds: [createdInstrumentId],
              proposalPks: [createdProposal.primaryKey],
            });
            cy.addProposalTechnicalReview({
              proposalPk: createdProposal.primaryKey,
              status: TechnicalReviewStatus.FEASIBLE,
              timeAllocation: proposalTimeAllocation,
              submitted: true,
              reviewerId: 0,
              instrumentId: createdInstrumentId,
            });
            cy.createFap({
              code: fap2.code,
              description: fap2.description,
              active: true,
              numberRatingsRequired: 2,
              gradeGuide: fap2.gradeGuide,
            }).then((fapResult) => {
              if (fapResult.createFap) {
                cy.updateCall({
                  id: initialDBData.call.id,
                  ...updatedCall,
                  proposalWorkflowId: createdWorkflowId,
                  esiTemplateId: createdEsiTemplateId,
                  faps: [createdFapId, fapResult.createFap.id],
                });
                cy.assignProposalsToFaps({
                  fapInstruments: [
                    {
                      instrumentId: createdInstrumentId,
                      fapId: fapResult.createFap.id,
                    },
                  ],
                  proposalPks: [createdProposal.primaryKey],
                });
              }
            });
          }
        }
      );

      cy.assignProposalsToInstruments({
        instrumentIds: [createdInstrumentId],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.addProposalTechnicalReview({
        proposalPk: firstCreatedProposalPk,
        status: TechnicalReviewStatus.FEASIBLE,
        timeAllocation: proposalTimeAllocation,
        submitted: true,
        reviewerId: 0,
        instrumentId: createdInstrumentId,
      });

      cy.assignProposalsToFaps({
        fapInstruments: [
          {
            instrumentId: createdInstrumentId,
            fapId: createdFapId,
          },
        ],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[data-cy="Fap-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', proposalTimeAllocation);
      cy.get('[data-cy="Fap-meeting-components-table"] thead').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );
      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get(
        '[data-cy="Fap-meeting-components-table"] [data-cy="fap-instrument-proposals-table"] thead'
      ).should('include.text', initialDBData.call.allocationTimeUnit);

      cy.visit(`/Faps`);

      cy.finishedLoading();

      cy.contains(fap2.code)
        .closest('tr')
        .find('[data-testid="EditIcon"]')
        .click();

      cy.get('button').contains('Meeting Components').click();

      cy.get('[data-cy="Fap-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', proposalTimeAllocation);
      cy.get('[data-cy="Fap-meeting-components-table"] thead').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );
      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get(
        '[data-cy="Fap-meeting-components-table"] [data-cy="fap-instrument-proposals-table"] thead'
      ).should('include.text', initialDBData.call.allocationTimeUnit);
    });

    it('User officer should be able to assign proposal to multiple instruments and single FAP', () => {
      cy.assignProposalsToInstruments({
        instrumentIds: [createdInstrumentId, newlyCreatedInstrumentId],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.assignProposalsToFaps({
        fapInstruments: [
          {
            instrumentId: createdInstrumentId,
            fapId: createdFapId,
          },
          {
            instrumentId: newlyCreatedInstrumentId,
            fapId: createdFapId,
          },
        ],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.contains(instrument.name)
        .closest('tr')
        .find('[data-testid="ChevronRightIcon"]')
        .click();

      cy.contains(instrument.name)
        .closest('table')
        .find('[data-cy="fap-instrument-proposals-table"]')
        .should('include.text', proposal1.title);

      cy.contains(instrument1.name)
        .closest('tr')
        .find('[data-testid="ChevronRightIcon"]')
        .click();

      cy.contains(instrument1.name)
        .closest('table')
        .find('[data-cy="fap-instrument-proposals-table"]')
        .should('include.text', proposal1.title);
    });

    it('User officer should be able to assign proposal to multiple instruments and multiple FAPs', () => {
      cy.assignProposalsToInstruments({
        instrumentIds: [createdInstrumentId, newlyCreatedInstrumentId],
        proposalPks: [firstCreatedProposalPk],
      });

      cy.createFap({
        code: fap2.code,
        description: fap2.description,
        active: true,
        numberRatingsRequired: 2,
        gradeGuide: fap2.gradeGuide,
      }).then((fapResult) => {
        if (fapResult.createFap) {
          cy.updateCall({
            id: initialDBData.call.id,
            ...updatedCall,
            proposalWorkflowId: createdWorkflowId,
            esiTemplateId: createdEsiTemplateId,
            faps: [createdFapId, fapResult.createFap.id],
          });
          cy.assignProposalsToFaps({
            fapInstruments: [
              {
                instrumentId: newlyCreatedInstrumentId,
                fapId: createdFapId,
              },
              {
                instrumentId: createdInstrumentId,
                fapId: fapResult.createFap.id,
              },
            ],
            proposalPks: [firstCreatedProposalPk],
          });
        }
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.contains(instrument.name)
        .closest('tr')
        .find('[data-testid="ChevronRightIcon"]')
        .click();

      cy.contains(instrument.name)
        .closest('table')
        .find('[data-cy="fap-instrument-proposals-table"]')
        .should('include.text', proposal1.title);

      cy.visit(`/Faps`);

      cy.contains(fap2.code)
        .closest('tr')
        .find('[data-testid="EditIcon"]')
        .click();

      cy.get('button').contains('Meeting Components').click();

      cy.contains(instrument1.name)
        .closest('tr')
        .find('[data-testid="ChevronRightIcon"]')
        .click();

      cy.contains(instrument1.name)
        .closest('table')
        .find('[data-cy="fap-instrument-proposals-table"]')
        .should('include.text', proposal1.title);
    });

    it('Officer should be able to set Fap time allocation', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('[data-cy="edit-fap-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-fap-time-allocation"]').click();

      cy.get('[data-cy="fapTimeAllocation"] input').as('timeAllocation');

      cy.get('@timeAllocation').should('have.value', '');

      cy.get('@timeAllocation').type('-1').blur();
      cy.contains('Must be greater than or equal to');

      cy.get('@timeAllocation').clear().type('987654321').blur();
      cy.contains('Must be less than or equal to');

      cy.get('@timeAllocation').clear().type('9999');
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.contains('9999 (Overwritten)');

      cy.closeModal();
      cy.contains('9999');

      cy.reload();
      cy.contains('Meeting Components').click();
      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('[data-cy="edit-fap-time-allocation"]').click();
      cy.get('@timeAllocation').should('have.value', '9999');
      cy.get('@timeAllocation').clear();
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.get('body').should('not.contain', '9999 (Overwritten)');

      cy.closeModal();
    });

    it('should use Fap time allocation (if set) when calculating if they fit in available time', () => {
      const newFapTimeAllocation = 15;
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get(
        '[data-cy="fap-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

      cy.get(
        '[data-cy="fap-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.attr', 'unallocated-time-information', '');

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('[data-cy="edit-fap-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-fap-time-allocation"]').click();

      cy.get('[data-cy="fapTimeAllocation"] input').as('timeAllocation');

      cy.get('@timeAllocation').should('be.empty');
      cy.get('@timeAllocation').type('15');
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.contains('15 (Overwritten)');

      cy.closeModal();

      cy.get(
        '[data-cy="fap-instrument-proposals-table"] tbody tr:last-child'
      ).should('not.have.css', 'background-color', 'rgb(246, 104, 94)');

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr:last-child')
        .first()
        .should(
          'have.attr',
          'unallocated-time-information',
          `Unallocated time: ${
            instrumentAvailabilityTime - newFapTimeAllocation
          } ${initialDBData.call.allocationTimeUnit}s`
        );
    });

    it('Officer should be able to submit multiple completed Meetings forms', function () {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;

        cy.wrap(createdProposal.proposalId).as('proposal2Id');

        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });
          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.assignReviewersToFap({
            fapId: createdFapId,
            memberIds: [fapMembers.reviewer2.id],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });

          cy.getProposalReviews({
            proposalPk: firstCreatedProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.getProposalReviews({
            proposalPk: createdProposal.primaryKey,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make second proposal with higher standard deviation. Grades are 1 and 5
                  grade: index ? 1 : 5,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });
        }
      });

      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          commentForManagement: 'test',
          commentForUser: 'test',
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });

      cy.finishedLoading();

      cy.get('[data-cy="submit-all-button"]').click();

      cy.contains('Some proposals could not be submitted');

      cy.get('[data-cy="proposal-' + firstCreatedProposalId + '"]').should(
        'not.exist'
      );

      cy.get('@proposal2Id').then((proposalId) => {
        cy.get('[data-cy="proposal-' + proposalId + '"]').should('exist');
      });
    });

    it('Officer should be able to submit an instrument if all proposals Fap meetings are submitted in existing Fap', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[aria-label="Drag proposals to reorder"]')
        .should('exist')
        .and('not.be.disabled');
      cy.get('[aria-label="View proposal details"]').first().click();

      cy.get('[role="dialog"] > header + div').scrollTo('top');

      cy.setTinyMceContent('commentForUser', 'Test');
      cy.setTinyMceContent('commentForManagement', 'Test');

      cy.get('[data-cy="is-fap-meeting-submitted"]').click();
      cy.get('[data-cy="saveAndContinue"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap meeting decision submitted successfully',
      });

      cy.get("[aria-label='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Instrument submitted',
      });

      cy.get('[data-cy="fap-instrument-proposals-table"] tbody tr')
        .first()
        .find('td')
        .eq(8)
        .should('not.contain.text', '-')
        .should('contain.text', '1');

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').should('exist');

      cy.get('button[aria-label="Submit instrument"]').should('not.exist');
      cy.get('button[aria-label="Unsubmit instrument"]')
        .should('exist')
        .and('not.be.disabled');

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[aria-label="Drag proposals to reorder"]').should('not.exist');

      cy.intercept({ url: '/graphql', method: 'POST' }, (req) => {
        if (req.body.operationName === 'reorderFapMeetingDecisionProposals') {
          req.alias = 'reorderFapMeetingDecisionProposals';
        }
      });

      // NOTE: Trying to catch the failure of cy.reorderFapMeetingDecisionProposals because instrument is submitted
      cy.on('fail', (err) => {
        if (
          err.name === 'Error' &&
          err.message.includes('reorderFapMeetingDecisionProposals')
        ) {
          expect(err.message).to.include(
            'FAP instrument for selected proposals is submitted and reordering is not allowed'
          );

          return true;
        }

        throw err;
      });

      cy.reorderFapMeetingDecisionProposals({
        reorderFapMeetingDecisionProposalsInput: {
          proposals: [
            {
              fapId: createdFapId,
              instrumentId: createdInstrumentId,
              proposalPk: firstCreatedProposalPk,
              rankOrder: 1,
            },
          ],
        },
      });

      cy.wait('@reorderFapMeetingDecisionProposals').then((res) => {
        expect(res.response?.body.data).to.eq(null);
        expect(res.response?.body.error).to.haveOwnProperty('error');
      });
    });

    it('Officer should be able to edit Fap Meeting form after instrument is submitted', () => {
      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });
      cy.submitInstrumentInFap({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        fapId: createdFapId,
      });
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('button[aria-label="Submit instrument"]').should('not.exist');
      cy.get('button[aria-label="Unsubmit instrument"]').should('exist');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Download Fap is working with dialog window showing up', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('button[aria-label="Export in Excel"]')
        .should('not.be.disabled')
        .click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        updatedCall.shortCode
      );
    });

    it('Officer should be able to remove assigned Fap member from proposal in existing Fap', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[data-cy="fap-reviewer-assignments-table"] table tbody tr').as(
        'rows'
      );

      // we testing a bug here, where the list didn't update
      // properly after removing an assignment
      function assertAndRemoveAssignment(length: number) {
        cy.get('@rows').should('have.length', length);

        cy.get('[aria-label="Remove assignment"]').first().click();
        cy.get('[aria-label="Save"]').click();

        cy.notification({
          variant: 'success',
          text: 'Reviewer removed',
        });
      }

      assertAndRemoveAssignment(1);
      cy.finishedLoading();

      cy.get('@rows').should('not.contain.text', fapMembers.reviewer.lastName);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains(Event.FAP_MEMBER_REMOVED_FROM_PROPOSAL);
    });

    it('Officer should be able to remove assigned proposal from existing Fap', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="remove-assigned-fap-proposal"]').click();

      cy.get('[data-cy="confirmation-dialog"]')
        .should('exist')
        .and('contain.text', 'Remove Fap assignment');

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Assignment/s removed',
      });

      cy.closeNotification();

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains('Assignments').click();

      cy.get('[data-cy="fap-assignments-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="fap-assignments-table"]')
        .find('tbody td')
        .last()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });

    it('Officer should be able to download Fap proposal as pdf', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-fap-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposal1.title
      );
    });

    it('Officer should be able to add custom grade guide when creating Fap', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get('[data-cy="grade-proposal-icon"]').click();

      cy.get('[role="dialog"]').as('dialog');
      const commentContent = faker.lorem.words(3);
      cy.setTinyMceContent('comment', commentContent);

      if (
        settings.getEnabledSettings().get(SettingsId.GRADE_PRECISION) === '1'
      ) {
        cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

        cy.get('[role="listbox"] > [role="option"]').first().click();

        cy.get('[data-cy="grade-proposal"] input').should('have.value', '1');
      } else {
        cy.get('@dialog').get('[data-cy="grade-proposal"]').click().type('1');
      }

      cy.get(`#comment_ifr`).first().focus().click();

      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.get('[data-cy="grade-guide"]').click();

      cy.contains(fap1.gradeGuide).should('not.exist');

      cy.visit(`/FapPage/${createdFapId}?`);

      cy.finishedLoading();

      cy.get('[data-cy="custom-grade-guide"]').click();
      cy.get('[data-cy="submit"]').click();

      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get('[data-cy="grade-proposal-icon"]').click();

      cy.get('[data-cy=back-button]').focus().click();
      cy.get('[data-cy="grade-guide"]').click();

      cy.contains(fap1.gradeGuide);

      cy.get('[data-cy="close-modal-btn"]').click();
      cy.closeModal();
    });

    it('Officer should be able to bulk download Fap proposals as pdf', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then(
        (proposalResult) => {
          const createdProposal = proposalResult.createProposal;
          if (createdProposal) {
            cy.assignProposalsToInstruments({
              instrumentIds: [createdInstrumentId],
              proposalPks: [createdProposal.primaryKey],
            });
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });
            cy.createFap({
              code: fap2.code,
              description: fap2.description,
              active: true,
              numberRatingsRequired: 2,
              gradeGuide: fap2.gradeGuide,
            }).then((fapResult) => {
              if (fapResult.createFap) {
                cy.assignProposalsToFaps({
                  fapInstruments: [
                    {
                      instrumentId: createdInstrumentId,
                      fapId: fapResult.createFap.id,
                    },
                  ],
                  proposalPks: [createdProposal.primaryKey],
                });
              }
            });
          }
        }
      );
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get(
        '[data-cy="fap-assignments-table"] #select-all-table-rows'
      ).click();

      cy.get('[data-cy="download-fap-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposal1.title
      );
    });

    it('Officer should be be able to download of all FAP meetings in excel', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;

        cy.wrap(createdProposal.proposalId).as('proposal2Id');

        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });
          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.assignReviewersToFap({
            fapId: createdFapId,
            memberIds: [fapMembers.reviewer2.id],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });

          cy.getProposalReviews({
            proposalPk: firstCreatedProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.getProposalReviews({
            proposalPk: createdProposal.primaryKey,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make second proposal with higher standard deviation. Grades are 1 and 5
                  grade: index ? 1 : 5,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.saveFapMeetingDecision({
            saveFapMeetingDecisionInput: {
              commentForManagement: 'test',
              commentForUser: 'test',
              proposalPk: firstCreatedProposalPk,
              submitted: true,
              recommendation: ProposalEndStatus.ACCEPTED,
              instrumentId: createdInstrumentId,
              fapId: createdFapId,
            },
          });

          cy.saveFapMeetingDecision({
            saveFapMeetingDecisionInput: {
              commentForManagement: 'test2',
              commentForUser: 'test2',
              proposalPk: createdProposal.primaryKey,
              submitted: true,
              recommendation: ProposalEndStatus.ACCEPTED,
              instrumentId: createdInstrumentId,
              fapId: createdFapId,
            },
          });
        }
      });

      cy.login('officer');
      cy.visit(`/Calls`);

      cy.contains(updatedCall.shortCode)
        .parent()
        .find('[aria-label="Export Fap Data"]')
        .click();

      const downloadsFolder = Cypress.config('downloadsFolder');
      const fileName = `${updatedCall.shortCode}_FAP_Results.xlsx`;

      cy.readFile(`${downloadsFolder}/${fileName}`)
        .should('exist')
        .then(() => {
          cy.task('convertXlsxToJson', `${downloadsFolder}/${fileName}`).then(
            (actualExport) => {
              cy.fixture('exampleCallFapExport.json').then((expectedExport) => {
                expect(expectedExport).to.deep.equal(actualExport);
              });
            }
          );
        });
    });
  });

  describe('Fap Chair role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.chair.id,
          roleId: UserRole.FAP_CHAIR,
        },
      });

      cy.login(fapMembers.chair);
      cy.changeActiveRole(initialDBData.roles.fapChair);
    });
    it('Fap Chair should be able to edit Fap Meeting form', () => {
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Fap Chair should not be able to edit Fap Meeting form after instrument is submitted', () => {
      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });
      cy.submitInstrumentInFap({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        fapId: createdFapId,
      });
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();
      cy.get('button[aria-label="Submit instrument"]').should('not.exist');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('#commentForUser')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('#commentForManagement')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('[data-cy="save"]').should('not.exist');
      cy.get('[data-cy="saveAndContinue"]').should('not.exist');
    });

    it('Fap Chair should not be able to remove assigned proposal from existing Fap', () => {
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });

    it('Fap Chair should be able to update avalibabity time', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get("[aria-label='Update instrument Time']").click();

      cy.get('[data-cy="availability-time"]').type('10');
      cy.get('[data-cy="submit-update-time"]').click();

      cy.contains('Availability time updated successfully!');
    });

    it('Fap Chair should be able to submit multiple completed Meetings forms', function () {
      cy.logout();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;

        cy.wrap(createdProposal.proposalId).as('proposal2Id');

        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });
          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.assignReviewersToFap({
            fapId: createdFapId,
            memberIds: [fapMembers.reviewer2.id],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });

          cy.getProposalReviews({
            proposalPk: firstCreatedProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.getProposalReviews({
            proposalPk: createdProposal.primaryKey,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make second proposal with higher standard deviation. Grades are 1 and 5
                  grade: index ? 1 : 5,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });
        }
      });

      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          commentForManagement: 'test',
          commentForUser: 'test',
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });

      cy.login(fapMembers.chair);
      cy.changeActiveRole(initialDBData.roles.fapChair);
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[data-cy="submit-all-button"]').click();

      cy.contains('Some proposals could not be submitted');

      cy.get('[data-cy="proposal-' + firstCreatedProposalId + '"]').should(
        'not.exist'
      );

      cy.get('@proposal2Id').then((proposalId) => {
        cy.get('[data-cy="proposal-' + proposalId + '"]').should('exist');
      });
    });
  });

  describe('Fap Secretary role', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: fapMembers.secretary.id,
          roles: [initialDBData.roles.fapReviewer],
        });
      }
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.secretary.id,
          roleId: UserRole.FAP_SECRETARY,
        },
      });

      cy.login(fapMembers.secretary);
      cy.changeActiveRole(initialDBData.roles.fapSecretary);
    });

    it('Fap Secretary should be able to edit Fap Meeting form', () => {
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Fap Secretary should not be able to edit Fap Meeting form after instrument is submitted', () => {
      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });
      cy.submitInstrumentInFap({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        fapId: createdFapId,
      });
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();
      cy.get('button[aria-label="Submit instrument"]').should('not.exist');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('#commentForUser')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('#commentForManagement')
        .parent()
        .find('.tox-menubar button')
        .should('be.disabled');

      cy.get('[data-cy="save"]').should('not.exist');
      cy.get('[data-cy="saveAndContinue"]').should('not.exist');
    });

    it('Fap Secretary should not be able to remove assigned proposal from existing Fap', () => {
      cy.visit(`/FapPage/${createdFapId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });

    it('Fap Secretary should be able to update avalibabity time', () => {
      cy.login('officer');
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get("[aria-label='Update instrument Time']").click();

      cy.get('[data-cy="availability-time"]').type('10');
      cy.get('[data-cy="submit-update-time"]').click();

      cy.contains('Availability time updated successfully!');
    });

    it('Fap Secretary should be able to submit multiple completed Meetings forms', function () {
      cy.logout();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;

        cy.wrap(createdProposal.proposalId).as('proposal2Id');

        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [createdProposal.primaryKey],
          });
          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
            instrumentId: createdInstrumentId,
          });

          cy.assignProposalsToFaps({
            fapInstruments: [
              { instrumentId: createdInstrumentId, fapId: createdFapId },
            ],
            proposalPks: [createdProposal.primaryKey],
          });

          cy.assignReviewersToFap({
            fapId: createdFapId,
            memberIds: [fapMembers.reviewer2.id],
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: firstCreatedProposalPk,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });
          cy.assignFapReviewersToProposals({
            assignments: {
              memberId: fapMembers.reviewer2.id,
              proposalPk: createdProposal.primaryKey,
            },
            fapId: createdFapId,
          });

          // Manually changing the proposal status to be shown in the Faps. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.fapReview.id,
            proposalPks: [createdProposal.primaryKey],
          });

          cy.getProposalReviews({
            proposalPk: firstCreatedProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });

          cy.getProposalReviews({
            proposalPk: createdProposal.primaryKey,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make second proposal with higher standard deviation. Grades are 1 and 5
                  grade: index ? 1 : 5,
                  status: ReviewStatus.SUBMITTED,
                  fapID: createdFapId,
                  questionaryID: review.questionaryID,
                });
              });
            }
          });
        }
      });

      cy.saveFapMeetingDecision({
        saveFapMeetingDecisionInput: {
          commentForManagement: 'test',
          commentForUser: 'test',
          proposalPk: firstCreatedProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
          instrumentId: createdInstrumentId,
          fapId: createdFapId,
        },
      });

      cy.login(fapMembers.secretary);
      cy.changeActiveRole(initialDBData.roles.fapSecretary);
      cy.visit(`/FapPage/${createdFapId}?tab=4`);

      cy.finishedLoading();

      cy.get('[data-cy="submit-all-button"]').click();

      cy.contains('Some proposals could not be submitted');

      cy.get('[data-cy="proposal-' + firstCreatedProposalId + '"]').should(
        'not.exist'
      );

      cy.get('@proposal2Id').then((proposalId) => {
        cy.get('[data-cy="proposal-' + proposalId + '"]').should('exist');
      });
    });
  });

  describe('Fap Reviewer role', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: fapMembers.reviewer2.id,
          roles: [initialDBData.roles.fapReviewer],
        });
      }
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer2.id],
      });
    });

    it('Fap Reviewer should not be able to see reviews he/she is not a direct reviewer', () => {
      cy.login(fapMembers.reviewer2);
      cy.visit('/');
      cy.get('main table tbody').contains('No records to display');
    });

    it('Fap Reviewer should be able to give review', () => {
      cy.login(fapMembers.reviewer);
      cy.visit('/');
      cy.finishedLoading();
      cy.get('[data-cy="grade-proposal-icon"]').click();
      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.get('[data-cy="grade-proposal"] input:invalid').should(
        'have.length',
        1
      );
      // NOTE: Testing native html required validation message.
      cy.get('[data-cy="grade-proposal"] input').then(($input) => {
        expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
          'Please fill out this field.'
        );
      });
      cy.get('[data-cy="grade-proposal"]').click();
      cy.get('[data-cy="grade-proposal-options"] [role="option"]')
        .first()
        .click();
      cy.get('[data-cy="save-and-continue-button"]').focus().click();
      cy.contains('Comment is required');
      cy.setTinyMceContent('comment', faker.lorem.words(3));
      cy.get('[data-cy=save-and-continue-button]').focus().click();
      //cy.notification({ variant: 'success', text: 'Updated' });
    });

    it('Fap Reviewer should be able to give non integer review', () => {
      cy.login(initialDBData.users.officer);
      cy.visit('/');
      cy.finishedLoading();

      cy.get('[data-cy="officer-menu-items"]').contains('Settings').click();
      cy.get('[data-cy="officer-menu-items"]').contains('App settings').click();

      cy.get('[data-cy="settings-table"]')
        .get('input[aria-label="Search"]')
        .type('GRADE_PRECISION');

      cy.get('[data-cy="settings-table"]')
        .contains('GRADE_PRECISION')
        .parent()
        .find('button[aria-label="Edit"]')
        .click();

      cy.get('[data-cy="settings-table"]')
        .contains('GRADE_PRECISION')
        .parent()
        .find(`input[value="1"]`)
        .clear()
        .type('0.01');

      cy.get('[data-cy="settings-table"]')
        .contains('GRADE_PRECISION')
        .parent()
        .find('button[aria-label="Save"]')
        .click();

      cy.logout();

      cy.login(fapMembers.reviewer);
      cy.visit('/');
      cy.finishedLoading();

      cy.get('[data-cy="grade-proposal-icon"]').click();

      cy.setTinyMceContent('comment', faker.lorem.words(3));
      cy.get('#grade-proposal').type('0.001');

      cy.get('[data-cy="save-and-continue-button"]').focus().click();

      cy.contains('Lowest grade is 1');

      cy.get('#grade-proposal').clear().type('1.001');

      cy.get('[data-cy="save-and-continue-button"]').focus().click();

      cy.get('[data-cy="grade-proposal"] input').then(($input) => {
        expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
          'Value must be less than or equal to 10.'
        );
      });

      cy.get('#grade-proposal').clear().type('1.01');

      cy.get('[data-cy=save-and-continue-button]').click();
      //cy.notification({ variant: 'success', text: 'Updated' });
    });
  });
});

context('Automatic Fap assignment to Proposal', () => {
  let firstAutoAssignmentInstrumentId: number;
  let firstAutoAssignProposalPk: number;
  let firstAutoAssignProposalId: string;
  const scientist1 = initialDBData.users.user1;
  const instrument1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist1.id,
  };
  const instrument2 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist1.id,
  };

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FAP_REVIEW)) {
        this.skip();
      }
      updateUsersRoles();
    });
    initializationBeforeTests();

    cy.then(() => {
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          firstAutoAssignmentInstrumentId = result.createInstrument.id;
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [
              {
                instrumentId: result.createInstrument.id,
                fapId: initialDBData.fap.id,
              },
            ],
          });

          cy.createProposal({ callId: initialDBData.call.id }).then(
            (response) => {
              if (response.createProposal) {
                firstAutoAssignProposalPk = response.createProposal.primaryKey;
                firstAutoAssignProposalId = response.createProposal.proposalId;
              }
            }
          );
        }
      });
    });
  });

  it('Automatic FAP assignment to Proposal, when an Instrument is assigned to a Proposal', () => {
    cy.assignProposalsToInstruments({
      proposalPks: [firstAutoAssignProposalPk],
      instrumentIds: [firstAutoAssignmentInstrumentId],
    });

    cy.login('officer');
    cy.visit('/Proposals');

    cy.contains('td', firstAutoAssignProposalId)
      .siblings()
      .should('contain.text', initialDBData.fap.code);
  });

  it('Automatic FAPs assignment to Proposal, when multiple Instruments are assigned to a Proposal', () => {
    cy.createInstrument(instrument2).then((result) => {
      if (result.createInstrument) {
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [
            {
              instrumentId: result.createInstrument.id,
              fapId: createdFapId,
            },
          ],
        });

        cy.assignProposalsToInstruments({
          proposalPks: [firstAutoAssignProposalPk],
          instrumentIds: [
            result.createInstrument.id,
            firstAutoAssignmentInstrumentId,
          ],
        });

        cy.login('officer');
        cy.visit('/Proposals');

        cy.contains('td', firstAutoAssignProposalId)
          .siblings()
          .should('contain.text', initialDBData.fap.code);
        cy.contains('td', firstAutoAssignProposalId)
          .siblings()
          .should('contain.text', fap1.code);
      }
    });
  });

  it('Proposal should be automatically assigned to the right FAP, when multiple Instruments are assigned to a Proposal', () => {
    cy.createInstrument(instrument2).then((result) => {
      if (result.createInstrument) {
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [
            {
              instrumentId: result.createInstrument.id,
              fapId: createdFapId,
            },
          ],
        });
        cy.assignInstrumentToCall({
          callId: createdCallId,
          instrumentFapIds: [
            {
              instrumentId: firstAutoAssignmentInstrumentId,
              fapId: createdFapId,
            },
          ],
        });

        cy.assignProposalsToInstruments({
          proposalPks: [firstAutoAssignProposalPk],
          instrumentIds: [
            result.createInstrument.id,
            firstAutoAssignmentInstrumentId,
          ],
        });

        cy.login('officer');
        cy.visit('/Proposals');

        cy.contains('td', firstAutoAssignProposalId)
          .closest('tr')
          .find(`td:contains(${initialDBData.fap.code})`)
          .invoke('text')
          .then((text) => {
            const firstFapCount = text.split(initialDBData.fap.code).length - 1;
            const secondFapCount = text.split(fap1.code).length - 1;

            expect(firstFapCount).to.eq(1);
            expect(secondFapCount).to.eq(1);
          });
      }
    });
  });
});
