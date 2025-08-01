import express from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import {
  FullProposalPDFData,
  PregeneratedProposalPDFData,
  ProposalPDFData,
} from '../../factory/pdf/proposal';
import callFactoryService, {
  DownloadType,
  MetaBase,
  ZIPType,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import { ProposalAttachmentData } from '../../factory/zip/attachment';
import { FeatureId } from '../../models/Feature';
import FactoryServices, { DownloadTypeServices } from './factoryServices';

const router = express.Router();

const adminDataSource = container.resolve<AdminDataSource>(
  Tokens.AdminDataSource
);

router.get(`/${ZIPType.ATTACHMENT}/:proposal_pks`, async (req, res, next) => {
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

    const options = ((queryParams) => {
      return {
        filter: queryParams.filter?.toString(),
        questionIds: queryParams.questionIds?.toString().split(','),
      };
    })(req.query);

    const data = await factoryServices.getProposalAttachments(
      userWithRole,
      proposalPks,
      options
    );

    if (!data) {
      throw new Error('Could not get attachments');
    }

    const attachments = data.flatMap(({ attachments }) => attachments);
    if (attachments.length === 0) {
      return res.status(404).send('NO_ATTACHMENTS');
    }

    callFactoryService<ProposalAttachmentData, MetaBase>(
      DownloadType.ZIP,
      ZIPType.ATTACHMENT,
      {
        data,
        meta: {
          collectionFilename: `attachments_${getCurrentTimestamp()}.zip`,
          singleFilename: `attachment_${getCurrentTimestamp()}.zip`,
        },
        userRole: req.user.currentRole,
      },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${ZIPType.PROPOSAL}/:proposal_pks`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

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
      collectionFilename: `proposals_${getCurrentTimestamp()}.zip`,
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
          meta,
          {
            filter: req.query?.filter?.toString(),
          }
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

    if (!data) {
      throw new Error('Could not get proposal details');
    }

    meta.singleFilename = `proposals_${getCurrentTimestamp()}.zip`;

    const userRole = req.user.currentRole;
    callFactoryService<ProposalPDFData, MetaBase>(
      DownloadType.ZIP,
      ZIPType.PROPOSAL,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

export default function zipDownload() {
  return router;
}
