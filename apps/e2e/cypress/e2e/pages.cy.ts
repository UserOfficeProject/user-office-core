import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Page tests', () => {
  let derivedUserOfficerRoleId: number;
  let derivedUserRoleId: number;
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();

    cy.createTag({ name: 'Tag', shortCode: 'tag' }).then((tagResult) => {
      cy.createRole({
        args: {
          title: 'Derived User Officer',
          shortCode: 'user_officer',
          description: '',
        },
      }).then((roleResult) => {
        derivedUserOfficerRoleId = roleResult.createRole.id;
        cy.updateRoleTags({
          roleId: roleResult.createRole.id,
          tagIds: tagResult.createTag.id,
        });
        cy.updateUserRoles({
          id: initialDBData.users.officer.id,
          roles: [initialDBData.roles.userOfficer, roleResult.createRole.id],
        });
      });
      cy.createRole({
        args: {
          title: 'Derived User',
          shortCode: 'user',
          description: '',
        },
      }).then((roleResult) => {
        derivedUserRoleId = roleResult.createRole.id;
        cy.updateRoleTags({
          roleId: roleResult.createRole.id,
          tagIds: tagResult.createTag.id,
        });
        cy.updateUserRoles({
          id: initialDBData.users.user1.id,
          roles: [initialDBData.roles.user, roleResult.createRole.id],
        });
      });
    });
  });

  const faqContents = faker.lorem.words(2);
  const faqContents2 = faker.lorem.words(2);

  it('Should be able update the default FAQ', () => {
    cy.login('officer', initialDBData.roles.userOfficer);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();

    cy.contains('Set user homepage');
    cy.contains('Help').click();

    cy.get('[data-cy="role-filter"]').contains('Default');
    cy.setTinyMceContent('HELPPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HELPPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
    );

    cy.reload();
    cy.contains('Proposals').click();
    cy.contains('FAQ').click();

    cy.get('[role="presentation"]').should('exist');

    cy.contains(faqContents);
    cy.contains('Close').click();
  });

  it('Derived User Officer should not be able update a default page', () => {
    cy.login('officer', derivedUserOfficerRoleId);

    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Default').should('not.exist');
  });

  it('Derived User Officer should be able update a derived role page with a shared tag', () => {
    //set default page notice
    cy.login('officer', initialDBData.roles.userOfficer);

    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Help').click();

    cy.get('[data-cy="role-filter"]').contains('Default');
    cy.setTinyMceContent('HELPPAGE', faqContents);

    cy.contains('Update').click();

    //set derived page notice
    cy.login('officer', derivedUserOfficerRoleId);

    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Help').click();

    cy.get('[data-cy="role-filter"]').contains('Derived User');

    cy.setTinyMceContent('HELPPAGE', faqContents2);

    cy.contains('Update').click();

    //log in as another user with the same tag
    //you should see the derived page notice
    cy.login('user1', derivedUserRoleId);
    cy.contains('Proposals').click();
    cy.contains('FAQ').click();

    cy.get('[role="presentation"]').should('exist');

    cy.contains(faqContents2);
    cy.contains(faqContents).should('not.exist');
    cy.contains('Close').click();
  });
});
