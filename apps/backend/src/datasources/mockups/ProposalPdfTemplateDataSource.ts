import { ProposalPdfTemplate } from '../../models/ProposalPdfTemplate';
import { UpdateProposalPdfTemplateArgs } from '../../resolvers/mutations/UpdateProposalPdfTemplateMutation';
import { ExperimentSafetyPdfTemplatesArgs } from '../../resolvers/queries/ExperimentSafetyPdfTemplatesQuery';
import {
  CreateProposalPdfTemplateInputWithCreator,
  ProposalPdfTemplateDataSource,
} from '../ProposalPdfTemplateDataSource';

export let dummyPdfTemplate: ProposalPdfTemplate;

const dummyProposalPdfTemplateFactory = (
  values?: Partial<ProposalPdfTemplate>
) => {
  return new ProposalPdfTemplate(
    values?.proposalPdfTemplateId || 1,
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

export class ProposalPdfTemplateDataSourceMock
  implements ProposalPdfTemplateDataSource
{
  public init() {
    dummyPdfTemplate = dummyProposalPdfTemplateFactory();
  }

  constructor() {
    this.init();
  }

  async delete(proposalPdfTemplateId: number): Promise<ProposalPdfTemplate> {
    if (dummyPdfTemplate.proposalPdfTemplateId !== proposalPdfTemplateId) {
      throw new Error(
        `Template with ID ${proposalPdfTemplateId} does not exist`
      );
    }

    const copyOfTemplate = dummyProposalPdfTemplateFactory(dummyPdfTemplate);
    dummyPdfTemplate.proposalPdfTemplateId = 999; // mocking deleting template with ID

    return copyOfTemplate;
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ProposalPdfTemplate> {
    return dummyPdfTemplate;
  }

  async updatePdfTemplate(
    args: UpdateProposalPdfTemplateArgs
  ): Promise<ProposalPdfTemplate> {
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
  }: CreateProposalPdfTemplateInputWithCreator): Promise<ProposalPdfTemplate> {
    dummyPdfTemplate = dummyProposalPdfTemplateFactory({
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
    proposalPdfTemplateId: number
  ): Promise<ProposalPdfTemplate | null> {
    return dummyPdfTemplate;
  }

  async getPdfTemplates(
    args: ExperimentSafetyPdfTemplatesArgs
  ): Promise<ProposalPdfTemplate[]> {
    return [dummyPdfTemplate];
  }
}
