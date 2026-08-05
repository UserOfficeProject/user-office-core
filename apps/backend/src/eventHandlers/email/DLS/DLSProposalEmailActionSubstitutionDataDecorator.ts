import { container } from 'tsyringe';

import { getBaseURL } from '../../../config/dls/configureDLSEnvironment';
import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { FapDataSource } from '../../../datasources/FapDataSource';
import { InstrumentDataSource } from '../../../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../../../datasources/ReviewDataSource';
import { TechnicalReviewStatus } from '../../../models/TechnicalReview';
import { stripHtml } from '../../../utils/stringStripHtml';
import { EmailReadyType } from '../../workflowEntities/proposal/utils';
import { EmailTemplateId } from '../emailTemplateId';

const allocationPeriodDateFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
});

const technicalReviewStatusLabels: Record<TechnicalReviewStatus, string> = {
  [TechnicalReviewStatus.FEASIBLE]: 'Feasible',
  [TechnicalReviewStatus.PARTIALLY_FEASIBLE]: 'Partially feasible',
  [TechnicalReviewStatus.UNFEASIBLE]: 'Not feasible',
};

export const decorateDLSProposalEmailActionSubstitutionData = async (
  emailTemplateName: string,
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> => {
  const handlers: Partial<
    Record<
      EmailTemplateId,
      (recipientWithData: EmailReadyType) => Promise<Record<string, unknown>>
    >
  > = {
    [EmailTemplateId.ACCEPTED_PROPOSAL]: proposalAcceptedHandler,
  };

  const handler = handlers[emailTemplateName as EmailTemplateId];

  return handler ? handler(recipientWithData) : {};
};

async function proposalAcceptedHandler(
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> {
  const proposal = recipientWithData.proposals[0];

  if (!proposal) {
    return {};
  }

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );
  const [
    call,
    proposalWorkflow,
    fapProposals,
    fapMeetingDecisions,
    technicalReviews,
  ] = await Promise.all([
    callDataSource.getCall(proposal.callId),
    callDataSource.getProposalWorkflowByCall(proposal.callId),
    fapDataSource.getFapsByProposalPks([proposal.primaryKey]),
    fapDataSource.getProposalsFapMeetingDecisions([proposal.primaryKey]),
    reviewDataSource.getTechnicalReviews(proposal.primaryKey),
  ]);

  if (!call) {
    return {};
  }

  const isRapidAccess =
    proposalWorkflow?.name.toLowerCase().includes('rapid') ?? false;
  const commentsToUser = stripHtml(
    fapMeetingDecisions.find(({ commentForUser }) => commentForUser)
      ?.commentForUser ?? ''
  );
  const instrumentIds = Array.from(
    new Set([
      ...fapProposals
        .map(({ instrumentId }) => instrumentId)
        .filter(
          (instrumentId): instrumentId is number => instrumentId !== null
        ),
      ...(technicalReviews ?? []).map(({ instrumentId }) => instrumentId),
    ])
  );
  const instruments = instrumentIds.length
    ? await instrumentDataSource.getInstrumentsByIds(instrumentIds)
    : [];

  // TODO: Decide whether to just use fap time allocation, or whether the fallback to technical review time allocation is necessary
  const awardedShifts = instrumentIds.flatMap((instrumentId) => {
    const numberOfShifts =
      fapProposals.find(
        (fapProposal) => fapProposal.instrumentId === instrumentId
      )?.fapTimeAllocation ??
      technicalReviews?.find(
        (technicalReview) => technicalReview.instrumentId === instrumentId
      )?.timeAllocation;
    const instrument = instruments.find(({ id }) => id === instrumentId);

    return typeof numberOfShifts === 'number' && instrument
      ? [{ numberOfShifts, facility: instrument.name }]
      : [];
  });
  const technicalAssessments = (technicalReviews ?? []).flatMap(
    (technicalReview) => {
      const instrument = instruments.find(
        ({ id }) => id === technicalReview.instrumentId
      );

      if (!instrument) {
        return [];
      }

      return [
        {
          facility: {
            name: instrument.name,
            description: instrument.description,
          },
          feasibility:
            technicalReview.status === null
              ? ''
              : technicalReviewStatusLabels[technicalReview.status] ?? '',
          assessorsComment: stripHtml(technicalReview.publicComment ?? ''),
        },
      ];
    }
  );

  return {
    uos_instance: getBaseURL(),
    proposal,
    isRapidAccess,
    badDatesUri: '<BAD_DATES_URI>',
    preferredDateDeadlineDate: 'xx/xx/xxxx',
    machineRequired: true,
    awardedShifts,
    commentsToUser,
    technicalAssessments,
    call: {
      referenceNumber: call.shortCode.replace(/^AP\s*/i, ''),
      startAt: allocationPeriodDateFormatter.format(call.startCycle),
      endAt: allocationPeriodDateFormatter.format(call.endCycle),
    },
  };
}
