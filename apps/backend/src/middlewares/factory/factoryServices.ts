import { logger } from '@user-office-software/duo-logger';
import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { PdfTemplateDataSource } from '../../datasources/PdfTemplateDataSource';
import { FactoryServicesAuthorized } from '../../decorators';
import {
  collectProposalPDFData,
  collectProposalPDFDataTokenAccess,
  collectProposalPregeneratedPdfData,
  collectProposalPregeneratedPdfDataTokenAccess,
  FullProposalPDFData,
  PregeneratedProposalPDFData,
} from '../../factory/pdf/proposal';
import { MetaBase } from '../../factory/service';
import {
  collectProposalAttachmentData,
  ProposalAttachmentData,
} from '../../factory/zip/attachment';
import { UserWithRole } from '../../models/User';
import { PdfTemplate } from '../../resolvers/types/PdfTemplate';

export type DownloadOptions = {
  filter?: string;
  questionIds?: string[];
};
export interface DownloadTypeServices {
  getPdfProposals(
    agent: UserWithRole,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    options?: DownloadOptions
  ): Promise<FullProposalPDFData[] | null>;
  getPregeneratedPdfProposals(
    agent: UserWithRole,
    proposalPks: number[],
    proposalFileMeta: MetaBase
  ): Promise<PregeneratedProposalPDFData[]>;
  getProposalAttachments(
    agent: UserWithRole,
    proposalPks: number[],
    options: DownloadOptions
  ): Promise<ProposalAttachmentData[] | null>;
  getPdfTemplate(
    agent: UserWithRole,
    pdfTemplateId: number
  ): Promise<PdfTemplate | null>;
}
@injectable()
export default class FactoryServices implements DownloadTypeServices {
  @FactoryServicesAuthorized()
  async getPdfProposals(
    agent: UserWithRole | null,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    options?: DownloadOptions
  ): Promise<FullProposalPDFData[] | null> {
    let data = null;
    if (agent) {
      data = await Promise.all(
        proposalPks.map((proposalPk, indx) => {
          if (agent?.isApiAccessToken)
            return collectProposalPDFDataTokenAccess(
              proposalPk,
              options,
              indx === 0
                ? (filename: string) =>
                    (proposalFileMeta.singleFilename = filename)
                : undefined
            );

          return collectProposalPDFData(
            proposalPk,
            agent,
            indx === 0
              ? (filename: string) =>
                  (proposalFileMeta.singleFilename = filename)
              : undefined
          );
        })
      );
    }

    return data;
  }

  @FactoryServicesAuthorized()
  async getPregeneratedPdfProposals(
    agent: UserWithRole | null,
    proposalPks: number[],
    proposalFileMeta: MetaBase
  ): Promise<PregeneratedProposalPDFData[]> {
    if (!agent) {
      return [];
    }

    logger.logInfo(
      `Collecting pregenerated proposal PDF data for ${proposalPks.length} proposals`,
      {
        proposalPks: proposalPks,
      }
    );

    const allProposalData = await Promise.all(
      proposalPks.map((proposalPk, indx) => {
        if (agent?.isApiAccessToken)
          return collectProposalPregeneratedPdfDataTokenAccess(
            proposalPk,
            indx === 0
              ? (filename: string) =>
                  (proposalFileMeta.singleFilename = filename)
              : undefined
          );

        return collectProposalPregeneratedPdfData(
          proposalPk,
          agent,
          indx === 0
            ? (filename: string) => (proposalFileMeta.singleFilename = filename)
            : undefined
        );
      })
    );

    const pregeneratedProposalData = allProposalData.filter(
      (item): item is PregeneratedProposalPDFData => item !== null
    );

    return pregeneratedProposalData;
  }

  @FactoryServicesAuthorized()
  async getProposalAttachments(
    agent: UserWithRole,
    proposalPks: number[],
    options: DownloadOptions | undefined
  ): Promise<ProposalAttachmentData[] | null> {
    if (agent && options) {
      return await Promise.all(
        proposalPks.map((proposalPk) => {
          return collectProposalAttachmentData(proposalPk, agent, options);
        })
      );
    }

    return null;
  }

  @FactoryServicesAuthorized()
  async getPdfTemplate(
    agent: UserWithRole,
    pdfTemplateId: number
  ): Promise<PdfTemplate | null> {
    let data = null;
    if (agent) {
      data = await container
        .resolve<PdfTemplateDataSource>(Tokens.PdfTemplateDataSource)
        .getPdfTemplate(pdfTemplateId);
    }

    return data;
  }
}
