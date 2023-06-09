import { faker } from '@faker-js/faker';
import initialDBData from 'cypress/support/initialDBData';

const instrumentPickerQuestion = {
  title: faker.lorem.words(2),
};

const dynamicMultipleChoiceQuestion = {
  title: faker.lorem.words(2),
  url: 'http://localhost:9000',
  jsonPath: '$.*.item',
  answers: {
    arrayString: [
      faker.lorem.words(3),
      faker.lorem.words(3),
      faker.lorem.words(3),
      faker.lorem.words(3),
    ],
    arrayObject: [
      {
        item: faker.lorem.words(3),
      },
      {
        item: faker.lorem.words(3),
      },
      {
        item: faker.lorem.words(3),
      },
    ],
    errorData: {
      item: faker.lorem.words(3),
      item1: faker.lorem.words(3),
      item2: faker.lorem.words(3),
    },
  },
};

const createProposalAndClickDropdownBehavior = () => {
  cy.login('user1');
  cy.visit('/');

  cy.contains('New Proposal').click();
  cy.get('[data-cy=call-list]').find('li:first-child').click();

  cy.finishedLoading();

  cy.get('[data-cy=title] input').type('title');
  cy.get('[data-cy=abstract] textarea').first().type('abstract');

  cy.contains(instrumentPickerQuestion.title);
  cy.contains(instrumentPickerQuestion.title).parent().click();
};

context('Instrument Picker Context', () => {
  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1680);
  });

  describe('Instrument Picker Description', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
      cy.navigateToTemplatesSubmenu('Proposal');
      cy.contains(initialDBData.template.name)
        .parent()
        .find('[aria-label=Edit]')
        .first()
        .click();
    });

    it('Exact Instruments should be listed as dropdown', () => {
      cy.createInstrumentPickerQuestion(instrumentPickerQuestion.title, {
        firstTopic: true,
      });

      createProposalAndClickDropdownBehavior();

      console.log(cy.get('[data-cy=radio-ul]'));
    });
  });
});
