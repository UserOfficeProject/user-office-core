import faker from 'faker';

import {
  TemplateGroupId,
  TemplateCategoryId,
  DataType,
} from '../../src/generated/sdk';
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
    cy.viewport(1920, 1080);
  });

  const startDateQuestionTitle = 'Visit start';
  const endDateQuestionTitle = 'Visit end';

  const formTeamTitle = 'Define who is coming';
  const registerVisitTitle = 'Define your own visit';
  const individualTrainingTitle = 'Finish individual training';
  const declareShipmentTitle = 'Declare shipment(s)';
  const visitTemplate = {
    name: faker.lorem.words(2),
    description: faker.lorem.words(3),
  };

  it('Should be able to create visits template', () => {
    cy.login('officer');
    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Visit registration');
    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(visitTemplate.name)
      .should('have.value', visitTemplate.name);
    cy.get('[data-cy=description]').type(visitTemplate.description);

    cy.get('[data-cy=submit]').click();

    cy.createDateQuestion(startDateQuestionTitle);
    cy.createDateQuestion(endDateQuestionTitle);
  });

  it('PI should see that he is able to form team', () => {
    cy.login(PI);
    cy.visit('/');

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(formTeamTitle, 'active');
    cy.testActionButton(registerVisitTitle, 'inactive');
    cy.testActionButton(individualTrainingTitle, 'inactive');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Non-visitor should not see upcoming events', () => {
    cy.login(visitor);
    cy.visit('/');

    cy.contains(/Upcoming experiments/i).should('not.exist');
  });

  it('Co-proposer should be able to form team', () => {
    cy.login(coProposer);
    cy.visit('/');

    cy.contains(/Upcoming experiments/i).should('exist');

    // test that that actions has correct state
    cy.testActionButton(formTeamTitle, 'active');
    cy.testActionButton(registerVisitTitle, 'inactive');
    cy.testActionButton(individualTrainingTitle, 'inactive');
    cy.testActionButton(declareShipmentTitle, 'neutral');

    // create visit
    cy.get(`[title="${formTeamTitle}"]`).first().click();

    // test error messages
    cy.get('[type="submit"]').click();
    cy.contains(/Please add visitors/i);
    cy.contains(/Please select the team lead/i);

    // add visitors
    cy.get('[data-cy=add-participant-button]').click();
    cy.get('[name=email]').type('david@teleworm.us{enter}');
    cy.finishedLoading();
    cy.contains('Beckley').parent().find('[type=checkbox]').click();
    cy.get('[data-cy=assign-selected-users]').click();

    // specify team lead
    cy.get('[data-cy=team-lead-user-dropdown]').click();
    cy.get('[role="listbox"]')
      .contains(/Beckley/i)
      .click();

    cy.get('[data-cy=create-visit-button]').click();

    cy.reload();

    // test again that that actions has correct state
    cy.testActionButton(formTeamTitle, 'completed');
    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should only see permitted actions', () => {
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.login(visitor);
    cy.visit('/');

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(formTeamTitle, 'invisible');
    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should be able to register for a visit', () => {
    cy.createTemplate({
      groupId: TemplateGroupId.VISIT_REGISTRATION,
      name: visitTemplate.name,
      description: visitTemplate.description,
    }).then((result) => {
      const template = result.createTemplate.template;
      if (template) {
        const topicId = template.steps[0].topic.id;
        cy.createQuestion({
          categoryId: TemplateCategoryId.VISIT_REGISTRATION,
          dataType: DataType.DATE,
        }).then((questionResult) => {
          const question = questionResult.createQuestion.question;
          if (question) {
            cy.updateQuestion({
              id: question.id,
              question: startDateQuestionTitle,
            });
            cy.createQuestionTemplateRelation({
              questionId: question.id,
              templateId: template.templateId,
              sortOrder: 1,
              topicId: topicId,
            });
          }
        });
        cy.createQuestion({
          categoryId: TemplateCategoryId.VISIT_REGISTRATION,
          dataType: DataType.DATE,
        }).then((questionResult) => {
          const question = questionResult.createQuestion.question;
          if (question) {
            cy.updateQuestion({
              id: question.id,
              question: endDateQuestionTitle,
            });
            cy.createQuestionTemplateRelation({
              questionId: question.id,
              templateId: template.templateId,
              sortOrder: 1,
              topicId: topicId,
            });
          }
        });
      }
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });

    cy.login(visitor);
    cy.visit('/');

    // test if the actions are available after co-proposer defined the team
    cy.testActionButton(registerVisitTitle, 'active');

    cy.get(`[title="${registerVisitTitle}"]`).first().click();

    cy.contains(startDateQuestionTitle).parent().click().type('2021-07-20');
    cy.contains(endDateQuestionTitle).parent().click().type('2021-07-21');

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.get('[data-cy=submit-visit-registration-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.reload();

    cy.testActionButton(registerVisitTitle, 'completed');
  });

  it('User should not see register for visit or training button if he is not a visitor', () => {
    cy.createVisit({
      team: [PI.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.login(PI);
    cy.visit('/');

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');

    cy.get(`[title="${formTeamTitle}"]`).first().click();

    cy.get('[role="dialog"]')
      .contains('Carlsson')
      .parent()
      .find('[title=Delete]')
      .click();

    cy.get('[title="Save"]').click();

    cy.get('[data-cy=create-visit-button]').click();

    cy.contains('2023-01-07 10:00')
      .parent()
      .get(`[title="${registerVisitTitle}]`)
      .should('not.exist');
    cy.contains('2023-01-07 10:00')
      .parent()
      .get(`[title="${individualTrainingTitle}]`)
      .should('not.exist');
  });
});
