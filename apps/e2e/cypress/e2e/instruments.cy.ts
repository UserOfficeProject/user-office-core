import { faker } from '@faker-js/faker';
import {
  ReviewerFilter,
  TechnicalReviewStatus,
  FeatureId,
  SettingsId,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import settings from '../support/settings';

const selectAllProposalsFilterStatus = () => {
  cy.get('[data-cy="status-filter"]').click();
  cy.get('[role="listbox"] [data-value="0"]').click();
};

context('Instrument tests', () => {
  const proposal1 = {
    title: faker.random.words(2),
    abstract: faker.random.words(5),
  };

  const proposal2 = {
    title: faker.random.words(2),
    abstract: faker.random.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;

  const instrument1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist1.id,
  };

  const instrument2 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist1.id,
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    if (
      settings
        .getEnabledSettings()
        .get(SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS) !== 'FEASIBILITY'
    ) {
      cy.addFeasibilityReviewToDefaultWorkflow();
    }
  });

  // TODO: Maybe this should be moved to permission testing.
  it('User should not be able to see Instruments page', () => {
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Instruments');
  });

  describe('Instruments basic tests', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');

      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: scientist1.id,
          roles: [initialDBData.roles.instrumentScientist],
        });
      }
    });

    it('User officer should be able to create instrument', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }
      cy.contains('Instruments').click();
      cy.contains('Create').click();
      cy.get('#name').type(instrument1.name);
      cy.get('#shortCode').type(instrument1.shortCode);
      cy.get('#description').type(instrument1.description);

      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_SEARCH_FILTER)) {
        cy.get('[data-cy=instrument-contact-surname]').type(
          scientist1.lastName
        );
        cy.realPress('Enter');
        cy.get('[data-cy=findUser]').click();
      }

      cy.get('[data-cy=instrument-contact]').click();
      cy.get('[role=presentation]').contains(scientist1.lastName).click();

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.contains(instrument1.name);
      cy.contains(instrument1.shortCode);
      cy.contains(instrument1.description);
    });

    it('User Officer should be able to update Instrument', () => {
      const newName = faker.random.words(2);
      const newShortCode = faker.random.alphaNumeric(15);
      const newDescription = faker.random.words(5);
      cy.createInstrument(instrument1);

      cy.contains('Instruments').click();
      cy.contains(instrument1.name)
        .parent()
        .find('[aria-label="Edit"]')
        .click();
      cy.get('#name').clear();
      cy.get('#name').type(newName);
      cy.get('#shortCode').clear();
      cy.get('#shortCode').type(newShortCode);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      cy.get('[data-cy="instruments-table"]').as('instrumentsTable');

      cy.get('@instrumentsTable').should('contain', newName);
      cy.get('@instrumentsTable').should('contain', newShortCode);
      cy.get('@instrumentsTable').should('contain', newDescription);
    });

    it('User Officer should be able to assign instrument to a call', () => {
      cy.createInstrument(instrument1);

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('call 1')
        .parent()
        .find('[aria-label="Assign Instrument"]')
        .click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').check();

      cy.get('[data-cy="assign-instrument-to-call"').click();

      cy.notification({
        variant: 'success',
        text: 'Instrument/s assigned successfully',
      });
    });

    it('User Officer should be able to delete Instrument', () => {
      cy.createInstrument(instrument1);

      cy.contains('Instruments').click();

      cy.contains(instrument1.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Instrument removed' });

      cy.contains(instrument1.name).should('not.exist');
    });
  });

  describe('Advanced instruments tests as user officer role', () => {
    let createdInstrumentId: number;
    let createdProposalPk: number;

    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        cy.updateUserRoles({
          id: scientist2.id,
          roles: [initialDBData.roles.instrumentScientist],
        });
        cy.updateUserRoles({
          id: scientist1.id,
          roles: [initialDBData.roles.instrumentScientist],
        });
      }

      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrumentId }],
          });
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal1.title,
            abstract: proposal1.abstract,
          });
        }
      });

      cy.login('officer');
      cy.visit('/');
    });

    it('User Officer should be able to assign and unassign instrument to proposal without page refresh', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[type="checkbox"]')
        .as('checkbox');

      cy.get('@checkbox').check();

      cy.get('[data-cy="assign-remove-instrument"]').click();

      cy.get('[data-cy="proposals-instrument-assignment"]')
        .contains('Loading...')
        .should('not.exist');

      cy.get('#selectedInstrumentIds-input').first().click();

      cy.get('[data-cy="instrument-selection-options"] li')
        .contains(instrument1.name)
        .click();

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'Proposal/s assigned to the selected instrument successfully!',
      });

      cy.get('@checkbox').uncheck();

      cy.contains(proposal1.title).parent().contains(instrument1.name);

      cy.contains(proposal1.title).parent().find('[type="checkbox"]').check();

      cy.get('[data-cy="assign-remove-instrument"]').click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[data-cy="instrument-selection"]').should(
        'contain',
        instrument1.name
      );

      cy.get('[data-cy="instrument-selection"] input').click();

      cy.get('[title="Clear"]').click();

      cy.get('[data-cy="remove-instrument-alert"]').should('exist');

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.notification({
        variant: 'success',
        text: 'Proposal/s removed from the instrument successfully!',
      });

      cy.contains(proposal1.title)
        .parent()
        .should('not.contain', instrument1.name);
    });

    it('User Officer should be able to assign scientist to instrument', () => {
      cy.contains('Instruments').click();

      cy.contains(instrument1.name)
        .parent()
        .find('[aria-label="Assign scientist"]')
        .click();

      cy.get('[data-cy="co-proposers"]')
        .contains(scientist2.lastName)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('.MuiDialog-root [data-cy="assign-selected-users"]').click();

      cy.notification({
        variant: 'success',
        text: 'Scientist assigned to instrument',
      });
    });

    it('User Officer should be able to see who submitted the technical review', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist2.id],
      });
      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      });

      cy.login('user2');

      cy.updateTechnicalReviewAssignee({
        proposalPks: createdProposalPk,
        userId: scientist2.id,
        instrumentId: createdInstrumentId,
      });
      cy.addProposalTechnicalReview({
        proposalPk: createdProposalPk,
        reviewerId: scientist2.id,
        submitted: true,
        status: TechnicalReviewStatus.FEASIBLE,
        timeAllocation: 1,
        instrumentId: createdInstrumentId,
        questionaryId: initialDBData.technicalReview.questionaryId,
      });

      cy.login('officer', initialDBData.roles.userOfficer);
      cy.visit('/');

      cy.contains('Proposals');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Technical review').click();

      cy.get('[data-cy="reviewed-by-info"]').should('exist');
      cy.get('[data-cy="reviewed-by-info"]').should(
        'contain',
        `Reviewed by ${scientist2.firstName} ${scientist2.lastName}`
      );
    });

    it('Proposal should have technical review even if workflow status name changes but the shortCode contains FEASIBILITY', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }

      const newStatusName = faker.lorem.words(2);

      cy.login('officer', initialDBData.roles.userOfficer);
      cy.visit('/ProposalStatuses');

      cy.contains('FEASIBILITY_REVIEW')
        .closest('tr')
        .find('[aria-label="Edit"]')
        .click();

      cy.get('[data-cy="name"] input').clear().type(newStatusName);

      cy.get('[data-cy="submit"]').click();

      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      });

      cy.get('[data-cy="officer-menu-items"]')
        .find('[aria-label="Proposals"]')
        .click();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"]').should('exist');
    });

    it('User Officer should be able to re-open submitted technical review', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist2.id],
      });
      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      });

      cy.updateTechnicalReviewAssignee({
        proposalPks: [createdProposalPk],
        userId: scientist2.id,
        instrumentId: createdInstrumentId,
      });

      cy.login('user2');
      cy.visit('/');

      cy.addProposalTechnicalReview({
        proposalPk: createdProposalPk,
        reviewerId: scientist2.id,
        submitted: true,
        status: TechnicalReviewStatus.FEASIBLE,
        timeAllocation: 1,
        instrumentId: createdInstrumentId,
        questionaryId: 4,
      });

      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Technical review').click();

      cy.get('[data-cy="is-review-submitted"] input')
        .should('have.value', 'true')
        .click()
        .should('have.value', 'false');

      cy.get('[data-cy="save-button"]').click();

      cy.notification({
        variant: 'success',
        text: 'Updated',
      });

      cy.closeModal();

      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper').contains('Technical time allocation').click();
      cy.get('body').click();

      cy.contains(proposal1.title)
        .parent()
        .should('include.text', initialDBData.call.allocationTimeUnit);

      cy.logout();

      cy.login(scientist2);
      cy.visit('/');

      cy.contains('Proposals');

      selectAllProposalsFilterStatus();
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .click();
      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.get('[data-cy="save-and-continue-button"]').should('not.be.disabled');
      //cy.get('[data-cy="submit-technical-review"]').should('not.be.disabled');
      cy.get('[data-cy="timeAllocation"] input').should('not.be.disabled');
      cy.get('[data-cy="timeAllocation"] label').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );
    });

    it('User Officer should be able to see proposal instrument scientist and re-assign technical reviewer', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      const numberOfScientistsAndManagerAssignedToCreatedInstrument = 2;
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist2.id],
      });
      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      });

      cy.login('officer');
      cy.visit('/');

      cy.contains('Proposals');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Technical review').click();

      cy.get('[data-cy="user-list"] input').should(
        'have.value',
        `${scientist1.firstName} ${scientist1.lastName}`
      );

      cy.get('[data-cy="user-list"]').click();

      cy.get('[title="user-list-options"] li').should(
        'have.length',
        numberOfScientistsAndManagerAssignedToCreatedInstrument
      );
      cy.get('[title="user-list-options"]')
        .contains(scientist2.firstName)
        .click();

      cy.get('[data-cy="re-assign-submit"]').click();
      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: `Assigned to ${scientist2.firstName} ${scientist2.lastName}`,
      });

      cy.closeModal();
      // TODO: Extend here when technical reviewer is added to the table.
    });

    it('User Officer should be able to remove assigned scientist from instrument', () => {
      cy.assignScientistsToInstrument({
        instrumentId: createdInstrumentId,
        scientistIds: [scientist2.id],
      });
      cy.contains('Instruments').click();

      // The sidebar tab label can obstruct the dropdown
      cy.get('body')
        .click()
        .then(() => {
          cy.contains(instrument1.name)
            .parent()
            .find('[aria-label="Detail panel visibility toggle"]')
            .click();
        });

      cy.contains(scientist2.lastName);

      cy.contains(scientist2.lastName)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Scientist removed from instrument',
      });

      cy.contains(scientist2.lastName).should('not.exist');

      cy.contains(instrument1.name)
        .parent()
        .parent()
        .find('[data-cy="instrument-scientist-assignments-table"]')
        .should('contain.text', 'No records to display');
    });

    it('User Officer should be able to update instrument contact', () => {
      cy.contains('Instruments').click();

      cy.contains(instrument1.name)
        .parent()
        .find('[aria-label="Edit"]')
        .click();
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_SEARCH_FILTER)) {
        cy.get('[data-cy=instrument-contact-surname]').type(
          scientist2.lastName
        );
        cy.get('[data-cy=findUser]').click();
      }
      cy.get('[data-cy=instrument-contact]').click();
      cy.get('[role=presentation]').contains(scientist2.lastName).click();

      cy.get('[role=presentation] [data-cy=submit]').click();

      cy.finishedLoading();

      cy.contains('Instrument updated successfully!');
    });

    it('User officer should be able to filter proposals assigned to multiple instruments', () => {
      cy.assignProposalsToInstruments({
        proposalPks: [createdProposalPk],
        instrumentIds: [createdInstrumentId],
      });

      cy.createInstrument(instrument2).then(({ createInstrument }) => {
        if (createInstrument) {
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createInstrument.id }],
          });

          cy.assignScientistsToInstrument({
            instrumentId: createInstrument.id,
            scientistIds: [scientist2.id],
          });

          cy.createProposal({ callId: initialDBData.call.id }).then(
            ({ createProposal }) => {
              if (createProposal) {
                cy.updateProposal({
                  proposalPk: createProposal.primaryKey,
                  title: proposal2.title,
                  abstract: proposal2.abstract,
                });

                cy.assignProposalsToInstruments({
                  proposalPks: [createProposal.primaryKey],
                  instrumentIds: [createdInstrumentId, createInstrument.id],
                });

                cy.updateTechnicalReviewAssignee({
                  proposalPks: [createProposal.primaryKey],
                  userId: scientist2.id,
                  instrumentId: createInstrument.id,
                });
              }
            }
          );
        }
      });

      cy.visit('/Proposals');

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[data-value="multi"]').click();
      cy.finishedLoading();

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );
      cy.contains(proposal2.title);
      cy.contains(instrument1.name);
      cy.contains(instrument2.name);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument1.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument2.name).click();
      cy.finishedLoading();

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );
      cy.contains(proposal2.title);
    });
  });

  describe('Instruments tests as instrument scientist role', () => {
    let createdInstrumentId: number;
    let createdInstrument2Id: number;
    let createdProposalPk: number;
    let createdProposalId: string;

    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }
      cy.updateUserRoles({
        id: scientist2.id,
        roles: [initialDBData.roles.instrumentScientist],
      });

      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrumentId }],
          });

          cy.assignScientistsToInstrument({
            instrumentId: createdInstrumentId,
            scientistIds: [scientist2.id],
          });
        }
      });
      cy.createInstrument(instrument2).then((result) => {
        if (result.createInstrument) {
          createdInstrument2Id = result.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrument2Id }],
          });

          cy.assignScientistsToInstrument({
            instrumentId: createdInstrument2Id,
            scientistIds: [scientist2.id],
          });
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal1.title,
            abstract: proposal1.abstract,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposalPk],
            instrumentIds: [createdInstrumentId],
          });

          cy.updateTechnicalReviewAssignee({
            proposalPks: [createdProposalPk],
            userId: scientist2.id,
            instrumentId: createdInstrumentId,
          });
        }
      });

      cy.login(scientist2);
      cy.visit('/');
    });
    it('Instrument scientist should be able to see instruments he is assigned to', () => {
      cy.contains('Instruments').click();

      cy.contains(instrument1.name);

      cy.get('[aria-label="Detail panel visibility toggle"]')
        .first()
        .should('exist')
        .click();

      cy.contains(scientist2.lastName);
    });

    it('Instrument scientist should be able to see proposals assigned to instrument where he is instrument scientist', () => {
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title);
    });

    it('Instrument scientist should be able to filter proposals assigned to multiple instruments where assigned as instrument scientist', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then(
        ({ createProposal }) => {
          if (createProposal) {
            cy.updateProposal({
              proposalPk: createProposal.primaryKey,
              title: proposal2.title,
              abstract: proposal2.abstract,
            });

            cy.assignProposalsToInstruments({
              proposalPks: [createProposal.primaryKey],
              instrumentIds: [createdInstrumentId, createdInstrument2Id],
            });

            cy.updateTechnicalReviewAssignee({
              proposalPks: [createProposal.primaryKey],
              userId: scientist2.id,
              instrumentId: createdInstrument2Id,
            });
          }
        }
      );
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[data-value="multi"]').click();
      cy.finishedLoading();

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );
      cy.contains(proposal2.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument1.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument2.name).click();
      cy.finishedLoading();

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );
      cy.contains(proposal2.title);
    });

    it('Instrument scientist should have a call and instrument filter', () => {
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title);

      cy.finishedLoading();

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('call 1').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument2.name).click();
      cy.finishedLoading();

      cy.contains('No records to display');
      cy.contains(proposal1.title).should('not.exist');

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);

      // TODO: This could be tested in the questions or templates where we test other question filters.
      // cy.get('[data-cy=question-list]').click();
      // cy.contains(questionText).click();
      // cy.get('[data-cy=is-checked]').click();
      // cy.get('[role=listbox]').contains('Yes').click();
      // cy.contains('Search').click();
      // cy.contains(proposal1.title).should('exist');
    });

    it('Instrument scientists should be able to filter only their own proposals', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal2.title,
            abstract: proposal2.abstract,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposalPk],
            instrumentIds: [createdInstrumentId],
          });
        }
      });
      cy.contains('Proposals');

      cy.get('[data-cy="reviewer-filter"] input').should(
        'have.value',
        ReviewerFilter.ME
      );

      selectAllProposalsFilterStatus();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.get('table.MuiTable-root').should('not.contain.text', proposal2.title);

      cy.get('[data-cy="reviewer-filter"]').click();
      cy.get(
        `[property="reviewer-filter-options"] [data-value=${ReviewerFilter.ALL}]`
      ).click();
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .should('exist');
      cy.contains(proposal2.title)
        .parent()
        .find('[data-cy="view-proposal-and-technical-review"]')
        .should('exist');
    });

    it('Instrument scientist should be able to download multiple proposals as PDF', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal2.title,
            abstract: proposal2.abstract,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposalPk],
            instrumentIds: [createdInstrumentId],
          });
        }
      });
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.finishedLoading();

      cy.get('[data-cy="reviewer-filter"]').click();
      cy.get(
        `[property="reviewer-filter-options"] [data-value=${ReviewerFilter.ALL}]`
      ).click();

      cy.finishedLoading();
      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();
      cy.contains(proposal2.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();

      cy.contains('Download as single file').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        '2 selected items'
      );
    });

    it.only('Instrument scientists should be able to save and submit technical review only on their own proposals', () => {
      const internalComment = faker.random.words(2);
      const publicComment = faker.random.words(2);
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Technical review').click();

      cy.get('@dialog')
        .find('[data-cy="timeAllocation"] input')
        .should('exist');

      cy.get('@dialog').contains('Proposal information').click();

      cy.finishedLoading();

      cy.get('@dialog').contains(proposal1.title);

      cy.get('@dialog').contains('Technical review').click();

      cy.get('[data-cy="timeAllocation"] input').type('-123').blur();
      cy.contains('Must be greater than or equal to');

      cy.get('[data-cy="timeAllocation"] input')
        .clear()
        .type('987654321')
        .blur();
      cy.contains('Must be less than or equal to');

      cy.get('[data-cy="timeAllocation"] input').clear().type('20');

      cy.get('[data-cy="technical-review-status"]').click();
      cy.contains('Feasible').click();

      cy.on('window:confirm', (str) => {
        expect(str).to.equal(
          'Changes you recently made in this tab will be lost! Are you sure?'
        );

        return false;
      });

      cy.contains('Proposal information').click();

      cy.get('[data-cy="save-button"]').click();

      cy.notification({
        variant: 'success',
        text: 'Saved',
      });

      cy.setTinyMceContent('comment', internalComment);
      cy.setTinyMceContent('publicComment', publicComment);

      cy.getTinyMceContent('comment').then((content) =>
        expect(content).to.have.string(internalComment)
      );

      cy.getTinyMceContent('publicComment').then((content) =>
        expect(content).to.have.string(publicComment)
      );

      cy.get('[data-cy="save-and-continue-button"]').click();
      cy.get('[data-cy="button-submit-technical-review"]').click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.get('[data-cy="button-submit-technical-review"]').should(
        'be.disabled'
      );

      cy.notification({ text: 'successfully', variant: 'success' });

      cy.get('[data-cy="back-button"]').click();

      //cy.get('[data-cy="save-technical-review"]').should('be.disabled');
      //cy.get('[data-cy="submit-technical-review"]').should('be.disabled');
      cy.get('[data-cy="timeAllocation"] input').should('be.disabled');

      cy.closeModal();

      cy.contains('Proposals').click();

      selectAllProposalsFilterStatus();

      cy.contains('20');
    });

    it('Instrument scientists should be able to see but not modify the management decision', () => {
      cy.contains('Proposals');

      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .click();
      cy.get('[role="dialog"]').as('dialog');
      cy.finishedLoading();
      cy.get('@dialog').contains('Admin').click();

      cy.get('@dialog')
        .find('[data-cy="proposal-final-status"] input')
        .should('be.disabled');
      cy.get('@dialog')
        .find(
          `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
        )
        .should('be.disabled');
      cy.get('@dialog')
        .find('[data-cy="commentForUser"] textarea')
        .should('be.disabled');
      cy.get('@dialog')
        .find('[data-cy="commentForManagement"] textarea')
        .should('be.disabled');
      cy.get('@dialog')
        .find('[data-cy="is-management-decision-submitted"] input')
        .should('be.disabled');
      cy.get('@dialog')
        .find('[data-cy="save-admin-decision"]')
        .should('be.disabled');
    });

    it('Technical review assignee should see edit icon if assigned to review a proposal and review is not submitted', () => {
      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal-and-technical-review"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .should('exist')
        .click();

      cy.closeModal();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .should('exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal-and-technical-review"]')
        .should('not.exist');
    });

    it('Technical review assignee should be able to bulk submit technical reviews and see warning if some required info is missing ', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          const createdProposal2Id = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposal2Id,
            title: proposal2.title,
            abstract: proposal2.abstract,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposal2Id],
            instrumentIds: [createdInstrumentId],
          });

          cy.updateTechnicalReviewAssignee({
            proposalPks: [createdProposal2Id],
            userId: scientist2.id,
            instrumentId: createdInstrumentId,
          });

          cy.addProposalTechnicalReview({
            proposalPk: createdProposal2Id,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 1,
            reviewerId: scientist2.id,
            submitted: false,
            instrumentId: createdInstrumentId,
            questionaryId: initialDBData.technicalReview.questionaryId,
          });
        }
      });
      selectAllProposalsFilterStatus();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.contains(proposal2.title)
        .parent()
        .find('input[type="checkbox"]')
        .click();

      cy.get('[data-cy="submit-proposal-reviews"]').click();

      cy.get('[role="presentation"] [role="alert"] .MuiAlert-message')
        .should('exist')
        .and('include.text', createdProposalId);

      cy.get('[data-cy="confirm-cancel"]').click();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="edit-technical-review"]')
        .click();

      cy.get('[data-cy="technical-review-status"]').click();
      cy.get('[data-cy="technical-review-status-options"]')
        .contains('Feasible')
        .click();
      cy.get('[data-cy="timeAllocation"] input').type('10');

      cy.get('[data-cy="save-button"]').click();

      cy.notification({
        text: 'Saved',
        variant: 'success',
      });

      cy.closeModal();

      cy.get('[data-cy="submit-proposal-reviews"]').click();

      cy.get('[role="presentation"] [role="alert"] .MuiAlert-message').should(
        'not.exist'
      );

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        text: 'Proposals technical review submitted successfully',
        variant: 'success',
      });

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="view-proposal-and-technical-review"]')
        .should('exist');
      cy.contains(proposal2.title)
        .parent()
        .find('[data-cy="view-proposal-and-technical-review"]')
        .should('exist');
    });
  });
});
