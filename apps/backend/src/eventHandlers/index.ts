import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';
import createCustomHandler from './customHandler';
import createExperimentSafetyWorkflowHandler from './experimentSafetyWorkflow';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers() {
  const emailHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.EmailEventHandler);

  const loggingHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.LoggingHandler);

  const postToQueueHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.PostToMessageQueue);

  return [
    emailHandler,
    loggingHandler,
    postToQueueHandler,
    createProposalWorkflowHandler(),
    createExperimentSafetyWorkflowHandler(),
    createCustomHandler(),
  ];
}
