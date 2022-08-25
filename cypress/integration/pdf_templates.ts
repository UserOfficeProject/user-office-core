import { faker } from '@faker-js/faker';

import { TemplateGroupId } from '../../src/generated/sdk';

context('PDF template tests', () => {
  const templateName = faker.lorem.words(3);
  const templateDesc = faker.lorem.words(3);
  const pdfTemplateData = faker.lorem.paragraphs(10);

  let createdTemplateName: string;

  beforeEach(() => {
    cy.resetDB();
    cy.viewport(1920, 1080);
    cy.getAndStoreFeaturesEnabled();
  });

  describe('PDF template basic tests', () => {
    it('User officer can create a PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF');

      cy.get('[data-cy=create-new-button]').click();

      cy.get('[data-cy="name"] input')
        .first()
        .type(templateName)
        .should('have.value', templateName);

      cy.get('[data-cy="description"] textarea')
        .first()
        .type(templateDesc)
        .should('have.value', templateDesc);

      cy.get('[data-cy=submit]').click();

      cy.contains(templateName);

      cy.get('[data-cy="template-data"] textarea')
        .first()
        .type(pdfTemplateData)
        .should('have.value', pdfTemplateData);

      cy.get('[data-cy=submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(templateName);
    });
  });

  describe('PDF template advanced tests', () => {
    beforeEach(() => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PDF_TEMPLATE,
      }).then((result) => {
        if (result.createTemplate.template) {
          createdTemplateName = result.createTemplate.template.name;
        }
      });
    });

    it('User officer can modify PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy="template-data"] textarea')
        .first()
        .type(pdfTemplateData)
        .should('have.value', pdfTemplateData);

      cy.get('[data-cy=submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName);

      cy.contains(pdfTemplateData.replace(/\n|\r/g, ' ')).should('exist');
    });

    it('User officer can clone PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy="template-data"] textarea')
        .first()
        .type(pdfTemplateData)
        .should('have.value', pdfTemplateData);

      cy.get('[data-cy=submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Clone']")
        .click();

      cy.contains('Yes').click();

      cy.contains(`Copy of ${createdTemplateName}`)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(`Copy of ${createdTemplateName}`).should('exist');

      cy.contains(pdfTemplateData.replace(/\n|\r/g, ' ')).should('exist');
    });
  });
});
