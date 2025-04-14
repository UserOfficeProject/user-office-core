import {
  SetCoProposerInvitesInput,
  SetCoProposerInvitesMutation,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const setCoProposerInvites = (
  setCoProposerInvitesInput: SetCoProposerInvitesInput
): Cypress.Chainable<SetCoProposerInvitesMutation> => {
  const api = getE2EApi();
  const request = api.setCoProposerInvites({
    input: setCoProposerInvitesInput,
  });

  return cy.wrap(request);
};

Cypress.Commands.add('setCoProposerInvites', setCoProposerInvites);
