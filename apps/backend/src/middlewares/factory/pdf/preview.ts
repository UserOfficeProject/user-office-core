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

router.post(`/${PDFType.PROPOSAL}`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const { proposalPk } = req.query;
    const dummyData = req.body.data as ProposalPDFData | null;
    const dummyUserRole = req.body.userRole as Role | null;

    if (!proposalPk && !dummyData && !dummyUserRole) {
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

    let proposalPdfData: ProposalPDFData[] | null = null;
    let userRole: Role | null = null;

    // Check if proposalPk is present and is a number
    const proposalPkNumber = parseInt(proposalPk as string);

    if (!isNaN(proposalPkNumber)) {
      proposalPdfData = await factoryServices.getPdfProposals(
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

      userRole = req.user.currentRole;
    } else {
      if (!dummyData || !dummyUserRole) {
        throw new Error('Invalid request');
      }

      proposalPdfData = [dummyData];
      userRole = dummyUserRole;
    }

    callFactoryService<ProposalPDFData, MetaBase>(
      DownloadType.PDF,
      PDFType.PROPOSAL,
      { data: proposalPdfData, meta, userRole },
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
