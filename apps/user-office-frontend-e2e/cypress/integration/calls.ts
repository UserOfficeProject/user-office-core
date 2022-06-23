import {
  AllocationTimeUnits,
  CreateInstrumentMutationVariables,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';
import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('Calls tests', () => {
  let esiTemplateId: number;
  const esiTemplateName = faker.lorem.words(2);
  let workflowId: number;

  const currentDayStart = DateTime.now().startOf('day');
  const yesterday = currentDayStart.plus({ days: -1 });
  const twoDaysAgo = currentDayStart.plus({ days: -2 });

  const newCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: DateTime.fromJSDate(faker.date.past()),
    endCall: DateTime.fromJSDate(faker.date.future()),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: initialDBData.template.name,
    templateId: initialDBData.template.id,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(10),
    surveyComment: faker.lorem.word(10),
    esiTemplateName: esiTemplateName,
  };

  const newInactiveCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: twoDaysAgo.toISO(),
    endCall: yesterday.toISO(),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateId: initialDBData.template.id,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(10),
    surveyComment: faker.lorem.word(10),
  };

  const updatedCall = {
    shortCode: faker.random.alphaNumeric(15),
    startDate: DateTime.fromJSDate(faker.date.past()),
    endDate: DateTime.fromJSDate(faker.date.future()),
  };

  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };

  const instrumentAssignedToCall: CreateInstrumentMutationVariables = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(8),
    managerUserId: initialDBData.users.user1.id,
  };

  beforeEach(() => {
    cy.resetDB();
    cy.createTemplate({
      groupId: TemplateGroupId.PROPOSAL_ESI,
      name: esiTemplateName,
    }).then((result) => {
      if (result.createTemplate.template) {
        esiTemplateId = result.createTemplate.template?.templateId;
      } else {
        throw new Error('ESI templete creation failed');
      }
    });

    cy.createProposalWorkflow(proposalWorkflow).then((result) => {
      if (result.createProposalWorkflow.proposalWorkflow) {
        workflowId = result.createProposalWorkflow.proposalWorkflow?.id;
      } else {
        throw new Error('Workflow creation failed');
      }
    });
  });

  // TODO: Maybe this should be moved to another file called permissions because its testing more call permissions than calls.
  it('A user should not be able to see/visit calls', () => {
    cy.login('user');
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.should('not.contain', 'Calls');

    cy.visit('/CallPage');
    cy.contains('My proposals');
  });

  describe('Call basic tests', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('A user-officer should not be able go to next step or create call if there is validation error', () => {
      const shortCode = faker.random.alphaNumeric(15);
      const startDate = DateTime.fromJSDate(faker.date.past()).toFormat(
        initialDBData.getFormats().dateTimeFormat
      );
      const endDate = DateTime.fromJSDate(faker.date.future()).toFormat(
        initialDBData.getFormats().dateTimeFormat
      );

      const invalidPastDate = DateTime.fromJSDate(faker.date.past()).toFormat(
        initialDBData.getFormats().dateFormat + ' HH'
      ); // no minutes
      const invalidFutureDate = DateTime.fromJSDate(
        faker.date.future()
      ).toFormat(initialDBData.getFormats().dateFormat + ' HH'); // no minutes

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

      // NOTE: Luxon adapter still doesn't work well with newest MUI lab version to support placeholder text (https://github.com/mui/material-ui/issues/29851)
      cy.get('[data-cy=start-date] input')
        .clear()
        .type(invalidPastDate)
        .should('have.value', invalidPastDate + ':');

      cy.contains('Invalid Date');

      cy.get('[data-cy=start-date] input')
        .clear()
        .type(startDate)
        .should('have.value', startDate);

      // NOTE: Luxon adapter still doesn't work well with newest MUI lab version to support placeholder text (https://github.com/mui/material-ui/issues/29851)
      cy.get('[data-cy=end-date] input')
        .clear()
        .type(invalidFutureDate)
        .should('have.value', invalidFutureDate + ':');

      cy.get('[data-cy=end-date] input')
        .clear()
        .type(endDate)
        .should('have.value', endDate);

      cy.get('[data-cy="call-template"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.template.name)
        .click();

      cy.get('[data-cy="call-esi-template"]').click();
      cy.get('[role="presentation"]').contains(esiTemplateName).click();

      cy.get('[data-cy="call-workflow"]').click();
      cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="submit"]').should('not.exist');

      cy.get('[data-cy="survey-comment"] input').should('be.focused');
      cy.get('[data-cy="survey-comment"] input:invalid').should(
        'have.length',
        1
      );

      cy.get('[data-cy=survey-comment] input').type(
        faker.random.word().split(' ')[0]
      );

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.get('[data-cy="cycle-comment"] input').should('be.focused');
      cy.get('[data-cy="cycle-comment"] input:invalid').should(
        'have.length',
        1
      );
    });

    it('A user-officer should not be able to create a call with end dates before start dates', () => {
      const shortCode = faker.random.alphaNumeric(15);
      const todayJsDate = new Date(2022, 1, 14, 12, 0, 0, 0);
      const today = DateTime.fromJSDate(todayJsDate); // set date to specific date to easier test the validation
      cy.clock(todayJsDate);

      const yesterday = today.minus({ days: 1 }).day;
      const tomorrow = today
        .plus({ days: 1 })
        .startOf('day')
        // TODO: Find a way how to access the settings format here and not hard coding it like this.
        .toFormat(initialDBData.getFormats().dateTimeFormat)
        .toString();

      cy.contains('Proposals');

      cy.contains('Calls').click();

      cy.contains('Create').click();

      cy.get('[data-cy=short-code] input')
        .type(shortCode)
        .should('have.value', shortCode);

      cy.get('[data-cy=end-date]').find('[data-testid="CalendarIcon"]').click();

      cy.get('[role="dialog"] .MuiCalendarPicker-root .MuiPickersDay-root')
        .contains(yesterday)
        .closest('button')
        .should('be.disabled');

      cy.get('[data-cy=start-date] input').click();

      cy.get('[data-cy=start-date] input')
        .clear()
        .type(tomorrow)
        .should('have.value', tomorrow);

      cy.get('[data-cy=end-date]').should(
        'include.text',
        'End call date can not be before start call date'
      );
    });

    it('A user-officer should be able to create a call', () => {
      const { shortCode, startCall, endCall, templateName, esiTemplateName } =
        newCall;
      const callShortCode = shortCode || faker.lorem.word(10);
      const callStartDate = startCall.toFormat(
        initialDBData.getFormats().dateTimeFormat
      );
      const callEndDate = endCall.toFormat(
        initialDBData.getFormats().dateTimeFormat
      );
      const callSurveyComment = faker.lorem.word(10);
      const callCycleComment = faker.lorem.word(10);

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
      const updatedCallStartDate = startDate.toFormat(
        initialDBData.getFormats().dateTimeFormat
      );
      const updatedCallEndDate = endDate.toFormat(
        initialDBData.getFormats().dateTimeFormat
      );

      const refNumFormat = '211{digits:5}';

      cy.createCall({
        ...newCall,
        esiTemplateId: esiTemplateId,
        proposalWorkflowId: workflowId,
      });

      cy.contains('Proposals');

      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[data-cy=short-code] input')
        .clear()
        .type(shortCode)
        .should('have.value', shortCode);

      cy.get('[data-cy=start-date] input')
        .clear()
        .type(updatedCallStartDate)
        .should('have.value', updatedCallStartDate);

      cy.get('[data-cy=end-date] input')
        .clear()
        .type(updatedCallEndDate)
        .should('have.value', updatedCallEndDate);

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
  });

  describe('Call advanced tests', () => {
    let createdCallId: number;
    let createdInstrumentId: number;

    beforeEach(() => {
      cy.login('officer');
      cy.createCall({
        ...newCall,
        esiTemplateId: esiTemplateId,
        proposalWorkflowId: workflowId,
      }).then((response) => {
        if (response.createCall.call) {
          createdCallId = response.createCall.call.id;
        }
      });
      cy.updateUserRoles({
        id: initialDBData.users.user1.id,
        roles: [
          initialDBData.roles.user,
          initialDBData.roles.instrumentScientist,
        ],
      });
      cy.createInstrument(instrumentAssignedToCall).then((response) => {
        if (response.createInstrument.instrument) {
          createdInstrumentId = response.createInstrument.instrument.id;
        }
      });
      cy.visit('/');
    });

    it('A user-officer should be able to assign instrument/s to a call', () => {
      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Assign Instrument"]')
        .click();

      cy.contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[type="checkbox"]')
        .check();

      cy.contains('Assign instrument').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="call-instrument-assignments-table"]').contains(
        instrumentAssignedToCall.shortCode
      );
    });

    it('A user-officer should not be able to set negative availability time on instrument per call', () => {
      cy.assignInstrumentToCall({
        callId: createdCallId,
        instrumentIds: [createdInstrumentId],
      });

      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="call-instrument-assignments-table"]')
        .contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[data-cy="availability-time"]').type('-10');

      cy.contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[aria-label="Save"]')
        .click();

      cy.notification({ variant: 'error', text: 'must be positive number' });
    });

    it('A user-officer should be able to set availability time on instrument per call', () => {
      cy.assignInstrumentToCall({
        callId: createdCallId,
        instrumentIds: [createdInstrumentId],
      });

      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="call-instrument-assignments-table"]')
        .contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[data-cy="availability-time"]').type('10');

      cy.contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[aria-label="Save"]')
        .click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.get('[data-cy="call-instrument-assignments-table"]')
        .find('thead th')
        .last()
        .should('include.text', newCall.allocationTimeUnit);
      cy.get('[data-cy="call-instrument-assignments-table"]')
        .find('tbody td')
        .last()
        .then((element) => {
          expect(element.text()).to.be.equal('10');
        });
    });

    it('A user-officer should be able to remove instrument from a call', () => {
      cy.assignInstrumentToCall({
        callId: createdCallId,
        instrumentIds: [createdInstrumentId],
      });
      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="call-instrument-assignments-table"]')
        .contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get(
        '[data-cy="call-instrument-assignments-table"] [aria-label="Save"]'
      )
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

    it('User officer can filter calls by their status', () => {
      cy.createCall({
        ...newInactiveCall,
        esiTemplateId: esiTemplateId,
        proposalWorkflowId: workflowId,
      });

      cy.contains('Calls').click();

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Active').click();

      cy.finishedLoading();

      cy.get(
        '[data-cy="calls-table"] [aria-label="Detail panel visibility toggle"]'
      ).should('have.length', 2);
      cy.contains(newCall.shortCode);

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Inactive').click();

      cy.finishedLoading();

      cy.get(
        '[data-cy="calls-table"] [aria-label="Detail panel visibility toggle"]'
      ).should('have.length', 1);
      cy.contains(newCall.shortCode).should('not.exist');
      cy.contains(newInactiveCall.shortCode);

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.get(
        '[data-cy="calls-table"] [aria-label="Detail panel visibility toggle"]'
      ).should('have.length', 3);
      cy.contains(newCall.shortCode);
      cy.contains(newInactiveCall.shortCode);
    });

    it('A user-officer should be able to remove a call', () => {
      cy.contains('Calls').click();

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Active').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Call deleted successfully',
      });
    });
  });

  it('Call displays correct time remaining', () => {
    /*
      The time remaining is rounded down to the nearest min, hour or day.
      No time remaining is displayed if over 30 days or under one minute.
    */
    cy.login('user');
    cy.visit('/');

    // Create a future call, so that there is always two calls to choose from
    cy.createCall({
      ...newCall,
      endCall: DateTime.now().plus({ days: 365 }),
      proposalWorkflowId: workflowId,
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ days: 31, hours: 1 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.contains('New Proposal').click();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('remaining')
        .should('not.exist');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ days: 30, hours: 1 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('30 days remaining');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ days: 1, hours: 1 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('1 day remaining');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ hours: 7, minutes: 30 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('7 hours remaining');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ minutes: 1, seconds: 30 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('1 minute remaining');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: DateTime.now().plus({ seconds: 59 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('remaining')
        .should('not.exist');
    });
  });
});
