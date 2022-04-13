import faker from 'faker';

import {
  ProposalEndStatus,
  ReviewStatus,
  TechnicalReviewStatus,
  UserRole,
} from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

const sepMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user1,
  reviewer: initialDBData.users.reviewer,
  reviewer2: initialDBData.users.user3,
};

function readWriteReview({ shouldSubmit } = { shouldSubmit: false }) {
  cy.get('[role="dialog"]').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information', { matchCase: false });
  cy.get('@dialog').contains('Technical review');
  cy.get('@dialog').contains('Grade');

  cy.setTinyMceContent('comment', faker.lorem.words(3));

  cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

  cy.get('[role="listbox"] > [role="option"]').first().click();

  if (shouldSubmit) {
    cy.get('[data-cy="is-grade-submitted"]').click();
  }

  cy.get('@dialog').contains('Save').click();

  cy.notification({ variant: 'success', text: 'Updated' });

  cy.closeModal();

  cy.get('@dialog').should('not.exist');
}

function editFinalRankingForm() {
  cy.get('[role="dialog"] > header + div').scrollTo('top');

  cy.setTinyMceContent('commentForUser', faker.lorem.words(3));
  cy.setTinyMceContent('commentForManagement', faker.lorem.words(3));

  cy.contains('External reviews').parent().find('table').as('reviewsTable');

  cy.get('@reviewsTable').contains(sepMembers.reviewer.lastName);

  cy.get('[data-cy="save"]').click();

  cy.notification({
    variant: 'success',
    text: 'successfully',
  });
}

const sep1 = {
  code: faker.lorem.word(10),
  description: faker.random.words(8),
};

