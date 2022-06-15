// NOTE: Get and store the settings into localStorage before running the tests. For now this is needed because of the "getFormats()" function used in initialDBData.
Cypress.on('before:run', () => {
  cy.getAndStoreAppSettings();
});
