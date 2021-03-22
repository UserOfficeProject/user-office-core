import faker from 'faker';

context('Proposal tests', () => {
  const proposalToCloneTitle = faker.lorem.words(2);
  const proposalToCloneAbstract = faker.lorem.words(3);
  const clonedProposalTitle = `Copy of ${proposalToCloneTitle}`;

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  it('Should be able create proposal', () => {
    cy.login('user');

    cy.contains('New Proposal').click();

    cy.get('[data-cy=edit-proposer-button]').click();
    cy.contains('Benjamin').parent().find("[title='Select user']").click();

    cy.contains('Save and continue').click();

    cy.contains('Title is required');
    cy.contains('Abstract is required');
    cy.contains(
      'You must be part of the proposal. Either add yourself as Principal Investigator or a Co-Proposer!'
    );

    const title = faker.lorem.words(2);
    const abstract = faker.lorem.words(3);
    const proposer = 'Carl';

    cy.createProposal(title, abstract, '', proposer);

    cy.contains('Dashboard').click();

    cy.contains(title).parent().contains('draft');

    cy.get('[title="Edit proposal"]').should('exist').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');
  });

  it('Should be able clone proposal to another call', () => {
    const shortCode = faker.random.word().split(' ')[0]; // faker random word is buggy, it ofter returns phrases
    const surveyComment = faker.random.word().split(' ')[0];
    const cycleComment = faker.random.word().split(' ')[0];
    const startDate = faker.date.past().toISOString().slice(0, 10);
    const endDate = faker.date.future().toISOString().slice(0, 10);
    const template = 'default template';

    cy.login('officer');

    cy.contains('Proposals');

    cy.createCall({
      shortCode,
      startDate,
      endDate,
      template,
      surveyComment,
      cycleComment,
    });

    cy.logout();

    cy.login('user');

    cy.createProposal(proposalToCloneTitle, proposalToCloneAbstract, 'call 1');

    cy.contains('Dashboard').click();

    cy.contains(proposalToCloneTitle);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');

    cy.get('[title="Clone proposal"]').first().click();

    cy.get('#mui-component-select-selectedCallId').click();

    cy.contains(shortCode).click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal cloned successfully',
    });

    cy.contains(clonedProposalTitle).parent().should('contain.text', shortCode);
  });

  it('User officer should be able to change status to one or multiple proposals', () => {
    cy.login('officer');

    cy.get('th input[type="checkbox"]').click();

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.get('[role="dialog"] #mui-component-select-selectedStatusId').should(
      'not.have.class',
      'Mui-disabled'
    );

    cy.get('[role="dialog"] #mui-component-select-selectedStatusId').click();

    cy.get('[role="presentation"] [role="listbox"]').contains('DRAFT').click();

    cy.get('[role="alert"] .MuiAlert-message').contains(
      'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
    );

    cy.get('[role="dialog"] #mui-component-select-selectedStatusId').click();

    cy.get('[role="presentation"] [role="listbox"]')
      .contains('SEP Meeting')
      .click();

    cy.get('[data-cy="submit-proposal-status-change"]').click();

    cy.notification({
      variant: 'success',
      text: 'status changed successfully',
    });

    cy.contains(proposalToCloneTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
    cy.contains(clonedProposalTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
  });

  it('Should be able to delete proposal', () => {
    cy.login('user');

    cy.contains(`Copy of ${proposalToCloneTitle}`)
      .parent()
      .find('[title="Delete proposal"]')
      .click();

    cy.contains('OK').click();

    cy.contains(`Copy of ${proposalToCloneTitle}`).should('not.exist');
  });
});
