/* eslint-disable @typescript-eslint/no-use-before-define */
import fs, { existsSync, unlink } from 'fs';

import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import PDFDocument from 'pdfkit';

import baseContext from '../buildContext';
import { questionaryDataSource } from '../datasources';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId,
} from '../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../models/Questionary';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { DataType } from '../models/Template';
import { UserWithRole } from '../models/User';
import { isRejection } from '../rejection';
import { EmbellishmentConfig } from '../resolvers/types/FieldConfig';
import { logger } from '../utils/Logger';
import { createToC } from './pdfTableofContents/index';

type PDFDocument = PDFKit.PDFDocument;

const NOT_ANSWERED = 'Left blank';
const SEE_APPENDIX = 'See appendix';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hummus = require('hummus');

const router = express.Router();
const attachmentQueue = Array<string>();

//Helper functions
const write = (text: string, doc: PDFDocument) => {
  return doc
    .font('fonts/Calibri_Regular.ttf')
    .fontSize(11)
    .text(text);
};

const writeBold = (text: string, doc: PDFDocument) => {
  return doc
    .font('fonts/Calibri_Bold.ttf')
    .fontSize(11)
    .text(text);
};

const writeItalic = (text: string, doc: PDFDocument) => {
  return doc
    .font('fonts/Calibri_Italic.ttf')
    .fontSize(11)
    .text(text);
};

const writeHeading = (text: string, doc: PDFDocument) => {
  return doc
    .font('fonts/Calibri_Bold.ttf')
    .fontSize(14)
    .text(text);
};

const getFileAttachmentIds = (answer: Answer) => {
  if (answer.question.dataType === DataType.FILE_UPLOAD && answer.value) {
    return (answer.value as string).split(',');
  }

  return [];
};

const getAttachment = async (attachmentId: string) => {
  await baseContext.mutations.file.prepare(attachmentId);

  return baseContext.queries.file.getFileMetadata([attachmentId]);
};

const getTopicActiveAnswers = (
  questionarySteps: QuestionaryStep[],
  topicId: number
) => {
  const step = getQuestionaryStepByTopicId(questionarySteps, topicId);

  return step
    ? (step.fields.filter(field => {
        return areDependenciesSatisfied(
          questionarySteps,
          field.question.proposalQuestionId
        );
      }) as Answer[])
    : [];
};

const writeEmbellishment = (answer: Answer, doc: PDFDocument) => {
  const config = answer.question.config as EmbellishmentConfig;
  if (!config.omitFromPdf) {
    writeBold(config.plain!, doc);
  }
};

const writeFileUpload = (answer: Answer, doc: PDFDocument) => {
  writeBold(answer.question.question, doc);
  if (answer.value) {
    writeItalic(SEE_APPENDIX, doc);
  } else {
    write(NOT_ANSWERED, doc);
  }
};

const writeDate = (answer: Answer, doc: PDFDocument) => {
  writeBold(answer.question.question, doc);
  write(
    answer.value
      ? new Date(answer.value).toISOString().split('T')[0]
      : NOT_ANSWERED,
    doc
  );
};

const writeBoolean = (answer: Answer, doc: PDFDocument) => {
  writeBold(answer.question.question, doc);
  if (answer.value) {
    write('Yes', doc);
  } else {
    write('No', doc);
  }
};

const writeAnswer = async (answer: Answer, doc: PDFDocument) => {
  if (answer.question.dataType === DataType.EMBELLISHMENT) {
    writeEmbellishment(answer, doc);
  } else if (answer.question.dataType === DataType.FILE_UPLOAD) {
    writeFileUpload(answer, doc);
  } else if (answer.question.dataType === DataType.DATE) {
    writeDate(answer, doc);
  } else if (answer.question.dataType === DataType.BOOLEAN) {
    writeBoolean(answer, doc);
  } else if (answer.question.dataType === DataType.SUBTEMPLATE) {
    await writeSubtemplate(answer, doc);
  } else {
    writeBold(answer.question.question, doc);
    write(answer.value ? answer.value : NOT_ANSWERED, doc);
  }
  doc.moveDown(0.5);
};

