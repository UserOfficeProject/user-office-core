import { faker } from '@faker-js/faker';
import {
  CreateVisitMutation,
  FeatureId,
  ProposalEndStatus,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

faker.seed(1);

context('visits tests', () => {
  const coProposer = initialDBData.users.user2;
  const visitor = initialDBData.users.user3;
  const PI = initialDBData.users.user1;
  /*
   * The team lead and these visitors are not members of the proposal, so tests
   * using them exercise the team lead / visitor rules on their own rather than
   * passing because the user happens to also be the PI or a co-proposer.
   */
  const teamLead = initialDBData.users.visitTeamLead;
  const teamVisitor = initialDBData.users.visitor1;
  const extraVisitor = initialDBData.users.visitor2;
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

  const startQuestion = 'Visit start';
  const endQuestion = 'Visit end';

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

      const startDateObj = faker.date.future();
      const endDateObj = new Date(startDateObj.getTime() + 24 * 60 * 60 * 1000);

      const startDate = DateTime.fromJSDate(startDateObj).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const endDate = DateTime.fromJSDate(endDateObj).toFormat(
        initialDBData.getFormats().dateFormat
      );

      cy.contains(startQuestion).parent().find('input').clear().type(startDate);
      cy.contains(endQuestion).parent().find('input').clear().type(endDate);
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

      const startDateObj = faker.date.future();
      const endDateObj = new Date(startDateObj.getTime() + 24 * 60 * 60 * 1000);

      const startDate = DateTime.fromJSDate(startDateObj).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const endDate = DateTime.fromJSDate(endDateObj).toFormat(
        initialDBData.getFormats().dateFormat
      );

      //click the tab New visit
      cy.get('button').contains('New visit').click({ force: true });

      cy.get('input[name="visit_basis.startsAt"]').clear().type(startDate);
      cy.get('input[name="visit_basis.endsAt"]').clear().type(endDate);
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
      // no visit exists yet, so the PI only gets the disabled hint
      cy.get(
        '[aria-label="Define your visit (This action is disabled because visit is not defined)"]'
      ).should('exist');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Non-visitor should not see upcoming events', () => {
      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('not.exist');
    });

    it('Co-proposer should not see the form team or visit registration actions', () => {
      // The visit is led by a plain visitor, so the co-proposer is not on it.
      cy.createVisit({
        team: [teamLead.id, teamVisitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(coProposer);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      /*
       * Only the PI and the visitors may form the team, so a co-proposer sees
       * neither the form team action nor a visit registration of their own.
       */
      cy.testActionButton(cyTagDefineVisit, 'invisible');
      cy.testActionButton(cyTagRegisterVisit, 'invisible');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Co-proposer should not see the form team or visit registration actions before a visit is defined', () => {
      cy.login(coProposer);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // only the PI may create the visit, so the co-proposer sees no actions
      cy.testActionButton(cyTagDefineVisit, 'invisible');
      cy.testActionButton(cyTagRegisterVisit, 'invisible');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('PI should be able to form team', () => {
      cy.login(PI);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // test that that actions has correct state
      cy.testActionButton(cyTagDefineVisit, 'active');
      // no visit exists yet, so the PI only gets the disabled hint
      cy.get(
        '[aria-label="Define your visit (This action is disabled because visit is not defined)"]'
      ).should('exist');
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

      cy.get('[data-cy="invite-user-autocomplete"]').type(teamLead.email);
      cy.get('[role=presentation][data-popper-placement]')
        .contains(teamLead.lastName)
        .click();
      cy.get('[data-cy="invite-user-autocomplete"]').type(teamVisitor.email);
      cy.get('[role=presentation]').contains(teamVisitor.lastName).click();
      cy.finishedLoading();
      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      // specify team lead
      cy.get('[data-cy=team-lead-user-dropdown]').click();
      cy.get('[role="listbox"]').contains(teamLead.lastName).click();

      cy.get('[data-cy=create-update-visit-button]').click();

      cy.finishedLoading();

      cy.reload();

      // test again that that actions has correct state
      cy.testActionButton(cyTagDefineVisit, 'completed');
      // The PI put only the team lead and another visitor on the team, so the
      // PI has no registration of their own to fill in.
      cy.testActionButton(cyTagRegisterVisit, 'invisible');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Visitor should only see permitted actions', () => {
      cy.createVisit({
        team: [teamLead.id, visitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });
      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // A visitor may open the team, read only, so the action is visible.
      cy.testActionButton(cyTagDefineVisit, 'completed');
      cy.testActionButton(cyTagRegisterVisit, 'active');
      cy.testActionButton(cyTagDeclareShipment, 'neutral');
    });

    it('Co-proposer who is also a visitor should see the team and their own registration', () => {
      cy.createVisit({
        team: [teamLead.id, coProposer.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(coProposer);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // being on the team makes the visit readable, but not writeable
      cy.testActionButton(cyTagDefineVisit, 'completed');
      // their own registration drives the register action
      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains('Update the visit');

      cy.get('[data-cy=add-participant-button]').should('be.disabled');
      cy.get('[data-cy=create-update-visit-button]').should('be.disabled');
    });

    it('Visitor should be able to register for a visit', () => {
      const pastDate = DateTime.fromJSDate(faker.date.past()).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const nowDate = DateTime.fromJSDate(new Date()).toFormat(
        initialDBData.getFormats().dateFormat
      );
      const futureDate = DateTime.fromJSDate(faker.date.future()).toFormat(
        initialDBData.getFormats().dateFormat
      );

      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: visitTemplate.name,
        description: visitTemplate.description,
      });

      cy.createVisit({
        team: [teamLead.id, visitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      // The visitor can see the visit they are on ...
      cy.testActionButton(cyTagDefineVisit, 'completed');
      // ... and fill in their own visit timings.
      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagRegisterVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.get('[data-cy=save-and-continue-button]').click();
      cy.contains(/Visit start date is required/i).should('exist');

      cy.contains(startQuestion).parent().click().clear().type('101010');
      cy.get('[data-cy=save-and-continue-button]').click();
      cy.contains(/Visit start date is required/i).should('exist');

      cy.contains(startQuestion).parent().find('input').clear().type(nowDate);
      cy.contains(endQuestion).parent().find('input').clear().type(pastDate);
      cy.get('[data-cy=save-and-continue-button]').click();
      cy.contains(/end date can't be before start date/i).should('exist');

      cy.contains(startQuestion).parent().find('input').clear().type(nowDate);
      cy.contains(endQuestion).parent().find('input').clear().type(futureDate);

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

    it('Team lead should be able to update the visit', () => {
      // The team lead is a plain visitor (not the PI or a co-proposer).
      cy.createVisit({
        team: [visitor.id],
        teamLeadUserId: visitor.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // The team lead can access the define-visit action even though they are
      // only a visitor.
      cy.testActionButton(cyTagDefineVisit, 'completed');

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains('Update the visit');

      // Add another visitor to the team.
      cy.get('[data-cy=add-participant-button]').click();
      cy.finishedLoading();

      cy.get('[data-cy="invite-user-autocomplete"]').type(coProposer.email);
      cy.get('[role=presentation][data-popper-placement]')
        .contains(coProposer.lastName)
        .click();
      cy.finishedLoading();
      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      cy.get('[data-cy=create-update-visit-button]').click();

      cy.notification({ text: 'Visit updated', variant: 'success' });
    });

    it('PI should be able to delete a visitor from the team', () => {
      cy.createVisit({
        team: [teamLead.id, teamVisitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(PI);
      cy.visit('/');

      cy.finishedLoading();

      cy.testActionButton(cyTagDefineVisit, 'completed');

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains('Update the visit');

      cy.get('[role="dialog"]').contains(teamVisitor.lastName).should('exist');

      // Delete the visitor and confirm the material table row deletion.
      cy.get('[role="dialog"]')
        .contains(teamVisitor.lastName)
        .parent()
        .find('[aria-label=Delete]')
        .click();
      cy.get('[aria-label="Save"]').click();

      cy.get('[role="dialog"]')
        .contains(teamVisitor.lastName)
        .should('not.exist');

      cy.get('[data-cy=create-update-visit-button]').click();

      cy.notification({ text: 'Visit updated', variant: 'success' });
    });

    it('Team lead should be able to hand the team lead role to another visitor', () => {
      cy.createVisit({
        team: [teamLead.id, teamVisitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(teamLead);
      cy.visit('/');

      cy.finishedLoading();

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains('Update the visit');

      // Hand the lead over, then back out of the confirmation.
      cy.get('[data-cy=team-lead-user-dropdown]').click();
      cy.get('[role="listbox"]').contains(teamVisitor.lastName).click();
      cy.get('[data-cy=create-update-visit-button]').click();

      cy.get('[data-cy="confirmation-dialog"]').should('exist');
      cy.get('[data-cy="confirm-cancel"]').click();

      // Cancelling leaves the form open and the visit untouched.
      cy.get('[data-cy="confirmation-dialog"]').should('not.exist');
      cy.contains('Update the visit');

      // Now go through with it.
      cy.get('[data-cy=create-update-visit-button]').click();
      cy.get('[data-cy="confirmation-dialog"]').should('exist');
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({ text: 'Visit updated', variant: 'success' });

      // The previous lead is now an ordinary visitor and can no longer edit.
      cy.reload();
      cy.finishedLoading();

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.get('[data-cy=add-participant-button]').should('be.disabled');
      cy.get('[data-cy=create-update-visit-button]').should('be.disabled');
    });

    it('Visitor who is not the team lead should see the team read only', () => {
      cy.createVisit({
        team: [teamLead.id, teamVisitor.id, extraVisitor.id],
        teamLeadUserId: teamLead.id,
        experimentPk: existingExperimentPk,
      });

      cy.login(extraVisitor);
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(/Upcoming experiments/i).should('exist');

      // The visitor may open the team, but only to read it.
      cy.testActionButton(cyTagDefineVisit, 'completed');

      cy.get(`[data-cy="${cyTagDefineVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains('Update the visit');

      // The whole visitor list is readable.
      cy.get('[role="dialog"]').contains(teamLead.lastName).should('exist');
      cy.get('[role="dialog"]').contains(teamVisitor.lastName).should('exist');

      // ... but nothing on it can be changed.
      cy.get('[data-cy=add-participant-button]').should('be.disabled');
      cy.get('[data-cy=create-update-visit-button]').should('be.disabled');
      cy.get('[data-cy=team-lead-user-dropdown]').should('be.disabled');

      /*
       * The actions column is dropped entirely rather than being disabled, so
       * neither the column header nor the delete button is rendered.
       */
      cy.get('[role="dialog"]')
        .find('thead')
        .contains('Actions')
        .should('not.exist');
      cy.get('[role="dialog"]').find('[aria-label=Delete]').should('not.exist');
    });
  });
});
