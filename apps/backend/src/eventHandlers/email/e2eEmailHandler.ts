import { eliEmailHandler } from './eliEmailHandler';
import { essEmailHandler } from './essEmailHandler';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';

export async function e2eEmailHandler(event: ApplicationEvent) {
  switch (event.type) {
    case Event.PROPOSAL_CO_PROPOSERS_ADDED: {
      return eliEmailHandler(event);
    }
    default: {
      return essEmailHandler(event);
    }
  }
}
