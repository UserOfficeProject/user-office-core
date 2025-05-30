import {
  FeatureId,
  ProposalEndStatus,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Experiments tests', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (
        !featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER) ||
        !featureFlags
          .getEnabledFeatures()
          .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
      ) {
        this.skip();
      }
    });

    cy.viewport(1920, 1080);

    cy.updateProposalManagementDecision({
      proposalPk: initialDBData.proposal.id,
      finalStatus: ProposalEndStatus.ACCEPTED,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
      managementDecisionSubmitted: true,
    });
    cy.createOrGetExperimentSafety({
      experimentPk: initialDBData.experiments.upcoming.experimentPk,
    });
    cy.createVisit({
      experimentPk: initialDBData.experiments.upcoming.experimentPk,
      team: [
        initialDBData.users.user1.id,
        initialDBData.users.user2.id,
        initialDBData.users.user3.id,
      ],
      teamLeadUserId: initialDBData.users.user1.id,
    });
  });

  describe('Experiments tests', () => {
    it('Can filter by call and instrument', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.finishedLoading();
      cy.get('button[value=NONE]').click();

      cy.get('[data-cy=call-filter]').click();
      cy.get('[role=presentation]').contains('call 1').click();
      cy.contains('1-4 of 4');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 3').click();
      cy.contains('0-0 of 0');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 2').click();
      cy.contains('1-1 of 1');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 1').click();
      cy.contains('1-3 of 3');
    });

    it('Can filter by date', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();

      cy.get('[value=TODAY]').click();
      cy.contains('0-0 of 0');

      cy.get('[value=NONE]').click();
      cy.contains('1-4 of 4');
    });

    it('Can view Experiment Safety', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.get('[data-cy=officer-scheduled-events-table]')
        .contains('View Experiment Safety')
        .click();
      cy.get('[role=dialog]').contains(initialDBData.proposal.title);
    });

    it('Can view visits', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.finishedLoading();

      cy.get('[data-cy=officer-scheduled-events-table] Table button')
        .first()
        .click();
      cy.get('[data-cy=officer-scheduled-events-table]').contains(
        initialDBData.users.user1.lastName
      );
    });

    it('All the columns in visit table are sortable', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.finishedLoading();

      cy.get('[data-cy=officer-scheduled-events-table] Table button')
        .first()
        .click();

      let tableValue: string[] = [];
      cy.get('[data-cy=visit-registrations-table] tbody td')
        .each(($el) => {
          tableValue = [...tableValue, $el.text().toString()];
        })
        .then(() => {
          // Explanation: The table has 7 columns. We will sort each column in ascending and descending order and check if the table is sorted correctly.
          // tableColumns: Array of objects. Each object contains the title of the column and the data of the column in original, ascending and descending order.
          const tableColumns = [
            {
              title: 'Actions',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 0),
                asc: tableValue.filter((d, i) => i % 6 === 0),
                desc: tableValue.filter((d, i) => i % 6 === 0),
              },
            },
            {
              title: 'Status',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 1),
                asc: tableValue.filter((d, i) => i % 6 === 1).sort(),
                desc: tableValue
                  .filter((d, i) => i % 6 === 1)
                  .sort()
                  .reverse(),
              },
            },
            {
              title: 'Visitor name',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 2),
                asc: tableValue.filter((d, i) => i % 6 === 2).sort(),
                desc: tableValue
                  .filter((d, i) => i % 6 === 2)
                  .sort()
                  .reverse(),
              },
            },
            {
              title: 'Teamleader',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 3),
                asc: tableValue.filter((d, i) => i % 6 === 3).sort(),
                desc: tableValue
                  .filter((d, i) => i % 6 === 3)
                  .sort()
                  .reverse(),
              },
            },
            {
              title: 'Visit start',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 4),
                asc: tableValue.filter((d, i) => i % 6 === 4).sort(),
                desc: tableValue
                  .filter((d, i) => i % 6 === 4)
                  .sort()
                  .reverse(),
              },
            },
            {
              title: 'Visit end',
              data: {
                original: tableValue.filter((d, i) => i % 6 === 5),
                asc: tableValue.filter((d, i) => i % 6 === 5).sort(),
                desc: tableValue
                  .filter((d, i) => i % 6 === 5)
                  .sort()
                  .reverse(),
              },
            },
          ];

          // Sort each column in ascending and descending order and check if the table is sorted correctly.
          for (let i = 0; i < tableColumns.length; i++) {
            cy.get('[data-cy=visit-registrations-table] thead th')
              .contains(tableColumns[i].title)
              .click();

            // Check if the table is sorted in ascending order
            cy.get('[data-cy=visit-registrations-table] tbody td').each(
              ($el, index) => {
                if (index % 6 === i) {
                  expect($el.text()).to.eq(
                    tableColumns[i].data.asc[Math.floor(index / 6)]
                  );
                }
              }
            );

            // Check if the table is sorted in descending order
            cy.get('[data-cy=visit-registrations-table] thead th')
              .contains(tableColumns[i].title)
              .click();

            cy.get('[data-cy=visit-registrations-table] tbody td').each(
              ($el, index) => {
                if (index % 6 === i) {
                  expect($el.text()).to.eq(
                    tableColumns[i].data.desc[Math.floor(index / 6)]
                  );
                }
              }
            );

            // Check if the table is sorted in original order
            cy.get('[data-cy=visit-registrations-table] thead th')
              .contains(tableColumns[i].title)
              .click();

            cy.get('[data-cy=visit-registrations-table] tbody td').each(
              ($el, index) => {
                if (index % 6 === i) {
                  expect($el.text()).to.eq(
                    tableColumns[i].data.original[Math.floor(index / 6)]
                  );
                }
              }
            );

            // Reset the table to original order. How? Click on Hide button first and Expand button then.
            cy.get('[data-cy=officer-scheduled-events-table] Table button')
              .first()
              .click()
              .click();
          }
        });
    });
  });
});
