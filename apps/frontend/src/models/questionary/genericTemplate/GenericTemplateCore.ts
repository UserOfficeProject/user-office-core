import { GetGenericTemplatesWithQuestionaryStatusQuery } from 'generated/sdk';

export type GenericTemplateCore = NonNullable<
  GetGenericTemplatesWithQuestionaryStatusQuery['genericTemplates']
>[number];
