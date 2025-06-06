import { faker } from '@faker-js/faker';
import {
  FeatureId,
  ProposalEndStatus,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const coProposer = initialDBData.users.user2;
const visitor = initialDBData.users.user3;
const PI = initialDBData.users.user1;
const existingProposalId = initialDBData.proposal.id;
const acceptedStatus = ProposalEndStatus.ACCEPTED;
const existingExperimentPk = initialDBData.experiments.upcoming.experimentPk;

const proposalEsiIconCyTag = 'finish-experiment-safety-form-icon';

const sampleTitle = /My sample title/i;
const newSampleTitle = faker.lorem.words(2);
const clonedSampleTitle = faker.lorem.words(2);

const proposal = {
  title: faker.random.words(3),
  abstract: faker.random.words(5),
};

context('visits tests', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.RISK_ASSESSMENT)) {
        this.skip();
      }
    });
    cy.updateProposal({
      proposalPk: existingProposalId,
      title: proposal.title,
      abstract: proposal.abstract,
      proposerId: PI.id,
      users: [coProposer.id],
    });
    cy.updateProposalManagementDecision({
      proposalPk: existingProposalId,
      finalStatus: acceptedStatus,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
      managementDecisionSubmitted: true,
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      experimentPk: existingExperimentPk,
    });
  });

  it('PI should see ESI assessment button ', () => {
    cy.login(PI);
    cy.visit('/');

    cy.testActionButton(proposalEsiIconCyTag, 'active');
  });

  it('Co-proposer should see ESI button ', () => {
    cy.login(coProposer);
    cy.visit('/');

    cy.testActionButton(proposalEsiIconCyTag, 'active');
  });

  it('Visitor should not see ESI button', () => {
    cy.login(visitor);
    cy.visit('/');

    cy.testActionButton(proposalEsiIconCyTag, 'invisible');
  });

  it('Should be able to complete ESI', () => {
    cy.login('user1');
    cy.visit('/');

    cy.get('[data-cy=upcoming-experiments]')
      .contains(initialDBData.experiments.upcoming.startsAt)
      .closest('tr')
      .find(`[data-cy='${proposalEsiIconCyTag}']`)
      .closest('button')
      .click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(sampleTitle)
      .closest('li')
      .find('[data-cy=select-sample-chk]')
      .click();
    cy.get(
      '[data-cy=sample-esi-modal] [data-cy=save-and-continue-button]'
    ).click();
    cy.get('[data-cy=submit-esi-button]').should('be.disabled');
    cy.get('[data-cy=confirm-sample-correct-cb]').click();
    cy.get('[data-cy=submit-esi-button]').should('not.be.disabled');
    cy.get('[data-cy=sample-esi-modal] [data-cy=submit-esi-button]').click();

    // Add new sample
    cy.get('[data-cy=add-sample-btn]').click();

    cy.get('[data-cy=prompt-input]').type(newSampleTitle);
    cy.get('[data-cy=prompt-ok]').click();

    // Abort new sample esi declaration
    cy.get('[data-cy=sample-esi-modal]'); // wait until modal is visible
    cy.get('body').type('{esc}');
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .contains('Unfinished declaration'); // ESI not finished
    cy.get('[data-cy=save-and-continue-button]').click();
    cy.contains('All experiment safety inputs must be completed');

    // Resume new sample esi declaration
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=edit-esi-btn]')
      .click();

    cy.get(
      '[data-cy=sample-esi-modal] [data-cy=save-and-continue-button]'
    ).click();
    cy.get('[data-cy=confirm-sample-correct-cb]').click();
    cy.get('[data-cy=sample-esi-modal] [data-cy=submit-esi-button]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .contains('Ready'); // ESI finished

    // Clone sample esi declaration and then delete it
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=clone-sample-btn]')
      .click();

    cy.get('[data-cy=prompt-input]').clear().type(clonedSampleTitle);
    cy.get('[data-cy=prompt-ok]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .closest('li')
      .contains('Unfinished declaration');
    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .closest('li')
      .find('[data-cy=delete-sample-btn]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .should('not.exist');

    // Revoke ESI
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=select-sample-chk]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .should('not.contain', 'Ready'); // ESI not finished

    // Delete new sample
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=delete-sample-btn]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .should('not.exist');
    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains(sampleTitle).should('exist'); // sample should ve visible in the review page

    cy.get('[data-cy=submit-proposal-esi-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();
  });

  it('Co-proposer should see that risk assessment is completed', () => {
    cy.createOrGetExperimentSafety({
      experimentPk: existingExperimentPk,
    }).then((result) => {
      if (result.createExperimentSafety) {
        cy.submitExperimentSafety({
          experimentSafetyPk: result.createExperimentSafety.experimentSafetyPk,
          isSubmitted: true,
        });
      }
    });
    cy.login(coProposer);
    cy.visit('/');

    cy.testActionButton(proposalEsiIconCyTag, 'completed');
  });
});
