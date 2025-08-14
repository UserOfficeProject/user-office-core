import { faker } from '@faker-js/faker';
import {
  FeatureId,
  TemplateGroupId,
  WorkflowType,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

// Test Constants
const TEST_CONSTANTS = {
  // Workflow Status IDs
  WORKFLOW_STATUS: {
    INITIAL: 17,
    IS_REVIEW: 18,
    ESR_REVIEW: 19,
    APPROVED: 21,
  },

  // Sort Orders
  SORT_ORDER: {
    FIRST: 1,
    SECOND: 2,
  },

  // Events
  EVENTS: {
    ESF_SUBMITTED: 'EXPERIMENT_ESF_SUBMITTED',
    ESF_APPROVED_BY_IS: 'EXPERIMENT_ESF_APPROVED_BY_IS',
    ESF_APPROVED_BY_ESR: 'EXPERIMENT_ESF_APPROVED_BY_ESR',
  },

  // Status Labels
  STATUS_LABELS: {
    ESF_IS_REVIEW: 'ESF IS REVIEW',
    ESF_ESR_REVIEW: 'ESF ESR REVIEW',
    ESF_APPROVED: 'ESF APPROVED',
  },

  // Form Values - can be configured for different test scenarios
  FORM_VALUES: {
    // Use static values for tests that need to validate the exact content
    DATE: '01-10-2023',
    INTERVAL_MIN: '10',
    INTERVAL_MAX: '20',
    NUMBER_VALUE: '5',
    RICH_TEXT: 'This is a rich text input for testing',
    TEXT_INPUT: 'This is a text input for testing',
    MANAGEMENT_TIME: '20',
    SELECTION_OPTION: 'One',
    PROPOSAL_STATUS: 'Accepted',
    DECISION_ACCEPTED: 'ACCEPTED',

    // Randomized versions available via getters for tests that don't need validation
    get RANDOM_DATE() {
      return faker.date.future().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    get RANDOM_INTERVAL_MIN() {
      return faker.number.int({ min: 5, max: 15 }).toString();
    },
    get RANDOM_INTERVAL_MAX() {
      return faker.number.int({ min: 16, max: 30 }).toString();
    },
    get RANDOM_NUMBER_VALUE() {
      return faker.number.int({ min: 1, max: 10 }).toString();
    },
    get RANDOM_RICH_TEXT() {
      return faker.lorem.sentence();
    },
    get RANDOM_TEXT_INPUT() {
      return faker.lorem.words(3);
    },
    get RANDOM_MANAGEMENT_TIME() {
      return faker.number.int({ min: 10, max: 50 }).toString();
    },
  },

  // Expected display values for validation
  EXPECTED_DISPLAY: {
    get INTERVAL_RANGE() {
      return `${TEST_CONSTANTS.FORM_VALUES.INTERVAL_MIN} – ${TEST_CONSTANTS.FORM_VALUES.INTERVAL_MAX} m`;
    },
    get NUMBER_WITH_UNIT() {
      return `${TEST_CONSTANTS.FORM_VALUES.NUMBER_VALUE} m`;
    },
    BOOLEAN_YES: 'Yes',
  },

  // UI Labels and Messages
  UI_LABELS: {
    UPCOMING_EXPERIMENTS: 'Upcoming experiments',
    DOWNLOAD_SAFETY_DOCUMENT: 'Download Safety Review Document',
    EXPERIMENT_SAFETY_FORM: 'Experiment Safety Form',
    EXPERIMENT_SAFETY_REVIEW: 'Experiment Safety Review',
    PROPOSALS: 'Proposals',
    ADMIN: 'Admin',
    SAVE_CONTINUE: 'Save and continue',
    SUBMIT: 'Submit',
    OK: 'OK',
    CLOSE: 'Close',
  },

  // Experiment Data
  EXPERIMENT: {
    ID: '000001',
  },

  // Comments for different scenarios
  COMMENTS: {
    get IS_APPROVAL() {
      return `Approved by Instrument Scientist - ${faker.lorem.sentence()}`;
    },
    get ESR_APPROVAL() {
      return `Approved by Experiment Safety Reviewer - ${faker.lorem.sentence()}`;
    },
    get IS_WORKFLOW() {
      return `IS approval for status change test - ${faker.lorem.sentence()}`;
    },
    get ESR_WORKFLOW() {
      return `ESR approval for status change test - ${faker.lorem.sentence()}`;
    },
    get CROSS_ROLE_IS() {
      return `IS approval first - should not be decisive in ESR workflow - ${faker.lorem.sentence()}`;
    },
    get CROSS_ROLE_ESR() {
      return `ESR approval - this should be decisive in ESR workflow - ${faker.lorem.sentence()}`;
    },
  },

  // Sample ESI confirmation text
  SAMPLE_ESI_CONFIRMATION:
    'I hereby confirm that all of the entered information regarding the sample is correct',
};

const instrumentScientist1 = initialDBData.users.instrumentScientist1;

function createWorkflowForInstrumentScientist() {
  const workflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
    entityType: WorkflowType.EXPERIMENT,
  };

  return cy.createWorkflow(workflow).then((createWorkflowResult) => {
    if (createWorkflowResult.createWorkflow) {
      const workflowData = createWorkflowResult.createWorkflow;

      return cy
        .addWorkflowStatus({
          droppableGroupId: workflowData.workflowConnectionGroups[0].groupId,
          statusId: TEST_CONSTANTS.WORKFLOW_STATUS.IS_REVIEW,
          workflowId: workflowData.id,
          sortOrder: TEST_CONSTANTS.SORT_ORDER.FIRST,
          prevStatusId: TEST_CONSTANTS.WORKFLOW_STATUS.INITIAL,
        })
        .then((result) => {
          if (result.addWorkflowStatus) {
            return cy
              .addStatusChangingEventsToConnection({
                workflowConnectionId: result.addWorkflowStatus.id,
                statusChangingEvents: [TEST_CONSTANTS.EVENTS.ESF_SUBMITTED],
              })
              .then(() => {
                return cy
                  .addWorkflowStatus({
                    droppableGroupId:
                      workflowData.workflowConnectionGroups[0].groupId,
                    statusId: TEST_CONSTANTS.WORKFLOW_STATUS.APPROVED,
                    workflowId: workflowData.id,
                    sortOrder: TEST_CONSTANTS.SORT_ORDER.SECOND,
                    prevStatusId: TEST_CONSTANTS.WORKFLOW_STATUS.IS_REVIEW,
                  })
                  .then((secondResult) => {
                    if (secondResult.addWorkflowStatus) {
                      return cy
                        .addStatusChangingEventsToConnection({
                          workflowConnectionId:
                            secondResult.addWorkflowStatus.id,
                          statusChangingEvents: [
                            TEST_CONSTANTS.EVENTS.ESF_APPROVED_BY_IS,
                          ],
                        })
                        .then(() => {
                          return cy.wrap(workflowData.id);
                        });
                    }

                    return cy.wrap(workflowData.id);
                  });
              });
          }

          return cy.wrap(workflowData.id);
        });
    } else {
      throw new Error('Workflow creation failed');
    }
  });
}

function createWorkflowForESR() {
  const workflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
    entityType: WorkflowType.EXPERIMENT,
  };

  return cy.createWorkflow(workflow).then((createWorkflowResult) => {
    if (createWorkflowResult.createWorkflow) {
      const workflowData = createWorkflowResult.createWorkflow;

      return cy
        .addWorkflowStatus({
          droppableGroupId: workflowData.workflowConnectionGroups[0].groupId,
          statusId: TEST_CONSTANTS.WORKFLOW_STATUS.ESR_REVIEW,
          workflowId: workflowData.id,
          sortOrder: TEST_CONSTANTS.SORT_ORDER.FIRST,
          prevStatusId: TEST_CONSTANTS.WORKFLOW_STATUS.INITIAL,
        })
        .then((result) => {
          if (result.addWorkflowStatus) {
            return cy
              .addStatusChangingEventsToConnection({
                workflowConnectionId: result.addWorkflowStatus.id,
                statusChangingEvents: [TEST_CONSTANTS.EVENTS.ESF_SUBMITTED],
              })
              .then(() => {
                return cy
                  .addWorkflowStatus({
                    droppableGroupId:
                      workflowData.workflowConnectionGroups[0].groupId,
                    statusId: TEST_CONSTANTS.WORKFLOW_STATUS.APPROVED,
                    workflowId: workflowData.id,
                    sortOrder: TEST_CONSTANTS.SORT_ORDER.SECOND,
                    prevStatusId: TEST_CONSTANTS.WORKFLOW_STATUS.ESR_REVIEW,
                  })
                  .then((secondResult) => {
                    if (secondResult.addWorkflowStatus) {
                      return cy
                        .addStatusChangingEventsToConnection({
                          workflowConnectionId:
                            secondResult.addWorkflowStatus.id,
                          statusChangingEvents: [
                            TEST_CONSTANTS.EVENTS.ESF_APPROVED_BY_ESR,
                          ],
                        })
                        .then(() => {
                          return cy.wrap(workflowData.id);
                        });
                    }

                    return cy.wrap(workflowData.id);
                  });
              });
          }

          return cy.wrap(workflowData.id);
        });
    } else {
      throw new Error('Workflow creation failed');
    }
  });
}

