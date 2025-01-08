import {
  GetGenericTemplateQuery,
  GetGenericTemplatesOnCopyQuery,
} from 'generated/sdk';

export type GenericTemplateWithQuestionary = NonNullable<
  GetGenericTemplateQuery['genericTemplate']
>;

export type GenericTemplateOnCopy = NonNullable<
  GetGenericTemplatesOnCopyQuery['genericTemplatesOnCopy']
>;
