import { ExperimentSafetyPdfTemplate } from '../../models/ExperimentSafetyPdfTemplate';
import { UpdateExperimentSafetyPdfTemplateArgs } from '../../resolvers/mutations/UpdateExperimentSafetyPdfTemplateMutation';
import { PdfTemplatesArgs } from '../../resolvers/queries/ProposalPdfTemplatesQuery';
import {
  CreateExperimentSafetyPdfTemplateInputWithCreator,
  ExperimentSafetyPdfTemplateDataSource,
} from '../ExperimentSafetyPdfTemplateDataSource';

export let dummyPdfTemplate: ExperimentSafetyPdfTemplate;

const dummyExperimentSafetyPdfTemplateFactory = (
  values?: Partial<ExperimentSafetyPdfTemplate>
) => {
  return new ExperimentSafetyPdfTemplate(
    values?.experimentSafetyPdfTemplateId || 1,
    values?.templateId || 1,
    values?.templateData || '...',
    values?.templateHeader || '...',
    values?.templateFooter || '...',
    values?.templateSampleDeclaration || '...',
    values?.dummyData || '...',
    values?.creatorId || 1,
    values?.created || new Date()
  );
};

export class ExperimentSafetyPdfTemplateDataSourceMock
  implements ExperimentSafetyPdfTemplateDataSource
{
  public init() {
    dummyPdfTemplate = dummyExperimentSafetyPdfTemplateFactory();
  }

  constructor() {
    this.init();
  }

  async delete(
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate> {
    if (
      dummyPdfTemplate.experimentSafetyPdfTemplateId !==
      experimentSafetyPdfTemplateId
    ) {
      throw new Error(
        `Template with ID ${experimentSafetyPdfTemplateId} does not exist`
      );
    }

    const copyOfTemplate =
      dummyExperimentSafetyPdfTemplateFactory(dummyPdfTemplate);
    dummyPdfTemplate.experimentSafetyPdfTemplateId = 999; // mocking deleting template with ID

    return copyOfTemplate;
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate> {
    return dummyPdfTemplate;
  }

  async updatePdfTemplate(
    args: UpdateExperimentSafetyPdfTemplateArgs
  ): Promise<ExperimentSafetyPdfTemplate> {
    dummyPdfTemplate = { ...dummyPdfTemplate, ...args };

    return dummyPdfTemplate;
  }

  async createPdfTemplate({
    templateId,
    templateData,
    templateHeader,
    templateFooter,
    templateSampleDeclaration,
    dummyData,
    creatorId,
  }: CreateExperimentSafetyPdfTemplateInputWithCreator): Promise<ExperimentSafetyPdfTemplate> {
    dummyPdfTemplate = dummyExperimentSafetyPdfTemplateFactory({
      templateId,
      templateData,
      templateHeader,
      templateFooter,
      templateSampleDeclaration,
      dummyData,
      creatorId,
    });

    return dummyPdfTemplate;
  }

  async getPdfTemplate(
    ExperimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate | null> {
    return dummyPdfTemplate;
  }

  async getPdfTemplates(
    args: PdfTemplatesArgs
  ): Promise<ExperimentSafetyPdfTemplate[]> {
    return [dummyPdfTemplate];
  }
}
