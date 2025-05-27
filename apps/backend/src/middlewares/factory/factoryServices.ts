import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentSafetyPdfTemplateDataSource } from '../../datasources/ExperimentSafetyPdfTemplateDataSource';
import { ProposalPdfTemplateDataSource } from '../../datasources/ProposalPdfTemplateDataSource';
import { FactoryServicesAuthorized } from '../../decorators';
import { MetaBase } from '../../factory/DownloadService';
import {
  collectExperimentPDFData,
  collectExperimentPDFDataTokenAccess,
  ExperimentSafetyPDFData,
} from '../../factory/pdf/experimentSafety';
import {
  collectProposalPDFData,
  collectProposalPDFDataTokenAccess,
  ProposalPDFData,
} from '../../factory/pdf/proposal';
import {
  collectProposalAttachmentData,
  ProposalAttachmentData,
} from '../../factory/zip/attachment';
import { UserWithRole } from '../../models/User';
import { ExperimentSafetyPdfTemplate } from '../../resolvers/types/ExperimentSafetyPdfTemplate';
import { ProposalPdfTemplate } from '../../resolvers/types/ProposalPdfTemplate';

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
  getPdfExperimentsSafety(
    agent: UserWithRole,
    experimentPks: number[],
    experimentFileMeta: MetaBase
  ): Promise<ExperimentSafetyPDFData[] | null>;
  getProposalAttachments(
    agent: UserWithRole,
    proposalPks: number[],
    options: DownloadOptions
  ): Promise<ProposalAttachmentData[] | null>;
  getProposalPdfTemplate(
    agent: UserWithRole,
    pdfTemplateId: number
  ): Promise<ProposalPdfTemplate | null>;
  getExperimentSafetyPdfTemplate(
    agent: UserWithRole,
    pdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate | null>;
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
  async getPdfExperimentsSafety(
    agent: UserWithRole,
    experimentPks: number[],
    experimentFileMeta: MetaBase
  ) {
    let data = null;
    if (agent) {
      data = await Promise.all(
        experimentPks.map((experimentPk, index) => {
          if (agent?.isApiAccessToken)
            return collectExperimentPDFDataTokenAccess(
              experimentPk,
              agent,
              index === 0
                ? (filename: string) =>
                    (experimentFileMeta.singleFilename = filename)
                : undefined
            );

          return collectExperimentPDFData(
            experimentPk,
            agent,
            index === 0
              ? (filename: string) =>
                  (experimentFileMeta.singleFilename = filename)
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
  async getProposalPdfTemplate(
    agent: UserWithRole,
    proposalPdfTemplateId: number
  ): Promise<ProposalPdfTemplate | null> {
    let data = null;
    if (agent) {
      data = await container
        .resolve<ProposalPdfTemplateDataSource>(
          Tokens.ProposalPdfTemplateDataSource
        )
        .getPdfTemplate(proposalPdfTemplateId);
    }

    return data;
  }

  @FactoryServicesAuthorized()
  async getExperimentSafetyPdfTemplate(
    agent: UserWithRole,
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate | null> {
    let data = null;
    if (agent) {
      data = await container
        .resolve<ExperimentSafetyPdfTemplateDataSource>(
          Tokens.ExperimentSafetyPdfTemplateDataSource
        )
        .getPdfTemplate(experimentSafetyPdfTemplateId);
    }

    return data;
  }
}
