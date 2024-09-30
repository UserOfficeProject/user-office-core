import {
  GetGenericTemplatesWithProposalDataQuery,
  GetGenericTemplatesWithQuestionaryStatusQuery,
} from 'generated/sdk';

export type GenericTemplateCore = NonNullable<
  GetGenericTemplatesWithQuestionaryStatusQuery['genericTemplates']
>[number];

export type GenericTemplateCoreWithProposalData = NonNullable<
  GetGenericTemplatesWithProposalDataQuery['genericTemplates']
>[number];
