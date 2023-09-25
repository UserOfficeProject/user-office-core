import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('Units tests', () => {
  beforeEach(() => {
    // NOTE: Stop the web application and clearly separate the end-to-end tests by visiting the blank about page after each test.
    // This prevents flaky tests with some long-running network requests from one test to finish in the next and unexpectedly update the app.
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    });

    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Template basic unit tests', () => {
    it('User officer can create unit', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="unit-id"]').clear().type('test');
      cy.get('[data-cy="unit-name"]').clear().type('test');
      cy.get('[data-cy="unit-quantity"]').click();
      cy.get('[role="presentation"] [role="option"]').first().click();

      cy.get('[data-cy="unit-symbol"]').clear().type('test');
      cy.get('[data-cy="unit-siConversionFormula"]').clear().type('x');

      cy.get('[data-cy="submit"]').click();
      cy.get('[placeholder="Search"]').clear().type('test');
    });

    it('Can not create unit with invalid conversion formula', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="unit-id"]').clear().type('test');
      cy.get('[data-cy="unit-name"]').clear().type('test');
      cy.get('[data-cy="unit-quantity"]').click();
      cy.get('[role="presentation"] [role="option"]').first().click();

      cy.get('[data-cy="unit-symbol"]').clear().type('test');
      cy.get('[data-cy="unit-siConversionFormula"]')
        .clear()
        .type(faker.lorem.words(2));

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'error', text: /formula is not valid/g });
    });

    it('User officer can delete unit', () => {
      const BECQUEREL_UNIT_TITLE = 'becquerel';
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.contains(BECQUEREL_UNIT_TITLE).should('exist');

      cy.contains(BECQUEREL_UNIT_TITLE)
        .closest('tr')
        .find('[aria-label=Delete]')
        .click();

      cy.get('[aria-label=Save]').click();

      cy.contains(BECQUEREL_UNIT_TITLE).should('not.exist');
    });

    it('User officer can import units', () => {
      const fileName = 'units_import.json';

      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.get('[data-cy="import-units-button"]').click();
      // NOTE: Force is needed because file input is not visible and has display: none
      cy.get('input[type="file"]').selectFile(
        {
          contents: `cypress/fixtures/${fileName}`,
          fileName: fileName,
        },
        { force: true }
      );

      cy.get('[data-cy="back-button"]').click();

      cy.get('input[type="file"]').selectFile(
        {
          contents: `cypress/fixtures/${fileName}`,
          fileName: fileName,
        },
        { force: true }
      );

      cy.get('[data-cy="import-units-button"]').should('be.disabled');

      cy.get('[data-cy="electric_current-accordion"]').click();
      cy.get('[data-cy="electric_current-accordion"]')
        .find('[data-cy="new-item-checkbox"]')
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="import-units-button"]').click();

      cy.finishedLoading();

      cy.contains('ampere from import');
    });

    it('User officer can export units', () => {
      const fileName = 'units_export.json';
      const now = DateTime.now();
      const downloadFileName = `units_${now.toFormat(
        initialDBData.getFormats().dateFormat
      )}.json`;

      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=officer-menu-items]').contains('Settings').click();
      cy.get('[data-cy=officer-menu-items]').contains('Units').click();

      cy.get('[data-cy="export-units-button"]').click();

      cy.fixture(fileName).then((expectedExport) => {
        const downloadsFolder = Cypress.config('downloadsFolder');

        cy.readFile(`${downloadsFolder}/${downloadFileName}`).then(
          (actualExport) => {
            // remove date from the export, because it is not deterministic
            delete expectedExport.exportDate;
            delete actualExport.exportDate;

            expect(expectedExport).to.deep.equal(actualExport);
          }
        );
      });
    });
  });

  describe('Template advanced unit tests', () => {
    it('Can search answers with units', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('#call-select').click();
      cy.get('[role=listbox]').contains('call 1').click();
      cy.get('[data-cy=question-search-toggle]').click();
      cy.get('#question-list').click();
      cy.get('[role="presentation"] [role="option"]').first().click();
      cy.get('body').click();

      cy.get('[data-cy=comparator]').click();
      cy.get('[data-value="LESS_THAN"]').click();

      cy.get('[data-cy="value"] input').clear().type('5');

      cy.get('[data-cy=unit-select]').click();
      cy.get('[data-value="centimeter"]').click();

      cy.get('[data-cy=search-btn]').click();

      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=unit-select]').click();
      cy.get('[data-value="meter"]').click();

      cy.get('[data-cy=search-btn]').click();

      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');
    });
  });
});
