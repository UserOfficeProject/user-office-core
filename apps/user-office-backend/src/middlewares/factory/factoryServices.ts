import { inject, injectable } from 'tsyringe';

import { FactoryServicesAuthorized } from '../../decorators';
import {
  collectProposalPDFData,
  ProposalPDFData,
} from '../../factory/pdf/proposal';
import { ProposalTokenAccess } from '../../factory/pdf/proposalTokenAccess';
import { MetaBase } from '../../factory/service';
import { UserWithRole } from '../../models/User';

@injectable()
export default class FactoryServices {
  constructor(
    @inject(ProposalTokenAccess)
    private proposalTokenAccess: ProposalTokenAccess
  ) {}

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
            return this.proposalTokenAccess.collectProposalPDFData(
              agent,
              proposalPk,
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
