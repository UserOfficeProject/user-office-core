import { ProposalPdfTemplate } from '../models/ProposalPdfTemplate';
import { CreateProposalPdfTemplateInput } from '../resolvers/mutations/CreateProposalPdfTemplateMutation';
import { UpdateProposalPdfTemplateArgs } from '../resolvers/mutations/UpdateProposalPdfTemplateMutation';
import { PdfTemplatesArgs } from '../resolvers/queries/ProposalPdfTemplatesQuery';

export type CreateProposalPdfTemplateInputWithCreator =
  CreateProposalPdfTemplateInput & {
    creatorId: number;
  };

export interface ProposalPdfTemplateDataSource {
  delete(proposalPdfTemplateId: number): Promise<ProposalPdfTemplate>;
  clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ProposalPdfTemplate>;
  updatePdfTemplate(
    args: UpdateProposalPdfTemplateArgs
  ): Promise<ProposalPdfTemplate>;
  createPdfTemplate(
    args: CreateProposalPdfTemplateInputWithCreator
  ): Promise<ProposalPdfTemplate>;
  getPdfTemplate(
    proposalPdfTemplateId: number
  ): Promise<ProposalPdfTemplate | null>;
  getPdfTemplates(args: PdfTemplatesArgs): Promise<ProposalPdfTemplate[]>;
}
