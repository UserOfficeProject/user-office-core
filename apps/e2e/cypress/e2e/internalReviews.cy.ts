import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const scientist1 = initialDBData.users.user1;
const scientist2 = initialDBData.users.user2;
const instrument1 = {
  name: faker.random.words(2),
  shortCode: faker.random.alphaNumeric(15),
  description: faker.random.words(5),
  managerUserId: scientist1.id,
};
const proposal1 = {
  title: faker.random.words(2),
  abstract: faker.random.words(5),
};
let createdInstrumentId: number;
let createdProposalPk: number;
let technicalReviewId: number;
let numberOfScientistsAndManagerAssignedToCreatedInstrument: number;

context('Internal Review tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }

      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: scientist1.id,
          roles: [
            initialDBData.roles.instrumentScientist,
            initialDBData.roles.internalReviewer,
          ],
        });
        cy.updateUserRoles({
          id: scientist2.id,
          roles: [
            initialDBData.roles.instrumentScientist,
            initialDBData.roles.internalReviewer,
          ],
        });
      }
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrumentId }],
          });
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal1.title,
            abstract: proposal1.abstract,
          });
        }
      });

      numberOfScientistsAndManagerAssignedToCreatedInstrument = 2;
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist1.id],
      });
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist2.id],
      });
      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      }).then(() => {
        // NOTE: Get the technical review id for later usage.
        cy.updateTechnicalReviewAssignee({
          proposalPks: [createdProposalPk],
          userId: scientist1.id,
          instrumentId: createdInstrumentId,
        }).then((result) => {
          technicalReviewId = result.updateTechnicalReviewAssignee[0].id;
        });
      });
    });
  });

  it('User should not be able to see internal reviews page', () => {
    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

    cy.get('@userMenuItems').should('not.contain', 'Review Proposals');
    cy.get('@userMenuItems').should('not.contain', 'Review Proposals');
  });

  it('User Officer should be able to create an internal review', () => {
    const title = faker.random.words(2);
    const comment = faker.lorem.paragraph(3);

    cy.login('officer');
    cy.visit('/');

    cy.contains(proposal1.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.finishedLoading();

    cy.get('[role="tab"]').contains('Technical review').click();
    cy.get('[data-cy="internal-reviews-accordion"]').click();

    cy.get('[data-cy="internal-reviews-accordion"]')
      .find('[data-cy="create-new-entry"]')
      .click();

    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="title"] input')
      .clear()
      .type(title);
    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="internal-reviewer"] input')
      .click();

    // TODO due to how stfc manages users this check will not work in STFC for now
    // See https://github.com/UserOfficeProject/user-office-project-issue-tracker/issues/970
    if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
      cy.get('[data-cy="internal-reviewer-options"] li').should(
        'have.length',
        numberOfScientistsAndManagerAssignedToCreatedInstrument
      );
    }

    cy.get('[data-cy="internal-reviewer-options"]')
      .contains(scientist2.firstName)
      .click();

    cy.setTinyMceContent('internal_review_comment', comment);

    cy.get('[data-cy="create-modal"]').find('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.get('[data-cy="internal-reviews-table"]').contains(title);
    cy.get('[data-cy="internal-reviews-table"]').contains(scientist2.firstName);
  });

  it('User Officer should be able to update an internal review', () => {
    const title = faker.random.words(2);
    const comment = faker.lorem.paragraph(3);
    const newTitle = faker.random.words(2);

    cy.createInternalReview({
      input: {
        title: title,
        comment: comment,
        reviewerId: scientist1.id,
        technicalReviewId: technicalReviewId,
      },
    });

    cy.login('officer');
    cy.visit('/');

    cy.contains(proposal1.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.finishedLoading();

    cy.get('[role="tab"]').contains('Technical review').click();
    cy.get('[data-cy="internal-reviews-accordion"]').click();

    cy.get('[data-cy="internal-reviews-table"]').contains(title);
    cy.get('[data-cy="internal-reviews-table"]').contains(scientist1.firstName);

    cy.get('[data-cy="internal-reviews-table"]')
      .contains(title)
      .parent()
      .find('[aria-label="Edit"]')
      .click();

    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="title"] input')
      .clear()
      .type(newTitle);

    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="internal-reviewer"] input')
      .click();

    cy.get('[data-cy="internal-reviewer-options"]')
      .contains(scientist2.firstName)
      .click();

    cy.get('[data-cy="create-modal"]').find('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.get('[data-cy="internal-reviews-table"]').contains(newTitle);
    cy.get('[data-cy="internal-reviews-table"]').contains(scientist2.firstName);
  });

  it('User Officer should be able to delete internal review', () => {
    const title = faker.random.words(2);
    const comment = faker.lorem.paragraph(3);

    cy.createInternalReview({
      input: {
        title: title,
        comment: comment,
        reviewerId: scientist1.id,
        technicalReviewId: technicalReviewId,
      },
    });

    cy.login('officer');
    cy.visit('/');

    cy.contains(proposal1.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.finishedLoading();

    cy.get('[role="tab"]').contains('Technical review').click();
    cy.get('[data-cy="internal-reviews-accordion"]').click();

    cy.get('[data-cy="internal-reviews-table"]')
      .contains(title)
      .parent()
      .find('[aria-label="Delete"]')
      .click();
    cy.get('[aria-label="Save"]').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.get('[data-cy="internal-reviews-table"]').should('not.contain', title);
    cy.get('[data-cy="internal-reviews-table"]').should(
      'not.contain',
      scientist1.firstName
    );
  });

  it('Internal reviewer should be able to add their review', () => {
    const title = faker.random.words(2);
    const comment = faker.lorem.paragraph(3);
    const newComment = faker.lorem.paragraph(3);

    cy.createInternalReview({
      input: {
        title: title,
        comment: comment,
        reviewerId: scientist1.id,
        technicalReviewId: technicalReviewId,
      },
    });

    cy.login('user1');
    cy.visit('/');

    cy.changeActiveRole(initialDBData.roles.internalReviewer);

    cy.contains(proposal1.title)
      .parent()
      .find('[data-cy="edit-technical-review"]')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="internal-reviews-accordion"]').click();

    cy.get('[data-cy="internal-reviews-table"]')
      .contains(title)
      .parent()
      .find('[aria-label="Edit"]')
      .click();

    cy.setTinyMceContent('internal_review_comment', newComment);

    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="title"] input')
      .should('not.exist');

    cy.get('[data-cy="create-modal"]')
      .find('[data-cy="title"]')
      .should('have.text', title);

    // NOTE: For some reason one click on the update button is not enough. Probably because of tinymce content setting.
    cy.get('[data-cy="create-modal"]').find('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.get('[data-cy="internal-reviews-table"]').contains(title);

    cy.get('[data-cy="internal-reviews-table"]')
      .contains(title)
      .parent()
      .find('[aria-label="Edit"]')
      .click();

    cy.getTinyMceContent('internal_review_comment').then((content) =>
      expect(content).to.have.string(newComment)
    );
  });
});
