import fs, { existsSync, unlink } from 'fs';

import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import PDFDocument from 'pdfkit';

import baseContext from '../buildContext';
import { Answer, DataType, Questionary } from '../models/ProposalModel';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId,
} from '../models/ProposalModelFunctions';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { User } from '../models/User';
import { isRejection } from '../rejection';
import { EmbellishmentConfig } from '../resolvers/types/FieldConfig';
import { logger } from '../utils/Logger';
import { createToC } from './pdfTableofContents/index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hummus = require('hummus');

const router = express.Router();

const getAttachments = async (attachmentId: string) => {
  await baseContext.mutations.file.prepare(attachmentId);

  return baseContext.queries.file.getFileMetadata([attachmentId]);
};

const createProposalPDF = async (
  proposalId: number,
  user: User,
  pageNumber: number
): Promise<{
  toc: any;
  pageNumber: number;
  metaData: { year: number; path: string; pi: string; shortCode: string };
}> => {
  try {
    const notAnswered = 'Left blank';
    const UserAuthorization = baseContext.userAuthorization;
    const proposal = await baseContext.queries.proposal.get(user, proposalId);
    const toc: any = [];
    // Authenticate user
    if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
      throw new Error('User was not allowed to download PDF');
    }

    const questionaryObj = await baseContext.queries.proposal.getQuestionary(
      user,
      proposalId
    );

    if (isRejection(questionaryObj) || questionaryObj == null) {
      throw new Error('Could not fetch questionary');
    }

    const questionary = Questionary.fromObject(questionaryObj);
    const principalInvestigator = await baseContext.queries.user.getBasic(
      user,
      proposal.proposerId
    );
    const coProposers = await baseContext.queries.user.getProposers(
      user,
      proposalId
    );

    if (!principalInvestigator || !coProposers) {
      throw new Error('User was not PI or co-proposer');
    }

    // Set metaData information
    const metaData = {
      year: proposal.created.getUTCFullYear(),
      pi: principalInvestigator.lastname,
      shortCode: proposal.shortCode,
      path: `${proposal.created.getUTCFullYear()}_${
        principalInvestigator.lastname
      }_${proposal.shortCode}.pdf`,
    };

    // Create a PDF document
    const doc = new PDFDocument({ bufferPages: true });

    doc.on('pageAdded', () => {
      pageNumber++;
    });

    const writeStream = fs.createWriteStream(
      `downloads/proposal-${proposalId}.pdf`
    );

    doc.pipe(writeStream);
    //Helper functions

    const write = (text: string) => {
      return doc
        .font('fonts/Calibri_Regular.ttf')
        .fontSize(11)
        .text(text);
    };

    const writeBold = (text: string) => {
      return doc
        .font('fonts/Calibri_Bold.ttf')
        .fontSize(11)
        .text(text);
    };

    const writeHeading = (text: string) => {
      return doc
        .font('fonts/Calibri_Bold.ttf')
        .fontSize(14)
        .text(text);
    };

    // General information
    let attachmentIds: string[] = []; // Save attachments for appendix
    doc.image('./images/ESS.png', 15, 15, { width: 100 });

    writeHeading(`Proposal: ${proposal.title}`);
    doc.moveDown();

    writeBold('Proposal ID:');
    write(proposal.shortCode);

    doc.moveDown();

    writeBold('Brief summary:');
    write(proposal.abstract);

    doc.moveDown();

    writeBold('Proposal Team');
    doc.moveDown();
    writeBold('Principal Investigator:');
    write(
      `${principalInvestigator.firstname} ${principalInvestigator.lastname}`
    );

    write(principalInvestigator.organisation);
    write(principalInvestigator.position);

    doc.moveDown();

    writeBold('Co-proposer:');
    coProposers.forEach(coProposer => {
      write(
        `${coProposer.firstname} ${coProposer.lastname}, ${coProposer.organisation}`
      );
    });

    // Information from each topic in proposal
    questionary.steps.forEach(x => {
      doc.addPage();
      doc.image('./images/ESS.png', 15, 15, { width: 100 });
      const step = getQuestionaryStepByTopicId(questionary, x.topic.topic_id);
      const activeFields = step
        ? (step.fields.filter(field => {
            return areDependenciesSatisfied(
              questionary,
              field.question.proposalQuestionId
            );
          }) as Answer[])
        : [];
      if (!step) {
        throw 'Could not download generated PDF';
      }
      writeBold(step.topic.topic_title);
      toc.push({
        title: step.topic.topic_title,
        page: pageNumber,
        children: [],
      });
      doc.moveDown();
      activeFields.forEach(field => {
        if (field.question.dataType === DataType.EMBELLISHMENT) {
          const conf = field.question.config as EmbellishmentConfig;
          if (!conf.omitFromPdf) {
            writeBold(conf.plain!);
          }
        } else if (field.question.dataType === DataType.FILE_UPLOAD) {
          writeBold(field.question.question);
          if (field.value) {
            const fieldAttachmentArray: string[] = field.value.split(',');
            attachmentIds = attachmentIds.concat(fieldAttachmentArray);
            write('This document has been appended to the proposal');
          } else {
            write(notAnswered);
          }
          // Default case, a ordinary question type
        } else if (field.question.dataType === DataType.DATE) {
          writeBold(field.question.question);
          write(
            field.value
              ? new Date(field.value).toISOString().split('T')[0]
              : notAnswered
          );
        } else if (field.question.dataType === DataType.BOOLEAN) {
          writeBold(field.question.question);
          if (field.value) {
            write('Yes');
          } else {
            write('No');
          }
        } else {
          writeBold(field.question.question);
          write(field.value ? field.value : notAnswered);
        }
        doc.moveDown(0.5);
      });
    });

    //if reviewer is downloading add technical review page

    if (UserAuthorization.isReviewerOfProposal(user, proposal.id)) {
      const technicalReview = await baseContext.queries.review.technicalReviewForProposal(
        user,
        proposal.id
      );
      if (technicalReview) {
        doc.addPage();
        doc.image('./images/ESS.png', 15, 15, { width: 100 });

        writeHeading('Technical Review');
        doc.moveDown();

        writeBold('Status');
        write(
          getTranslation(
            TechnicalReviewStatus[technicalReview.status] as ResourceId
          )
        );
        doc.moveDown();

        writeBold('Time Allocation');
        write(technicalReview.timeAllocation.toString() + ' Days');
        doc.moveDown();

        writeBold('Comment');
        write(technicalReview.publicComment);

        toc.push({
          title: 'Technical Review',
          page: pageNumber,
          children: [],
        });
      }
    }

    doc.end();
    pageNumber++;

    // Stitch together PDF proposal with attachments
    return new Promise(resolve => {
      writeStream.on('finish', async function() {
        const attachmentsMetadata = await Promise.all(
          attachmentIds.map(getAttachments)
        ).catch(e => {
          logger.logException('Could not download generated PDF', e);
          throw e;
        });
        const pdfWriter = hummus.createWriter(`downloads/${metaData.path}`);
        pdfWriter.appendPDFPagesFromPDF(`downloads/proposal-${proposalId}.pdf`);
        const attachmentToC = {
          title: 'Attachment',
          page: pageNumber,
          children: [] as any,
        };

        attachmentsMetadata.forEach(async attachmentMeta => {
          pdfWriter.appendPDFPagesFromPDF(
            `downloads/${attachmentMeta[0].fileId}`
          );
          const pdfReader = hummus.createReader(
            `downloads/${attachmentMeta[0].fileId}`
          );
          attachmentToC.children.push({
            title: `${attachmentMeta[0].originalFileName}`,
            page: pageNumber,
            children: [],
          });
          pageNumber = pageNumber + pdfReader.getPagesCount();

          fs.unlink(`downloads/${attachmentMeta[0].fileId}`, () => {
            // Do something here if needed.
          });
        });

        if (attachmentsMetadata[0]) {
          toc.push(attachmentToC);
        }
        fs.unlink(`downloads/proposal-${proposalId}.pdf`, () => {
          // Do something here if needed.
        });
        pdfWriter.end();
        resolve({ toc, pageNumber, metaData });
      });
    });
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    throw e;
  }
};

