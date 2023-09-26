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
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import { updatedCall } from '../support/utils';

const sepMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user3,
  reviewer: initialDBData.users.reviewer,
  reviewer2: initialDBData.users.user3,
};

function readWriteReview(
  { shouldSubmit, isReviewer } = { shouldSubmit: false, isReviewer: false }
) {
  cy.get('[role="dialog"]').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information', { matchCase: false });
  cy.get('@dialog').contains('Technical review');
  cy.get('@dialog').contains('Grade');

  cy.setTinyMceContent('comment', faker.lorem.words(3));

  cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

  cy.get('[role="listbox"] > [role="option"]').first().click();

  if (shouldSubmit) {
    if (isReviewer) {
      cy.get('[data-cy="submit-grade"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
    } else {
      cy.get('[data-cy="is-grade-submitted"]').click();
    }
  }

  if (!isReviewer) {
    cy.get('@dialog').contains('Save').click();
    cy.notification({ variant: 'success', text: 'Updated' });
  }

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

function updateUsersRoles() {
  if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
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
}

const instrumentAvailabilityTime = 20;
const firstProposalTimeAllocation = 25;
const secondProposalTimeAllocation = 5;

const sep1 = {
  code: faker.lorem.word(10),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

const sep2 = {
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

let createdSepId: number;
let createdProposalPk: number;
let createdProposalId: string;
let createdWorkflowId: number;
let createdEsiTemplateId: number;

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
  cy.createSep({
    code: sep1.code,
    description: sep1.description,
    numberRatingsRequired: 2,
    gradeGuide: sep1.gradeGuide,
    active: true,
  }).then((result) => {
    if (result.createSEP) {
      createdSepId = result.createSEP.id;
    }
  });
  cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
    const createdProposal = result.createProposal;
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
  createWorkflowAndEsiTemplate();
}

context('SEP reviews tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SEP_REVIEW)) {
        this.skip();
      }
      updateUsersRoles();
    });
    initializationBeforeTests();
  });

  describe('User officer role', () => {
    it('Copy to clipboard should work for Code in SEPs page', () => {
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(createdProposalId).realClick();

      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          cy.get('[role="alert"]').should('contain', text);
        });
      });
    });

    it('Officer should be able to assign proposal to existing SEP', function () {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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

      // NOTE: Check first for empty list because call has no SEPs assigned.
      cy.get('[role="presentation"] .MuiAutocomplete-noOptions').contains(
        'No SEPs'
      );

      // NOTE: Assign SEP to a call.
      cy.updateCall({
        id: initialDBData.call.id,
        ...updatedCall,
        proposalWorkflowId: createdWorkflowId,
        esiTemplateId: createdEsiTemplateId,
        seps: [createdSepId],
      });

      cy.reload();

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

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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
      cy.assignProposalsToSep({
        sepId: createdSepId,
        proposals: [
          { callId: initialDBData.call.id, primaryKey: createdProposalPk },
        ],
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[data-cy="assign-sep-member"]').first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.reviewer.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.get('[data-cy="confirmation-dialog"]').contains(
        'Are you sure you want to assign all selected users to the SEP proposal?'
      );

      cy.get('[data-cy="confirm-ok"]').click();

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      readWriteReview({ shouldSubmit: true, isReviewer: false });

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
      cy.on('uncaught:exception', (err) => {
        expect(err.message).to.include(
          'Failed to delete proposal because, it has dependencies which need to be deleted first'
        );

        // return false to prevent the error from
        // failing this test
        return false;
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
      const loggedInUser = window.localStorage.getItem('user');

      if (!loggedInUser) {
        throw new Error('No logged in user');
      }

      const loggedInUserParsed = JSON.parse(loggedInUser) as UserJwt;

      // NOTE: Change organization before assigning to avoid warning in the SEP reviewers assignment
      cy.updateUserDetails({
        ...loggedInUserParsed,
        organisation: 2,
        telephone: faker.phone.number('+4670#######'),
        user_title: 'Dr.',
        gender: 'male',
        nationality: 1,
        birthdate: new Date('2000/01/01'),
        department: 'IT',
        position: 'Dirrector',
      } as UpdateUserMutationVariables);

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[data-cy="assign-sep-member"]').first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.chair.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(sepMembers.chair.lastName);

      cy.get('[role="tablist"] [role="tab"]').contains('Members').click();

      cy.get('[data-cy="sep-chair-reviews-info"]').should(
        'have.attr',
        'aria-label',
        'Number of proposals to review: 1'
      );
    });

    it('SEP Chair should be able to see proposal details in modal inside proposals and assignments', () => {
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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

    it('SEP Chair should be able to read/write/submit non-submitted reviews', () => {
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('not.exist');
      readWriteReview();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.get('[data-cy="submit-grade"]').click();

      cy.get('[data-cy="confirm-ok"]').click();
      cy.finishedLoading();

      cy.get('[data-cy="save-grade"]').should('be.disabled');
      cy.get('[data-cy="submit-grade"]').should('be.disabled');
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
      const loggedInUser = window.localStorage.getItem('user');

      if (!loggedInUser) {
        throw new Error('No logged in user');
      }

      const loggedInUserParsed = JSON.parse(loggedInUser) as UserJwt;

      // NOTE: Change organization before assigning to avoid warning in the SEP reviewers assignment
      cy.updateUserDetails({
        ...loggedInUserParsed,
        organisation: 2,
        telephone: faker.phone.number('+4670#######'),
        telephone_alt: faker.phone.number('+4670#######'),
        user_title: 'Dr.',
        gender: 'male',
        nationality: 1,
        birthdate: new Date('2000/01/01'),
        department: 'IT',
        position: 'Dirrector',
      } as UpdateUserMutationVariables);

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[data-cy="assign-sep-member"]').first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains(sepMembers.secretary.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.contains(sepMembers.secretary.lastName);

      cy.get('[role="tablist"] [role="tab"]').contains('Members').click();

      cy.get('[data-cy="sep-secretary-reviews-info"]').should(
        'have.attr',
        'aria-label',
        'Number of proposals to review: 1'
      );
    });

    it('SEP Secretary should be able to read/write non-submitted reviews', () => {
      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
      });

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();
      cy.get('[data-cy="is-grade-submitted"]').should('not.exist');
      readWriteReview();

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.get('[data-cy="submit-grade"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.finishedLoading();

      cy.get('[data-cy="save-grade"]').should('be.disabled');
      cy.get('[data-cy="submit-grade"]').should('be.disabled');
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
        memberIds: [sepMembers.reviewer2.id],
        proposalPk: createdProposalPk,
      });

      cy.assignSepReviewersToProposal({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
        proposalPk: createdProposalPk,
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

          cy.assignProposalsToSep({
            sepId: createdSepId,
            proposals: [
              { callId: initialDBData.call.id, primaryKey: createdProposal2Pk },
            ],
          });
          cy.assignSepReviewersToProposal({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer.id],
            proposalPk: createdProposal2Pk,
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
                sepID: createdSepId,
              });
            }
          });
        }
      });
      cy.login(sepMembers.reviewer);
      cy.visit('/');
    });

    it('SEP Reviewer should be able to filter their reviews by status and bulk submit them', () => {
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

    it('SEP Reviewer should be able to see SEPs he is part of', () => {
      cy.get('[data-cy="SEPRoles-menu-items"]').contains('SEPs').click();

      cy.finishedLoading();

      cy.get('[data-cy="SEPs-table"]')
        .contains(sep1.code)
        .closest('tr')
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[role="tablist"] [role="tab"]').should('have.length', 1);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="sep-reviewer-assignments-table"]').should(
        'not.contain',
        sepMembers.reviewer2.firstName
      );

      cy.contains(sepMembers.reviewer.lastName)
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.getProposalReviews({
        proposalPk: createdProposalPk,
      }).then(({ proposalReviews }) => {
        if (proposalReviews) {
          cy.updateReview({
            reviewID: proposalReviews[0].id,
            comment: faker.random.words(5),
            grade: 5,
            status: ReviewStatus.SUBMITTED,
            sepID: createdSepId,
          });
        }
      });

      readWriteReview({ shouldSubmit: true, isReviewer: true });

      cy.finishedLoading();

      cy.contains(sepMembers.reviewer.lastName).parent().contains('SUBMITTED');
      cy.contains(sepMembers.reviewer2.lastName).parent().contains('SUBMITTED');
    });
  });
});

