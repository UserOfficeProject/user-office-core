import express from "express";
import baseContext from "../buildContext";
import { isRejection } from "../rejection";
import { ProposalTemplate, DataType } from "./ProposalModel";
const jsonwebtoken = require("jsonwebtoken");
const createTOC = require("@ocelot-consulting/hummus-toc");
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
    const proposalId = req.params.proposal_id;
    let user = null;
    const notAnswered = "This question is not mandatory and was not answered.";
    // Authenticate user and fecth user, co-proposer and proposal with questionary
    user = await baseContext.queries.user.getAgent(decoded.user.id);

    if (user == null) {
      return res.status(500).send();
    }

    const UserAuthorization = baseContext.userAuthorization;
    const proposal = await baseContext.queries.proposal.get(user, proposalId);

    if (!proposal || !UserAuthorization.hasAccessRights(user, proposal)) {
      return res.status(500).send();
    }

    const questionary = await baseContext.queries.proposal.getQuestionary(
      user,
      proposalId
    );

    if (isRejection(questionary) || questionary == null) {
      return res.status(500).send();
    }

    const template = new ProposalTemplate(questionary);
    const principalInvestigator = await baseContext.queries.user.get(
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
    let pageNumber = 1;
    toc.push({ title: "First Page", page: 1, children: [] });
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
    doc.outline.addItem(`Proposal: ${proposal.title}`);
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

    questionary.topics.forEach((x: any) => {
      doc.addPage();
      doc.image("./images/ESS.png", 15, 15, { width: 100 });
      const topic = template.getTopicById(x.topic_id);
      const activeFields = topic
        ? topic.fields.filter((field: any) => {
            return template.areDependenciesSatisfied(
              field.proposal_question_id
            );
          })
        : [];
      if (!topic) {
        return res.status(500).send();
      }
      writeBold(topic.topic_title);
      doc.outline.addItem(topic.topic_title);
      toc.push({ title: topic.topic_title, page: pageNumber, children: [] });
      doc.moveDown();
      activeFields.forEach(field => {
        if (field.data_type === DataType.EMBELLISHMENT) {
          writeBold(field.config.plain!);
        } else if (field.data_type === DataType.FILE_UPLOAD) {
          writeBold(field.question);
          if (field.value != "") {
            const fieldAttachmentArray: string[] = field.value.split(",");
            attachmentIds = attachmentIds.concat(fieldAttachmentArray);
            write("This document has been appended to the proposal");
          } else {
            write(notAnswered);
          }
          // Default case, a ordinary question type
        } else if (field.data_type === DataType.DATE) {
          write(
            field.value != ""
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
          write(field.value != "" ? field.value : notAnswered);
        }
        doc.moveDown(0.5);
      });
    });
    doc.end();
    pageNumber++;
    // Stitch togethere PDF proposal with attachments
    writeStream.on("finish", async function() {
      await Promise.all(attachmentIds.map(getAttachments))
        .then((res: any) => console.log(res))
        .catch(error => res.status(500).send());

      var pdfWriter = hummus.createWriter(
        `downloads/proposalWithAttachments-${proposalId}.pdf`
      );
      pdfWriter.appendPDFPagesFromPDF(`downloads/proposal-${proposalId}.pdf`);

      attachmentIds.forEach(async (attachmentId, i) => {
        pdfWriter.appendPDFPagesFromPDF(`downloads/${attachmentId}`);
        var pdfReader = hummus.createReader(`downloads/${attachmentId}`);
        toc.push({ title: `${attachmentId}`, page: pageNumber, children: [] });
        pageNumber = pageNumber + pdfReader.getPagesCount();

        fs.unlink(`downloads/${attachmentId}`, () => {});
      });
      fs.unlink(`downloads/proposal-${proposalId}.pdf`, () => {});
      pdfWriter.end();

      res.download(
        `downloads/proposalWithAttachments-${proposalId}.pdf`,
        `${proposal.title}.pdf`,
        () => {
          createTOC(
            `downloads/proposalWithAttachments-${proposalId}.pdf`,
            `downloads/test.pdf`,
            toc
          );
          fs.unlink(
            `downloads/proposalWithAttachments-${proposalId}.pdf`,
            () => {}
          ); // delete file once done
        }
      );
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
