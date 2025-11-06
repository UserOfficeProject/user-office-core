import { logger } from '@user-office-software/duo-logger';
import express from 'express';
import { container } from 'tsyringe';

import FactoryServices, { DownloadTypeServices } from './factoryServices';
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
import { UserWithRole } from '../../models/User';

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

router.get(`/${ZIPType.PROPOSAL}/:proposal_keys`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }
    const factoryServices =
      container.resolve<DownloadTypeServices>(FactoryServices);

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
      `Proposal ZIP download for ${numRequestedKeys} proposals requested`,
      {
        requestedProps: requestedKeys,
        propsIdentifier: isIdFiltered ? 'ID' : 'PK',
        requestedBy: requesterContext,
      }
    );

    const meta: MetaBase = {
      collectionFilename: `proposals_${getCurrentTimestamp()}.zip`,
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
      `Collected proposal ZIP download data for ${data.length} proposals`,
      {
        requestedProps: requestedKeys,
        propsIdentifier: isIdFiltered ? 'ID' : 'PK',
        propsToGenerate,
        ...(isPregeneratedProposalPdfsEnabled && { propsToPregenerate }),
        requestedBy: requesterContext,
      }
    );

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
