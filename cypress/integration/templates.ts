import faker from 'faker';

context('Template tests', () => {
  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.viewport(1100, 1100);
    cy.visit('/');
  });

  let boolId: string;
  let textId: string;
  let dateId: string;
  let multipleChoiceId: string;
  let intervalId: string;
  let numberId: string;
  const booleanQuestion = faker.lorem.words(2);
  const textQuestion = faker.lorem.words(2);
  const dateQuestion = faker.lorem.words(2);
  const fileQuestion = faker.lorem.words(2);
  const intervalQuestion = faker.lorem.words(2);
  const numberQuestion = faker.lorem.words(3);
  const multipleChoiceQuestion = faker.lorem.words(2);
  const multipleChoiceAnswers = [
    faker.lorem.words(2),
    faker.lorem.words(2),
    faker.lorem.words(2),
  ];

  const dateTooltip = faker.lorem.words(2);

  const topic = faker.lorem.words(2);
  const title = faker.lorem.words(3);
  const abstract = faker.lorem.words(8);
  const textAnswer = faker.lorem.words(5);

  const sampleDeclarationName = faker.lorem.words(2);
  const sampleDeclarationDescription = faker.lorem.words(5);

  const minimumCharacters = 1000;

  it('User officer should be able to create sample declaration template', () => {
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
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Text Input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(textQuestion);

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(textQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
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

    cy.createTopic(topic);

    cy.get('[data-cy=show-more-button]')
      .last()
      .click();

    cy.get('[data-cy=add-question-menu-item]')
      .last()
      .click();

    /* Boolean */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Boolean').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(booleanQuestion);

    cy.contains('Save').click();

    cy.contains(booleanQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        boolId = fieldId;
      });

    cy.contains(booleanQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    /* --- */

    /* Interval */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Interval').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(intervalQuestion);

    cy.get('[data-cy=property]').click();

    cy.contains('energy').click();

    cy.get('[data-cy=units]>[role=button]').click({ force: true });

    cy.contains('btu').click();

    cy.contains('joule').click();

    cy.get('body').type('{esc}');

    cy.contains('Save').click();

    cy.contains(intervalQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        intervalId = fieldId;
      });

    cy.contains(intervalQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);
    /* --- */

    /* Number */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add Number').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(numberQuestion);

    cy.get('[data-cy=property]').click();

    cy.contains('energy').click();

    cy.get('[data-cy=units]>[role=button]').click({ force: true });

    cy.contains('btu').click();

    cy.contains('joule').click();

    cy.get('body').type('{esc}');

    cy.contains('Save').click();

    cy.contains(numberQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        numberId = fieldId;
      });

    cy.contains(numberQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);
    /* --- */

    /* Text input */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Text Input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(textQuestion);

    cy.contains('Is required').click();

    cy.contains('Multiple lines').click();

    cy.get('[data-cy=max]').type(minimumCharacters.toString());

    cy.contains('Save').click();

    cy.contains(textQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
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

    cy.contains(textQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }])
      .wait(500);

    cy.contains(textQuestion).click();

    // Updating dependencies
    cy.get('[data-cy="add-dependency-button"]').click();
    cy.get('#dependency-id').click();
    cy.get('[data-cy=question-relation-dialogue]')
      .get('#menu- > .MuiPaper-root > .MuiList-root > [tabindex="0"]')
      .click(); // get boolean question

    cy.get('#dependencyValue').click();
    cy.get('[data-cy=question-relation-dialogue]')
      .get("#menu- > .MuiPaper-root > .MuiList-root > [tabindex='0']")
      .click(); // get true from dropdown

    cy.contains('Update').click();

    // Check reordering
    cy.contains(textQuestion)
      .parent()
      .dragElement([{ direction: 'up', length: 1 }])
      .wait(500); // Move item to top, in case it isn't

    cy.contains(topic)
      .closest('[data-rbd-draggable-context-id]') // new topic column
      .find('[data-rbd-drag-handle-draggable-id]') // all questions
      .first() // first question
      .contains(textQuestion);

    cy.contains(textQuestion)
      .parent()
      .dragElement([{ direction: 'down', length: 1 }])
      .wait(500);

    cy.contains(topic)
      .closest('[data-rbd-draggable-context-id]') // new topic column
      .find('[data-rbd-drag-handle-draggable-id]') // all questions
      .first() // first question
      .should('not.contain', textQuestion);

    /* Selection from options */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Multiple choice').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(multipleChoiceQuestion);

    cy.contains('Radio').click();

    cy.contains('Dropdown').click();

    cy.contains('Is multiple select').click();

    cy.contains('Items').click();

    cy.get('[data-cy=add-answer-button]')
      .closest('button')
      .click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[0]);
    cy.get('[title="Save"]').click();

    cy.get('[data-cy=add-answer-button]')
      .closest('button')
      .click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[1]);
    cy.get('[title="Save"]').click();

    cy.get('[data-cy=add-answer-button]')
      .closest('button')
      .click();
    cy.get('[placeholder=Answer]').type(multipleChoiceAnswers[2]);
    cy.get('[title="Save"]').click();

    cy.get('[index=0]').should('not.contain', multipleChoiceAnswers[1]);

    cy.contains(multipleChoiceAnswers[1])
      .closest('tr')
      .find('[title=Up]')
      .click();

    cy.get('[index=0]').contains(multipleChoiceAnswers[1]);

    cy.contains(multipleChoiceAnswers[1])
      .closest('tr')
      .find('[title=Down]')
      .click();

    cy.contains('Save').click();

    cy.contains(multipleChoiceQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        multipleChoiceId = fieldId;
      });

    cy.contains(multipleChoiceQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    /* --- */

    /* Date */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Date').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(dateQuestion);

    cy.contains('Is required').click();

    cy.contains('Save').click();

    cy.contains(dateQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        dateId = fieldId;
      });

    cy.contains(dateQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);
    /* --- */

    /* File */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add File Upload').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(fileQuestion);

    cy.contains('Save').click();

    cy.contains(fileQuestion);

    cy.contains(fileQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);
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
      .find("[title='Clone']")
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
      .find("[title='Delete']")
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
      .find("[title='Archive']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('default template').should('not.exist');

    cy.contains('Archived').click();

    cy.contains('default template');

    cy.contains('default template')
      .parent()
      .find("[title='Unarchive']")
      .first()
      .click();

    cy.contains('Yes').click();
  });

  it('User can create proposal', () => {
    cy.login('user');

    cy.createProposal(title, abstract);
    cy.get(`[data-cy="${intervalId}.min"]`)
      .click()
      .type('1');
    cy.get(`[data-cy="${intervalId}.max"]`)
      .click()
      .type('2');
    cy.get(`[data-cy="${numberId}.value"]`)
      .click()
      .type('1');
    cy.get(`#${boolId}`).click();
    cy.get(`#${textId}`)
      .clear()
      .type('this_word_{enter}should_be_multiline');
    cy.contains('this_word_should_be_multiline').should('not.exist');
    cy.get(`#${textId}`)
      .clear()
      .type(textAnswer);
    cy.contains(`${textAnswer.length}/${minimumCharacters}`);
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
  });

  it('User officer can add multiple choice question as a dependency', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[data-cy="create-new-button"]').click();

    cy.get('[data-cy="name"]').type('Proposal template 1');

    cy.get('[data-cy="description"]').type('Proposal template description 1');

    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Multiple choice').click();

    cy.get('[data-cy="question"]')
      .clear()
      .type('Multichoice question');

    cy.contains('Items').click();

    cy.get('[data-cy=add-answer-button]')
      .closest('button')
      .click();
    cy.get('input[placeholder="Answer"]').type('Answer 1');
    cy.get('[title="Save"]').click();

    cy.get('[data-cy=add-answer-button]')
      .closest('button')
      .click();
    cy.get('input[placeholder="Answer"]').type('Answer 2');
    cy.get('[title="Save"]').click();

    cy.contains('Save').click();

    cy.finishedLoading();

    cy.contains('Multichoice question')
      .parent()
      .dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 1 },
      ]);

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Boolean').click();

    cy.get('[data-cy=question]')
      .clear()
      .type('Boolean question');

    cy.contains('Save').click();

    cy.contains('Boolean question')
      .parent()
      .dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 2 },
      ])
      .wait(500);

    cy.finishedLoading();

    cy.contains('Boolean question').click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]').click();

    cy.get('[role="presentation"]')
      .contains('Multichoice question')
      .click();

    cy.get('[id="dependencyValue"]').click();

    cy.contains('Answer 1').click();

    cy.get('[data-cy="submit"]').click();

    cy.contains('Calls').click();
    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="call-template"]').click();
    cy.contains('Proposal template 1').click();

    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains('Multichoice question');

    cy.get('main form').should('not.contain.text', 'Boolean question');

    cy.contains('Answer 1').click();
    cy.contains('Boolean question').click();
    cy.contains('Answer 2').click();
    cy.get('main form').should('not.contain.text', 'Boolean question');
  });

  it('User officer can add multiple dependencies on a question', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[title="Edit"]')
      .last()
      .click();

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    cy.get('[data-cy=questionPicker] [data-cy="proposal-question-id"]')
      .first()
      .click();

    cy.get('[data-cy="question"]')
      .clear()
      .type('Question with multiple dependencies');

    cy.get('[data-cy="submit"]').click();

    cy.contains('Question with multiple dependencies')
      .parent()
      .dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 3 },
      ]);

    cy.finishedLoading();

    cy.contains('Question with multiple dependencies').click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]').click();

    cy.get('[role="presentation"]')
      .contains('Multichoice question')
      .click();

    cy.get('[id="dependencyValue"]').click();

    cy.contains('Answer 1').click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]')
      .last()
      .click();

    cy.get('[role="presentation"]')
      .contains('Boolean question')
      .click();

    cy.get('[id="dependencyValue"]')
      .last()
      .click();

    cy.contains('true').click();

    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains('Multichoice question');

    cy.get('main form').should('not.contain.text', 'Boolean question');
    cy.get('main form').should(
      'not.contain.text',
      'Question with multiple dependencies'
    );

    cy.contains('Answer 1').click();
    cy.contains('Boolean question').click();
    cy.get('main form').should(
      'contain.text',
      'Question with multiple dependencies'
    );
    cy.contains('Answer 2').click();
    cy.get('main form').should('not.contain.text', 'Boolean question');
    cy.get('main form').should(
      'not.contain.text',
      'Question with multiple dependencies'
    );
  });

  it('User officer can can change dependency logic operator', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[title="Edit"]')
      .last()
      .click();

    cy.contains('Question with multiple dependencies').click();

    cy.get('[data-cy="dependencies-operator"]').click();

    cy.get('[data-value="OR"]').click();

    cy.get('[id="dependencyValue"]')
      .first()
      .click();

    cy.contains('Answer 2').click();

    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains('Multichoice question');

    cy.get('main form').should('not.contain.text', 'Boolean question');
    cy.get('main form').should(
      'not.contain.text',
      'Question with multiple dependencies'
    );

    cy.contains('Answer 1').click();
    cy.contains('Boolean question');
    cy.get('main form').should(
      'not.contain.text',
      'Question with multiple dependencies'
    );
    cy.contains('Boolean question').click();
    cy.get('main form').should(
      'contain.text',
      'Question with multiple dependencies'
    );
    cy.contains('Boolean question').click();
    cy.get('main form').should(
      'not.contain.text',
      'Question with multiple dependencies'
    );
    cy.contains('Answer 2').click();
    cy.get('main form').should('not.contain.text', 'Boolean question');
    cy.get('main form').should(
      'contain.text',
      'Question with multiple dependencies'
    );
  });
});
