import express from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { AdminDataSource } from '../../../datasources/AdminDataSource';
import {
  FullProposalPDFData,
  PregeneratedProposalPDFData,
  ProposalPDFData,
} from '../../../factory/pdf/proposal';
import { collectSamplePDFData } from '../../../factory/pdf/sample';
import { collectShipmentPDFData } from '../../../factory/pdf/shipmentLabel';
import callFactoryService, {
  PDFType,
  MetaBase,
  DownloadType,
} from '../../../factory/service';
import { getCurrentTimestamp } from '../../../factory/util';
import { FeatureId } from '../../../models/Feature';
import FactoryServices, { DownloadTypeServices } from '../factoryServices';

const router = express.Router();

const factoryServices =
  container.resolve<DownloadTypeServices>(FactoryServices);
const adminDataSource = container.resolve<AdminDataSource>(
  Tokens.AdminDataSource
);

router.get(`/${PDFType.PROPOSAL}/:proposal_pks`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...res.locals.agent,
    };
    const requestedPks: number[] = Array.from(
      new Set(
        req.params.proposal_pks
          .split(',')
          .map((n: string) => parseInt(n))
          .filter((id: number) => !isNaN(id))
      )
    );

    const meta: MetaBase = {
      collectionFilename: `proposals_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };

    const features = await adminDataSource.getFeatures();

    const isPregeneratedProposalsEnabled = features.find(
      (feature) => feature.id === FeatureId.PREGENERATED_PROPOSALS
    )?.isEnabled;

    const data: ProposalPDFData[] = [];
    const pregeneratedPks = new Set<number>();

    if (isPregeneratedProposalsEnabled) {
      const pregeneratedProposalPdfData: PregeneratedProposalPDFData[] =
        await factoryServices.getPregeneratedPdfProposals(
          userWithRole,
          requestedPks,
          meta
        );

      pregeneratedProposalPdfData.forEach((propData) => {
        data.push({ ...propData });
        pregeneratedPks.add(propData.proposal.primaryKey);
      });
    }

    const pksToFetchFullData = requestedPks.filter(
      (pk) => !pregeneratedPks.has(pk)
    );

    const fullProposalPdfData: FullProposalPDFData[] | null =
      await factoryServices.getPdfProposals(
        userWithRole,
        pksToFetchFullData,
        meta,
        {
          filter: req.query?.filter?.toString(),
        }
      );

    if (fullProposalPdfData) {
      data.push(...fullProposalPdfData);
    }

    if (!data || data.length === 0) {
      throw new Error('Could not get proposal details');
    }

    const userRole = req.user.currentRole;
    callFactoryService<ProposalPDFData, MetaBase>(
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
      ...res.locals.agent,
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
    callFactoryService(
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
        ...res.locals.agent,
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
      callFactoryService(
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
