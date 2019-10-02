import express from "express";
import baseContext from "../buildContext";
import { isRejection, Rejection, rejection } from "../rejection";

const PDFDocument = require("pdfkit");
const router = express.Router();
const fs = require("fs");
import { ProposalTemplate } from "./ProposalModel";
const hummus = require("hummus");

router.get("/proposal/download/:proposal_id", async (req: any, res) => {
  try {
    const proposalId = req.params.proposal_id;
    let user = null;

    if (req.user) {
      user = await baseContext.queries.user.getAgent(req.user.user.id);
    }

    if (user == null) {
      return res.status(500).send();
    }
    const proposal = await baseContext.queries.proposal.get(user, proposalId);
    const questionary = await baseContext.queries.proposal.getQuestionary(
      user,
      proposalId
    );
    if (isRejection(questionary)) {
      return res.status(500).send();
    }
    if (proposal == null || questionary == null) {
      return res.status(500).send();
    }
    const proposalTemplate = new ProposalTemplate(questionary);
    const template = proposalTemplate!;

    // Create a document
    const doc = new PDFDocument();
    // Proposal title
    let attachmentIds: string[] = [];
    doc.image("./images/ESS.png", 15, 15, { width: 100 });
    doc.fontSize(30).text(`Proposal: ${proposal.title}`);
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
          //console.log(field, "EMBELLISHMENT");
        } else if (field.data_type === "FILE_UPLOAD") {
          doc
            .font("Times-Bold")
            .fontSize(12)
            .text(field.question);
          if (field.value != "") {
            const fieldAttachmentArray: string[] = field.value.split(",");
            doc
              .font("Times-Roman")
              .fontSize(12)
              .text(
                `See Appendix ${fieldAttachmentArray.map(
                  (id, i) => `A${i + attachmentIds.length}`
                )}`
              );
            attachmentIds = attachmentIds.concat(fieldAttachmentArray);
          } else {
            doc
              .font("Times-Roman")
              .fontSize(12)
              .text("NA");
          }
        } else {
          doc
            .font("Times-Bold")
            .fontSize(12)
            .text(field.question);
          if (field.value != "") {
            doc
              .font("Times-Roman")
              .fontSize(12)
              .text(field.value);
          } else {
            doc
              .font("Times-Roman")
              .fontSize(12)
              .text("NA");
          }
        }
        doc.moveDown(0.5);
      });
    });
    const writeStream = fs.createWriteStream("downloads/proposal.pdf");

    doc.pipe(writeStream);
    doc.end();

    const getAttachments = (attachmentId: string) => {
      return baseContext.mutations.file.prepare(attachmentId).then(() => {
        return baseContext.queries.file.getFileMetadata([attachmentId]);
      });
    };

    writeStream.on("finish", async function() {
      await Promise.all(attachmentIds.map(getAttachments)).catch(error =>
        res.status(500).send()
      );

      var pdfWriter = hummus.createWriter(
        "downloads/proposalWithAttachments.pdf"
      );
      pdfWriter.appendPDFPagesFromPDF(`downloads/proposal.pdf`);

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
      fs.unlink("downloads/proposal.pdf", () => {});
      pdfWriter.end();

      res.download(
        "downloads/proposalWithAttachments.pdf",
        `${proposal.title}.pdf`,
        () => {
          fs.unlink("downloads/proposalWithAttachments.pdf", () => {}); // delete file once done
        }
      );
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
