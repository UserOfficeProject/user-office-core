import express from 'express';
import { container } from 'tsyringe';

import callFactoryService, {
  DownloadType,
  MetaBase,
  ZIPType,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import { ProposalAttachmentData } from '../../factory/zip/attachment';
import FactoryServices, { DownloadTypeServices } from './factoryServices';

const router = express.Router();

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

export default function zipDownload() {
  return router;
}
