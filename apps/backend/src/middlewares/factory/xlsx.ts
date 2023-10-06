import express from 'express';
import { container } from 'tsyringe';

import { UserAuthorization } from '../../auth/UserAuthorization';
import { Tokens } from '../../config/Tokens';
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
import { collectSEPlXLSXData } from '../../factory/xlsx/sep';

//const sepDataColumns = container.resolve<string[]>(Tokens.SEPDataColumns);

const router = express.Router();

router.get(`/${XLSXType.PROPOSAL}/:proposal_pks`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...req.user.user,
      currentRole: req.user.currentRole,
    };

    const proposalPks: number[] = req.params.proposal_pks
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    const userAuthorization = container.resolve<UserAuthorization>(
      Tokens.UserAuthorization
    );

    if (!userAuthorization.isUserOfficer(userWithRole)) {
      throw new Error('User has insufficient rights');
    }
    const meta: XLSXMetaBase = {
      singleFilename: '',
      collectionFilename: `proposals_${getCurrentTimestamp()}.xlsx`,
      columns: defaultProposalDataColumns,
    };

    const data = await Promise.all(
      proposalPks.map((proposalPk, indx) =>
        collectProposalXLSXData(
          proposalPk,
          userWithRole,
          indx === 0
            ? (filename: string) => (meta.singleFilename = filename)
            : undefined
        )
      )
    );

    const userRole = req.user.currentRole;
    callFactoryService(
      DownloadType.XLSX,
      XLSXType.PROPOSAL,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${XLSXType.SEP}/:sep_id/call/:call_id`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...req.user.user,
      currentRole: req.user.currentRole,
    };

    const sepId = parseInt(req.params.sep_id);
    const callId = parseInt(req.params.call_id);

    if (isNaN(+sepId) || isNaN(+callId)) {
      throw new Error(
        `Invalid SEP or call ID: SEP ${req.params.sep_id}, Call ${req.params.call_id}`
      );
    }

    const { data, filename } = await collectSEPlXLSXData(
      sepId,
      callId,
      userWithRole
    );

    const meta: XLSXMetaBase = {
      singleFilename: filename,
      collectionFilename: filename,
      columns: [], //sepDataColumns,
    };

    const userRole = req.user.currentRole;
    callFactoryService(
      DownloadType.XLSX,
      XLSXType.SEP,
      { data, meta, userRole },
      req,
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
