import express from 'express';

import baseContext from '../../buildContext';
import callFactoryService, {
  DownloadType,
  XLSXType,
  XLSXMetaBase,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import {
  collectProposalXLSXData,
  defaultProposalDataColumns,
} from '../../factory/xlsx/proposal';
import {
  collectSEPlXLSXData,
  defaultSEPDataColumns,
} from '../../factory/xlsx/sep';
import { RequestWithUser } from '../factory';

const router = express.Router();

router.get(`/${XLSXType.PROPOSAL}/:proposal_ids`, async (req, res, next) => {
  try {
    const userWithRole = (req as RequestWithUser).user;
    const proposalIds: number[] = req.params.proposal_ids
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const userAuthorization = baseContext.userAuthorization;

    if (!userAuthorization.isUserOfficer(userWithRole)) {
      throw new Error('User has insufficient rights');
    }
    const meta: XLSXMetaBase = {
      singleFilename: '',
      collectionFilename: `proposals_${getCurrentTimestamp()}.xlsx`,
      columns: defaultProposalDataColumns,
    };

    const data = await Promise.all(
      proposalIds.map((proposalId, indx) =>
        collectProposalXLSXData(
          proposalId,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    callFactoryService(
      DownloadType.XLSX,
      XLSXType.PROPOSAL,
      { data, meta },
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${XLSXType.SEP}/:sep_id/call/:call_id`, async (req, res, next) => {
  try {
    const userWithRole = (req as RequestWithUser).user;

    const sepId = parseInt(req.params.sep_id);
    const callId = parseInt(req.params.call_id);

    if (isNaN(+sepId) || isNaN(+callId)) {
      throw new Error(
        `Invalid SEP or call ID: SEP ${req.params.sep_id}, Call ${req.params.call_id}`
      );
    }

    const meta: XLSXMetaBase = {
      singleFilename: '',
      collectionFilename: '', // not used
      columns: defaultSEPDataColumns,
    };

    const { data, filename } = await collectSEPlXLSXData(
      sepId,
      callId,
      userWithRole
    );

    meta.singleFilename = filename;

    callFactoryService(
      DownloadType.XLSX,
      XLSXType.SEP,
      { data, meta },
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

export default function xlsxDownload() {
  return router;
}
