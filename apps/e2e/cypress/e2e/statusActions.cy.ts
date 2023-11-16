import { faker } from '@faker-js/faker';
import {
  EmailStatusActionRecipients,
  ProposalStatusActionType,
} from '@user-office-software-libs/shared-types';

import initialDBData from '../support/initialDBData';

context('Status actions tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  it('User Officer should be able to add a status action to workflow connection', () => {
    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    });
    cy.login('officer');
    cy.visit('/ProposalWorkflowEditor/1');

    cy.finishedLoading();

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]').should('exist');
    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

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

    cy.get('[data-cy="PI-email-template"] input').click();
    cy.get('.MuiAutocomplete-listbox li').first().click();

    cy.get('[data-cy="submit"]').contains('Add status actions').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.closeModal();

    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).should('exist');
    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).realHover();

    cy.get('[role="tooltip"]').contains('Status actions: Email action');
  });

  it('User Officer should be able to update a status action added to the workflow connection', () => {
    const statusActionConfig = {
      recipientsWithEmailTemplate: [
        {
          recipient: { name: EmailStatusActionRecipients.PI, description: '' },
          emailTemplate: { id: 'pi-template', name: 'PI template' },
        },
      ],
    };

    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      cy.addConnectionStatusActions({
        actions: [
          {
            actionId: 1,
            actionType: ProposalStatusActionType.EMAIL,
            config: JSON.stringify(statusActionConfig),
          },
        ],
        connectionId: result.addProposalWorkflowStatus.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
      });
    });

    cy.login('officer');
    cy.visit('/ProposalWorkflowEditor/1');

    cy.finishedLoading();

    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).should('exist');
    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).realHover();

    cy.get('[role="tooltip"]').contains('Status actions: Email action');

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

    cy.get('[data-cy="action-recipient-PI"] input').should('be.checked');
    cy.get('[data-cy="PI-email-template"] input')
      .invoke('val')
      .should('not.be.empty');

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

    cy.get('[data-cy="CO_PROPOSERS-email-template"] input').click();
    cy.get('.MuiAutocomplete-listbox li').last().click();

    cy.get('[data-cy="submit"]').contains('Add status actions').click();

    cy.notification({ variant: 'success', text: 'success' });
  });

  it('User Officer should be able to delete a status action added to the workflow connection', () => {
    const statusActionConfig = {
      recipientsWithEmailTemplate: [
        {
          recipient: { name: EmailStatusActionRecipients.PI, description: '' },
          emailTemplate: { id: 'pi-template', name: 'PI template' },
        },
      ],
    };

    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      cy.addConnectionStatusActions({
        actions: [
          {
            actionId: 1,
            actionType: ProposalStatusActionType.EMAIL,
            config: JSON.stringify(statusActionConfig),
          },
        ],
        connectionId: result.addProposalWorkflowStatus.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
      });
    });

    cy.login('officer');
    cy.visit('/ProposalWorkflowEditor/1');

    cy.finishedLoading();

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

    cy.get('[data-cy="EMAIL-status-action"] input').uncheck();

    cy.get('[data-cy="submit"]').contains('Add status actions').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.closeModal();

    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).should('not.exist');
  });

  it('User Officer should be able to add other recipients by email', () => {
    const statusActionConfig = {
      recipientsWithEmailTemplate: [
        {
          recipient: { name: EmailStatusActionRecipients.PI, description: '' },
          emailTemplate: { id: 'pi-template', name: 'PI template' },
        },
      ],
    };
    const invalidEmail = 'test@test';
    const validEmail = faker.internet.email();

    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      cy.addConnectionStatusActions({
        actions: [
          {
            actionId: 1,
            actionType: ProposalStatusActionType.EMAIL,
            config: JSON.stringify(statusActionConfig),
          },
        ],
        connectionId: result.addProposalWorkflowStatus.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
      });
    });

    cy.login('officer');
    cy.visit('/ProposalWorkflowEditor/1');

    cy.finishedLoading();

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

    cy.get('[data-cy="action-recipient-PI"] input').should('be.checked');
    cy.get('[data-cy="PI-email-template"] input')
      .invoke('val')
      .should('not.be.empty');

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

    cy.get('[data-cy="other-email-recipients"] input').clear().type(validEmail);

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

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

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
    const statusActionConfig = {
      recipientsWithEmailTemplate: [
        {
          recipient: {
            name: EmailStatusActionRecipients.OTHER,
            description: 'Other email recipients manually added by their email',
          },
          emailTemplate: { id: 'my-first-email', name: 'My First Email' },
          otherRecipientEmails: [faker.internet.email()],
        },
      ],
    };

    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      cy.addConnectionStatusActions({
        actions: [
          {
            actionId: 1,
            actionType: ProposalStatusActionType.EMAIL,
            config: JSON.stringify(statusActionConfig),
          },
        ],
        connectionId: result.addProposalWorkflowStatus.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
      });
    });

    cy.login('officer');
    cy.visit('/ProposalWorkflowEditor/1');

    cy.finishedLoading();

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

    cy.get('[data-cy="RABBITMQ-status-action"] input').should('not.be.checked');
    cy.get('[data-cy="RABBITMQ-status-action"] input').check();

    cy.get('[data-cy="submit"]').contains('Add status actions').click();

    cy.notification({ variant: 'success', text: 'success' });

    cy.closeModal();

    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).should('exist');
    cy.get(
      `[data-cy^="connection_FEASIBILITY_REVIEW"] [data-testid="PendingActionsIcon"]`
    ).realHover();

    cy.get('[role="tooltip"]').contains(
      'Status actions: Email action,RabbitMQ action'
    );

    cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

    cy.get('[data-cy="status-events-and-actions-modal"]')
      .contains('Status actions')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="EMAIL-status-action"] input').should('be.checked');

    cy.get('[data-cy="RABBITMQ-status-action"] input').should('be.checked');
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
            description: 'Other email recipients manually added by their email',
          },
          emailTemplate: {
            id: 'status-actions-test-template',
            name: 'Status actions test template',
          },
          otherRecipientEmails: [statusActionEmail],
        },
      ],
    };

    const rabbitMQStatusActionConfig = {
      exchanges: ['user_office_backend.fanout'],
    };

    cy.addProposalWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevProposalStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      cy.addConnectionStatusActions({
        actions: [
          {
            actionId: 1,
            actionType: ProposalStatusActionType.EMAIL,
            config: JSON.stringify(emailStatusActionConfig),
          },
          {
            actionId: 2,
            actionType: ProposalStatusActionType.RABBITMQ,
            config: JSON.stringify(rabbitMQStatusActionConfig),
          },
        ],
        connectionId: result.addProposalWorkflowStatus.id,
        workflowId: initialDBData.workflows.defaultWorkflow.id,
      });
    });

    cy.login('officer');
    cy.visit('/');

    cy.finishedLoading();

    cy.contains(proposalTitle).parent().find('input[type="checkbox"]').check();

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

    cy.get('[role="tab"]').contains('Logs').click();

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
          `${statusActionEvent}Email successfully sent to: ${statusActionEmail}`
        );

        expect(tableText).to.contain(
          `${statusActionEvent}Proposal event successfully sent to the message broker`
        );
      });
  });
});
