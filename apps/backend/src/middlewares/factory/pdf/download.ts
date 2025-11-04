import { logger } from '@user-office-software/duo-logger';
import express from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { AdminDataSource } from '../../../datasources/AdminDataSource';
import { ExperimentSafetyPDFData } from '../../../factory/pdf/experimentSafety';
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
import { UserWithRole } from '../../../models/User';
import FactoryServices, { DownloadTypeServices } from '../factoryServices';

const router = express.Router();

const factoryServices =
  container.resolve<DownloadTypeServices>(FactoryServices);
const adminDataSource = container.resolve<AdminDataSource>(
  Tokens.AdminDataSource
);

router.get(`/${PDFType.PROPOSAL}/:proposal_keys`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole: UserWithRole = {
      ...res.locals.agent,
    };
    const requestedKeys: number[] = Array.from(
      new Set(
        req.params.proposal_keys
          .split(',')
          .map((n: string) => parseInt(n))
          .filter((id: number) => !isNaN(id))
      )
    );

    const numRequestedKeys = requestedKeys.length;
    if (numRequestedKeys === 0) {
      throw new Error('No valid proposals provided');
    }

    const isIdFiltered = req.query?.filter?.toString() === 'id';

    const requesterContext = {
      role: userWithRole.isApiAccessToken
        ? 'API key'
        : userWithRole?.currentRole?.title,
      userId: userWithRole?.id,
    };

    logger.logInfo(
      `Proposal PDF download for ${numRequestedKeys} proposals requested`,
      {
        requestedProps: requestedKeys,
        propsIdentifier: isIdFiltered ? 'ID' : 'PK',
        requestedBy: requesterContext,
      }
    );

    const meta: MetaBase = {
      collectionFilename: `proposals_${getCurrentTimestamp()}.pdf`,
      singleFilename: '',
    };

    const features = await adminDataSource.getFeatures();

    const isPregeneratedProposalPdfsEnabled = features.find(
      (feature) => feature.id === FeatureId.PREGENERATED_PROPOSAL_PDF
    )?.isEnabled;

    const data: ProposalPDFData[] = [];
    const pregeneratedKeys = new Set<number>();

    if (isPregeneratedProposalPdfsEnabled) {
      const pregeneratedProposalPdfData: PregeneratedProposalPDFData[] =
        await factoryServices.getPregeneratedPdfProposals(
          userWithRole,
          requestedKeys,
          meta,
          {
            filter: req.query?.filter?.toString(),
          }
        );

      pregeneratedProposalPdfData.forEach((propData) => {
        data.push({ ...propData });
        pregeneratedKeys.add(
          isIdFiltered
            ? Number(propData.proposal.proposalId)
            : propData.proposal.primaryKey
        );
      });
    }

    const keysToFetchFullData = requestedKeys.filter(
      (key) => !pregeneratedKeys.has(key)
    );

    const fullProposalPdfData: FullProposalPDFData[] | null =
      await factoryServices.getPdfProposals(
        userWithRole,
        keysToFetchFullData,
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

    const propsToGenerate: number[] = [];
    const propsToPregenerate: number[] = [];

    for (const d of data) {
      const primaryKey = d.proposal.primaryKey;
      const proposalId = Number(d.proposal.proposalId);
      if (d.isPregeneratedPdfData) {
        propsToPregenerate.push(isIdFiltered ? proposalId : primaryKey);
      } else {
        propsToGenerate.push(isIdFiltered ? proposalId : primaryKey);
      }
    }

    logger.logInfo(
      `Collected proposal PDF download data for ${data.length} proposals`,
      {
        requestedProps: requestedKeys,
        propsIdentifier: isIdFiltered ? 'ID' : 'PK',
        propsToGenerate,
        ...(isPregeneratedProposalPdfsEnabled && { propsToPregenerate }),
        requestedBy: requesterContext,
      }
    );

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

router.get(
  `/${PDFType.EXPERIMENT_SAFETY}/:experiment_pks`,
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new Error('Not authorized');
      }

      const factoryServices =
        container.resolve<DownloadTypeServices>(FactoryServices);

      const userWithRole = {
        ...res.locals.agent,
      };
      const experimentPks: number[] = req.params.experiment_pks
        .split(',')
        .map((n: string) => parseInt(n))
        .filter((id: number) => !isNaN(id));
      const meta: MetaBase = {
        collectionFilename: `experiment_safety_${getCurrentTimestamp()}.pdf`,
        singleFilename: '',
      };
      const data = await factoryServices.getPdfExperimentsSafety(
        userWithRole,
        experimentPks,
        meta
      );
      if (!data) {
        throw new Error('Could not get Experiment details');
      }
      const userRole = req.user.currentRole;
      callFactoryService<ExperimentSafetyPDFData, MetaBase>(
        DownloadType.PDF,
        PDFType.EXPERIMENT_SAFETY,
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
