import { GetGenericTemplatesWithProposalDataQuery } from 'generated/sdk';

export type GenericTemplateWithProposalData = NonNullable<
  GetGenericTemplatesWithProposalDataQuery['genericTemplates']
>[number];
