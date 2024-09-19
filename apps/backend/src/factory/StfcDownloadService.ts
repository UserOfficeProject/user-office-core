import querystring from 'querystring';

import { logger } from '@user-office-software/duo-logger';
import contentDisposition from 'content-disposition';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { FileDataSource } from '../datasources/FileDataSource';
import { Role } from '../models/Role';
import {
  MetaBase,
  DownloadType,
  PDFType,
  XLSXType,
  ZIPType,
  DownloadService,
  fetchDataAndStreamResponse,
} from './DownloadService';
import { ProposalPDFData } from './pdf/proposal';

export class StfcDownloadService implements DownloadService {
  async callFactoryService<TData, TMeta extends MetaBase>(
    downloadType: DownloadType,
    type: PDFType | XLSXType | ZIPType,
    properties: { data: TData[]; meta: TMeta; userRole: Role },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let isPdfAvailable = false;
    let proposalPdfData = null;
    let fileName = '';

    if (
      properties?.data?.length === 1 &&
      type === PDFType.PROPOSAL &&
      downloadType === DownloadType.PDF
    ) {
      const data = properties?.data[0] as ProposalPDFData;
      if (data.proposal.submitted) {
        const callDataSource = container.resolve<CallDataSource>(
          Tokens.CallDataSource
        );

        const call = await callDataSource.getCall(data.proposal.callId);

        const facility = getFacilityName(call?.shortCode);

        if (facility != null) {
          const fileDataSource = container.resolve<FileDataSource>(
            Tokens.FileDataSource
          );

          fileName = `${facility}-${data.proposal.proposalId}.pdf`;

          const loggingContext = {
            message: `Failed to download proposal PDF ${data.proposal.proposalId} from Postgres storage`,
            proposalId: data.proposal.proposalId,
            callId: call?.id,
            callShortCode: call?.shortCode,
            facilityIdentifiedAs: facility,
            storedFileName: fileName,
          };

          try {
            proposalPdfData = await fileDataSource.getBlobdata(fileName);
          } catch (error) {
            next({
              error: error,
              ...loggingContext,
            });
          }

          if (proposalPdfData) {
            fileName = `${data.proposal.proposalId}_${
              data.principalInvestigator.lastname
            }_${data.proposal.created.getUTCFullYear()}.pdf`;

            proposalPdfData.on('error', (streamError) => {
              next({
                error: streamError,
                ...loggingContext,
                formattedFilename: fileName,
              });
            });

            isPdfAvailable = true;
          } else {
            // This is a reasonable case, so don't log an error
            logger.logInfo(
              `Proposal PDF for ${data.proposal.proposalId} not found in Postgres storage, generating via Factory instead`,
              {
                ...loggingContext,
              }
            );
          }
        }
      }
    }

    if (isPdfAvailable && proposalPdfData && fileName != '') {
      const proposal = (properties?.data[0] as ProposalPDFData)?.proposal;

      try {
        res.setHeader('Content-Disposition', contentDisposition(fileName));
        res.setHeader('x-download-filename', querystring.escape(fileName));
        res.setHeader('content-type', 'application/pdf');

        res.on('finish', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logger.logInfo(
              `Succesfully sent proposal PDF ${proposal.proposalId} from Postgres storage`,
              {
                proposalId: proposal.proposalId,
                call: proposal.callId,
                storedFileName: fileName,
                statusCode: res.statusCode,
              }
            );
          } else {
            next({
              message: `Failed to send proposal PDF ${proposal.proposalId} from Postgres storage`,
              proposalId: proposal.proposalId,
              call: proposal.callId,
              storedFileName: fileName,
              statusCode: res.statusCode,
            });
          }
        });

        proposalPdfData.pipe(res);
      } catch (error) {
        next({
          error,
          message: `Failed to send proposal PDF ${proposal.proposalId} from Postgres storage`,
          proposalId: proposal.proposalId,
          call: proposal.callId,
          storedFileName: fileName,
        });
      }

      return;
    }

    fetchDataAndStreamResponse(downloadType, type, properties, req, res, next);
  }
}

function getFacilityName(shortCode: string | undefined) {
  let facility = null;
  if (!shortCode) {
    return facility;
  }
  const facilityList = ['ISIS', 'Artemis', 'HPL', 'LSF'];
  facilityList.forEach((fac) => {
    if (shortCode.includes(fac)) {
      facility = fac;
    }
  });

  return facility;
}
