import {
  CreateVisitMutation,
  FeatureId,
  ProposalEndStatus,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

type TaskId =
  | 'formTeam'
  | 'finishEsi'
  | 'registerVisit'
  | 'declareShipment'
  | 'giveFeedback';

const PI = initialDBData.users.user1;
const visitor = initialDBData.users.user3;
const activeExperiment = initialDBData.experiments.upcoming;
const completedExperiment = initialDBData.experiments.completed;

const openMobileDashboard = (user: 'user1' | 'user2' | 'user3') => {
  cy.viewport('iphone-x');
  cy.login(user);
  cy.visit('/');
  cy.finishedLoading();
  cy.get('[data-cy="dashboard-section-experiments"]').click();
};

const experimentCard = (experimentId: string) =>
  cy.contains('[data-cy="experiment-card"]', experimentId);

const taskRow = (experimentId: string, taskId: TaskId) =>
  experimentCard(experimentId).find(`[data-cy="experiment-task-${taskId}"]`);

const shouldBeEnabled = (experimentId: string, taskId: TaskId) =>
  taskRow(experimentId, taskId)
    .should('not.have.class', 'Mui-disabled')
    .and('not.have.attr', 'aria-disabled');

const shouldBeDisabled = (experimentId: string, taskId: TaskId) =>
  taskRow(experimentId, taskId)
    .should('have.class', 'Mui-disabled')
    .and('have.attr', 'aria-disabled', 'true');

const shouldBeAbsent = (experimentId: string, taskId: TaskId) =>
  experimentCard(experimentId)
    .find(`[data-cy="experiment-task-${taskId}"]`)
    .should('not.exist');

context('Mobile experiment card tests', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (
        !featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER) ||
        !featureFlags.getEnabledFeatures().get(FeatureId.VISIT_MANAGEMENT)
      ) {
        this.skip();
      }
    });
  });

  describe('Action rows on the experiment card', () => {
    it('Shows the seeded state of an accepted proposal without a visit', () => {
      openMobileDashboard('user1');

      cy.get('[data-cy="experiment-card"]').should('have.length', 2);

      shouldBeEnabled(activeExperiment.experimentId, 'formTeam');
      shouldBeEnabled(activeExperiment.experimentId, 'finishEsi');
      shouldBeEnabled(activeExperiment.experimentId, 'declareShipment');
      shouldBeDisabled(activeExperiment.experimentId, 'registerVisit');
      shouldBeAbsent(activeExperiment.experimentId, 'giveFeedback');

      taskRow(activeExperiment.experimentId, 'registerVisit').should(
        'contain.text',
        'This action is disabled because visit is not defined'
      );
    });

    it('Locks the proposal-gated actions when the proposal is not accepted', () => {
      cy.updateProposalManagementDecision({
        proposalPk: activeExperiment.proposalPk,
        finalStatus: ProposalEndStatus.RESERVED,
        managementTimeAllocations: [
          { instrumentId: initialDBData.instrument1.id, value: 5 },
        ],
        managementDecisionSubmitted: false,
      });

      openMobileDashboard('user1');

      shouldBeDisabled(activeExperiment.experimentId, 'formTeam');
      shouldBeDisabled(activeExperiment.experimentId, 'finishEsi');
      shouldBeDisabled(activeExperiment.experimentId, 'declareShipment');
      shouldBeDisabled(activeExperiment.experimentId, 'registerVisit');
    });

    it('Completes the team step and unlocks the registration once a visit exists', () => {
      // createVisit inserts a visits_has_users row per team member, so the
      // registrations the card reads exist without a separate call.
      cy.createVisit({
        experimentPk: activeExperiment.experimentPk,
        team: [PI.id],
        teamLeadUserId: PI.id,
      });

      openMobileDashboard('user1');

      shouldBeEnabled(activeExperiment.experimentId, 'formTeam');
      taskRow(activeExperiment.experimentId, 'formTeam')
        .find('.MuiBadge-badge')
        .should('contain.text', '✔');

      shouldBeEnabled(activeExperiment.experimentId, 'registerVisit');
    });

    it('Shows the waiting state once the registration is submitted', () => {
      cy.createVisit({
        experimentPk: activeExperiment.experimentPk,
        team: [PI.id],
        teamLeadUserId: PI.id,
      }).then(({ createVisit: visit }: CreateVisitMutation) => {
        cy.submitVisitRegistration({ visitId: visit.id, userId: PI.id });
      });

      openMobileDashboard('user1');

      shouldBeEnabled(activeExperiment.experimentId, 'registerVisit');
      taskRow(activeExperiment.experimentId, 'registerVisit')
        .should('contain.text', 'The registration is pending approval')
        .find('.MuiBadge-dot')
        .should('have.css', 'background-color', 'rgb(255, 153, 0)');
    });

    it('Completes the registration step once it is approved', () => {
      cy.createVisit({
        experimentPk: activeExperiment.experimentPk,
        team: [PI.id],
        teamLeadUserId: PI.id,
      }).then(({ createVisit: visit }: CreateVisitMutation) => {
        cy.submitVisitRegistration({ visitId: visit.id, userId: PI.id });
        cy.approveVisitRegistration({
          visitRegistration: { visitId: visit.id, userId: PI.id },
        });
      });

      openMobileDashboard('user1');

      shouldBeEnabled(activeExperiment.experimentId, 'registerVisit');
      taskRow(activeExperiment.experimentId, 'registerVisit')
        .find('.MuiBadge-badge')
        .should('contain.text', '✔');
    });

    it('Hides the proposal actions from a visitor who is not on the proposal', () => {
      cy.createVisit({
        experimentPk: activeExperiment.experimentPk,
        team: [PI.id, visitor.id],
        teamLeadUserId: PI.id,
      });

      openMobileDashboard('user3');

      shouldBeAbsent(activeExperiment.experimentId, 'formTeam');
      shouldBeAbsent(activeExperiment.experimentId, 'finishEsi');
      shouldBeAbsent(activeExperiment.experimentId, 'giveFeedback');
      shouldBeEnabled(activeExperiment.experimentId, 'registerVisit');
      // NOTE: declareShipment is the only action with no PI or co-proposer
      // gate, so a plain visitor gets it too.
      shouldBeEnabled(activeExperiment.experimentId, 'declareShipment');
    });

    it('Offers feedback to the team lead only once the experiment is completed', () => {
      // The team lead is a property of the visit, so both experiments need one
      // before the completed status is the only thing separating them.
      cy.createVisit({
        experimentPk: activeExperiment.experimentPk,
        team: [PI.id],
        teamLeadUserId: PI.id,
      });
      cy.createVisit({
        experimentPk: completedExperiment.experimentPk,
        team: [PI.id],
        teamLeadUserId: PI.id,
      });

      openMobileDashboard('user1');

      shouldBeDisabled(activeExperiment.experimentId, 'giveFeedback');
      taskRow(activeExperiment.experimentId, 'giveFeedback').should(
        'contain.text',
        'This action is disabled because the experiment is not completed'
      );

      shouldBeEnabled(completedExperiment.experimentId, 'giveFeedback');
    });
  });

  describe('Following an action row', () => {
    it('Opens the shipment page from the shipment row', () => {
      openMobileDashboard('user1');

      taskRow(activeExperiment.experimentId, 'declareShipment').click();

      cy.url().should(
        'include',
        `/Experiments/${activeExperiment.experimentPk}/Shipments`
      );
    });

    it('Opens and closes the visit dialog from the team row', () => {
      openMobileDashboard('user1');

      taskRow(activeExperiment.experimentId, 'formTeam').click();

      cy.get('[role="dialog"]')
        .should('be.visible')
        .find('[data-cy="team-lead-user-dropdown"]')
        .should('exist');

      // The dialog is full screen at this width, so its only close control is
      // the back button in the mobile app bar.
      cy.get('[role="dialog"] [data-cy="mobile-app-bar-back"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('The rest of the experiments section', () => {
    it('Shows an empty state to a user with no upcoming experiments', () => {
      openMobileDashboard('user2');

      // Scoped to the experiments section: the hidden proposals panel renders an
      // empty state with a link of the same name.
      cy.get('[data-cy="upcoming-experiments"]')
        .find('[data-cy="card-empty-state"]')
        .should('be.visible');
      cy.get('[data-cy="upcoming-experiments"]')
        .find('[data-cy="empty-new-proposal-link"]')
        .should('be.visible');
      cy.get('[data-cy="experiment-card"]').should('not.exist');
    });
  });
});
