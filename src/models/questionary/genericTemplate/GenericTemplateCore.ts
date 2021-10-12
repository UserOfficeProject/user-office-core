import { GetGenericTemplatesWithQuestionaryStatusQuery } from 'generated/sdk';

export type GenericTemplateCore = Exclude<
  GetGenericTemplatesWithQuestionaryStatusQuery['genericTemplates'],
  null
>[number];
