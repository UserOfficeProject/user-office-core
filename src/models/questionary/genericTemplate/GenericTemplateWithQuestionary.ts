import { GetGenericTemplateQuery } from 'generated/sdk';

export type GenericTemplateWithQuestionary = Exclude<
  GetGenericTemplateQuery['genericTemplate'],
  null
>;
