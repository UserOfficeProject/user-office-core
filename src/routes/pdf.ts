import express from "express";
import baseContext from "../buildContext";
import { isRejection } from "../rejection";
import {
  DataType,
  Questionary,
  QuestionaryField,
  FieldConfig
} from "../models/ProposalModel";
import { createToC } from "./pdfTableofContents/index";
import {
  getQuestionaryStepByTopicId,
  areDependenciesSatisfied
} from "../models/ProposalModelFunctions";
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

router.get("/proposal/download/:proposal_id", async (req: any, res) => {
  try {
    const decoded = jsonwebtoken.verify(req.cookies.token, process.env.secret);
    const proposalId = parseInt(req.params.proposal_id);
    const notAnswered = "Left blank";

    // Authenticate user and fecth user, co-proposer and proposal with questionary
    let user = null;
    user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      return res.status(500).send();
    }

    const UserAuthorization = baseContext.userAuthorization;
    const proposal = await baseContext.queries.proposal.get(user, proposalId);

    if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
      return res.status(500).send();
    }

    const questionaryObj = await baseContext.queries.proposal.getQuestionary(
      user,
      proposalId
    );

    if (isRejection(questionaryObj) || questionaryObj == null) {
      return res.status(500).send();
    }

    const questionary = Questionary.fromObject(questionaryObj);
    const principalInvestigator = await baseContext.queries.user.getBasic(
      user,
      proposal.proposer
    );
    const coProposers = await baseContext.queries.user.getProposers(
      user,
      proposalId
    );

    if (!principalInvestigator || !coProposers) {
      return res.status(500).send();
    }

    // Create a PDF document
    const doc = new PDFDocument({ bufferPages: true });

    let toc: any = [];
    let pageNumber = 0;
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

    let attachmentIds: string[] = []; // Save attachments for appendix
    doc.image("./images/ESS.png", 15, 15, { width: 100 });

    writeHeading(`Proposal: ${proposal.title}`);
    doc.moveDown();

    writeBold("Shortcode:");
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
        return res.status(500).send();
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
          let conf = JSON.parse(field.config) as FieldConfig;
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
    // Stitch togethere PDF proposal with attachments
    writeStream.on("finish", async function() {
      const attachmentsMetadata = await Promise.all(
        attachmentIds.map(getAttachments)
      ).catch(e => {
        console.log(e);
        res.status(500).send();
        return [];
      });
      var pdfWriter = hummus.createWriter(
        `downloads/proposalWithAttachments-${proposalId}.pdf`
      );
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

      createToC(
        `downloads/proposalWithAttachments-${proposalId}.pdf`,
        `downloads/proposalWithAttachmentsAndToC-${proposalId}.pdf`,
        toc
      );

      fs.unlink(
        `downloads/proposalWithAttachments-${proposalId}.pdf`,
        () => {}
      ); // delete file once done

      const year = proposal.created.getUTCFullYear();
      const pi = principalInvestigator.lastname;
      const shortcode = proposal.shortCode;
      res.download(
        `downloads/proposalWithAttachmentsAndToC-${proposalId}.pdf`,
        `${year}_${pi}_${shortcode}.pdf`,
        () => {
          fs.unlink(
            `downloads/proposalWithAttachmentsAndToC-${proposalId}.pdf`,
            () => {}
          ); // delete file once done
        }
      );
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

module.exports = router;
