import faker from 'faker';

const coProposerName = 'Benjamin';
const coProposerEmail = 'ben@inbox.com';
const visitorEmail = 'david@teleworm.us';

const proposalTitle = 'Test proposal';
const proposalEsiButtonTitle = 'Finish safety input form';

context('visits tests', () => {
  before(() => {
    cy.viewport(1920, 1080);
    // reset data and add seeds with test proposal
    cy.resetDB(true);
    cy.resetSchedulerDB(true);

    // Add co-proposer
    cy.login('officer');

    cy.contains('999999').parent().find('[title="View proposal"]').click();
    cy.get('[data-cy=toggle-edit-proposal]').click();

    cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();
    cy.get('[data-cy=add-participant-button]').click();
    cy.contains(coProposerName).parent().find('[type=checkbox]').click();
    cy.get('[data-cy=assign-selected-users]').click();
    cy.get('[data-cy=co-proposers]').contains(coProposerName); // make sure co proposer was added
    cy.get('[data-cy=save-and-continue-button]').click();
    // allocate time for the test proposal
    cy.get('[role="dialog"]').contains('Admin').click();
    cy.get('#finalStatus-input').click();
    cy.get('[role="listbox"]').contains('Accepted').click();
    cy.get('[data-cy="is-management-decision-submitted"]').click();
    cy.get('[data-cy="save-admin-decision"]').click();
    cy.closeModal();
    cy.logout();

    cy.login('user');
    cy.defineExperimentTeam({
      proposalTitle,
      usersEmails: [coProposerEmail, visitorEmail],
      teamLead: coProposerName,
    });
    cy.logout();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/');
  });

  it('PI should see ESI assessment button ', () => {
    cy.login({ email: 'Javon4@hotmail.com', password: 'Test1234!' });

    cy.testActionButton(proposalEsiButtonTitle, 'active');
  });

  it('Co-proposer should see ESI button ', () => {
    cy.login({ email: 'ben@inbox.com', password: 'Test1234!' });

    cy.testActionButton(proposalEsiButtonTitle, 'active');
  });

  it('Visitor should not see ESI button', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });

    cy.testActionButton(proposalEsiButtonTitle, 'invisible');
  });

  it('Should be able to complete ESI', () => {
    cy.login('user');
    cy.get('[data-cy=upcoming-experiments]')
      .contains(proposalTitle)
      .closest('TR')
      .find(`[title='${proposalEsiButtonTitle}']`)
      .click();
    cy.get('[data-cy=add-sample-btn]').click();
    cy.get(
      '[data-cy=sample-esi-modal] [data-cy=save-and-continue-button]'
    ).click();
    cy.get('[data-cy=submit-esi-button]').should('be.disabled');
    cy.get('[data-cy=confirm-sample-correct-cb]').click();
    cy.get('[data-cy=submit-esi-button]').should('not.be.disabled');
    cy.get('[data-cy=sample-esi-modal] [data-cy=submit-esi-button]').click();

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.get('[data-cy=submit-proposal-esi-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();
  });

  it('Co-proposer should see that risk assessment is completed', () => {
    cy.login({ email: 'ben@inbox.com', password: 'Test1234!' });

    cy.testActionButton(proposalEsiButtonTitle, 'completed');
  });
});
