import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { EmailReadyType } from '../../workflowEntities/proposal/utils';
import { EmailTemplateId } from '../emailTemplateId';

export const decorateDLSProposalEmailActionSubstitutionData = async (
  emailTemplateName: string,
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> => {
  if (emailTemplateName !== EmailTemplateId.ACCEPTED_PROPOSAL) {
    return {};
  }

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const proposalContexts = await Promise.all(
    recipientWithData.proposals.map(async (proposal) => ({
      proposal,
      call: await callDataSource.getCall(proposal.callId),
    }))
  );

  return { proposalContexts };
};
