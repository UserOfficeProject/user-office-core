import express from "express";
import { existsSync, unlink } from "fs";
import baseContext from "../buildContext";
import {
  DataType,
  Questionary,
  QuestionaryField
} from "../models/ProposalModel";
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId
} from "../models/ProposalModelFunctions";
import { isRejection } from "../rejection";
import { logger } from "../utils/Logger";
import { createToC } from "./pdfTableofContents/index";
import { EmbellishmentConfig } from "../resolvers/types/FieldConfig";
import { User } from "../models/User";

const jsonwebtoken = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const router = express.Router();
const fs = require("fs");
const hummus = require("hummus");

const getAttachments = (attachmentId: string) => {
  return baseContext.mutations.file.prepare(attachmentId).then(() => {
    return baseContext.queries.file.getFileMetadata([attachmentId]);
  });
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
    const notAnswered = "Left blank";
    const UserAuthorization = baseContext.userAuthorization;
    const proposal = await baseContext.queries.proposal.get(user, proposalId);
    let toc: any = [];
    // Authenticate user
    if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
      throw new Error("User was not allowed to download PDF");
    }

    const questionaryObj = await baseContext.queries.proposal.getQuestionary(
      user,
      proposalId
    );

    if (isRejection(questionaryObj) || questionaryObj == null) {
      throw new Error("Could not fetch questionary");
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
      throw new Error("User was not PI or co-proposer");
    }

    // Set metaData information
    const metaData = {
      year: proposal.created.getUTCFullYear(),
      pi: principalInvestigator.lastname,
      shortCode: proposal.shortCode,
      path: `${proposal.created.getUTCFullYear()}_${
        principalInvestigator.lastname
      }_${proposal.shortCode}.pdf`
    };

    // Create a PDF document
    const doc = new PDFDocument({ bufferPages: true });

    doc.on("pageAdded", () => {
      pageNumber++;
    });

    const writeStream = fs.createWriteStream(
      `downloads/proposal-${proposalId}.pdf`
    );

    doc.pipe(writeStream);
    //Helper functions

    const write = (text: string) => {
      return doc
        .font("fonts/Calibri_Regular.ttf")
        .fontSize(11)
        .text(text);
    };

    const writeBold = (text: string) => {
      return doc
        .font("fonts/Calibri_Bold.ttf")
        .fontSize(11)
        .text(text);
    };

    const writeHeading = (text: string) => {
      return doc
        .font("fonts/Calibri_Bold.ttf")
        .fontSize(14)
        .text(text);
    };

    // General information
    let attachmentIds: string[] = []; // Save attachments for appendix
    doc.image("./images/ESS.png", 15, 15, { width: 100 });

    writeHeading(`Proposal: ${proposal.title}`);
    doc.moveDown();

    writeBold("Proposal ID:");
    write(proposal.shortCode);

    doc.moveDown();

    writeBold("Brief summary:");
    write(proposal.abstract);

    doc.moveDown();

    writeBold("Proposal Team");
    doc.moveDown();
    writeBold("Principal Investigator:");
    write(
      `${principalInvestigator.firstname} ${principalInvestigator.lastname}`
    );

    write(principalInvestigator.organisation);
    write(principalInvestigator.position);

    doc.moveDown();

    writeBold("Co-proposer:");
    coProposers.forEach(coProposer => {
      write(
        `${coProposer.firstname} ${coProposer.lastname}, ${coProposer.organisation}`
      );
    });

    // Information from each topic in proposal
    questionary.steps.forEach(x => {
      doc.addPage();
      doc.image("./images/ESS.png", 15, 15, { width: 100 });
      const step = getQuestionaryStepByTopicId(questionary, x.topic.topic_id);
      const activeFields = step
        ? (step.fields.filter(field => {
            return areDependenciesSatisfied(
              questionary,
              field.proposal_question_id
            );
          }) as QuestionaryField[])
        : [];
      if (!step) {
        throw "Could not dowload generated PDF";
      }
      writeBold(step.topic.topic_title);
      toc.push({
        title: step.topic.topic_title,
        page: pageNumber,
        children: []
      });
      doc.moveDown();
      activeFields.forEach(field => {
        if (field.data_type === DataType.EMBELLISHMENT) {
          let conf = field.config as EmbellishmentConfig;
          if (!conf.omitFromPdf) {
            writeBold(conf.plain!);
          }
        } else if (field.data_type === DataType.FILE_UPLOAD) {
          writeBold(field.question);
          if (field.value) {
            const fieldAttachmentArray: string[] = field.value.split(",");
            attachmentIds = attachmentIds.concat(fieldAttachmentArray);
            write("This document has been appended to the proposal");
          } else {
            write(notAnswered);
          }
          // Default case, a ordinary question type
        } else if (field.data_type === DataType.DATE) {
          writeBold(field.question);
          write(
            field.value
              ? new Date(field.value).toISOString().split("T")[0]
              : notAnswered
          );
        } else if (field.data_type === DataType.BOOLEAN) {
          writeBold(field.question);
          if (field.value) {
            write("Yes");
          } else {
            write("No");
          }
        } else {
          writeBold(field.question);
          write(field.value ? field.value : notAnswered);
        }
        doc.moveDown(0.5);
      });
    });
    doc.end();
    pageNumber++;

    // Stitch together PDF proposal with attachments
    return new Promise((resolve, reject) => {
      writeStream.on("finish", async function() {
        const attachmentsMetadata = await Promise.all(
          attachmentIds.map(getAttachments)
        ).catch(() => {
          throw "Could not dowload generated PDF";
        });
        var pdfWriter = hummus.createWriter(`downloads/${metaData.path}`);
        pdfWriter.appendPDFPagesFromPDF(`downloads/proposal-${proposalId}.pdf`);
        let attachmentToC = {
          title: "Attachment",
          page: pageNumber,
          children: <any>[]
        };

        attachmentsMetadata.forEach(async attachmentMeta => {
          pdfWriter.appendPDFPagesFromPDF(
            `downloads/${attachmentMeta[0].fileId}`
          );
          var pdfReader = hummus.createReader(
            `downloads/${attachmentMeta[0].fileId}`
          );
          attachmentToC.children.push({
            title: `${attachmentMeta[0].originalFileName}`,
            page: pageNumber,
            children: []
          });
          pageNumber = pageNumber + pdfReader.getPagesCount();

          fs.unlink(`downloads/${attachmentMeta[0].fileId}`, () => {});
        });

        if (attachmentsMetadata[0]) {
          toc.push(attachmentToC);
        }
        fs.unlink(`downloads/proposal-${proposalId}.pdf`, () => {});
        pdfWriter.end();
        resolve({ toc, pageNumber, metaData });
      });
    });
  } catch (e) {
    logger.logException("Could not dowload generated PDF", e);
    throw "Could not dowload generated PDF";
  }
};

