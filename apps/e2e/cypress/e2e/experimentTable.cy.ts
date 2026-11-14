import { ProposalEndStatus } from '@user-office-software-libs/shared-types';

import initialDBData from '../support/initialDBData';

const existingProposal = initialDBData.proposal;

const visitor = initialDBData.users.user3;
const PI = initialDBData.users.user1;
const coProposer = initialDBData.users.user2;
const existingExperimentPk = initialDBData.experiments.upcoming.experimentPk;

context('Experiment Table for users', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.updateProposalManagementDecision({
      proposalPk: existingProposal.id,
      finalStatus: ProposalEndStatus.ACCEPTED,
      managementDecisionSubmitted: true,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id, PI.id],
      teamLeadUserId: PI.id,
      experimentPk: existingExperimentPk,
    });
  });

  it('PI can see the view experiment details button', () => {
    cy.login('user1');
    cy.visit('/ExperimentTimes');

    cy.get('[data-cy="view-experiment-user"]').should('exist');
  });

  it('coproposer can see the view experiment details button', () => {
    cy.login('user2');
    cy.visit('/ExperimentTimes');

    cy.get('[data-cy="view-experiment-user"]').should('exist');
  });

  it('Visitor can see the view experiment details button', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');

    cy.get('[data-cy="view-experiment-user"]').should('exist');
  });

  it('Visitor should navigate to the correct URL when opening experiment view', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');

    cy.get('[data-cy="view-experiment-user"]').click();
    cy.url().should('match', /\/ExperimentTimes\?experiment=996/);
  });

  it('The experiment table should display correctly when opened', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');

    cy.get('[data-cy="view-experiment-user"]').click();
    cy.url().should('match', /\/ExperimentTimes\?experiment=996/);
    cy.contains('Experiment Number');
    cy.contains('Start');
    cy.contains('End');
    cy.contains('Experiment Safety Review Status');

    cy.contains('000001'); //experiment number
    cy.contains('07-01-2030');
    cy.contains('07-01-2030');
    cy.contains('ESF Not Started');

    cy.contains('Experiment Information');
    cy.contains('Proposal Information');
    cy.contains('Visit');
  });

  it('The experiment table should not show the user UO options', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');
    cy.get('[data-cy="view-experiment-user"]').click();

    cy.get('[role="dialog"]')
      .should('not.contain', 'LOGS')
      .and('not.contain', 'Experiment Safety Review')
      .and('not.contain', 'Experiment Safety Form');
  });

  it('The visit tab should be clickable and show the correct list', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');
    cy.get('[data-cy="view-experiment-user"]').click();

    cy.contains('Visit', { matchCase: false }).click();
    cy.contains('Visitor Name', { matchCase: false }).should('exist');
    cy.contains('Teamleader').should('exist');

    cy.contains('Carl Carlsson').should('exist');
    cy.contains('Benjamin Beckley').should('exist');
    cy.contains('David Dawson').should('exist');
  });

  it('The proposal information tab should be clickable and show the data', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');
    cy.get('[data-cy="view-experiment-user"]').click();

    cy.contains('proposal information', { matchCase: false }).click();

    cy.contains('New proposal', { matchCase: false }).should('exist');
    cy.contains('Topic title', { matchCase: false }).should('exist');
  });

  it('The experiment information should be clickable and show the data', () => {
    cy.login('user3');
    cy.visit('/ExperimentTimes');
    cy.get('[data-cy="view-experiment-user"]').click();

    cy.contains('experiment information', { matchCase: false }).click();

    cy.contains('experiment number', { matchCase: false }).should('exist');
    cy.contains('000001', { matchCase: false }).should('exist');
  });
});
