import { container } from 'tsyringe';

import { constructExperimentSafetyStatusChangeEvent } from './utils';
import { Tokens } from '../../../config/Tokens';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { ExperimentSafety } from '../../../models/Experiment';
import { ConnectionHasStatusAction } from '../../../models/StatusAction';
import { RabbitMQActionConfig } from '../../../resolvers/types/StatusActionConfig';

export const rabbitMQActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  experimentSafeties: ExperimentSafety[]
) => {
  const postToMessageQueue = await container.resolve<
    Promise<(event: ApplicationEvent) => Promise<void>>
  >(Tokens.PostToMessageQueue);

  const loggingHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.LoggingHandler);

  const config = statusAction.config as RabbitMQActionConfig;
  if (!config.exchanges?.length) {
    return;
  }

  const messageDescription =
    'Experiment event successfully sent to the message broker';

  return await Promise.all(
    config.exchanges.map(async (exchange) => {
      for (const experimentSafety of experimentSafeties) {
        const evt = constructExperimentSafetyStatusChangeEvent(
          experimentSafety,
          null,
          messageDescription,
          exchange
        );
        postToMessageQueue(evt);
        loggingHandler(evt);
      }
    })
  );
};
