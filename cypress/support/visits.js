import faker from 'faker';

const defineExperimentTeam = ({ proposalTitle, users, teamLead }) => {
  cy.contains(/Upcoming experiments/i).should('exist');

  cy.contains(proposalTitle)
    .parent()
    .find('[title="Define who is coming"]')
    .click();
  cy.get('[data-cy=add-participant-button]').click();
  for (let user of users) {
    cy.contains(user).parent().find('[type=checkbox]').click();
  }
  cy.get('[data-cy=assign-selected-users]').click();
  cy.get('[data-cy=team-lead-user-dropdown]').click();
  cy.get('[role="listbox"]').contains(teamLead).click();
  cy.get('[data-cy=create-visit-button]').click();
};

Cypress.Commands.add('defineExperimentTeam', defineExperimentTeam);
