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
  let richTextInputId: string;

  const booleanQuestion = faker.lorem.words(2);
  const textQuestion = faker.lorem.words(2);
  const dateQuestion = faker.lorem.words(2);
  const fileQuestion = faker.lorem.words(2);
  const intervalQuestion = faker.lorem.words(2);
  const numberQuestion = faker.lorem.words(3);
  const richTextInputQuestion = faker.lorem.words(3);
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

    cy.contains('terajoule').click();

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

    cy.contains('terajoule').click();

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

    /* Rich Text Input */
    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add Rich Text Input').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(richTextInputQuestion);

    cy.contains('Save').click();

    cy.contains(richTextInputQuestion);

    cy.contains(richTextInputQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        richTextInputId = fieldId;
      });

    cy.contains(richTextInputQuestion)
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

    const richTextInputValue = faker.lorem.words(3);

    cy.window().then(win => {
      return new Cypress.Promise(resolve => {
        console.log('richTextInputId', richTextInputId);

        win.tinyMCE.editors[richTextInputId].setContent(richTextInputValue);
        win.tinyMCE.editors[richTextInputId].fire('blur');

        resolve();
      });
    });

    cy.get(`#${richTextInputId}_ifr`)
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .contains(richTextInputValue);

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(title);
    cy.contains(abstract);
    cy.contains(textAnswer);
    cy.contains(multipleChoiceAnswers[0]);
    cy.contains(multipleChoiceAnswers[1]).should('not.exist');
    cy.contains(multipleChoiceAnswers[2]);

    cy.contains(richTextInputQuestion);
    cy.get(`[data-cy="${richTextInputId}_open"]`).click();
    cy.get('[role="dialog"]').contains(richTextInputQuestion);
    cy.get('[role="dialog"]').contains(richTextInputValue);
    cy.get('[role="dialog"]')
      .contains('Close')
      .click();

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');
  });

  it('should render the Date field with default value and min max values when set', () => {
    let dateFieldId: any;

    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get("[title='Edit']")
      .first()
      .click();

    cy.get('[data-cy=show-more-button]')
      .first()
      .click();

    cy.get('[data-cy=add-question-menu-item]')
      .first()
      .click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Date').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(dateQuestion);

    cy.get('[data-cy="minDate"] input').type('2020-01-01');
    cy.get('[data-cy="maxDate"] input').type('2020-01-31');
    cy.get('[data-cy="defaultDate"] input').type('2020-01-10');

    cy.contains('Save').click();

    cy.contains(dateQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        dateFieldId = fieldId;
      });

    cy.contains(dateQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.wait(200);

    cy.contains(dateQuestion).click();

    cy.get('[data-cy="minDate"] input').should('have.value', '2020-01-01');
    cy.get('[data-cy="maxDate"] input').should('have.value', '2020-01-31');
    cy.get('[data-cy="defaultDate"] input').should('have.value', '2020-01-10');

    cy.get('[data-cy="minDate"] input')
      .clear()
      .type('2021-01-01');
    cy.get('[data-cy="maxDate"] input')
      .clear()
      .type('2021-01-31');
    cy.get('[data-cy="defaultDate"] input')
      .clear()
      .type('2021-01-10');

    cy.contains('Update').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains(dateQuestion);
    cy.get('body').then(() => {
      cy.get(`[data-cy="${dateFieldId}_field"] input`).as('dateField');

      cy.get('@dateField').should('have.value', '2021-01-10');

      cy.get('@dateField')
        .clear()
        .type('2020-01-01');
      cy.contains('Save and continue').click();
      cy.contains('Value must be a date at or after');

      cy.get('@dateField')
        .clear()
        .type('2022-01-01');
      cy.contains('Save and continue').click();
      cy.contains('Value must be a date at or before');

      cy.get('@dateField')
        .clear()
        .type('2021-01-15');
      cy.contains('Save and continue').click();
      cy.contains('Value must be a date at or').should('not.exist');
    });
  });

  it('should render the Number field accepting only positive, negative numbers if set', () => {
    let numberField1Id: any;
    let numberField2Id: any;
    const numberQuestion1 = faker.lorem.words(2);
    const numberQuestion2 = faker.lorem.words(2);

    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get("[title='Edit']")
      .first()
      .click();

    cy.get('[data-cy=show-more-button]')
      .first()
      .click();

    cy.get('[data-cy=add-question-menu-item]')
      .first()
      .click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Number').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(numberQuestion1);

    cy.get('[data-cy=property]').click();

    cy.contains('energy').click();

    cy.get('[data-cy=units]>[role=button]').click();

    cy.contains('btu').click();

    cy.contains('terajoule').click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy="numberValueConstraint"]').click();

    cy.contains('Only positive numbers').click();

    cy.contains('Save').click();

    cy.contains(numberQuestion1)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        numberField1Id = fieldId;
      });

    cy.contains(numberQuestion1)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Number').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(numberQuestion2);

    cy.get('[data-cy=property]').click();

    cy.contains('energy').click();

    cy.get('[data-cy=units]>[role=button]').click();

    cy.contains('btu').click();

    cy.contains('terajoule').click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy="numberValueConstraint"]').click();

    cy.contains('Only positive numbers').click();

    cy.contains('Save').click();

    cy.contains(numberQuestion2)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then(fieldId => {
        numberField2Id = fieldId;
      });

    cy.contains(numberQuestion2)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.wait(200);

    cy.contains(numberQuestion2).click();

    cy.get('[data-cy="property"] input').should('have.value', 'ENERGY');
    cy.get('[data-cy=units] input').should('have.value', 'btu,terajoule');
    cy.get('[data-cy="numberValueConstraint"] input').should(
      'have.value',
      'ONLY_POSITIVE'
    );

    cy.get('[data-cy="numberValueConstraint"]').click();

    cy.contains('Only negative numbers').click();

    cy.contains('Update').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains(numberQuestion1);
    cy.contains(numberQuestion2);
    cy.get('body').then(() => {
      console.log(`[data-cy="${numberField1Id}.value"] input`);
      console.log(`[data-cy="${numberField2Id}.value"] input`);

      cy.get(`[data-cy="${numberField1Id}.value"] input`).as('numberField1');
      cy.get(`[data-cy="${numberField2Id}.value"] input`).as('numberField2');

      cy.get('@numberField1').type('1{leftarrow}-');
      cy.get('@numberField2').type('1');

      cy.contains('Save and continue').click();
      cy.contains('Value must be a negative number');
      cy.contains('Value must be a positive number');

      cy.get('@numberField1')
        .clear()
        .type('1');
      cy.get('@numberField2')
        .clear()
        .type('1{leftarrow}-');

      cy.contains('Value must be a negative number').should('not.exist');
      cy.contains('Value must be a positive number').should('not.exist');
    });
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
    cy.get('[data-cy="confirm-ok"]').click();
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

    cy.on('window:confirm', str => {
      expect(str).to.equal(
        'Changes you recently made in this step will not be saved! Are you sure?'
      );

      return false;
    });

    cy.contains('Dashboard').click();

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

    cy.on('window:confirm', str => {
      expect(str).to.equal(
        'Changes you recently made in this step will not be saved! Are you sure?'
      );

      return false;
    });

    cy.contains('Review').click();

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

  it('User officer can change dependency logic operator', () => {
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

  it('User can add captions after uploading image/* file', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[title="Edit"]')
      .last()
      .click();

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add File Upload').click();

    cy.get('[data-cy="question"]')
      .clear()
      .type('File upload question');

    cy.get('[data-cy="max_files"] input')
      .clear()
      .type('5');

    cy.get('[data-cy="submit"]').click();

    cy.contains('File upload question')
      .parent()
      .dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 3 },
      ])
      .wait(500);

    cy.finishedLoading();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains('File upload question');

    cy.get('[data-cy="title"] input').type('Test title');
    cy.get('[data-cy="abstract"] textarea')
      .first()
      .type('Test abstract');

    cy.fixture('file_upload_test.png').then(fileContent => {
      // NOTE: Using "cypress-file-upload" version "^3.5.3" because this(https://github.com/abramenal/cypress-file-upload/issues/179) should be fixed before upgrading to the latest
      cy.get('input[type="file"]').upload({
        fileContent: fileContent.toString(),
        fileName: 'file_upload_test.png',
        mimeType: 'image/png',
      });

      cy.contains('file_upload_test');
      cy.get('[title="Add image caption"]').click();

      cy.get('[data-cy="image-figure"] input').type('Fig_test');
      cy.get('[data-cy="image-caption"] input').type('Test caption');

      cy.contains('Save and continue').click();

      cy.finishedLoading();

      cy.contains('Proposal information');

      cy.contains('file_upload_test');

      cy.contains('New proposal').click();

      cy.contains('file_upload_test');
      cy.get('[data-cy="image-caption"] input').should(
        'have.value',
        'Test caption'
      );
      cy.get('[data-cy="image-figure"] input').should(
        'have.value',
        'Fig_test'
      );
    });
  });

  it('should not let you create circular dependency chain', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    const templateName = faker.lorem.words(3);

    cy.contains('Create template').click();
    cy.get('[data-cy="name"]').type(templateName);
    cy.get('[data-cy="description"]').type(templateName);
    cy.get('[data-cy="submit"]').click();
    cy.contains(templateName);

    cy.get('[data-cy=show-more-button]')
      .last()
      .click();

    cy.get('[data-cy=add-question-menu-item]')
      .last()
      .click();

    const field1 = 'boolean_1_' + Date.now();
    const field2 = 'boolean_2_' + Date.now();
    const field3 = 'boolean_3_' + Date.now();

    function addBooleanField(fieldName: string) {
      cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
        .last()
        .click();
      cy.contains('Add Boolean').click();

      cy.get('[data-cy="natural_key"]')
        .clear()
        .type(fieldName);
      cy.get('[data-cy="question"]')
        .clear()
        .type(fieldName);
      cy.contains('Save').click();

      cy.contains(fieldName)
        .parent()
        .dragElement([{ direction: 'left', length: 1 }]);
    }

    addBooleanField(field1);
    addBooleanField(field2);
    addBooleanField(field3);

    cy.wait(200);

    function addDependency(
      fieldName: string,
      contains: string[],
      select?: string
    ) {
      cy.contains(fieldName).click();
      cy.get('[data-cy="add-dependency-button"]').click();
      cy.get('[id="dependency-id"]').click();

      contains.forEach(field => {
        cy.get('[role="listbox"]').contains(field);
      });

      if (contains.length === 0) {
        cy.get('[role="listbox"]')
          .children()
          .should('have.length', 0);
      }

      if (select) {
        cy.get('[role="listbox"]')
          .contains(select)
          .click();

        cy.get('[id="dependencyValue"]').click();
        cy.get('[role="listbox"]')
          .contains('true')
          .click();

        cy.contains('Update').click();

        cy.finishedLoading();
      }
    }

    addDependency(field1, [field2, field3], field2);
    addDependency(field2, [field3], field3);
    addDependency(field3, []);
  });
});
