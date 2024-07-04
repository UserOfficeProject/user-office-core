import querystring from 'querystring';

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
          proposalPdfData = await fileDataSource.getBlobdata(
            `${facility}-${data.proposal.proposalId}.pdf`
          );

          if (proposalPdfData) {
            isPdfAvailable = true;
            fileName = `${data.proposal.proposalId}_${
              data.principalInvestigator.lastname
            }_${data.proposal.created.getUTCFullYear()}.pdf`;
          }
        }
      }
    }

    if (isPdfAvailable && proposalPdfData && fileName != '') {
      try {
        res.setHeader('Content-Disposition', contentDisposition(fileName));
        res.setHeader('x-download-filename', querystring.escape(fileName));
        res.setHeader('content-type', 'application/pdf');

        proposalPdfData.pipe(res);
        await new Promise((f) => setTimeout(f, 1000));
        proposalPdfData.emit('end');
      } catch (error) {
        next({
          error,
          message: 'Could not generate proposal pdf',
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
