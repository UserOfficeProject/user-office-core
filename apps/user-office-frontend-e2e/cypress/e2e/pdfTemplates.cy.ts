import { faker } from '@faker-js/faker';
import { TemplateGroupId } from '@user-office-software-libs/shared-types';

context('PDF template tests', () => {
  const templateName = faker.lorem.words(3);
  const templateDesc = faker.lorem.words(3);
  const pdfTemplateData = faker.lorem.paragraphs(1);
  let createdTemplateName: string;

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1080);
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

      cy.get('[data-cy="templateData"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateHeader-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateFooter-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateSampleDeclaration-submit]').click();

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
        if (result.createTemplate) {
          createdTemplateName = result.createTemplate.name;
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

      cy.get('[data-cy="templateData"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateHeader-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateFooter-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateSampleDeclaration-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName);

      cy.contains(pdfTemplateData.replace(/\n|\r/g, ' ')).should('exist');
    });

    it('User officer can change the name and description of the PDF template', () => {
      const newName = faker.lorem.words(3);
      const newDescription = faker.lorem.words(5);

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy=edit-metadata]').click();
      cy.get('[data-cy=template-name] input').clear().type(newName);
      cy.get('[data-cy=template-description] input')
        .clear()
        .type(newDescription);

      cy.get('[data-cy="save-metadata-btn"]').click();

      cy.finishedLoading();

      cy.contains(newName).should('exist');
      cy.contains(newDescription).should('exist');
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

      cy.get('[data-cy="templateData"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateHeader-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateFooter-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content')
        .first()
        .type(pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateSampleDeclaration-submit]').click();

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
