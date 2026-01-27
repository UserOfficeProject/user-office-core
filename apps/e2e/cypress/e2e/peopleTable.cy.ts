import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('PageTable component tests', () => {
  const emails = new Array(10).fill(0).map(() => faker.internet.email());
  const title = faker.random.words(3);
  const abstract = faker.random.words(8);

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
    });
  });

  describe('ProposalPeopleTable component Preserve selected users', () => {
    it('Should add a new collaborator and that collaborator should stay as suggestion in the collaborators list', () => {
      cy.login('user1');
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        initialDBData.users.user2.email
      );
      cy.get('[role=presentation]')
        .contains(initialDBData.users.user2.lastName)
        .click();
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.get('[data-cy="invite-user-submit-button"]');

      cy.get('[role=presentation]')
        .contains(initialDBData.users.user2.lastName)
        .click();

      cy.get('[role=presentation]').contains(
        initialDBData.users.user2.lastName
      );

      cy.get('[data-cy="invite-user-autocomplete"]').type(emails[0]);

      cy.contains(`Invite ${emails[0]} via email`).should('exist');

      cy.get('[data-cy="invite-user-submit-button"]').click();

      cy.get('[data-cy=title] input').type(title).should('have.value', title);

      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.finishedLoading();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Submit').click();

      cy.get('[data-cy=confirm-ok]').click();

      cy.contains('Dashboard').click();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').click();

      cy.get('[role=presentation]').contains(
        initialDBData.users.user2.lastName
      );
    });
  });

  describe('PeopleTable sort', () => {
    it('PeopleTable should sort all people when using column sort', () => {
      let firstTableRowTextBeforeSorting: string;
      let firstTableRowTextAfterSorting: string;
      cy.login('officer');
      cy.visit('/People');

      cy.finishedLoading();

      cy.get('[data-cy="people-table"]').should('exist');

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          firstTableRowTextBeforeSorting = element.text();
        });

      cy.intercept('POST', '/graphql', (req) => {
        if (req.body?.operationName === 'getUsers') {
          req.alias = 'getUsers';
        }
      });

      cy.get('[data-cy="people-table"] thead')
        .contains('Firstname')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.wait('@getUsers');
      cy.finishedLoading();

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          firstTableRowTextAfterSorting = element.text();
          expect(firstTableRowTextBeforeSorting).not.equal(
            firstTableRowTextAfterSorting
          );
        });

      cy.get('[data-cy="people-table"] thead')
        .contains('Firstname')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.wait('@getUsers');
      cy.finishedLoading();

      cy.get('[data-cy="people-table"] tbody tr')
        .first()
        .then((element) => {
          expect(firstTableRowTextAfterSorting).not.equal(element.text());
        });
    });
  });

  describe('PeopleTable component allows swapping between PIs and CoIs', () => {
    it('Should allow user to swap between PIs and CoIs', () => {
      cy.login('user1');
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        initialDBData.users.user2.email
      );

      cy.get('[role=presentation]')
        .contains(initialDBData.users.user2.lastName)
        .click();

      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="assign-as-pi"]').click();

      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Benjamin'
      );
      cy.contains('Carl'); //The name "Carl" should appear in Co-proposers table
    });
  });
});