const sep2 = {
  code: faker.lorem.words(1),
  description: faker.random.words(8),
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

let createdSepId: number;
let createdProposalPk: number;
let createdProposalId: string;

function initializationBeforeTests() {
  cy.resetDB();
  cy.createSep({
    code: sep1.code,
    description: sep1.description,
    numberRatingsRequired: 2,
    active: true,
  }).then((result) => {
    if (result.createSEP.sep) {
      createdSepId = result.createSEP.sep.id;
    }
  });
  cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
    const createdProposal = result.createProposal.proposal;
    if (createdProposal) {
      createdProposalPk = createdProposal.primaryKey;
      createdProposalId = createdProposal.proposalId;

      cy.updateProposal({
        proposalPk: createdProposal.primaryKey,
        title: proposal1.title,
        abstract: proposal1.abstract,
        proposerId: initialDBData.users.user1.id,
      });

      // Manually changing the proposal status to be shown in the SEPs. -------->
      cy.changeProposalsStatus({
        statusId: initialDBData.proposalStatuses.sepReview.id,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
    }
  });
  cy.updateUserRoles({
    id: sepMembers.chair.id,
    roles: [initialDBData.roles.sepReviewer],
  });
  cy.updateUserRoles({
    id: sepMembers.secretary.id,
    roles: [initialDBData.roles.sepReviewer],
  });
  cy.updateUserRoles({
    id: sepMembers.reviewer.id,
    roles: [initialDBData.roles.sepReviewer],
  });
}

context('SEP reviews tests', () => {
  beforeEach(() => {
    initializationBeforeTests();
  });

  describe('User officer role', () => {
    it('Officer should be able to assign proposal to existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.get('[data-cy="sep-assignments-table"]').should(
        'not.contain.text',
        proposal1.title
      );

      cy.contains('Proposals').click();

      cy.contains(proposal1.title).parent().find('[type="checkbox"]').check();

      cy.get("[aria-label='Assign proposals to SEP']").first().click();

      cy.get('[data-cy="sep-selection"] input').should(
        'not.have.class',
        'Mui-disabled'
      );
      cy.get('[data-cy="sep-selection"]').click();

      cy.get('[data-cy="sep-selection-options"]').contains(sep1.code).click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        text: 'Proposal/s assigned to the selected SEP successfully',
        variant: 'success',
      });

      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[data-cy="sep-assignments-table"]').should(
        'contain.text',
        proposal1.title
      );
    });

    it('Officer should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="View Proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.title);
      cy.get('[role="dialog"]').contains('Download PDF');

      cy.closeModal();
    });

    it('Proposal should contain standard deviation field inside proposals and assignments', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[data-cy="sep-assignments-table"] thead').contains('Deviation');
    });

    it('Officer should be able to assign SEP member to proposal in existing SEP', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[aria-label='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.reviewer.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.contains(sepMembers.reviewer.lastName);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains('SEP_MEMBER_ASSIGNED_TO_PROPOSAL');
    });

    it('Officer should be able to read/write reviews', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      readWriteReview();
    });

    it('Officer should be able to submit and un-submit reviews', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      readWriteReview({ shouldSubmit: true });

      cy.contains(sepMembers.reviewer.lastName).parent().contains('SUBMITTED');
      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="view-proposal-details-icon"]')
        .click();

      cy.get('[role="presentation"] [role="tab"]').contains('Grade').click();

      cy.get('[role="presentation"] form button[type="submit"]').should(
        'not.be.disabled'
      );

      cy.get('[data-cy="is-grade-submitted"]').click();

      cy.get('[role="presentation"] form button[type="submit"]').click();

      cy.notification({ variant: 'success', text: 'Updated' });

      cy.closeModal();
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[role="tab"]').contains('Members').click();
      cy.get('[role="tab"]')
        .contains('Proposals and assignments', { matchCase: false })
        .click();
      cy.finishedLoading();
      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName).parent().contains('DRAFT');
    });

    it('Officer should get error when trying to delete proposal which has dependencies (like reviews)', () => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });
      cy.login('officer');
      cy.visit('/ProposalPage');

      cy.get('[type="checkbox"]').first().check();

      cy.get('[aria-label="Delete proposals"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'error',
        text: 'Failed to delete proposal because, it has dependencies which need to be deleted first',
      });
    });
  });

  describe('SEP Chair role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.chair.id,
          roleId: UserRole.SEP_CHAIR,
        },
      });
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });

      cy.login(sepMembers.chair);
      cy.changeActiveRole(initialDBData.roles.sepChair);
    });

    it('SEP Chair should be able to assign SEP member to proposal in existing SEP', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[aria-label='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.chair.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(sepMembers.chair.lastName);
    });

    it('SEP Chair should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="View Proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Proposal information');
      cy.get('[role="dialog"]').contains('Technical review');

      cy.get('[role="dialog"]').contains(proposal1.title);
      cy.get('[role="dialog"]').contains('Download PDF');
    });

    it('SEP Chair should be able to read/write and un-submit reviews', () => {
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });

      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('exist');
      readWriteReview();
    });
  });

  describe('SEP Secretary role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.secretary.id,
          roleId: UserRole.SEP_SECRETARY,
        },
      });
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.login(sepMembers.secretary);
      cy.changeActiveRole(initialDBData.roles.sepSecretary);
    });

    it('SEP Secretary should be able to assign SEP member to proposal in existing SEP', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[aria-label='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.secretary.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(sepMembers.secretary.lastName);
    });

    it('SEP Secretary should be able to read/write and un-submit reviews', () => {
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });

      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('exist');
      readWriteReview();
    });
  });

  describe('SEP Reviewer role', () => {
    beforeEach(() => {
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });
      cy.login(sepMembers.reviewer);
      cy.visit('/');
    });

    it('SEP Reviewer should be able to filter their reviews by status and bulk submit them', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
        if (createdProposal) {
          createdProposalPk = createdProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToSep({
            sepId: createdSepId,
            proposals: [
              { callId: initialDBData.call.id, primaryKey: createdProposalPk },
            ],
          });
          cy.assignReviewersToSep({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer.id],
          });
          cy.assignSepReviewersToProposal({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer.id],
            proposalPk: createdProposalPk,
          });

          cy.getProposalReviews({
            proposalPk: createdProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              cy.updateReview({
                reviewID: proposalReviews[0].id,
                comment: faker.random.words(5),
                grade: 2,
                status: ReviewStatus.SUBMITTED,
                sepID: createdSepId,
              });
            }
          });
        }
      });
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
        `Please correct the grade and comment for the proposal(s) with ID: ${createdProposalId}`
      ).should('exist');

      cy.get('[data-cy="confirm-cancel"]').click();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.setTinyMceContent('comment', faker.lorem.words(3));
      cy.get('[data-cy="grade-proposal"]').click();
      cy.get('[data-cy="grade-proposal-options"] [role="option"]')
        .first()
        .click();
      cy.get('[data-cy=submit-grade]').click();
      cy.get('[data-cy=confirm-ok]').click();
      cy.finishedLoading();
      cy.notification({ variant: 'success', text: 'Submitted' });
      cy.closeModal();

      cy.contains(proposal1.title).parent().contains('Submitted');

      cy.get('[data-cy="submit-proposal-reviews"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        text: 'Proposals review submitted successfully',
        variant: 'success',
      });
    });
  });
});