router.get("/proposal/download/:proposal_ids", async (req: any, res) => {
  try {
    const decoded = jsonwebtoken.verify(req.cookies.token, process.env.secret);
    const proposalIds = req.params.proposal_ids.split(",");
    let toc: any = [];
    let pageNumber = 0;
    let filePaths: string[] = [];
    const tmpFileNamePath = `downloads/${(+new Date()).toString(36)}.pdf`;
    const tmpFileNamePathFinal = `downloads/final${(+new Date()).toString(
      36
    )}.pdf`;
    let user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      throw new Error("Could not find user");
    }

    var pdfWriter = hummus.createWriter(tmpFileNamePath);

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
        children: result.toc
      });
      pageNumber = result.pageNumber;
      filePaths.push(result.metaData.path);
    }

    pdfWriter.end();

    createToC(tmpFileNamePath, tmpFileNamePathFinal, toc);

    //clean up
    filePaths.forEach(filePath => fs.unlink(`downloads/${filePath}`, () => {}));
    fs.unlink(tmpFileNamePath, () => {});

    res.download(
      tmpFileNamePathFinal,
      filePaths.length > 1 ? `proposals.pdf` : filePaths[0],
      (err: any) => {
        if (err) {
          throw err;
        }
        if (existsSync(tmpFileNamePathFinal)) {
          unlink(tmpFileNamePathFinal, () => {}); // delete file once done
        }
      }
    );
  } catch (e) {
    logger.logException("Could not dowload generated PDF", e);
    res.status(500).send(e);
  }
});

module.exports = router;
