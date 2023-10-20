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

    cy.get(
      '[data-cy="accordion-EMAIL"] [data-testid="ExpandMoreIcon"]'
    ).click();

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

    cy.get(
      '[data-cy="accordion-EMAIL"] [data-testid="ExpandMoreIcon"]'
    ).click();

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

    cy.get(
      '[data-cy="accordion-EMAIL"] [data-testid="ExpandMoreIcon"]'
    ).click();

    cy.get('[data-cy="action-recipient-OTHER"] input').should('be.checked');

    cy.get('[data-cy="added-email-recipients"]').should(
      'contain.text',
      validEmail
    );
  });
  // TODO: Try to find a way to test the actual run of the status actions.
});
