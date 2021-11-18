import {
  AdministrationProposalMutation,
  AdministrationProposalMutationVariables,
  ChangeProposalsStatusMutation,
  ChangeProposalsStatusMutationVariables,
  CreateEsiMutation,
  CreateEsiMutationVariables,
  CreateProposalMutation,
  CreateProposalMutationVariables,
  SubmitProposalMutation,
  SubmitProposalMutationVariables,
  UpdateEsiMutation,
  UpdateEsiMutationVariables,
  UpdateProposalMutation,
  UpdateProposalMutationVariables,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createProposal = (
  createProposalInput: CreateProposalMutationVariables
): Cypress.Chainable<CreateProposalMutation> => {
  const api = getE2EApi();
  const request = api.createProposal(createProposalInput);
  // const title = proposalTitle || faker.random.words(3);
  // const abstract = proposalAbstract || faker.random.words(8);

  // cy.contains('New Proposal').click();

  // if (call) {
  //   cy.get('body').click(0, 0); // fix for flaky test where item can't be clicked if tooltip is visible
  //   cy.get('[data-cy=call-list]').contains(call).click();
  // }

  // cy.get('[data-cy=title] input').type(title).should('have.value', title);

  // cy.get('[data-cy=abstract] textarea')
  //   .first()
  //   .type(abstract)
  //   .should('have.value', abstract);

  // if (proposer) {
  //   cy.get('[data-cy=edit-proposer-button]').click();
  //   cy.get('[role="presentation"]').as('modal');

  //   cy.get('@modal')
  //     .contains(proposer)
  //     .parent()
  //     .find("[title='Select user']")
  //     .click();
  // }

  // cy.contains('Save and continue').click();

  // cy.finishedLoading();

  // cy.notification({ variant: 'success', text: 'Saved' });
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
  // cy.contains(proposalTitle).parent().find('[title="View proposal"]').click();
  // cy.get('[role="dialog"]').contains('Admin').click();
  // cy.get('#finalStatus-input').click();
  // cy.get('[role="listbox"]').contains('Accepted').click();
  // cy.get('[data-cy="managementTimeAllocation"] input').type(
  //   timeToAllocate.toString()
  // );
  // cy.get('[data-cy="is-management-decision-submitted"]').click();
  // if (submitManagementDecision) {
  //   cy.get('[data-cy="save-admin-decision"]').click();
  // }
  // cy.closeModal();

  return cy.wrap(request);
};

const createEsi = (
  createEsiInput: CreateEsiMutationVariables
): Cypress.Chainable<CreateEsiMutation> => {
  const api = getE2EApi();
  const request = api.createEsi(createEsiInput);

  return cy.wrap(request);
};

const updateEsi = (
  updateEsiInput: UpdateEsiMutationVariables
): Cypress.Chainable<UpdateEsiMutation> => {
  const api = getE2EApi();
  const request = api.updateEsi(updateEsiInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createProposal', createProposal);
Cypress.Commands.add('updateProposal', updateProposal);
Cypress.Commands.add('submitProposal', submitProposal);
Cypress.Commands.add('changeProposalsStatus', changeProposalsStatus);
Cypress.Commands.add(
  'updateProposalManagementDecision',
  updateProposalManagementDecision
);

Cypress.Commands.add('createEsi', createEsi);
Cypress.Commands.add('updateEsi', updateEsi);