context('SEP meeting components tests', () => {
  let createdInstrumentId: number;

  beforeEach(() => {
    initializationBeforeTests();
    cy.assignProposalsToSep({
      sepId: createdSepId,
      proposals: [
        { callId: initialDBData.call.id, primaryKey: createdProposalPk },
      ],
    });
    cy.assignReviewersToSep({
      sepId: createdSepId,
      memberIds: [sepMembers.reviewer.id],
    });
    cy.assignSepReviewersToProposal({
      sepId: createdSepId,
      memberIds: [sepMembers.reviewer.id],
      proposalPk: createdProposalPk,
    });
    cy.updateUserRoles({
      id: scientist.id,
      roles: [initialDBData.roles.instrumentScientist],
    });
    cy.addProposalTechnicalReview({
      proposalPk: createdProposalPk,
      status: TechnicalReviewStatus.FEASIBLE,
      timeAllocation: 25,
      submitted: true,
      reviewerId: 0,
    });
    cy.createInstrument(instrument).then((result) => {
      const createdInstrument = result.createInstrument.instrument;
      if (createdInstrument) {
        createdInstrumentId = createdInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentIds: [createdInstrumentId],
        });
        cy.assignProposalsToInstrument({
          instrumentId: createdInstrumentId,
          proposals: [
            {
              callId: initialDBData.call.id,
              primaryKey: createdProposalPk,
            },
          ],
        });

        cy.setInstrumentAvailabilityTime({
          callId: initialDBData.call.id,
          instrumentId: createdInstrumentId,
          availabilityTime: 20,
        });
      }
    });
  });

  describe('User Officer role', () => {
    it('Officer should be able to assign proposal to instrument and instrument to call to see it in meeting components', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.contains(instrument.name);

      cy.get("[aria-label='Submit instrument']").should('exist');

      cy.get("[aria-label='Detail panel visibility toggle']").first().click();

      cy.get('[data-cy="sep-instrument-proposals-table"] thead').contains(
        'Deviation'
      );

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] [aria-label="View proposal details"]'
      ).click();

      cy.finishedLoading();

      cy.contains('SEP Meeting form');
      cy.contains('Proposal details');
      cy.contains('External reviews');

      cy.closeModal();
    });

    it('Officer should not be able to submit an instrument if all proposals are not submitted in SEP meetings', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get("[aria-label='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'error',
        text: 'All proposal SEP meetings should be submitted',
      });

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Submit instrument"]').should('not.be.disabled');
    });

    it('Officer should be able to reorder proposal with drag and drop', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            proposerId: initialDBData.users.user1.id,
          });

          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 5,
            submitted: true,
            reviewerId: 0,
          });

          cy.assignProposalsToInstrument({
            instrumentId: createdInstrumentId,
            proposals: [
              {
                callId: initialDBData.call.id,
                primaryKey: createdProposal.primaryKey,
              },
            ],
          });

          cy.assignProposalsToSep({
            sepId: createdSepId,
            proposals: [
              {
                callId: initialDBData.call.id,
                primaryKey: createdProposal.primaryKey,
              },
            ],
          });

          // Manually changing the proposal status to be shown in the SEPs. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.sepReview.id,
            proposals: [
              {
                callId: initialDBData.call.id,
                primaryKey: createdProposal.primaryKey,
              },
            ],
          });
        }
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[data-cy="drag-icon"]').first().as('firstDragIcon');
      cy.get('[data-cy="drag-icon"]').last().as('secondDragIcon');
      cy.get('@firstDragIcon').trigger('dragstart');

      cy.get('@secondDragIcon').trigger('dragenter');

      cy.get('.droppableAreaRow')
        .should('exist')
        .and('include.text', 'Drop here');

      cy.get('@secondDragIcon').trigger('dragend');
      cy.finishedLoading();

      cy.notification({
        variant: 'success',
        text: 'Reordering of proposals saved successfully',
      });
    });

    it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
    });

    it('Officer should be able to edit SEP Meeting form', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Officer should be able to see calculated availability time on instrument per SEP inside meeting components', () => {
      cy.setInstrumentAvailabilityTime({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        availabilityTime: 50,
      });
      cy.createProposal({ callId: initialDBData.call.id }).then(
        (proposalResult) => {
          const createdProposal = proposalResult.createProposal.proposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
            });
            cy.createSep({
              code: sep2.code,
              description: sep2.description,
              active: true,
              numberRatingsRequired: 2,
            }).then((sepResult) => {
              if (sepResult.createSEP.sep) {
                cy.assignProposalsToSep({
                  sepId: sepResult.createSEP.sep.id,
                  proposals: [
                    {
                      callId: initialDBData.call.id,
                      primaryKey: createdProposal.primaryKey,
                    },
                  ],
                });
              }
            });

            cy.assignProposalsToInstrument({
              instrumentId: createdInstrumentId,
              proposals: [
                {
                  callId: initialDBData.call.id,
                  primaryKey: createdProposal.primaryKey,
                },
              ],
            });
          }
        }
      );

      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[data-cy="SEP-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', '25');
    });

    it('Officer should be able to set SEP time allocation', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-sep-time-allocation"]').click();

      cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

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

      cy.get('[data-cy="edit-sep-time-allocation"]').click();
      cy.get('@timeAllocation').should('have.value', '9999');
      cy.get('@timeAllocation').clear();
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.get('body').should('not.contain', '9999 (Overwritten)');

      cy.closeModal();
    });

    it('should use SEP time allocation (if set) when calculating if they fit in available time', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

      cy.get('[aria-label="View proposal details"]').click();

      cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
      cy.get('[data-cy="edit-sep-time-allocation"]').click();

      cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

      cy.get('@timeAllocation').should('be.empty');
      cy.get('@timeAllocation').type('15');
      cy.get('[data-cy="save-time-allocation"]').click();

      cy.finishedLoading();

      cy.contains('15 (Overwritten)');

      cy.closeModal();

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('not.have.css', 'background-color', 'rgb(246, 104, 94)');
    });

    it('Officer should be able to submit an instrument if all proposals SEP meetings are submitted in existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[aria-label="View proposal details"]').first().click();

      cy.get('[role="dialog"] > header + div').scrollTo('top');

      cy.setTinyMceContent('commentForUser', 'Test');
      cy.setTinyMceContent('commentForManagement', 'Test');

      cy.get('[data-cy="is-sep-meeting-submitted"]').click();
      cy.get('[data-cy="saveAndContinue"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP meeting decision submitted successfully',
      });

      cy.get("[aria-label='Submit instrument']").first().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Instrument submitted',
      });

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .find('td')
        .eq(6)
        .should('not.contain.text', '-')
        .should('contain.text', '1');

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[aria-label="Submit instrument"] button').should('be.disabled');
    });

    it('Officer should be able to edit SEP Meeting form after instrument is submitted', () => {
      cy.saveSepMeetingDecision({
        saveSepMeetingDecisionInput: {
          proposalPk: createdProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
        },
      });
      cy.submitInstrument({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        sepId: createdSepId,
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[aria-label="Submit instrument"] button').should('be.disabled');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Download SEP is working with dialog window showing up', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();

      cy.finishedLoading();

      cy.get('[data-cy="download-sep-xlsx"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains('call 1');
    });

    it('Officer should be able to remove assigned SEP member from proposal in existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.get('[data-cy="sep-reviewer-assignments-table"] table tbody tr').as(
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

      cy.get('@rows').should('not.contain.text', sepMembers.reviewer.lastName);

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains('SEP_MEMBER_REMOVED_FROM_PROPOSAL');
    });

    it('Officer should be able to remove assigned proposal from existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();
      cy.contains('Loading...').should('not.exist');

      cy.get('[aria-label="Remove assigned proposal"]').click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Assignment removed',
      });

      cy.closeNotification();

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains('Assignments').click();

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="sep-assignments-table"]')
        .find('tbody td')
        .last()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });
  });

  describe('SEP Chair role', () => {
    beforeEach(() => {
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.chair.id,
          roleId: UserRole.SEP_CHAIR,
        },
      });

      cy.login(sepMembers.chair);
      cy.changeActiveRole(initialDBData.roles.sepChair);
    });
    it('SEP Chair should be able to edit SEP Meeting form', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('SEP Chair should not be able to edit SEP Meeting form after instrument is submitted', () => {
      cy.saveSepMeetingDecision({
        saveSepMeetingDecisionInput: {
          proposalPk: createdProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
        },
      });
      cy.submitInstrument({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        sepId: createdSepId,
      });
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();
      cy.get('[aria-label="Submit instrument"] button').should('be.disabled');

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

    it('SEP Chair should not be able to remove assigned proposal from existing SEP', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });
  });

  describe('SEP Secretary role', () => {
    beforeEach(() => {
      cy.updateUserRoles({
        id: sepMembers.secretary.id,
        roles: [initialDBData.roles.sepReviewer],
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.secretary.id,
          roleId: UserRole.SEP_SECRETARY,
        },
      });

      cy.login(sepMembers.secretary);
      cy.changeActiveRole(initialDBData.roles.sepSecretary);
    });

    it('SEP Secretary should be able to edit SEP Meeting form', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('SEP Secretary should not be able to edit SEP Meeting form after instrument is submitted', () => {
      cy.saveSepMeetingDecision({
        saveSepMeetingDecisionInput: {
          proposalPk: createdProposalPk,
          submitted: true,
          recommendation: ProposalEndStatus.ACCEPTED,
        },
      });
      cy.submitInstrument({
        callId: initialDBData.call.id,
        instrumentId: createdInstrumentId,
        sepId: createdSepId,
      });
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Meeting Components').click();
      cy.finishedLoading();
      cy.get('[aria-label="Submit instrument"] button').should('be.disabled');

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

    it('SEP Secretary should not be able to remove assigned proposal from existing SEP', () => {
      cy.visit(`/SEPPage/${createdSepId}`);

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });
  });

  describe('SEP Reviewer role', () => {
    beforeEach(() => {
      cy.updateUserRoles({
        id: sepMembers.reviewer2.id,
        roles: [initialDBData.roles.sepReviewer],
      });
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer2.id],
      });
    });

    it('SEP Reviewer should not be able to see reviews he/she is not a direct reviewer', () => {
      cy.login(sepMembers.reviewer2);
      cy.visit('/');
      cy.get('main table tbody').contains('No records to display');
    });

    it('SEP Reviewer should be able to give review', () => {
      cy.login(sepMembers.reviewer);
      cy.visit('/');
      cy.finishedLoading();
      cy.get('[data-cy="grade-proposal-icon"]').click();
      cy.get('[data-cy=save-grade]').click();
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
      cy.get('[data-cy=save-grade]').click();
      cy.contains('comment is a required field');
      cy.setTinyMceContent('comment', faker.lorem.words(3));
      cy.get('[data-cy=save-grade]').click();
      cy.notification({ variant: 'success', text: 'Updated' });
    });
  });
});
