import { faker } from '@faker-js/faker';
import {
  CreateVisitMutation,
  FeatureId,
  ProposalEndStatus,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';

import { selectDateRange } from '../support/dayRangePicker';
import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

faker.seed(1);

context('visits tests', () => {
  const coProposer = initialDBData.users.user2;
  const visitor = initialDBData.users.user3;
  const PI = initialDBData.users.user1;
  const acceptedStatus = ProposalEndStatus.ACCEPTED;
  const existingProposalId = initialDBData.proposal.id;
  const existingExperimentPk = initialDBData.experiments.upcoming.experimentPk;
  let createdVisitId: number;

  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.VISIT_MANAGEMENT)) {
        this.skip();
      }
    });
    cy.updateProposal({
      proposalPk: existingProposalId,
      title: initialDBData.proposal.title,
      abstract: faker.random.words(3),
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
  });

  const visitBasisDateRange = 'visit_basis.dateRange';

  const cyTagDefineVisit = 'define-visit-icon';
  const cyTagRegisterVisit = 'register-visit-icon';
  const cyTagDeclareShipment = 'declare-shipment-icon';
  const visitTemplate = {
    name: faker.lorem.words(2),
    description: faker.lorem.words(3),
  };

  describe('Visits registration tests', () => {
    beforeEach(() => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: visitTemplate.name,
        description: visitTemplate.description,
      }).then(({ createTemplate: newTemplate }) => {
        cy.setActiveTemplate({
          templateGroupId: TemplateGroupId.VISIT_REGISTRATION,
          templateId: newTemplate.templateId,
        });
      });

      cy.createVisit({
        team: [visitor.id],
        teamLeadUserId: visitor.id,
        experimentPk: existingExperimentPk,
      }).then(({ createVisit: visit }: CreateVisitMutation) => {
        createdVisitId = visit.id;

        cy.createVisitRegistration({
          visitId: visit.id,
          userId: visitor.id,
        });

        cy.submitVisitRegistration({
          visitId: visit.id,
          userId: visitor.id,
        });
      });
    });

    it('User officer should be able request changes', () => {
      cy.login('officer');
      cy.visit('/Experiments');
      cy.finishedLoading();

      cy.get('[data-cy=preset-date-selector]').contains('All').click();
      cy.get("[data-cy='view-experiment']").first().click();
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });

      cy.get('[data-cy="request-visit-registration-changes-button"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.get('[data-cy="request-visit-registration-changes-button"]').should(
        'not.be.exist'
      );

      cy.logout();
      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagRegisterVisit}"]`)
        .closest('button')
        .first()
        .click();

      selectDateRange(visitBasisDateRange);
      cy.get('[data-cy="save-and-continue-button"]').click();
      cy.get('[data-cy="submit-visit-registration-button"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.testActionButton(cyTagRegisterVisit, 'pending');
    });

    it('User should be able to cancel visit registration', () => {
      cy.login('user3');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[data-cy="register-visit-icon"]').closest('button').click();
      cy.get('[data-cy="registration-more-options"]').click();
      cy.get('[data-cy="cancel-visit-button"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.get(
        '[aria-label="Define your visit (This action is disabled because your registration for visit is cancelled)"]'
      ).should('exist');
    });

    it('User should not be able to cancel visit registration after visit is approved', () => {
      cy.approveVisitRegistration({
        visitRegistration: {
          userId: visitor.id,
          visitId: createdVisitId,
        },
      });

      cy.login('user3');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[data-cy="register-visit-icon"]').closest('button').click();
      cy.get('[data-cy="registration-more-options"]').should('not.exist');
    });

    it('User officer should be able to cancel visit registration', () => {
      cy.login('officer');
      cy.visit('/Experiments');
      cy.finishedLoading();

      cy.get('[data-cy=preset-date-selector]').contains('All').click();
      cy.get("[data-cy='view-experiment']").first().click();
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });

      cy.get('[data-cy="visit-status"]').should('have.text', 'SUBMITTED');
      cy.get('[data-cy="cancel-visit-registration-button"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.get('[data-cy="visit-status"]').should(
        'have.text',
        'CANCELLED_BY_FACILITY'
      );
    });

    it('User officer should be able to edit visit registration after visit is approved', () => {
      cy.approveVisitRegistration({
        visitRegistration: {
          userId: visitor.id,
          visitId: createdVisitId,
        },
      });

      cy.login('officer');
      cy.visit('/Experiments');
      cy.finishedLoading();

      cy.get('[data-cy=preset-date-selector]').contains('All').click();
      cy.get("[data-cy='view-experiment']").first().click();
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });

      cy.get('[data-cy="visit-status"]').should('have.text', 'APPROVED');
      cy.get('[data-cy="edit-visit-registration-button"]').click();

      //click the tab New visit
      cy.get('button').contains('New visit').click({ force: true });

      selectDateRange(visitBasisDateRange);
      cy.get('[data-cy="save-and-continue-button"]').click();
      cy.get('[data-cy="visit-status"]').should('have.text', 'APPROVED');
    });

    it('User officer should be able to approve visit registration', () => {
      cy.login('officer');
      cy.visit('/Experiments');
      cy.finishedLoading();

      cy.get('[data-cy=preset-date-selector]').contains('All').click();
      cy.get("[data-cy='view-experiment']").first().click();
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });

      cy.get('[data-cy="visit-status"]').should('have.text', 'SUBMITTED');
      cy.get('[data-cy="approve-visit-registration-button"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.get('[data-cy="visit-status"]').should('have.text', 'APPROVED');
    });

    it('PI should see the visit', () => {
      cy.login(PI);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      cy.testActionButton(cyTagDefineVisit, 'completed');
      cy.testActionButton(cyTagRegisterVisit, 'invisible');
    });
  });

  describe('Visits basic tests', () => {
    it('Should be able to create visits template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.navigateToTemplatesSubmenu('Visit registration');
      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy=name] input')
        .type(visitTemplate.name)
        .should('have.value', visitTemplate.name);
      cy.get('[data-cy=description]').type(visitTemplate.description);

      cy.get('[data-cy=submit]').click();

      cy.contains(visitTemplate.name);
      cy.contains(visitTemplate.description);
    });

    it('PI should see that he is able to form team', () => {
      cy.login(PI);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      cy.testActionButton(cyTagDefineVisit, 'active');
      cy.testActionButton(cyTagRegisterVisit, 'cancelled');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Non-visitor should not see upcoming events', () => {
      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('not.exist');
    });

    it('Co-proposer should be able to form team', () => {
      cy.login(coProposer);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // test that that actions has correct state
      cy.testActionButton(cyTagDefineVisit, 'active');
      cy.testActionButton(cyTagRegisterVisit, 'cancelled');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');

      // create visit
      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      // test error messages
      cy.get('[type="submit"]').click();
      cy.contains(/Please add visitors/i);
      cy.contains(/Please select the team lead/i);

      // add visitors
      cy.get('[data-cy=add-participant-button]').click();
      cy.finishedLoading();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        initialDBData.users.user2.email
      );
      cy.get('[role=presentation][data-popper-placement]')
        .contains(initialDBData.users.user2.lastName)
        .click();
      cy.get('[data-cy="invite-user-autocomplete"]').type(
        initialDBData.users.user3.email
      );
      cy.get('[role=presentation]')
        .contains(initialDBData.users.user3.lastName)
        .click();
      cy.finishedLoading();
      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      // specify team lead
      cy.get('[data-cy=team-lead-user-dropdown]').click();
      cy.get('[role="listbox"]')
        .contains(/Beckley/i)
        .click();

      cy.get('[data-cy=create-update-visit-button]').click();

      cy.finishedLoading();

      cy.reload();

      // test again that that actions has correct state
      cy.testActionButton(cyTagDefineVisit, 'completed');
      cy.testActionButton(cyTagRegisterVisit, 'active');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Visitor should only see permitted actions', () => {
      cy.createVisit({
        team: [coProposer.id, visitor.id],
        teamLeadUserId: coProposer.id,
        experimentPk: existingExperimentPk,
      });
      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      cy.testActionButton(cyTagDefineVisit, 'invisible');
      cy.testActionButton(cyTagRegisterVisit, 'active');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Visitor should be able to register for a visit', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: visitTemplate.name,
        description: visitTemplate.description,
      });

      cy.createVisit({
        team: [coProposer.id, visitor.id],
        teamLeadUserId: coProposer.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      // test if the actions are available after co-proposer defined the team
      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagRegisterVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.get('[data-cy=save-and-continue-button]').click();
      cy.contains(/Visit start date is required/i).should('exist');

      // The malformed-input and end-before-start cases the two date fields used
      // to cover are unreachable through the range picker: its text field is
      // readonly, days before today are disabled, and the calendar always
      // returns the range in order.
      selectDateRange(visitBasisDateRange);

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.get('[data-cy=submit-visit-registration-button]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.reload();

      cy.testActionButton(cyTagRegisterVisit, 'pending');
    });

    it('User should not see register for visit or training button if he is not a visitor', () => {
      cy.createVisit({
        team: [PI.id, visitor.id, coProposer.id],
        teamLeadUserId: coProposer.id,
        experimentPk: existingExperimentPk,
      });
      cy.login(PI);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains('Carlsson')
        .parent()
        .find('[aria-label=Delete]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.get('[data-cy=create-update-visit-button]').click();

      cy.finishedLoading();

      cy.get('body').type('{esc}');

      cy.testActionButton(cyTagRegisterVisit, 'invisible');
    });
  });
});