router.get('/proposal/download/:proposal_ids', async (req: any, res) => {
  try {
    const decoded = jsonwebtoken.verify(
      req.cookies.token,
      process.env.secret as string
    ) as any;
    const proposalIds = req.params.proposal_ids.split(',');
    const toc: any = [];
    let pageNumber = 0;
    const filePaths: string[] = [];
    const tmpFileNamePath = `downloads/${(+new Date()).toString(36)}.pdf`;
    const tmpFileNamePathFinal = `downloads/final${(+new Date()).toString(
      36
    )}.pdf`;
    const user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      throw new Error('Could not find user');
    }

    const pdfWriter = hummus.createWriter(tmpFileNamePath);

    for (const propId of proposalIds) {
      const result = await createProposalPDF(
        parseInt(propId),
        user as User,
        pageNumber
      ).then(result => {
        pdfWriter.appendPDFPagesFromPDF(`downloads/${result.metaData.path}`);

        return result;
      });
      toc.push({
        title: `Proposal number: ${result.metaData.shortCode}`,
        page: pageNumber,
        children: result.toc,
      });
      pageNumber = result.pageNumber;
      filePaths.push(result.metaData.path);
    }

    pdfWriter.end();

    createToC(tmpFileNamePath, tmpFileNamePathFinal, toc);

    //clean up
    filePaths.forEach(filePath =>
      fs.unlink(`downloads/${filePath}`, () => {
        // Do something here if needed.
      })
    );
    fs.unlink(tmpFileNamePath, () => {
      // Do something here if needed.
    });

    res.download(
      tmpFileNamePathFinal,
      filePaths.length > 1 ? 'proposals.pdf' : filePaths[0],
      (err: any) => {
        if (err) {
          throw err;
        }
        if (existsSync(tmpFileNamePathFinal)) {
          unlink(tmpFileNamePathFinal, () => {
            // delete file once done
          });
        }
      }
    );
  } catch (e) {
    logger.logException('Could not download generated PDF', e);
    res.status(500).send(e);
  }
});

export default router;
