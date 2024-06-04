import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Predefined messages tests', () => {
  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
  });

  const messageTitle = faker.random.words();
  const message = faker.random.words();

  it('User officer should be able to save new and use saved predefined message', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains(initialDBData.proposal.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.get('[role="dialog"] [role="tab"]').contains('Admin').click();

    cy.get(
      '[data-cy="commentForUser"] [data-cy="select-predefined-message"]'
    ).click();

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message-title"] input'
    )
      .clear()
      .type(messageTitle);

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message"] textarea'
    )
      .first()
      .clear()
      .type(message);

    cy.get('[data-cy="save-and-use-message"]').click();

    cy.notification({
      variant: 'success',
      text: 'Message created successfully',
    });

    cy.get('[data-cy="commentForUser"] textarea')
      .first()
      .should('have.value', message);

    cy.get(
      `[data-cy="managementTimeAllocation-${initialDBData.instrument1.id}"] input`
    )
      .clear()
      .type('1');

    cy.get('[data-cy="save-admin-decision"]').click();

    cy.notification({
      variant: 'success',
      text: 'Saved',
    });

    cy.closeModal();

    cy.contains(initialDBData.proposal.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.get('[role="dialog"] [role="tab"]').contains('Admin').click();

    cy.get('[data-cy="commentForUser"] textarea')
      .first()
      .should('have.value', message);

    cy.get(
      '[data-cy="commentForUser"] [data-cy="select-predefined-message"]'
    ).click();

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="predefined-message-select"] input'
    ).should('have.value', messageTitle);
  });

  it('User officer should be able to edit and remove predefined messages', () => {
    cy.createPredefinedMessage({
      title: messageTitle,
      message: message,
      key: 'user',
    });

    cy.login('officer');
    cy.visit('/');

    cy.contains(initialDBData.proposal.title)
      .parent()
      .find('[data-cy="view-proposal"]')
      .click();

    cy.get('[role="dialog"] [role="tab"]').contains('Admin').click();

    cy.get(
      '[data-cy="commentForUser"] [data-cy="select-predefined-message"]'
    ).click();

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="predefined-message-select"]'
    ).click();
    cy.get('[data-cy="predefined-message-select-options"]')
      .contains(messageTitle)
      .click();

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message-title"] input'
    ).should('have.value', messageTitle);
    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message"] textarea'
    )
      .first()
      .should('have.value', message);

    cy.get('[data-cy="use-message"]').click();

    cy.get('[data-cy="commentForUser"] textarea')
      .first()
      .should('have.value', message);

    cy.get(
      '[data-cy="commentForUser"] [data-cy="select-predefined-message"]'
    ).click();

    cy.get('[data-cy="delete-message"]').click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.notification({
      variant: 'success',
      text: 'Message deleted successfully',
    });

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message-title"] input'
    ).should('have.value', '');

    cy.get(
      '[aria-labelledby="predefined-messages-modal"] [data-cy="message"] textarea'
    )
      .first()
      .should('have.value', '');
  });
});
