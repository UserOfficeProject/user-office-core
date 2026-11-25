import { TemplateGroupId } from '@user-office-software-libs/shared-types';

type TemplateRow = {
  templateId: number;
  name: string;
  description: string;
  isArchived: boolean;
  questionaryCount: number;
  callCount: number;
};

context('Server-paginated template lists', () => {
  let templates: TemplateRow[];

  beforeEach(() => {
    templates = Array.from({ length: 26 }, (_, index) => ({
      templateId: index + 1,
      name: `Pagination template ${String(index + 1).padStart(2, '0')}`,
      description: 'Searchable pagination description',
      isArchived: false,
      questionaryCount: 0,
      callCount: 0,
    }));
    cy.getAndStoreFeaturesEnabled();
    cy.login('officer');
    cy.intercept('POST', '/graphql', (request) => {
      const { operationName, variables } = request.body;
      if (operationName === 'getTemplatesPage') {
        request.alias = 'templatesPage';
        const search = (variables.searchText || '').trim().toLowerCase();
        const matching = templates
          .filter(
            (template) =>
              template.isArchived === variables.isArchived &&
              `${template.name} ${template.description}`
                .toLowerCase()
                .includes(search)
          )
          .sort((a, b) => {
            const comparison =
              variables.sortField === 'description'
                ? a.description.localeCompare(b.description)
                : variables.sortField === 'callCount'
                  ? a.callCount - b.callCount
                  : variables.sortField === 'questionaryCount'
                    ? a.questionaryCount - b.questionaryCount
                    : a.name.localeCompare(b.name);

            return variables.sortDirection === 'desc'
              ? -comparison
              : comparison;
          });
        request.reply({
          data: {
            templatesPage: {
              totalCount: matching.length,
              templates: matching.slice(
                variables.offset,
                variables.offset + variables.first
              ),
            },
          },
        });
      } else if (operationName === 'updateTemplate') {
        const template = templates.find(
          (template) => template.templateId === variables.templateId
        );
        if (!template) throw new Error('Test template not found');
        template.isArchived = variables.isArchived;
        request.reply({ data: { updateTemplate: template } });
      } else if (operationName === 'deleteTemplate') {
        const template = templates.find(
          (template) => template.templateId === variables.id
        );
        templates = templates.filter(
          (template) => template.templateId !== variables.id
        );
        request.reply({ data: { deleteTemplate: template } });
      } else if (operationName === 'cloneTemplate') {
        const template = templates.find(
          (template) => template.templateId === variables.templateId
        );
        if (!template) throw new Error('Test template not found');
        const clone = {
          ...template,
          templateId: 100,
          name: `${template.name} copy`,
        };
        templates.push(clone);
        request.reply({ data: { cloneTemplate: clone } });
      }
    });
  });

  it('restores search, page, page size and sorting after reload and navigation', () => {
    cy.visit(
      '/ProposalTemplates?search=pagination&page=1&pageSize=10&sortField=name&sortDirection=desc'
    );
    cy.wait('@templatesPage').its('request.body.variables').should('include', {
      group: TemplateGroupId.PROPOSAL,
      isArchived: false,
      searchText: 'pagination',
      first: 10,
      offset: 10,
      sortField: 'name',
      sortDirection: 'desc',
    });
    cy.contains('11-20 of 26');
    cy.contains('td', 'Pagination template 16');
    cy.get('input[placeholder=Search]').should('have.value', 'pagination');

    cy.reload();
    cy.contains('11-20 of 26');
    cy.contains('td', 'Pagination template 16');
    cy.get('input[placeholder=Search]').should('have.value', 'pagination');

    cy.get('button[aria-label="Next Page"]').click();
    cy.contains('21-26 of 26');
    cy.location('search').should('include', 'page=2');

    cy.go('back');
    cy.contains('11-20 of 26');
    cy.contains('td', 'Pagination template 16');
    cy.go('forward');
    cy.contains('21-26 of 26');

    cy.get('input[placeholder=Search]').clear().type('description');
    cy.contains('1-10 of 26');
    cy.location('search').should('include', 'page=0');
    cy.location('search').should('include', 'search=description');

    cy.get('input[placeholder=Search]').clear().type('template 26');
    cy.contains('1-1 of 1');
    cy.contains('td', 'Pagination template 26');
    cy.reload();
    cy.contains('1-1 of 1');
    cy.get('input[placeholder=Search]').should('have.value', 'template 26');
  });

  it('persists page-size and sorting changes without resetting a searched page on reload', () => {
    cy.visit('/ProposalTemplates?search=pagination&page=1&pageSize=10');
    cy.contains('11-20 of 26');
    cy.get('[aria-label="Rows per page:"]').click();
    cy.get('[role=listbox]').contains('20').click();
    cy.contains('1-20 of 26');
    cy.location('search').should('include', 'pageSize=20');
    cy.get('button[aria-label="Next Page"]').click();
    cy.contains('21-26 of 26');
    cy.reload();
    cy.contains('21-26 of 26');

    cy.get('[data-testid=mtableheader-sortlabel]').contains('Name').click();
    cy.contains('1-20 of 26');
    cy.location('search').should('include', 'sortField=name');
    cy.location('search').should('include', 'sortDirection=asc');
    cy.reload();
    cy.get('span[aria-sort=ascending]').should('contain', 'Name');
  });

  it('refreshes usage and pagination after cloning, archiving, unarchiving and deleting', () => {
    cy.visit('/ProposalTemplates?search=pagination&page=2&pageSize=10');
    cy.contains('21-26 of 26');
    cy.contains('td', 'Pagination template 26')
      .closest('tr')
      .find('[aria-label=Clone]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.contains('21-27 of 27');

    cy.contains('td', 'Pagination template 26 copy')
      .closest('tr')
      .find('[aria-label=Archive]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.contains('21-26 of 26');

    cy.contains('[role=tab]', 'Archived').click();
    cy.contains('1-1 of 1');
    cy.location('search').should('include', 'page=0');
    cy.contains('td', 'Pagination template 26 copy');
    cy.reload();
    cy.contains('1-1 of 1');
    cy.contains('td', 'Pagination template 26 copy')
      .closest('tr')
      .find('[aria-label=Unarchive]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.contains('No templates found');

    cy.contains('[role=tab]', 'Current').click();
    cy.get('input[placeholder=Search]').clear().type('template 26');
    cy.contains('1-2 of 2');
    cy.contains('td', 'Pagination template 26 copy')
      .closest('tr')
      .find('[aria-label=Delete]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.contains('1-1 of 1');
    cy.get('input[placeholder=Search]').should('have.value', 'template 26');
  });

  it('moves to the last available page after deleting its final row', () => {
    templates = templates.slice(0, 21);
    cy.visit('/ProposalTemplates?search=pagination&page=2&pageSize=10');
    cy.contains('21-21 of 21');
    cy.contains('td', 'Pagination template 21')
      .closest('tr')
      .find('[aria-label=Delete]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.contains('11-20 of 20');
    cy.location('search').should('include', 'page=1');
    cy.reload();
    cy.contains('11-20 of 20');
  });

  it('handles empty searches and invalid URL state', () => {
    cy.visit(
      '/ProposalTemplates?search=no-match&page=-1&pageSize=invalid&sortField=invalid&sortDirection=desc'
    );
    cy.wait('@templatesPage').its('request.body.variables').should('include', {
      first: 10,
      offset: 0,
      searchText: 'no-match',
    });
    cy.contains('No templates found');
    cy.get('input[placeholder=Search]').clear();
    cy.contains('1-10 of 26');
  });
});
