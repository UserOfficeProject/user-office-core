import { GetGenericTemplatesWithProposalDataQuery } from 'generated/sdk';

export type GenericTemplateWithProposalData = Exclude<
  GetGenericTemplatesWithProposalDataQuery['genericTemplates'],
  null
>[number];
