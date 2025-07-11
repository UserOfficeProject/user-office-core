import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  CreateInstrumentMutationVariables,
  FeatureId,
  TemplateGroupId,
  UpdateCallInput,
  WorkflowType,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Calls tests', () => {
  let esiTemplateId: number;
  const esiTemplateName = faker.lorem.words(2);
  let workflowId: number;

  const firstDayMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    2
  )
    .toISOString()
    .split('T')[0];
  const lastDayMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  )
    .toISOString()
    .split('T')[0];

  const currentDayStart = DateTime.now().startOf('day');
  const yesterday = currentDayStart.plus({ days: -1 });
  const twoDaysAgo = currentDayStart.plus({ days: -2 });

  const newCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: DateTime.fromJSDate(faker.date.past()),
    endCall: DateTime.fromJSDate(faker.date.future()),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startFapReview: currentDayStart,
    endFapReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: initialDBData.template.name,
    templateId: initialDBData.template.id,
    fapReviewTemplateName: initialDBData.fapReviewTemplate.name,
    fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
    technicalReviewTemplateName: initialDBData.technicalReviewTemplate.name,
    technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
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
    startFapReview: currentDayStart,
    endFapReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateId: initialDBData.template.id,
    fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
    technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
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
    entityType: WorkflowType.PROPOSAL,
  };
  const proposalInternalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
    entityType: WorkflowType.PROPOSAL,
  };
  const instrumentAssignedToCall: CreateInstrumentMutationVariables = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(8),
    managerUserId: initialDBData.users.user1.id,
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    cy.createTemplate({
      groupId: TemplateGroupId.PROPOSAL_ESI,
      name: esiTemplateName,
    }).then((result) => {
      if (result.createTemplate) {
        esiTemplateId = result.createTemplate.templateId;
      } else {
        throw new Error('ESI templete creation failed');
      }
    });

    cy.createWorkflow(proposalWorkflow).then((result) => {
      if (result.createWorkflow) {
        workflowId = result.createWorkflow.id;
      } else {
        throw new Error('Workflow creation failed');
      }
    });
    cy.createWorkflow(proposalInternalWorkflow).then((result) => {
      const workflow = result.createWorkflow;
      if (workflow) {
        cy.addWorkflowStatus({
          droppableGroupId: workflow.workflowConnectionGroups[0].groupId,
          statusId: initialDBData.proposalStatuses.editableSubmittedInternal.id,
          workflowId: workflow.id,
          sortOrder: 1,
          prevStatusId: workflow.workflowConnectionGroups[0].connections[0].id,
        }).then((result) => {
          if (result.addWorkflowStatus) {
            cy.addStatusChangingEventsToConnection({
              workflowConnectionId: result.addWorkflowStatus.id,
              statusChangingEvents: ['CALL_ENDED'],
            });
          }
        });
      }
    });
  });

  // TODO: Maybe this should be moved to another file called permissions because its testing more call permissions than calls.
  it('A user should not be able to see/visit calls', () => {
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.should('not.contain', 'Calls');

    cy.visit('/CallPage');
    cy.get('[data-cy="calls-table"]').should('not.exist');
  });

  describe('Call basic tests', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('A user-officer should not be able go to next step or create call if there is validation error', () => {
      const shortCode = faker.random.alphaNumeric(15);

      cy.contains('Proposals');

      cy.contains('Calls').click();

      cy.contains('Create').click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="short-code"] input').should('be.focused');
      cy.get('[data-cy="short-code"] input:invalid').should('have.length', 1);

      cy.get('[data-cy=short-code] input')
        .type(shortCode)
        .should('have.value', shortCode);

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.get('[data-cy="call-template"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.template.name)
        .click();

      cy.get('[data-cy="call-fap-review-template"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.fapReviewTemplate.name)
        .click();

      cy.get('[data-cy="call-technical-review-template"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.technicalReviewTemplate.name)
        .click();

      if (featureFlags.getEnabledFeatures().get(FeatureId.RISK_ASSESSMENT)) {
        cy.get('[data-cy="call-esi-template"]').click();
        cy.get('[role="presentation"]').contains(esiTemplateName).click();
      }

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
      cy.get('[data-cy="cycle-comment"] input').then(($input) => {
        expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
          'Please fill out this field.'
        );
      });
      cy.get('[data-cy="cycle-comment"] input').blur();
      cy.get('[data-cy="cycle-comment"] .Mui-error').should('exist');
    });

    it('A user-officer should not be able to create a call with intenal end date before call end date', function () {
      // will be enabled after @user-office-software/duo-validation new version
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      const todayJsDate = new Date();
      const today = DateTime.fromJSDate(todayJsDate); // set date to specific date to easier test the validation
      cy.clock(todayJsDate);

      const yesterday = today
        .minus({ days: 1 })
        .toFormat(initialDBData.getFormats().dateTimeFormat)
        .toString();

      cy.contains('Proposals');

      cy.contains('Calls').click();

      cy.contains('Create').click();

      cy.get('[data-cy="call-workflow"]').click();
      cy.contains('Loading...').should('not.exist');

      cy.get('[role="presentation"]')
        .contains(proposalInternalWorkflow.name)
        .click();

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.setDatePickerValue(
        '[data-cy=end-call-internal-date] input',
        yesterday
      ).should('have.value', yesterday);

      cy.get('[data-cy=end-call-internal-date] .Mui-error').should('exist');
    });

    it('A user-officer should be able to create a call', () => {
      const {
        shortCode,
        templateName,
        fapReviewTemplateName,
        technicalReviewTemplateName,
        esiTemplateName,
      } = newCall;
      const callShortCode = shortCode || faker.lorem.word(10);
      const callSurveyComment = faker.lorem.word(10);
      const callCycleComment = faker.lorem.word(10);

      cy.contains('Calls').click();

      cy.contains('Create').click();

      cy.get('[data-cy=short-code] input')
        .type(callShortCode)
        .should('have.value', callShortCode);

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.get('[data-cy="call-template"]').click();
      cy.get('[role="presentation"]').contains(templateName).click();

      cy.get('[data-cy="call-fap-review-template"]').click();
      cy.get('[role="presentation"]').contains(fapReviewTemplateName).click();

      cy.get('[data-cy="call-technical-review-template"]').click();
      cy.get('[role="presentation"]')
        .contains(technicalReviewTemplateName)
        .click();

      if (featureFlags.getEnabledFeatures().get(FeatureId.RISK_ASSESSMENT)) {
        cy.get('[data-cy="call-esi-template"]').click();
        cy.get('[role="presentation"]').contains(esiTemplateName).click();
      }

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

    it('A user-officer should be able to create a call with internal date', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      const {
        shortCode,
        templateName,
        fapReviewTemplateName,
        technicalReviewTemplateName,
        esiTemplateName,
      } = newCall;
      const callShortCode = shortCode || faker.lorem.word(10);

      const callInternalEndDate = DateTime.now()
        .plus({ days: 40 })
        .toFormat(initialDBData.getFormats().dateTimeFormat);

      const callSurveyComment = faker.lorem.word(10);
      const callCycleComment = faker.lorem.word(10);

      cy.contains('Calls').click();

      cy.contains('Create').click();

      cy.get('[data-cy=short-code] input')
        .type(callShortCode)
        .should('have.value', callShortCode);

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.get('[data-cy="call-template"]').click();
      cy.get('[role="presentation"]').contains(templateName).click();

      cy.get('[data-cy="call-fap-review-template"]').click();
      cy.get('[role="presentation"]').contains(fapReviewTemplateName).click();

      cy.get('[data-cy="call-technical-review-template"]').click();
      cy.get('[role="presentation"]')
        .contains(technicalReviewTemplateName)
        .click();

      if (featureFlags.getEnabledFeatures().get(FeatureId.RISK_ASSESSMENT)) {
        cy.get('[data-cy="call-esi-template"]').click();
        cy.get('[role="presentation"]').contains(esiTemplateName).click();
      }

      cy.get('#proposalWorkflowId-input').click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[role="presentation"]')
        .contains(proposalInternalWorkflow.name)
        .click();

      cy.setDatePickerValue(
        '[data-cy=end-call-internal-date] input',
        callInternalEndDate
      ).should('have.value', callInternalEndDate);

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

    it('A user-officer should be able to add Faps to a call', () => {
      cy.createCall({
        ...newCall,
        esiTemplateId: esiTemplateId,
        proposalWorkflowId: workflowId,
      });

      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Edit"]')
        .click();

      cy.finishedLoading();
      cy.get('[data-cy="call-template"] input').should(
        'have.value',
        initialDBData.template.name
      );

      cy.get('[data-cy="call-fap-review-template"] input').should(
        'have.value',
        initialDBData.fapReviewTemplate.name
      );

      cy.get('[data-cy="call-technical-review-template"] input').should(
        'have.value',
        initialDBData.technicalReviewTemplate.name
      );

      cy.get('.MuiStep-root').contains('Reviews').click();

      cy.get('[data-cy="call-faps"]').click();

      cy.get('[data-cy="call-faps-options"]').click();

      cy.contains(initialDBData.fap.code).click();

      cy.get('[data-cy="next-step"]').click();
      cy.get('[data-cy="submit"]').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains(newCall.shortCode).parent().find('td').last().contains('1');
    });

    it('A user-officer should be able to edit a call', () => {
      const { shortCode } = updatedCall;

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

      cy.get('#proposalWorkflowId-input').should(
        'have.value',
        proposalWorkflow.name
      );
      cy.get('[data-cy=reference-number-format] input').type(refNumFormat, {
        parseSpecialCharSequences: false,
      });

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.get('[data-cy="next-step"]').click();

      cy.finishedLoading();

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

    it('A user-officer should be able to edit a call internal close date', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      const { shortCode } = updatedCall;

      const callInternalEndDate = DateTime.now()
        .plus({ days: 35 })
        .toFormat(initialDBData.getFormats().dateTimeFormat);

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

      cy.get('[data-cy=start-end-call-input]').click();

      cy.get(`[data-day=${firstDayMonth}]`).click();

      cy.get(`[data-day=${lastDayMonth}]`).click();

      cy.get('[data-cy=start-end-call-input-done-btn]').click();

      cy.get('#proposalWorkflowId-input').click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[role="presentation"]')
        .contains(proposalInternalWorkflow.name)
        .click();

      cy.setDatePickerValue(
        '[data-cy=end-call-internal-date] input',
        callInternalEndDate
      ).should('have.value', callInternalEndDate);

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
        if (response.createCall) {
          createdCallId = response.createCall.id;
        }
      });
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: initialDBData.users.user1.id,
          roles: [
            initialDBData.roles.user,
            initialDBData.roles.instrumentScientist,
          ],
        });
      }
      cy.createInstrument(instrumentAssignedToCall).then((response) => {
        if (response.createInstrument) {
          createdInstrumentId = response.createInstrument.id;
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

      cy.get('[data-cy="assign-instrument-to-call"]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="call-instrument-assignments-table"]').contains(
        instrumentAssignedToCall.shortCode
      );
    });

    it('A user-officer should be able to deactivate/activate a call', () => {
      cy.contains('Calls').click();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Deactivate call"]')
        .click();

      cy.get('[data-cy="confirm-ok"]').click();
      cy.notification({ variant: 'success', text: 'successfully' });

      cy.get('[data-cy="calls-table"]').should(
        'not.contain',
        newCall.shortCode
      );

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Inactive').click();

      cy.finishedLoading();

      cy.contains(newCall.shortCode)
        .parent()
        .find('[aria-label="Activate call"]')
        .click();

      cy.get('[data-cy="confirm-ok"]').click();
      cy.notification({ variant: 'success', text: 'successfully' });

      cy.get('[data-cy="calls-table"]').should(
        'not.contain',
        newCall.shortCode
      );

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Active').click();

      cy.finishedLoading();

      cy.get('[data-cy="calls-table"]').should('contain', newCall.shortCode);
    });

    it('A user-officer should not be able to set negative or too high availability time on instrument per call', () => {
      const MAX_32_BIT_INTEGER = Math.pow(2, 31);
      cy.assignInstrumentToCall({
        callId: createdCallId,
        instrumentFapIds: [{ instrumentId: createdInstrumentId }],
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

      cy.get('[data-cy="availability-time"] input').type('-10');
      cy.get('[data-cy="availability-time"]').contains(
        'Availability time must be a positive number'
      );
      cy.contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('button[aria-label="Save"]')
        .should('be.disabled');

      cy.get('[data-cy="availability-time"] input')
        .clear()
        .type(MAX_32_BIT_INTEGER.toString());

      cy.get('[data-cy="availability-time"]').contains(
        `Availability time can not be grater than ${MAX_32_BIT_INTEGER - 1}`
      );
      cy.contains(instrumentAssignedToCall.shortCode)
        .parent()
        .find('button[aria-label="Save"]')
        .should('be.disabled');
    });

    it('A user-officer should be able to set availability time on instrument per call', () => {
      cy.assignInstrumentToCall({
        callId: createdCallId,
        instrumentFapIds: [{ instrumentId: createdInstrumentId }],
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

      cy.get('[data-cy="availability-time"] input').type('10');

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
        instrumentFapIds: [{ instrumentId: createdInstrumentId }],
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
      }).then((result) => {
        if (result.createCall.id) {
          cy.updateCall({
            ...result.createCall,
            isActive: false,
          } as UpdateCallInput);
        }
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
    });

    it('User officer can filter active internal calls by their status', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.createCall({
        ...newInactiveCall,
        esiTemplateId: esiTemplateId,
        proposalWorkflowId: workflowId,
      }).then((result) => {
        if (result.createCall.id) {
          cy.updateCall({
            ...result.createCall,
            isActive: false,
          } as UpdateCallInput);
        }
      });

      cy.contains('Calls').click();

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.get(
        '[data-cy="calls-table"] [aria-label="Detail panel visibility toggle"]'
      ).should('have.length', 3);
      cy.contains(newCall.shortCode);
      cy.contains(newInactiveCall.shortCode);
      cy.updateCall({
        id: initialDBData.call.id,
        ...newCall,
        proposalWorkflowId: initialDBData.proposal.id,
        endCall: yesterday,
        endCallInternal: DateTime.now().plus({ days: 6 }),
      }).then(() => {
        cy.reload();
        cy.get('[data-cy="call-status-filter"]').click();
        cy.get('[role="listbox"]').contains('Active Internal').click();
        cy.get(
          '[data-cy="calls-table"] [aria-label="Detail panel visibility toggle"]'
        ).should('have.length', 1);
      });
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
    cy.login('user1', initialDBData.roles.user);
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
        .contains('Application deadline')
        .should('not.have.text', 'remaining');
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
      endCall: DateTime.now().plus({ minutes: 1, seconds: 50 }),
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
        .contains('Application deadline')
        .should('not.have.text', 'remaining');
    });
  });

  it('Call internal displays correct time remaining', function () {
    /*
      The time remaining is rounded down to the nearest min, hour or day.
      No time remaining is displayed if over 30 days or under one minute.
    */

    if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
      this.skip();
    }
    cy.login('user1', initialDBData.roles.user);

    cy.visit('/');

    // Create a future call, so that there is always two calls to choose from
    cy.createCall({
      ...newCall,
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ days: 365 }),
      proposalWorkflowId: workflowId,
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ days: 31, hours: 1 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.contains('New Proposal').click();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('Internal deadline')
        .should('not.have.text', 'remaining');
    });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      shortCode: initialDBData.call.shortCode,
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ days: 30, hours: 1 }),
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
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ days: 1, hours: 1 }),
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
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ hours: 7, minutes: 30 }),
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
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ minutes: 1, seconds: 30 }),
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
      endCall: yesterday,
      endCallInternal: DateTime.now().plus({ seconds: 59 }),
      proposalWorkflowId: initialDBData.proposal.id,
    }).then(() => {
      cy.reload();

      cy.contains(initialDBData.call.shortCode)
        .parent()
        .contains('Internal deadline')
        .should('not.have.text', 'remaining');
    });
  });
});
