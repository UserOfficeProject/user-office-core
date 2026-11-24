import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Mobile proposal tests', () => {
  faker.seed(4);

  const proposer = initialDBData.users.user1;
  const draftProposal = {
    title: `Draft ${faker.lorem.words(2)}`,
    abstract: faker.lorem.words(3),
  };
  const readOnlyProposal = initialDBData.proposal2;
  const seededProposalCount = 2;

  let draftProposalPk: number;

  const createDraftProposal = () => {
    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        draftProposalPk = result.createProposal.primaryKey;

        cy.updateProposal({
          proposalPk: draftProposalPk,
          title: draftProposal.title,
          abstract: draftProposal.abstract,
          proposerId: proposer.id,
        });
      }
    });
  };

  const visitProposalsSection = () => {
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.finishedLoading();

    if (featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
      cy.get('[data-cy="dashboard-section-proposals"]').click();
    }
  };

  describe('Proposal cards', () => {
    beforeEach(() => {
      cy.resetDB(true);
      cy.getAndStoreFeaturesEnabled();
      cy.viewport('iphone-x');

      createDraftProposal();
    });

    it('Should close the mobile sidebar after selecting a menu link', () => {
      visitProposalsSection();

      cy.get('[data-cy="open-drawer"]').click();
      cy.get('[data-cy="user-menu-items"]').contains('a', 'Dashboard').click();
      cy.get('[data-cy="close-drawer"]').should('not.exist');

      cy.get('[data-cy="open-drawer"]').click();
      cy.get('[data-cy="user-menu-items"]')
        .contains('a', 'New Proposal')
        .click();
      cy.location('pathname').should('eq', '/ProposalSelectType');
      cy.get('[data-cy="close-drawer"]').should('not.exist');
    });

    it('Should open a draft proposal for editing from its card', () => {
      visitProposalsSection();

      cy.contains('[data-cy="proposal-card"]', draftProposal.title)
        .find('[data-cy="proposal-card-open"]')
        .should('contain.text', 'Continue')
        .and('have.descendants', '[data-testid="EditIcon"]')
        .click();

      cy.url().should('contain', `/ProposalEdit/${draftProposalPk}`);

      cy.finishedLoading();

      cy.get('[data-cy="questionary-progress"]').should('exist');
      cy.get('[data-cy="mobile-app-bar"]').should(
        'contain.text',
        draftProposal.title
      );
    });

    it('Should open a proposal that is no longer editable for viewing', () => {
      visitProposalsSection();

      cy.contains('[data-cy="proposal-card"]', readOnlyProposal.title)
        .find('[data-cy="proposal-card-open"]')
        .should('contain.text', 'View')
        .and('have.descendants', '[data-testid="VisibilityIcon"]')
        .click();

      cy.url().should('contain', `/ProposalEdit/${readOnlyProposal.id}`);

      cy.finishedLoading();

      cy.get('#horizontal-tab-1').click();

      cy.get('[data-cy="questionary-details-view"]').should('exist');
      cy.contains(readOnlyProposal.title);
    });

    it('Should offer delete in the action sheet only for a draft proposal', () => {
      visitProposalsSection();

      cy.contains('[data-cy="proposal-card"]', draftProposal.title)
        .find('[data-cy="proposal-card-menu"]')
        .click();

      cy.get('.MuiDrawer-root').should('contain.text', draftProposal.title);
      cy.get('[data-cy="card-sheet-clone"]').should('exist');
      cy.get('[data-cy="card-sheet-download"]').should('exist');
      cy.get('[data-cy="card-sheet-delete"]').should('exist');

      cy.get('.MuiDrawer-root .MuiBackdrop-root').click();

      cy.get('[data-cy="card-sheet-clone"]').should('not.exist');
      cy.get('[data-cy="proposal-card"]').should(
        'have.length',
        seededProposalCount + 1
      );

      cy.contains('[data-cy="proposal-card"]', readOnlyProposal.title)
        .find('[data-cy="proposal-card-menu"]')
        .click();

      cy.get('.MuiDrawer-root').should('contain.text', readOnlyProposal.title);
      cy.get('[data-cy="card-sheet-clone"]').should('exist');
      cy.get('[data-cy="card-sheet-download"]').should('exist');
      cy.get('[data-cy="card-sheet-delete"]').should('not.exist');
    });

    it('Should be able to leave the clone dialog without cloning the proposal', () => {
      visitProposalsSection();

      cy.get('[data-cy="proposal-card"]').should(
        'have.length',
        seededProposalCount + 1
      );

      cy.contains('[data-cy="proposal-card"]', draftProposal.title)
        .find('[data-cy="proposal-card-menu"]')
        .click();
      cy.get('[data-cy="card-sheet-clone"]').click();

      cy.get('[role="dialog"]').should('contain.text', 'Clone proposal');
      cy.get('[data-cy="call-selection"]').should('exist');

      cy.get('[data-cy="mobile-app-bar-back"]').click();

      cy.get('[role="dialog"]').should('not.exist');
      cy.get('[data-cy="proposal-card"]').should(
        'have.length',
        seededProposalCount + 1
      );
      cy.get('.snackbar-success').should('not.exist');
    });
  });

  describe('Proposal cards without any proposals', () => {
    beforeEach(() => {
      cy.resetDB();
      cy.getAndStoreFeaturesEnabled();
      cy.viewport('iphone-x');
    });

    it('Should show the empty state with a link to a new proposal', () => {
      visitProposalsSection();

      cy.get('[data-cy="proposal-table"] [data-cy="card-empty-state"]').should(
        'be.visible'
      );
      cy.get('[data-cy="proposal-card"]').should('not.exist');

      cy.get('[data-cy="proposal-table"]')
        .find('[data-cy="empty-new-proposal-link"]')
        .click();

      cy.url().should('contain', '/ProposalSelectType');
      cy.get('[data-cy="call-list"]').should('exist');
    });
  });

  describe('Proposal table at desktop width', () => {
    beforeEach(() => {
      cy.resetDB(true);
      cy.getAndStoreFeaturesEnabled();
      cy.viewport(1920, 1080);

      createDraftProposal();
    });

    it('Should keep the table rows and their row actions', () => {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[data-cy="proposal-card"]').should('not.exist');
      cy.get('[data-cy="dashboard-section-nav"]').should('not.exist');

      cy.get('[data-cy="proposal-table"]')
        .contains(readOnlyProposal.title)
        .closest('tr')
        .find('[aria-label="View proposal"]')
        .should('exist');

      cy.get('[data-cy="proposal-table"]')
        .contains(draftProposal.title)
        .closest('tr')
        .as('draftRow');

      cy.get('@draftRow').find('[aria-label="Clone proposal"]').should('exist');
      cy.get('@draftRow')
        .find('[aria-label="Delete proposal"]')
        .should('exist');
      cy.get('@draftRow').find('[aria-label="Edit proposal"]').click();

      cy.url().should('contain', `/ProposalEdit/${draftProposalPk}`);

      cy.finishedLoading();

      cy.get('[data-cy="questionary-title"]').should(
        'contain.text',
        draftProposal.title
      );
    });
  });
});
