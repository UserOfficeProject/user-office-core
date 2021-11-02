import faker from 'faker';
import { AllocationTimeUnits, TemplateGroupId } from '../../src/generated/sdk';

context('Calls tests', () => {
  let esiTemplateId: number | undefined;
  let workflowId: number;

  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);

  const newCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: faker.date.past().toISOString().slice(0, 10),
    endCall: faker.date.future().toISOString().slice(0, 10),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: 'default template',
    templateId: 1,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(),
    surveyComment: faker.lorem.word(),
    description: '',
    title: '',
    esiTemplateName: 'default esi template',
  };

  const updatedCall = {
    shortCode: faker.random.alphaNumeric(15),
    startDate: faker.date.past().toISOString().slice(0, 10),
    endDate: faker.date.future().toISOString().slice(0, 10),
  };

  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  const instrumentAssignedToCall = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(8),
  };

  const scientist = 'Carl';

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.resetDB();
    cy.createTemplate({
      groupId: TemplateGroupId.PROPOSAL_ESI,
      name: 'default esi template',
    }).then((result) => {
      console.log(result);
      esiTemplateId = result.createTemplate.template?.templateId;
    });

    cy.createProposalWorkflow(
      proposalWorkflow.name,
      proposalWorkflow.description
    ).then((result) => {
      workflowId = result.data.createProposalWorkflow.proposalWorkflow.id;
    });
  });

  it('A user should not be able to see/visit calls', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.should('not.contain', 'Calls');

    cy.get('[data-cy="user-menu-items"]')
      .find('.MuiListItem-root')
      .should('have.length', 5);

    cy.visit('/CallPage');
    cy.contains('My proposals');
  });

  it('A user-officer should not be able go to next step or create call if there is validation error', () => {
    const shortCode = faker.random.alphaNumeric(15);
    const startDate = faker.date.past().toISOString().slice(0, 10);
    const endDate = faker.date.future().toISOString().slice(0, 10);

    cy.login('officer');

    cy.contains('Proposals');

    cy.contains('Calls').click();

    cy.contains('Create').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="short-code"] input').should('be.focused');
    cy.get('[data-cy="short-code"] input:invalid').should('have.length', 1);

    cy.get('[data-cy=short-code] input')
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input').clear();

    cy.get('[data-cy="next-step"]').click();

    cy.contains('Invalid Date');

    cy.get('[data-cy=start-date] input')
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input')
      .clear()
      .type(endDate)
      .should('have.value', endDate);

    cy.get('[data-cy="call-template"]').click();
    cy.get('[role="presentation"]').contains('default template').click();

    cy.get('[data-cy="call-esi-template"]').click();
    cy.get('[role="presentation"]').contains('default esi template').click();

    cy.get('[data-cy="call-workflow"]').click();
    cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').should('not.exist');

    cy.get('[data-cy="survey-comment"] input').should('be.focused');
    cy.get('[data-cy="survey-comment"] input:invalid').should('have.length', 1);

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy="cycle-comment"] input').should('be.focused');
    cy.get('[data-cy="cycle-comment"] input:invalid').should('have.length', 1);
  });

  it('A user-officer should not be able to create a call with end dates before start dates', () => {
    const shortCode = faker.random.alphaNumeric(15);
    const startDate = '2021-02-25';
    const endDate = '2021-02-24';

    cy.login('officer');

    cy.contains('Proposals');

    cy.contains('Calls').click();

    cy.contains('Create').click();

    cy.get('[data-cy=short-code] input')
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input')
      .clear()
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input')
      .clear()
      .type(endDate)
      .should('not.have.value', endDate)
      .should('have.value', startDate);

    cy.get('[data-cy="end-date"] .MuiInputAdornment-root button').click();

    cy.get('.MuiPickersBasePicker-pickerView .MuiPickersDay-day')
      .contains('24')
      .closest('button')
      .should('have.class', 'MuiPickersDay-dayDisabled');

    cy.get('.MuiDialogActions-root button').contains('OK').click();

    cy.get('[data-cy=start-date] input')
      .clear()
      .type('2021-02-27')
      .should('have.value', '2021-02-27');

    cy.get('[data-cy=end-date] input').should('have.value', '2021-02-27');
  });

  it('A user-officer should be able to create a call', () => {
    const { shortCode, startCall, endCall, templateName, esiTemplateName } =
      newCall;
    const callShortCode = shortCode || faker.lorem.word();
    const callStartDate =
      startCall || faker.date.past().toISOString().slice(0, 10);
    const callEndDate =
      endCall || faker.date.future().toISOString().slice(0, 10);
    const callSurveyComment = faker.lorem.word();
    const callCycleComment = faker.lorem.word();

    cy.login('officer');

    cy.contains('Calls').click();

    cy.contains('Create').click();

    cy.get('[data-cy=short-code] input')
      .type(callShortCode)
      .should('have.value', callShortCode);

    cy.get('[data-cy=start-date] input')
      .clear()
      .type(callStartDate)
      .should('have.value', callStartDate);

    cy.get('[data-cy=end-date] input')
      .clear()
      .type(callEndDate)
      .should('have.value', callEndDate);

    cy.get('[data-cy="call-template"]').click();
    cy.get('[role="presentation"]').contains(templateName).click();

    cy.get('[data-cy="call-esi-template"]').click();
    cy.get('[role="presentation"]').contains(esiTemplateName).click();

    cy.get('#proposalWorkflowId-input').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=survey-comment] input').clear().type(callSurveyComment);

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=cycle-comment] input').clear().type(callCycleComment);

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains(callShortCode);

    cy.contains(shortCode)
      .parent()
      .children()
      .last()
      .should('include.text', '0');
  });

  it('A user-officer should be able to edit a call', () => {
    const { shortCode, startDate, endDate } = updatedCall;

    const refNumFormat = '211{digits:5}';

    cy.login('officer');

    cy.createCall({
      ...newCall,
      esiTemplateId: esiTemplateId,
      proposalWorkflowId: workflowId,
    });

    cy.contains('Proposals');

    cy.contains('Calls').click();

    cy.contains(newCall.shortCode).parent().find('[title="Edit"]').click();

    cy.get('[data-cy=short-code] input')
      .clear()
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input')
      .clear()
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input')
      .clear()
      .type(endDate)
      .should('have.value', endDate);

    cy.get('[data-cy=reference-number-format] input').type(refNumFormat, {
      parseSpecialCharSequences: false,
    });

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=cycle-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains(shortCode);
  });

  it('A user-officer should be able to assign instrument/s to a call', () => {
    cy.login('officer');
    cy.createCall({
      ...newCall,
      esiTemplateId: esiTemplateId,
      proposalWorkflowId: workflowId,
    });

    cy.contains('People').click();
    cy.addScientistRoleToUser(scientist);

    cy.createInstrument(instrumentAssignedToCall, scientist);
    cy.contains('Calls').click();

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Assign Instrument"]')
      .click();

    cy.contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[type="checkbox"]')
      .check();

    cy.contains('Assign instrument').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Show Instruments"]')
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"]').contains(
      instrumentAssignedToCall.shortCode
    );
  });

  it('A user-officer should not be able to set negative availability time on instrument per call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Show Instruments"]')
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[title="Edit"]')
      .click();

    cy.get('[data-cy="availability-time"]').type('-10');

    cy.contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[title="Save"]')
      .click();

    cy.notification({ variant: 'error', text: 'must be positive number' });
  });

  it('A user-officer should be able to set availability time on instrument per call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Show Instruments"]')
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[title="Edit"]')
      .click();

    cy.get('[data-cy="availability-time"]').type('10');

    cy.contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[title="Save"]')
      .click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .last()
      .then((element) => {
        expect(element.text()).to.be.equal('10');
      });
  });

  it('A user-officer should be able to remove instrument from a call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Show Instruments"]')
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .contains(instrumentAssignedToCall.shortCode)
      .parent()
      .find('[title="Delete"]')
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"] [title="Save"]')
      .first()
      .click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .last()
      .then((element) => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });

  it('A user-officer should be able to add proposal workflow to a call', () => {
    cy.login('officer');

    cy.contains('Settings').click();

    cy.contains('Calls').click();

    cy.contains(updatedCall.shortCode).parent().find('[title="Edit"]').click();

    cy.get('#proposalWorkflowId-input').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[role="presentation"] [role="listbox"] li')
      .contains(proposalWorkflow.name)
      .click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'Call updated successfully!' });

    cy.contains(updatedCall.shortCode).parent().contains(proposalWorkflow.name);
  });

  it('User officer can filter calls by their status', () => {
    cy.login('officer');
    cy.contains('Calls').click();

    cy.get('[data-cy="call-status-filter"]').click();
    cy.get('[role="listbox"]').contains('Active').click();

    cy.finishedLoading();

    cy.get('[data-cy="calls-table"] [title="Show Instruments"]').should(
      'have.length',
      2
    );
    cy.contains(updatedCall.shortCode);

    cy.get('[data-cy="call-status-filter"]').click();
    cy.get('[role="listbox"]').contains('Inactive').click();

    cy.finishedLoading();

    cy.contains('No records to display');
    cy.get('[data-cy="calls-table"] [title="Show Instruments"]').should(
      'have.length',
      0
    );
    cy.contains(updatedCall.shortCode).should('not.exist');

    cy.get('[data-cy="call-status-filter"]').click();
    cy.get('[role="listbox"]').contains('All').click();

    cy.finishedLoading();

    cy.get('[data-cy="calls-table"] [title="Show Instruments"]').should(
      'have.length',
      2
    );
    cy.contains(updatedCall.shortCode);
  });

  it('A user-officer should be able to remove a call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[data-cy="call-status-filter"]').click();
    cy.get('[role="listbox"]').contains('Active').click();

    cy.contains(updatedCall.shortCode)
      .parent()
      .find('[title="Delete"]')
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'Call deleted successfully' });
  });
});
