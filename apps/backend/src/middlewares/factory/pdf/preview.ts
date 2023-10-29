import express from 'express';
import { container } from 'tsyringe';

import { ProposalPDFData } from '../../../factory/pdf/proposal';
import callFactoryService, {
  DownloadType,
  MetaBase,
  PDFType,
} from '../../../factory/service';
import { Role } from '../../../models/Role';
import FactoryServices, { DownloadTypeServices } from '../factoryServices';

const router = express.Router();

router.get(`/${PDFType.PROPOSAL}`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const { proposalPk, pdfTemplateId } = req.query;

    if (!proposalPk && !pdfTemplateId) {
      res.status(400).send('Invalid request');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

    const userWithRole = {
      ...res.locals.agent,
    };

    const meta: MetaBase = {
      collectionFilename: '',
      singleFilename: '',
    };

    let payload = null;

    const proposalPkNumber = parseInt(proposalPk as string);
    if (!isNaN(proposalPkNumber)) {
      const proposalPdfData = await factoryServices.getPdfProposals(
        userWithRole,
        [proposalPkNumber],
        meta,
        {
          filter: req.query?.filter?.toString(),
        }
      );

      if (!proposalPdfData) {
        throw new Error('Could not get proposal details');
      }

      const userRole = req.user.currentRole;

      payload = {
        data: proposalPdfData,
        meta,
        userRole,
      };
    }

    const pdfTemplateIdNumber = parseInt(pdfTemplateId as string);
    if (!isNaN(pdfTemplateIdNumber)) {
      const pdfTemplate = await factoryServices.getPdfTemplate(
        userWithRole,
        pdfTemplateIdNumber
      );

      if (!pdfTemplate) {
        throw new Error('Could not get pdf template');
      }

      const dummyData = JSON.parse(pdfTemplate.dummyData) as {
        data: ProposalPDFData;
        userRole: Role;
      };

      payload = {
        data: [dummyData.data],
        meta,
        userRole: dummyData.userRole,
      };
    }

    if (!payload) {
      throw new Error('Invalid request');
    }

    callFactoryService<ProposalPDFData, MetaBase>(
      DownloadType.PDF,
      PDFType.PROPOSAL,
      payload,
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

export default function pdfPreview() {
  return router;
}
