import { faker } from '@faker-js/faker';
import {
  DataType,
  FeatureId,
  ProposalEndStatus,
  TemplateCategoryId,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import { newCall, proposalWorkflow } from './templateContext';
import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Template Delete, Archive, Unarchive', () => {
  let workflowId: number;
  const templateName = faker.lorem.words(3);

  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1680);

    cy.createProposalWorkflow(proposalWorkflow).then((result) => {
      if (result.createProposalWorkflow) {
        workflowId = result.createProposalWorkflow.id;
      } else {
        throw new Error('Workflow creation failed');
      }
    });
  });

  const shouldDeleteTemplate = (templateName: string, url: string) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Delete']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');
  };

  const shouldNotDeleteTemplate = (templateName: string, url: string) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Delete']")
      .should('not.exist');
  };

  const shouldDeleteArchivedTemplate = (templateName: string, url: string) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Archive']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');

    cy.contains('Archived').click();

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Delete']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');
  };

  const shouldNotDeleteArchivedTemplate = (
    templateName: string,
    url: string
  ) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Archive']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');

    cy.contains('Archived').click();

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Delete']")
      .should('not.exist');
  };

  const shouldArchiveTemplate = (templateName: string, url: string) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Archive']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');

    cy.contains('Archived').click();

    cy.contains(templateName);
  };

  const shouldUnarchiveArchivedTemplate = (
    templateName: string,
    url: string
  ) => {
    cy.login('officer');
    cy.visit(url);

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Archive']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');

    cy.contains('Archived').click();

    cy.contains(templateName)
      .parent()
      .find("[aria-label='Unarchive']")
      .should('exist')
      .click();

    cy.contains('Yes').click();

    cy.contains(templateName).should('not.exist');

    cy.contains('Current').click();

    cy.contains(templateName);
  };

  describe('PDF Templates Delete, Archive, Unarchive', () => {
    it('PDF Template can be deleted if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      });

      shouldDeleteTemplate(templateName, '/PDFTemplates');
    });

    it('PDF Template can not be deleted if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          pdfTemplateId: result.createTemplate.templateId,
        });

        shouldNotDeleteTemplate(templateName, '/PDFTemplates');
      });
    });

    it('Archived PDF Template can be deleted if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      });

      shouldDeleteArchivedTemplate(templateName, '/PDFTemplates');
    });

    it('Archived PDF Template can not be deleted if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          pdfTemplateId: result.createTemplate.templateId,
        });

        shouldNotDeleteArchivedTemplate(templateName, '/PDFTemplates');
      });
    });

    it('PDF Template can be archived if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          pdfTemplateId: result.createTemplate.templateId,
        });
      });

      shouldArchiveTemplate(templateName, '/PDFTemplates');
    });

    it('PDF Template can be archived if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      });

      shouldArchiveTemplate(templateName, '/PDFTemplates');
    });

    it('PDF Template can be unarchived if archived and associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          pdfTemplateId: result.createTemplate.templateId,
        });
      });

      shouldUnarchiveArchivedTemplate(templateName, '/PDFTemplates');
    });

    it('PDF Template can be unarchived if archived and not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/PDFTemplates');
    });
  });

  describe('Proposal template Delete, Archive, Unarchive', () => {
    it('Proposal Template can be deleted if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      });

      shouldDeleteTemplate(templateName, '/ProposalTemplates');
    });

    it('Proposal Template can not be deleted if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          templateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteTemplate(templateName, '/ProposalTemplates');
    });

    it('Archived Proposal Template can be deleted if it is not associated with an call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      });

      shouldDeleteArchivedTemplate(templateName, '/ProposalTemplates');
    });

    it('Archived Proposal Template can not be deleted if it is associated with an call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          templateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteArchivedTemplate(templateName, '/ProposalTemplates');
    });

    it('Proposal Template can be archived if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          templateId: result.createTemplate.templateId,
        });
      });

      shouldArchiveTemplate(templateName, '/ProposalTemplates');
    });

    it('Proposal Template can be archived if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      });

      shouldArchiveTemplate(templateName, '/ProposalTemplates');
    });

    it('Proposal Template can be unarchived if archived and associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          templateId: result.createTemplate.templateId,
        });
      });

      shouldUnarchiveArchivedTemplate(templateName, '/ProposalTemplates');
    });

    it('Proposal Template can be unarchived if archived and not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/ProposalTemplates');
    });
  });

  describe('FAP Review template Delete, Archive, Unarchive', () => {
    it('FAP Review Template can be deleted if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      });

      shouldDeleteTemplate(templateName, '/FAPReviewTemplates');
    });

    it('FAP Review Template can not be deleted if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          fapReviewTemplateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteTemplate(templateName, '/FAPReviewTemplates');
    });

    it('Archived FAP Review Template can be deleted if it is not associated with an call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      });

      shouldDeleteArchivedTemplate(templateName, '/FAPReviewTemplates');
    });

    it('Archived FAP Review Template can not be deleted if it is associated with an call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          fapReviewTemplateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteArchivedTemplate(templateName, '/FAPReviewTemplates');
    });

    it('FAP Review Template can be archived if it is associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          fapReviewTemplateId: result.createTemplate.templateId,
        });
      });

      shouldArchiveTemplate(templateName, '/FAPReviewTemplates');
    });

    it('FAP Review Template can be archived if it is not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      });

      shouldArchiveTemplate(templateName, '/FAPReviewTemplates');
    });

    it('FAP Review Template can be unarchived if archived and associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          fapReviewTemplateId: result.createTemplate.templateId,
        });
      });

      shouldUnarchiveArchivedTemplate(templateName, '/FAPReviewTemplates');
    });

    it('FAP Review Template can be unarchived if archived and not associated with a call', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.FAP_REVIEW,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/FAPReviewTemplates');
    });
  });

  describe('Sample Declaration template Delete, Archive, Unarchive', () => {
    let createdSampleTemplateId: number;
    let createdSampleQuestionId: string;
    const booleanQuestion = faker.lorem.words(3);
    const proposalTemplateName = faker.lorem.words(2);
    const sampleQuestion = faker.lorem.words(4);
    const sampleQuestionaryQuestion = faker.lorem.words(2);

    const proposalTitle = faker.lorem.words(2);
    const sampleTitle = faker.lorem.words(2);

    const createProposalTemplateWithSampleQuestionAndUseTemplateInCall = () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SAMPLE,
      }).then((result) => {
        if (result.createTemplate) {
          createdSampleTemplateId = result.createTemplate.templateId;
          cy.createTopic({
            templateId: createdSampleTemplateId,
            sortOrder: 1,
          }).then((topicResult) => {
            if (topicResult.createTopic) {
              const topicId =
                topicResult.createTopic.steps[
                  topicResult.createTopic.steps.length - 1
                ].topic.id;
              cy.createQuestion({
                dataType: DataType.TEXT_INPUT,
                categoryId: TemplateCategoryId.SAMPLE_DECLARATION,
              }).then((questionResult) => {
                if (questionResult.createQuestion) {
                  cy.updateQuestion({
                    id: questionResult.createQuestion.id,
                    question: sampleQuestion,
                  });
                  cy.createQuestionTemplateRelation({
                    questionId: questionResult.createQuestion.id,
                    sortOrder: 0,
                    templateId: createdSampleTemplateId,
                    topicId: topicId,
                  });
                }
              });
            }
          });
          cy.createTemplate({
            groupId: TemplateGroupId.PROPOSAL,
            name: proposalTemplateName,
          }).then((result) => {
            if (result.createTemplate) {
              const templateId = result.createTemplate.templateId;
              cy.createTopic({
                templateId: templateId,
                sortOrder: 1,
              }).then((topicResult) => {
                if (topicResult.createTopic) {
                  const topicId =
                    topicResult.createTopic.steps[
                      topicResult.createTopic.steps.length - 1
                    ].topic.id;
                  cy.createQuestion({
                    dataType: DataType.SAMPLE_DECLARATION,
                    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                  }).then((questionResult) => {
                    if (questionResult.createQuestion.question) {
                      createdSampleQuestionId =
                        questionResult.createQuestion.id;

                      cy.updateQuestion({
                        id: createdSampleQuestionId,
                        question: sampleQuestionaryQuestion,
                        config: `{"addEntryButtonLabel":"Add","minEntries":"1","maxEntries":"2","templateId":${createdSampleTemplateId},"templateCategory":"${TemplateCategoryId.SAMPLE_DECLARATION}"}`,
                      });

                      cy.createQuestionTemplateRelation({
                        questionId: createdSampleQuestionId,
                        sortOrder: 0,
                        templateId: templateId,
                        topicId: topicId,
                      });
                    }
                  });

                  cy.createQuestion({
                    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                    dataType: DataType.BOOLEAN,
                  }).then((questionResult) => {
                    const createdQuestion = questionResult.createQuestion;
                    if (createdQuestion) {
                      cy.updateQuestion({
                        id: createdQuestion.id,
                        question: booleanQuestion,
                      });

                      cy.createQuestionTemplateRelation({
                        questionId: createdQuestion.id,
                        templateId: templateId,
                        sortOrder: 0,
                        topicId: topicId,
                      });
                    }
                  });
                }
              });

              cy.createCall({
                ...newCall,
                proposalWorkflowId: workflowId,
                templateId: templateId,
              });

              cy.login('user1', initialDBData.roles.user);
              cy.visit('/');

              cy.contains('new proposal', { matchCase: false }).click();
              cy.contains(newCall.shortCode).click();

              cy.get('[data-cy=title] input').type(newCall.shortCode);

              cy.get('[data-cy=abstract] textarea').first().type(proposalTitle);

              cy.contains('Save and continue').click();

              cy.finishedLoading();

              cy.get('[data-cy=add-button]').click();

              cy.get('[data-cy=title-input] input')
                .clear()
                .type(sampleTitle)
                .should('have.value', sampleTitle);

              cy.get(
                '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
              ).click();

              // Make sure the questionary has moved on, else the "save-and-continue-button" is clicked twice without the first click being processed
              cy.get('[data-cy=sample-declaration-modal]').contains(
                sampleQuestion
              );

              cy.get(
                '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
              ).click();

              cy.finishedLoading();

              cy.get('[data-cy="questionnaires-list-item"]').should(
                'have.length',
                1
              );

              cy.contains('Save and continue').click();

              cy.contains('Submit').click();

              cy.contains('OK').click();
            }
          });
        }
      });
    };

    it('Sample Declaration Review Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SAMPLE,
      });

      shouldDeleteTemplate(templateName, '/SampleDeclarationTemplates');
    });

    it('Sample Declaration Review Template can not be deleted if it is associated with any Questionary', () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();

      shouldNotDeleteTemplate(templateName, '/SampleDeclarationTemplates');
    });

    it("Archived Sample Declaration Review Template can be deleted if it's not associated with any Questionary", () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SAMPLE,
      });

      shouldDeleteArchivedTemplate(templateName, '/SampleDeclarationTemplates');
    });

    it("Archived Sample Declaration Review Template can not be deleted if it's associated with any Questionary", () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();

      shouldNotDeleteArchivedTemplate(
        templateName,
        '/SampleDeclarationTemplates'
      );
    });

    it('Sample Declaration Review Template can be archived if it is associated with a Questionary', () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();

      shouldArchiveTemplate(templateName, '/SampleDeclarationTemplates');
    });

    it('Sample Declaration Review Template can be archived if it is not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SAMPLE,
      });

      shouldArchiveTemplate(templateName, '/SampleDeclarationTemplates');
    });

    it('Sample Declaration Review Template can be unarchived if archived and associated with a Questionary', () => {
      createProposalTemplateWithSampleQuestionAndUseTemplateInCall();

      shouldUnarchiveArchivedTemplate(
        templateName,
        '/SampleDeclarationTemplates'
      );
    });

    it('Sample Declaration Review Template can be unarchived if archived and not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SAMPLE,
      });

      shouldUnarchiveArchivedTemplate(
        templateName,
        '/SampleDeclarationTemplates'
      );
    });
  });

  describe('Shipment template Delete, Archive, Unarchive', () => {
    const declareShipmentIconCyTag = 'declare-shipment-icon';
    const existingProposal = initialDBData.proposal;
    const shipmentTitle = faker.lorem.words(2);
    const sampleTitle = /My sample title/i;
    const coProposer = initialDBData.users.user2;
    const existingScheduledEventId = initialDBData.scheduledEvents.upcoming.id;
    const visitor = initialDBData.users.user3;
    const PI = initialDBData.users.user1;

    const templateName = 'Shipment template';
    beforeEach(() => {
      cy.updateProposalManagementDecision({
        proposalPk: existingProposal.id,
        finalStatus: ProposalEndStatus.ACCEPTED,
        managementDecisionSubmitted: true,
        managementTimeAllocations: [
          { instrumentId: initialDBData.instrument1.id, value: 5 },
        ],
      });
      cy.createVisit({
        team: [coProposer.id, visitor.id, PI.id],
        teamLeadUserId: PI.id,
        scheduledEventId: existingScheduledEventId,
      });
    });

    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SHIPPING))
        this.skip();
    });

    const createShipmentTemplateAndUseItForAProposal = () => {
      const WIDTH_KEY = 'parcel_width';
      const HEIGHT_KEY = 'parcel_height';
      const LENGTH_KEY = 'parcel_length';
      const WEIGHT_KEY = 'parcel_weight';

      const STORAGE_TEMPERATURE_KEY = 'storage_temperature';
      const DESCRIPTION_KEY = 'detailed_description_of_content';
      const SENDER_NAME_KEY = 'shipment_sender_name';
      const SENDER_EMAIL_KEY = 'shipment_sender_email';
      const SENDER_PHONE_KEY = 'shipment_sender_phone';
      const SENDER_STREET_ADDRESS_KEY = 'shipment_sender_street_address';
      const SENDER_ZIP_CODE_KEY = 'shipment_sender_zip_code';
      const SENDER_CITY_COUNTRY_KEY = 'shipment_sender_city_country';

      const shipmentsTemplateFile = 'shipments_template.json';

      const temp = 'Ambient';
      const description = faker.lorem.words(2);
      const name = faker.name.firstName();
      const email = faker.internet.email();
      const phone = faker.phone.number();
      const street = faker.address.streetAddress();
      const zip = faker.address.zipCode();
      const city = faker.address.city();

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Shipment declaration templates');

      cy.get('[data-cy=import-template-button]').click();

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.get('input[type="file"]').selectFile(
        {
          contents: `cypress/fixtures/${shipmentsTemplateFile}`,
          fileName: shipmentsTemplateFile,
        },
        { force: true }
      );

      cy.get('[data-cy="import-template-button"]').click();

      cy.notification({
        variant: 'success',
        text: 'Template imported successfully',
      });

      cy.logout();
      cy.login('user1');
      cy.visit('/');

      cy.testActionButton(declareShipmentIconCyTag, 'neutral');

      cy.contains(existingProposal.title)
        .parent()
        .find(`[data-cy="${declareShipmentIconCyTag}"]`)
        .click();

      cy.get('[data-cy=add-button]').click();

      cy.get('[data-cy=title-input] input')
        .click()
        .clear()
        .type(shipmentTitle)
        .should('have.value', shipmentTitle);

      cy.get('[data-cy=select-proposal-dropdown]').click();

      cy.get('[role="listbox"]').contains(existingProposal.title).click();

      cy.get('[data-cy=samples-dropdown]').click();

      cy.get('[role="listbox"]').contains(sampleTitle).click();

      cy.get('body').type('{esc}');

      cy.get(`[data-natural-key=${DESCRIPTION_KEY}]`).type(description);

      cy.get(`[data-natural-key=${WIDTH_KEY}]`).clear().type('1').click();
      cy.get(`[data-natural-key=${HEIGHT_KEY}]`).clear().type('1').click();
      cy.get(`[data-natural-key=${LENGTH_KEY}]`).clear().type('1').click();
      cy.get(`[data-natural-key=${WEIGHT_KEY}]`).clear().type('1').click();

      cy.get(`[data-natural-key=${STORAGE_TEMPERATURE_KEY}]`).click();
      cy.get('[role=presentation]').contains(temp).click();
      cy.get(`[data-natural-key=${SENDER_NAME_KEY}]`).type(name);
      cy.get(`[data-natural-key=${SENDER_EMAIL_KEY}]`).type(email);
      cy.get(`[data-natural-key=${SENDER_PHONE_KEY}]`).type(phone);
      cy.get(`[data-natural-key=${SENDER_STREET_ADDRESS_KEY}]`).type(street);
      cy.get(`[data-natural-key=${SENDER_ZIP_CODE_KEY}]`).type(zip);
      cy.get(`[data-natural-key=${SENDER_CITY_COUNTRY_KEY}]`).type(city);

      cy.get('[data-cy=save-and-continue-button]').focus();

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains(existingProposal.title);

      cy.contains('SUBMITTED', { matchCase: false });

      cy.contains(temp).should('exist');
      cy.contains(description).should('exist');
      cy.contains(name).should('exist');
      cy.contains(email).should('exist');
      cy.contains(phone).should('exist');
      cy.contains(street).should('exist');
      cy.contains(zip).should('exist');
      cy.contains(city).should('exist');
    };
    it('Shipment Declaration Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SHIPMENT,
      });

      shouldDeleteTemplate(templateName, '/ShipmentDeclarationTemplates');
    });

    it('Shipment Declaration Template can not be deleted if it is associated with any Questionary', () => {
      createShipmentTemplateAndUseItForAProposal();

      shouldNotDeleteTemplate(templateName, '/ShipmentDeclarationTemplates');
    });
    it('Archived Shipment Declaration Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SHIPMENT,
      });

      shouldDeleteArchivedTemplate(
        templateName,
        '/ShipmentDeclarationTemplates'
      );
    });

    it('Archived Shipment Declaration Template can not be deleted if it is associated with any Questionary', () => {
      createShipmentTemplateAndUseItForAProposal();

      shouldNotDeleteArchivedTemplate(
        templateName,
        '/ShipmentDeclarationTemplates'
      );
    });

    it('Shipment Declaration Template can be archived if it is associated with a Questionary', () => {
      createShipmentTemplateAndUseItForAProposal();

      shouldArchiveTemplate(templateName, '/ShipmentDeclarationTemplates');
    });

    it('Shipment Declaration Template can be archived if it is not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SHIPMENT,
      });

      shouldArchiveTemplate(templateName, '/ShipmentDeclarationTemplates');
    });

    it('Shipment Declaration Template can be unarchived if archived and associated with a Questionary', () => {
      createShipmentTemplateAndUseItForAProposal();

      shouldUnarchiveArchivedTemplate(
        templateName,
        '/ShipmentDeclarationTemplates'
      );
    });

    it('Shipment Declaration Template can be unarchived if archived and not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.SHIPMENT,
      });

      shouldUnarchiveArchivedTemplate(
        templateName,
        '/ShipmentDeclarationTemplates'
      );
    });
  });

  describe('Generic template Delete, Archive, Unarchive', () => {
    const genericTemplateQuestion = faker.lorem.words(2);
    const addButtonLabel = faker.lorem.words(2);
    const proposalTitle = faker.lorem.words(2);
    const createGenericTemplate = () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.GENERIC_TEMPLATE,
      }).then((result) => {
        if (result.createTemplate) {
          const genericTemplateID = result.createTemplate.templateId;
          const topicId =
            result.createTemplate.steps[result.createTemplate.steps.length - 1]
              .topic.id;
          cy.createQuestion({
            categoryId: TemplateCategoryId.GENERIC_TEMPLATE,
            dataType: DataType.TEXT_INPUT,
          }).then((questionResult) => {
            const createdQuestion = questionResult.createQuestion;
            if (createdQuestion) {
              cy.updateQuestion({
                id: createdQuestion.id,
                question: faker.lorem.words(5),
                naturalKey: faker.lorem.word(5),
                config: `{"required":false,"multiline":false}`,
              });
              cy.createQuestionTemplateRelation({
                questionId: createdQuestion.id,
                templateId: genericTemplateID,
                sortOrder: 1,
                topicId: topicId,
              });

              //////
              cy.createTemplate({
                name: faker.lorem.words(3),
                groupId: TemplateGroupId.PROPOSAL,
              }).then((result) => {
                if (result.createTemplate) {
                  const proposalTemplateId = result.createTemplate.templateId;

                  cy.createTopic({
                    templateId: proposalTemplateId,
                    sortOrder: 1,
                  }).then((topicResult) => {
                    if (!topicResult.createTopic) {
                      throw new Error('Can not create topic');
                    }
                    const topicId =
                      topicResult.createTopic.steps[
                        topicResult.createTopic.steps.length - 1
                      ].topic.id;
                    cy.updateTopic({
                      title: faker.lorem.words(2),
                      templateId: proposalTemplateId,
                      sortOrder: 1,
                      topicId,
                    });
                    cy.createQuestion({
                      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
                      dataType: DataType.GENERIC_TEMPLATE,
                    }).then((questionResult) => {
                      if (questionResult.createQuestion) {
                        const createdQuestion1Id =
                          questionResult.createQuestion.id;

                        cy.updateQuestion({
                          id: createdQuestion1Id,
                          question: genericTemplateQuestion,
                          config: `{"addEntryButtonLabel":"${addButtonLabel}","minEntries":"1","maxEntries":"2","templateId":${genericTemplateID},"templateCategory":"GENERIC_TEMPLATE","required":false,"small_label":""}`,
                        });

                        cy.createQuestionTemplateRelation({
                          questionId: createdQuestion1Id,
                          templateId: proposalTemplateId,
                          sortOrder: 1,
                          topicId: topicId,
                        });
                      }
                    });
                  });

                  cy.updateCall({
                    id: initialDBData.call.id,
                    ...newCall,
                    templateId: proposalTemplateId,
                    proposalWorkflowId: workflowId,
                  });

                  cy.login('user1', initialDBData.roles.user);
                  cy.visit('/');

                  cy.contains('New proposal', { matchCase: false }).click();
                  cy.get('[data-cy=call-list]').find('li:first-child').click();

                  cy.get('[data-cy=title] input').type(proposalTitle);

                  cy.get('[data-cy=abstract] textarea')
                    .first()
                    .type(proposalTitle);

                  cy.contains('Save and continue').click();

                  cy.finishedLoading();

                  cy.contains(addButtonLabel).click();

                  cy.get('[data-cy=title-input] textarea').first().clear();

                  cy.get(
                    '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
                  ).click();

                  const longTitle = faker.lorem.paragraph(1);

                  cy.get('[data-cy=title-input] textarea')
                    .first()
                    .clear()
                    .type(longTitle)
                    .should('have.value', longTitle)
                    .blur();

                  cy.get(
                    '[data-cy=genericTemplate-declaration-modal] [data-cy=save-and-continue-button]'
                  ).click();

                  cy.finishedLoading();

                  cy.get('[data-cy="questionnaires-list-item"]').should(
                    'have.length',
                    1
                  );

                  cy.contains('Save and continue').click();

                  cy.contains('Submit').click();

                  cy.contains('OK').click();
                }
              });
            }
          });
        }
      });
    };

    it('Generic Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.GENERIC_TEMPLATE,
      });

      shouldDeleteTemplate(templateName, '/GenericTemplates');
    });

    it('Generic Template can not be deleted if it is associated with any Questionary', () => {
      createGenericTemplate();

      shouldNotDeleteTemplate(templateName, '/GenericTemplates');
    });

    it('Archived Generic Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.GENERIC_TEMPLATE,
      });

      shouldDeleteArchivedTemplate(templateName, '/GenericTemplates');
    });

    it('Archived Generic Template can not be deleted if it is associated with any Questionary', () => {
      createGenericTemplate();

      shouldNotDeleteArchivedTemplate(templateName, '/GenericTemplates');
    });

    it('Generic Template can be archived if it is associated with a Questionary', () => {
      createGenericTemplate();

      shouldArchiveTemplate(templateName, '/GenericTemplates');
    });

    it('Generic Template can be archived if it is not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.GENERIC_TEMPLATE,
      });

      shouldArchiveTemplate(templateName, '/GenericTemplates');
    });

    it('Generic Template can be unarchived if archived and associated with a Questionary', () => {
      createGenericTemplate();

      shouldUnarchiveArchivedTemplate(templateName, '/GenericTemplates');
    });

    it('Generic Template can be unarchived if archived and not associated with a Questionary', () => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.GENERIC_TEMPLATE,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/GenericTemplates');
    });
  });

  describe('Visit template Delete, Archive, Unarchive', () => {
    const coProposer = initialDBData.users.user2;
    const visitor = initialDBData.users.user3;
    const PI = initialDBData.users.user1;
    const acceptedStatus = ProposalEndStatus.ACCEPTED;
    const existingProposalId = initialDBData.proposal.id;
    const existingScheduledEventId = initialDBData.scheduledEvents.upcoming.id;
    const startQuestion = 'Visit start';
    const endQuestion = 'Visit end';

    const cyTagRegisterVisit = 'register-visit-icon';
    const startDate = DateTime.fromJSDate(faker.date.past()).toFormat(
      initialDBData.getFormats().dateFormat
    );
    const endDate = DateTime.fromJSDate(faker.date.future()).toFormat(
      initialDBData.getFormats().dateFormat
    );
    const createVisit = () => {
      cy.updateProposal({
        proposalPk: existingProposalId,
        title: initialDBData.proposal.title,
        abstract: faker.random.words(3),
        proposerId: PI.id,
        users: [coProposer.id],
      });
      cy.updateProposalManagementDecision({
        proposalPk: existingProposalId,
        finalStatus: acceptedStatus,
        managementTimeAllocations: [
          { instrumentId: initialDBData.instrument1.id, value: 5 },
        ],
        managementDecisionSubmitted: true,
      });

      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: templateName,
      });

      cy.createVisit({
        team: [coProposer.id, visitor.id],
        teamLeadUserId: coProposer.id,
        scheduledEventId: existingScheduledEventId,
      });

      cy.login(visitor);
      cy.visit('/');

      cy.finishedLoading();

      // test if the actions are available after co-proposer defined the team
      cy.testActionButton(cyTagRegisterVisit, 'active');

      cy.get(`[data-cy="${cyTagRegisterVisit}"]`)
        .closest('button')
        .first()
        .click();

      cy.contains(startQuestion).parent().find('input').clear().type(startDate);
      cy.contains(endQuestion).parent().find('input').clear().type(endDate);

      cy.get('[data-cy=save-and-continue-button]').click();

      cy.get('[data-cy=submit-visit-registration-button]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.reload();

      cy.testActionButton(cyTagRegisterVisit, 'completed');
    };

    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.VISIT_MANAGEMENT))
        this.skip();
    });

    it('Generic Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: templateName,
      });

      shouldDeleteTemplate(templateName, '/VisitTemplates');
    });

    it('Generic Template can not be deleted if it is associated with any Questionary', () => {
      createVisit();

      shouldNotDeleteTemplate(templateName, '/VisitTemplates');
    });

    it('Archived Generic Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: templateName,
      });

      shouldDeleteArchivedTemplate(templateName, '/VisitTemplates');
    });

    it('Archived Generic Template can not be deleted if it is associated with any Questionary', () => {
      createVisit();

      shouldNotDeleteArchivedTemplate(templateName, '/VisitTemplates');
    });

    it('Generic Template can be archived if it is associated with a Questionary', () => {
      createVisit();

      shouldArchiveTemplate(templateName, '/VisitTemplates');
    });

    it('Generic Template can be archived if it is not associated with a Questionary', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: templateName,
      });

      shouldArchiveTemplate(templateName, '/VisitTemplates');
    });

    it('Generic Template can be unarchived if archived and associated with a Questionary', () => {
      createVisit();

      shouldUnarchiveArchivedTemplate(templateName, '/VisitTemplates');
    });

    it('Generic Template can be unarchived if archived and not associated with a Questionary', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.VISIT_REGISTRATION,
        name: templateName,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/VisitTemplates');
    });
  });

  describe('Proposal ESI template Delete, Archive, Unarchive', () => {
    it('Proposal ESI Template can be deleted if it is not associated with any Questionary', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      });

      shouldDeleteTemplate(templateName, '/EsiTemplates');
    });

    it('Proposal ESI Template can not be deleted if it is associated with any Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          esiTemplateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteTemplate(templateName, '/EsiTemplates');
    });

    it('Archived Proposal ESI Template can be deleted if it is not associated with any Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      });

      shouldDeleteArchivedTemplate(templateName, '/EsiTemplates');
    });

    it('Archived Proposal ESI Template can not be deleted if it is associated with any Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          esiTemplateId: result.createTemplate.templateId,
        });
      });

      shouldNotDeleteArchivedTemplate(templateName, '/EsiTemplates');
    });

    it('Proposal ESI Template can be archived if it is associated with a Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          esiTemplateId: result.createTemplate.templateId,
        });
      });

      shouldArchiveTemplate(templateName, '/EsiTemplates');
    });

    it('Proposal ESI Template can be archived if it is not associated with a Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      });

      shouldArchiveTemplate(templateName, '/EsiTemplates');
    });

    it('Proposal ESI Template can be unarchived if archived and associated with a Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      }).then((result) => {
        cy.createCall({
          ...newCall,
          proposalWorkflowId: workflowId,
          esiTemplateId: result.createTemplate.templateId,
        });
      });

      shouldUnarchiveArchivedTemplate(templateName, '/EsiTemplates');
    });

    it('Proposal ESI Template can be unarchived if archived and not associated with a Call', () => {
      cy.createTemplate({
        groupId: TemplateGroupId.PROPOSAL_ESI,
        name: templateName,
      });

      shouldUnarchiveArchivedTemplate(templateName, '/EsiTemplates');
    });
  });

  describe('Sample ESI template Delete, Archive, Unarchive', () => {
    // TODO: Add tests after acquiring more information about the feature
  });
});
