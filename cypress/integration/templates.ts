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
  let multipleChoiceId: string;

  const booleanQuestion = faker.lorem.words(2);
  const textQuestion = faker.lorem.words(2);
  const dateQuestion = faker.lorem.words(2);
  const fileQuestion = faker.lorem.words(2);
  const multipleChoiceQuestion = faker.lorem.words(2);
  const multipleChoiceAnswers = [
    faker.lorem.words(2),
    faker.lorem.words(2),
    faker.lorem.words(2),
  ];

  const dateTooltip = faker.lorem.words(2);

  const topic = faker.lorem.words(1);
  const title = faker.lorem.words(3);
  const abstract = faker.lorem.words(8);
  const textAnswer = faker.lorem.words(5);

  const sampleDeclarationName = faker.lorem.words(2);
  const sampleDeclarationDescription = faker.lorem.words(5);

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

    cy.contains('Add Text Input').click();

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

    cy.get('[data-cy=show-more-button]').click();

    cy.get('[data-cy=add-topic-menu-item]').click();

    cy.get('[data-cy=topic-title]')
      .last()
      .click();

    cy.get('[data-cy=topic-title-input]')
      .last()
      .clear()
      .type(`${topic}{enter}`);

    cy.get('[data-cy=show-more-button]')
      .last()
      .click();

    cy.get('[data-cy=add-question-menu-item]')
      .last()
      .click();

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

    cy.contains('Add Text Input').click();

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
    cy.get('[data-cy=question-relation-dialogue]')
      .get('#menu- > .MuiPaper-root > .MuiList-root > [tabindex="0"]')
      .click(); // get boolean question

    cy.get('#dependencyValue').click();
    cy.get('[data-cy=question-relation-dialogue]')
      .get("#menu- > .MuiPaper-root > .MuiList-root > [tabindex='0']")
      .click(); // get true from dropdown

    cy.contains('Update').click();

    /* Selection from options */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add Multiple choice').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(multipleChoiceQuestion);

    cy.contains('Radio').click();

    cy.contains('Dropdown').click();

    cy.contains('Is multiple select').click();

    cy.get('[title=Add]').click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[0]);
    cy.get('[title=Save]').click();

    cy.get('[title=Add]').click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[1]);
    cy.get('[title=Save]').click();

    cy.get('[title=Add]').click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[2]);
    cy.get('[title=Save]').click();

    cy.contains('Save').click();

    cy.contains(multipleChoiceQuestion)
      .siblings("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        multipleChoiceId = fieldId;
      });

    cy.get('body').type('{alt}', { release: false });
    cy.contains(multipleChoiceQuestion).click();

    /* --- */

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

    cy.contains('Add File Upload').click();

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

    cy.createProposal(title, abstract);
    cy.get(`#${boolId}`).click();
    cy.get(`#${textId}`).type(textAnswer);
    cy.get(`[data-cy='${dateId}_field'] button`).click();
    cy.wait(300);
    cy.get(`[data-cy='${dateId}_field'] button`).click({ force: true }); // click twice because ui hangs sometimes
    cy.contains('15').click({ force: true });
    cy.contains('OK').click();

    cy.get(`#${multipleChoiceId}`).click();
    cy.contains(multipleChoiceAnswers[0]).click();
    cy.contains(multipleChoiceAnswers[2]).click();
    cy.get('body').type('{esc}');

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(title);
    cy.contains(abstract);
    cy.contains(textAnswer);
    cy.contains(multipleChoiceAnswers[0]);
    cy.contains(multipleChoiceAnswers[1]).should('not.exist');
    cy.contains(multipleChoiceAnswers[2]);

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');
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

    cy.get('[data-cy=show-more-button]')
      .last()
      .click();
    cy.get('[data-cy=add-topic-menu-item]')
      .last()
      .click();
  });
});
