import {
  FeatureId,
  ProposalEndStatus,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Experiments tests', () => {
  const instrumentScientist1 = initialDBData.users.instrumentScientist1;

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
    cy.createExperimentSafety({
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
      cy.contains('1-2 of 2');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 1').click();
      cy.contains('1-2 of 2');
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

    it('Can view visits', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.finishedLoading();

      cy.get('[data-cy=officer-scheduled-events-table] Table button')
        .first()
        .click();
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });
      cy.contains(initialDBData.users.user1.lastName);
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
      cy.get('button[role="tab"]').contains('Visit').click({ force: true });
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
            cy.reload();
          }
        });
    });

    it('Instrument Scientists should be able to see Experiments only associated with their instruments', () => {
      cy.login(instrumentScientist1);
      cy.visit('/experiments');
      cy.finishedLoading();

      // There should be a div with data-cy experiments-table, which will contain table inside it
      cy.get('[data-cy=experiments-table]').should('exist');

      // Wait for the table to load with data
      cy.get('[data-cy=experiments-table] table tbody tr').should(
        'have.length.at.least',
        1
      );

      // Inside the table, there should be a column with title "Instrument"
      cy.get('[data-cy=experiments-table] table thead th')
        .contains('Instrument')
        .should('exist');

      // This column should only contains with value Instrument 1. Make sure you check only against that column and not others
      // Make sure the table is fully loaded by checking that data exists
      cy.get('[data-cy=experiments-table] table tbody tr td').should('exist');

      // Get the header row and find the Instrument column index
      cy.get('[data-cy=experiments-table] table thead tr th').then(
        ($headers) => {
          const headers = Array.from($headers).map((header) =>
            Cypress.$(header).text().trim()
          );
          const instrumentColumnIndex = headers.findIndex(
            (header) => header === 'Instrument'
          );

          cy.log(`Found headers: ${JSON.stringify(headers)}`);
          cy.log(`Instrument column index: ${instrumentColumnIndex}`);

          // Verify we found the column
          expect(instrumentColumnIndex).to.be.greaterThan(-1);

          // Now check all rows in the table body for this specific column
          // Use a more robust approach that re-queries the DOM each time
          cy.get('[data-cy=experiments-table] table tbody tr').then(($rows) => {
            const rowCount = $rows.length;
            for (let i = 0; i < rowCount; i++) {
              cy.get('[data-cy=experiments-table] table tbody tr')
                .eq(i)
                .find('td')
                .eq(instrumentColumnIndex)
                .should('contain.text', 'Instrument 1');
            }
          });
        }
      );
    });

    it('Should display error when trying to change status of experiment without experimentSafety', () => {
      // NOTE: The beforeEach creates experimentSafety only for the "upcoming" experiment
      // This test should find an experiment without experimentSafety and try to change its status

      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      // Remove date filter to show all experiments
      cy.get('[value=NONE]').click();
      cy.finishedLoading();

      // Find the table and count rows - should have multiple experiments
      cy.get('[data-cy=experiments-table] table tbody tr').should(
        'have.length.at.least',
        1
      );

      // Get all experiment rows and find one that shows "ESF Not Started" status
      // These are experiments without experimentSafety
      cy.get('[data-cy=experiments-table] table tbody tr').then(($rows) => {
        // Look for a row with "ESF Not Started" status
        let selectedRowIndex = -1;
        $rows.each((index, row) => {
          const cells = Cypress.$(row).find('td');
          const statusCell = cells.eq(5); // Experiment Safety Status column
          if (statusCell.text().includes('ESF Not Started')) {
            selectedRowIndex = index;

            return false; // break
          }
        });

        // If we found a row with ESF Not Started, select it
        if (selectedRowIndex !== -1) {
          cy.get('[data-cy=experiments-table] input[type="checkbox"]')
            .eq(selectedRowIndex + 1) // +1 because first row is header
            .check({ force: true });
          cy.finishedLoading();

          // Click on the change status button
          cy.get('[data-cy=change-experiment-safety-status]').click();
          cy.finishedLoading();

          // Check for the error notification
          cy.notification({
            variant: 'error',
            text: /Cannot change status\. Some or all selected experiments do not have required safety information\./,
          });
        } else {
          // If no experiment without ESF was found, skip this test
          cy.log('No experiment without experimentSafety found');
        }
      });
    });

    it('User officer should see experiment status as a clickable link', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.finishedLoading();

      // Find the status column cell that contains ESF text and verify it's clickable
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .find('a, button')
        .should('exist')
        .and('include.text', 'ESF');
    });

    it('Instrument scientist should see experiment status as plain text, not clickable', () => {
      cy.login('instrumentScientist1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // Find the status column cell and verify it has no clickable elements
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .then(($cell) => {
          // Should contain ESF text
          cy.wrap($cell).should('include.text', 'ESF');
          // Should NOT have any clickable links or buttons
          cy.wrap($cell).find('a, button').should('not.exist');
        });
    });

    it('User officer should be able to open and change experiment safety status', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.finishedLoading();

      // Click on the status cell (which should be clickable for officer)
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .find('a, button')
        .click();
      cy.finishedLoading();

      // Verify the modal opened with the workflow tree
      cy.get('[role="presentation"]').should(
        'contain',
        'Change experiment(s) safety status'
      );
      cy.get('.MuiDialogContent-root').should('exist');

      // Verify the status selection dropdown exists and is enabled
      cy.get('#selectedWorkflowStatusId-input').should(
        'not.have.class',
        'Mui-disabled'
      );
    });

    it('Instrument scientist should not be able to click on status to open change status modal', () => {
      cy.login('instrumentScientist1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // The status cell should be plain text (no clickable elements)
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .then(($cell) => {
          // Verify it's not a button or link
          cy.wrap($cell).find('a, button').should('not.exist');
        });

      // Verify the change status modal is NOT present (check for specific modal title)
      cy.contains('Change experiment(s) safety status').should('not.exist');
    });

    it('Instrument scientist should not see change status button in toolbar', () => {
      cy.login('instrumentScientist1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // Non-officers don't have checkboxes, so the change status button should not exist
      cy.get('[data-cy=change-experiment-safety-status]').should('not.exist');
    });

    it('Experiment safety reviewer should see experiment status as plain text, not clickable', () => {
      cy.login('experimentSafetyReviewer1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // Find the status column cell and verify it has no clickable elements
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .then(($cell) => {
          // Should contain ESF text
          cy.wrap($cell).should('include.text', 'ESF');
          // Should NOT have any clickable links or buttons
          cy.wrap($cell).find('a, button').should('not.exist');
        });
    });

    it('Experiment safety reviewer should not be able to click on status to open change status modal', () => {
      cy.login('experimentSafetyReviewer1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // The status cell should be plain text (no clickable elements)
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .then(($cell) => {
          // Verify it's not a button or link
          cy.wrap($cell).find('a, button').should('not.exist');
        });

      // Verify the change status modal is NOT present (check for specific modal title)
      cy.contains('Change experiment(s) safety status').should('not.exist');
    });

    it('Experiment safety reviewer should not see change status button in toolbar', () => {
      cy.login('experimentSafetyReviewer1');
      cy.visit('/experiments');
      cy.finishedLoading();

      // Non-officers don't have checkboxes, so the change status button should not exist
      cy.get('[data-cy=change-experiment-safety-status]').should('not.exist');
    });

    it('User officer should see status action logs after changing experiment status', () => {
      cy.login('officer');
      cy.visit('/experiments');
      cy.finishedLoading();

      // Click the status link to open the change status modal
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .contains('ESF')
        .closest('td')
        .find('a, button')
        .click({ force: true });
      cy.finishedLoading();

      // Modal for changing status should appear
      cy.contains('Change experiment(s) safety status').should('exist');

      // Click the status selection dropdown and select the second status (which has status actions)
      cy.get('[data-cy=status-selection]').should('exist');

      // Find the input field within the autocomplete component and click it
      cy.get('[data-cy=status-selection] input').click();

      // Wait for the dropdown to appear and select the second option
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').eq(1).click();

      // Check the "Run status actions" checkbox so the email and RabbitMQ
      // status actions are executed (otherwise no status action logs are created).
      // The data-cy is on the MUI wrapper span, so target the inner input.
      cy.get('[data-cy=run-status-actions-checkbox] input').check({
        force: true,
      });

      // When more than one incoming connection has actions, a transition must be selected.
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy=connection-selection]').length) {
          cy.get('[data-cy=connection-selection]').click();
          cy.get('[role="option"]').first().click();
        }
      });

      // Click submit button to change status
      cy.get('[data-cy=submit-experiment-status-change]').click();
      cy.finishedLoading();

      // Verify success notification
      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      // Wait for modal to close
      cy.contains('Change experiment(s) safety status').should('not.exist');
      cy.finishedLoading();

      // Now open experiment details to check the logs
      cy.get('[data-cy=experiments-table] tbody tr')
        .first()
        .find('[data-cy=view-experiment]')
        .click();
      cy.finishedLoading();

      // Experiment details modal should be open
      cy.get('[role="presentation"]').should('exist');

      // Click on the Logs tab
      cy.get('[role="tab"]').contains(/Logs/i).should('exist').click();
      cy.finishedLoading();

      // Verify that event logs table is displayed
      cy.get('[data-cy="event-logs-table"]').should('exist');

      // Verify the logs are not empty and contain status action entries
      cy.get('[data-cy="event-logs-table"] tbody tr').should(
        'have.length.at.least',
        1
      );

      // Verify the logs contain the expected status action messages
      cy.get('[data-cy="event-logs-table"]')
        .invoke('text')
        .then((tableText) => {
          // Should contain email status action log entries
          // The logs show: Email successfully sent template: [template-name] to: [email] recipient: [recipient-type]
          expect(tableText).to.contain('Email successfully sent template');
          // Should also contain RabbitMQ action log entries
          // The logs show: RabbitMQ message successfully sent
          expect(tableText).to.contain('Experiment event successfully sent');
        });
    });
  });
});
