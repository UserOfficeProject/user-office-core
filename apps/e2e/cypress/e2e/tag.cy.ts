import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const tagName = faker.word.words(2);
const tagShortCode = faker.word.words(1);

const scientist1 = initialDBData.users.user1;

const instrument1 = {
  name: faker.word.words(2),
  shortCode: faker.word.words(1),
  description: faker.word.words(5),
  managerUserId: scientist1.id,
};

context('Tag tests', () => {
  beforeEach(function () {
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TAGS)) {
        this.skip();
      }
    });

    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Tag tests User officer', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to create and delete tag', () => {
      cy.visit('/');
      cy.contains('Tag').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="tag-name"]').type(tagName);
      cy.get('[data-cy="shortCode"]').type(tagShortCode);

      cy.get('[data-cy="submit"]').click();

      cy.contains(tagName);
      cy.contains(tagShortCode);
    });

    it('User officer should be able to assign and remove instruments from tags', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.createInstrument(instrument1);
      cy.visit('/Tag');

      cy.contains(tagName);

      cy.contains(instrument1.name).should('not.exist');

      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-instruments"]').click();

      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains(instrument1.name);

      // It persisits after reload
      cy.visit('/Tag');
      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains(instrument1.name);

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains(instrument1.name).should('not.exist');
    });

    it('User officer should be able to assign and remove calls from tags', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.visit('/Tag');

      cy.contains(tagName);

      cy.contains('call 1').should('not.exist');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains('call 1');

      // It persisits after reload
      cy.visit('/Tag');
      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains('call 1');

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains('call 1').should('not.exist');
    });

    it('User officer should not be able to assign instruments to tag that do not share a tag with the selected call', () => {
      cy.createTag({ name: tagName, shortCode: tagShortCode });
      cy.createInstrument(instrument1);

      cy.visit('/Tag');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.visit('/Calls');
      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-instrument-to-call"]').click();

      cy.notification({
        variant: 'error',
        text: 'One or more instruments do not share a tag with the selected call',
      });
    });

    it('User should only see proposal if tag has been assigned to role', () => {
      const title: string = faker.word.words(3);
      const abstract: string = faker.word.words(3);
      cy.createTag({ name: tagName, shortCode: tagShortCode });

      cy.visit('/Tag');

      cy.get('[aria-label="Assign Call"]').click();

      cy.contains('call 1').parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-calls"]').click();

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        cy.updateProposal({
          proposalPk: createdProposal.primaryKey,
          title: title,
          abstract: abstract,
        });
      });

      cy.visit('/Tag');

      cy.contains(tagName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains('call 1');

      cy.get('[data-cy="officer-menu-items"]')
        .contains('Configuration Settings')
        .click();
      cy.get('[data-cy="officer-menu-items"]')
        .contains('Role management')
        .click();

      cy.get('[data-cy="create-new-entry"]').click();

      cy.get('[data-cy="role-title-input"]').type('Dynamic Proposal Reader');
      cy.get('[data-cy="role-description-input"]').type(
        'Role that can only see calls and proposals with specific tags'
      );
      cy.get('[data-cy="role-shortcode-select"]').click();
      cy.get('[role="listbox"]').contains('proposal_reader').click();
      cy.get('[data-cy="submit-role-button"]').click();

      cy.updateUserRoles({
        id: initialDBData.users.user1.id,
        roles: [11], // newly created role
      });

      cy.login('user1');
      cy.visit('/Proposals');

      cy.finishedLoading();
      cy.contains('No records to display').should('exist');
      cy.contains('Loading...').should('not.exist');
      cy.contains(title).should('not.exist');

      cy.login('officer');
      cy.visit('/admin/roles');
      cy.get('[aria-label="Assign Tag"]').click();

      cy.get('[role="dialog"]').contains(tagName).click();

      cy.get('[role="dialog"] [data-cy="assign-selected-tags"]').click();

      cy.login('user1');
      cy.visit('/Proposals');

      cy.contains(title).should('exist');
    });
  });
});
