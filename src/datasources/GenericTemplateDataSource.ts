import { GenericTemplate } from '../models/GenericTemplate';
import { UpdateGenericTemplateArgs } from '../resolvers/mutations/UpdateGenericTemplateMutation';
import { GenericTemplateArgs } from '../resolvers/queries/GenericTemplateQuery';

export interface GenericTemplateDataSource {
  delete(genericTemplateId: number): Promise<GenericTemplate>;
  cloneGenericTemplate(genericTemplateId: number): Promise<GenericTemplate>;
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
  getGenericTemplatesByCallId(callId: number): Promise<GenericTemplate[]>;
  getGenericTemplates(args: GenericTemplateArgs): Promise<GenericTemplate[]>;
  getGenericTemplatesByShipmentId(
    shipmentId: number
  ): Promise<GenericTemplate[]>;
}
