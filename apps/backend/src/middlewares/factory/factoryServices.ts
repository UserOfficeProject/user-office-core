import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { PdfTemplateDataSource } from '../../datasources/PdfTemplateDataSource';
import { FactoryServicesAuthorized } from '../../decorators';
import {
  collectProposalPDFData,
  collectProposalPDFDataTokenAccess,
  ProposalPDFData,
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
  ): Promise<ProposalPDFData[] | null>;
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
  ): Promise<ProposalPDFData[] | null> {
    let data = null;
    if (agent) {
      data = await Promise.all(
        proposalPks.map((proposalPk, indx) => {
          if (agent?.isApiAccessToken)
            return collectProposalPDFDataTokenAccess(
              proposalPk,
              agent,
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
