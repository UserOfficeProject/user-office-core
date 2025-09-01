import {
  AdministrationProposalMutation,
  AdministrationProposalMutationVariables,
  ChangeProposalsStatusMutation,
  ChangeProposalsStatusMutationVariables,
  CloneProposalsMutation,
  CloneProposalsMutationVariables,
  CreateExperimentSafetyMutationVariables,
  CreateExperimentSafetyMutation,
  CreateProposalMutation,
  CreateProposalMutationVariables,
  GetProposalsQuery,
  GetProposalsQueryVariables,
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

const getProposals = (
  getProposalsInput: GetProposalsQueryVariables
): Cypress.Chainable<GetProposalsQuery> => {
  const api = getE2EApi();
  const request = api.getProposals(getProposalsInput);

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

const createExperimentSafety = (
  createExperimentSafetyInput: CreateExperimentSafetyMutationVariables
): Cypress.Chainable<CreateExperimentSafetyMutation> => {
  const api = getE2EApi();
  const request = api.createExperimentSafety(createExperimentSafetyInput);

  return cy.wrap(request);
};

const submitExperimentSafety = (
  submitExperimentSafetyInput: SubmitExperimentSafetyMutationVariables
): Cypress.Chainable<SubmitExperimentSafetyMutation> => {
  const api = getE2EApi();
  const request = api.submitExperimentSafety(submitExperimentSafetyInput);

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

Cypress.Commands.add('createExperimentSafety', createExperimentSafety);
Cypress.Commands.add('submitExperimentSafety', submitExperimentSafety);
Cypress.Commands.add('getProposals', getProposals);
