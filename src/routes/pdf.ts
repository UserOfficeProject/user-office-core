import express from "express";
import baseContext from "../buildContext";
import { isRejection } from "../rejection";
import { ProposalTemplate } from "./ProposalModel";
const jsonwebtoken = require("jsonwebtoken");
const config = require("./../../config");

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
    const decoded = jsonwebtoken.verify(req.cookies.token, config.secret);
    const proposalId = req.params.proposal_id;
    let user = null;

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
    const doc = new PDFDocument();

    //Helper functions
    const write = (text: string) => {
      return doc
        .font("Times-Roman")
        .fontSize(12)
        .text(text);
    };

    const writeBold = (text: string) => {
      return doc
        .font("Times-Bold")
        .fontSize(12)
        .text(text);
    };

    let attachmentIds: string[] = []; // Save attachments for appendix
    doc.image("./images/ESS.png", 15, 15, { width: 100 });
    doc.fontSize(30).text(`Proposal: ${proposal.title}`);
    doc.moveDown();

    writeBold("Brief summary:");
    write(proposal.abstract);

    doc.moveDown();

    writeBold("Main proposer:");
    write(
      `${principalInvestigator.firstname} ${principalInvestigator.lastname}`
    );
    write(principalInvestigator.email);
    write(principalInvestigator.telephone);
    write(principalInvestigator.organisation);
    write(principalInvestigator.position);

    doc.moveDown();

    writeBold("Co-proposer:");
    coProposers.forEach(coProposer => {
      write(`${coProposer.firstname} ${coProposer.lastname}`);
      write(coProposer.email);
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
      doc.fontSize(25).text(topic.topic_title);
      doc.moveDown();
      activeFields.forEach(field => {
        if (field.data_type === "EMBELLISHMENT") {
          writeBold("---- Here will be user set embellishment text ----");
        } else if (field.data_type === "FILE_UPLOAD") {
          writeBold(field.question);
          if (field.value != "") {
            const fieldAttachmentArray: string[] = field.value.split(",");
            write(
              `See Appendix ${fieldAttachmentArray.map(
                (id, i) => `A${i + attachmentIds.length}`
              )}`
            );
            attachmentIds = attachmentIds.concat(fieldAttachmentArray);
          } else {
            write("NA");
          }
          // Default case, a ordinary question type
        } else {
          writeBold(field.question);
          write(field.value != "" ? field.value : "NA");
        }
        doc.moveDown(0.5);
      });
    });
    const writeStream = fs.createWriteStream(
      `downloads/proposal-${proposalId}.pdf`
    );

    doc.pipe(writeStream);
    doc.end();

    // Stitch togethere PDF proposal with attachments
    writeStream.on("finish", async function() {
      await Promise.all(attachmentIds.map(getAttachments)).catch(error =>
        res.status(500).send()
      );

      var pdfWriter = hummus.createWriter(
        `downloads/proposalWithAttachments-${proposalId}.pdf`
      );
      pdfWriter.appendPDFPagesFromPDF(`downloads/proposal-${proposalId}.pdf`);

      attachmentIds.forEach(async (attachmentId, i) => {
        var page = pdfWriter.createPage(0, 0, 595, 842);
        var cxt = pdfWriter.startPageContentContext(page);
        var arialFont = pdfWriter.getFontForFile("./fonts/arial.ttf");
        var textOptions = {
          font: arialFont,
          size: 25,
          colorspace: "gray",
          color: 0x00
        };
        cxt.writeText(`Appendix A${i}`, 75, 805, textOptions);
        pdfWriter.writePage(page);
        pdfWriter.appendPDFPagesFromPDF(`downloads/${attachmentId}`);
        fs.unlink(`downloads/${attachmentId}`, () => {});
      });
      fs.unlink(`downloads/proposal-${proposalId}.pdf`, () => {});
      pdfWriter.end();

      res.download(
        `downloads/proposalWithAttachments-${proposalId}.pdf`,
        `${proposal.title}.pdf`,
        () => {
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
