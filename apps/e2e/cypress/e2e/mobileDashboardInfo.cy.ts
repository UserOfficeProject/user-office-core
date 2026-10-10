import { FeatureId, PageName } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const notice = {
  heading: 'Beamtime shutdown',
  body: 'The instrument halls are closed for maintenance during August.',
  linkLabel: 'Start a new proposal',
  linkTarget: '/ProposalSelectType',
};

const noticeContent = `<h2>${notice.heading}</h2><p>${notice.body}</p><p><a href="${notice.linkTarget}">${notice.linkLabel}</a></p>`;

const seededPageContent = 'HOMEPAGE';

context('Mobile dashboard info section tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.setPageContent({ id: PageName.HOMEPAGE, text: noticeContent });

    cy.login('user1', initialDBData.roles.user);
  });

  describe('Info tab in the bottom navigation', () => {
    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }

      cy.viewport('iphone-x');
      cy.visit('/');
      cy.finishedLoading();
    });

    it('Should show only the info panel when the Info tab is selected', () => {
      cy.get('[data-cy="dashboard-section-nav"]').should('be.visible');
      cy.get('[data-cy="dashboard-section-info"]')
        .should('be.visible')
        .and('contain.text', 'Info');

      cy.get('[data-cy="dashboard-section-info"]').click();

      cy.get('[data-cy="dashboard-info-content"]').should('be.visible');
      cy.get('[data-cy="upcoming-experiments"]').should('not.be.visible');
      cy.get('[data-cy="proposal-table"]').should('not.be.visible');

      cy.get('[data-cy="dashboard-section-proposals"]').click();

      cy.get('[data-cy="proposal-table"]').should('be.visible');
      cy.get('[data-cy="dashboard-info-content"]').should('not.be.visible');
    });

    it('Should show the notice the user officer set', () => {
      cy.get('[data-cy="dashboard-section-info"]').click();

      cy.get('[data-cy="dashboard-info-content"]')
        .should('be.visible')
        .and('contain.text', notice.heading)
        .and('contain.text', notice.body)
        .and('not.contain.text', seededPageContent);
    });

    it('Should follow a link inside the notice the user officer set', () => {
      cy.get('[data-cy="dashboard-section-info"]').click();

      cy.get('[data-cy="dashboard-info-content"]')
        .contains('a', notice.linkLabel)
        .click();

      cy.url().should('include', notice.linkTarget);
      cy.get('[data-cy="call-list"]').should('exist');
    });

    it('Should keep the info panel selected after a reload', () => {
      cy.get('[data-cy="dashboard-section-info"]').click();

      cy.window().should((win) =>
        expect(win.localStorage.getItem('dashboardSection')).to.equal('info')
      );

      cy.reload();
      cy.finishedLoading();

      cy.get('[data-cy="dashboard-info-content"]')
        .should('be.visible')
        .and('contain.text', notice.heading);
      cy.get('[data-cy="upcoming-experiments"]').should('not.be.visible');
    });
  });
});
