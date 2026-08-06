import { logger } from '@user-office-software/duo-logger/lib/logger';
import { container } from 'tsyringe';

import { getBaseURL } from '../../../config/dls/configureDLSEnvironment';
import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { FapDataSource } from '../../../datasources/FapDataSource';
import { InstrumentDataSource } from '../../../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../../../datasources/ReviewDataSource';
import { Call } from '../../../models/Call';
import { FapMeetingDecision } from '../../../models/FapMeetingDecision';
import { Instrument } from '../../../models/Instrument';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../../../models/TechnicalReview';
import { stripHtml } from '../../../utils/stringStripHtml';
import { EmailReadyType } from '../../workflowEntities/proposal/utils';
import { EmailTemplateId } from '../emailTemplateId';

const allocationPeriodDateFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
});

const deadlineDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const technicalReviewStatusLabels: Record<TechnicalReviewStatus, string> = {
  [TechnicalReviewStatus.FEASIBLE]: 'Feasible',
  [TechnicalReviewStatus.PARTIALLY_FEASIBLE]: 'Partially feasible',
  [TechnicalReviewStatus.UNFEASIBLE]: 'Not feasible',
};

function resolveProposalEmailDataSources() {
  return {
    callDataSource: container.resolve<CallDataSource>(Tokens.CallDataSource),
    fapDataSource: container.resolve<FapDataSource>(Tokens.FapDataSource),
    instrumentDataSource: container.resolve<InstrumentDataSource>(
      Tokens.InstrumentDataSource
    ),
    reviewDataSource: container.resolve<ReviewDataSource>(
      Tokens.ReviewDataSource
    ),
  };
}

function isRapidAccessWorkflow(workflow: { name: string } | null): boolean {
  return workflow?.name.toLowerCase().includes('rapid') ?? false;
}

function getCommentsToUser(fapMeetingDecisions: FapMeetingDecision[]): string {
  return stripHtml(
    fapMeetingDecisions.find(({ commentForUser }) => commentForUser)
      ?.commentForUser ?? ''
  );
}

function getRequestedFacilities(instruments: Instrument[]) {
  return instruments.map(({ name, description }) => ({ name, description }));
}

function getTechnicalAssessments(
  technicalReviews: TechnicalReview[] | null,
  instruments: Instrument[]
) {
  return (technicalReviews ?? []).flatMap((technicalReview) => {
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
  });
}

function getFormattedAllocationPeriod(call: Call) {
  return {
    startAt: allocationPeriodDateFormatter.format(call.startCycle),
    endAt: allocationPeriodDateFormatter.format(call.endCycle),
  };
}

function getNextCallDeadline(call: Call, calls: Call[]): string | null {
  // TODO: Confirm whether this is the best way to identify the next call
  const now = Date.now();
  const nextCall = calls
    .filter(
      (candidateCall) =>
        candidateCall.id !== call.id &&
        candidateCall.proposalWorkflowId === call.proposalWorkflowId &&
        candidateCall.endCall.getTime() > now
    )
    .sort((firstCall, secondCall) => {
      return firstCall.endCall.getTime() - secondCall.endCall.getTime();
    })[0];

  return nextCall ? deadlineDateFormatter.format(nextCall.endCall) : null;
}

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
    [EmailTemplateId.REJECTED_PROPOSAL]: proposalRejectedHandler,
    [EmailTemplateId.RESERVED_PROPOSAL]: proposalReservedHandler,
  };

  const handler = handlers[emailTemplateName as EmailTemplateId];

  return handler ? handler(recipientWithData) : {};
};

