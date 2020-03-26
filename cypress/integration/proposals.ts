/// <reference types="Cypress" />
/// <reference types="../types" />
var faker = require('faker');

context('Proposal tests', () => {
  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.viewport(1100, 800);
    cy.visit('/');
  });

  let boolId;
  let textId;
  let dateId;
  const booleanQuestion = faker.random.words(2);
  const textQuestion = faker.random.words(2);
  const dateQuestion = faker.random.words(2);
  const fileQuestion = faker.random.words(2);

  const topic = faker.random.words(1);
  const title = faker.random.words(3);
  const abstract = faker.random.words(8);
  const textAnswer = faker.random.words(5);

  it('Should be able to modify proposal', () => {
    cy.login('officer');

    cy.contains('Edit Questionary').click();

    cy.contains('Add topic').click();

    cy.get('[data-cy=topic-title]').click();

    cy.get('[data-cy=topic-title-input]')
      .clear()
      .type(`${topic}{enter}`);

    /* Select from options */
    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add Boolean').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(booleanQuestion);

    cy.contains('Save').click();

    cy.contains(booleanQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        boolId = fieldId;
      });
    /* --- */

    /* Text input */
    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add Text input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(textQuestion);

    cy.get('#dependency-id').click();
    cy.get('#menu- > .MuiPaper-root > .MuiList-root').click(); // Get first answer from dropdown

    cy.get('#dependencyValue').click();
    cy.get("#menu- > .MuiPaper-root > .MuiList-root > [tabindex='0']").click(); // get true from fropdown

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(textQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        textId = fieldId;
      });

    /* Date */
    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add Date').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(dateQuestion);

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(dateQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        dateId = fieldId;
      });
    /* --- */

    /* File */
    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add File upload').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(fileQuestion);

    cy.contains('Save').click();

    cy.contains(dateQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        dateId = fieldId;
      });
    /* --- */


    /* Update question */
    const newKey = faker
    .random
    .word()
    .toLowerCase()
    .split(" ").join('_');

    cy.contains(textQuestion)
      .click();

    cy.get("[data-cy='natural_key']")
      .clear()
      .type(newKey);
    
    cy.contains("Save")
       .click();

    cy.wait(500)

    cy.contains(newKey);
    /* --- */

    cy.contains(booleanQuestion);
    cy.contains(textQuestion);
    cy.contains(dateQuestion);
  });

  it('User should be able to create proposal', () => {
    cy.login('user');

    cy.contains('New Proposal').click();

    cy.get('#title').type(title);

    cy.get('#abstract').type(abstract);

    cy.contains('Save and continue').click();
    cy.get(`#${boolId}`).click();
    cy.get(`#${textId}`).type(textAnswer);
    cy.get(`[data-cy='${dateId}_field'] button`).click();
    cy.wait(300);
    cy.get(`[data-cy='${dateId}_field'] button`).click({ force: true }); // click twice because ui hangs sometimes
    cy.contains('15').click();
    cy.contains('OK').click();

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(title);
    cy.contains(abstract);
    cy.contains(textAnswer);

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('Submitted');
  });

  it('Office should be able to delete proposal', () => {
    cy.login('officer');

    cy.contains('View Proposals').click();
    cy.get('[type="checkbox"]')
      .first()
      .check();
    cy.get("[title='Delete proposals']")
      .first()
      .click();
    cy.contains('Yes').click();
  });

  it('Office should be able to delete proposal questions', () => {
    cy.login('officer');

    cy.contains('Edit Questionary').click();

    cy.contains(textQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.contains(booleanQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.contains(dateQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.contains(fileQuestion).click();
    cy.get("[data-cy='delete']").click();

    cy.get('[data-cy=show-more-button]').click();
    cy.contains('Delete topic').click();
  });
});
