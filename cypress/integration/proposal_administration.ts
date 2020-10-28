import faker from 'faker';

context('Proposal administration tests', () => {
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
    cy.login('user');
    cy.createProposal();
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[data-cy=view-proposal]').click();

    cy.contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('#mui-component-select-proposalStatus').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[id="menu-proposalStatus"] [role="option"]')
      .first()
      .click();

    cy.get('[data-cy=commentForUser]').type(textUser);

    cy.get('[data-cy=commentForManagement]').type(textManager);

    cy.contains('Update').click();

    cy.notification({ variant: 'success', text: 'Updated' });

    cy.reload();

    cy.contains('Admin').click();

    cy.contains(textUser);

    cy.contains(textManager);

    cy.contains('Accepted');

    cy.contains('DRAFT');

    cy.contains('Proposals').click();

    cy.contains('DRAFT');
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

    cy.contains('Proposals').click();

    cy.request('GET', '/proposal/download/1').then(response => {
      expect(response.headers['content-type']).to.be.equal('application/pdf');
      expect(response.status).to.be.equal(200);
    });
  });

  it('Should be able to save table selection state in url', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[type="checkbox"]')
      .eq(1)
      .click();

    cy.url().should('contain', 'selection=');

    cy.reload();

    cy.contains('1 row(s) selected');
  });

  it('Should be able to save table search state in url', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[placeholder="Search"]').type('test');

    cy.url().should('contain', 'search=test');

    cy.reload();

    cy.get('[placeholder="Search"]').should('have.value', 'test');
  });
});
