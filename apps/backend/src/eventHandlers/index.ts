import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';
import createCustomHandler from './customHandler';
import createLoggingHandler from './logging';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers() {
  const emailHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.EmailEventHandler);

  const postToQueueHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.PostToMessageQueue);

  return [
    emailHandler,
    createLoggingHandler(),
    postToQueueHandler,
    createProposalWorkflowHandler(),
    createCustomHandler(),
  ];
}
