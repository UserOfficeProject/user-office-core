import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Page tests', () => {
  let derivedUserOfficerRoleId: number;
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
          roles: [roleResult.createRole.id],
        });
      });
    });
  });

  const faqContents = faker.lorem.words(2);

  it('Should be able update FAQ', () => {
    cy.login('officer');
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();

    cy.contains('Set user homepage');
    cy.contains('Help').click();

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

  it('Base User Officer should be able update a default page', () => {
    cy.login('officer');
    cy.visit('/');
    cy.contains('Configuration Settings').click();
    cy.contains('Pages').click();
    cy.contains('Set user homepage');

    cy.get('[data-cy="role-filter"]').click();
    cy.get('[role="listbox"]').contains('Default').click();

    cy.setTinyMceContent('HOMEPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
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

    cy.get('[data-cy="role-filter"]').contains('Derived User Officer');

    cy.setTinyMceContent('HOMEPAGE', faqContents);

    cy.contains('Update').click();

    cy.notification({ text: 'Updated Page', variant: 'success' });

    cy.getTinyMceContent('HOMEPAGE').then((content) =>
      expect(content).to.have.string(faqContents)
    );
  });
});
