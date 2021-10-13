import { GenericTemplate } from '../../models/GenericTemplate';
import { UpdateGenericTemplateArgs } from '../../resolvers/mutations/UpdateGenericTemplateMutation';
import { GenericTemplatesArgs } from '../../resolvers/queries/GenericTemplatesQuery';
import { GenericTemplateDataSource } from '../GenericTemplateDataSource';

export class GenericTemplateDataSourceMock
  implements GenericTemplateDataSource
{
  genericTemplates: GenericTemplate[];
  constructor() {
    this.init();
  }

  public init() {
    this.genericTemplates = [
      new GenericTemplate(
        1,
        'title',
        1,
        1,
        1,
        'genericTemplateQuestionId',
        new Date()
      ),
    ];
  }
  async getGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate | null> {
    return (
      this.genericTemplates.find(
        (genericTemplate) => genericTemplate.id === genericTemplateId
      ) || null
    );
  }

  async getGenericTemplates(
    _args: GenericTemplatesArgs
  ): Promise<GenericTemplate[]> {
    return this.genericTemplates;
  }

  async create(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    questionId: string
  ): Promise<GenericTemplate> {
    return new GenericTemplate(
      1,
      title,
      creatorId,
      proposalPk,
      questionaryId,
      questionId,
      new Date()
    );
  }

  async delete(genericTemplateId: number): Promise<GenericTemplate> {
    return this.genericTemplates.splice(
      this.genericTemplates.findIndex(
        (genericTemplate) => genericTemplate.id == genericTemplateId
      ),
      1
    )[0];
  }

  async updateGenericTemplate(
    args: UpdateGenericTemplateArgs
  ): Promise<GenericTemplate> {
    const genericTemplate = await this.getGenericTemplate(
      args.genericTemplateId
    );
    if (!genericTemplate) {
      throw new Error('GenericTemplate not found');
    }
    genericTemplate.title = args.title || genericTemplate.title;

    return genericTemplate;
  }

  async cloneGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate> {
    const genericTemplate = await this.getGenericTemplate(genericTemplateId);
    if (!genericTemplate) {
      throw new Error('GenericTemplate not found');
    }

    return genericTemplate;
  }
}
