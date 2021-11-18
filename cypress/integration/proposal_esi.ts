import faker from 'faker';

const coProposer = {
  id: 4,
  name: 'Benjamin',
  email: 'ben@inbox.com',
  password: 'Test1234!',
};
const visitor = { id: 6, email: 'david@teleworm.us', password: 'Test1234!' };
const PI = { id: 1, email: 'Javon4@hotmail.com', password: 'Test1234!' };
const existingProposalId = 1;
const acceptedStatusId = 1;
const existingScheduledEventId = 996;

const proposalTitle = 'Test proposal';
const proposalEsiButtonTitle = 'Finish safety input form';

const sampleTitle = /My sample title/i;
const newSampleTitle = faker.lorem.words(2);
const clonedSampleTitle = faker.lorem.words(2);

context('visits tests', () => {
  beforeEach(() => {
    cy.resetDB(true);
    cy.resetSchedulerDB(true);
    cy.updateProposal({
      proposalPk: existingProposalId,
      proposerId: PI.id,
      users: [coProposer.id],
    });
    cy.updateProposalManagementDecision({
      proposalPk: existingProposalId,
      statusId: acceptedStatusId,
      managementTimeAllocation: 5,
      managementDecisionSubmitted: true,
    });
    cy.createVisit({
      team: [coProposer.id, visitor.id],
      teamLeadUserId: coProposer.id,
      scheduledEventId: existingScheduledEventId,
    });
    cy.viewport(1920, 1080);
  });

  it('PI should see ESI assessment button ', () => {
    cy.login(PI);
    cy.visit('/');

    cy.testActionButton(proposalEsiButtonTitle, 'active');
  });

  it('Co-proposer should see ESI button ', () => {
    cy.login(coProposer);
    cy.visit('/');

    cy.testActionButton(proposalEsiButtonTitle, 'active');
  });

  it('Visitor should not see ESI button', () => {
    cy.login(visitor);
    cy.visit('/');

    cy.testActionButton(proposalEsiButtonTitle, 'invisible');
  });

  it('Should be able to complete ESI', () => {
    cy.login('user');
    cy.visit('/');

    cy.get('[data-cy=upcoming-experiments]')
      .contains(proposalTitle)
      .closest('TR')
      .find(`[title='${proposalEsiButtonTitle}']`)
      .click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(sampleTitle)
      .closest('li')
      .find('[data-cy=select-sample-chk]')
      .click();
    cy.get(
      '[data-cy=sample-esi-modal] [data-cy=save-and-continue-button]'
    ).click();
    cy.get('[data-cy=submit-esi-button]').should('be.disabled');
    cy.get('[data-cy=confirm-sample-correct-cb]').click();
    cy.get('[data-cy=submit-esi-button]').should('not.be.disabled');
    cy.get('[data-cy=sample-esi-modal] [data-cy=submit-esi-button]').click();

    // Add new sample
    cy.get('[data-cy=add-sample-btn]').click();

    cy.get('[data-cy=prompt-input]').type(newSampleTitle);
    cy.get('[data-cy=prompt-ok]').click();

    // Abort new sample esi declaration
    cy.get('[data-cy=sample-esi-modal]'); // wait until modal is visible
    cy.get('body').type('{esc}');
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .contains('Unfinished declaration'); // ESI not finished
    cy.get('[data-cy=save-and-continue-button]').click();
    cy.contains('All experiment safety inputs must be completed');

    // Resume new sample esi declaration
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=edit-esi-btn]')
      .click();

    cy.get(
      '[data-cy=sample-esi-modal] [data-cy=save-and-continue-button]'
    ).click();
    cy.get('[data-cy=confirm-sample-correct-cb]').click();
    cy.get('[data-cy=sample-esi-modal] [data-cy=submit-esi-button]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .contains('Ready'); // ESI finished

    // Clone sample esi declaration and then delete it
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=clone-sample-btn]')
      .click();

    cy.get('[data-cy=prompt-input]').clear().type(clonedSampleTitle);
    cy.get('[data-cy=prompt-ok]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .closest('li')
      .contains('Unfinished declaration');
    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .closest('li')
      .find('[data-cy=delete-sample-btn]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(clonedSampleTitle)
      .should('not.exist');

    // Revoke ESI
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=select-sample-chk]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .should('not.contain', 'Ready'); // ESI not finished

    // Delete new sample
    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .closest('li')
      .find('[data-cy=delete-sample-btn]')
      .click();
    cy.get('[data-cy=confirm-ok]').click();

    cy.get('[data-cy=sample-esi-list]')
      .contains(newSampleTitle)
      .should('not.exist');
    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains(sampleTitle).should('exist'); // sample should ve visible in the review page

    cy.get('[data-cy=submit-proposal-esi-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();
  });

  it('Co-proposer should see that risk assessment is completed', () => {
    cy.createEsi({ scheduledEventId: existingScheduledEventId }).then(
      (result) => {
        if (result.createEsi.esi) {
          cy.updateEsi({ esiId: result.createEsi.esi.id, isSubmitted: true });
        }
      }
    );
    cy.login(coProposer);
    cy.visit('/');

    cy.testActionButton(proposalEsiButtonTitle, 'completed');
  });
});
