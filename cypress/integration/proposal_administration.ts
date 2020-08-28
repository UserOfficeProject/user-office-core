/// <reference types="Cypress" />
/// <reference types="../types" />

context('Proposal administration tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 900);
    cy.visit('/');
  });

  const textUser = faker.random.words(5);

  const textManager = faker.random.words(5);

  it('Should be able to set comment for user/manager and final status', () => {
    const title = faker.random.words(3);
    const abstract = faker.random.words(8);
    cy.login('user');
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.wait(500);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('View Proposals').click();

    cy.get('[data-cy=view-proposal]').click();

    cy.contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('#mui-component-select-proposalStatus').click();

    cy.contains('Draft').click();

    cy.get('[data-cy=commentForUser]').type(textUser);

    cy.get('[data-cy=commentForManagement]').type(textManager);

    cy.contains('Update').click();

    cy.wait(1000);

    cy.reload();

    cy.contains('Admin').click();

    cy.contains(textUser);

    cy.contains(textManager);

    cy.contains('Accepted');

    cy.contains('Draft');

    cy.contains('View Proposals').click();

    cy.contains('Open');
  });

  it('Check if link for download proposal is created with the correct attributes', () => {
    cy.login('officer');

    cy.document().then(document => {
      const observer = new MutationObserver(function() {
        const [mutationList] = arguments;
        for (const mutation of mutationList) {
          for (const child of mutation.addedNodes) {
            if (child.nodeName === 'A') {
              expect(child.href).to.contain('/proposal/download/1');
              expect(child.download).to.contain('download');
            }
          }
        }
      });
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      observer.disconnect();
    });

    cy.get('[data-cy="download-proposal"]')
      .first()
      .click();
  });

  it('Should be able to download proposal pdf', () => {
    cy.login('officer');

    cy.contains('View Proposals').click();

    cy.request('GET', '/proposal/download/1').then(response => {
      expect(response.headers['content-type']).to.be.equal('application/pdf');
      expect(response.status).to.be.equal(200);
    });
  });
});
