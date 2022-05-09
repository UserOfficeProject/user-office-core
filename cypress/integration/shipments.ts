import faker from 'faker';

import initialDBData from '../support/initialDBData';

faker.seed(1);

const declareShipmentIconCyTag = 'declare-shipment-icon';

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
  });

  it('Co-proposer should see that he can declare shipment', () => {
    cy.login('user');
    cy.visit('/');

    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });

  it('Visitor should see that he can declare shipment', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });
    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });

  it('Should be able to create and use shipments template', () => {
    const WIDTH_KEY = 'parcel_width';
    const HEIGHT_KEY = 'parcel_height';
    const LENGTH_KEY = 'parcel_length';
    const WEIGHT_KEY = 'parcel_weight';

    const STORAGE_TEMPERATURE_KEY = 'storage_temperature';
    const IS_FRAGILE_KEY = 'is_fragile';
    const LOCAL_CONTACT_KEY = 'shipment_local_contact';
    const IS_DANGEROUS_KEY = 'is_dangerous';

    const localContactName = faker.name.firstName();
    const storageOption = faker.lorem.words(3);

    cy.login('officer');
    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Shipment declaration templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(shipmentTemplateName)
      .should('have.value', shipmentTemplateName);

    cy.get('[data-cy=description]').type(shipmentTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.createNumberInputQuestion('width', { key: WIDTH_KEY });
    cy.createNumberInputQuestion('height', { key: HEIGHT_KEY });
    cy.createNumberInputQuestion('length', { key: LENGTH_KEY });
    cy.createNumberInputQuestion('weight', { key: WEIGHT_KEY });

    cy.createMultipleChoiceQuestion('storage temperature', {
      key: STORAGE_TEMPERATURE_KEY,
      option1: storageOption,
      option2: faker.lorem.words(3),
    });
    cy.createBooleanQuestion('is fragile', { key: IS_FRAGILE_KEY });
    cy.createMultipleChoiceQuestion('local contact', {
      key: LOCAL_CONTACT_KEY,
      option1: localContactName,
      option2: faker.name.firstName(),
      option3: faker.name.firstName(),
    });
    cy.createBooleanQuestion('is dangerous', { key: IS_DANGEROUS_KEY });

    cy.contains('New shipment');

    cy.logout();
    cy.login('user');
    cy.visit('/');

    cy.testActionButton(declareShipmentIconCyTag, 'neutral');

    cy.contains(existingProposal.title)
      .parent()
      .find(`[data-cy="${declareShipmentIconCyTag}"]`)
      .click();

    cy.get('[data-cy=add-button]').click();

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

    cy.get(`[data-natural-key=${WIDTH_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${HEIGHT_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${LENGTH_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${WEIGHT_KEY}]`).clear().type('1').click();

    cy.get(`[data-natural-key=${STORAGE_TEMPERATURE_KEY}]`).click();
    cy.get('[role=presentation]').contains(storageOption).click();

    cy.get(`[data-natural-key=${LOCAL_CONTACT_KEY}]`).click();
    cy.get('[role=presentation]').contains(localContactName).click();

    cy.get(`[data-natural-key=${IS_DANGEROUS_KEY}]`).click();
    cy.get(`[data-natural-key=${IS_FRAGILE_KEY}]`).click();

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(existingProposal.title);

    cy.contains('SUBMITTED', { matchCase: false });

    cy.get('[data-cy=download-shipment-label]').click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');

    cy.get('body').type('{esc}');

    cy.contains('1 item(s)');

    cy.visit('/');

    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });
});
