import { injectable } from 'tsyringe';

import { FactoryServicesAuthorized } from '../../decorators';
import {
  collectProposalPDFData,
  collectProposalPDFDataTokenAccess,
  ProposalPDFData,
} from '../../factory/pdf/proposal';
import { MetaBase } from '../../factory/service';
import { UserWithRole } from '../../models/User';

export interface PDFServices {
  getPdfProposals(
    agent: UserWithRole,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    proposalFilterType?: string
  ): Promise<ProposalPDFData[] | null>;
}
@injectable()
export default class FactoryServices implements PDFServices {
  @FactoryServicesAuthorized()
  async getPdfProposals(
    agent: UserWithRole | null,
    proposalPks: number[],
    proposalFileMeta: MetaBase,
    proposalFilterType?: string
  ): Promise<ProposalPDFData[] | null> {
    let data = null;
    if (agent) {
      data = await Promise.all(
        proposalPks.map((proposalPk, indx) => {
          if (agent?.isApiAccessToken)
            return collectProposalPDFDataTokenAccess(
              proposalPk,
              agent,
              proposalFilterType ?? undefined,
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
}
