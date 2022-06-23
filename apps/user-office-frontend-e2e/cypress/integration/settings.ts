import {
  AllocationTimeUnits,
  TechnicalReviewStatus,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';
import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('Settings tests', () => {
  beforeEach(() => {
    cy.resetDB();
  });

  describe('Proposal statuses tests', () => {
    const name = faker.lorem.words(2);
    const description = faker.lorem.words(5);
    const shortCode = name.toUpperCase().replace(/\s/g, '_');

    it('User should not be able to see Settings page', () => {
      cy.login('user');
      cy.visit('/');

      cy.get('[data-cy="profile-page-btn"]').should('exist');

      cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

      cy.get('@userMenuItems').should('not.contain', 'Settings');
    });

    it('User Officer should be able to create Proposal status', () => {
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();
      cy.contains('Create').click();
      cy.get('#shortCode').type(shortCode);
      cy.get('#name').type(name);
      cy.get('#description').type(description);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.get('[data-cy="proposal-statuses-table"]').as('proposalStatusesTable');

      cy.get('@proposalStatusesTable')
        .find('span[aria-label="Last Page"] > button')
        .as('lastPageButtonElement');

      cy.get('@lastPageButtonElement').click({ force: true });

      cy.get('[data-cy="proposal-statuses-table"]').as(
        'proposalStatusesTableNew'
      );
      cy.get('@proposalStatusesTableNew')
        .find('tr[level="0"]')
        .last()
        .as('proposalStatusesTableLastRow');

      cy.get('@proposalStatusesTableLastRow').invoke('text').as('lastRowText');

      cy.get('@lastRowText').should('contain', shortCode);
      cy.get('@lastRowText').should('contain', name);
      cy.get('@lastRowText').should('contain', description);
    });

    it('User Officer should be able to update Proposal status', () => {
      const newName = faker.lorem.words(2);
      const newDescription = faker.lorem.words(5);

      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      cy.contains('DRAFT').parent().find('[aria-label="Edit"]').click();

      cy.get('#shortCode').should('be.disabled');

      cy.get('#name').clear();
      cy.get('#name').type(newName);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      cy.get('[data-cy="proposal-statuses-table"]').as('proposalStatusesTable');
      cy.get('@proposalStatusesTable')
        .should('contain.text', newName)
        .should('contain.text', newDescription);
    });

    it('User Officer should be able to delete Proposal status', () => {
      cy.createProposalStatus({ name, description, shortCode });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      cy.finishedLoading();

      cy.get('[data-cy="proposal-statuses-table"]').as('proposalStatusesTable');

      cy.get('@proposalStatusesTable')
        .find('span[aria-label="Last Page"] > button')
        .as('lastPageButtonElement');

      cy.get('@lastPageButtonElement').click({ force: true });

      cy.contains(name).parent().find('[aria-label="Delete"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({ variant: 'success', text: 'deleted successfully' });

      cy.get('@proposalStatusesTable').should('not.contain.text', name);
    });
  });

  describe('Proposal workflows tests', () => {
    const workflowName = faker.lorem.words(2);
    const workflowDescription = faker.lorem.words(5);
    const proposalTitle = faker.lorem.words(2);
    const proposalAbstract = faker.lorem.words(5);
    const updatedWorkflowName = faker.lorem.words(2);
    const updatedWorkflowDescription = faker.lorem.words(5);
    let workflowDroppableGroupId: string;
    let createdWorkflowId: number;
    let prevProposalStatusId: number;
    let createdEsiTemplateId: number;

    const currentDayStart = DateTime.now().startOf('day');

    const updatedCall = {
      shortCode: faker.random.alphaNumeric(15),
      startCall: faker.date.past().toISOString().slice(0, 10),
      endCall: faker.date.future().toISOString().slice(0, 10),
      startReview: currentDayStart,
      endReview: currentDayStart,
      startSEPReview: currentDayStart,
      endSEPReview: currentDayStart,
      startNotify: currentDayStart,
      endNotify: currentDayStart,
      startCycle: currentDayStart,
      endCycle: currentDayStart,
      allocationTimeUnit: AllocationTimeUnits.DAY,
      cycleComment: faker.lorem.word(10),
      surveyComment: faker.lorem.word(10),
      templateId: initialDBData.template.id,
    };

    const addMultipleStatusesToProposalWorkflowWithChangingEvents = () => {
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 1,
        prevProposalStatusId: prevProposalStatusId,
      }).then((result) => {
        const connection =
          result.addProposalWorkflowStatus.proposalWorkflowConnection;
        if (connection) {
          cy.addStatusChangingEventsToConnection({
            proposalWorkflowConnectionId: connection.id,
            statusChangingEvents: ['PROPOSAL_SUBMITTED'],
          });
        }
      });
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.sepSelection.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 2,
        prevProposalStatusId:
          initialDBData.proposalStatuses.feasibilityReview.id,
      }).then((result) => {
        if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
          cy.addStatusChangingEventsToConnection({
            proposalWorkflowConnectionId:
              result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
            statusChangingEvents: ['PROPOSAL_FEASIBLE'],
          });
        }
      });
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.sepReview.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 3,
        prevProposalStatusId: initialDBData.proposalStatuses.sepSelection.id,
      }).then((result) => {
        if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
          cy.addStatusChangingEventsToConnection({
            proposalWorkflowConnectionId:
              result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
            statusChangingEvents: ['PROPOSAL_SEP_SELECTED'],
          });
        }
      });
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.sepMeeting.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 4,
        prevProposalStatusId: initialDBData.proposalStatuses.sepReview.id,
      }).then((result) => {
        if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
          cy.addStatusChangingEventsToConnection({
            proposalWorkflowConnectionId:
              result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
            statusChangingEvents: ['PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED'],
          });
        }
      });
    };

    const addMultipleStatusesToMultiColumnProposalWorkflowWithChangingEvents =
      () => {
        cy.addProposalWorkflowStatus({
          droppableGroupId: 'proposalWorkflowConnections_0',
          proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
          proposalWorkflowId: createdWorkflowId,
          sortOrder: 1,
          prevProposalStatusId: prevProposalStatusId,
        }).then((result) => {
          const connection =
            result.addProposalWorkflowStatus.proposalWorkflowConnection;
          if (connection) {
            cy.addStatusChangingEventsToConnection({
              proposalWorkflowConnectionId: connection.id,
              statusChangingEvents: ['PROPOSAL_SUBMITTED'],
            });
          }
        });
        cy.addProposalWorkflowStatus({
          droppableGroupId: 'proposalWorkflowConnections_1',
          proposalStatusId: initialDBData.proposalStatuses.sepSelection.id,
          proposalWorkflowId: createdWorkflowId,
          sortOrder: 0,
          prevProposalStatusId:
            initialDBData.proposalStatuses.feasibilityReview.id,
          parentDroppableGroupId: 'proposalWorkflowConnections_0',
        }).then((result) => {
          if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
            cy.addStatusChangingEventsToConnection({
              proposalWorkflowConnectionId:
                result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
              statusChangingEvents: ['PROPOSAL_FEASIBLE'],
            });
          }
        });
        cy.addProposalWorkflowStatus({
          droppableGroupId: 'proposalWorkflowConnections_2',
          proposalStatusId: initialDBData.proposalStatuses.notFeasible.id,
          proposalWorkflowId: createdWorkflowId,
          sortOrder: 0,
          prevProposalStatusId:
            initialDBData.proposalStatuses.feasibilityReview.id,
          parentDroppableGroupId: 'proposalWorkflowConnections_0',
        }).then((result) => {
          if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
            cy.addStatusChangingEventsToConnection({
              proposalWorkflowConnectionId:
                result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
              statusChangingEvents: ['PROPOSAL_UNFEASIBLE'],
            });
          }
        });
      };

    beforeEach(() => {
      // NOTE: Cypress scrolls automatically to the status position and dragging element is problematic when the droppable area is out of the view. For now this solution to extend the height of the view is the fastest
      cy.viewport(1920, 2000);
      cy.createProposalWorkflow({
        name: workflowName,
        description: workflowDescription,
      }).then((result) => {
        const workflow = result.createProposalWorkflow.proposalWorkflow;
        if (workflow) {
          createdWorkflowId = workflow.id;
          prevProposalStatusId =
            workflow.proposalWorkflowConnectionGroups[0].connections[0].id;
          workflowDroppableGroupId =
            workflow.proposalWorkflowConnectionGroups[0].groupId;

          cy.createTemplate({
            name: 'default esi template',
            groupId: TemplateGroupId.PROPOSAL_ESI,
          }).then((result) => {
            if (result.createTemplate.template) {
              createdEsiTemplateId = result.createTemplate.template.templateId;

              cy.updateCall({
                id: initialDBData.call.id,
                ...updatedCall,
                proposalWorkflowId: workflow.id,
                esiTemplateId: createdEsiTemplateId,
              });
            }
          });
        }
      });
    });

    it('User should be able to edit a submitted proposal in EDITABLE_SUBMITTED status', () => {
      const proposalTitle = faker.random.words(3);
      const editedProposalTitle = faker.random.words(3);
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.editableSubmitted.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 1,
        prevProposalStatusId: prevProposalStatusId,
      }).then((result) => {
        if (result.addProposalWorkflowStatus.proposalWorkflowConnection) {
          cy.addStatusChangingEventsToConnection({
            proposalWorkflowConnectionId:
              result.addProposalWorkflowStatus.proposalWorkflowConnection.id,
            statusChangingEvents: ['PROPOSAL_SUBMITTED'],
          });
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalTitle,
            abstract: proposalTitle,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });

      cy.login('user');
      cy.visit('/');

      cy.contains(proposalTitle)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.on('window:confirm', (str) => {
        expect(str).to.equal(
          'Submit proposal? The proposal can be edited after submission.'
        );

        return true;
      });

      cy.contains('OK').click();

      cy.contains('Submitted');

      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.get('[data-cy=proposal-table]')
        .contains(proposalTitle)
        .parent()
        .contains('submitted');

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('submitted'));

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.get('[name="proposal_basis.title"]').clear().type(editedProposalTitle);

      cy.contains('Save and continue').click();

      cy.contains('Submitted');

      cy.contains('Dashboard').click();

      cy.contains(editedProposalTitle);
    });

    it('User Officer should be able to create proposal workflow and it should contain default DRAFT status', () => {
      cy.login('officer');
      cy.visit('/ProposalWorkflows');

      cy.contains('Create').click();

      cy.get('#name').type(workflowName);
      cy.get('#description').type(workflowDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.finishedLoading();

      cy.get('[data-cy^="connection_DRAFT"]').should('contain.text', 'DRAFT');
      cy.get('[data-cy^="status_DRAFT"]').should('exist');

      cy.get('[data-cy="remove-workflow-status-button"]').should('not.exist');
    });

    it('User Officer should be able to update proposal workflow', () => {
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[aria-label="Edit"]').last().click();

      cy.get('[data-cy="Edit-button"]').click();
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
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(workflowName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

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

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').should('exist');
    });

    it('User Officer should be able to select events that are triggering change to workflow status', () => {
      cy.addProposalWorkflowStatus({
        droppableGroupId: workflowDroppableGroupId,
        proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
        proposalWorkflowId: createdWorkflowId,
        sortOrder: 1,
        prevProposalStatusId: prevProposalStatusId,
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(workflowName).parent().find('[aria-label="Edit"]').click();

      cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

      cy.get('[data-cy="status-changing-events-modal"]').should('exist');

      cy.contains('PROPOSAL_SUBMITTED').click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Status changing events added successfully!',
      });

      cy.get(`[data-cy^="connection_FEASIBILITY_REVIEW"]`).click();

      cy.get('[data-cy="status-changing-events-modal"]').should('exist');

      cy.contains('PROPOSAL_FEASIBLE').click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Status changing events added successfully!',
      });

      cy.contains('PROPOSAL_SUBMITTED & PROPOSAL_FEASIBLE');
    });

    it('Proposal should follow the selected workflow', () => {
      const internalComment = faker.random.words(2);
      const publicComment = faker.random.words(2);
      addMultipleStatusesToProposalWorkflowWithChangingEvents();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: proposalTitle,
            abstract: proposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });

      cy.login('user');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[data-cy="proposal-table"]')
        .contains(proposalTitle)
        .parent()
        .contains('draft');

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains('Dashboard').click();

      cy.finishedLoading();

      cy.get('[data-cy="proposal-table"] .MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('submitted'));

      cy.logout();
      cy.login('officer');
      cy.visit('/');

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
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Feasible')
        .click();

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
      addMultipleStatusesToProposalWorkflowWithChangingEvents();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: proposalTitle,
            abstract: proposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.submitProposal({ proposalPk: proposal.primaryKey });
          cy.addProposalTechnicalReview({
            proposalPk: proposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 1,
            submitted: true,
            reviewerId: 0,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('[type="checkbox"]').first().check();

      cy.get("[aria-label='Assign proposals to SEP']").first().click();

      cy.get('#selectedSEPId-input').should('not.have.class', 'Mui-disabled');

      cy.get('#selectedSEPId-input').first().click();

      cy.get('[data-cy="sep-selection-options"] li').first().click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s assigned to the selected SEP successfully',
      });

      cy.should('not.contain', 'SEP_SELECTION');
      cy.contains('SEP_REVIEW');
    });

    it('Proposal status should update immediately after all SEP reviews submitted', () => {
      addMultipleStatusesToProposalWorkflowWithChangingEvents();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: proposalTitle,
            abstract: proposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.submitProposal({ proposalPk: proposal.primaryKey });
          cy.addProposalTechnicalReview({
            proposalPk: proposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 1,
            submitted: true,
            reviewerId: 0,
          });

          cy.assignProposalsToSep({
            proposals: {
              callId: initialDBData.call.id,
              primaryKey: proposal.primaryKey,
            },
            sepId: initialDBData.sep.id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.get("[aria-label='Edit']").first().click();

      cy.contains('Members').click();

      cy.get('[aria-label="Set SEP Chair"]').click();

      cy.finishedLoading();

      cy.get('[aria-label="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'SEP chair assigned successfully!',
      });

      cy.contains('Proposals and Assignments').click();

      cy.finishedLoading();

      cy.get('[data-cy="assign-sep-member"]').first().click();

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
      cy.get('[aria-label="Detail panel visibility toggle"]').first().click();
      cy.contains('Nilsson')
        .parent()
        .find('[data-cy="grade-proposal-icon"]')
        .click();

      cy.setTinyMceContent('comment', faker.lorem.words(3));

      cy.get('[data-cy="grade-proposal"]').click();

      cy.get('[role="listbox"] > [role="option"]').first().click();

      cy.get('[data-cy="is-grade-submitted"]').click();
      cy.get('[type="submit"]').contains('Save').click();

      cy.notification({ variant: 'success', text: 'Updated' });

      cy.closeModal();

      cy.get('[role="dialog"]').should('not.exist');
      cy.contains('SEP Meeting');
    });

    it('User Officer should be able to filter proposals based on statuses', () => {
      addMultipleStatusesToProposalWorkflowWithChangingEvents();
      cy.createProposal({ callId: initialDBData.call.id });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: proposalTitle,
            abstract: proposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.submitProposal({ proposalPk: proposal.primaryKey });
          cy.addProposalTechnicalReview({
            proposalPk: proposal.primaryKey,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 1,
            submitted: true,
            reviewerId: 0,
          });

          cy.assignProposalsToSep({
            proposals: {
              callId: initialDBData.call.id,
              primaryKey: proposal.primaryKey,
            },
            sepId: initialDBData.sep.id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody')
        .first()
        .then((element) => expect(element.text()).to.contain('DRAFT'));

      cy.get('.MuiTable-root tbody')
        .first()
        .then((element) => expect(element.text()).to.contain('SEP_REVIEW'));

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="5"]').click();

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('SEP_REVIEW'));

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="1"]').click();

      cy.finishedLoading();

      cy.get('.MuiTable-root tbody tr')
        .first()
        .then((element) => expect(element.text()).to.contain('DRAFT'));
    });

    it('User Officer should be able to remove statuses from proposal workflow using trash icon', () => {
      addMultipleStatusesToProposalWorkflowWithChangingEvents();
      cy.login('officer');
      cy.visit('');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains(workflowName).parent().find('[aria-label="Edit"]').click();

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

    it('User Officer should be able to create multi-column proposal workflow', () => {
      cy.login('officer');
      cy.visit(`/ProposalWorkflowEditor/${createdWorkflowId}`);

      cy.get('[data-cy^="status_FEASIBILITY_REVIEW"]').dragElement([
        { direction: 'left', length: 1 },
        { direction: 'down', length: 1 },
      ]);

      cy.notification({
        variant: 'success',
        text: 'Workflow status added successfully',
      });

      cy.contains('Add multi-column row').click();

      cy.get('#selectedParentDroppableId-input').click();
      cy.get('[data-cy="selectParentDroppableGroup-options"] li')
        .first()
        .click();

      cy.get('[data-cy="numberOfColumns"]').click();
      cy.get('[data-cy="numberOfColumnsOptions"] li[data-value="2"]').click();

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
      addMultipleStatusesToMultiColumnProposalWorkflowWithChangingEvents();
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: firstProposalTitle,
            abstract: firstProposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });
          cy.submitProposal({ proposalPk: proposal.primaryKey });
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposal = result.createProposal.proposal;
        if (proposal) {
          cy.updateProposal({
            proposalPk: proposal.primaryKey,
            title: secondProposalTitle,
            abstract: secondProposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });
          cy.submitProposal({ proposalPk: proposal.primaryKey });
        }
      });

      cy.login('user');
      cy.visit('/');

      cy.contains(firstProposalTitle).parent().contains('submitted');
      cy.contains(secondProposalTitle).parent().contains('submitted');

      cy.logout();
      cy.login('officer');
      cy.visit('/');

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
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Feasible')
        .click();

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
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Unfeasible')
        .click();

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
  });

  describe('API access tokens tests', () => {
    const accessTokenName = faker.lorem.words(2);
    beforeEach(() => {});

    let removedAccessToken: string;

    it('User Officer should be able to create api access token', () => {
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.get('[data-cy="create-new-entry"]').click();

      cy.finishedLoading();

      cy.get('#accessToken').should('be.empty');

      cy.get('#name').type(accessTokenName);

      cy.contains('ProposalQueries.getAll').click();
      cy.contains('ProposalQueries.getAllView').click();

      cy.get('[data-cy="submit"]').click();

      cy.finishedLoading();

      cy.notification({
        variant: 'success',
        text: 'Api access token created successfully!',
      });

      cy.get('#accessToken').should('contain.value', 'Bearer ');

      cy.get('[aria-label="Copy"]').should('exist');

      cy.get('#accessToken')
        .invoke('val')
        .then((accessToken) => {
          cy.request({
            method: 'POST',
            url: '/graphql',
            body: {
              query:
                'query { proposalsView(filter: {}) { totalCount proposalViews { primaryKey title proposalId }}}',
            },
            auth: {
              bearer: (accessToken as string).split(' ')[1],
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.contain(
              'application/json'
            );
            expect(response.status).to.be.equal(200);
            expect(response.body.data.proposalsView).to.be.deep.equal({
              totalCount: 0,
              proposalViews: [],
            });
          });
        });
    });

    it('User Officer should be able to update api access token', () => {
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions:
          '{"ProposalQueries.getAll":true,"ProposalQueries.getAllView":true}',
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

      cy.contains('ProposalQueries.getAllView').click();

      cy.get('[data-cy="submit"]').click();

      cy.finishedLoading();

      cy.notification({
        variant: 'success',
        text: 'Api access token updated successfully!',
      });

      cy.get('[aria-label="Copy"]').should('exist');

      cy.get('#accessToken')
        .invoke('val')
        .then((accessToken) => {
          removedAccessToken = accessToken as string;
          cy.request({
            method: 'POST',
            url: '/graphql',
            body: {
              query:
                'query { proposalsView(filter: {}) { totalCount proposalViews { primaryKey title proposalId }}}',
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
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions:
          '{"ProposalQueries.getAll":true,"ProposalQueries.getAllView":true}',
      });
      cy.login('officer');
      cy.visit('/');

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName)
        .parent()
        .find('[aria-label="Delete"]')
        .click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Api access token deleted successfully',
      });

      cy.request({
        method: 'POST',
        url: '/graphql',
        body: {
          query:
            'query { proposals(filter: {}) { totalCount proposals { primaryKey title proposalId }}}',
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
