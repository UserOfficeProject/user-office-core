import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  EmailStatusActionRecipients,
  FeatureId,
  FeatureUpdateAction,
  Event as PROPOSAL_EVENTS,
  StatusActionType,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

const currentDayStart = DateTime.now().startOf('day');

const newCall = {
  shortCode: faker.string.alphanumeric(15),
  startCall: faker.date.past().toISOString(),
  endCall: faker.date.future().toISOString(),
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
  fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
  technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
  allocationTimeUnit: AllocationTimeUnits.DAY,
  cycleComment: faker.lorem.word(10),
  surveyComment: faker.lorem.word(10),
};

let proposal1Id: string;
let proposal2Id: string;

context('Status actions tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.createEmailTemplate({
      name: 'my-first-email',
      description: 'My First Email',
      useTemplateFile: false,
      subject: 'My First Subject',
      body: 'My First Body',
    });

    cy.createEmailTemplate({
      name: 'my-second-email',
      description: 'My Second Email',
      useTemplateFile: false,
      subject: 'My Second Subject',
      body: 'My Second Body',
    });

    cy.updateFeature({
      action: FeatureUpdateAction.ENABLE,
      featureIds: [FeatureId.PREGENERATED_PROPOSAL_PDF],
    });
  });

  describe('Status actions workflow tests', () => {
    it('User Officer should be able to add a status action to workflow connection', () => {
      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
        prevConnectionId: 1,
      });
      cy.login('officer');
      cy.visit('/ProposalWorkflowEditor/1');

      cy.finishedLoading();

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]').should('exist');
      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="PROPOSALDOWNLOAD-status-action"] input').click();
      cy.get('[data-cy="EMAIL-status-action"] input').click();
      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      // Testing the form validation here and required fields.
      cy.get('[data-cy="action-recipient-PI"] input').should('be.focused');
      cy.get<JQuery<HTMLInputElement>>(
        '[data-cy="action-recipient-PI"] input'
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Please check this box if you want to proceed.'
        );
      });

      cy.get('[data-cy="action-recipient-PI"] input').click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.get('[data-cy="PI-email-template"] input').should('be.focused');
      cy.get<JQuery<HTMLInputElement>>(
        '[data-cy="PI-email-template"] input'
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Please fill out this field.'
        );
      });

      cy.get('[data-cy="PI-combine-emails"]').should('not.be.checked');

      cy.get('[data-cy="PI-email-template"] input').click();
      cy.get('.MuiAutocomplete-listbox li').first().click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'success', text: 'success' });

      cy.closeModal();

      cy.get(
        `[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]`
      ).contains('Email action');
      cy.get(
        `[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]`
      ).contains('Proposal download action');
    });

    it('User Officer should be able to update a status action added to the workflow connection', () => {
      const statusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.PI,
              description: '',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
            combineEmails: true,
          },
        ],
      };

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
        prevConnectionId: 1,
      }).then((result) => {
        cy.reload();
        cy.addConnectionStatusActions({
          actions: [
            {
              actionId: 1,
              actionType: StatusActionType.EMAIL,
              config: JSON.stringify(statusActionConfig),
            },
          ],
          connectionId: result.addWorkflowStatus.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      });

      cy.login('officer');
      cy.visit('/ProposalWorkflowEditor/1');

      cy.finishedLoading();

      cy.get(
        `[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]`
      ).contains('Email action');

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

      cy.get('[data-cy="action-recipient-PI"] input').should('be.checked');
      cy.get('[data-cy="PI-email-template"] input')
        .invoke('val')
        .should('not.be.empty');
      cy.get('[data-cy="PI-combine-emails"] input').should('be.checked');

      cy.get('[data-cy="action-recipient-CO_PROPOSERS"] input').click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.get('[data-cy="CO_PROPOSERS-email-template"] input').should(
        'be.focused'
      );
      cy.get<JQuery<HTMLInputElement>>(
        '[data-cy="CO_PROPOSERS-email-template"] input'
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Please fill out this field.'
        );
      });
      cy.get('[data-cy="CO_PROPOSERS-combine-emails"] input').should(
        'not.be.checked'
      );

      cy.get('[data-cy="CO_PROPOSERS-email-template"] input').click();
      cy.get('.MuiAutocomplete-listbox li').last().click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'success', text: 'success' });
    });

    it('User Officer should be able to delete a status action added to the workflow connection', () => {
      const statusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.PI,
              description: '',
            },
            emailTemplate: {
              id: 'my-second-email',
              name: 'my-second-email',
            },
          },
        ],
      };

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
        prevConnectionId: 1,
      }).then((result) => {
        cy.addConnectionStatusActions({
          actions: [
            {
              actionId: 1,
              actionType: StatusActionType.EMAIL,
              config: JSON.stringify(statusActionConfig),
            },
            { actionId: 3, actionType: StatusActionType.PROPOSALDOWNLOAD },
          ],
          connectionId: result.addWorkflowStatus.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      });

      cy.login('officer');
      cy.visit('/ProposalWorkflowEditor/1');

      cy.finishedLoading();

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

      cy.get('[data-cy="PROPOSALDOWNLOAD-status-action"] input')
        .scrollIntoView()
        .should('be.checked');

      cy.get('[data-cy="EMAIL-status-action"] input').uncheck();

      cy.get('[data-cy="PROPOSALDOWNLOAD-status-action"] input').uncheck();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'success', text: 'success' });

      cy.closeModal();

      cy.get(
        '[data-cy="edge-label-events-list-DRAFT-FEASIBILITY_REVIEW"]'
      ).should('not.exist');
    });

    it('User Officer should be able to add other recipients by email', () => {
      const statusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.PI,
              description: '',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
          },
        ],
      };
      const invalidEmail = 'test@test';
      const validEmail = faker.internet.email();

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
        prevConnectionId: 1,
      }).then((result) => {
        cy.addConnectionStatusActions({
          actions: [
            {
              actionId: 1,
              actionType: StatusActionType.EMAIL,
              config: JSON.stringify(statusActionConfig),
            },
          ],
          connectionId: result.addWorkflowStatus.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      });

      cy.login('officer');
      cy.visit('/ProposalWorkflowEditor/1');

      cy.finishedLoading();

      cy.get(
        'ul[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"] > li'
      )
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

      cy.get('[data-cy="action-recipient-PI"] input').should('be.checked');
      cy.get('[data-cy="PI-email-template"] input')
        .invoke('val')
        .should('not.be.empty');
      cy.get('[data-cy="PI-combine-emails"]').should('not.be.checked');

      cy.get('[data-cy="action-recipient-OTHER"] input').click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.get('[data-cy="OTHER-email-template"] input').should('be.focused');
      cy.get<JQuery<HTMLInputElement>>(
        '[data-cy="OTHER-email-template"] input'
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Please fill out this field.'
        );
      });

      cy.get('[data-cy="OTHER-email-template"] input').click();
      cy.get('[data-cy="OTHER-combine-emails"]').should('not.exist');
      cy.get('.MuiAutocomplete-listbox li').first().click();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.get('[data-cy="other-email-recipients"] input').should('be.focused');
      cy.get<JQuery<HTMLInputElement>>(
        '[data-cy="other-email-recipients"] input'
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Please fill out this field.'
        );
      });

      cy.get('[data-cy="other-email-recipients"] input')
        .clear()
        .type(invalidEmail);

      cy.realPress('Enter');

      cy.get('[data-cy="other-email-recipients"]').contains(
        `${invalidEmail} is not a valid email address.`
      );

      cy.get('[data-cy="other-email-recipients"] input')
        .clear()
        .type(invalidEmail);

      cy.realPress('Enter');

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'error', text: 'Input validation errors' });

      cy.closeNotification();

      cy.get('[data-cy="other-email-recipients"] input')
        .clear()
        .type(validEmail);

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.get('[data-cy="other-email-recipients"]').contains(
        'Please add the typed value by pressing Enter'
      );

      cy.get('[data-cy="other-email-recipients"] input').focus();

      cy.realPress('Enter');

      cy.get('[data-cy="added-email-recipients"]').should(
        'contain.text',
        validEmail
      );

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'success', text: 'success' });

      cy.closeModal();

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="action-recipient-OTHER"] input').should('be.checked');

      cy.get('[data-cy="added-email-recipients"]').should(
        'contain.text',
        validEmail
      );
    });

    it('User Officer should be able to add multiple actions per status', () => {
      const emailStatusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.OTHER,
              description:
                'Other email recipients manually added by their email',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
            otherRecipientEmails: [faker.internet.email()],
          },
        ],
      };

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 150,
        prevConnectionId: 1,
      }).then((result) => {
        cy.addConnectionStatusActions({
          actions: [
            {
              actionId: 1,
              actionType: StatusActionType.EMAIL,
              config: JSON.stringify(emailStatusActionConfig),
            },
            { actionId: 3, actionType: StatusActionType.PROPOSALDOWNLOAD },
          ],
          connectionId: result.addWorkflowStatus.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      });

      cy.login('officer');
      cy.visit('/ProposalWorkflowEditor/1');

      cy.finishedLoading();

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

      cy.get('[data-cy="PROPOSALDOWNLOAD-status-action"] input')
        .scrollIntoView()
        .should('be.checked');

      cy.get('[data-cy="RABBITMQ-status-action"] input').should(
        'not.be.checked'
      );
      cy.get('[data-cy="RABBITMQ-status-action"] input').check();

      cy.get('[data-cy="submit"]').contains('Add status actions').click();

      cy.notification({ variant: 'success', text: 'success' });

      cy.closeModal();

      cy.get(
        '[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]'
      ).contains('Email action');
      cy.get(
        '[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]'
      ).contains('RabbitMQ action');
      cy.get(
        '[data-cy="edge-label-actions-list-DRAFT-FEASIBILITY_REVIEW"]'
      ).contains('Proposal download action');

      cy.get(`[aria-label="Edge from DRAFT to FEASIBILITY_REVIEW"]`)
        .should('exist')
        .click({ force: true });

      cy.get('[data-cy="status-events-and-actions-modal"]')
        .contains('Status actions')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

      cy.get('[data-cy="PROPOSALDOWNLOAD-status-action"] input')
        .scrollIntoView()
        .should('be.checked');

      cy.get('[data-cy="RABBITMQ-status-action"] input')
        .scrollIntoView()
        .should('be.checked');
    });

    it('User Officer should be able to see logs after status actions successful run', () => {
      const proposalTitle = faker.lorem.words(3);
      const proposalAbstract = faker.lorem.paragraph();
      const statusActionEmail = faker.internet.email();
      const statusActionEvent = 'PROPOSAL_STATUS_ACTION_EXECUTED';

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          const createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposalTitle,
            abstract: proposalAbstract,
          });
        }
      });

      const emailStatusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.OTHER,
              description:
                'Other email recipients manually added by their email',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
            otherRecipientEmails: [statusActionEmail],
          },
        ],
      };

      const rabbitMQStatusActionConfig = {
        exchanges: ['user_office_backend.fanout'],
      };

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.feasibilityReview.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
        prevConnectionId: 1,
      }).then((result) => {
        cy.addConnectionStatusActions({
          actions: [
            {
              actionId: 1,
              actionType: StatusActionType.EMAIL,
              config: JSON.stringify(emailStatusActionConfig),
            },
            {
              actionId: 2,
              actionType: StatusActionType.RABBITMQ,
              config: JSON.stringify(rabbitMQStatusActionConfig),
            },
            { actionId: 3, actionType: StatusActionType.PROPOSALDOWNLOAD },
          ],
          connectionId: result.addWorkflowStatus.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      });

      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.contains(proposalTitle)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');

      cy.get('@dialog').find('[data-cy="status-selection"] input').click();

      cy.get('[role="listbox"]')
        .contains(initialDBData.proposalStatuses.feasibilityReview.name)
        .click();

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.get('@dialog').should('not.exist');

      cy.contains(proposalTitle)
        .parent()
        .contains(initialDBData.proposalStatuses.feasibilityReview.name);

      cy.contains(proposalTitle)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.finishedLoading();

      cy.get('[role="dialog"] [role="tab"]').contains('Logs').click();

      cy.finishedLoading();

      cy.contains('PROPOSAL_STATUS_CHANGED_BY_USER')
        .parent()
        .contains(
          `Status changed to: ${initialDBData.proposalStatuses.feasibilityReview.name}`
        );

      cy.get('[data-cy="event-logs-table"]')
        .invoke('text')
        .then((tableText) => {
          expect(tableText).to.contain(
            `${statusActionEvent}Email successfully sent`
          );

          expect(tableText).to.contain(
            `${statusActionEvent}Proposal event successfully sent to the message broker`
          );
        });
    });
  });

  describe('Status actions logs tests', () => {
    beforeEach(() => {
      const emailStatusActionConfig = {
        recipientsWithEmailTemplate: [
          {
            recipient: {
              name: EmailStatusActionRecipients.PI,
              description: '',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
          },
          {
            recipient: {
              name: EmailStatusActionRecipients.OTHER,
              description:
                'Other email recipients manually added by their email',
            },
            emailTemplate: {
              id: 'my-first-email',
              name: 'my-first-email',
            },
            otherRecipientEmails: [faker.internet.email()],
          },
        ],
      };

      const rabbitMQStatusActionConfig = {
        exchanges: ['user_office_backend.fanout'],
      };

      cy.addWorkflowStatus({
        statusId: initialDBData.proposalStatuses.editableSubmitted.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
        sortOrder: 1,
        prevStatusId: initialDBData.proposalStatuses.draft.id,
        posX: 0,
        posY: 200,
      }).then((result) => {
        const connection = result.addWorkflowStatus;
        if (connection) {
          cy.addStatusChangingEventsToConnection({
            workflowConnectionId: connection.id,
            statusChangingEvents: [PROPOSAL_EVENTS.PROPOSAL_SUBMITTED],
          });
          cy.addConnectionStatusActions({
            actions: [
              {
                actionId: 1,
                actionType: StatusActionType.EMAIL,
                config: JSON.stringify(emailStatusActionConfig),
              },
              {
                actionId: 2,
                actionType: StatusActionType.RABBITMQ,
                config: JSON.stringify(rabbitMQStatusActionConfig),
              },
              { actionId: 3, actionType: StatusActionType.PROPOSALDOWNLOAD },
            ],
            connectionId: connection.id,
            workflowId: initialDBData.workflows.defaultWorkflow.id,
          });
        }
      });

      cy.createCall({
        ...newCall,
        proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      }).then((result) => {
        cy.createProposal({ callId: result.createCall.id }).then((result) => {
          const proposal = result.createProposal;
          if (proposal) {
            cy.submitProposal({ proposalPk: proposal.primaryKey }).then(
              (result) => {
                proposal1Id = result.submitProposal.proposalId;
              }
            );
          }
        });
      });

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal;
        if (proposal) {
          cy.submitProposal({ proposalPk: proposal.primaryKey }).then(
            (result) => {
              proposal2Id = result.submitProposal.proposalId;
            }
          );
        }
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000); // wait until status actions are executed
    });

    it('User Officer should be able to view and replay email status actions', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Email');

      cy.get('[data-cy="replay_status_action_icon"]')
        .first()
        .click({ force: true });

      cy.contains('duplicate emails').should('exist');

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Status action replay successfully sent.',
      });
    });

    it('User Officer should be able to view and replay proposal download status actions', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Proposal Download');

      cy.get('[data-cy="replay_status_action_icon"]')
        .first()
        .click({ force: true });

      cy.contains('unexpected behaviour').should('exist');

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Status action replay successfully sent.',
      });
    });

    it('User Officer should be able to replay all email status actions in a call', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Email');

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.get('[data-cy="replay_all_status_action_icon"]').should('not.exist');

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(initialDBData.call.shortCode).click();

      cy.get('[data-cy="replay_all_status_action_icon"]')
        .should('exist')
        .first()
        .click({ force: true });

      cy.contains(
        `all failed status actions in call '${initialDBData.call.shortCode}'`
      ).should('exist');

      cy.get('[data-cy="confirm-ok"]').click();
    });

    it('User Officer should be able to replay all proposal download status actions in a call', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Proposal Download');

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.get('[data-cy="replay_all_status_action_icon"]').should('not.exist');

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(initialDBData.call.shortCode).click();

      cy.get('[data-cy="replay_all_status_action_icon"]')
        .should('exist')
        .first()
        .click({ force: true });

      cy.contains(
        `all failed status actions in call '${initialDBData.call.shortCode}'`
      ).should('exist');

      cy.get('[data-cy="confirm-ok"]').click();
    });

    it('User Officer should be able to view and filter email status actions logs', () => {
      const assertProposalPresentInTable = (proposalId: string) => {
        return cy
          .get('[data-cy="status-actions-logs-table"]')
          .find('tbody td')
          .contains(proposalId)
          .parents('tr')
          .should('contain', 'SUCCESSFUL');
      };

      const assertProposalAbsentInTable = (proposalId: string) => {
        cy.get('[data-cy="status-actions-logs-table"]').should(
          'not.contain',
          proposalId
        );
      };

      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Email');

      cy.contains('Email Status Actions Logs').should('exist');

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Successful').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 4);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Failed').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .first()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 4);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(initialDBData.call.shortCode).click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 2);

      assertProposalAbsentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(newCall.shortCode).click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 2);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalAbsentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 4);
    });

    it('User Officer should be able to view and filter proposal download status actions logs', () => {
      const assertProposalPresentInTable = (proposalId: string) => {
        return cy
          .get('[data-cy="status-actions-logs-table"]')
          .find('tbody td')
          .contains(proposalId)
          .parents('tr')
          .should('contain', 'SUCCESSFUL');
      };

      const assertProposalAbsentInTable = (proposalId: string) => {
        cy.get('[data-cy="status-actions-logs-table"]').should(
          'not.contain',
          proposalId
        );
      };

      cy.login('officer');
      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Proposal Download');

      cy.contains('Proposal Download Status Actions Logs').should('exist');

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Successful').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 2);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.log('after');

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('Failed').click();

      cy.finishedLoading();
      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .first()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });

      cy.get('[data-cy="status-actions-log-status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 2);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(initialDBData.call.shortCode).click();

      cy.finishedLoading();

      assertProposalAbsentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains(newCall.shortCode).click();

      cy.finishedLoading();

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalAbsentInTable(String(proposal2Id));

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();

      cy.finishedLoading();

      cy.get('[data-cy="status-actions-logs-table"]')
        .find('tbody td')
        .filter(':contains("SUCCESSFUL")')
        .should('have.length', 2);

      assertProposalPresentInTable(String(proposal1Id));
      assertProposalPresentInTable(String(proposal2Id));
    });

    it('User Officer should be able to access the proposal from the link in status actions logs', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal;
        if (proposal) {
          cy.submitProposal({ proposalPk: proposal.primaryKey }).then(() => {
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(5000); // wait until status actions are executed. Speciffically downloading the proposal PDF takes some time.

            cy.login('officer');
            cy.visit('/');

            cy.finishedLoading();

            cy.navigateToStatusActionLogsSubmenu('Proposal Download');

            cy.contains(proposal.proposalId).click();

            cy.get('h1')
              .should('contain.text', 'View proposal')
              .should('contain.text', proposal.proposalId);

            cy.visit('/');

            cy.navigateToStatusActionLogsSubmenu('Email');

            cy.contains(proposal.proposalId).click();

            cy.get('h1')
              .should('contain.text', 'View proposal')
              .should('contain.text', proposal.proposalId);
          });
        }
      });
    });
  });
});
