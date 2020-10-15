import faker from 'faker';

context('Template tests', () => {
  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.viewport(1100, 800);
    cy.visit('/');
  });

  let boolId: string;
  let textId: string;
  let dateId: string;
  const booleanQuestion = faker.random.words(2);
  const textQuestion = faker.random.words(2);
  const dateQuestion = faker.random.words(2);
  const fileQuestion = faker.random.words(2);

  const dateTooltip = faker.random.words(2);

  const topic = faker.random.words(1);
  const title = faker.random.words(3);
  const abstract = faker.random.words(8);
  const textAnswer = faker.random.words(5);

  const sampleDeclarationName = faker.random.words(2);
  const sampleDeclarationDescription = faker.random.words(5);

  it('User officer can create sample declaration template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Sample declaration templates');

    cy.get('[data-cy="create-new-button"]').click();

    cy.get('[data-cy="name"]').type(sampleDeclarationName);

    cy.get('[data-cy="description"]').type(sampleDeclarationDescription);

    cy.get('[data-cy="submit"]').click();

    cy.contains(sampleDeclarationName);

    cy.get('[data-cy=topic-title]').click();

    cy.get('[data-cy=topic-title-input]')
      .clear()
      .type(`${faker.random.words(1)}{enter}`);

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    /* Add Text Input */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add Text input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(textQuestion);

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(textQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        textId = fieldId;
      });
  });

  it('User officer can modify proposal template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template')
      .parent()
      .get("[title='Edit']")
      .first()
      .click();

    cy.contains('Add topic').click();

    cy.get('[data-cy=topic-title]').click();

    cy.get('[data-cy=topic-title-input]')
      .clear()
      .type(`${topic}{enter}`);

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    /* Boolean */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

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

    cy.get('body').type('{alt}', { release: false });
    cy.contains(booleanQuestion).click();

    /* --- */

    /* Text input */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add Text input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(textQuestion);

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(textQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        textId = fieldId;
      });

    /* Update question */
    const newKey = faker.random
      .word()
      .toLowerCase()
      .split(/\s|-/) // replace spaces and dashes
      .join('_');

    cy.contains(textQuestion).click();

    cy.get("[data-cy='natural_key']")
      .clear()
      .type(newKey);

    cy.contains('Save').click();

    cy.wait(500);

    cy.contains(newKey);
    /* --- */

    // ALT clicking assigns question to topic
    cy.get('body').type('{alt}', { release: false });
    cy.contains(textQuestion).click();

    // wait until ALT CLICK finishes
    cy.wait(500);

    cy.contains(textQuestion).click();

    // Updating dependencies
    cy.get('#dependency-id').click();
    cy.get('#menu- > .MuiPaper-root > .MuiList-root').click(); // Get first answer from dropdown

    cy.get('#dependencyValue').click();
    cy.get("#menu- > .MuiPaper-root > .MuiList-root > [tabindex='0']").click(); // get true from fropdown

    cy.contains('Update').click();

    /* Date */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

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

    cy.get('body').type('{alt}', { release: false });
    cy.contains(dateQuestion).click();
    /* --- */

    /* File */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add File upload').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(fileQuestion);

    cy.contains('Save').click();

    cy.contains(fileQuestion);

    cy.get('body').type('{alt}', { release: false });
    cy.contains(fileQuestion).click();
    /* --- */

    /* --- Update templateQuestionRelation */
    cy.contains(dateQuestion).click();
    cy.get("[data-cy='tooltip'] input")
      .clear()
      .type(dateTooltip);

    cy.contains('Update').click();

    cy.reload();

    cy.contains(dateQuestion).click();
    cy.get("[data-cy='tooltip'] input").should('have.value', dateTooltip);
    cy.get('body').type('{esc}');
    /* --- */

    cy.contains(booleanQuestion);
    cy.contains(textQuestion);
    cy.contains(dateQuestion);
  });

  it('User officer can clone template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template')
      .parent()
      .get("[title='Clone']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains('Copy of default template');
  });

  it('User officer can delete template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('Copy of default template')
      .parent()
      .get("[title='Delete']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains('Copy of default template').should('not.exist');
  });

  it('User officer archive template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template')
      .parent()
      .get("[title='Archive']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains('default template').should('not.exist');

    cy.contains('Archived').click();

    cy.contains('default template');

    cy.contains('default template')
      .parent()
      .get("[title='Unarchive']")
      .first()
      .click();

    cy.contains('Yes').click();
  });

  it('User can create proposal', () => {
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
    cy.contains('15').click({ force: true });
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

  it('Officer can save proposal column selection', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get("[title='Show Columns']")
      .first()
      .click();
    cy.get('.MuiPopover-paper')
      .contains('Call')
      .click();
    cy.get('.MuiPopover-paper')
      .contains('SEP')
      .click();

    cy.get('body').click();

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.contains('Proposals').click();

    cy.contains('Call');
    cy.contains('SEP');
  });

  it('Officer can delete proposal', () => {
    cy.login('officer');

    cy.contains('Proposals').click();
    cy.get('[type="checkbox"]')
      .first()
      .check();
    cy.get("[title='Delete proposals']")
      .first()
      .click();
    cy.get('.MuiDialog-root')
      .contains('Yes')
      .click();
  });

  it('Officer can delete proposal questions', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get("[title='Edit']")
      .first()
      .click();

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
