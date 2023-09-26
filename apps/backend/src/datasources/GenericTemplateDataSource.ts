import { GenericTemplate } from '../models/GenericTemplate';
import { UpdateGenericTemplateArgs } from '../resolvers/mutations/UpdateGenericTemplateMutation';
import { GenericTemplatesArgs } from '../resolvers/queries/GenericTemplatesQuery';

export interface GenericTemplateDataSource {
  delete(genericTemplateId: number): Promise<GenericTemplate>;
  cloneGenericTemplate(
    genericTemplateId: number,
    reviewBeforeSubmit?: boolean
  ): Promise<GenericTemplate>;
  updateGenericTemplate(
    args: UpdateGenericTemplateArgs
  ): Promise<GenericTemplate>;
  create(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    questionId: string
  ): Promise<GenericTemplate>;
  getGenericTemplate(
    genericTemplateId: number
  ): Promise<GenericTemplate | null>;
  getGenericTemplates(args: GenericTemplatesArgs): Promise<GenericTemplate[]>;
  createGenericTemplateWithCopiedAnswers(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    templateId: number,
    questionId: string,
    sourceQuestionaryId: number
  ): Promise<GenericTemplate>;
}
