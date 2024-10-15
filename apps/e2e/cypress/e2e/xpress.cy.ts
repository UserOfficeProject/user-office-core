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
  let createdTechniquePk5: number;
  // Technique 4 has no proposals assigned
  // Proposal 1 is unsubmitted

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
          statusId: initialDBData.proposalStatuses.editableSubmitted.id,
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
          statusId: initialDBData.proposalStatuses.editableSubmitted.id,
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
          statusId: initialDBData.proposalStatuses.expired.id,
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
      cy.get('[role="listbox"] [data-value="14"]').click();

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
      cy.get('[role="listbox"] [data-value="1"]').click();

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

    it.only('User officer able to select an instrument and assign to a proposal', function () {
      cy.login('officer');
      cy.changeActiveRole(initialDBData.roles.userOfficer);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      cy.contains(technique1.name);

      cy.contains(proposal1.title)
        .parent()
        .find('[aria-label="View proposal"]')
        .click();

      cy.get('[data-cy="technique-filter"]').click();
      cy.get('[role="listbox"]').contains(technique1.name).click();
      cy.finishedLoading();

      cy.screenshot('screen');
    });
  });
});
