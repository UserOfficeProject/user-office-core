import faker from 'faker';

import initialDBData from '../support/initialDBData';

context('Personal information tests', () => {
  beforeEach(() => {
    cy.resetDB();
  });

  const newFirstName = faker.name.firstName();
  const newMiddleName = faker.name.firstName();
  const newLastName = faker.name.lastName();
  const newDepartment = faker.commerce.department();
  const otherOrg = faker.commerce.department();
  const newPreferredName = faker.hacker.noun();
  const newPosition = faker.random.word().split(' ')[0];
  const newTelephone = faker.phone.phoneNumber('0##########');

  it('Should be able update personal information', () => {
    cy.login('user');
    cy.visit('/');

    cy.get('[data-cy="active-user-profile"]').click();

    cy.get("[name='firstname']").clear().type(newFirstName);

    cy.get("[name='middlename']").clear().type(newMiddleName);

    cy.get("[name='lastname']").clear().type(newLastName);

    cy.get("[name='preferredname']").clear().type(newPreferredName);

    cy.get("[name='position']").clear().type(newPosition);

    cy.get("[name='department']").clear().type(newDepartment);

    cy.get("[name='telephone']").clear().type(newTelephone);

    cy.get("[name='otherOrganisation']").clear().type(otherOrg);

    cy.get('[data-cy="organizationCountry"] input').click();
    cy.get('[data-cy="organizationCountry-options"]').first().click();

    cy.contains('Update Profile').click();

    cy.notification({ variant: 'success', text: 'Updated Information' });

    cy.reload();

    cy.get("[name='firstname']").invoke('val').should('eq', newFirstName);

    cy.get("[name='middlename']").invoke('val').should('eq', newMiddleName);

    cy.get("[name='lastname']").invoke('val').should('eq', newLastName);

    cy.get("[name='preferredname']")
      .invoke('val')
      .should('eq', newPreferredName);

    cy.get("[name='position']").invoke('val').should('eq', newPosition);

    cy.get("[name='department']").invoke('val').should('eq', newDepartment);

    cy.get("[name='telephone']").invoke('val').should('eq', newTelephone);
  });

  it('User Officer should be able to see all and change roles if there are multiple', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('People').click();

    cy.finishedLoading();

    cy.contains('Andersson')
      .parent()
      .find('button[aria-label="Edit user"]')
      .click();

    cy.get('main').as('mainContentElement');
    cy.get('@mainContentElement').contains('Settings').click();

    cy.finishedLoading();

    cy.get('[data-cy="add-role-button"]').click();

    cy.finishedLoading();

    cy.get('[data-cy="role-modal"]')
      .contains('SEP Chair')
      .parent()
      .find('input[type="checkbox"]')
      .click();

    cy.contains('Update').click();

    cy.notification({ variant: 'warning', text: 'successfully' });

    // wait before trying to get profile button otherwise page
    // might re-render and you could be trying to access element
    // that is not attached to the DOM
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.finishedLoading();

    cy.get("[data-cy='profile-page-btn']").click();

    cy.get('[role="menu"]').contains('Roles').click();

    cy.finishedLoading();

    cy.get('[data-cy="role-selection-table"]').contains('User roles');

    cy.get('[data-cy="role-selection-table"]')
      .contains('SEP Chair', { matchCase: false })
      .parent()
      .find('button')
      .click();

    cy.finishedLoading();

    cy.contains('Proposals to grade');

    cy.get('[data-cy="SEPRoles-menu-items"]')
      .find('.MuiListItem-root')
      .should('have.length', 2);
  });

  it('Should be able to see user officer role in use', () => {
    cy.updateUserRoles({
      id: initialDBData.users.userOfficer.id,
      roles: [initialDBData.roles.userOfficer, initialDBData.roles.sepChair],
    });
    cy.login('officer');
    cy.visit('/');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.contains('Roles').click();

    cy.finishedLoading();

    cy.contains('User roles');

    cy.get("[data-cy='role-selection-table'] table tbody tr")
      .first()
      .should((element) => {
        expect(element.text()).to.contain('User Officer');

        expect(element.text()).to.contain('In Use');
      });
  });

  it('Should be able to change role even in the view where next role is not allowed to be', () => {
    cy.updateUserRoles({
      id: initialDBData.users.userOfficer.id,
      roles: [initialDBData.roles.userOfficer, initialDBData.roles.sepChair],
    });
    const workflowName = faker.lorem.words(2);
    const workflowDescription = faker.lorem.words(5);
    cy.login('officer');
    cy.visit('/');

    cy.contains('Settings').click();
    cy.contains('Proposal workflows').click();

    cy.contains('Create').click();
    cy.get('#name').type(workflowName);
    cy.get('#description').type(workflowDescription);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'created successfully' });

    cy.get('[data-cy^="connection_DRAFT_1"]').should('contain.text', 'DRAFT');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.contains('Roles').click();

    cy.finishedLoading();

    cy.contains('User roles');

    cy.contains('SEP Chair', { matchCase: false })
      .parent()
      .find('button')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="SEPRoles-menu-items"]').should('exist');
  });
});
