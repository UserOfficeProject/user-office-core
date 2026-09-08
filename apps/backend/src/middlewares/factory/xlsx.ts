import express from 'express';
import { container } from 'tsyringe';

import i18next from '../../../i18next';
import { UserAuthorization } from '../../auth/UserAuthorization';
import { Tokens } from '../../config/Tokens';
import callFactoryService, {
  XLSXType,
  XLSXMetaBase,
  DownloadType,
} from '../../factory/service';
import { getCurrentTimestamp } from '../../factory/util';
import {
  DefaultCallExtraFapDataColumns,
  collectCallFapXLSXData,
} from '../../factory/xlsx/callFaps';
import { collectFapXLSXData } from '../../factory/xlsx/fap';
import { collectManagementDecisionXLSXData } from '../../factory/xlsx/managementDecision';
import {
  collectProposalXLSXData,
  collectTechniqueProposalXLSXData,
  defaultProposalDataColumns,
} from '../../factory/xlsx/proposal';

const fapDataColumns = container.resolve<string[]>(Tokens.FapDataColumns);
const callExtraFapDataColumns = container.isRegistered(
  Tokens.CallExtraFapDataColumns
)
  ? container.resolve<string[]>(Tokens.CallExtraFapDataColumns)
  : DefaultCallExtraFapDataColumns;

const router = express.Router();

router.get(`/${XLSXType.PROPOSAL}/:proposal_pks`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...res.locals.agent,
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

router.get(`/${XLSXType.FAP}/:fap_id/call/:call_id`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...res.locals.agent,
    };

    const fapId = parseInt(req.params.fap_id);
    const callId = parseInt(req.params.call_id);

    if (isNaN(+fapId) || isNaN(+callId)) {
      throw new Error(
        `Invalid Fap or call ID: Fap ${req.params.fap_id}, Call ${req.params.call_id}`
      );
    }

    const { data, filename } = await collectFapXLSXData(
      fapId,
      callId,
      userWithRole
    );

    const meta: XLSXMetaBase = {
      singleFilename: filename,
      collectionFilename: filename,
      columns: fapDataColumns,
    };

    const userRole = req.user.currentRole;
    callFactoryService(
      DownloadType.XLSX,
      XLSXType.FAP,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${XLSXType.CALL_FAP}/:call_id`, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...res.locals.agent,
    };

    const callId = parseInt(req.params.call_id);

    if (isNaN(+callId)) {
      throw new Error(`Invalid call ID:  Call ${req.params.call_id}`);
    }

    const { data, filename } = await collectCallFapXLSXData(
      callId,
      userWithRole
    );

    const meta: XLSXMetaBase = {
      singleFilename: filename,
      collectionFilename: filename,
      columns: fapDataColumns.concat(callExtraFapDataColumns),
    };

    const userRole = req.user.currentRole;
    callFactoryService(
      DownloadType.XLSX,
      XLSXType.CALL_FAP,
      { data, meta, userRole },
      req,
      res,
      next
    );
  } catch (e) {
    next(e);
  }
});

router.get(`/${XLSXType.TECHNIQUE}/:proposal_pks`, async (req, res, next) => {
  const userAuthorization = container.resolve<UserAuthorization>(
    Tokens.UserAuthorization
  );

  const userWithRole = {
    ...res.locals.agent,
  };

  const roleTags = await userAuthorization.getCurrentRoleTags(userWithRole);
  const translationForFirstRoleTag = !roleTags.length
    ? ''
    : roleTags[0].name + '.';

  const techniqueProposalDataColumns = [
    'Proposal ID',
    'Title',
    'Principal Investigator',
    'PI Email',
    'Date Submitted',
    i18next.t(`${translationForFirstRoleTag}Technique`),
    'Instrument',
    'Status',
  ];

  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const proposalPks: number[] = req.params.proposal_pks
      .split(',')
      .map((n: string) => parseInt(n))
      .filter((id: number) => !isNaN(id));

    if (
      !userAuthorization.isUserOfficer(userWithRole) &&
      !userAuthorization.isInstrumentScientist(userWithRole)
    ) {
      throw new Error('User has insufficient rights');
    }
    const meta: XLSXMetaBase = {
      singleFilename: '',
      collectionFilename: `proposals_${getCurrentTimestamp()}.xlsx`,
      columns: techniqueProposalDataColumns,
    };

    const data = await Promise.all(
      proposalPks.map((proposalPk, indx) =>
        collectTechniqueProposalXLSXData(
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

router.get('/management-decision/:call_id', async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized');
    }

    const userWithRole = {
      ...res.locals.agent,
    };

    const callId = parseInt(req.params.call_id);

    if (isNaN(+callId)) {
      throw new Error(`Invalid call ID:  Call ${req.params.call_id}`);
    }

    const { data, filename } = await collectManagementDecisionXLSXData(
      callId,
      userWithRole
    );

    const managementDecisionColumns = [
      'Proposal ID',
      'Proposal PK',
      'Instrument ID',
      'Instrument Name',
      'Principal Investigator',
      'Remaining Instrument Available Time', // Running total of remaining available instrument time
      'Time Allocation',
      'FAP Recommendation',
      'FAP Comment to User',
      'FAP Comment to Management',
      'Technical Review Comments',
    ];

    const meta: XLSXMetaBase = {
      singleFilename: filename,
      collectionFilename: filename,
      columns: managementDecisionColumns,
    };

    const userRole = req.user.currentRole;
    callFactoryService(
      DownloadType.XLSX,
      XLSXType.MANAGEMENT_DECISION,
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
