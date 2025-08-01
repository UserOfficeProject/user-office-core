import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  FeatureId,
  FeatureUpdateAction,
} from '@user-office-software-libs/shared-types';
import {
  Event as PROPOSAL_EVENTS,
  StatusActionType,
} from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';
import PdfParse from 'pdf-parse';
import 'cypress-wait-until';

import featureFlags from '../support/featureFlags';
import { DownloadFileResult } from '../support/fileUtilTasks';
import initialDBData from '../support/initialDBData';

context('Pregenerated PDF tests', () => {
  const currentDayStart = DateTime.now().startOf('day');

  const newCall = {
    shortCode: faker.string.alphanumeric(15),
    startCall: faker.date.past().toISOString(),
    endCall: faker.date.future().toISOString(),
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
    fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
    technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(10),
    surveyComment: faker.lorem.word(10),
  };

  let callId: number;

  let proposalPk1: number;
  let proposalId1: string;

  let proposalPk2: number;
  let proposalId2: string;

  let proposalPk3: number;
  let proposalId3: string;

  let fileId1: string;

  let instrumentId: number;

  const proposalTitle1 = faker.lorem.words(3);
  const proposalAbstract1 = faker.lorem.words(5);

  const proposalTitle2 = faker.lorem.words(3);
  const proposalAbstract2 = faker.lorem.words(5);

  const proposalTitle3 = faker.lorem.words(3);
  const proposalAbstract3 = faker.lorem.words(5);

  const currentYear = new Date().getFullYear();
  const downloadsFolder: string = Cypress.config('downloadsFolder');

  const getSingleFileDownloadInfo = (proposalId: string) => {
    const downloadFileName = `${currentYear}_${initialDBData.users.user1.lastName}_${proposalId}.pdf`;
    const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

    return { downloadFileName, downloadFilePath };
  };

  const getMultiFileDownloadInfo = () => {
    const downloadFileName = `${currentYear}_proposals_${proposalPk1}_${proposalPk2}_${proposalPk3}.pdf`;
    const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

    return { downloadFileName, downloadFilePath };
  };

  const instrument = {
    name: `0000. ${faker.lorem.words(2)}`,
    shortCode: faker.string.alpha(15),
    description: faker.lorem.words(5),
    managerUserId: initialDBData.users.user2.id,
  };

  beforeEach(function () {
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    });
    cy.resetDB();

    cy.updateFeature({
      action: FeatureUpdateAction.ENABLE,
      featureIds: [FeatureId.PREGENERATED_PROPOSALS],
    });

    /*
    Work around an existing issue where the STFC
    environment cannot communicate with the factory.
    */
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }
    });

    cy.addWorkflowStatus({
      droppableGroupId: initialDBData.workflows.defaultDroppableGroup,
      statusId: initialDBData.proposalStatuses.editableSubmitted.id,
      workflowId: initialDBData.workflows.defaultWorkflow.id,
      sortOrder: 1,
      prevStatusId: initialDBData.proposalStatuses.draft.id,
    }).then((result) => {
      const connection = result.addWorkflowStatus;
      if (connection) {
        cy.addStatusChangingEventsToConnection({
          workflowConnectionId: connection.id,
          statusChangingEvents: [PROPOSAL_EVENTS.PROPOSAL_SUBMITTED],
        });
        cy.addConnectionStatusActions({
          actions: [
            { actionId: 3, actionType: StatusActionType.PROPOSALDOWNLOAD },
          ],
          connectionId: connection.id,
          workflowId: initialDBData.workflows.defaultWorkflow.id,
        });
      }
    });

    cy.createCall({
      ...newCall,
      proposalWorkflowId: initialDBData.workflows.defaultWorkflow.id,
    })
      .then((result) => {
        callId = result.createCall.id;

        cy.createProposal({ callId: callId }).then((result) => {
          proposalPk1 = result.createProposal.primaryKey;

          if (proposalPk1) {
            cy.updateProposal({
              proposalPk: proposalPk1,
              title: proposalTitle1,
              abstract: proposalAbstract1,
              proposerId: initialDBData.users.user1.id,
            }).then(() => {
              cy.submitProposal({ proposalPk: proposalPk1 }).then((result) => {
                proposalId1 = result.submitProposal.proposalId;
              });
            });
          }
        });
      })
      .then(() => {
        cy.createProposal({ callId: callId }).then((result) => {
          proposalPk2 = result.createProposal.primaryKey;

          if (proposalPk2) {
            cy.updateProposal({
              proposalPk: proposalPk2,
              title: proposalTitle2,
              abstract: proposalAbstract2,
              proposerId: initialDBData.users.user1.id,
            }).then(() => {
              cy.submitProposal({ proposalPk: proposalPk2 }).then((result) => {
                proposalId2 = result.submitProposal.proposalId;
              });
            });
          }
        });
      })
      .then(() => {
        cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
          proposalPk3 = result.createProposal.primaryKey;
          proposalId3 = result.createProposal.proposalId;

          if (proposalPk3) {
            cy.updateProposal({
              proposalPk: proposalPk3,
              title: proposalTitle3,
              abstract: proposalAbstract3,
              proposerId: initialDBData.users.user1.id,
            });
          }
        });
      })
      .then(() => {
        cy.updateUserRoles({
          id: initialDBData.users.user2.id,
          roles: [initialDBData.roles.instrumentScientist],
        });

        cy.createInstrument(instrument)
          .then((result) => {
            if (result.createInstrument) {
              instrumentId = result.createInstrument.id;
            }
          })
          .then(() => {
            cy.assignInstrumentToCall({
              callId: callId,
              instrumentFapIds: [{ instrumentId: instrumentId }],
            }).then(() => {
              cy.assignInstrumentToCall({
                callId: initialDBData.call.id,
                instrumentFapIds: [{ instrumentId: instrumentId }],
              }).then(() => {
                cy.assignProposalsToInstruments({
                  proposalPks: [
                    Number(proposalPk1),
                    Number(proposalPk2),
                    Number(proposalPk3),
                  ],
                  instrumentIds: [instrumentId],
                });
              });
            });
          });
      });

    // Wait until the PDFs have been generated before starting the tests
    cy.waitUntil(
      () =>
        cy.getProposals({ filter: { callId: callId } }).then((result) => {
          const proposals = result.proposals?.proposals;

          if (!Array.isArray(proposals) || proposals.length === 0) {
            return false;
          }

          if (proposals.every((p) => p.fileId !== null)) {
            fileId1 =
              proposals.find((p) => p.primaryKey === proposalPk1)?.fileId || '';

            return true;
          }

          return false;
        }),
      {
        timeout: 30000,
        interval: 1000,
        errorMsg:
          'Setup failed: status action download did not complete in time',
      }
    );
  });

  it('User can download a single pregenerated PDF', () => {
    cy.login('user1', initialDBData.roles.user).then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName, downloadFilePath } =
        getSingleFileDownloadInfo(proposalId1);

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      cy.updateProposal({
        proposalPk: proposalPk1,
        title: proposalTitle2,
        abstract: proposalAbstract2,
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.true;
        });

        cy.task('readPdf', downloadFilePath).then((args) => {
          const { text } = args as PdfParse.Result;

          // The PDF does not show the proposal update because it is pregenerated.
          expect(text).to.include(proposalId1);
          expect(text).to.include(proposalTitle1);
          expect(text).to.include(proposalAbstract1);

          expect(text).to.not.include(proposalTitle2);
          expect(text).to.not.include(proposalAbstract2);
        });
      });
    });
  });

  it('User cannot download another users pregenerated PDF', () => {
    cy.login('user1', initialDBData.roles.user).then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName } = getSingleFileDownloadInfo(proposalId1);

      cy.updateProposal({
        proposalPk: proposalPk1,
        title: proposalTitle1,
        abstract: proposalAbstract1,
        proposerId: initialDBData.users.user2.id,
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.false;
          expect(result.message).to.include('Bad status code: 500');
        });
      });
    });
  });

  it('User can download a pregenerated PDF if they are coproposer', () => {
    cy.login('user1', initialDBData.roles.user).then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName } = getSingleFileDownloadInfo(proposalId1);

      cy.updateProposal({
        proposalPk: proposalPk2,
        title: proposalTitle2,
        abstract: proposalAbstract2,
        proposerId: initialDBData.users.user2.id,
        users: [initialDBData.users.user1.id],
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.true;
        });
      });
    });
  });

  it('User officer can download a single pregenerated PDF', () => {
    cy.login('officer').then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName, downloadFilePath } =
        getSingleFileDownloadInfo(proposalId1);

      cy.task('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
        token: token,
        filename: downloadFileName,
        downloadsFolder: downloadsFolder,
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      cy.updateProposal({
        proposalPk: proposalPk1,
        title: proposalTitle2,
        abstract: proposalAbstract2,
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.true;
        });

        cy.task('readPdf', downloadFilePath).then((args) => {
          const { text } = args as PdfParse.Result;

          // The PDF does not show the proposal update because it is pregenerated.
          expect(text).to.include(proposalId1);
          expect(text).to.include(proposalTitle1);
          expect(text).to.include(proposalAbstract1);

          expect(text).to.not.include(proposalTitle2);
          expect(text).to.not.include(proposalAbstract2);
        });
      });
    });
  });

  it('User officer can download pregenerated and generated PDFs in a merged PDF download', () => {
    cy.login('officer').then(() => {
      cy.createProposal({ callId: callId });
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName, downloadFilePath } = getMultiFileDownloadInfo();

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);

        expect(text).to.include(proposalId2);
        expect(text).to.include(proposalTitle2);
        expect(text).to.include(proposalAbstract2);

        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalAbstract3);
      });

      const newProposalTitle2 = faker.lorem.words(3);
      const newProposalAbstract2 = faker.lorem.words(5);

      const newProposalTitle3 = faker.lorem.words(3);
      const newProposalAbstract3 = faker.lorem.words(5);

      cy.updateProposal({
        proposalPk: proposalPk2,
        title: newProposalTitle2,
        abstract: newProposalAbstract2,
      }).then(() => {
        cy.updateProposal({
          proposalPk: proposalPk3,
          title: newProposalTitle3,
          abstract: newProposalAbstract3,
        }).then(() => {
          cy.task<DownloadFileResult>('downloadFile', {
            url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
            token,
            filename: downloadFileName,
            downloadsFolder,
          }).then((result: DownloadFileResult) => {
            expect(result.success).to.be.true;
          });

          cy.task('readPdf', downloadFilePath).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId1);
            expect(text).to.include(proposalTitle1);
            expect(text).to.include(proposalAbstract1);

            // The update to proposal 2 is not reflected because it is pregenerated.
            expect(text).to.include(proposalId2);
            expect(text).to.include(proposalTitle2);
            expect(text).to.include(proposalAbstract2);

            expect(text).to.not.include(newProposalTitle2);
            expect(text).to.not.include(newProposalAbstract2);

            // The update to proposal 3 is reflected because it is generated.
            expect(text).to.include(proposalId3);
            expect(text).to.include(newProposalTitle3);
            expect(text).to.include(newProposalAbstract3);

            expect(text).to.not.include(proposalTitle3);
            expect(text).to.not.include(proposalTitle3);
          });
        });
      });
    });
  });

  it('User officer can download pregenerated and generated PDFs in a zip', () => {
    cy.login('user1', initialDBData.roles.user).then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const downloadFileName = `proposals_01.zip`;
      const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/zip/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      const extractedFilesDir = `${downloadsFolder}/proposals_extracted_01`;

      cy.task('unzip', {
        source: downloadFilePath,
        destination: extractedFilesDir,
      });

      const pdfFilePath1 = `${extractedFilesDir}/${proposalId1}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const pdfFilePath2 = `${extractedFilesDir}/${proposalId2}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const pdfFilePath3 = `${extractedFilesDir}/${proposalId3}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;

      cy.log(proposalTitle1);

      cy.task('readPdf', pdfFilePath1).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      cy.task('readPdf', pdfFilePath2).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId2);
        expect(text).to.include(proposalTitle2);
        expect(text).to.include(proposalAbstract2);
      });

      cy.task('readPdf', pdfFilePath3).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId3);
        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalAbstract3);
      });

      const newProposalTitle2 = faker.lorem.words(3);
      const newProposalAbstract2 = faker.lorem.words(5);

      const newProposalTitle3 = faker.lorem.words(3);
      const newProposalAbstract3 = faker.lorem.words(5);

      cy.updateProposal({
        proposalPk: proposalPk2,
        title: newProposalTitle2,
        abstract: newProposalAbstract2,
      }).then(() => {
        cy.updateProposal({
          proposalPk: proposalPk3,
          title: newProposalTitle3,
          abstract: newProposalAbstract3,
        }).then(() => {
          const downloadFileName = `proposals_02.zip`;
          const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

          cy.task<DownloadFileResult>('downloadFile', {
            url: `${Cypress.config('baseUrl')}/download/zip/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
            token,
            filename: downloadFileName,
            downloadsFolder,
          }).then((result: DownloadFileResult) => {
            expect(result.success).to.be.true;
          });

          const extractedFilesDir = `${downloadsFolder}/proposals_extracted_02`;

          cy.task('unzip', {
            source: downloadFilePath,
            destination: extractedFilesDir,
          });

          const pdfFilePath1 = `${extractedFilesDir}/${proposalId1}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
          const pdfFilePath2 = `${extractedFilesDir}/${proposalId2}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
          const pdfFilePath3 = `${extractedFilesDir}/${proposalId3}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;

          cy.task('readPdf', pdfFilePath1).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId1);
            expect(text).to.include(proposalTitle1);
            expect(text).to.include(proposalAbstract1);
          });

          // The update to proposal 2 is not reflected because it is pregenerated.
          cy.task('readPdf', pdfFilePath2).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId2);
            expect(text).to.include(proposalTitle2);
            expect(text).to.include(proposalAbstract2);

            expect(text).to.not.include(newProposalTitle2);
            expect(text).to.not.include(newProposalAbstract2);
          });

          // The update to proposal 3 is reflected because it is generated.
          cy.task('readPdf', pdfFilePath3).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId3);
            expect(text).to.include(newProposalTitle3);
            expect(text).to.include(newProposalAbstract3);

            expect(text).to.not.include(proposalTitle3);
            expect(text).to.not.include(proposalAbstract3);
          });
        });
      });
    });
  });

  it('Pregenerated PDF is overwritten via status action replay', () => {
    cy.log('start of test');
    cy.login('officer').then(() => {
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      /*
      The initial pregenerated PDF should contain its initial information.
      */

      const { downloadFileName, downloadFilePath } =
        getSingleFileDownloadInfo(proposalId1);

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      /*
      Update the proposal and verify that its information has not changed.
      */

      const newProposalTitle = faker.lorem.words(3);
      const newProposalAbstract = faker.lorem.words(5);

      cy.updateProposal({
        proposalPk: proposalPk1,
        title: newProposalTitle,
        abstract: newProposalAbstract,
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.true;
        });
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;
        cy.log('1');

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);

        expect(text).to.not.include(newProposalTitle);
        expect(text).to.not.include(newProposalTitle);
      });

      /*
      Replay the status action for the call to regenerate the PDF
      and verify that the information has been updated.
      */

      cy.visit('/');

      cy.navigateToStatusActionLogsSubmenu('Proposal Download');

      cy.get('[data-cy="replay_status_action_icon"]')
        .last()
        .click({ force: true });

      cy.contains('unexpected behaviour').should('exist');

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Status action replay successfully sent.',
      });

      let newFileId: string;

      // Wait until the proposal has been regenerated.
      cy.waitUntil(
        () =>
          cy.getProposals({ filter: { callId: callId } }).then((result) => {
            const proposals = result.proposals?.proposals;

            if (!Array.isArray(proposals) || proposals.length === 0) {
              return false;
            }

            newFileId =
              proposals.find((p) => p.primaryKey === proposalPk1)?.fileId || '';

            return newFileId != null && newFileId != fileId1;
          }),
        {
          timeout: 30000,
          interval: 1000,
          errorMsg:
            'The proposal file ID did not update after status action replay',
        }
      );

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(newProposalTitle);
        expect(text).to.include(newProposalAbstract);

        expect(text).to.not.include(proposalTitle1);
        expect(text).to.not.include(proposalAbstract1);
      });
    });
  });

  it('Scientist can download a single pregenerated PDF', () => {
    cy.login(initialDBData.users.user2).then(() => {
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);

      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName, downloadFilePath } =
        getSingleFileDownloadInfo(proposalId1);

      cy.task('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
        token: token,
        filename: downloadFileName,
        downloadsFolder: downloadsFolder,
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      cy.updateProposal({
        proposalPk: proposalPk1,
        title: proposalTitle2,
        abstract: proposalAbstract2,
      }).then(() => {
        cy.task<DownloadFileResult>('downloadFile', {
          url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1}`,
          token,
          filename: downloadFileName,
          downloadsFolder,
        }).then((result: DownloadFileResult) => {
          expect(result.success).to.be.true;
        });

        cy.task('readPdf', downloadFilePath).then((args) => {
          const { text } = args as PdfParse.Result;

          // The PDF does not show the proposal update because it is pregenerated.
          expect(text).to.include(proposalId1);
          expect(text).to.include(proposalTitle1);
          expect(text).to.include(proposalAbstract1);

          expect(text).to.not.include(proposalTitle2);
          expect(text).to.not.include(proposalAbstract2);
        });
      });
    });
  });

  it('Scientist can download pregenerated and generated PDFs in a merged PDF download', () => {
    cy.login(initialDBData.users.user2).then(() => {
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);
      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const { downloadFileName, downloadFilePath } = getMultiFileDownloadInfo();

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      cy.task('readPdf', downloadFilePath).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);

        expect(text).to.include(proposalId2);
        expect(text).to.include(proposalTitle2);
        expect(text).to.include(proposalAbstract2);

        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalAbstract3);
      });

      const newProposalTitle2 = faker.lorem.words(3);
      const newProposalAbstract2 = faker.lorem.words(5);

      const newProposalTitle3 = faker.lorem.words(3);
      const newProposalAbstract3 = faker.lorem.words(5);

      cy.updateProposal({
        proposalPk: proposalPk2,
        title: newProposalTitle2,
        abstract: newProposalAbstract2,
      }).then(() => {
        cy.updateProposal({
          proposalPk: proposalPk3,
          title: newProposalTitle3,
          abstract: newProposalAbstract3,
        }).then(() => {
          cy.task<DownloadFileResult>('downloadFile', {
            url: `${Cypress.config('baseUrl')}/download/pdf/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
            token,
            filename: downloadFileName,
            downloadsFolder,
          }).then((result: DownloadFileResult) => {
            expect(result.success).to.be.true;
          });

          cy.task('readPdf', downloadFilePath).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId1);
            expect(text).to.include(proposalTitle1);
            expect(text).to.include(proposalAbstract1);

            // The update to proposal 2 is not reflected because it is pregenerated.
            expect(text).to.include(proposalId2);
            expect(text).to.include(proposalTitle2);
            expect(text).to.include(proposalAbstract2);

            expect(text).to.not.include(newProposalTitle2);
            expect(text).to.not.include(newProposalAbstract2);

            // The update to proposal 3 is reflected because it is generated.
            expect(text).to.include(proposalId3);
            expect(text).to.include(newProposalTitle3);
            expect(text).to.include(newProposalAbstract3);

            expect(text).to.not.include(proposalTitle3);
            expect(text).to.not.include(proposalTitle3);
          });
        });
      });
    });
  });

  it('Scientist can download pregenerated and generated PDFs in a zip', () => {
    cy.login(initialDBData.users.user2).then(() => {
      cy.changeActiveRole(initialDBData.roles.instrumentScientist);

      const token = window.localStorage.getItem('token');

      if (!token) {
        throw new Error('Token not provided');
      }

      const downloadFileName = `proposals_01.zip`;
      const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

      cy.task<DownloadFileResult>('downloadFile', {
        url: `${Cypress.config('baseUrl')}/download/zip/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
        token,
        filename: downloadFileName,
        downloadsFolder,
      }).then((result: DownloadFileResult) => {
        expect(result.success).to.be.true;
      });

      const extractedFilesDir = `${downloadsFolder}/proposals_extracted_01`;

      cy.task('unzip', {
        source: downloadFilePath,
        destination: extractedFilesDir,
      });

      const pdfFilePath1 = `${extractedFilesDir}/${proposalId1}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const pdfFilePath2 = `${extractedFilesDir}/${proposalId2}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const pdfFilePath3 = `${extractedFilesDir}/${proposalId3}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;

      cy.log(proposalTitle1);

      cy.task('readPdf', pdfFilePath1).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId1);
        expect(text).to.include(proposalTitle1);
        expect(text).to.include(proposalAbstract1);
      });

      cy.task('readPdf', pdfFilePath2).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId2);
        expect(text).to.include(proposalTitle2);
        expect(text).to.include(proposalAbstract2);
      });

      cy.task('readPdf', pdfFilePath3).then((args) => {
        const { text } = args as PdfParse.Result;

        expect(text).to.include(proposalId3);
        expect(text).to.include(proposalTitle3);
        expect(text).to.include(proposalAbstract3);
      });

      const newProposalTitle2 = faker.lorem.words(3);
      const newProposalAbstract2 = faker.lorem.words(5);

      const newProposalTitle3 = faker.lorem.words(3);
      const newProposalAbstract3 = faker.lorem.words(5);

      cy.updateProposal({
        proposalPk: proposalPk2,
        title: newProposalTitle2,
        abstract: newProposalAbstract2,
      }).then(() => {
        cy.updateProposal({
          proposalPk: proposalPk3,
          title: newProposalTitle3,
          abstract: newProposalAbstract3,
        }).then(() => {
          const downloadFileName = `proposals_02.zip`;
          const downloadFilePath = `${downloadsFolder}/${downloadFileName}`;

          cy.task<DownloadFileResult>('downloadFile', {
            url: `${Cypress.config('baseUrl')}/download/zip/proposal/${proposalPk1},${proposalPk2},${proposalPk3}`,
            token,
            filename: downloadFileName,
            downloadsFolder,
          }).then((result: DownloadFileResult) => {
            expect(result.success).to.be.true;
          });

          const extractedFilesDir = `${downloadsFolder}/proposals_extracted_02`;

          cy.task('unzip', {
            source: downloadFilePath,
            destination: extractedFilesDir,
          });

          const pdfFilePath1 = `${extractedFilesDir}/${proposalId1}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
          const pdfFilePath2 = `${extractedFilesDir}/${proposalId2}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
          const pdfFilePath3 = `${extractedFilesDir}/${proposalId3}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;

          cy.task('readPdf', pdfFilePath1).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId1);
            expect(text).to.include(proposalTitle1);
            expect(text).to.include(proposalAbstract1);
          });

          // The update to proposal 2 is not reflected because it is pregenerated.
          cy.task('readPdf', pdfFilePath2).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId2);
            expect(text).to.include(proposalTitle2);
            expect(text).to.include(proposalAbstract2);

            expect(text).to.not.include(newProposalTitle2);
            expect(text).to.not.include(newProposalAbstract2);
          });

          // The update to proposal 3 is reflected because it is generated.
          cy.task('readPdf', pdfFilePath3).then((args) => {
            const { text } = args as PdfParse.Result;

            expect(text).to.include(proposalId3);
            expect(text).to.include(newProposalTitle3);
            expect(text).to.include(newProposalAbstract3);

            expect(text).to.not.include(proposalTitle3);
            expect(text).to.not.include(proposalAbstract3);
          });
        });
      });
    });
  });

  it('API token can download pregenerated proposal', function () {
    cy.login('officer');
    cy.visit('/');

    const accessTokenName = faker.lorem.words(2);
    cy.createApiAccessToken({
      name: accessTokenName,
      accessPermissions:
        '{"FactoryServices.getPregeneratedPdfProposals":true, "FactoryServices.getPdfProposals":true}',
    });

    cy.contains('Settings').click();
    cy.contains('API access tokens').click();

    cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

    cy.finishedLoading();

    cy.contains('Other Services').click();

    cy.contains('FactoryServices.getPregeneratedPdfProposals');
    cy.get('#accessToken')
      .invoke('val')
      .then((value) => {
        const accessToken = value as string;
        cy.request({
          url: `/download/pdf/proposal/${proposalPk1}`,
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
          url: `/download/pdf/proposal/${proposalId1}?filter=id`,
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
});
