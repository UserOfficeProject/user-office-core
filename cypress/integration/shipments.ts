import faker from 'faker';

import { TemplateGroupId } from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

faker.seed(1);

const declareShipmentTitle = 'Declare shipment(s)';

const existingProposal = initialDBData.proposal;

const sampleTitle = /My sample title/i;
const visitor = initialDBData.users.user3;
const PI = initialDBData.users.user1;
const coProposer = initialDBData.users.user2;
const existingScheduledEventId = initialDBData.scheduledEvents.upcoming.id;

const shipmentTitle = faker.lorem.words(2);
const shipmentTemplateName = faker.lorem.words(2);
const shipmentTemplateDescription = faker.lorem.words(3);

context('Shipments tests', () => {
  beforeEach(() => {
    cy.resetDB(true);

    cy.updateProposalManagementDecision({
      proposalPk: existingProposal.id,
      managementDecisionSubmitted: true,
      managementTimeAllocation: 2,
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: PI.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.viewport(1920, 1080);
  });

  it('Should be able to create shipments template', () => {
    cy.login('officer');
    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Shipment declaration templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(shipmentTemplateName)
      .should('have.value', shipmentTemplateName);

    cy.get('[data-cy=description]').type(shipmentTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('New shipment');
  });

  it('Co-proposer should see that he can declare shipment', () => {
    cy.login('user');
    cy.visit('/');

    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should see that he can declare shipment', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('PI should be able to declare shipment', () => {
    cy.createTemplate({
      groupId: TemplateGroupId.SHIPMENT,
      name: shipmentTemplateName,
      description: shipmentTemplateDescription,
    });
    cy.login('user');
    cy.visit('/');

    cy.testActionButton(declareShipmentTitle, 'neutral');

    cy.contains(existingProposal.title)
      .parent()
      .find(`[title="${declareShipmentTitle}"]`)
      .click();

    cy.get('[data-cy=title-input] input')
      .click()
      .clear()
      .type(shipmentTitle)
      .should('have.value', shipmentTitle);

    cy.get('[data-cy=select-proposal-dropdown]').click();

    cy.get('[role="listbox"]').contains(existingProposal.title).click();

    cy.get('[data-cy=samples-dropdown]').click();

    cy.get('[role="listbox"]').contains(sampleTitle).click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(existingProposal.title);

    cy.contains('SUBMITTED', { matchCase: false });

    cy.get('[data-cy=download-shipment-label]').click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');

    cy.get('body').type('{esc}');

    cy.visit('/');

    cy.testActionButton(declareShipmentTitle, 'completed');
  });
});
