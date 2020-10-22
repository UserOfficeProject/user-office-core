import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createMessageBrokerHandler from './messageBroker';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers({
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDataSource,
  proposalSettingsDataSource,
}: {
  userDataSource: UserDataSource;
  eventLogsDataSource: EventLogsDataSource;
  reviewDataSource: ReviewDataSource;
  instrumentDataSource: InstrumentDataSource;
  proposalSettingsDataSource: ProposalSettingsDataSource;
}) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(eventLogsDataSource),
    createMessageBrokerHandler({
      instrumentDataSource,
      reviewDataSource,
    }),
    createProposalWorkflowHandler(proposalSettingsDataSource),
  ];
}
