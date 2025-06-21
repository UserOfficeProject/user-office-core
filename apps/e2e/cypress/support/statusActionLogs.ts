const navigateToStatusActionLogsSubmenu = (submenuName: string) => {
  cy.get('body').then(($body) => {
    if ($body.find(`[aria-label='${submenuName}']`).length) {
      cy.get(`[aria-label='${submenuName}']`).children().first().click();
    } else {
      cy.get('[aria-label="Status Action Logs"]').click();
      cy.get(`[aria-label='${submenuName}']`).children().first().click();
    }
  });
};

Cypress.Commands.add(
  'navigateToStatusActionLogsSubmenu',
  navigateToStatusActionLogsSubmenu
);
