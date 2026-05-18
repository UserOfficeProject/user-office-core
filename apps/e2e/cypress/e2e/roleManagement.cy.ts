import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

const fillRoleBase = (
  title: string,
  description: string,
  shortCode: string
) => {
  cy.get('[data-cy="create-new-entry"]').click();
  cy.get('[data-cy="role-shortcode-select"]').click();
  cy.contains('Root role').should('be.visible');
  cy.get('[role="listbox"]').find(`[data-value="${shortCode}"]`).click();
  cy.get('[data-cy="role-title-input"]').type(title);
  cy.get('[data-cy="role-description-input"]').type(description);
};

const openEditModal = (title: string) => {
  cy.contains('tr', title).find('[aria-label="Edit"]').click();
};

context('Role management', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    cy.login('officer');
    cy.visit('/admin/roles');
    cy.finishedLoading();
  });

  describe('User role config', () => {
    const title = faker.word.words(2);
    const note = 'A helpful note about this role';
    const updatedNote = 'Updated note after editing';

    it('note entered on creation is visible when re-opening edit', () => {
      fillRoleBase(title, faker.word.words(3), 'user');
      cy.get('[data-cy="role-config-note-input"]').type(note);
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-note-input"]')
        .find('input')
        .should('have.value', note);
    });

    it('note updated in edit mode persists after saving', () => {
      fillRoleBase(title, faker.word.words(3), 'user');
      cy.get('[data-cy="role-config-note-input"]').type(note);
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-note-input"]')
        .find('input')
        .clear()
        .type(updatedNote);
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-note-input"]')
        .find('input')
        .should('have.value', updatedNote);
    });
  });

  describe('Proposal reader role config', () => {
    const title = faker.word.words(2);

    it('checkboxes reflect defaults on a new role', () => {
      fillRoleBase(title, faker.word.words(3), 'proposal_reader');

      cy.get('[data-cy="role-config-has-log-access"]')
        .find('input')
        .should('be.checked');
      cy.get('[data-cy="role-config-has-technical-review-access"]')
        .find('input')
        .should('be.checked');
      cy.get('[data-cy="role-config-has-fap-access"]')
        .find('input')
        .should('be.checked');
      cy.get('[data-cy="role-config-has-admin-access"]')
        .find('input')
        .should('not.be.checked');
    });

    it('unchecked boxes on creation are preserved when re-opening edit', () => {
      fillRoleBase(title, faker.word.words(3), 'proposal_reader');

      cy.get('[data-cy="role-config-has-log-access"]').click();
      cy.get('[data-cy="role-config-has-fap-access"]').click();
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-has-log-access"]')
        .find('input')
        .should('not.be.checked');
      cy.get('[data-cy="role-config-has-technical-review-access"]')
        .find('input')
        .should('be.checked');
      cy.get('[data-cy="role-config-has-fap-access"]')
        .find('input')
        .should('not.be.checked');
    });

    it('checkbox changes in edit mode persist after saving', () => {
      fillRoleBase(title, faker.word.words(3), 'proposal_reader');
      cy.get('[data-cy="role-config-has-log-access"]').click();
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-has-log-access"]')
        .find('input')
        .should('not.be.checked');

      cy.get('[data-cy="role-config-has-log-access"]').click();
      cy.get('[data-cy="role-config-has-technical-review-access"]').click();
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);
      openEditModal(title);

      cy.get('[data-cy="role-config-has-log-access"]')
        .find('input')
        .should('be.checked');
      cy.get('[data-cy="role-config-has-technical-review-access"]')
        .find('input')
        .should('not.be.checked');
      cy.get('[data-cy="role-config-has-fap-access"]')
        .find('input')
        .should('be.checked');
    });

    it('disabled access settings hide corresponding tabs when viewing a proposal', () => {
      const proposalReaderRoleId = 11;
      const tagName = faker.word.words(2);
      const tagShortCode = faker.word.words(1);

      fillRoleBase(title, faker.word.words(3), 'proposal_reader');
      cy.get('[data-cy="role-config-has-technical-review-access"]').click();
      cy.get('[data-cy="role-config-has-fap-access"]').click();
      cy.get('[data-cy="role-config-has-log-access"]').click();
      cy.get('[data-cy="submit-role-button"]').click();

      cy.contains('tr', title);

      cy.createTag({ name: tagName, shortCode: tagShortCode }).then(
        (tagResult) => {
          const tagId = tagResult.createTag.id;

          cy.assignCallsToTag({
            tagId,
            callIds: [initialDBData.call.id],
          });
          cy.updateRoleTags({
            roleId: proposalReaderRoleId,
            tagIds: [tagId],
          });
        }
      );

      cy.createProposal({ callId: initialDBData.call.id });

      cy.updateUserRoles({
        id: initialDBData.users.user1.id,
        roles: [proposalReaderRoleId],
      });

      cy.login('user1', proposalReaderRoleId);
      cy.visit('/Proposals');
      cy.finishedLoading();

      cy.get('[aria-label="View proposal"]').first().click();

      cy.get('[data-cy="proposal-review-tabs"]').should('not.exist');
    });
  });
});
