import { TemplateGroupId } from '@user-office-software-libs/shared-types';
import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

faker.seed(1);

context('visits tests', () => {
  const coProposer = initialDBData.users.user2;
  const visitor = initialDBData.users.user3;
  const PI = initialDBData.users.user1;
  const acceptedStatusId = 1;
  const existingProposalId = initialDBData.proposal.id;
  const existingScheduledEventId = initialDBData.scheduledEvents.upcoming.id;

  beforeEach(() => {
    cy.resetDB(true);
    cy.updateProposal({
      proposalPk: existingProposalId,
      proposerId: PI.id,
      users: [coProposer.id],
    });
    cy.updateProposalManagementDecision({
      proposalPk: existingProposalId,
      statusId: acceptedStatusId,
      managementTimeAllocation: 5,
      managementDecisionSubmitted: true,
    });
  });

  const startQuestion = 'Visit start';
  const endQuestion = 'Visit end';

  const cyTagDefineVisit = 'define-visit-icon';
  const cyTagRegisterVisit = 'register-visit-icon';
  const cyTagFinishTraining = 'finish-training-icon';
  const cyTagDeclareShipment = 'declare-shipment-icon';
  const visitTemplate = {
    name: faker.lorem.words(2),
    description: faker.lorem.words(3),
  };

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
    cy.testActionButton(cyTagRegisterVisit, 'inactive');
    cy.testActionButton(cyTagFinishTraining, 'inactive');
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
    cy.testActionButton(cyTagRegisterVisit, 'inactive');
    cy.testActionButton(cyTagFinishTraining, 'inactive');
    cy.testActionButton(cyTagDeclareShipment, 'neutral');

    // create visit
    cy.get(`[data-cy="${cyTagDefineVisit}"]`).closest('button').first().click();

    // test error messages
    cy.get('[type="submit"]').click();
    cy.contains(/Please add visitors/i);
    cy.contains(/Please select the team lead/i);

    // add visitors
    cy.get('[data-cy=add-participant-button]').click();
    cy.finishedLoading();
    cy.get('[name=email]').type('david@teleworm.us{enter}');
    cy.finishedLoading();
    cy.contains('Beckley').parent().find('[type=checkbox]').click();
    cy.get('[data-cy=assign-selected-users]').click();

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
    cy.testActionButton(cyTagFinishTraining, 'active');
    cy.testActionButton(cyTagDeclareShipment, 'neutral');
  });

  it('Visitor should only see permitted actions', () => {
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.login(visitor);
    cy.visit('/');

    cy.finishedLoading();

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(cyTagDefineVisit, 'invisible');
    cy.testActionButton(cyTagRegisterVisit, 'active');
    cy.testActionButton(cyTagFinishTraining, 'active');
    cy.testActionButton(cyTagDeclareShipment, 'neutral');
  });

  it('Visitor should be able to register for a visit', () => {
    const startDate = DateTime.fromJSDate(faker.date.past()).toFormat(
      initialDBData.getFormats().dateFormat
    );
    const endDate = DateTime.fromJSDate(faker.date.future()).toFormat(
      initialDBData.getFormats().dateFormat
    );

    cy.createTemplate({
      groupId: TemplateGroupId.VISIT_REGISTRATION,
      name: visitTemplate.name,
      description: visitTemplate.description,
    });

    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
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
    cy.contains(/invalid date/i).should('exist');

    cy.contains(startQuestion).parent().click().clear().type('101010');
    cy.get('[data-cy=save-and-continue-button]').click();
    cy.contains(/Invalid date/i).should('exist');

    cy.contains(startQuestion).parent().click().clear().type(endDate);
    cy.contains(endQuestion).parent().click().clear().type(startDate);

    cy.get('[data-cy=save-and-continue-button]').click();
    cy.contains(/end date can't be before start date/i).should('exist');

    cy.contains(startQuestion).parent().click().clear().type(startDate);
    cy.contains(endQuestion).parent().click().clear().type(endDate);

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.get('[data-cy=submit-visit-registration-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.reload();

    cy.testActionButton(cyTagRegisterVisit, 'completed');
  });

  it('User should not see register for visit or training button if he is not a visitor', () => {
    cy.createVisit({
      team: [PI.id, visitor.id, coProposer.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.login(PI);
    cy.visit('/');

    cy.finishedLoading();

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(cyTagRegisterVisit, 'active');
    cy.testActionButton(cyTagFinishTraining, 'active');

    cy.get(`[data-cy="${cyTagDefineVisit}"]`).closest('button').first().click();

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
    cy.testActionButton(cyTagFinishTraining, 'invisible');
  });
});
