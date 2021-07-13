import faker from 'faker';

context('Proposal administration tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const proposalName1 = faker.random.words(3);
  const proposalName2 = faker.random.words(3);
  const proposalFixedName = 'Aaaaaaaaa test proposal title';

  const textUser = faker.random.words(5);
  const textManager = faker.random.words(5);

  const answerDate = '2030-01-01';
  const answerMultipleChoice = 'One';
  const answerText = faker.random.words(3);
  const answerNumberInput = 99.9;
  const answerIntervalMin = 1;
  const answerIntervalMax = 100;

  const textQuestion = faker.random.words(3);
  const dateQuestion = faker.random.words(3);
  const boolQuestion = faker.random.words(3);
  const multipleChoiceQuestion = faker.random.words(3);
  const numberInputQuestion = faker.random.words(3);
  const fileUploadQuestion = faker.random.words(3);
  const intervalQuestion = faker.random.words(3);

  let textQuestionId: string;
  let dateQuestionId: string;
  let boolQuestionId: string;
  let multipleChoiceQuestionId: string;
  let fileUploadQuestionId: string;
  let numberInputQuestionId: string;
  let intervalQuestionId: string;

  it('Should be able to set comment for user/manager and final status', () => {
    cy.login('user');
    cy.createProposal(proposalName1);
    cy.finishedLoading();
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[data-cy=view-proposal]').click();
    cy.finishedLoading();
    cy.get('[role="dialog"]').contains('Admin').click();
    cy.get('#mui-component-select-finalStatus').should('exist');
    cy.get('[role="dialog"]').contains('Logs').click();
    cy.get('[role="dialog"]').contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('[data-cy="managementTimeAllocation"] input')
      .clear()
      .type('-123')
      .blur();
    cy.contains('Must be greater than or equal to');

    cy.get('[data-cy="managementTimeAllocation"] input')
      .clear()
      .type('987654321')
      .blur();
    cy.contains('Must be less than or equal to');

    cy.get('[data-cy="managementTimeAllocation"] input').clear().type('20');

    cy.setTinyMceContent('commentForUser', textUser);
    cy.setTinyMceContent('commentForManagement', textManager);

    cy.on('window:confirm', (str) => {
      expect(str).to.equal(
        'Changes you recently made in this tab will be lost! Are you sure?'
      );

      return false;
    });

    cy.contains('Proposal information').click();

    cy.get('[data-cy="is-management-decision-submitted"]').click();

    cy.get('[data-cy="save-admin-decision"]').click();

    cy.notification({ variant: 'success', text: 'Saved' });

    cy.reload();

    cy.getTinyMceContent('commentForUser').then((content) =>
      expect(content).to.have.string(textUser)
    );

    cy.getTinyMceContent('commentForManagement').then((content) =>
      expect(content).to.have.string(textManager)
    );

    cy.get('[data-cy="managementTimeAllocation"] input').should(
      'have.value',
      '20'
    );

    cy.get('[data-cy="is-management-decision-submitted"] input').should(
      'have.value',
      'true'
    );

    cy.closeModal();

    cy.contains('Accepted');
    cy.contains('DRAFT');
  });

  it('Should be able to re-open proposal for submission', () => {
    cy.login('officer');

    cy.changeProposalStatus('DRAFT', proposalName1);

    cy.contains(proposalName1).parent().contains('No');

    cy.logout();

    cy.login('user');

    cy.contains(proposalName1).parent().get('[title="Edit proposal"]').click();

    cy.finishedLoading();
    cy.contains(proposalName1);

    cy.contains('Submit').parent().should('not.be.disabled');
  });

  it('If you select a tab in tabular view and reload the page it should stay on specific selected tab', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get('[data-cy=view-proposal]').click();
    cy.finishedLoading();

    cy.get('[role="dialog"]').contains('Admin').click();

    cy.reload();

    cy.get('#commentForUser').should('exist');

    cy.get('[role="dialog"]').contains('Technical review').click();

    cy.reload();

    cy.get('[data-cy="timeAllocation"]').should('exist');
  });

  it('Download proposal is working with dialog window showing up', () => {
    cy.login('officer');

    cy.get('[data-cy="download-proposal"]').first().click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');
    cy.get('[data-cy="preparing-download-dialog-item"]').contains(
      proposalName1
    );
  });

  it('Should be able to download proposal pdf', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.request({
      url: '/download/pdf/proposal/1',
      method: 'GET',
      headers: {
        authorization: `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`,
      },
    }).then((response) => {
      expect(response.headers['content-type']).to.be.equal('application/pdf');
      expect(response.status).to.be.equal(200);
    });
  });

  it('Should be able to save table selection state in url', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[type="checkbox"]').eq(1).click();

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

  it('Should be able to save table sort state in url', () => {
    let officerProposalsTableAsTextBeforeSort = '';
    let officerProposalsTableAsTextAfterSort = '';

    cy.login('user');
    // Create a proposal with title that will be always last if sort order by title is 'desc'
    cy.createProposal(proposalFixedName);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.logout();

    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
      officerProposalsTableAsTextBeforeSort = element.text();
    });

    cy.contains('Title').dblclick();

    cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
      officerProposalsTableAsTextAfterSort = element.text();
    });

    cy.reload();

    cy.finishedLoading();

    cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
      expect(element.text()).to.be.equal(officerProposalsTableAsTextAfterSort);
      expect(element.text()).not.equal(officerProposalsTableAsTextBeforeSort);
    });

    cy.get(
      '.MuiTableSortLabel-active .MuiTableSortLabel-iconDirectionDesc'
    ).should('exist');

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.contains('Short Code').click();

    cy.reload();

    cy.finishedLoading();

    cy.get(
      '.MuiTableSortLabel-active .MuiTableSortLabel-iconDirectionAsc'
    ).should('exist');
  });

  it('Should be able to prepare proposal template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template')
      .parent()
      .get("[title='Edit']")
      .first()
      .click();

    cy.createTopic('Topic for questions');

    cy.createIntervalQuestion(intervalQuestion);
    cy.contains(intervalQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        intervalQuestionId = fieldId;
      });

    cy.createBooleanQuestion(boolQuestion);
    cy.contains(boolQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        boolQuestionId = fieldId;
      });

    cy.createDateQuestion(dateQuestion, { isRequired: true });
    cy.contains(dateQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        dateQuestionId = fieldId;
      });

    cy.createMultipleChoiceQuestion(multipleChoiceQuestion, {
      option1: 'One',
      option2: 'Two',
      option3: 'Three',
    });
    cy.contains(multipleChoiceQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        multipleChoiceQuestionId = fieldId;
      });

    cy.createTextQuestion(textQuestion);
    cy.contains(textQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        textQuestionId = fieldId;
      });

    cy.createFileUploadQuestion(fileUploadQuestion);
    cy.contains(fileUploadQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        fileUploadQuestionId = fieldId;
      });

    cy.createNumberInputQuestion(numberInputQuestion);
    cy.contains(numberInputQuestion)
      .closest('[data-cy=question-container]')
      .find("[data-cy='proposal-question-id']")
      .invoke('html')
      .then((fieldId) => {
        numberInputQuestionId = fieldId;
      });
  });

  it('Should be able to search by question', () => {
    cy.login('user');

    // Create a test proposal
    cy.createProposal(proposalName2);
    cy.contains('Save and continue').click();

    cy.get(`#${boolQuestionId}`).click();

    cy.get(`[data-cy='${dateQuestionId}.value'] input`)
      .clear()
      .type(answerDate);

    cy.get(`#${multipleChoiceQuestionId}`).click();

    cy.contains(answerMultipleChoice).click();

    cy.get('body').type('{esc}');

    cy.get(`#${textQuestionId}`).clear().type(answerText);

    cy.get(`[data-cy='${numberInputQuestionId}.value'] input`)
      .clear()
      .type(answerNumberInput.toString());

    cy.get(`[data-cy='${intervalQuestionId}.min'] input`)
      .clear()
      .type(answerIntervalMin.toString());

    cy.get(`[data-cy='${intervalQuestionId}.max'] input`)
      .clear()
      .type(answerIntervalMax.toString());

    cy.contains('Save and continue').click();

    cy.logout();

    // search proposals
    cy.login('officer');

    cy.get('[data-cy=call-filter]').click();

    cy.get('[role=listbox]').contains('call 1').first().click();

    cy.get('[data-cy=question-search-toggle]').click();

    // Boolean questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(boolQuestion).click();

    cy.get('[data-cy=is-checked]').click();

    cy.get('[role=listbox]').contains('No').click();

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=is-checked]').click();

    cy.get('[role=listbox]').contains('Yes').click();

    cy.contains('Search').click();

    cy.contains(proposalName2);

    // Date questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(dateQuestion).click();

    cy.get('[data-cy=value] input').clear().type('2020-01-01');

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('After').click();

    cy.contains('Search').click();

    cy.contains(proposalName2);

    // Multiple choice questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(multipleChoiceQuestion).click();

    cy.get('[data-cy=value]').click();

    cy.get('[role=listbox]').contains('Two').click();

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value]').click();

    cy.get('[role=listbox]').contains('One').click();

    cy.contains('Search').click();

    cy.contains(proposalName2);

    // Text questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(textQuestion).click();

    cy.get('[name=value]').clear().type(faker.random.words(3));

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[name=value]').clear().type(answerText);

    cy.contains('Search').click();

    cy.contains(proposalName2);

    // File upload questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(fileUploadQuestion).click();

    cy.get('[data-cy=has-attachments]').click();

    cy.get('[role=listbox]').contains('Yes').click();

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=has-attachments]').click();

    cy.get('[role=listbox]').contains('No').click();

    cy.contains('Search').click();

    cy.contains(proposalName2);

    // NumberInput questions
    cy.get('[data-cy=question-list]').click();

    cy.contains(numberInputQuestion).click();

    // NumberInput questions - Less than
    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('Less than').click();

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerNumberInput - 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerNumberInput + 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('exist');

    // NumberInput questions - Equals
    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('Equals').click();

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerNumberInput + 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value] input').clear().type(answerNumberInput.toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('exist');

    // NumberInput questions - Less than
    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('Less than').click();

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerNumberInput - 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerNumberInput + 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('exist');

    // Interval question
    cy.get('[data-cy=question-list]').click();

    cy.contains(intervalQuestion).click();

    // Interval question - Less than
    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('Less than').click();

    cy.get('[data-cy=value] input').clear().type(answerIntervalMax.toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerIntervalMax + 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('exist');

    // Interval question -  Greater than
    cy.get('[data-cy=comparator]').click();

    cy.get('[role=listbox]').contains('Greater than').click();

    cy.get('[data-cy=value] input').clear().type(answerIntervalMin.toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('not.exist');

    cy.get('[data-cy=value] input')
      .clear()
      .type((answerIntervalMin - 1).toString());

    cy.contains('Search').click();

    cy.contains(proposalName2).should('exist');
  });

  it('Should preserve the ordering when row is selected', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('table tbody tr').eq(0).contains(proposalFixedName);
    cy.contains('Title').dblclick();
    cy.get('table tbody tr').eq(2).contains(proposalFixedName);

    cy.get('table tbody tr input[type="checkbox"]').first().click();

    cy.get('table tbody tr').eq(2).contains(proposalFixedName);
  });

  it('User officer should see Reviews tab before doing the Admin(management decision)', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.finishedLoading();

    cy.get('[data-cy=view-proposal]').first().click();
    cy.finishedLoading();
    cy.get('[role="dialog"]').contains('Reviews').click();

    cy.get('[role="dialog"]').contains('External reviews');
    cy.get('[role="dialog"]').contains('SEP Meeting decision');
  });
});
