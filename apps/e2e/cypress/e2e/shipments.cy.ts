import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
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

context('Shipments tests', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SHIPPING)) {
        this.skip();
      }
    });
    // TODO: Check this if it doesn;t require the proposal to be assigned to instrument first
    cy.updateProposalManagementDecision({
      proposalPk: existingProposal.id,
      managementDecisionSubmitted: true,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id, PI.id],
      teamLeadUserId: PI.id,
      scheduledEventId: existingScheduledEventId,
    });
  });

  it('Co-proposer should see that he can declare shipment', () => {
    cy.login('user1');
    cy.visit('/');

    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });

  it('Visitor should see that he can declare shipment', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });
    cy.visit('/');
    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });

  it('Should be able to create and use shipments template', () => {
    const WIDTH_KEY = 'parcel_width';
    const HEIGHT_KEY = 'parcel_height';
    const LENGTH_KEY = 'parcel_length';
    const WEIGHT_KEY = 'parcel_weight';

    const STORAGE_TEMPERATURE_KEY = 'storage_temperature';
    const DESCRIPTION_KEY = 'detailed_description_of_content';
    const SENDER_NAME_KEY = 'shipment_sender_name';
    const SENDER_EMAIL_KEY = 'shipment_sender_email';
    const SENDER_PHONE_KEY = 'shipment_sender_phone';
    const SENDER_STREET_ADDRESS_KEY = 'shipment_sender_street_address';
    const SENDER_ZIP_CODE_KEY = 'shipment_sender_zip_code';
    const SENDER_CITY_COUNTRY_KEY = 'shipment_sender_city_country';

    const shipmentsTemplateFile = 'shipments_template.json';

    const temp = 'Ambient';
    const description = faker.lorem.words(2);
    const name = faker.name.firstName();
    const email = faker.internet.email();
    const phone = faker.phone.number();
    const street = faker.address.streetAddress();
    const zip = faker.address.zipCode();
    const city = faker.address.city();

    cy.login('officer');
    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Shipment declaration templates');

    cy.get('[data-cy=import-template-button]').click();

    // NOTE: Force is needed because file input is not visible and has display: none
    cy.get('input[type="file"]').selectFile(
      {
        contents: `cypress/fixtures/${shipmentsTemplateFile}`,
        fileName: shipmentsTemplateFile,
      },
      { force: true }
    );

    cy.get('[data-cy="import-template-button"]').click();

    cy.notification({
      variant: 'success',
      text: 'Template imported successfully',
    });

    cy.logout();
    cy.login('user1');
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

    cy.get(`[data-natural-key=${DESCRIPTION_KEY}]`).type(description);

    cy.get(`[data-natural-key=${WIDTH_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${HEIGHT_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${LENGTH_KEY}]`).clear().type('1').click();
    cy.get(`[data-natural-key=${WEIGHT_KEY}]`).clear().type('1').click();

    cy.get(`[data-natural-key=${STORAGE_TEMPERATURE_KEY}]`).click();
    cy.get('[role=presentation]').contains(temp).click();
    cy.get(`[data-natural-key=${SENDER_NAME_KEY}]`).type(name);
    cy.get(`[data-natural-key=${SENDER_EMAIL_KEY}]`).type(email);
    cy.get(`[data-natural-key=${SENDER_PHONE_KEY}]`).type(phone);
    cy.get(`[data-natural-key=${SENDER_STREET_ADDRESS_KEY}]`).type(street);
    cy.get(`[data-natural-key=${SENDER_ZIP_CODE_KEY}]`).type(zip);
    cy.get(`[data-natural-key=${SENDER_CITY_COUNTRY_KEY}]`).type(city);

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(existingProposal.title);

    cy.contains('SUBMITTED', { matchCase: false });

    cy.contains(temp).should('exist');
    cy.contains(description).should('exist');
    cy.contains(name).should('exist');
    cy.contains(email).should('exist');
    cy.contains(phone).should('exist');
    cy.contains(street).should('exist');
    cy.contains(zip).should('exist');
    cy.contains(city).should('exist');

    cy.get('[data-cy=download-shipment-label]').click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');

    cy.get('body').type('{esc}');

    cy.contains('1 item(s)');

    cy.visit('/');

    cy.testActionButton(declareShipmentIconCyTag, 'neutral');
  });
});
