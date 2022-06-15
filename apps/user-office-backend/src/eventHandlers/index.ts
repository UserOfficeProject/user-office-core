import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventHandler } from '../events/eventBus';
import createLoggingHandler from './logging';
import { createPostToQueueHandler } from './messageBroker';
import createProposalWorkflowHandler from './proposalWorkflow';

export default function createEventHandlers(): EventHandler<ApplicationEvent>[] {
  const emailHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.EmailEventHandler);

  return [
    emailHandler,
    createLoggingHandler(),
    createPostToQueueHandler(),
    createProposalWorkflowHandler(),
  ];
}
