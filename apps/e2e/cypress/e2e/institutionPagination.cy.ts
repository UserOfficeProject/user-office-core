type InstitutionRow = {
  id: number;
  name: string;
  country: { id: number; value: string } | null;
  rorId: string | null;
};

context('Server-paginated institutions', () => {
  let institutions: InstitutionRow[];

  beforeEach(() => {
    institutions = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      name: `Institution ${String(index + 1).padStart(2, '0')}`,
      country: { id: 173, value: 'Sweden' },
      rorId: `https://ror.org/example${index + 1}`,
    }));
    cy.getAndStoreFeaturesEnabled();
    cy.login('officer');
    cy.intercept('POST', '/graphql', (request) => {
      const { operationName, variables } = request.body;
      if (operationName === 'getInstitutionsPage') {
        request.alias = 'institutionsPage';
        const search = (variables.searchText || '').trim().toLowerCase();
        const matching = institutions
          .filter((institution) =>
            [
              institution.name,
              institution.country?.value || '',
              institution.rorId || '',
            ].some((value) => value.toLowerCase().includes(search))
          )
          .sort((a, b) => {
            const field = variables.sortField;
            const comparison =
              field === 'country.value'
                ? (a.country?.value || '').localeCompare(b.country?.value || '')
                : field === 'rorId'
                  ? (a.rorId || '').localeCompare(b.rorId || '')
                  : a.name.localeCompare(b.name);

            return variables.sortDirection === 'desc'
              ? -comparison
              : comparison;
          });
        request.reply({
          data: {
            institutionsPage: {
              totalCount: matching.length,
              institutions: matching.slice(
                variables.offset,
                variables.offset + variables.first
              ),
            },
          },
        });
      } else if (operationName === 'deleteInstitution') {
        const institution = institutions.find(
          (institution) => institution.id === variables.id
        );
        institutions = institutions.filter(
          (institution) => institution.id !== variables.id
        );
        request.reply({ data: { deleteInstitution: institution } });
      } else if (operationName === 'getCountries') {
        request.reply({
          data: { countries: [{ id: 173, value: 'Sweden' }] },
        });
      } else if (operationName === 'updateInstitution') {
        const institution = institutions.find(
          (institution) => institution.id === variables.id
        );
        if (!institution) throw new Error('Test institution not found');
        institution.name = variables.name;
        request.reply({ data: { updateInstitution: institution } });
      }
    });
    cy.visit('/Institutions');
    cy.wait('@institutionsPage');
  });

  it('fetches pages, page sizes and sorting from the server', () => {
    cy.get('@institutionsPage')
      .its('request.body.variables')
      .should('not.have.property', 'sortField');
    cy.contains('1-10 of 21');
    cy.contains('td', 'Institution 21').should('not.exist');
    cy.get('button[aria-label="Next Page"]').click();
    cy.wait('@institutionsPage')
      .its('request.body.variables')
      .should('include', {
        first: 10,
        offset: 10,
      });
    cy.contains('11-20 of 21');
    cy.get('[aria-label="Rows per page:"]').click();
    cy.get('[role=listbox]').contains('20').click();
    cy.wait('@institutionsPage')
      .its('request.body.variables')
      .should('include', {
        first: 20,
        offset: 0,
      });
    cy.contains('1-20 of 21');
    cy.get('[data-testid=mtableheader-sortlabel]').contains('Country').click();
    cy.wait('@institutionsPage')
      .its('request.body.variables')
      .should('include', {
        sortField: 'country.value',
        sortDirection: 'asc',
      });
  });

  it('searches beyond the current page by name, country and ROR ID', () => {
    cy.get('button[aria-label="Next Page"]').click();
    cy.wait('@institutionsPage');
    cy.get('input[placeholder=Search]').type('institution 21');
    cy.wait('@institutionsPage')
      .its('request.body.variables')
      .should('include', {
        searchText: 'institution 21',
        offset: 0,
      });
    cy.contains('1-1 of 1');
    cy.contains('td', 'Institution 21');
    cy.get('input[placeholder=Search]').clear().type('sWeDeN');
    cy.contains('1-10 of 21');
    cy.get('input[placeholder=Search]').clear().type('example21');
    cy.contains('1-1 of 1');
    cy.contains('td', 'Institution 21');
    cy.get('input[placeholder=Search]').clear().type('no match');
    cy.contains('No records to display');
    cy.get('input[placeholder=Search]').clear();
    cy.contains('1-10 of 21');
  });

  it('moves to the previous page after deleting the last row', () => {
    cy.get('button[aria-label="Last Page"]').click();
    cy.contains('21-21 of 21');
    cy.contains('td', 'Institution 21')
      .closest('tr')
      .find('[aria-label=Delete]')
      .click();
    cy.get('[aria-label=Save]').click();
    cy.contains('Institution removed successfully!');
    cy.contains('11-20 of 20');
    cy.contains('td', 'Institution 21').should('not.exist');
  });

  it('refetches the active search after editing an institution', () => {
    cy.get('input[placeholder=Search]').type('Institution 01');
    cy.contains('1-1 of 1');
    cy.get('[aria-label=Edit]').click();
    cy.get('#name').clear().type('Renamed institution');
    cy.get('[data-cy=submit]').click();
    cy.contains('Institution updated successfully!');
    cy.contains('No records to display');
    cy.get('input[placeholder=Search]').should('have.value', 'Institution 01');
    cy.get('input[placeholder=Search]').clear().type('Renamed');
    cy.contains('1-1 of 1');
    cy.contains('td', 'Renamed institution');
  });
});