async function proposalAcceptedHandler(
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> {
  const proposal = recipientWithData.proposals[0];

  if (!proposal) {
    logger.logInfo(
      'DLS Substitution data decorator: No proposal found for recipientWithData',
      {}
    );

    return {};
  }

  const {
    callDataSource,
    fapDataSource,
    instrumentDataSource,
    reviewDataSource,
  } = resolveProposalEmailDataSources();
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
    logger.logInfo('DLS Substitution data decorator: No call found', {});

    return {};
  }

  const isRapidAccess = isRapidAccessWorkflow(proposalWorkflow);
  const commentsToUser = getCommentsToUser(fapMeetingDecisions);
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
  const technicalAssessments = getTechnicalAssessments(
    technicalReviews,
    instruments
  );

  return {
    uos_instance: getBaseURL(),
    proposal,
    isRapidAccess,
    machineRequired: true,
    awardedShifts,
    commentsToUser,
    technicalAssessments,
    call: {
      ...getFormattedAllocationPeriod(call),
      referenceNumber: call.shortCode.replace(/^AP\s*/i, ''),
    },
  };
}

async function proposalRejectedHandler(
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> {
  const proposal = recipientWithData.proposals[0];

  if (!proposal) {
    logger.logInfo('DLS Substitution data decorator: No proposal found', {});

    return {};
  }

  const {
    callDataSource,
    fapDataSource,
    instrumentDataSource,
    reviewDataSource,
  } = resolveProposalEmailDataSources();
  const [
    call,
    proposalWorkflow,
    requestedInstruments,
    fapMeetingDecisions,
    technicalReviews,
    calls,
  ] = await Promise.all([
    callDataSource.getCall(proposal.callId),
    callDataSource.getProposalWorkflowByCall(proposal.callId),
    instrumentDataSource.getInstrumentsByProposalPk(proposal.primaryKey),
    fapDataSource.getProposalsFapMeetingDecisions([proposal.primaryKey]),
    reviewDataSource.getTechnicalReviews(proposal.primaryKey),
    callDataSource.getCalls({ isActive: true }),
  ]);

  if (!call) {
    logger.logInfo('DLS Substitution data decorator: No call found', {});

    return {};
  }

  const isRapidAccess = isRapidAccessWorkflow(proposalWorkflow);
  const commentsToUser = getCommentsToUser(fapMeetingDecisions);
  const requestedFacilities = getRequestedFacilities(requestedInstruments);
  const technicalAssessments = getTechnicalAssessments(
    technicalReviews,
    requestedInstruments
  );

  return {
    proposal,
    isRapidAccess,
    requestedFacilities,
    commentsToUser,
    technicalAssessments,
    nextCallDeadline: getNextCallDeadline(call, calls),
    call: {
      ...getFormattedAllocationPeriod(call),
      referenceNumber: call.shortCode.replace(/^AP\s*/i, ''),
    },
  };
}

async function proposalReservedHandler(
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> {
  const proposal = recipientWithData.proposals[0];

  if (!proposal) {
    logger.logInfo('DLS Substitution data decorator: No proposal found', {});

    return {};
  }

  const {
    callDataSource,
    fapDataSource,
    instrumentDataSource,
    reviewDataSource,
  } = resolveProposalEmailDataSources();
  const [
    call,
    requestedInstruments,
    fapMeetingDecisions,
    technicalReviews,
    calls,
  ] = await Promise.all([
    callDataSource.getCall(proposal.callId),
    instrumentDataSource.getInstrumentsByProposalPk(proposal.primaryKey),
    fapDataSource.getProposalsFapMeetingDecisions([proposal.primaryKey]),
    reviewDataSource.getTechnicalReviews(proposal.primaryKey),
    callDataSource.getCalls({ isActive: true }),
  ]);

  if (!call) {
    logger.logInfo('DLS Substitution data decorator: No call found', {});

    return {};
  }

  const requestedFacilities = getRequestedFacilities(requestedInstruments);
  const commentsToUser = getCommentsToUser(fapMeetingDecisions);
  const technicalAssessments = getTechnicalAssessments(
    technicalReviews,
    requestedInstruments
  );

  return {
    proposal,
    requestedFacilities,
    commentsToUser,
    technicalAssessments,
    nextCallDeadline: getNextCallDeadline(call, calls),
    call: {
      ...getFormattedAllocationPeriod(call),
      referenceNumber: call.shortCode.replace(/^AP\s*/i, ''),
    },
  };
}
