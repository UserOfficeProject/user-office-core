import express from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import {
  PDFType,
  MetaBase,
  DownloadType,
  DownloadService,
} from '../../../factory/DownloadService';
import { ProposalPDFData } from '../../../factory/pdf/proposal';
import { collectSamplePDFData } from '../../../factory/pdf/sample';
import { collectShipmentPDFData } from '../../../factory/pdf/shipmentLabel';
import { getCurrentTimestamp } from '../../../factory/util';
import FactoryServices, { DownloadTypeServices } from '../factoryServices';

const router = express.Router();

const downloadService = container.resolve<DownloadService>(
  Tokens.DownloadService
);

router.get(`/${PDFType.PROPOSAL}/:proposal_pks`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

    const userWithRole = {
      ...res.locals.agent,
    };
    const proposalPks: number[] = req.params.proposal_pks
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const meta: MetaBase = {
      collectionFilename: `proposals_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };

    const data = await factoryServices.getPdfProposals(
      userWithRole,
      proposalPks,
      meta,
      {
        filter: req.query?.filter?.toString(),
      }
    );

    if (!data) {
      throw new Error('Could not get proposal details');
    }

    const userRole = req.user.currentRole;
    downloadService.callFactoryService<ProposalPDFData, MetaBase>(
      DownloadType.PDF,
      PDFType.PROPOSAL,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${PDFType.SAMPLE}/:sample_ids`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...req.user.user,
      currentRole: req.user.currentRole,
    };

    const sampleIds: number[] = req.params.sample_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const meta: MetaBase = {
      collectionFilename: `samples_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };
    const data = await Promise.all(
      sampleIds.map((sampleId, indx) =>
        collectSamplePDFData(
          sampleId,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    const userRole = req.user.currentRole;
    downloadService.callFactoryService(
      DownloadType.PDF,
      PDFType.SAMPLE,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(
  `/${PDFType.SHIPMENT_LABEL}/:shipment_ids`,
  async (req, res, next) => {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    try {
      const userWithRole = {
        ...req.user.user,
        currentRole: req.user.currentRole,
      };

      const shipmentIds: number[] = req.params.shipment_ids
        .split(',')
        .map((n: string) => parseInt(n))
        .filter((id: number) => !isNaN(id));

      const meta: MetaBase = {
        collectionFilename: `shipment_label_${getCurrentTimestamp()}.pdf`,
        singleFilename: '',
      };
      const data = await Promise.all(
        shipmentIds.map((shipmentId, indx) =>
          collectShipmentPDFData(
            shipmentId,
            userWithRole,
            indx === 0
              ? (filename: string) => (meta.singleFilename = filename)
              : undefined
          )
        )
      );

      const userRole = req.user.currentRole;
      downloadService.callFactoryService(
        DownloadType.PDF,
        PDFType.SHIPMENT_LABEL,
        { data, meta, userRole },
        req,
        res,
        next
      );
    } catch (e) {
      next(e);
    }
  }
);

export default function pdfDownload() {
  return router;
}
