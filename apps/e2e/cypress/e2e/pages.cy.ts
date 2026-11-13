import { faker } from '@faker-js/faker';
import { PageName } from '@user-office-software-libs/shared-types';

import initialDBData from '../support/initialDBData';

context('Page tests', () => {
  let derivedUserOfficerRoleId: number;
  const sharedFaqContents = faker.lorem.words(2);
  const uniqueFaqContents = faker.lorem.words(2);

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
      })
        .then((roleResult) => {
          derivedUserOfficerRoleId = roleResult.createRole.id;
          cy.updateRoleTags({
            roleId: roleResult.createRole.id,
            tagIds: tagResult.createTag.id,
          });
          cy.updateUserRoles({
            id: initialDBData.users.officer.id,
            roles: [initialDBData.roles.userOfficer, roleResult.createRole.id],
          });
        })
        .then(() => {
          cy.setPageContent({
            pageId: PageName.HOMEPAGE,
            text: sharedFaqContents,
            roleIds: [-1, derivedUserOfficerRoleId],
          });
          cy.setPageContent({
            pageId: PageName.HOMEPAGE,
            text: uniqueFaqContents,
            roleIds: [initialDBData.roles.userOfficer],
          });
        });
    });
  });

  const faqContents = faker.lorem.words(2);

  it('Text box should be empty and update button should be disabled when no roles are selected', () => {
    cy.login('officer', initialDBData.roles.userOfficer);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string('')
    );

    cy.contains('Update').should('be.disabled');
  });

  it('Base User Officer should be able update a default page', () => {
    cy.login('officer', initialDBData.roles.userOfficer);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Default').click();
    cy.get('body').type('{esc}');

    cy.setTinyMceContent('HOMEPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
    );
  });

  it('Content should be displayed if page notices have the same content', () => {
    cy.login('officer', initialDBData.roles.userOfficer);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Default').click();
    cy.get('[role="listbox"]').contains('Derived User Officer').click();
    cy.get('body').type('{esc}');

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string(sharedFaqContents)
    );
  });

  it('Content should not be displayed if page notices have different content', () => {
    cy.login('officer', initialDBData.roles.userOfficer);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Default').click();
    cy.get('[role="listbox"]').contains('User Officer').click();
    cy.get('body').type('{esc}');

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string('')
    );
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
    cy.login('officer', derivedUserOfficerRoleId);
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Derived User Officer').click();
    cy.get('body').type('{esc}');

    cy.setTinyMceContent('HOMEPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
    );
  });
});
