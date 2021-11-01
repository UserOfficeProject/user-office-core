import faker, { lorem } from 'faker';

context('Template tests', () => {

  before(() => {
   cy.resetDB(true);
  });

  beforeEach(() => {
    cy.viewport(1920, 1680);
  });

  let boolId: string;
  let textId: string;
  let dateId: string;
  let timeId: string;
  let multipleChoiceId: string;
  let intervalId: string;
  let numberId: string;
  let richTextInputId: string;

  const template = {
    title: 'default template', // value pre-configured in DB
    topic: {
      title: 'Topic title' // // value pre-configured in DB
    }
  }

  const proposal = {
    title: faker.lorem.words(3),
    abstract: faker.lorem.words(8)
  }

  const booleanQuestion = faker.lorem.words(3);
  const dateQuestion = {
    title: faker.lorem.words(3),
    tooltip: faker.lorem.words(3)
  };
  const timeQuestion = faker.lorem.words(3);
  const fileQuestion = faker.lorem.words(3);
  const intervalQuestion = faker.lorem.words(3);
  const numberQuestion = faker.lorem.words(3);
  const textQuestion = {
    title: faker.lorem.words(3),
    minChars: 1000,
    answer:faker.lorem.words(5),
    newId: faker.lorem.word()
  }
  const richTextInputQuestion = {
    title: faker.lorem.words(3),
    maxChars: 200,
    answer: faker.lorem.words(3)
  };
  const multipleChoiceQuestion = {
    title:lorem.words(2),
    answers:  [
      faker.lorem.words(3),
      faker.lorem.words(3),
      faker.lorem.words(3),
    ]
  };

  const numberQuestion2 = {title: faker.lorem.words(3)}
  const numberQuestion3 = {title: faker.lorem.words(3)}

  const templateSearch = {
    title: faker.lorem.words(3),
    description: faker.lorem.words(3)
  }

  const templateCircDep = {
    title: faker.lorem.words(3),
    description: faker.lorem.words(3)
  }

  const templateDependencies = {
    title: faker.lorem.words(3),
    description: faker.lorem.words(3),
    questions: {
      selectQuestion: {
        title: faker.lorem.words(3),
        answer1: faker.lorem.words(3),
        answer2: faker.lorem.words(3),
      },
      booleanQuestion: {
        title: faker.lorem.words(3)
      },
      textQuestion: {
        title: faker.lorem.words(3)
      }
    }
  }

  const proposalWorkflow = {
    name: faker.random.words(3),
    description: faker.random.words(5),
  };


  it('User officer can modify proposal template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();

    /* Boolean */

    cy.createBooleanQuestion(booleanQuestion);

    cy.contains(booleanQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        boolId = fieldId;
      });

    /* --- */

    /* Interval */
    cy.createIntervalQuestion(intervalQuestion, {
      units: ['celsius', 'kelvin'],
    });

    cy.contains(intervalQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        intervalId = fieldId;
      });

    /* --- */

    /* Number */

    cy.createNumberInputQuestion(numberQuestion, {
      units: ['celsius', 'kelvin'],
    });

    cy.contains(numberQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        numberId = fieldId;
      });

    /* --- */

    /* Text input */
    cy.createTextQuestion(textQuestion.title, {
      isRequired: true,
      isMultipleLines: true,
      minimumCharacters: textQuestion.minChars,
    });

    cy.contains(textQuestion.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        textId = fieldId;
      });

    /* Update question */

    cy.contains(textQuestion.title).click();

    cy.get('[data-cy="natural-key"]').click();

    cy.get("[data-cy='natural_key']").clear().type(textQuestion.newId);

    cy.contains('Save').click();

    cy.wait(500);

    cy.contains(textQuestion.newId);
    /* --- */

    cy.contains(textQuestion.title).click();

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
    cy.contains(textQuestion.title)
      .parent()
      .dragElement([{ direction: 'up', length: 1 }])
      .wait(500); // Move item to top, in case it isn't

    cy.contains(template.topic.title)
      .closest('[data-rbd-draggable-context-id]') // new topic column
      .find('[data-rbd-drag-handle-draggable-id]') // all questions
      .first() // first question
      .contains(textQuestion.title);

    cy.contains(textQuestion.title)
      .parent()
      .dragElement([{ direction: 'down', length: 1 }])
      .wait(500);

    cy.contains(template.topic.title)
      .closest('[data-rbd-draggable-context-id]') // new topic column
      .find('[data-rbd-drag-handle-draggable-id]') // all questions
      .first() // first question
      .should('not.contain', textQuestion);

    /* Selection from options */
    cy.createMultipleChoiceQuestion(multipleChoiceQuestion.title, {
      option1: multipleChoiceQuestion.answers[0],
      option2: multipleChoiceQuestion.answers[1],
      option3: multipleChoiceQuestion.answers[2],
      isMultipleSelect: true
    });

    cy.contains(multipleChoiceQuestion.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        multipleChoiceId = fieldId;
      });

    cy.finishedLoading();

    cy.contains(multipleChoiceQuestion.title).click();

    cy.get('[data-cy=natural-key]').click();

    cy.get('[index=0]').should('not.contain', multipleChoiceQuestion.answers[1]);

    cy.contains(multipleChoiceQuestion.answers[1]).parent().find('[title=Up]').click();

    cy.get('[index=0]').contains(multipleChoiceQuestion.answers[1]);

    cy.contains(multipleChoiceQuestion.answers[1]).parent().find('[title=Down]').click();

    cy.contains('Save').click();

    /* --- */

    /* Date */
    cy.createDateQuestion(dateQuestion.title, {
      includeTime: false,
      isRequired: true,
    });

    cy.contains(dateQuestion.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        dateId = fieldId;
      });

    cy.createDateQuestion(timeQuestion, {
      includeTime: true,
      isRequired: false,
    });

    cy.contains(timeQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        timeId = fieldId;
      });

    /* --- */

    /* File */

    cy.createFileUploadQuestion(fileQuestion);

    /* --- */

    /* Rich Text Input */

    cy.createRichTextInput(richTextInputQuestion.title, {
      maxChars: richTextInputQuestion.maxChars,
    });

    cy.contains(richTextInputQuestion.title);

    cy.contains(richTextInputQuestion.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        richTextInputId = fieldId;
      });

    /* --- */

    /* --- Update templateQuestionRelation */
    cy.contains(dateQuestion.title).click();
    cy.get("[data-cy='tooltip'] input").clear().type(dateQuestion.tooltip);

    cy.contains('Update').click();

    cy.reload();

    cy.contains(dateQuestion.title).click();
    cy.get("[data-cy='tooltip'] input").should('have.value', dateQuestion.tooltip);
    cy.get('body').type('{esc}');
    /* --- */

    cy.contains(booleanQuestion);
    cy.contains(textQuestion.title);
    cy.contains(dateQuestion.title);
    cy.contains(timeQuestion);
  });

  it('User officer should be able to search questions', function () {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    // Create an empty template so we can search all question from the question picker

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy="name"]').type(templateSearch.title);

    cy.get('[data-cy="description"]').type(templateSearch.description);

    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy=show-more-button]').click();

    // Search questions
    cy.contains('Add question').click();

    cy.get('[data-cy=search-button]').click();

    // after entering textQuestion, dateQuestion should not be visible
    cy.contains(dateQuestion.title);
    cy.get('[data-cy=search-text] input').clear().type(textQuestion.title);
    cy.contains(textQuestion.title).should('exist');
    cy.contains(dateQuestion.title).should('not.exist');

    cy.get('[data-cy=search-text] input').clear();

    // after entering dateQuestion, textQuestion should not be visible
    cy.contains(textQuestion.title);
    cy.get('[data-cy=search-text] input').clear().type(dateQuestion.title);
    cy.contains(dateQuestion.title).should('exist');
    cy.contains(textQuestion.title).should('not.exist');

    cy.get('[data-cy=search-text] input').clear();

    // searching by categories

    // Boolean
    cy.get('[data-cy=data-type]').click();
    cy.get('[role=listbox]').contains('Boolean').click();
    cy.get('[data-cy=question-list]').contains(booleanQuestion).should('exist');
    cy.get('[data-cy=question-list]')
      .contains(textQuestion.title)
      .should('not.exist');

    // Date
    cy.get('[data-cy=data-type]').click();
    cy.get('[role=listbox]').contains('Date').click();
    cy.get('[data-cy=question-list]').contains(dateQuestion.title).should('exist');
    cy.get('[data-cy=question-list]')
      .contains(textQuestion.title)
      .should('not.exist');

    // All question types
    cy.get('[data-cy=data-type]').click();
    cy.get('[role=listbox]').contains('All').click();
    cy.get('[data-cy=question-list]').contains(dateQuestion.title).should('exist');
    cy.get('[data-cy=question-list]').contains(textQuestion.title).should('exist');

    // filter with no results
    cy.get('[data-cy=search-text] input').clear().type('string match no results');
    cy.get('[data-cy=question-list] div').should('have.length', 0);

    // closing resets the filter
    cy.get('[data-cy=search-button]').click();
    cy.get('[data-cy=question-list] div').should('have.length.above', 0);

    // cleanup temporary template
    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(templateSearch.title)
      .parent()
      .find("[title='Delete']")
      .first()
      .click();

    cy.contains('Yes').click();
  });

  it('User officer can clone template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Clone']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains('Copy of default template');
  });

  it('User officer can delete template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

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

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Archive']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains(template.title).should('not.exist');

    cy.contains('Archived').click();

    cy.contains(template.title);

    cy.contains(template.title)
      .parent()
      .find("[title='Unarchive']")
      .first()
      .click();

    cy.contains('Yes').click();
  });

  it('User can create proposal with template', () => {
    cy.login('user');

    cy.createProposal(proposal.title, proposal.abstract);
    cy.get(`[data-cy="${intervalId}.min"]`).click().type('1');
    cy.get(`[data-cy="${intervalId}.max"]`).click().type('2');
    cy.get(`[data-cy="${numberId}.value"]`).click().type('1');
    cy.get(`#${boolId}`).click();
    cy.get(`#${textId}`).clear().type('this_word_{enter}should_be_multiline');
    cy.contains('this_word_should_be_multiline').should('not.exist');
    cy.get(`#${textId}`).clear().type(textQuestion.answer);
    cy.contains(`${textQuestion.answer.length}/${textQuestion.minChars}`);
    cy.get(`[data-cy='${dateId}.value'] button`).click();
    cy.contains('15').click();
    cy.get(`[data-cy='${timeId}.value'] input`)
      .clear()
      .type('2022-02-20 20:00');

    cy.get(`#${multipleChoiceId}`).click();
    cy.contains(multipleChoiceQuestion.answers[0]).click();
    cy.contains(multipleChoiceQuestion.answers[2]).click();
    cy.get('body').type('{esc}');



    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        win.tinyMCE.editors[richTextInputId].setContent(richTextInputQuestion.answer);
        win.tinyMCE.editors[richTextInputId].fire('blur');

        resolve();
      });
    });

    cy.get(`#${richTextInputId}_ifr`)
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .contains(richTextInputQuestion.answer);

    cy.get('[data-cy="rich-text-char-count"]').then((element) => {
      expect(element.text()).to.be.equal(
        `Characters: ${richTextInputQuestion.answer.length} / ${richTextInputQuestion.maxChars}`
      );
    });

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(proposal.title);
    cy.contains(proposal.abstract);
    cy.contains(textQuestion.answer);
    cy.contains(multipleChoiceQuestion.answers[0]);
    cy.contains(multipleChoiceQuestion.answers[1]).should('not.exist');
    cy.contains(multipleChoiceQuestion.answers[2]);
    cy.contains('20-Feb-2022 20:00');

    cy.contains(richTextInputQuestion.title);
    cy.get(`[data-cy="${richTextInputId}_open"]`).click();
    cy.get('[role="dialog"]').contains(richTextInputQuestion.title);
    cy.get('[role="dialog"]').contains(richTextInputQuestion.answer);
    cy.get('[role="dialog"]').contains('Close').click();

    cy.contains('Dashboard').click();
    cy.contains(proposal.title);
    cy.contains('submitted');
  });

  it('should render the Date field with default value and min max values when set', () => {
    let dateFieldId: any;

    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();

    cy.get('[data-cy=show-more-button]').first().click();

    cy.get('[data-cy=add-question-menu-item]').first().click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Date').click();

    cy.get('[data-cy=question]').clear().type(dateQuestion.title);

    cy.get('[data-cy="minDate"] input').type('2020-01-01');
    cy.get('[data-cy="maxDate"] input').type('2020-01-31');
    cy.get('[data-cy="defaultDate"] input').type('2020-01-10');

    cy.contains('Save').click();

    cy.wait(1000);

    cy.contains(dateQuestion.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        dateFieldId = fieldId;
      });

    cy.contains(dateQuestion.title)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.finishedLoading();

    cy.contains(dateQuestion.title).click();

    cy.get('[data-cy="minDate"] input').should('have.value', '2020-01-01');
    cy.get('[data-cy="maxDate"] input').should('have.value', '2020-01-31');
    cy.get('[data-cy="defaultDate"] input').should('have.value', '2020-01-10');

    cy.get('[data-cy="minDate"] input').clear().type('2021-01-01');
    cy.get('[data-cy="maxDate"] input').clear().type('2021-01-31');
    cy.get('[data-cy="defaultDate"] input').clear().type('2021-01-10');

    cy.contains('Update').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains(dateQuestion.title);
    cy.get('body').then(() => {
      cy.get(`[data-cy="${dateFieldId}.value"] input`).as('dateField');

      cy.get('@dateField').should('have.value', '2021-01-10');

      cy.get('@dateField').clear().type('2020-01-01');
      cy.contains('Save and continue').click();
      cy.contains('Date must be no earlier than');

      cy.get('@dateField').clear().type('2022-01-01');
      cy.contains('Save and continue').click();
      cy.contains('Date must be no latter than');

      cy.get('@dateField').clear().type('2021-01-15');
      cy.contains('Save and continue').click();
      cy.contains('Date must be no').should('not.exist');
    });
  });

  it('should render the Number field accepting only positive, negative numbers if set', () => {
    let numberField1Id: any;
    let numberField2Id: any;


    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();

    cy.get('[data-cy=show-more-button]').first().click();

    cy.get('[data-cy=add-question-menu-item]').first().click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Number').click();

    cy.get('[data-cy=question]').clear().type(numberQuestion2.title);

    cy.get('[data-cy=units]>[role=button]').click();

    cy.contains('celsius').click();

    cy.contains('kelvin').click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy="numberValueConstraint"]').click();

    cy.contains('Only positive numbers').click();

    cy.contains('Save').click();

    cy.contains(numberQuestion2.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        numberField1Id = fieldId;
      });

    cy.contains(numberQuestion2.title)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .first()
      .click();

    cy.contains('Add Number').click();

    cy.get('[data-cy=question]').clear().type(numberQuestion3.title);

    cy.get('[data-cy=units]>[role=button]').click();

    cy.contains('celsius').click();

    cy.contains('kelvin').click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy="numberValueConstraint"]').click();

    cy.contains('Only positive numbers').click();

    cy.contains('Save').click();

    cy.contains(numberQuestion3.title)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        numberField2Id = fieldId;
      });

    cy.contains(numberQuestion3.title)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.finishedLoading();

    cy.contains(numberQuestion3.title).click();

    cy.get('[data-cy=units] input').should('have.value', 'celsius,kelvin');
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

    cy.contains(numberQuestion2.title);
    cy.contains(numberQuestion3.title);
    cy.get('body').then(() => {
      cy.get(`[data-cy="${numberField1Id}.value"] input`).as('numberField1');
      cy.get(`[data-cy="${numberField2Id}.value"] input`).as('numberField2');

      cy.get('@numberField1').type('1{leftarrow}-');
      cy.get('@numberField2').type('1');

      cy.contains('Save and continue').click();
      cy.contains('Value must be a negative number');
      cy.contains('Value must be a positive number');

      cy.get('@numberField1').clear().type('1');
      cy.get('@numberField2').clear().type('1{leftarrow}-');

      cy.contains('Value must be a negative number').should('not.exist');
      cy.contains('Value must be a positive number').should('not.exist');
    });
  });

  it('File Upload field could be set as required', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();

    cy.contains(fileQuestion).click();

    cy.contains('Is required').click();

    cy.contains('Update').click();

    cy.contains(fileQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains(fileQuestion);
    cy.get('body').then(() => {
      cy.contains('Save and continue').click();
      cy.contains(fileQuestion)
        .parent()
        .contains('field must have at least 1 items');

      cy.fixture('file_upload_test.png').then((fileContent) => {
        // NOTE: Using "cypress-file-upload" version "^3.5.3" because this(https://github.com/abramenal/cypress-file-upload/issues/179) should be fixed before upgrading to the latest
        cy.get('input[type="file"]').upload({
          fileContent: fileContent.toString(),
          fileName: 'file_upload_test.png',
          mimeType: 'image/png',
        });

        cy.contains('file_upload_test');

        cy.contains(fileQuestion)
          .parent()
          .should('not.contain.text', 'field must have at least 1 items');
      });
    });
  });



  it('Officer can delete proposal', () => {
    cy.login('officer');

    cy.contains('Proposals').click();
    cy.get('[type="checkbox"]').first().check();
    cy.get("[title='Delete proposals']").first().click();
    cy.get('[data-cy="confirm-ok"]').click();
  });

  it('Officer can delete proposal questions', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(template.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();

    cy.contains(textQuestion.title).click();
    cy.get("[data-cy='remove-from-template']").click();

    cy.contains(booleanQuestion).click();
    cy.get("[data-cy='remove-from-template']").click();

    cy.contains(dateQuestion.title).click();
    cy.get("[data-cy='remove-from-template']").click();

    cy.contains(fileQuestion).click();
    cy.get("[data-cy='remove-from-template']").click();
  });

  it('User officer can add multiple choice question as a dependency', () => {
    cy.login('officer');

    cy.createProposalWorkflow(
      proposalWorkflow.name,
      proposalWorkflow.description
    );

    cy.createTemplate('proposal', templateDependencies.title, templateDependencies.description);

    cy.createMultipleChoiceQuestion(templateDependencies.questions.selectQuestion.title, 
    {option1:templateDependencies.questions.selectQuestion.answer1, option2:templateDependencies.questions.selectQuestion.answer2});

    cy.createBooleanQuestion(templateDependencies.questions.booleanQuestion.title)

    cy.contains(templateDependencies.questions.booleanQuestion.title).click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]').click();

    cy.get('[role="presentation"]').contains(templateDependencies.questions.selectQuestion.title).click();

    cy.get('[id="dependencyValue"]').click();

    cy.contains(templateDependencies.questions.selectQuestion.answer1).click();

    cy.get('[data-cy="submit"]').click();


    cy.contains('Calls').click();
    cy.get('[title="Edit"]').first().click();

    cy.finishedLoading();

    cy.get('[data-cy="call-template"]').click();
    cy.contains(templateDependencies.title).click();

    cy.get('#proposalWorkflowId-input').click();
    cy.contains('Loading...').should('not.exist');
    cy.get('[role="presentation"] [role="listbox"] li')
      .contains(proposalWorkflow.name)
      .click();

    cy.get('[data-cy="call-esi-template"]').click();
    cy.get('[role=listbox]').contains('default esi template').click();

    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    // Dependee is NOT visible
    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);

    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer1).click();
    
    // Dependee is visible
    cy.get('main form').should('contain.text', templateDependencies.questions.booleanQuestion.title);

    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer2).click();

    // Dependee is NOT visible again
    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);

  });

  it('User officer can add multiple dependencies on a question', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(templateDependencies.title)
    .parent()
    .find("[title='Edit']")
    .click();

    cy.createTextQuestion(templateDependencies.questions.textQuestion.title)

    cy.contains(templateDependencies.questions.textQuestion.title).click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]').click();

    cy.get('[role="presentation"]').contains(templateDependencies.questions.selectQuestion.title).click();

    cy.get('[id="dependencyValue"]').click();

    cy.contains(templateDependencies.questions.selectQuestion.answer1).click();

    cy.get('[data-cy="add-dependency-button"]').click();

    cy.get('[id="dependency-id"]').last().click();

    cy.get('[role="presentation"]').contains(templateDependencies.questions.booleanQuestion.title).click();

    cy.get('[id="dependencyValue"]').last().click();

    cy.contains('true').click();

    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    // Both questions hidden
    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );

    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer1).click();

    // One question visible, other is not
    cy.get('main form').should('contain.text', templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );

    cy.contains(templateDependencies.questions.booleanQuestion.title).click();

    // Other question is also visible
    cy.get('main form').should(
      'contain.text',
      templateDependencies.questions.textQuestion.title
    );

    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer2).click();

    // No question is visible if answer 2 is selected
    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );
  });

  it('User officer can change dependency logic operator', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.get('[title="Edit"]').last().click();

    cy.contains(templateDependencies.questions.textQuestion.title).click();

    cy.get('[data-cy="dependencies-operator"]').click();

    cy.get('[data-value="OR"]').click();

    cy.get('[id="dependencyValue"]').first().click();

    cy.contains(templateDependencies.questions.selectQuestion.answer2).click();

    cy.get('[data-cy="submit"]').click();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains(templateDependencies.questions.selectQuestion.title);

    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );

    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer1).click();
    cy.contains(templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );
    cy.contains(templateDependencies.questions.booleanQuestion.title).click();
    cy.get('main form').should(
      'contain.text',
      templateDependencies.questions.textQuestion.title
    );
    cy.contains(templateDependencies.questions.booleanQuestion.title).click();
    cy.get('main form').should(
      'not.contain.text',
      templateDependencies.questions.textQuestion.title
    );
    cy.contains(templateDependencies.questions.selectQuestion.title).parent().click();
    cy.contains(templateDependencies.questions.selectQuestion.answer2).click();
    cy.get('main form').should('not.contain.text', templateDependencies.questions.booleanQuestion.title);
    cy.get('main form').should(
      'contain.text',
      templateDependencies.questions.textQuestion.title
    );
  });

  it('Can delete dependee, which will remove the dependency on depender', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.contains(templateDependencies.title)
      .parent()
      .find("[title='Edit']")
      .first()
      .click();
    
      cy.contains(templateDependencies.questions.booleanQuestion.title).closest('[data-cy=question-container]').find('[data-cy=dependency-list]').should('exist');
      cy.contains(templateDependencies.questions.selectQuestion.title).click();
      cy.get('[data-cy=remove-from-template]').click()
      cy.contains(templateDependencies.questions.booleanQuestion.title).closest('[data-cy=question-container]').find('[data-cy=dependency-list]').should('not.exist');
  })

  it('User can add captions after uploading image/* file', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');

    cy.get('[title="Edit"]').last().click();

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]')
      .last()
      .click();

    cy.contains('Add File Upload').click();

    cy.get('[data-cy="question"]').clear().type('File upload question');

    cy.get('[data-cy="max_files"] input').clear().type('5');

    cy.get('[data-cy="submit"]').click();

    cy.contains('File upload question')
      .parent()
      .dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 3 },
      ]);

    cy.finishedLoading();

    cy.logout();

    cy.login('user');

    cy.contains('New Proposal').click();

    cy.contains('File upload question');

    cy.get('[data-cy="title"] input').type('Test title');
    cy.get('[data-cy="abstract"] textarea').first().type('Test abstract');

    cy.fixture('file_upload_test.png').then((fileContent) => {
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
      cy.get('[data-cy="image-figure"] input').should('have.value', 'Fig_test');
    });
  });

  it('Should not let you create circular dependency chain', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal');


    cy.get('[data-cy="create-new-button"]').click();
    cy.get('[data-cy="name"]').type(templateCircDep.title);
    cy.get('[data-cy="description"]').type(templateCircDep.description);
    cy.get('[data-cy="submit"]').click();
    cy.contains(templateCircDep.title);

    const field1 = 'boolean_1_' + Date.now();
    const field2 = 'boolean_2_' + Date.now();
    const field3 = 'boolean_3_' + Date.now();

    cy.createBooleanQuestion(field1);
    cy.createBooleanQuestion(field2);
    cy.createBooleanQuestion(field3);

    function addDependency(
      fieldName: string,
      contains: string[],
      select?: string
    ) {
      cy.contains(fieldName).click();
      cy.get('[data-cy="add-dependency-button"]').click();
      cy.get('[id="dependency-id"]').click();

      contains.forEach((field) => {
        cy.get('[role="listbox"]').contains(field);
      });

      if (contains.length === 0) {
        cy.get('[role="listbox"]').children().should('have.length', 0);
      }

      if (select) {
        cy.get('[role="listbox"]').contains(select).click();

        cy.get('[id="dependencyValue"]').click();
        cy.get('[role="listbox"]').contains('true').click();

        cy.contains('Update').click();

        cy.finishedLoading();
      }
    }

    addDependency(field1, [field2, field3], field2);
    addDependency(field2, [field3], field3);
    addDependency(field3, []);
  });
});
