import faker from 'faker';

context('Settings tests', () => {
  describe('Proposal statuses tests', () => {
    before(() => {
      cy.resetDB();
    });

    beforeEach(() => {
      cy.visit('/');
      cy.viewport(1100, 1000);
    });

    it('User should not be able to see Settings page', () => {
      cy.login('user');

      cy.get('[data-cy="profile-page-btn"]').should('exist');

      let userMenuItems = cy.get('[data-cy="user-menu-items"]');

      userMenuItems.should('not.contain', 'Settings');
    });

    it('User Officer should be able to create Proposal status', () => {
      const name = faker.lorem.words(2);
      const description = faker.lorem.words(5);
      const shortCode = name.toUpperCase().replace(/\s/g, '_');

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();
      cy.contains('Create').click();
      cy.get('#shortCode').type(shortCode);
      cy.get('#name').type(name);
      cy.get('#description').type(description);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');
      const proposalStatusesTableLastRow = proposalStatusesTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalStatusesTableLastRow.invoke('text');

      lastRowText.should('contain', shortCode);
      lastRowText.should('contain', name);
      lastRowText.should('contain', description);
    });

    it('User Officer should be able to update Proposal status', () => {
      const newName = faker.lorem.words(2);
      const newDescription = faker.lorem.words(5);

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      cy.get('[title="Edit"]').last().click();

      cy.get('#shortCode').should('be.disabled');

      cy.get('#name').clear();
      cy.get('#name').type(newName);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');
      const proposalStatusesTableLastRow = proposalStatusesTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalStatusesTableLastRow.invoke('text');

      lastRowText.should('contain', newName);
      lastRowText.should('contain', newDescription);
    });

    it('User Officer should be able to delete Proposal status', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      cy.finishedLoading();

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      cy.get('[title="Delete"]').last().click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({ variant: 'success', text: 'deleted successfully' });
    });
  });

  describe('Proposal workflows tests', () => {
    const workflowName = faker.lorem.words(2);
    const workflowDescription = faker.lorem.words(5);
    const updatedWorkflowName = faker.lorem.words(2);
    const updatedWorkflowDescription = faker.lorem.words(5);
    const fastTrackWorkflowName = 'Fast track';
    const fastTrackWorkflowDescription = 'Faster than the fastest workflow';
    const multiColumnWorkflowName = faker.lorem.words(2);
    const multiColumnWorkflowDescription = faker.lorem.words(5);

    before(() => {
      cy.resetDB();
    });

    beforeEach(() => {
      cy.visit('/');
      cy.viewport(1100, 1000);
    });

    it('User Officer should be able to create proposal workflow and it should contain default DRAFT status', () => {
      cy.login('officer');

      cy.contains('Settings').click();

      cy.createProposalWorkflow(workflowName, workflowDescription);

      cy.get('[data-cy^="connection_DRAFT"]').should('contain.text', 'DRAFT');
      cy.get('[data-cy^="status_DRAFT"]').should('not.exist');

      cy.get('[data-cy="remove-workflow-status-button"]').should('not.exist');
    });

    it('User Officer should be able to update proposal workflow', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]').last().click();

      cy.contains('Edit').click();

      cy.get('#name').clear().type(updatedWorkflowName);
      cy.get('#description').clear().type(updatedWorkflowDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      cy.get('[data-cy="proposal-workflow-metadata-container"]')
        .should('contain.text', updatedWorkflowName)
        .should('contain.text', updatedWorkflowDescription);
    });

    it('User Officer should be able to add more statuses in proposal workflow', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(updatedWorkflowName).parent().find('[title="Edit"]').click();

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 1 },
      ]);

      cy.get('[data-cy^="connection_FEASIBILITY_REVIEW"]').should(
        'contain.text',
        'FEASIBILITY_REVIEW'
      );

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').should('not.exist');
    });

    it('User Officer should be able to select events that are triggering change to workflow status', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(updatedWorkflowName).parent().find('[title="Edit"]').click();

      cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', [
        'PROPOSAL_SUBMITTED',
      ]);

      cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', [
        'PROPOSAL_FEASIBLE',
      ]);

      cy.contains('PROPOSAL_SUBMITTED & PROPOSAL_FEASIBLE');
    });

    it('Proposal should follow the selected workflow', () => {
      const internalComment = faker.random.words(2);
      const publicComment = faker.random.words(2);
      cy.login('officer');

      cy.contains('Settings').click();

      cy.createProposalWorkflow(
        fastTrackWorkflowName,
        fastTrackWorkflowDescription
      );

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 1 },
      ]);

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').should('not.exist');

      cy.get('[data-cy^="status_SEP_SELECTION"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 2 },
      ]);

      cy.get('[data-cy^="connection_SEP_SELECTION"]').should(
        'contain.text',
        'SEP_SELECTION'
      );

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_SEP_SELECTION"]').should('not.exist');

      cy.get('[data-cy^="status_SEP_REVIEW"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 3 },
      ]);

      cy.get('[data-cy^="connection_SEP_REVIEW"]').should(
        'contain.text',
        'SEP_REVIEW'
      );

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_SEP_REVIEW"]').should('not.exist');

      cy.get('[data-cy^="status_SEP_MEETING"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 4 },
      ]);

      cy.get('[data-cy^="connection_SEP_MEETING"]').should(
        'contain.text',
        'SEP Meeting'
      );

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_SEP_MEETING"]').should('not.exist');

      cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', [
        'PROPOSAL_SUBMITTED',
      ]);

      cy.addProposalStatusChangingEventToStatus('SEP_SELECTION', [
        'PROPOSAL_FEASIBLE',
      ]);

      cy.addProposalStatusChangingEventToStatus('SEP_REVIEW', [
        'PROPOSAL_SEP_SELECTED',
      ]);

      cy.addProposalStatusChangingEventToStatus('SEP_MEETING', [
        'PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED',
      ]);

      cy.contains('Calls').click();

      cy.get('[title="Edit"]').first().click();

      cy.get('#mui-component-select-proposalWorkflowId').click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[role="presentation"] [role="listbox"] li')
        .contains(fastTrackWorkflowName)
        .click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Call updated successfully!',
      });

      cy.logout();

      cy.login('user');

      cy.createProposal();

      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('draft'));

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .find('[title="Edit proposal"]')
        .click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('submitted'));

      cy.logout();
      cy.login('officer');

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .first()
        .then((element) =>
          expect(element.text()).to.contain('FEASIBILITY_REVIEW')
        );

      cy.get('[data-cy="view-proposal"]').first().click();
      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"] input').clear().type('20');

      cy.get('[data-cy="technical-review-status"]').click();
      cy.contains('Feasible').click();

      cy.setTinyMceContent('comment', internalComment);
      cy.setTinyMceContent('publicComment', publicComment);

      cy.getTinyMceContent('comment').then((content) =>
        expect(content).to.have.string(internalComment)
      );

      cy.getTinyMceContent('publicComment').then((content) =>
        expect(content).to.have.string(publicComment)
      );

      cy.get('[data-cy="is-review-submitted"]').click();

      cy.get('[data-cy="save-technical-review"]').click();

      cy.notification({
        variant: 'success',
        text: 'Technical review updated successfully',
      });

      cy.closeModal();

      cy.contains('Proposals').click();

      cy.contains('SEP_SELECTION');
    });

    it('Proposal status should update immediately after assigning it to a SEP', () => {
      cy.login('officer');

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get("[title='Assign proposals to SEP']").first().click();

      cy.get("[id='mui-component-select-selectedSEPId']").should(
        'not.have.class',
        'Mui-disabled'
      );

      cy.get("[id='mui-component-select-selectedSEPId']").first().click();

      cy.get("[id='menu-selectedSEPId'] li").first().click();

      cy.contains('Assign to SEP').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s assigned to SEP',
      });

      cy.should('not.contain', 'SEP_SELECTION');
      cy.contains('SEP_REVIEW');
    });

    it('Proposal status should update immediately after all SEP reviews submitted', () => {
      cy.login('officer');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get("[title='Edit']").first().click();

      cy.contains('Members').click();

      cy.get('[title="Set SEP Chair"]').click();

      cy.finishedLoading();

      cy.get('[title="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP chair assigned successfully!',
      });

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get("[title='Assign SEP Member']").first().click();

      cy.finishedLoading();

      cy.get('[role="dialog"]')
        .contains('Nilsson')
        .parent()
        .find('input[type="checkbox"]')
        .click();
      cy.contains('1 user(s) selected');
      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Members assigned',
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.get("[title='Show Reviewers']").first().click();
      cy.contains('Nilsson').parent().find('[title="Review proposal"]').click();

      cy.get('[role="dialog"]').contains('Grade').click({ force: true });

      cy.setTinyMceContent('comment', faker.lorem.words(3));

      cy.get('[data-cy="grade-proposal"]').click();

      cy.get('[role="listbox"] > [role="option"]').first().click();

      cy.contains('Submit').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({ variant: 'success', text: 'Submitted' });

      cy.get('[aria-label="close"]').click();

      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(100);
      cy.contains('SEP Meeting');
    });

    it('User Officer should be able to filter proposals based on statuses', () => {
      cy.login('user');

      cy.createProposal();

      cy.logout();

      cy.login('officer');

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody')
        .first()
        .then((element) => expect(element.text()).to.contain('DRAFT'));

      cy.get('.MuiTable-root tbody')
        .first()
        .then((element) => expect(element.text()).to.contain('SEP Meeting'));

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="12"]').click();

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('SEP Meeting'));

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="1"]').click();

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('DRAFT'));
    });

    it('User Officer should be able to create multi-column proposal workflow', () => {
      cy.login('officer');

      cy.contains('Settings').click();

      cy.createProposalWorkflow(
        multiColumnWorkflowName,
        multiColumnWorkflowDescription
      );

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 1 },
      ]);

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.contains('Add multi-column row').click();

      cy.get('#mui-component-select-selectedParentDroppableId').click();
      cy.get(
        '[role="presentation"] [data-value="proposalWorkflowConnections_0"]'
      ).click();

      cy.get('#mui-component-select-numberOfColumns').click();
      cy.get('[role="presentation"] [data-value="2"]').click();

      cy.contains('Add row').click();

      cy.get('[data-cy="droppable-group"]').should('have.length', 3);

      cy.get('[data-cy^="status_SEP_SELECTION"]').dragElement([
        { direction: 'left', length: 2 },
      ]);

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.get('[data-cy^="status_NOT_FEASIBLE"]').dragElement([
        { direction: 'left', length: 1 },
      ]);

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.reload();

      cy.get('[data-cy="droppable-group"]').should('have.length', 3);

      cy.get(
        '[data-cy="proposal-workflow-connections"] .MuiGrid-container .MuiGrid-grid-xs-6'
      ).should('have.length', 2);
    });

    it('Proposal should follow multi-column workflow', () => {
      const firstProposalTitle = faker.random.words(2);
      const firstProposalAbstract = faker.random.words(5);
      const secondProposalTitle = faker.random.words(2);
      const secondProposalAbstract = faker.random.words(5);
      const internalComment = faker.random.words(2);
      const publicComment = faker.random.words(2);
      cy.login('officer');

      cy.contains('Settings').click();

      cy.contains('Proposal workflows').click();

      cy.contains(multiColumnWorkflowName)
        .parent()
        .find('[title="Edit"]')
        .click();

      cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', [
        'PROPOSAL_SUBMITTED',
      ]);

      cy.addProposalStatusChangingEventToStatus('SEP_SELECTION', [
        'PROPOSAL_FEASIBLE',
      ]);

      cy.addProposalStatusChangingEventToStatus('NOT_FEASIBLE', [
        'PROPOSAL_UNFEASIBLE',
      ]);

      cy.contains('Calls').click();

      cy.get('[title="Edit"]').first().click();

      cy.get('#mui-component-select-proposalWorkflowId').click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[role="presentation"] [role="listbox"] li')
        .contains(multiColumnWorkflowName)
        .click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="next-step"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Call updated successfully!',
      });

      cy.logout();

      cy.login('user');

      cy.createProposal(firstProposalTitle, firstProposalAbstract);

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();

      cy.createProposal(secondProposalTitle, secondProposalAbstract);

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .contains(firstProposalTitle)
        .parent()
        .contains('submitted');
      cy.get('.MuiTable-root tbody tr')
        .contains(secondProposalTitle)
        .parent()
        .contains('submitted');

      cy.logout();
      cy.login('officer');

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .contains(firstProposalTitle)
        .parent()
        .contains('FEASIBILITY_REVIEW');
      cy.get('.MuiTable-root tbody tr')
        .contains(secondProposalTitle)
        .parent()
        .contains('FEASIBILITY_REVIEW');

      cy.contains(firstProposalTitle)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"] input').clear().type('20');

      cy.get('[data-cy="technical-review-status"]').click();
      cy.get('[role="presentation"]').contains('Feasible').click();

      cy.setTinyMceContent('comment', internalComment);
      cy.setTinyMceContent('publicComment', publicComment);

      cy.get('[data-cy="is-review-submitted"]').click();

      cy.get('[data-cy="save-technical-review"]').click();

      cy.notification({
        variant: 'success',
        text: 'Technical review updated successfully',
      });

      cy.closeModal();

      cy.contains('Proposals').click();

      cy.contains(secondProposalTitle)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"] input').clear().type('0');

      cy.get('[data-cy="technical-review-status"]').click();
      cy.get('[role="presentation"]').contains('Unfeasible').click();

      cy.get('[data-cy="is-review-submitted"]').click();

      cy.get('[data-cy="save-technical-review"]').click();

      cy.notification({
        variant: 'success',
        text: 'Technical review updated successfully',
      });

      cy.closeModal();

      cy.contains(firstProposalTitle).parent().contains('SEP_SELECTION');
      cy.contains(secondProposalTitle).parent().contains('NOT_FEASIBLE');
    });

    it('User Officer should be able to remove statuses from proposal workflow using trash icon', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(fastTrackWorkflowName)
        .parent()
        .find('[title="Edit"]')
        .click();

      cy.get('[data-cy="remove-workflow-status-button"]').first().click();

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').should(
        'contain.text',
        'FEASIBILITY_REVIEW'
      );

      cy.notification({
        variant: 'success',
        text: 'Workflow status removed successfully',
      });

      cy.get('[data-cy^="connection_FEASIBILITY_REVIEW"]').should('not.exist');
    });
  });

  describe('API access tokens tests', () => {
    before(() => {
      cy.resetDB();
    });

    beforeEach(() => {
      cy.visit('/');
      cy.viewport(1100, 1000);
    });

    let removedAccessToken: string;

    it('User Officer should be able to create api access token', () => {
      const name = faker.lorem.words(2);

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.get('[data-cy="create-new-entry"]').click();

      cy.finishedLoading();

      cy.get('#accessToken').should('be.empty');

      cy.get('#name').type(name);

      cy.contains('ProposalQueries.getAll').click();
      cy.contains('ProposalQueries.getAllView').click();

      cy.get('[data-cy="submit"]').click();

      cy.finishedLoading();

      cy.notification({
        variant: 'success',
        text: 'Api access token created successfully!',
      });

      cy.get('#accessToken').should('contain.value', 'Bearer ');

      cy.get('[title="Copy"]').should('exist');

      cy.get('#accessToken')
        .invoke('val')
        .then((accessToken) => {
          cy.request({
            method: 'POST',
            url: '/graphql',
            body: {
              query: 'query { proposalsView(filter: {}) { id title shortCode}}',
            },
            auth: {
              bearer: (accessToken as string).split(' ')[1],
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.contain(
              'application/json'
            );
            expect(response.status).to.be.equal(200);
            expect(response.body.data.proposalsView).to.be.an('array');
          });
        });
    });

    it('User Officer should be able to update api access token', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.get('[title="Edit"]').click();

      cy.finishedLoading();

      cy.contains('ProposalQueries.getAllView').click();

      cy.get('[data-cy="submit"]').click();

      cy.finishedLoading();

      cy.notification({
        variant: 'success',
        text: 'Api access token updated successfully!',
      });

      cy.get('[title="Copy"]').should('exist');

      cy.get('#accessToken')
        .invoke('val')
        .then((accessToken) => {
          removedAccessToken = accessToken as string;
          cy.request({
            method: 'POST',
            url: '/graphql',
            body: {
              query: 'query { proposalsView(filter: {}) { id title shortCode}}',
            },
            auth: {
              bearer: removedAccessToken.split(' ')[1],
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.contain(
              'application/json'
            );
            expect(response.status).to.be.equal(200);
            expect(response.body.data.proposalsView).to.be.equal(null);
          });
        });
    });

    it('User Officer should be able to delete api access token', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.get('[title="Delete"]').click();
      cy.get('[title="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Api access token deleted successfully',
      });

      cy.request({
        method: 'POST',
        url: '/graphql',
        body: {
          query:
            'query { proposals(filter: {}) { totalCount proposals { id title shortCode }}}',
        },
        auth: {
          bearer: removedAccessToken.split(' ')[1],
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.body.errors[0].extensions.code).to.equal(
          'INTERNAL_SERVER_ERROR'
        );
      });
    });
  });
});
