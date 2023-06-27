import { injectable } from 'tsyringe';

import { FactoryServicesAuthorized } from '../../decorators';
import {
  collectProposalPDFData,
  collectProposalPDFDataTokenAccess,
  ProposalPDFData,
} from '../../factory/pdf/proposal';
import { MetaBase } from '../../factory/service';
import { UserWithRole } from '../../models/User';

export type ProposalPdfDownloadOptions = {
  filter?: string;
  pdfTemplateId?: number;
  questionIds?: string[];
};
export interface PDFServices {
  getPdfProposals(
    agent: UserWithRole,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    options?: ProposalPdfDownloadOptions
  ): Promise<ProposalPDFData[] | null>;
}
@injectable()
export default class FactoryServices implements PDFServices {
  @FactoryServicesAuthorized()
  async getPdfProposals(
    agent: UserWithRole | null,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    options?: ProposalPdfDownloadOptions
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
            options,
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
}
