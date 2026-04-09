import { container } from 'tsyringe';

import createCustomHandler from './customHandler';
import createExperimentSafetyWorkflowHandler from './experimentSafetyWorkflow';
import createProposalWorkflowHandler from './proposalWorkflow';
import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';

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