const writeSubtemplate = async (answer: Answer, doc: PDFDocument) => {
  writeBold(answer.question.question, doc);
  doc.moveDown();
  const subQuestionaryIds = answer.value;
  for (const subQuestionaryId of subQuestionaryIds) {
    writeBold(
      `Entry ${subQuestionaryIds.indexOf(subQuestionaryId) + 1} of ${
        subQuestionaryIds.length
      }`,
      doc
    );
    const subquestionarySteps = await questionaryDataSource.getQuestionarySteps(
      subQuestionaryId
    );
    if (subquestionarySteps.length === 0) {
      continue;
    }
    const firstStepTopicId = subquestionarySteps[0].topic.id; // NOTE: for now only the first topic
    const answers = getTopicActiveAnswers(
      subquestionarySteps!,
      firstStepTopicId
    );
    for (const answer of answers) {
      attachmentQueue.push(...getFileAttachmentIds(answer));
      await writeAnswer(answer, doc);
    }
  }
  doc.moveDown();
};
const createProposalPDF = async (
  proposalId: number,
  user: UserWithRole,
  pageNumber: number
): Promise<{
  toc: any;
  pageNumber: number;
  metaData: { year: number; path: string; pi: string; shortCode: string };
}> => {
  try {
    const UserAuthorization = baseContext.userAuthorization;
    const proposal = await baseContext.queries.proposal.get(user, proposalId);
    const toc: any = [];
    // Authenticate user
    if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
      throw new Error('User was not allowed to download PDF');
    }

    const queries = baseContext.queries.questionary;

    const questionarySteps = await queries.getQuestionarySteps(
      user,
      proposal.questionaryId
    );

    if (isRejection(questionarySteps) || questionarySteps == null) {
      throw new Error('Could not fetch questionary');
    }

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

    // General information
    doc.image('./images/ESS.png', 15, 15, { width: 100 });

    writeHeading(`Proposal: ${proposal.title}`, doc);
    doc.moveDown();

    writeBold('Proposal ID:', doc);
    write(proposal.shortCode, doc);

    doc.moveDown();

    writeBold('Brief summary:', doc);
    write(proposal.abstract, doc);

    doc.moveDown();

    writeBold('Proposal Team', doc);
    doc.moveDown();
    writeBold('Principal Investigator:', doc);
    write(
      `${principalInvestigator.firstname} ${principalInvestigator.lastname}`,
      doc
    );

    write(principalInvestigator.organisation, doc);
    write(principalInvestigator.position, doc);

    doc.moveDown();

    writeBold('Co-proposer:', doc);
    coProposers.forEach(coProposer => {
      write(
        `${coProposer.firstname} ${coProposer.lastname}, ${coProposer.organisation}`,
        doc
      );
    });

    // Information from each topic in proposal
    for (const step of questionarySteps) {
      doc.addPage();
      doc.image('./images/ESS.png', 15, 15, { width: 100 });

      if (!step) {
        throw 'Could not download generated PDF';
      }

      writeHeading(step.topic.title, doc);
      toc.push({
        title: step.topic.title,
        page: pageNumber,
        children: [],
      });

      doc.moveDown();
      const topic = step.topic;
      const answers = getTopicActiveAnswers(questionarySteps, topic.id);
      for (const answer of answers) {
        attachmentQueue.push(...getFileAttachmentIds(answer));
        await writeAnswer(answer, doc);
      }
    }

    pageNumber++;
    doc.end();

    // Stitch together PDF proposal with attachments
    return new Promise(resolve => {
      writeStream.on('finish', async function() {
        const attachmentsMetadata = await Promise.all(
          attachmentQueue.map(getAttachment)
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

        //if reviewer is downloading add technical review page
        const docTech = new PDFDocument();
        const writeStreamTech = fs.createWriteStream(
          `downloads/proposal-${proposalId}-techreview`
        );

        docTech.pipe(writeStreamTech);

        if (UserAuthorization.isReviewerOfProposal(user, proposal.id)) {
          const technicalReview = await baseContext.queries.review.technicalReviewForProposal(
            user,
            proposal.id
          );
          if (technicalReview) {
            docTech.image('./images/ESS.png', 15, 15, { width: 100 });

            writeHeading('Technical Review', docTech);
            docTech.moveDown();

            writeBold('Status', docTech);
            write(
              getTranslation(
                TechnicalReviewStatus[technicalReview.status] as ResourceId
              ),
              docTech
            );
            docTech.moveDown();

            writeBold('Time Allocation', docTech);
            write(technicalReview.timeAllocation.toString() + ' Days', docTech);
            docTech.moveDown();

            writeBold('Comment', docTech);
            write(technicalReview.publicComment, docTech);

            toc.push({
              title: 'Technical Review',
              page: pageNumber,
              children: [],
            });
            pageNumber++;
          }
          docTech.end();
          writeStreamTech.on('finish', async function() {
            pdfWriter.appendPDFPagesFromPDF(
              `downloads/proposal-${proposalId}-techreview`
            );
            pdfWriter.end();
            resolve({ toc, pageNumber, metaData });
          });
        } else {
          pdfWriter.end();
          resolve({ toc, pageNumber, metaData });
        }
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

    const userWithRole = { ...user, currentRole: decoded.currentRole };

    const pdfWriter = hummus.createWriter(tmpFileNamePath);

    for (const propId of proposalIds) {
      const result = await createProposalPDF(
        parseInt(propId),
        userWithRole,
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