// Helper function to approve proposal
function approveProposal() {
  cy.login('officer');
  cy.visit('/');
  cy.contains(TEST_CONSTANTS.UI_LABELS.PROPOSALS).click();
  cy.get('[data-cy=view-proposal]').click();
  cy.finishedLoading();
  cy.get('[role="dialog"]').contains(TEST_CONSTANTS.UI_LABELS.ADMIN).click();
  cy.get('[data-cy="proposal-final-status"]').should('exist');
  cy.get('[role="dialog"]').contains(TEST_CONSTANTS.UI_LABELS.ADMIN).click();
  cy.get('[data-cy="proposal-final-status"]').click();
  cy.get('li[data-cy="proposal-final-status-options"]')
    .contains(TEST_CONSTANTS.FORM_VALUES.PROPOSAL_STATUS)
    .click();
  cy.get(
    `[data-cy="managementTimeAllocation-${initialDBData.instrument1.id}"] input`
  )
    .clear()
    .type(TEST_CONSTANTS.FORM_VALUES.MANAGEMENT_TIME);
  cy.get('[data-cy="is-management-decision-submitted"]').click();
  cy.get('[data-cy="save-admin-decision"]').click();
  cy.notification({ variant: 'success', text: 'Saved' });
  cy.reload();
  cy.get('[data-cy="is-management-decision-submitted"] input').should(
    'have.value',
    'true'
  );
  cy.closeModal();
  cy.contains(TEST_CONSTANTS.FORM_VALUES.PROPOSAL_STATUS);
}