context('SEP meeting components tests', () => {
  let createdInstrumentId: number;

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SEP_REVIEW)) {
        this.skip();
      }
      updateUsersRoles();
    });
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
      timeAllocation: firstProposalTimeAllocation,
      submitted: true,
      reviewerId: 0,
    });
    cy.createInstrument(instrument).then((result) => {
      const createdInstrument = result.createInstrument;
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
          availabilityTime: instrumentAvailabilityTime,
        });
      }
    });
    // NOTE: Assign SEP to a call.
    cy.updateCall({
      id: initialDBData.call.id,
      ...updatedCall,
      proposalWorkflowId: createdWorkflowId,
      esiTemplateId: createdEsiTemplateId,
      seps: [createdSepId],
    });
  });

  describe('User Officer role', () => {
    it('Officer should be able to assign proposal to instrument and instrument to call to see it in meeting components', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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

    it('Only one modal should be open when multiple instruments with proposals are expanded', () => {
      cy.createInstrument(instrument).then((result) => {
        const createdInstrument2Id = result.createInstrument.id;
        if (createdInstrument2Id) {
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentIds: [createdInstrument2Id],
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

                cy.assignProposalsToInstrument({
                  instrumentId: createdInstrument2Id,
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
            }
          );
        }
      });

      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get('[aria-label="Detail panel visibility toggle"]').last().click();

      cy.contains(proposal1.title)
        .parent()
        .parent()
        .find('[aria-label="View proposal details"]')
        .click();

      cy.get('[role="presentation"][data-cy="SEP-meeting-modal"]')
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

          cy.addProposalTechnicalReview({
            proposalPk: createdProposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: secondProposalTimeAllocation,
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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.finishedLoading();

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal1.title);

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal2.title);

      cy.get('[data-cy="drag-icon"]').first().as('firstDragIcon');
      cy.get('[data-cy="drag-icon"]').last().as('secondDragIcon');
      cy.get('@firstDragIcon').trigger('dragstart');

      cy.get('@secondDragIcon').trigger('dragenter');

      cy.get('@secondDragIcon').trigger('dragend');

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] [role="progressbar"]'
      ).should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'Reordering of proposals saved successfully',
      });

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal2.title);

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .should(
          'have.attr',
          'unallocated-time-information',
          `Unallocated time: ${
            instrumentAvailabilityTime - secondProposalTimeAllocation
          } ${initialDBData.call.allocationTimeUnit}s`
        );

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal1.title);
    });

    it('Proposals in SEP meeting components should be ordered by standard deviation as second order parameter if there is no ranking', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal2.title,
            abstract: proposal2.abstract,
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

          cy.assignReviewersToSep({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer2.id],
          });
          cy.assignSepReviewersToProposal({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer2.id],
            proposalPk: createdProposalPk,
          });
          cy.assignSepReviewersToProposal({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer.id],
            proposalPk: createdProposal.primaryKey,
          });
          cy.assignSepReviewersToProposal({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer2.id],
            proposalPk: createdProposal.primaryKey,
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

          cy.getProposalReviews({
            proposalPk: createdProposalPk,
          }).then(({ proposalReviews }) => {
            if (proposalReviews) {
              proposalReviews.forEach((review, index) => {
                cy.updateReview({
                  reviewID: review.id,
                  comment: faker.random.words(5),
                  // NOTE: Make first proposal with lower standard deviation. Grades are 2 and 4
                  grade: index ? 2 : 4,
                  status: ReviewStatus.SUBMITTED,
                  sepID: createdSepId,
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
                  sepID: createdSepId,
                });
              });
            }
          });
        }
      });
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();

      cy.finishedLoading();

      // NOTE: Proposal with higher standard deviation but same average score should be shown first on initial sort
      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .first()
        .contains(proposal2.title);

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
        .last()
        .contains(proposal1.title);
    });

    it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
    });

    it('Officer should be able to edit SEP Meeting form', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
          const createdProposal = proposalResult.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });
            cy.createSep({
              code: sep2.code,
              description: sep2.description,
              active: true,
              numberRatingsRequired: 2,
              gradeGuide: sep2.gradeGuide,
            }).then((sepResult) => {
              if (sepResult.createSEP) {
                cy.assignProposalsToSep({
                  sepId: sepResult.createSEP.id,
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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[data-cy="SEP-meeting-components-table"] tbody tr:first-child td')
        .eq(5)
        .should('have.text', firstProposalTimeAllocation);
      cy.get('[data-cy="SEP-meeting-components-table"] thead').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );
      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get(
        '[data-cy="SEP-meeting-components-table"] [data-cy="sep-instrument-proposals-table"] thead'
      ).should('include.text', initialDBData.call.allocationTimeUnit);
    });

    it('Officer should be able to set SEP time allocation', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      const newSepTimeAllocation = 15;
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

      cy.get(
        '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
      ).should('have.attr', 'unallocated-time-information', '');

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

      cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr:last-child')
        .first()
        .should(
          'have.attr',
          'unallocated-time-information',
          `Unallocated time: ${
            instrumentAvailabilityTime - newSepTimeAllocation
          } ${initialDBData.call.allocationTimeUnit}s`
        );
    });

    it('Officer should be able to submit an instrument if all proposals SEP meetings are submitted in existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[aria-label="Submit instrument"] button').should('be.disabled');

      cy.get('[aria-label="Detail panel visibility toggle"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="View proposal details"]').click();

      editFinalRankingForm();
    });

    it('Download SEP is working with dialog window showing up', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

      cy.finishedLoading();

      cy.get('[data-cy="download-sep-xlsx"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        updatedCall.shortCode
      );
    });

    it('Officer should be able to remove assigned SEP member from proposal in existing SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="remove-assigned-sep-proposal"]').click();

      cy.get('[data-cy="confirmation-dialog"]')
        .should('exist')
        .and('contain.text', 'Remove SEP assignment');

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Assignment/s removed',
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

    it('Officer should be able to download SEP proposal as pdf', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-sep-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposal1.title
      );
    });

    it('Officer should be able to add custom grade guide when creating SEP', () => {
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get('[data-cy="grade-proposal-icon"]').click();
      cy.get('[data-cy="grade-guide"]').click();

      cy.contains(sep1.gradeGuide).should('not.exist');

      cy.visit(`/SEPPage/${createdSepId}?`);

      cy.finishedLoading();

      cy.get('[data-cy="custom-grade-guide"]').click();
      cy.get('[data-cy="submit"]').click();

      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Detail panel visibility toggle"]').click();
      cy.get('[data-cy="grade-proposal-icon"]').click();
      cy.get('[data-cy="grade-guide"]').click();

      cy.contains(sep1.gradeGuide);
    });

    it('Officer should be able to bulk download SEP proposals as pdf', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then(
        (proposalResult) => {
          const createdProposal = proposalResult.createProposal;
          if (createdProposal) {
            cy.updateProposal({
              proposalPk: createdProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });
            cy.createSep({
              code: sep2.code,
              description: sep2.description,
              active: true,
              numberRatingsRequired: 2,
              gradeGuide: sep2.gradeGuide,
            }).then((sepResult) => {
              if (sepResult.createSEP) {
                cy.assignProposalsToSep({
                  sepId: sepResult.createSEP.id,
                  proposals: [
                    {
                      callId: initialDBData.call.id,
                      primaryKey: createdProposal.primaryKey,
                    },
                  ],
                });
              }
            });
          }
        }
      );
      cy.login('officer');
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get(
        '[data-cy="sep-assignments-table"] [data-cy="select-all-table-rows"]'
      ).click();

      cy.get('[data-cy="download-sep-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposal1.title
      );
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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });
  });

  describe('SEP Secretary role', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: sepMembers.secretary.id,
          roles: [initialDBData.roles.sepReviewer],
        });
      }
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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=3`);

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
      cy.visit(`/SEPPage/${createdSepId}?tab=2`);

      cy.finishedLoading();

      cy.get('[aria-label="Remove assigned proposal"]').should('not.exist');
    });
  });

  describe('SEP Reviewer role', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: sepMembers.reviewer2.id,
          roles: [initialDBData.roles.sepReviewer],
        });
      }
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

  it('SEP Reviewer should be able to give non integer review', () => {
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

    cy.login(sepMembers.reviewer);
    cy.visit('/');
    cy.finishedLoading();

    cy.get('[data-cy="grade-proposal-icon"]').click();

    cy.setTinyMceContent('comment', faker.lorem.words(3));
    cy.get('#grade-proposal').type('0.001');

    cy.get('[data-cy="save-grade"]').click();

    cy.contains('Lowest grade is 1');

    cy.get('#grade-proposal').clear().type('1.001');

    cy.get('[data-cy="save-grade"]').click();

    cy.get('[data-cy="grade-proposal"] input').then(($input) => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
        'Please enter a valid value. The two nearest valid values are 1 and 1.01.'
      );
    });

    cy.get('#grade-proposal').clear().type('1.01');

    cy.get('[data-cy=save-grade]').click();
    cy.notification({ variant: 'success', text: 'Updated' });
  });
});
