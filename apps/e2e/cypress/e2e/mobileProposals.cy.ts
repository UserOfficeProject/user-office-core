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
  /*
   * Both seeded proposals belong to user1, are submitted, and sit in a status
   * that is not one of the editable submitted ones, i.e, the read-only case.
   * The second one is used because the first one's title is a prefix of it,
   * so only "Test proposal 2" addresses a single card.
   */
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

    // The dashboard only renders a section bar when there is more than one
    // section, so without the scheduler the proposals content is already on
    // screen and there is nothing to click. mobileInvites guards the same way.
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

      // Both seeded proposals have a submitted management decision, so this
      // one opens on its decision tabs rather than in the questionary wizard.
      // There is no wizard here, and so no mobile app bar or progress bar; the
      // proposal is read through the second tab, as invites.cy.ts does.
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

      // The sheet is a MUI Drawer, so its backdrop dismisses it.
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