// Helper function to submit ESF by user
function submitESFByUser() {
  cy.login('user1');
  cy.visit('/');

  cy.contains(TEST_CONSTANTS.UI_LABELS.UPCOMING_EXPERIMENTS).should('exist');
  cy.contains(TEST_CONSTANTS.EXPERIMENT.ID).should('exist');
  cy.get('[data-cy=finish-experiment-safety-form-icon]').should('exist');
  cy.testActionButton('finish-experiment-safety-form-icon', 'active');
  cy.contains(TEST_CONSTANTS.EXPERIMENT.ID)
    .parent()
    .find('[data-cy=finish-experiment-safety-form-icon]')
    .click();

  // Fill Sample ESI
  cy.finishedLoading();
  cy.get('[data-cy=sample-esi-list]').should('exist');
  cy.get('[data-cy=sample-esi-list] li').should('have.length', 1);
  cy.get('[data-cy=sample-esi-list] li')
    .first()
    .contains(initialDBData.sample1.title);
  cy.get('[data-cy=sample-esi-list] li')
    .first()
    .find('input[type="checkbox"]')
    .should('not.be.checked')
    .click();

  cy.get('[role="dialog"]').within(() => {
    cy.get('input[name="sample_esi_boolean_question"]').should('exist').check();
    cy.get('input[name="sample_esi_date_question"]')
      .should('exist')
      .type(TEST_CONSTANTS.FORM_VALUES.DATE);
    cy.get('input[name="sample_esi_interval_question.min"]')
      .should('exist')
      .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MIN);
    cy.get('input[name="sample_esi_interval_question.max"]')
      .should('exist')
      .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MAX);
    cy.get('input[name="sample_esi_number_question.value"]')
      .should('exist')
      .type(TEST_CONSTANTS.FORM_VALUES.NUMBER_VALUE);
    cy.setTinyMceContent(
      'sample_esi_rich_text_input_question',
      TEST_CONSTANTS.FORM_VALUES.RICH_TEXT
    );
    cy.getTinyMceContent('sample_esi_rich_text_input_question').then(
      (content) =>
        expect(content).to.have.string(TEST_CONSTANTS.FORM_VALUES.RICH_TEXT)
    );

    cy.get('#sample_esi_selection_from_options_question').click();
  });

  cy.get(
    `li[data-value="${TEST_CONSTANTS.FORM_VALUES.SELECTION_OPTION}"]`
  ).click();
  cy.get('body').type('{esc}');

  cy.get('[role="dialog"]').within(() => {
    cy.get('input[name="sample_esi_text_input_question"]')
      .should('exist')
      .type(TEST_CONSTANTS.FORM_VALUES.TEXT_INPUT);

    cy.contains(TEST_CONSTANTS.UI_LABELS.SAVE_CONTINUE).scrollIntoView().click({
      force: true,
    });

    cy.get('span')
      .contains(TEST_CONSTANTS.SAMPLE_ESI_CONFIRMATION)
      .should('exist')
      .click();
    cy.contains(TEST_CONSTANTS.UI_LABELS.SUBMIT).click();
  });

  cy.get('[data-cy=sample-esi-list] li')
    .first()
    .find('input[type="checkbox"]')
    .should('be.checked');

  // Fill Proposal ESI
  cy.get('input[name="proposal_esi_boolean_question"]').should('exist').check();
  cy.get('input[name="proposal_esi_date_question"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.DATE);
  cy.get('input[name="proposal_esi_interval_question.min"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MIN);
  cy.get('input[name="proposal_esi_interval_question.max"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MAX);
  cy.get('input[name="proposal_esi_number_question.value"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.NUMBER_VALUE);
  cy.setTinyMceContent(
    'proposal_esi_rich_text_input_question',
    TEST_CONSTANTS.FORM_VALUES.RICH_TEXT
  );
  cy.getTinyMceContent('proposal_esi_rich_text_input_question').then(
    (content) =>
      expect(content).to.have.string(TEST_CONSTANTS.FORM_VALUES.RICH_TEXT)
  );

  cy.get('#proposal_esi_selection_from_options_question').click();
  cy.get(
    `li[data-value="${TEST_CONSTANTS.FORM_VALUES.SELECTION_OPTION}"]`
  ).click();
  cy.get('body').type('{esc}');
  cy.get('input[name="proposal_esi_text_input_question"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.TEXT_INPUT);

  cy.contains(TEST_CONSTANTS.UI_LABELS.SAVE_CONTINUE).scrollIntoView().click({
    force: true,
  });

  cy.contains(TEST_CONSTANTS.UI_LABELS.SUBMIT).click();
  cy.contains(TEST_CONSTANTS.UI_LABELS.OK).click();
}

// Helper function to fill experiment safety review
function fillExperimentSafetyReview() {
  cy.get('input[name="experiment_safety_review_boolean_question"]')
    .should('exist')
    .check();
  cy.get('input[name="experiment_safety_review_date_question"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.DATE);
  cy.get('input[name="experiment_safety_review_interval_question.min"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MIN);
  cy.get('input[name="experiment_safety_review_interval_question.max"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.INTERVAL_MAX);
  cy.get('input[name="experiment_safety_review_number_question.value"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.NUMBER_VALUE);
  cy.setTinyMceContent(
    'experiment_safety_review_rich_text_input_question',
    TEST_CONSTANTS.FORM_VALUES.RICH_TEXT
  );
  cy.getTinyMceContent(
    'experiment_safety_review_rich_text_input_question'
  ).then((content) =>
    expect(content).to.have.string(TEST_CONSTANTS.FORM_VALUES.RICH_TEXT)
  );

  cy.get('#experiment_safety_review_selection_from_options_question').click();
  cy.get(
    `li[data-value="${TEST_CONSTANTS.FORM_VALUES.SELECTION_OPTION}"]`
  ).click();
  cy.get('body').type('{esc}');
  cy.get('input[name="experiment_safety_review_text_input_question"]')
    .should('exist')
    .type(TEST_CONSTANTS.FORM_VALUES.TEXT_INPUT);

  cy.contains(TEST_CONSTANTS.UI_LABELS.SAVE_CONTINUE).scrollIntoView().click({
    force: true,
  });
}

context('Experiment Safety Review tests', () => {
  describe('Instrument Scientist Workflow Tests', () => {
    let workflowId: number;

    beforeEach(() => {
      cy.resetDB(true);

      cy.getAndStoreFeaturesEnabled().then(function () {
        if (
          !featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER) ||
          !featureFlags
            .getEnabledFeatures()
            .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
        ) {
          this.skip();
        }
      });

      createWorkflowForInstrumentScientist().then((id) => {
        workflowId = id;
        cy.updateCall({
          id: initialDBData.call.id,
          experimentWorkflowId: workflowId,
        });
      });

      cy.setActiveTemplate({
        templateGroupId: TemplateGroupId.EXPERIMENT_SAFETY_REVIEW,
        templateId: initialDBData.experimentSafetyReviewTemplate.id,
      });

      // Approve proposal for all tests
      approveProposal();
    });

    describe('User Experiment Safety Form Submission', () => {
      it('Should allow user to submit experiment safety form with sample and proposal ESI', () => {
        submitESFByUser();

        // Verify submission was successful
        cy.visit('/');
        cy.contains(TEST_CONSTANTS.UI_LABELS.UPCOMING_EXPERIMENTS).should(
          'exist'
        );
        cy.contains(TEST_CONSTANTS.EXPERIMENT.ID).should('exist');
        cy.get('[data-cy=finish-experiment-safety-form-icon]').should('exist');
        cy.testActionButton('finish-experiment-safety-form-icon', 'completed');
      });

      it('Should validate experiment status change after ESF submission', () => {
        submitESFByUser();

        // Instrument scientist should see status change to "ESF IS REVIEW"
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table').should('exist');
        cy.get('table tbody tr').should('have.length', 1);
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(1)
          .should('contain', TEST_CONSTANTS.EXPERIMENT.ID);
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', TEST_CONSTANTS.STATUS_LABELS.ESF_IS_REVIEW);
      });
    });

    describe('Instrument Scientist Review', () => {
      beforeEach(() => {
        submitESFByUser();
      });

      it('Should display submitted ESF data correctly for instrument scientist review', () => {
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();

        cy.get('[role="dialog"]')
          .contains(TEST_CONSTANTS.UI_LABELS.EXPERIMENT_SAFETY_FORM)
          .click();

        // Check sample ESI data
        cy.get('a')
          .contains(initialDBData.sample1.title)
          .should('exist')
          .click();

        cy.get('[role="dialog"]')
          .eq(1)
          .within(() => {
            cy.get('table').should('exist');
            cy.get('table')
              .contains('tr', 'Sample ESI Boolean question from seeds')
              .should('contain', TEST_CONSTANTS.EXPECTED_DISPLAY.BOOLEAN_YES);
            cy.get('table')
              .contains('tr', 'Sample ESI Date question from seeds')
              .should('contain', TEST_CONSTANTS.FORM_VALUES.DATE);
            cy.get('table')
              .contains('tr', 'Sample ESI Interval question from seeds')
              .should(
                'contain',
                TEST_CONSTANTS.EXPECTED_DISPLAY.INTERVAL_RANGE
              );
            cy.get('table')
              .contains('tr', 'Sample ESI Number question from seeds')
              .should(
                'contain',
                TEST_CONSTANTS.EXPECTED_DISPLAY.NUMBER_WITH_UNIT
              );
            cy.get('table')
              .contains('tr', 'Sample ESI Rich text input question from seeds')
              .should('contain', TEST_CONSTANTS.FORM_VALUES.RICH_TEXT);
            cy.get('table')
              .contains(
                'tr',
                'Sample ESI Selection from options question from seeds'
              )
              .should('contain', TEST_CONSTANTS.FORM_VALUES.SELECTION_OPTION);
            cy.get('table')
              .contains('tr', 'Sample ESI Text input question from seeds')
              .should('contain', TEST_CONSTANTS.FORM_VALUES.TEXT_INPUT);
            cy.get('button').contains(TEST_CONSTANTS.UI_LABELS.CLOSE).click();
          });

        // Check proposal ESI data
        cy.get('[data-cy="questionary-details-view"]').within(() => {
          cy.get('table').should('exist');
          cy.get('table')
            .contains('tr', 'Proposal ESI Boolean question from seeds')
            .should('contain', TEST_CONSTANTS.EXPECTED_DISPLAY.BOOLEAN_YES);
          cy.get('table')
            .contains('tr', 'Proposal ESI Date question from seeds')
            .should('contain', TEST_CONSTANTS.FORM_VALUES.DATE);
          cy.get('table')
            .contains('tr', 'Proposal ESI Interval question from seeds')
            .should('contain', TEST_CONSTANTS.EXPECTED_DISPLAY.INTERVAL_RANGE);
          cy.get('table')
            .contains('tr', 'Proposal ESI Number question from seeds')
            .should(
              'contain',
              TEST_CONSTANTS.EXPECTED_DISPLAY.NUMBER_WITH_UNIT
            );
          cy.get('table')
            .contains('tr', 'Proposal ESI Rich text input question from seeds')
            .should('contain', TEST_CONSTANTS.FORM_VALUES.RICH_TEXT);
          cy.get('table')
            .contains(
              'tr',
              'Proposal ESI Selection from options question from seeds'
            )
            .should('contain', TEST_CONSTANTS.FORM_VALUES.SELECTION_OPTION);
          cy.get('table')
            .contains('tr', 'Proposal ESI Text input question from seeds')
            .should('contain', TEST_CONSTANTS.FORM_VALUES.TEXT_INPUT);
        });
      });

      it('Should allow instrument scientist to fill experiment safety review form', () => {
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();

        cy.get('[role="dialog"]')
          .contains(TEST_CONSTANTS.UI_LABELS.EXPERIMENT_SAFETY_REVIEW)
          .click();

        fillExperimentSafetyReview();

        // Verify form completion
        cy.get('[data-cy="experiment-safety-review-make-decision"]').should(
          'exist'
        );
        cy.get('[data-cy="experiment-safety-review-comment"]').should('exist');
      });
    });

    describe('Instrument Scientist Decision Management', () => {
      beforeEach(() => {
        submitESFByUser();

        // Complete the safety review form
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();
        cy.get('[role="dialog"]').contains('Experiment Safety Review').click();
        fillExperimentSafetyReview();
      });

      it('Should enable download button when Instrument Scientist approves (IS workflow)', () => {
        // Initially download button should be disabled
        cy.contains(TEST_CONSTANTS.UI_LABELS.DOWNLOAD_SAFETY_DOCUMENT).should(
          'be.disabled'
        );

        // Accept the review as Instrument Scientist
        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get(
          `li[data-value="${TEST_CONSTANTS.FORM_VALUES.DECISION_ACCEPTED}"]`
        ).click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          TEST_CONSTANTS.COMMENTS.IS_APPROVAL
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains(TEST_CONSTANTS.UI_LABELS.OK).click();

        // Refresh the page to get the updated status after workflow processing
        cy.reload();

        // Download button should now be enabled (IS approval enables download in IS workflow)
        cy.contains(TEST_CONSTANTS.UI_LABELS.DOWNLOAD_SAFETY_DOCUMENT).should(
          'not.be.disabled'
        );
      });

      it('Should change experiment status to ESF APPROVED after Instrument Scientist approval (IS workflow)', () => {
        // Accept the review as Instrument Scientist
        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get(
          `li[data-value="${TEST_CONSTANTS.FORM_VALUES.DECISION_ACCEPTED}"]`
        ).click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          TEST_CONSTANTS.COMMENTS.IS_WORKFLOW
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains(TEST_CONSTANTS.UI_LABELS.OK).click();

        // Close modal and verify status
        cy.get('[data-cy="close-modal"]').click();
        cy.visit('/Experiments');
        cy.finishedLoading();

        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', TEST_CONSTANTS.STATUS_LABELS.ESF_APPROVED);
      });
    });
  });

  describe('Experiment Safety Reviewer Workflow Tests', () => {
    let workflowId: number;

    beforeEach(() => {
      cy.resetDB(true);

      cy.getAndStoreFeaturesEnabled().then(function () {
        if (
          !featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER) ||
          !featureFlags
            .getEnabledFeatures()
            .get(FeatureId.EXPERIMENT_SAFETY_REVIEW)
        ) {
          this.skip();
        }
      });

      createWorkflowForESR().then((id) => {
        workflowId = id;
        cy.updateCall({
          id: initialDBData.call.id,
          experimentWorkflowId: workflowId,
        });
      });

      cy.setActiveTemplate({
        templateGroupId: TemplateGroupId.EXPERIMENT_SAFETY_REVIEW,
        templateId: initialDBData.experimentSafetyReviewTemplate.id,
      });

      // Approve proposal for all tests
      approveProposal();
    });

    describe('User Experiment Safety Form Submission', () => {
      it('Should allow user to submit experiment safety form and change status to ESR REVIEW', () => {
        submitESFByUser();

        // Verify submission was successful
        cy.visit('/');
        cy.contains(TEST_CONSTANTS.UI_LABELS.UPCOMING_EXPERIMENTS).should(
          'exist'
        );
        cy.contains(TEST_CONSTANTS.EXPERIMENT.ID).should('exist');
        cy.get('[data-cy=finish-experiment-safety-form-icon]').should('exist');
        cy.testActionButton('finish-experiment-safety-form-icon', 'completed');

        // In ESR workflow, status should change to "ESF ESR REVIEW"
        cy.login(initialDBData.users.experimentSafetyReviewer1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table').should('exist');
        cy.get('table tbody tr').should('have.length', 1);
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(1)
          .should('contain', TEST_CONSTANTS.EXPERIMENT.ID);
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', TEST_CONSTANTS.STATUS_LABELS.ESF_ESR_REVIEW);
      });
    });

    describe('Experiment Safety Reviewer Decision Management', () => {
      beforeEach(() => {
        submitESFByUser();

        // Complete the safety review form as ESR
        cy.login(initialDBData.users.experimentSafetyReviewer1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();
        cy.get('[role="dialog"]').contains('Experiment Safety Review').click();
        fillExperimentSafetyReview();
      });

      it('Should enable download button when Experiment Safety Reviewer approves (ESR workflow)', () => {
        // Initially download button should be disabled
        cy.contains('Download Safety Review Document').should('be.disabled');

        // Accept the review as ESR
        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get('li[data-value="ACCEPTED"]').click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          'Approved by Experiment Safety Reviewer in ESR workflow.'
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains('OK').click();

        // Refresh the page to get the updated status after workflow processing
        cy.reload();

        // Download button should now be enabled (ESR approval enables download in ESR workflow)
        cy.contains('Download Safety Review Document').should(
          'not.be.disabled'
        );
      });

      it('Should change experiment status to ESF APPROVED after ESR approval (ESR workflow)', () => {
        // Accept the review as ESR
        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get('li[data-value="ACCEPTED"]').click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          'ESR approval for status change test.'
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains('OK').click();

        // Close modal and verify status
        cy.get('[data-cy="close-modal"]').click();
        cy.visit('/Experiments');
        cy.finishedLoading();

        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', 'ESF APPROVED');
      });

      it('Should keep download disabled when Instrument Scientist approves in ESR workflow', () => {
        // Close current modal and login as IS
        cy.get('[data-cy="close-modal"]').click();
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();
        cy.get('[role="dialog"]').contains('Experiment Safety Review').click();

        // Initially download button should be disabled
        cy.contains('Download Safety Review Document').should('be.disabled');

        // Accept the review as IS (but in ESR workflow, this shouldn't enable download)
        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get('li[data-value="ACCEPTED"]').click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          'IS approval in ESR workflow - should not enable download.'
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains('OK').click();

        // Refresh the page to get the updated status after workflow processing
        cy.reload();

        // Download button should remain disabled (IS approval doesn't enable download in ESR workflow)
        cy.contains('Download Safety Review Document').should('be.disabled');

        // Status should remain the same (not changed to approved)
        cy.get('[data-cy="close-modal"]').click();
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', 'ESF ESR REVIEW');
      });
    });

    describe('Cross-Role Workflow Validation', () => {
      beforeEach(() => {
        submitESFByUser();
      });

      it('Should demonstrate that only ESR approval matters in ESR workflow', () => {
        // First, let IS approve (should not enable download or change status)
        cy.login(instrumentScientist1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();
        cy.get('[role="dialog"]').contains('Experiment Safety Review').click();
        fillExperimentSafetyReview();

        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get('li[data-value="ACCEPTED"]').click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          'IS approval first - should not be decisive in ESR workflow.'
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains('OK').click();

        // Verify download is still disabled and status unchanged
        cy.contains('Download Safety Review Document').should('be.disabled');
        cy.get('[data-cy="close-modal"]').click();
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', 'ESF ESR REVIEW');

        // Now let ESR approve (should enable download and change status)
        cy.login(initialDBData.users.experimentSafetyReviewer1);
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('[aria-label="View Experiment"]')
          .click();
        cy.get('[role="dialog"]').contains('Experiment Safety Review').click();

        cy.get('[data-cy="experiment-safety-review-make-decision"]').click();
        cy.get('li[data-value="ACCEPTED"]').click();
        cy.get('[data-cy="experiment-safety-review-comment"]').type(
          'ESR approval - this should be decisive in ESR workflow.'
        );
        cy.get('[data-cy="button-submit-experiment-safety-review"]').click();
        cy.contains('OK').click();

        // Refresh the page to get the updated status after workflow processing
        cy.reload();

        // Now download should be enabled and status should change
        cy.contains('Download Safety Review Document').should(
          'not.be.disabled'
        );
        cy.get('[data-cy="close-modal"]').click();
        cy.visit('/Experiments');
        cy.finishedLoading();
        cy.get('table tbody tr')
          .first()
          .find('td')
          .eq(6)
          .should('contain', 'ESF APPROVED');
      });
    });
  });
});
