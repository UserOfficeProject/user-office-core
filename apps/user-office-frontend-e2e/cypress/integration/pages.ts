import faker from 'faker';

context('Page tests', () => {
  beforeEach(() => {
    cy.resetDB();
  });

  const faqContents = faker.random.words(2);

  it('Should be able update FAQ', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Pages').click();

    cy.contains('Set user homepage');
    cy.contains('Help').click();

    cy.setTinyMceContent('HELPPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HELPPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
    );

    cy.reload();
    cy.contains('Proposals').click();
    cy.contains('FAQ').click();

    cy.get('[role="presentation"]').should('exist');

    cy.contains(faqContents);
    cy.contains('Close').click();
  });
});
