import {
  AdministrationProposalMutation,
  AdministrationProposalMutationVariables,
  ChangeProposalsStatusMutation,
  ChangeProposalsStatusMutationVariables,
  CloneProposalsMutation,
  CloneProposalsMutationVariables,
  CreateOrGetExperimentSafetyMutation,
  CreateOrGetExperimentSafetyMutationVariables,
  CreateProposalMutation,
  CreateProposalMutationVariables,
  SubmitExperimentSafetyMutation,
  SubmitExperimentSafetyMutationVariables,
  SubmitProposalMutation,
  SubmitProposalMutationVariables,
  UpdateProposalMutation,
  UpdateProposalMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createProposal = (
  createProposalInput: CreateProposalMutationVariables
): Cypress.Chainable<CreateProposalMutation> => {
  const api = getE2EApi();
  const request = api.createProposal(createProposalInput);

  return cy.wrap(request);
};

const updateProposal = (
  updateProposalInput: UpdateProposalMutationVariables
): Cypress.Chainable<UpdateProposalMutation> => {
  const api = getE2EApi();
  const request = api.updateProposal(updateProposalInput);

  return cy.wrap(request);
};

const submitProposal = (
  submitProposalInput: SubmitProposalMutationVariables
): Cypress.Chainable<SubmitProposalMutation> => {
  const api = getE2EApi();
  const request = api.submitProposal(submitProposalInput);

  return cy.wrap(request);
};

const cloneProposals = (
  cloneProposalInput: CloneProposalsMutationVariables
): Cypress.Chainable<CloneProposalsMutation> => {
  const api = getE2EApi();
  const request = api.cloneProposals(cloneProposalInput);

  return cy.wrap(request);
};

const changeProposalsStatus = (
  changeProposalStatusInput: ChangeProposalsStatusMutationVariables
): Cypress.Chainable<ChangeProposalsStatusMutation> => {
  const api = getE2EApi();
  const request = api.changeProposalsStatus(changeProposalStatusInput);

  return cy.wrap(request);
};

const updateProposalManagementDecision = (
  administrationProposalInput: AdministrationProposalMutationVariables
): Cypress.Chainable<AdministrationProposalMutation> => {
  const api = getE2EApi();
  const request = api.administrationProposal(administrationProposalInput);

  return cy.wrap(request);
};

const createEsi = (
  createEsiInput: CreateOrGetExperimentSafetyMutationVariables
): Cypress.Chainable<CreateOrGetExperimentSafetyMutation> => {
  const api = getE2EApi();
  const request = api.createOrGetExperimentSafety(createEsiInput);

  return cy.wrap(request);
};

const updateEsi = (
  updateEsiInput: SubmitExperimentSafetyMutationVariables
): Cypress.Chainable<SubmitExperimentSafetyMutation> => {
  const api = getE2EApi();
  const request = api.submitExperimentSafety(updateEsiInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createProposal', createProposal);
Cypress.Commands.add('updateProposal', updateProposal);
Cypress.Commands.add('submitProposal', submitProposal);
Cypress.Commands.add('cloneProposals', cloneProposals);
Cypress.Commands.add('changeProposalsStatus', changeProposalsStatus);
Cypress.Commands.add(
  'updateProposalManagementDecision',
  updateProposalManagementDecision
);

Cypress.Commands.add('createEsi', createEsi);
Cypress.Commands.add('updateEsi', updateEsi);
