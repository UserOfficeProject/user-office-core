import { faker } from '@faker-js/faker';
import {
  DataType,
  FeatureId,
  SettingsId,
  TechnicalReviewStatus,
  TemplateCategoryId,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';
import PdfParse from 'pdf-parse';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import settings from '../support/settings';

context('Proposal administration tests', () => {
  const proposalName1 = faker.lorem.words(3);
  const proposalAbstract1 = faker.lorem.paragraph(3);
  const proposalName2 = faker.lorem.words(3);
  const proposalFixedName = '0000. Alphabetically first title';
  const proposalFixedAbstract =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  const textUser = faker.lorem.words(5);
  const textManager = faker.lorem.words(5);

  const existingUserId = initialDBData.users.user1.id;
  const existingTopicId = 1;
  const existingQuestionaryId = 2;
  let createdProposalPk: number;
  let createdProposalId: string;
  let createdInstrumentId: number;

  const instrument1 = {
    name: `0000. ${faker.random.words(2)}`,
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: existingUserId,
  };
  const instrument2 = {
    name: `1111. ${faker.random.words(2)}`,
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: existingUserId,
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Proposal administration advanced search filter tests', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        cy.updateUserRoles({
          id: existingUserId,
          roles: [
            initialDBData.roles.user,
            initialDBData.roles.instrumentScientist,
          ],
        });
      }

      cy.createProposal({ callId: initialDBData.call.id }).then(
        ({ createProposal }) => {
          if (createProposal) {
            createdProposalPk = createProposal.primaryKey;
            createdProposalId = createProposal.proposalId;
            cy.updateProposal({
              proposalPk: createProposal.primaryKey,
              proposerId: existingUserId,
              title: proposalName1,
              abstract: proposalAbstract1,
            });
            cy.answerTopic({
              answers: [],
              topicId: existingTopicId,
              questionaryId: existingQuestionaryId,
              isPartialSave: false,
            });
            cy.submitProposal({
              proposalPk: createProposal.primaryKey,
            });

            cy.createInstrument(instrument1).then((result) => {
              if (result.createInstrument) {
                createdInstrumentId = result.createInstrument.id;

                cy.assignInstrumentToCall({
                  callId: initialDBData.call.id,
                  instrumentFapIds: [{ instrumentId: createdInstrumentId }],
                });
              }
            });
          }
        }
      );
      cy.login('officer');
      cy.visit('/');
    });

    it('Should not be able to administer proposal if not assigned to instrument', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }

      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Admin').click();
      cy.get('[data-cy="no-instrument-message"]').should('exist');
    });

    it('Should be able to set comment for user/manager and final status', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }

      cy.assignProposalsToInstruments({
        instrumentIds: [initialDBData.instrument1.id],
        proposalPks: [createdProposalPk],
      });

      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Admin').click();
      cy.get('[data-cy="proposal-final-status"]').should('exist');
      cy.get('[role="dialog"]').contains('Logs').click();
      cy.get('[role="dialog"]').contains('Admin').click();

      cy.get('[data-cy="proposal-final-status"]').click();

      cy.get('li[data-cy="proposal-final-status-options"]')
        .contains('Accepted')
        .click();

      cy.get(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] label`
      ).should('include.text', initialDBData.call.allocationTimeUnit);

      cy.get(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      )
        .clear()
        .type('-123')
        .blur();
      cy.get<JQuery<HTMLInputElement>>(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          'Value must be greater than or equal to 0'
        );
      });

      cy.get(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      )
        .clear()
        .type('987654321')
        .blur();
      cy.get<JQuery<HTMLInputElement>>(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      ).then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.include(
          `Value must be less than or equal to ${1e5}`
        );
      });

      cy.get(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      )
        .clear()
        .type('20');

      cy.get('[data-cy="commentForUser"]').clear().type(textUser);
      cy.get('[data-cy="commentForManagement"]').clear().type(textManager);

      cy.on('window:confirm', (str) => {
        expect(str).to.equal(
          'Changes you recently made in this tab will be lost! Are you sure?'
        );

        return false;
      });

      cy.contains('Proposal information').click();

      cy.get('[data-cy="is-management-decision-submitted"]').click();

      cy.get('[data-cy="save-admin-decision"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.reload();

      cy.get('[data-cy="commentForUser"] textarea').should(
        'have.value',
        textUser
      );

      cy.get('[data-cy="commentForManagement"] textarea').should(
        'have.value',
        textManager
      );

      cy.get(
        `[data-cy="managementTimeAllocation-${createdInstrumentId}"] input`
      ).should('have.value', '20');

      cy.get('[data-cy="is-management-decision-submitted"] input').should(
        'have.value',
        'true'
      );

      cy.closeModal();

      cy.contains('Accepted');
      cy.contains('DRAFT');
      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper').contains('Final time allocation').click();
      cy.get('body').click();
      cy.contains(proposalName1)
        .parent()
        .should('include.text', initialDBData.call.allocationTimeUnit);
    });

    it('Should show warning if proposal status is changing to SCHEDULING and proposal has no instrument', () => {
      cy.contains('Proposals').click();

      if (proposalName1) {
        cy.contains(proposalName1).parent().find('[type="checkbox"]').check();
      } else {
        cy.get('[type="checkbox"]').first().check();
      }

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal(s) status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('SCHEDULING').click();

      cy.get('[role="alert"] .MuiAlert-message')
        .should('exist')
        .and(
          'contain.text',
          'Be aware that proposal/s not assigned to an instrument will not be shown in the scheduler after changing status to "SCHEDULING"'
        );
    });

    it('Should be able to re-open proposal for submission', () => {
      cy.contains('Proposals').click();

      if (proposalName1) {
        cy.contains(proposalName1).parent().find('[type="checkbox"]').check();
      } else {
        cy.get('[type="checkbox"]').first().check();
      }

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal(s) status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('DRAFT').click();

      cy.get('[role="alert"] .MuiAlert-message').contains(
        'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
      );

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.contains(proposalName1).parent().contains('No');

      if (featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        cy.logout();
      }

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposalName1)
        .parent()
        .get('[aria-label="Edit proposal"]')
        .click();

      cy.finishedLoading();
      cy.contains(proposalName1);

      cy.contains('Submit').parent().should('not.be.disabled');
    });

    it('If you select a tab in tabular view and reload the page it should stay on specific selected tab', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();

      cy.get('[role="dialog"]').find('[role="tab"]').contains('Logs').click();

      cy.reload();

      cy.get('button[role="tab"]')
        .contains('Logs')
        .should('have.attr', 'aria-selected', 'true');

      cy.get('[data-cy="event-logs-table"]').should('exist');

      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.reload();

      cy.get('button[role="tab"]')
        .contains('Technical review')
        .should('have.attr', 'aria-selected', 'true');
    });

    it('Download proposal is working with dialog window showing up', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      cy.contains(proposalName1)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();
      cy.contains('Download as single file').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposalName1
      );

      cy.contains(proposalFixedName)
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

    it('Download proposal attachment(s) working with dialog window showing up', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      cy.createTopic({
        templateId: initialDBData.template.id,
        sortOrder: 1,
      }).then((topicResult) => {
        if (topicResult.createTopic) {
          const topicId =
            topicResult.createTopic.steps[
              topicResult.createTopic.steps.length - 1
            ].topic.id;
          cy.createQuestion({
            categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
            dataType: DataType.FILE_UPLOAD,
          }).then((questionResult) => {
            const createdQuestion = questionResult.createQuestion;
            if (createdQuestion) {
              cy.updateQuestion({
                id: createdQuestion.id,
                question: initialDBData.questions.fileUpload.text,
                config: `{"file_type":[".pdf",".docx","image/*"]}`,
              });
              cy.createQuestionTemplateRelation({
                templateId: initialDBData.template.id,
                sortOrder: 0,
                topicId: topicId,
                questionId: createdQuestion.id,
              });
            }
          });
        }
      });

      cy.contains(proposalName1)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Attachment(s)').click();

      cy.get('[data-cy="attachmentQuestionName"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.questions.fileUpload.text)
        .click();

      cy.get('[data-cy="proposalAttachmentDownloadButton"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        'attachment'
      );

      cy.get('[role="alert"]').should('exist');
      cy.get('[role="alert"]').contains('No attachments found');

      cy.contains(proposalFixedName)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Attachment(s)').click();

      cy.get('[data-cy="attachmentQuestionName"]').click();
      cy.get('[role="presentation"]')
        .contains(initialDBData.questions.fileUpload.text)
        .click();

      cy.get('[data-cy="proposalAttachmentDownloadButton"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        '2 selected items'
      );

      cy.get('[role="alert"]').should('exist');
      cy.get('[role="alert"]').contains('No attachments found');
    });

    it('Downloaded proposal filename format is RB_SURNAME_YYYY', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        //temporarily skipping, until issue is fixed on github actions
        this.skip();
      }
      cy.contains('Proposals').click();

      cy.contains(proposalName1)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();

      cy.contains('Download as single file').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposalName1
      );

      const currentYear = new Date().getFullYear();
      const downloadedFileName = `${createdProposalId}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const downloadsFolder = Cypress.config('downloadsFolder');
      const downloadFilePath = `${downloadsFolder}/${downloadedFileName}`;

      cy.readFile(downloadFilePath).should('exist');
    });

    it('Should be able to download proposal PDFs and verify their content', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        //temporarily skipping, until issue is fixed on github actions
        this.skip();
      }

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          const newlyCreatedProposalId = result.createProposal.proposalId;
          const newlyCreatedProposalPk = result.createProposal.primaryKey;
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalFixedAbstract,
          });

          const token = window.localStorage.getItem('token');

          if (!token) {
            throw new Error('Token not provided');
          }

          const currentYear = new Date().getFullYear();
          const downloadedFileName = `${currentYear}_${initialDBData.users.user1.lastName}_${newlyCreatedProposalId}.pdf`;
          const downloadsFolder = Cypress.config('downloadsFolder');
          const downloadFilePath = `${downloadsFolder}/${downloadedFileName}`;

          cy.task('downloadFile', {
            url: `${Cypress.config(
              'baseUrl'
            )}/download/pdf/proposal/${newlyCreatedProposalPk}`,
            token: token,
            filename: downloadedFileName,
            downloadsFolder: downloadsFolder,
          });

          cy.task('readPdf', downloadFilePath).then((args) => {
            const { text, numpages } = args as PdfParse.Result;

            expect(text).to.include(newlyCreatedProposalId);
            expect(text).to.include(proposalFixedName);
            expect(text).to.include(proposalFixedAbstract);

            expect(numpages).to.equal(1);
          });

          // NOTE: We can't test the multi file download file size because the title and abstract are random and it can vary between some numbers. That's why we only test the file content.
          const downloadedMultiFileName = `${currentYear}_proposals_${createdProposalPk}_${newlyCreatedProposalPk}.pdf`;
          const multiFileDownloadPath = `${downloadsFolder}/${downloadedMultiFileName}`;

          cy.task('downloadFile', {
            url: `${Cypress.config(
              'baseUrl'
            )}/download/pdf/proposal/${createdProposalPk},${newlyCreatedProposalPk}`,
            token,
            filename: downloadedMultiFileName,
            downloadsFolder: downloadsFolder,
          });

          cy.task('readPdf', multiFileDownloadPath).then((args) => {
            const { text, numpages } = args as PdfParse.Result;

            expect(text).to.include(createdProposalId);
            expect(text).to.include(proposalName1);
            expect(text).to.include(proposalAbstract1);
            expect(text).to.include(newlyCreatedProposalId);
            expect(text).to.include(proposalFixedName);
            expect(text).to.include(proposalFixedAbstract);

            expect(numpages).to.equal(2);
          });

          // NOTE: We can't test the multi file download file size because the title and abstract are random and it can vary between some numbers. That's why we only test the file content.
          const downloadedMultiFileZipName = `${currentYear}_proposals.zip`;
          const multiFileZipDownloadPath = `${downloadsFolder}/${downloadedMultiFileZipName}`;

          cy.task('downloadFile', {
            url: `${Cypress.config(
              'baseUrl'
            )}/download/zip/proposal/${createdProposalPk},${newlyCreatedProposalPk}`,
            token,
            filename: downloadedMultiFileZipName,
            downloadsFolder: downloadsFolder,
          });

          const extractedFilesDir = `${downloadsFolder}/${currentYear}_proposals_extracted`;

          cy.task('unzip', {
            source: multiFileZipDownloadPath,
            destination: extractedFilesDir,
          });

          cy.task(
            'readPdf',
            `${extractedFilesDir}/${newlyCreatedProposalId}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`
          ).then((args) => {
            const { text, numpages } = args as PdfParse.Result;

            expect(text).to.include(newlyCreatedProposalId);
            expect(text).to.include(proposalFixedName);
            expect(text).to.include(proposalFixedAbstract);

            expect(numpages).to.equal(1);
          });

          cy.task(
            'readPdf',
            `${extractedFilesDir}/${createdProposalId}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`
          ).then((args) => {
            const { text, numpages } = args as PdfParse.Result;

            expect(text).to.include(createdProposalId);
            expect(text).to.include(proposalName1);
            expect(text).to.include(proposalAbstract1);

            expect(numpages).to.equal(1);
          });
        }
      });
    });

    it('Should be able to download proposal pdf', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        //temporarily skipping, until issue is fixed on github actions
        this.skip();
      }
      cy.contains('Proposals').click();

      const token = window.localStorage.getItem('token');

      cy.request({
        url: '/download/pdf/proposal/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        expect(response.headers['content-type']).to.be.equal('application/pdf');
        expect(response.status).to.be.equal(200);
      });
    });

    it('Should be able to save table selection state in url', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[type="checkbox"]').eq(1).click();

      cy.url().should('contain', 'selection=');

      cy.reload();

      cy.contains('1 row(s) selected');
    });

    it('Should be able to save table search state in url', () => {
      cy.contains('Proposals').click();

      cy.get('[placeholder="Search"]').type('test');

      cy.url().should('contain', 'search=test');

      cy.reload();

      cy.get('[placeholder="Search"]').should('have.value', 'test');
    });

    it('Should be able to save table sort state in url', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      let officerProposalsTableAsTextBeforeSort = '';
      let officerProposalsTableAsTextAfterSort = '';

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextBeforeSort = element.text();
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextAfterSort = element.text();
      });

      cy.reload();

      cy.finishedLoading();

      cy.contains(proposalFixedName);

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        expect(element.text()).to.be.equal(
          officerProposalsTableAsTextAfterSort
        );
        expect(element.text()).not.equal(officerProposalsTableAsTextBeforeSort);
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'ascending');

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('Short Code')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.reload();

      cy.finishedLoading();

      cy.contains('Short Code')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'ascending');
    });

    it('Should not save table sort if it is not present in the url', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      let officerProposalsTableAsTextBeforeSort = '';

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextBeforeSort = element.text();
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-menu-items"]').contains('Calls').click();

      cy.finishedLoading();

      cy.contains(initialDBData.call.shortCode);

      cy.get('[data-cy="officer-menu-items"]').contains('Proposals').click();

      cy.finishedLoading();

      cy.contains(proposalFixedName);

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        expect(element.text()).to.be.equal(
          officerProposalsTableAsTextBeforeSort
        );
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('not.have.attr', 'aria-sort', 'ascending');
    });

    it('Should preserve the ordering when row is selected', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            title: proposalFixedName,
            abstract: proposalName2,
            proposerId: existingUserId,
          });
        }
      });
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('table tbody tr').eq(1).contains(proposalFixedName);
      cy.contains('Title').click();
      cy.finishedLoading();
      cy.get('table tbody tr').eq(0).contains(proposalFixedName);

      cy.get('table tbody tr input[type="checkbox"]').first().click();

      cy.get('table tbody tr').eq(0).contains(proposalFixedName);
    });

    it('Should be able to sort propsals by instrument and technical review fields', () => {
      if (
        settings
          .getEnabledSettings()
          .get(SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS) !==
        'FEASIBILITY'
      ) {
        cy.addFeasibilityReviewToDefaultWorkflow();
      }
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const proposalPk = result.createProposal.primaryKey;
        if (proposalPk) {
          cy.updateProposal({
            proposalPk: proposalPk,
            title: proposalFixedName,
            abstract: proposalName2,
            proposerId: existingUserId,
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [createdInstrumentId],
            proposalPks: [proposalPk],
          });

          cy.addProposalTechnicalReview({
            proposalPk: proposalPk,
            status: TechnicalReviewStatus.FEASIBLE,
            timeAllocation: 1,
            submitted: true,
            reviewerId: initialDBData.users.officer.id,
            instrumentId: createdInstrumentId,
            questionaryId: initialDBData.technicalReview.questionaryId,
          });
        }
      });

      cy.createInstrument(instrument2).then((result) => {
        const instrumentId = result.createInstrument.id;
        if (instrumentId) {
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: instrumentId }],
          });

          cy.assignProposalsToInstruments({
            instrumentIds: [instrumentId],
            proposalPks: [createdProposalPk],
          });

          cy.addProposalTechnicalReview({
            proposalPk: createdProposalPk,
            status: TechnicalReviewStatus.PARTIALLY_FEASIBLE,
            timeAllocation: 1,
            submitted: true,
            reviewerId: initialDBData.users.officer.id,
            instrumentId: instrumentId,
            questionaryId: initialDBData.technicalReview.questionaryId,
          });
        }
      });

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('th.MuiTableCell-root').contains('Instrument').click();
      cy.get('table tbody tr').eq(0).contains(proposalFixedName);
      cy.get('table tbody tr').eq(0).contains(instrument1.name);
      cy.get('table tbody tr').eq(1).contains(proposalName1);
      cy.get('table tbody tr').eq(1).contains(instrument2.name);
      cy.get('th.MuiTableCell-root').contains('Instrument').click();
      cy.finishedLoading();
      cy.get('table tbody tr').eq(0).contains(proposalName1);
      cy.get('table tbody tr').eq(0).contains(instrument2.name);
      cy.get('table tbody tr').eq(1).contains(proposalFixedName);
      cy.get('table tbody tr').eq(1).contains(instrument1.name);

      cy.visit('/');

      cy.finishedLoading();
      cy.get('th.MuiTableCell-root').contains('Technical status').click();
      cy.finishedLoading();
      cy.get('table tbody tr').eq(1).contains(proposalName1);
      cy.get('table tbody tr').eq(1).contains(instrument2.name);
      cy.get('table tbody tr').eq(0).contains(proposalFixedName);
      cy.get('table tbody tr').eq(0).contains(instrument1.name);
      cy.get('th.MuiTableCell-root').contains('Technical status').click();
      cy.finishedLoading();
      cy.get('table tbody tr').eq(0).contains(proposalName1);
      cy.get('table tbody tr').eq(0).contains(instrument2.name);
      cy.get('table tbody tr').eq(1).contains(proposalFixedName);
      cy.get('table tbody tr').eq(1).contains(instrument1.name);
    });

    it('User officer should see Reviews tab before doing the Admin(management decision)', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy=view-proposal]').first().click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('FAP reviews').click();

      cy.get('[role="dialog"]').contains('External reviews');
    });
  });

  describe('Proposal administration advanced search tests', () => {
    beforeEach(() => {
      cy.resetDB(true);

      cy.viewport(1920, 1080);

      cy.login('officer');

      cy.visit('/');

      cy.get('[data-cy=call-filter]').click();

      cy.get('[role=listbox]').contains('call 1').first().click();
    });

    it('Should be able to search Boolean question', () => {
      // If answer true, find when search for Yes
      cy.answerTopic({
        questionaryId: existingQuestionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [
          {
            questionId: initialDBData.questions.boolean.id,
            value: '{"value":true}',
          },
        ],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');

      // If answer false, find when search for No
      cy.answerTopic({
        questionaryId: existingQuestionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [
          {
            questionId: initialDBData.questions.boolean.id,
            value: '{"value":false}',
          },
        ],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      // If missing answer, do not find the result for both, Yes and No
      cy.answerTopic({
        questionaryId: existingQuestionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');
    });

    it('Should be able to search Date question', () => {
      // Date questions
      const { questions, proposal, answers } = initialDBData;

      const DATE_ANSWER = answers.proposal.date.value;

      const DATE_BEFORE = DateTime.fromFormat(
        DATE_ANSWER,
        initialDBData.getFormats().dateFormat
      )
        .minus({ days: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);

      const DATE_AFTER = DateTime.fromFormat(
        DATE_ANSWER,
        initialDBData.getFormats().dateFormat
      )
        .plus({ days: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);

      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.date.text).click();

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Exact').click();
      cy.setDatePickerValue('input#date-value', DATE_BEFORE);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Exact').click();
      cy.setDatePickerValue('input#date-value', DATE_ANSWER);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('After').click();
      cy.setDatePickerValue('input#date-value', DATE_BEFORE);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Before').click();
      cy.setDatePickerValue('input#date-value', DATE_BEFORE);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('After').click();
      cy.setDatePickerValue('input#date-value', DATE_AFTER);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Before').click();
      cy.setDatePickerValue('input#date-value', DATE_AFTER);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Select from options question', () => {
      const { questions, proposal, answers } = initialDBData;

      // Selection from options questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(questions.selectionFromOptions.text).click();

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]').contains('Two').click();

      cy.contains('Search').click();

      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]')
        .contains(answers.proposal.selectionFromOptions.value[0])
        .click();

      cy.contains('Search').click();

      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Text question', () => {
      const { questions, proposal, answers } = initialDBData;

      // Text questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.textInput.text).click();
      cy.get('[name=value]').clear().type(faker.lorem.words(3));
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.finishedLoading();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[name=value]').clear().type(answers.proposal.textInput.value);
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.finishedLoading();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search File upload question', () => {
      const { questions, proposal } = initialDBData;

      // File upload questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.fileUpload.text).click();
      cy.get('[data-cy=has-attachments]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=has-attachments]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
    });

    it('Should be able to search Number input question', () => {
      const { questions, proposal, answers } = initialDBData;
      // NumberInput questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.numberInput.text).click();
      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value - 1).toString());
      cy.get('[data-cy=unit-select]').click();
      cy.get('[role=listbox]')
        .contains(answers.proposal.numberInput.value.unit.symbol)
        .click();
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');

      // NumberInput questions - Equals
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Equals').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.numberInput.value.value.toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');

      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value - 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Interval input question', () => {
      const { questions, proposal, answers } = initialDBData;
      // Interval question
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.interval.text).click();
      // Interval question - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.interval.value.max.toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.interval.value.max + 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');

      // Interval question -  Greater than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Greater than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.interval.value.min.toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.interval.value.min - 1).toString());
      cy.get('[data-cy="search-btn"]').focus().click();
      cy.contains(proposal.title).should('exist');
    });
  });

  describe('Proposal administration API token access', () => {
    let createdProposalPk: number;
    let createdProposalId: string;
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;
          cy.updateProposal({
            proposalPk: createdProposalPk,
            proposerId: existingUserId,
            title: proposalName1,
            abstract: proposalName1,
          });
          cy.answerTopic({
            answers: [],
            topicId: existingTopicId,
            questionaryId: existingQuestionaryId,
            isPartialSave: false,
          });
          cy.submitProposal({
            proposalPk: createdProposalPk,
          });
        }
      });

      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to download proposal pdf with valid API token', function () {
      const accessTokenName = faker.lorem.words(2);
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions: '{"FactoryServices.getPdfProposals":true}',
      });

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

      cy.contains('Other Services').click();

      cy.contains('FactoryServices.getPdfProposals');
      cy.get('#accessToken')
        .invoke('val')
        .then((value) => {
          const accessToken = value as string;
          cy.request({
            url: `/download/pdf/proposal/${createdProposalPk}`,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.be.equal(
              'application/pdf'
            );
            expect(response.status).to.be.equal(200);
          });
          cy.request({
            url: `/download/pdf/proposal/${createdProposalId}?filter=id`,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.be.equal(
              'application/pdf'
            );
            expect(response.status).to.be.equal(200);
          });
        });
    });

    it('Should not be able to download proposal pdf with invalid API token', () => {
      const accessTokenName = faker.lorem.words(2);
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions: '{"ProposalQueries.getAll":true}',
      });

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

      cy.contains('Other Services').click();

      cy.contains('FactoryServices.getPdfProposals').should('not.be.checked');

      cy.get('#accessToken')
        .invoke('val')
        .then((value) => {
          const accessToken = value as string;
          cy.request({
            url: `/download/pdf/proposal/${createdProposalPk}`,
            failOnStatusCode: false,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).not.be.equal(
              'application/pdf'
            );
            expect(response.status).not.equal(200);
          });

          cy.request({
            url: `/download/pdf/proposal/${createdProposalId}?filter=id`,
            failOnStatusCode: false,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).not.be.equal(
              'application/pdf'
            );
            expect(response.status).not.equal(200);
          });
        });
    });
  });

  describe('Proposal administration download pdf tests', () => {
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalName1,
            abstract: proposalName1,
          });
        }
      });

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
            proposerId: existingUserId,
            title: proposalName2,
            abstract: proposalName2,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to download multiple proposals as a zip, when more than one proposal is being selected', () => {
      cy.get('[type="checkbox"]').eq(1).click();
      cy.get('[type="checkbox"]').eq(2).click();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();
      cy.contains('Download as single file').should('exist');
      cy.contains('Download as multiple files').click();
    });

    it('Should not be able to download multiple proposals as a zip, when only one proposal is selected', () => {
      cy.get('[type="checkbox"]').eq(1).click();

      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();

      cy.contains('Download as single file').should('exist');
      cy.contains('Download as multiple files').should('not.exist');
    });
  });
});
