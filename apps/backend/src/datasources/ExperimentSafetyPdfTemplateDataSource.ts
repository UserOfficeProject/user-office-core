import { ExperimentSafetyPdfTemplate } from '../models/ExperimentSafetyPdfTemplate';
import { CreateExperimentSafetyPdfTemplateInput } from '../resolvers/mutations/CreateExperimentSafetyPdfTemplateMutation';
import { UpdateExperimentSafetyPdfTemplateArgs } from '../resolvers/mutations/UpdateExperimentSafetyPdfTemplateMutation';
import { PdfTemplatesArgs } from '../resolvers/queries/ProposalPdfTemplatesQuery';

export type CreateExperimentSafetyPdfTemplateInputWithCreator =
  CreateExperimentSafetyPdfTemplateInput & {
    creatorId: number;
  };

export interface ExperimentSafetyPdfTemplateDataSource {
  delete(
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate>;
  clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate>;
  updatePdfTemplate(
    args: UpdateExperimentSafetyPdfTemplateArgs
  ): Promise<ExperimentSafetyPdfTemplate>;
  createPdfTemplate(
    args: CreateExperimentSafetyPdfTemplateInputWithCreator
  ): Promise<ExperimentSafetyPdfTemplate>;
  getPdfTemplate(
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate | null>;
  getPdfTemplates(
    args: PdfTemplatesArgs
  ): Promise<ExperimentSafetyPdfTemplate[]>;
}
