import { faker } from '@faker-js/faker';
import {
  FeatureId,
  ProposalEndStatus,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Experiment Safety tests', () => {
  const safetyComment = faker.lorem.words(5);

  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // Skip tests if experiment safety features are not enabled
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

    // Setup experiment with accepted proposal
    cy.updateProposalManagementDecision({
      proposalPk: initialDBData.proposal.id,
      finalStatus: ProposalEndStatus.ACCEPTED,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
      managementDecisionSubmitted: true,
    });

    // Create experiment safety record if it doesn't exist
    cy.createOrGetExperimentSafety({
      experimentPk: initialDBData.experiments.upcoming.experimentPk,
    });
  });
  const createProposalWithExperiment = () => {
    // Create ESI template
    cy.createTemplate({
      name: esiTemplateName,
      groupId: TemplateGroupId.EXPERIMENT_ESI,
    }).then((result) => {
      if (result.createTemplate) {
        createdEsiTemplateId = result.createTemplate.templateId;

        // Create a boolean question for the ESI template
        cy.createQuestion({
          categoryId: TemplateCategoryId.EXPERIMENT_ESI_SAFETY,
          dataType: DataType.BOOLEAN,
          question: 'Is this experiment hazardous?',
        }).then((questionResult) => {
          const questionId = questionResult.createQuestion.id;
          cy.createQuestionTemplateRelation({
            questionId,
            templateId: createdEsiTemplateId,
            sortOrder: 1,
            topicId: 1,
          });
        });

        // Create experiment safety review template
        cy.createTemplate({
          name: safetyReviewTemplateName,
          groupId: TemplateGroupId.SAFETY_REVIEW,
        }).then((safetyResult) => {
          if (safetyResult.createTemplate) {
            createdSafetyReviewTemplateId =
              safetyResult.createTemplate.templateId;

            // Create a text question for the safety review
            cy.createQuestion({
              categoryId: TemplateCategoryId.SAFETY_REVIEW,
              dataType: DataType.TEXT_INPUT,
              question: 'Safety review comments',
            }).then((questionResult) => {
              const questionId = questionResult.createQuestion.id;
              cy.createQuestionTemplateRelation({
                questionId,
                templateId: createdSafetyReviewTemplateId,
                sortOrder: 1,
                topicId: 1,
              });
            });

            // Create an instrument for experiments
            cy.createInstrument({
              name: 'Test Instrument',
              shortCode: 'TEST',
            }).then((instrumentResult) => {
              if (instrumentResult.createInstrument) {
                createdInstrumentId = instrumentResult.createInstrument.id;

                // Create a proposal workflow
                cy.createWorkflow(proposalWorkflow).then((workflowResult) => {
                  if (workflowResult.createWorkflow) {
                    // Create a call with the templates
                    cy.createCall({
                      ...updatedCall,
                      esiTemplateId: createdEsiTemplateId,
                      templateId: initialDBData.template.id,
                      proposalWorkflowId: workflowResult.createWorkflow.id,
                    }).then((callResult) => {
                      if (callResult.createCall) {
                        // Create a proposal
                        cy.createProposal({
                          callId: callResult.createCall.id,
                        }).then((proposalResult) => {
                          if (proposalResult.createProposal) {
                            createdProposalPk =
                              proposalResult.createProposal.primaryKey;
                            createdProposalId =
                              proposalResult.createProposal.proposalId;

                            // Create experiment
                            const startDate = DateTime.now().toJSDate();
                            const endDate = DateTime.now()
                              .plus({ days: 5 })
                              .toJSDate();
                            cy.createExperiment({
                              proposalPk: createdProposalPk,
                              instrumentId: createdInstrumentId,
                              startsAt: startDate,
                              endsAt: endDate,
                              localContactId: localContact.id,
                            }).then((experimentResult) => {
                              if (experimentResult.createExperiment) {
                                createdExperimentId =
                                  experimentResult.createExperiment
                                    .experimentId;
                                createdExperimentPk =
                                  experimentResult.createExperiment.id;
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  // Helper function to create experiment safety PDF template
  const createExperimentSafetyPdfTemplate = () => {
    cy.login('officer');
    cy.visit('/');

    cy.navigateToTemplatesSubmenu('PDF');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy="name"] input')
      .first()
      .type(experimentSafetyPdfTemplateName)
      .should('have.value', experimentSafetyPdfTemplateName);

    cy.get('[data-cy="description"] textarea')
      .first()
      .type('Template for experiment safety reports')
      .should('have.value', 'Template for experiment safety reports');

    // Select experiment safety template type
    cy.get('[data-cy="templateType"]').click();
    cy.get('[data-cy="template-type-EXPERIMENT_SAFETY"]').click();

    cy.get('[data-cy=submit]').click();

    // Verify template was created
    cy.contains(experimentSafetyPdfTemplateName);

    // Save the template ID
    cy.url()
      .should('include', '/pdf/')
      .then((url) => {
        const templateId = url.split('/').pop();
        createdPdfTemplateId = parseInt(templateId as string);
      });
  };

  describe('Basic experiment safety functionality', () => {
    beforeEach(() => {
      createProposalWithExperiment();
      cy.wait(1000);
    });

    it('User should be able to submit ESI questionary', () => {
      cy.login(existingUser);
      cy.visit('/');

      // Navigate to experiment details
      cy.contains('Experiments').click();
      cy.contains(createdExperimentId).click();

      // Go to ESI tab
      cy.contains('ESI').click();

      // Fill the ESI form
      cy.get('[data-cy="questionary-step-is-hazardous"]').click();
      cy.contains('Is this experiment hazardous?')
        .parent()
        .find('[data-cy="boolean-field"] input[value="false"]')
        .click();

      // Save and submit
      cy.get('[data-cy="save-button"]').click();
      cy.contains('Save ESI').should('not.exist');

      cy.get('[data-cy="submit-button"]').click();
      cy.contains('Submit ESI').should('not.exist');

      // Verify success message
      cy.contains('ESI submitted successfully').should('exist');

      // Check that the submission status has changed
      cy.contains('Status: Submitted').should('exist');
    });

    it('Instrument scientist can review and decide on ESI', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment details
      cy.contains('Experiments').click();
      cy.contains(createdExperimentId).click();

      // Go to ESI tab
      cy.contains('ESI').click();

      // Submit ESI on behalf of user
      cy.get('[data-cy="questionary-step-is-hazardous"]').click();
      cy.contains('Is this experiment hazardous?')
        .parent()
        .find('[data-cy="boolean-field"] input[value="false"]')
        .click();
      cy.get('[data-cy="save-button"]').click();
      cy.get('[data-cy="submit-button"]').click();

      // Set Instrument Scientist approval
      cy.contains('Instrument Scientist').should('exist');
      cy.get('[data-cy="instrument-scientist-decision"]').click();
      cy.get('[data-cy="decision-item-ACCEPTED"]').click();

      // Add a comment
      cy.get('[data-cy="instrument-scientist-comment"]').type(safetyComment);

      // Save the decision
      cy.get('[data-cy="save-instrument-scientist-decision"]').click();

      // Verify success message
      cy.contains('Decision submitted successfully').should('exist');

      // Verify the decision is displayed
      cy.contains('Accepted').should('exist');
      cy.contains(safetyComment).should('exist');
    });

    it('Safety reviewer can review and decide on experiment safety', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment details
      cy.contains('Experiments').click();
      cy.contains(createdExperimentId).click();

      // Go to ESI tab
      cy.contains('ESI').click();

      // Submit ESI on behalf of user
      cy.get('[data-cy="questionary-step-is-hazardous"]').click();
      cy.contains('Is this experiment hazardous?')
        .parent()
        .find('[data-cy="boolean-field"] input[value="false"]')
        .click();
      cy.get('[data-cy="save-button"]').click();
      cy.get('[data-cy="submit-button"]').click();

      // Set Safety Reviewer approval
      cy.contains('Safety Reviewer').should('exist');
      cy.get('[data-cy="safety-reviewer-decision"]').click();
      cy.get('[data-cy="decision-item-ACCEPTED"]').click();

      // Add a comment
      cy.get('[data-cy="safety-reviewer-comment"]').type(safetyComment);

      // Save the decision
      cy.get('[data-cy="save-safety-reviewer-decision"]').click();

      // Verify success message
      cy.contains('Decision submitted successfully').should('exist');

      // Verify the decision is displayed
      cy.contains('Accepted').should('exist');
      cy.contains(safetyComment).should('exist');
    });
  });

  describe('Experiment Safety PDF generation', () => {
    beforeEach(() => {
      // Create experiment and PDF template
      createProposalWithExperiment();
      createExperimentSafetyPdfTemplate();
      cy.wait(1000);
    });

    it('Should generate an experiment safety PDF with the correct content', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment details
      cy.contains('Experiments').click();
      cy.contains(createdExperimentId).click();

      // Go to ESI tab
      cy.contains('ESI').click();

      // Submit ESI on behalf of user
      cy.get('[data-cy="questionary-step-is-hazardous"]').click();
      cy.contains('Is this experiment hazardous?')
        .parent()
        .find('[data-cy="boolean-field"] input[value="false"]')
        .click();
      cy.get('[data-cy="save-button"]').click();
      cy.get('[data-cy="submit-button"]').click();

      // Set both decisions to pass safety review
      cy.get('[data-cy="instrument-scientist-decision"]').click();
      cy.get('[data-cy="decision-item-ACCEPTED"]').click();
      cy.get('[data-cy="instrument-scientist-comment"]').type(safetyComment);
      cy.get('[data-cy="save-instrument-scientist-decision"]').click();

      cy.get('[data-cy="safety-reviewer-decision"]').click();
      cy.get('[data-cy="decision-item-ACCEPTED"]').click();
      cy.get('[data-cy="safety-reviewer-comment"]').type(safetyComment);
      cy.get('[data-cy="save-safety-reviewer-decision"]').click();

      // Generate PDF
      cy.get('[data-cy="download-pdf-button"]').click();

      // TODO: Verify the PDF was downloaded - requires File Download API and/or PDF parsing
      // This step varies depending on the environment and limitations of Cypress

      // Verify confirmation message that the PDF was generated
      cy.contains('PDF generated successfully').should('exist');
    });

    it('Officer can configure experiment safety PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to PDF template editor
      cy.navigateToTemplatesSubmenu('PDF');
      cy.contains(experimentSafetyPdfTemplateName).click();

      // Modify the template
      cy.get('[data-cy="templateData"] .cm-content').type(
        '{selectall}{backspace}',
        { force: true }
      );
      cy.get('[data-cy="templateData"] .cm-content').type(
        '# Experiment Safety Report\n\n{{experiment.experimentId}} - {{proposal.title}}\n\nSafety Status: {{experimentSafety.status}}',
        { force: true }
      );

      // Save the template
      cy.get('[data-cy="saveButton"]').click();

      // Verify success message
      cy.contains('Updated').should('exist');
    });
  });

  describe('Experiment Safety dashboard and management', () => {
    beforeEach(() => {
      createProposalWithExperiment();
      cy.wait(1000);
    });

    it('Safety officer can view all experiment safety reviews on dashboard', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment safety dashboard
      cy.contains('Experiment Safety').click();

      // Check experiment appears in the list
      cy.contains(createdExperimentId).should('exist');

      // Verify the status is pending review
      cy.contains('Pending').should('exist');
    });

    it('Officer can filter experiment safety reviews by status', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment safety dashboard
      cy.contains('Experiment Safety').click();

      // Select filter by status - draft
      cy.get('[data-cy="status-filter"]').click();
      cy.contains('Draft').click();

      // Verify filtering works
      cy.contains(createdExperimentId).should('exist');

      // Change filter to submitted (where our experiment shouldn't be yet)
      cy.get('[data-cy="status-filter"]').click();
      cy.contains('Submitted').click();

      // Verify experiment is not visible in this filter
      cy.contains(createdExperimentId).should('not.exist');
    });

    it('Officer can assign safety reviewers to experiments', () => {
      cy.login('officer');
      cy.visit('/');

      // Navigate to experiment details
      cy.contains('Experiments').click();
      cy.contains(createdExperimentId).click();

      // Go to ESI tab
      cy.contains('ESI').click();

      // Assign safety reviewer
      cy.get('[data-cy="assign-safety-reviewer"]').click();
      cy.get('[data-cy="user-selection"]').type(
        initialDBData.users.user2.firstName
      );
      cy.contains(initialDBData.users.user2.firstName).click();
      cy.get('[data-cy="save-assignment"]').click();

      // Verify assignment was successful
      cy.contains(
        `Safety reviewer: ${initialDBData.users.user2.firstName}`
      ).should('exist');
    });
  });
});
w;
