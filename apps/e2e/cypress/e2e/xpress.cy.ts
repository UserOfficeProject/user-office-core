import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  FeatureId,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Xpress tests', () => {
  let createdInstrumentId1: number;
  let createdInstrumentId2: number;
  let createdInstrumentId3: number;
  let createdInstrumentId4: number;
  let createdInstrumentId5: number;

  let createdProposalPk1: number;
  let createdProposalPk2: number;
  let createdProposalPk3: number;
  let createdProposalPk4: number;
  let createdProposalPk5: number;

  let createdProposalId1: string;
  let createdProposalId2: string;
  let createdProposalId3: string;
  let createdProposalId4: string;
  let createdProposalId5: string;

  let createdTechniquePk1: number;
  let createdTechniquePk2: number;
  let createdTechniquePk3: number;
  // Technique 4 has no proposals assigned
  let createdTechniquePk5: number;

  const draftStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    id: initialDBData.proposalStatuses.draft.id,
    name: 'DRAFT',
    shortCode: 'SUBMITTED_LOCKED',
    description: '-',
  };

  const submittedStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    name: 'Submitted (locked)',
    shortCode: 'SUBMITTED_LOCKED',
    description: '-',
  };

  const underReviewStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    name: 'Under review',
    shortCode: 'UNDER_REVIEW',
    description: '-',
  };

  const approvedStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    name: 'Approved',
    shortCode: 'APPROVED',
    description: '-',
  };

  const unsuccessfulStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    name: 'Unsucessful',
    shortCode: 'UNSUCCESSFUL',
    description: '-',
  };

  const finishedStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    name: 'Finished',
    shortCode: 'FINISHED',
    description: '-',
  };

  const expiredStatus: {
    id?: number;
    name: string;
    shortCode: string;
    description: string;
  } = {
    id: initialDBData.proposalStatuses.expired.id,
    name: 'EXPIRED',
    shortCode: 'EXPIRED',
    description: '-',
  };

  const technique1 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique2 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique3 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique4 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique5 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;
  const scientist3 = initialDBData.users.user3;
  const scientist4 = initialDBData.users.placeholderUser;

  const instrument1 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist1.id,
  };

  const instrument2 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist2.id,
  };

  const instrument3 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist3.id,
  };

  const instrument4 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist4.id,
  };

  const instrument5 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist2.id,
  };

  const proposal1 = {
    title: faker.word.words(4),
    abstract: faker.word.words(5),
  };

  const proposal2 = {
    title: faker.word.words(4),
    abstract: faker.word.words(5),
  };

  const proposal3 = {
    title: faker.word.words(4),
    abstract: faker.word.words(5),
  };

  const proposal4 = {
    title: faker.word.words(4),
    abstract: faker.word.words(5),
  };

  const proposal5 = {
    title: faker.word.words(4),
    abstract: faker.word.words(5),
  };

  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (
        !featureFlags.getEnabledFeatures().get(FeatureId.STFC_XPRESS_MANAGEMENT)
      ) {
        this.skip();
      }
    });

    /*
     Create Xpress-specific statuses to avoid patching them in.
     Others in the Xpress workflow are already created.
    */
    cy.createProposalStatus({
      name: underReviewStatus.name,
      shortCode: underReviewStatus.shortCode,
      description: underReviewStatus.description,
    }).then((result) => {
      if (result.createProposalStatus) {
        underReviewStatus.id = result.createProposalStatus.id;
      }
    });

    cy.createProposalStatus({
      name: approvedStatus.name,
      shortCode: approvedStatus.shortCode,
      description: approvedStatus.description,
    }).then((result) => {
      if (result.createProposalStatus) {
        approvedStatus.id = result.createProposalStatus.id;
      }
    });

    cy.createProposalStatus({
      name: unsuccessfulStatus.name,
      shortCode: unsuccessfulStatus.shortCode,
      description: unsuccessfulStatus.description,
    }).then((result) => {
      if (result.createProposalStatus) {
        unsuccessfulStatus.id = result.createProposalStatus.id;
      }
    });

    cy.createProposalStatus({
      name: finishedStatus.name,
      shortCode: finishedStatus.shortCode,
      description: finishedStatus.description,
    }).then((result) => {
      if (result.createProposalStatus) {
        finishedStatus.id = result.createProposalStatus.id;
      }
    });

    cy.createProposalStatus({
      name: submittedStatus.name,
      shortCode: submittedStatus.shortCode,
      description: submittedStatus.description,
    }).then((result) => {
      if (result.createProposalStatus) {
        submittedStatus.id = result.createProposalStatus.id;
      }
    });

    /*
    Create instruments and assign them to the call
    */
    cy.createInstrument(instrument1).then((result) => {
      if (result.createInstrument) {
        createdInstrumentId1 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId1 }],
        });
      }
    });

    cy.createInstrument(instrument2).then((result) => {
      if (result.createInstrument) {
        createdInstrumentId2 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId2 }],
        });
      }
    });

    cy.createInstrument(instrument3).then((result) => {
      if (result.createInstrument) {
        createdInstrumentId3 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId3 }],
        });
      }
    });

    cy.createInstrument(instrument4).then((result) => {
      if (result.createInstrument) {
        createdInstrumentId4 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId4 }],
        });
      }
    });

    cy.createInstrument(instrument5).then((result) => {
      if (result.createInstrument) {
        createdInstrumentId5 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId5 }],
        });
      }
    });

    /*
    Create techniques and assign scientists to them
    */
    cy.createTechnique(technique1).then((result) => {
      createdTechniquePk1 = result.createTechnique.id;
      cy.assignScientistsToTechnique({
        scientistIds: [scientist1.id, scientist2.id],
        techniqueId: result.createTechnique.id,
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId1, createdInstrumentId2],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique2).then((result) => {
      createdTechniquePk2 = result.createTechnique.id;
      cy.assignScientistsToTechnique({
        scientistIds: [scientist2.id],
        techniqueId: result.createTechnique.id,
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId2],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique3).then((result) => {
      createdTechniquePk3 = result.createTechnique.id;
      cy.assignScientistsToTechnique({
        scientistIds: [scientist3.id],
        techniqueId: result.createTechnique.id,
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId3],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique4).then((result) => {
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId4],
        techniqueId: result.createTechnique.id,
      });
    });
    cy.createTechnique(technique5).then((result) => {
      createdTechniquePk5 = result.createTechnique.id;
      cy.assignScientistsToTechnique({
        scientistIds: [scientist2.id],
        techniqueId: result.createTechnique.id,
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId5],
        techniqueId: result.createTechnique.id,
      });
    });

    /*
    Create proposals and assign techniques to them
    */
    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        createdProposalPk1 = result.createProposal.primaryKey;
        createdProposalId1 = result.createProposal.proposalId;

        cy.updateProposal({
          proposalPk: createdProposalPk1,
          title: proposal1.title,
          abstract: proposal1.abstract,
        });

        cy.assignProposalToTechniques({
          proposalPk: createdProposalPk1,
          techniqueIds: [createdTechniquePk1],
        });
      }
    });

    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        createdProposalPk2 = result.createProposal.primaryKey;

        cy.updateProposal({
          proposalPk: createdProposalPk2,
          title: proposal2.title,
          abstract: proposal2.abstract,
        });

        cy.submitProposal({ proposalPk: createdProposalPk2 }).then((result) => {
          createdProposalId2 = result.submitProposal.proposalId;
        });

        cy.assignProposalToTechniques({
          proposalPk: createdProposalPk2,
          techniqueIds: [createdTechniquePk2],
        });
      }
    });

    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        createdProposalPk3 = result.createProposal.primaryKey;

        cy.updateProposal({
          proposalPk: createdProposalPk3,
          title: proposal3.title,
          abstract: proposal3.abstract,
        });

        cy.submitProposal({ proposalPk: createdProposalPk3 }).then((result) => {
          createdProposalId3 = result.submitProposal.proposalId;
        });

        cy.changeProposalsStatus({
          statusId: submittedStatus.id as number,
          proposalPks: [createdProposalPk3],
        });

        cy.assignProposalToTechniques({
          proposalPk: createdProposalPk3,
          techniqueIds: [createdTechniquePk3],
        });
      }
    });

    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        createdProposalPk4 = result.createProposal.primaryKey;

        cy.updateProposal({
          proposalPk: createdProposalPk4,
          title: proposal4.title,
          abstract: proposal4.abstract,
        });

        cy.submitProposal({ proposalPk: createdProposalPk4 }).then((result) => {
          createdProposalId4 = result.submitProposal.proposalId;
        });

        cy.changeProposalsStatus({
          statusId: submittedStatus.id as number,
          proposalPks: [createdProposalPk4],
        });
      }
    });

    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal) {
        createdProposalPk5 = result.createProposal.primaryKey;
        createdProposalId5 = result.createProposal.proposalId;

        cy.updateProposal({
          proposalPk: createdProposalPk5,
          title: proposal5.title,
          abstract: proposal5.abstract,
        });

        cy.changeProposalsStatus({
          statusId: expiredStatus.id as number,
          proposalPks: [createdProposalPk5],
        });

        cy.assignProposalToTechniques({
          proposalPk: createdProposalPk5,
          techniqueIds: [createdTechniquePk5],
        });
      }
    });
  });

  describe('Xpress basic tests', () => {
    it('User should not be able to see Xpress page', function () {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.get('[data-cy="profile-page-btn"]').should('exist');

      cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Xpress');
    });

    it('Xpress proposals can be filtered by technique', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.get('[data-cy="technique-filter"]').click();
      cy.get('[role="listbox"]').contains(technique1.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('[data-cy="technique-filter"]').click();
      cy.get('[role="listbox"]').contains(technique2.name).click();
      cy.finishedLoading();

      cy.contains(proposal2.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('[data-cy="technique-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);
    });

    it('Xpress proposals can be filtered by instrument', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains(instrument1.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('[data-cy="instrument-filter"]').click();

      // Wait for instruments to load
      cy.get('ul[role="listbox"]')
        .should('be.visible')
        .then(() => {
          cy.get('ul[role="listbox"] li')
            .filter('[data-value]:not([data-value="all"])')
            .should('have.length.greaterThan', 0);
        });

      cy.get('[role="listbox"]').contains(instrument2.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('[data-cy="instrument-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);
    });

    it('Xpress proposals can be filtered by call', function () {
      let esiTemplateId: number;
      const esiTemplateName = faker.lorem.words(2);
      let workflowId: number;
      const currentDayStart = DateTime.now().startOf('day');
      const proposalWorkflow = {
        name: faker.lorem.words(2),
        description: faker.lorem.words(5),
      };

      const newCall = {
        shortCode: 'call 2',
        startCall: DateTime.fromJSDate(faker.date.past()),
        endCall: DateTime.fromJSDate(faker.date.future()),
        startReview: currentDayStart,
        endReview: currentDayStart,
        startFapReview: currentDayStart,
        endFapReview: currentDayStart,
        startNotify: currentDayStart,
        endNotify: currentDayStart,
        startCycle: currentDayStart,
        endCycle: currentDayStart,
        templateName: initialDBData.template.name,
        templateId: initialDBData.template.id,
        allocationTimeUnit: AllocationTimeUnits.DAY,
        cycleComment: faker.lorem.word(10),
        surveyComment: faker.lorem.word(10),
        esiTemplateName: esiTemplateName,
      };

      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: esiTemplateName,
      }).then((result) => {
        if (result.createTemplate) {
          esiTemplateId = result.createTemplate.templateId;

          cy.createProposalWorkflow(proposalWorkflow).then((result) => {
            if (result.createProposalWorkflow) {
              workflowId = result.createProposalWorkflow.id;
              cy.createCall({
                ...newCall,
                esiTemplateId: esiTemplateId,
                proposalWorkflowId: workflowId,
              });
            } else {
              throw new Error('Workflow creation failed');
            }
          });
        } else {
          throw new Error('ESI templete creation failed');
        }
      });

      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('call 1').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('call 2').click();
      cy.finishedLoading();

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);
    });

    it('Xpress proposals can be filtered by status', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.get('[data-cy="status-filter"]').click();

      // Ensure the dropdown only contains Xpress statuses
      cy.get('[role="listbox"] [data-value]').then((options) => {
        const actualStatuses = [...options].map((option) =>
          option.innerText.trim()
        );
        const expectedStatuses = [
          'All',
          draftStatus.name,
          submittedStatus.name,
          underReviewStatus.name,
          approvedStatus.name,
          unsuccessfulStatus.name,
          finishedStatus.name,
          expiredStatus.name,
        ];

        // Expect the correct order and exact amount of items
        expect(actualStatuses).to.deep.equal(expectedStatuses);
      });

      cy.get('[role="listbox"]').contains(submittedStatus.name).click();

      cy.finishedLoading();

      cy.contains(proposal3.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"]').contains(draftStatus.name).click();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"]').contains('All').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);
    });

    it('Xpress proposals can be filtered by multiple filters', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.get('[data-cy="call-filter"]').click();
      cy.get('[role="listbox"]').contains('call 1').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);
      cy.contains(proposal3.title);

      cy.get('[data-cy="instrument-filter"]').click();

      // Wait for instruments to load
      cy.get('ul[role="listbox"]')
        .should('be.visible')
        .then(() => {
          cy.get('ul[role="listbox"] li')
            .filter('[data-value]:not([data-value="all"])')
            .should('have.length.greaterThan', 0);
        });

      cy.get('[role="listbox"]').contains(instrument2.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="status-filter"]').click();
      cy.get('[role="listbox"] [data-value="1"]').click();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title);

      cy.get('[data-cy="technique-filter"]').click();
      cy.get('[role="listbox"]').contains(technique1.name).click();
      cy.finishedLoading();

      cy.contains(proposal1.title);

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );

      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal4.title
      );
    });

    it('Xpress proposals can be searched for by title, technique, instrument, proposal ID', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      // Test with proposal title
      cy.get('input[aria-label="Search"]').focus().type(proposal1.title);
      cy.contains(proposal1.title);
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );
      cy.get('input[aria-label="Search"]').focus().clear();

      // Test with proposal id
      cy.get('input[aria-label="Search"]').focus().type(createdProposalId2);
      cy.contains(proposal2.title);
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal1.title
      );
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );
      cy.get('input[aria-label="Search"]').focus().clear();

      // Test with technique name
      cy.get('input[aria-label="Search"]').focus().type(technique1.name);
      cy.contains(proposal1.title);
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal2.title
      );
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        proposal3.title
      );
      cy.get('input[aria-label="Search"]').focus().clear();
    });

    it('Officer should be able to export the proposals into excel', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get("[aria-label='Export proposals in Excel']").first().click();

      const downloadsFolder = Cypress.config('downloadsFolder');
      const currentYear = new Date().getFullYear();
      const downloadedFileName = `proposal_${currentYear}_${createdProposalId1}.xlsx`;

      cy.readFile(`${downloadsFolder}/${downloadedFileName}`).should('exist');
    });

    it('Scientist should be able to export the proposals into excel', function () {
      cy.login(scientist1);
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.contains(proposal1.title)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get("[aria-label='Export proposals in Excel']").first().click();

      const downloadsFolder = Cypress.config('downloadsFolder');
      const currentYear = new Date().getFullYear();
      const downloadedFileName = `proposal_${currentYear}_${createdProposalId1}.xlsx`;

      cy.readFile(`${downloadsFolder}/${downloadedFileName}`).should('exist');
    });

    it('Officer should be able to use the view proposal option', function () {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(proposal1.abstract);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);

      cy.get('button[role="tab"]').contains('Logs').click({ force: true });
      cy.contains('PROPOSAL_CREATED');
      cy.contains('PROPOSAL_UPDATED');
      cy.contains('PROPOSAL_ASSIGNED_TO_TECHNIQUES');
    });

    it('Scientist should be able to use the view proposal option', function () {
      cy.login(scientist1);
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress Proposals').click();

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.contains(proposal1.title);
      cy.contains(proposal1.abstract);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);
    });
  });

  describe('Techniques advanced tests', () => {
    it('User officer can see all submitted and unsubmitted Xpress proposals', function () {
      cy.login('officer');
      cy.changeActiveRole(initialDBData.roles.userOfficer);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);

      cy.contains(proposal2.title);
      cy.contains(createdProposalId2);
      cy.contains(technique2.name);

      cy.contains(proposal3.title);
      cy.contains(createdProposalId3);
      cy.contains(technique3.name);

      cy.contains(proposal5.title);
      cy.contains(createdProposalId5);
      cy.contains(technique5.name);
    });

    it('Instrument scientist can only see submitted and unsubmitted Xpress proposals for their techniques', function () {
      /*
      Scientist 1 belongs to technique 1, which only has proposal 1
      */
      cy.login(scientist1);
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);

      cy.should('not.contain', proposal2.title);
      cy.should('not.contain', createdProposalId2);
      cy.should('not.contain', technique2.name);

      cy.should('not.contain', proposal3.title);
      cy.should('not.contain', createdProposalId3);
      cy.should('not.contain', technique3.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', technique4.name);

      cy.should('not.contain', proposal5.title);
      cy.should('not.contain', createdProposalId5);

      /*
      Scientist 2 belongs to technique 2, which has proposals 1 and 2
      */
      cy.login(scientist2);
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);

      cy.contains(proposal2.title);
      cy.contains(createdProposalId2);
      cy.contains(technique2.name);

      cy.should('not.contain', proposal3.title);
      cy.should('not.contain', createdProposalId3);
      cy.should('not.contain', technique3.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', technique4.name);

      cy.should('not.contain', proposal5.title);
      cy.should('not.contain', createdProposalId5);
      cy.should('not.contain', technique5.name);
    });

    it('User officer able to select and assign an instrument for a proposal', function () {
      cy.login('officer');
      cy.changeActiveRole(initialDBData.roles.userOfficer);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      // Check if only instrument 1 and 2 is available to be selected for proposal 1
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .click();
      cy.get('[role="listbox"]').contains(instrument1.name);
      cy.get('[role="listbox"]').contains(instrument2.name);
      cy.get('[role="listbox"]').should('not.contain', instrument3.name);
      cy.get('[role="listbox"]').should('not.contain', instrument4.name);

      // Assign instrument 1 to proposal 1
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        instrument1.name
      );
      cy.get('[role="listbox"]').contains(instrument1.name).click();
      cy.get('[data-cy="confirm-ok"]').click();
      cy.notification({ variant: 'success', text: 'successfully' });
      cy.finishedLoading();
      cy.contains(instrument1.name);
    });

    it('Instrument scientist able to select and assign an instrument for a proposal', function () {
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: underReviewStatus.id as number,
      });

      /*
      Scientist 1 belongs to technique 1, which only has proposal 1
      */
      cy.login(scientist1);
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      // Check if only instrument 1 and 2 is available to be selected for proposal 1
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .click();
      cy.get('[role="listbox"]').contains(instrument1.name);
      cy.get('[role="listbox"]').contains(instrument2.name);
      cy.get('[role="listbox"]').should('not.contain', instrument3.name);
      cy.get('[role="listbox"]').should('not.contain', instrument4.name);

      // Assign instrument 1 to proposal 1
      cy.get('table.MuiTable-root tbody tr').should(
        'not.contain',
        instrument1.name
      );
      cy.get('[role="listbox"]').contains(instrument1.name).click();
      cy.finishedLoading();
      cy.contains(instrument1.name);
    });
  });

  describe('Xpress statuses tests', () => {
    it('User officer can change to/from any Xpress status', function () {
      cy.login('officer');
      cy.changeActiveRole(initialDBData.roles.userOfficer);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      /*
      Check all statuses are visible and not disabled
      */
      cy.get('[role="listbox"]')
        .contains(draftStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(submittedStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(underReviewStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(approvedStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(unsuccessfulStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('not.be.disabled');
      cy.get('[role="listbox"]')
        .contains(expiredStatus.name)
        .should('not.be.disabled');

      /*
      Check the dropdown has the exact amount of items in the correct order
      */
      cy.get('[role="listbox"] [data-value]').then((options) => {
        const actualStatuses = [...options].map((option) =>
          option.innerText.trim()
        );
        const expectedOrder = [
          draftStatus.name,
          submittedStatus.name,
          underReviewStatus.name,
          approvedStatus.name,
          unsuccessfulStatus.name,
          finishedStatus.name,
          expiredStatus.name,
        ];

        expect(actualStatuses).to.deep.equal(expectedOrder);
      });

      /*
      Change the status of proposal 1 from draft -> finished
      */
      cy.get('[role="listbox"]')
        .contains(draftStatus.name)
        .should('be.selected');
      cy.get('[role="listbox"]').contains(finishedStatus.name).click();

      cy.get('[data-cy="confirm-ok"]').click();
      cy.notification({ variant: 'success', text: 'successfully' });

      cy.finishedLoading();
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .should('have.text', finishedStatus.name);

      /*
      Change the status of proposal 1 from finished -> submitted
      */
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('be.selected');
      cy.get('[role="listbox"]').contains(submittedStatus.name).click();

      cy.get('[data-cy="confirm-ok"]').click();
      cy.notification({ variant: 'success', text: 'successfully' });

      cy.finishedLoading();
      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .should('have.text', submittedStatus.name);
    });

    it('Scientist cannot change status or instrument when the status is draft', function () {
      /*
      Status and instrument are uneditable when there is an instrument
      */
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: draftStatus.id as number,
      });

      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .should('contain', draftStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .should('contain', instrument1.name)
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');

      /*
      Status and instrument are uneditable when there is no instrument
      */
      cy.removeProposalsFromInstrument({
        proposalPks: createdProposalPk1,
      });

      cy.contains(proposal1.title)
        .parent()
        .should('contain', draftStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');
    });

    it('Scientist cannot change status or instrument when the status is finished', function () {
      /*
      Status and instrument are uneditable when there is an instrument
      */
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: finishedStatus.id as number,
      });

      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .should('contain', finishedStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      /*
      Status and instrument are uneditable when there is no instrument
      */
      cy.removeProposalsFromInstrument({
        proposalPks: createdProposalPk1,
      });

      cy.contains(proposal1.title)
        .parent()
        .should('contain', finishedStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');
    });

    it('Scientist cannot change status or instrument when the status is unsuccessful', function () {
      /*
      Status and instrument are uneditable when there is an instrument
      */
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: unsuccessfulStatus.id as number,
      });

      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .should('contain', unsuccessfulStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .should('contain', instrument1.name)
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');

      /*
      Status and instrument are uneditable when there is no instrument
      */
      cy.removeProposalsFromInstrument({
        proposalPks: createdProposalPk1,
      });

      cy.contains(proposal1.title)
        .parent()
        .should('contain', unsuccessfulStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');
    });

    it('Scientist cannot change status or instrument when the status is expired', function () {
      /*
      Status and instrument are uneditable when there is an instrument
      */
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: expiredStatus.id as number,
      });

      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .should('contain', expiredStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .should('contain', instrument1.name)
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');

      /*
      Status and instrument are uneditable when there is no instrument
      */
      cy.removeProposalsFromInstrument({
        proposalPks: createdProposalPk1,
      });

      cy.contains(proposal1.title)
        .parent()
        .should('contain', expiredStatus.name)
        .find('[data-cy="status-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');
    });

    it('Scientist can only change to specific statuses and cannot assign an instrument when the current status is submitted', function () {
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: submittedStatus.id as number,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      cy.get('[role="listbox"]')
        .contains(submittedStatus.name)
        .should('be.selected');

      cy.get('[role="listbox"]').contains(draftStatus.name).should('not.exist');

      cy.get('[role="listbox"]')
        .contains(underReviewStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(approvedStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(unsuccessfulStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(expiredStatus.name)
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');
    });

    it('Scientist can only change to specific statuses when the current status is under review', function () {
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: underReviewStatus.id as number,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      cy.get('[role="listbox"]')
        .contains(underReviewStatus.name)
        .should('be.selected');

      /*
      Without instrument assigned
      */
      cy.get('[role="listbox"]').contains(draftStatus.name).should('not.exist');

      // There is no instrument so approved is disabled
      cy.get('[role="listbox"]')
        .contains(approvedStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(unsuccessfulStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(expiredStatus.name)
        .should('not.exist');

      /*
      With instrument assigned
      */
      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.reload();

      // Instrument can be changed
      cy.contains(proposal1.title)
        .parent()
        .should('contain', instrument1.name)
        .find('[data-cy="instrument-dropdown"]')
        .should('exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      cy.get('[role="listbox"]').contains(draftStatus.name).should('not.exist');

      // Approved is no longer disabled
      cy.get('[role="listbox"]')
        .contains(approvedStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(unsuccessfulStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(expiredStatus.name)
        .should('not.exist');
    });

    it('Scientist can only change to specific statuses when the current status is approved', function () {
      cy.changeProposalsStatus({
        proposalPks: createdProposalPk1,
        statusId: approvedStatus.id as number,
      });

      cy.assignProposalsToInstruments({
        proposalPks: createdProposalPk1,
        instrumentIds: createdInstrumentId1,
      });

      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title)
        .parent()
        .should('contain', instrument1.name)
        .find('[data-cy="instrument-dropdown"]')
        .should('not.exist');

      cy.contains(proposal1.title)
        .parent()
        .find('[data-cy="status-dropdown"]')
        .click();

      cy.get('[role="listbox"]')
        .contains(approvedStatus.name)
        .should('be.selected');

      cy.get('[role="listbox"]').contains(draftStatus.name).should('not.exist');

      cy.get('[role="listbox"]')
        .contains(underReviewStatus.name)
        .should('have.attr', 'aria-disabled', 'true');

      cy.get('[role="listbox"]')
        .contains(finishedStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(unsuccessfulStatus.name)
        .should('not.be.disabled');

      cy.get('[role="listbox"]')
        .contains(expiredStatus.name)
        .should('not.exist');
    });
  });
});
