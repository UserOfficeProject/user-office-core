context('Call filter labels', () => {
  beforeEach(() => {
    cy.getAndStoreFeaturesEnabled();
    cy.login('officer');
    cy.intercept('POST', '/graphql', (request) => {
      if (request.body.operationName === 'getCallsMinimal') {
        request.reply({
          data: {
            calls: [
              { id: 101, shortCode: 'CALL-101', title: 'Call with short code' },
              { id: 102, shortCode: '', title: 'Call without short code' },
              { id: 103, shortCode: '', title: '' },
            ],
          },
        });
      } else if (request.body.operationName === 'getAllExperiments') {
        request.alias = 'experiments';
        request.reply({
          data: { allExperiments: { experiments: [], totalCount: 0 } },
        });
      }
    });
  });

  [
    { id: 101, label: 'CALL-101' },
    { id: 102, label: 'Call without short code' },
    { id: 103, label: '103' },
  ].forEach(({ id, label }) => {
    it(`displays and selects the call labelled ${label}`, () => {
      cy.visit('/Experiments');
      cy.wait('@experiments');
      cy.get('[data-cy=call-filter]').click();
      cy.contains('[role=option]', label).click();
      cy.get('[data-cy=call-filter] input').should('have.value', label);
      cy.location('search').should('include', `call=${id}`);
      cy.wait('@experiments')
        .its('request.body.variables.filter.callId')
        .should('eq', id);

      cy.reload();
      cy.get('[data-cy=call-filter] input').should('have.value', label);
      cy.get('[data-cy=call-filter]').click();
      cy.contains('[role=option]', 'All').click();
      cy.location('search').should('not.include', 'call=');
      cy.get('[data-cy=call-filter] input').should('have.value', 'All');
    });
  });
});
