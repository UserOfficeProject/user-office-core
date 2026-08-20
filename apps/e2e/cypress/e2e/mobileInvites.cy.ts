import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const invites = initialDBData.coProposerInvites;

const PLURAL_INVITE_TEXT = '2 outstanding invitations to join proposals.';
const SINGULAR_INVITE_TEXT = '1 outstanding invitation to join proposal.';

/*
 * Mobile counterpart of the "Accepting co-proposer invites without code"
 * tests in invites.cy.ts.
 *
 * Below the compact breakpoint the dashboard shows one
 * section at a time, so both the invite notification and the proposals list
 * are only reachable through the Proposals tab.
 */
context('Mobile co-proposer invites tests', () => {
  const openProposalsSection = () => {
    // Without the scheduler the user has a single stacked section, so there is
    // no tab bar to go through. The invites themselves do not depend on it.
    if (featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
      cy.get('[data-cy="dashboard-section-nav"]').should('be.visible');
      cy.get('[data-cy="dashboard-section-proposals"]').click();
    }
  };

  const openInvitationsDialog = () => {
    cy.get('[data-testid="view-invitations-btn"]').click();
    cy.get('[data-testid="proposal-invite-dialog"]').should('be.visible');
  };

  const closeInvitationsDialog = () => {
    cy.get('[data-testid="proposal-invite-dialog"]')
      .contains('button', 'Close')
      .click();
    cy.get('[data-testid="proposal-invite-dialog"]').should('not.exist');
  };

  const closeInvitationsDialogFromAppBar = () => {
    cy.get('[data-testid="proposal-invite-dialog"]')
      .find('[data-cy="mobile-app-bar-back"]')
      .click();
    cy.get('[data-testid="proposal-invite-dialog"]').should('not.exist');
  };

  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.viewport('iphone-x');
  });

  it('Should see outstanding invites only inside the proposals section', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();

    cy.get('[data-testid="proposal-invite-notification"]')
      .should('be.visible')
      .and('contain.text', PLURAL_INVITE_TEXT);
    cy.get('[data-testid="view-invitations-btn"]').should('be.visible');

    cy.get('[data-cy="proposal-table"]')
      .should('be.visible')
      .and('not.contain.text', initialDBData.proposal.title);

    cy.get('[data-cy="dashboard-section-experiments"]').click();
    cy.get('[data-testid="proposal-invite-notification"]').should(
      'not.be.visible'
    );
  });

  it('Should open the invitations dialog full screen and list every invite', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();
    openInvitationsDialog();

    cy.get('[data-testid="proposal-invite-dialog"] .MuiDialog-paper').then(
      ($paper) => {
        const rect = $paper[0].getBoundingClientRect();

        expect(rect.width).to.be.closeTo(375, 2);
        expect(rect.height).to.be.closeTo(812, 2);
      }
    );

    cy.get('[data-testid="proposal-invite-dialog"]')
      .find('[data-cy="mobile-app-bar"]')
      .should('be.visible')
      .and('contain.text', 'Proposal Invitations');
    cy.get('[data-testid="proposal-invite-dialog"]')
      .find('[data-cy="mobile-app-bar-back"]')
      .should('be.visible');
    cy.get('[data-cy="close-modal-btn"]').should('not.exist');

    cy.get('[data-testid="proposal-invite-dialog"]')
      .should('contain.text', initialDBData.proposal.title)
      .and('contain.text', initialDBData.proposal2.title)
      .and(
        'contain.text',
        `Principal Investigator: ${initialDBData.users.user1.firstName}`
      );

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal1.id}"]`
    ).should('be.visible');
    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal2.id}"]`
    ).should('be.visible');
  });

  it('Should be able to accept an invite and see the proposal as a card', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();
    openInvitationsDialog();

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal1.id}"]`
    ).click();

    cy.get('.notistack-MuiContent-success')
      .should('be.visible')
      .and('contain.text', initialDBData.proposal.title);

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal1.id}"]`
    ).should('not.exist');

    closeInvitationsDialog();

    // Reloading avoids race conditions and asserts what was actually persisted.
    cy.reload();
    cy.finishedLoading();
    openProposalsSection();

    cy.get('[data-cy="proposal-table"] [data-cy="proposal-card"]')
      .should('have.length', 1)
      .and('contain.text', initialDBData.proposal.title)
      .and('contain.text', initialDBData.proposal.shortCode);
  });

  it('Should leave the invites outstanding when the dialog is dismissed', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();
    openInvitationsDialog();
    closeInvitationsDialogFromAppBar();

    cy.get('[data-testid="proposal-invite-notification"]')
      .should('be.visible')
      .and('contain.text', PLURAL_INVITE_TEXT);
    cy.get('[data-cy="proposal-table"]').should(
      'not.contain.text',
      initialDBData.proposal.title
    );

    openInvitationsDialog();

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal1.id}"]`
    ).should('be.visible');
    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal2.id}"]`
    ).should('be.visible');
  });

  it('Should keep the second invite outstanding after accepting the first', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();
    openInvitationsDialog();

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal2.id}"]`
    ).click();
    cy.get('.notistack-MuiContent-success').should('be.visible');

    cy.get(
      `[data-testid="accept-invite-btn-${invites.user3OnProposal1.id}"]`
    ).should('be.visible');

    closeInvitationsDialog();

    cy.get('[data-testid="proposal-invite-notification"]')
      .should('be.visible')
      .and('contain.text', SINGULAR_INVITE_TEXT)
      .and('not.contain.text', 'invitations');

    cy.reload();
    cy.finishedLoading();
    openProposalsSection();

    cy.get('[data-testid="proposal-invite-notification"]').should(
      'contain.text',
      SINGULAR_INVITE_TEXT
    );
    cy.get('[data-cy="proposal-table"] [data-cy="proposal-card"]')
      .should('have.length', 1)
      .and('contain.text', initialDBData.proposal2.shortCode);
  });

  it('Should be able to join a proposal with an invite code', function () {
    if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
      this.skip();
    }

    cy.login('user3', initialDBData.roles.user);
    cy.visit('/');
    cy.finishedLoading();

    openProposalsSection();

    cy.get('[data-cy=join-proposal-btn]').click();
    cy.get('[data-cy="mobile-app-bar"]')
      .should('be.visible')
      .and('contain.text', 'Join proposal');
    cy.get('[data-cy="mobile-app-bar-back"]').should('be.visible');
    cy.get('[data-cy="close-modal-btn"]').should('not.exist');

    cy.get('#code').type(invites.user3OnProposal1.code);
    cy.get('[data-cy="invitation-submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Code verification successful',
    });

    cy.get('[data-cy="mobile-app-bar"]').should('not.exist');

    cy.get('[data-cy="proposal-table"] [data-cy="proposal-card"]')
      .should('have.length', 1)
      .and('contain.text', initialDBData.proposal.title)
      .and('contain.text', initialDBData.proposal.shortCode);
  });
});
