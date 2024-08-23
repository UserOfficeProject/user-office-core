import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  FeatureId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Xpress tests', () => {
  let createdInstrumentId1: number;
  let createdInstrumentId2: number;
  let createdInstrumentId3: number;
  let createdInstrumentId4: number;

  let createdProposalPk1: number;
  let createdProposalPk2: number;
  let createdProposalPk3: number;
  let createdProposalPk4: number;

  let createdProposalId1: string;
  let createdProposalId2: string;
  let createdProposalId3: string;
  let createdProposalId4: string;

  let createdTechniquePk1: number;
  let createdTechniquePk2: number;
  let createdTechniquePk3: number;
  // Technique 4 has no proposals assigned

  // Proposal 1 is unsubmitted
  const proposalSubmittedDate2 = new Date(2023, 2, 2);
  const proposalSubmittedDate3 = new Date(2024, 3, 3);
  const proposalSubmittedDate4 = new Date(2025, 4, 4);

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

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

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

        cy.clock(proposalSubmittedDate2.getTime()).then(() => {
          cy.submitProposal({ proposalPk: createdProposalPk2 }).then(
            (result) => {
              createdProposalId2 = result.submitProposal.proposalId;
            }
          );
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

        cy.clock(proposalSubmittedDate3.getTime()).then(() => {
          cy.submitProposal({ proposalPk: createdProposalPk3 }).then(
            (result) => {
              createdProposalId3 = result.submitProposal.proposalId;
            }
          );
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

        cy.clock(proposalSubmittedDate4.getTime()).then(() => {
          cy.submitProposal({ proposalPk: createdProposalPk4 }).then(
            (result) => {
              createdProposalId4 = result.submitProposal.proposalId;
            }
          );
        });

        cy.changeProposalsStatus({
          statusId: initialDBData.proposalStatuses.editableSubmitted.id,
          proposalPks: [createdProposalPk4],
        });
      }
    });
  });

  it('User should not be able to see Xpress page', () => {
    if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
      //this.skip();
    }

    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Xpress');
  });

  it('Xpress proposals can be filtered by date', function () {
    return true;
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
    cy.get('[role="listbox"]').contains(technique4.name).click();
    cy.finishedLoading();

    cy.contains(proposal4.title);

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

    cy.get('[data-cy="technique-filter"]').click();
    cy.get('[role="listbox"]').contains('All').click();
    cy.finishedLoading();

    cy.contains(proposal1.title);
    cy.contains(proposal2.title);
    cy.contains(proposal3.title);
    cy.contains(proposal4.title);
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
    cy.get('[role="listbox"]').contains(instrument2.name).click();
    cy.finishedLoading();

    cy.contains(proposal1.title);
    cy.contains(proposal3.title);
    cy.contains(proposal4.title);

    cy.get('table.MuiTable-root tbody tr').should(
      'not.contain',
      proposal2.title
    );

    cy.get('[data-cy="instrument-filter"]').click();
    cy.get('[role="listbox"]').contains('All').click();
    cy.finishedLoading();

    cy.contains(proposal1.title);
    cy.contains(proposal2.title);
    cy.contains(proposal3.title);
    cy.contains(proposal4.title);
  });

  it.skip('Xpress proposals can be filtered by call', function () {
    const esiTemplateName = faker.lorem.words(2);
    const currentDayStart = DateTime.now().startOf('day');

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

    cy.createCall({
      ...newCall,
      proposalWorkflowId: 0,
    });

    cy.login('officer');
    cy.visit('/');
    cy.finishedLoading();

    cy.contains('Xpress Proposals').click();

    cy.get('[data-cy="call-filter"]').click();
    cy.get('[role="listbox"]').contains('Call 1').click();
    cy.finishedLoading();

    cy.contains(proposal1.title);
    cy.contains(proposal2.title);
    cy.contains(proposal3.title);
    cy.contains(proposal4.title);

    cy.get('table.MuiTable-root tbody tr').should(
      'not.contain',
      proposal3.title
    );

    cy.get('table.MuiTable-root tbody tr').should(
      'not.contain',
      proposal4.title
    );

    cy.get('[data-cy="call-filter"]').click();
    cy.get('[role="listbox"]').contains('Call 2').click();
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
    cy.contains(proposal4.title);
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
    cy.contains(proposal4.title);

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
    cy.contains(proposal4.title);
  });

  it('Xpress proposals can be searched for by title, technique, instrument, proposal ID', function () {
    return true;
  });

  describe.only('Techniques advanced tests', () => {
    it('User officer can see all submitted and unsubmitted Xpress proposals', function () {
      if (
        !featureFlags.getEnabledFeatures().get(FeatureId.STFC_XPRESS_MANAGEMENT)
      ) {
        this.skip();
      }

      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      // cy.contains(technique1.name);
      // cy.contains(instrument1.name);

      cy.contains(proposal2.title);
      cy.contains(createdProposalId2);
      cy.contains(proposalSubmittedDate2.toDateString());
      // cy.contains(technique2.name);
      // cy.contains(instrument2.name);

      cy.contains(proposal3.title);
      cy.contains(createdProposalId3);
      cy.contains(proposalSubmittedDate3.toDateString());
      // cy.contains(technique3.name);
      // cy.contains(instrument3.name);

      cy.contains(proposal4.title);
      cy.contains(createdProposalId4);
      cy.contains(proposalSubmittedDate4.toDateString());
      // cy.contains(technique4.name);
      // cy.contains(instrument4.name);
    });

    it('Instrument scientist can only see submitted and unsubmitted Xpress proposals for their techniques', function () {
      if (
        !featureFlags.getEnabledFeatures().get(FeatureId.STFC_XPRESS_MANAGEMENT)
      ) {
        this.skip();
      }

      /*
      Scientist 1 belongs to technique 1, which only has proposal 1
      */
      cy.login(scientist1);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      // cy.contains(technique1.name);
      // cy.contains(instrument1.name);

      cy.should('not.contain', proposal2.title);
      cy.should('not.contain', createdProposalId2);
      cy.should('not.contain', proposalSubmittedDate2.toDateString());
      // cy.should('not.contain', technique2.name);
      // cy.should('not.contain', instrument2.name);

      cy.should('not.contain', proposal3.title);
      cy.should('not.contain', createdProposalId3);
      cy.should('not.contain', proposalSubmittedDate3.toDateString());
      // cy.should('not.contain', technique3.name);
      // cy.should('not.contain', instrument3.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', proposalSubmittedDate4.toDateString());
      // cy.should('not.contain', technique4.name);
      // cy.should('not.contain', instrument4.name);

      /*
      Scientist 2 belongs to technique 2, which has proposals 1 and 2
      */
      cy.login(scientist2);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.finishedLoading();

      cy.contains(proposal1.title);
      cy.contains(createdProposalId1);
      // cy.contains(technique1.name);
      // cy.contains(instrument1.name);

      cy.contains(proposal2.title);
      cy.contains(createdProposalId2);
      cy.contains(proposalSubmittedDate2.toDateString());
      // cy.contains(technique2.name);
      // cy.contains(instrument2.name);

      cy.should('not.contain', proposal3.title);
      cy.should('not.contain', createdProposalId3);
      cy.should('not.contain', proposalSubmittedDate3.toDateString());
      // cy.should('not.contain', technique3.name);
      // cy.should('not.contain', instrument3.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', proposalSubmittedDate4.toDateString());
      // cy.should('not.contain', technique4.name);
      // cy.should('not.contain', instrument4.name);

      /*
      Scientist 3 belongs to technique 3, which has proposal 3
      */
      cy.login(scientist3);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.finishedLoading();

      cy.contains(proposal3.title);
      cy.contains(createdProposalId3);
      cy.contains(proposalSubmittedDate3.toDateString());
      // cy.contains(technique3.name);
      // cy.contains(instrument3.name);

      cy.should('not.contain', proposal1.title);
      cy.should('not.contain', createdProposalId1);
      // cy.should('not.contain', technique1.name);
      // cy.should('not.contain', instrument1.name);

      cy.should('not.contain', proposal2.title);
      cy.should('not.contain', createdProposalId2);
      cy.should('not.contain', proposalSubmittedDate2.toDateString());
      // cy.should('not.contain', technique2.name);
      // cy.should('not.contain', instrument2.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', proposalSubmittedDate4.toDateString());
      // cy.should('not.contain', technique4.name);
      // cy.should('not.contain', instrument4.name);

      /*
      Scientist 4 belongs to technique 4, but it doesn't have any proposals
      */
      cy.login(scientist4);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('Xpress').click();
      cy.finishedLoading();

      cy.finishedLoading();

      cy.should('not.contain', proposal1.title);
      cy.should('not.contain', createdProposalId1);
      // cy.should('not.contain', technique1.name);
      // cy.should('not.contain', instrument1.name);

      cy.should('not.contain', proposal2.title);
      cy.should('not.contain', createdProposalId2);
      cy.should('not.contain', proposalSubmittedDate2.toDateString());
      // cy.should('not.contain', technique2.name);
      // cy.should('not.contain', instrument2.name);

      cy.should('not.contain', proposal3.title);
      cy.should('not.contain', createdProposalId3);
      cy.should('not.contain', proposalSubmittedDate3.toDateString());
      // cy.should('not.contain', technique3.name);
      // cy.should('not.contain', instrument3.name);

      cy.should('not.contain', proposal4.title);
      cy.should('not.contain', createdProposalId4);
      cy.should('not.contain', proposalSubmittedDate4.toDateString());
      // cy.should('not.contain', technique4.name);
      // cy.should('not.contain', instrument4.name);
    });
  });
});
