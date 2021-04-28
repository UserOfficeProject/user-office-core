import faker from 'faker';

context('Questions tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 1100);
    cy.visit('/');
  });

  const textQuestion = faker.lorem.words(2);

  it('User officer search questions', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template').parent().get("[title='Edit']").click();

    cy.createTextQuestion(textQuestion, {
      isRequired: true,
      isMultipleLines: true,
    });

    cy.get('[data-cy=officer-menu-items]').contains('Questions').click();

    cy.get('[data-cy=category-dropdown]').click();
    cy.get('[role=presentation] ').contains('Sample declaration').click();

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=category-dropdown]').click();
    cy.get('[role=presentation]').contains('Proposal').click();

    cy.get('[data-cy=type-dropdown]').click();
    cy.get('[role=presentation] ').contains('Boolean').click();

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=type-dropdown]').click();
    cy.get('[role=presentation]').contains('Text Input').click();

    cy.contains(textQuestion);

    const modifiedQuestion = textQuestion.split('').reverse().join();
    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${modifiedQuestion}{enter}`);

    cy.contains(textQuestion).should('not.exist');

    cy.get('[data-cy=search-input] input')
      .clear()
      .type(`${textQuestion}{enter}`);

    cy.contains(textQuestion);
  });
});
