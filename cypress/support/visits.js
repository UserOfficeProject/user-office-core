import faker from 'faker';

const defineExperimentTeam = ({ proposalTitle, usersEmails, teamLead }) => {
  cy.contains(/Upcoming experiments/i).should('exist');

  cy.contains(proposalTitle)
    .parent()
    .find('[title="Define who is coming"]')
    .click();
  cy.get('[data-cy=add-participant-button]').click();
  for (let userEmail of usersEmails) {
    cy.get('[name=email]').type(`${userEmail}{enter}`);
  }
  cy.get('[data-cy=assign-selected-users]').click();
  cy.get('[data-cy=team-lead-user-dropdown]').click();
  cy.get('[role="listbox"]').contains(teamLead).click();
  cy.get('[data-cy=create-visit-button]').click();
};

Cypress.Commands.add('defineExperimentTeam', defineExperimentTeam);
