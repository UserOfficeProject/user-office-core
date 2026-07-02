import { faker } from '@faker-js/faker';
import { TemplateGroupId } from '@user-office-software-libs/shared-types';

context('Proposal PDF template tests', () => {
  const templateName = faker.lorem.words(3);
  const templateDesc = faker.lorem.words(3);
  const pdfTemplateData = faker.lorem.paragraphs(1);
  let createdTemplateName: string;

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1080);
  });

  describe('Proposal PDF template basic tests', () => {
    it('User officer can create a Proposal PDF template. The template comes with default values - Body, header, Footer, Sample Declaration and Dummy Data', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

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

      cy.get('[data-cy="templateData"] .cm-content').should(($element) => {
        expect($element.children()).to.have.length.greaterThan(1);

        expect(
          $element.children().first().text().trim()
        ).to.have.length.greaterThan(0);
      });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content').should(($element) => {
        expect($element.children()).to.have.length.greaterThan(1);

        expect(
          $element.children().first().text().trim()
        ).to.have.length.greaterThan(0);
      });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content').should(($element) => {
        expect($element.children()).to.have.length.greaterThan(1);

        expect(
          $element.children().first().text().trim()
        ).to.have.length.greaterThan(0);
      });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content').should(
        ($element) => {
          expect($element.children()).to.have.length.greaterThan(1);

          expect(
            $element.children().first().text().trim()
          ).to.have.length.greaterThan(1);
        }
      );

      cy.contains('Dummy Data').click();

      cy.get('[data-cy="dummyData"] .cm-content').should(($element) => {
        expect($element.children()).to.have.length.greaterThan(1);

        expect(
          $element.children().first().text().trim()
        ).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Proposal PDF template advanced tests', () => {
    beforeEach(() => {
      cy.createTemplate({
        name: templateName,
        groupId: TemplateGroupId.PROPOSAL_PDF,
      }).then((result) => {
        if (result.createTemplate) {
          createdTemplateName = result.createTemplate.name;
        }
      });

      cy.updateProposalPdfTemplate({
        proposalPdfTemplateId: 1,
        dummyData: `{
  "data": {
    "proposal": {
      "primaryKey": 4,
      "title": "New Proposal",
      "abstract": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
      "proposerId": 1,
      "statusId": 1,
      "created": "2023-10-18T11:38:15.429Z",
      "updated": "2023-10-18T11:39:02.691Z",
      "proposalId": "268490",
      "callId": 1,
      "questionaryId": 4,
      "notified": false,
      "submitted": true,
      "referenceNumberSequence": 3,
      "managementTimeAllocation": null,
      "managementDecisionSubmitted": false
    },
    "principalInvestigator": {
      "id": 1,
      "firstname": "Carl",
      "lastname": "Carlsson",
      "preferredname": "Carl",
      "institution": "Other",
      "institutionId": 1,
      "position": "Strategist",
      "created": "2023-10-10T13:32:18.172Z",
      "placeholder": false,
      "email": "Javon4@hotmail.com"
    },
    "coProposers": [
      {
        "id": 4,
        "firstname": "Benjamin",
        "lastname": "Beckley",
        "preferredname": "Benjamin",
        "institution": "Other",
        "institutionId": 1,
        "position": "Management",
        "created": "2023-10-18T11:38:15.429Z",
        "placeholder": false,
        "email": "ben@inbox.com"
      }
    ],
    "questionarySteps": [
      {
        "questionaryId": 4,
        "topic": {
          "id": 41,
          "title": "Samples & Info",
          "templateId": 39,
          "sortOrder": 1,
          "isEnabled": true
        },
        "isCompleted": true,
        "fields": [
          {
            "question": {
              "categoryId": 1,
              "id": "date_1661426719613",
              "naturalKey": "date_1661426719613",
              "dataType": "DATE",
              "question": "When do you want to come?",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "includeTime": false,
                "maxDate": null,
                "minDate": null,
                "defaultDate": null
              }
            },
            "topicId": 41,
            "sortOrder": 0,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "includeTime": false,
              "maxDate": null,
              "minDate": null,
              "defaultDate": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 4,
            "value": null
          },
          {
            "question": {
              "categoryId": 1,
              "id": "sample_declaration_1666269436134",
              "naturalKey": "sample_declaration_1666269436134",
              "dataType": "SAMPLE_DECLARATION",
              "question": "Samples",
              "config": {
                "addEntryButtonLabel": "Add",
                "templateCategory": "SAMPLE_DECLARATION",
                "templateId": 36,
                "esiTemplateId": null,
                "small_label": "",
                "required": false,
                "maxEntries": null,
                "minEntries": null
              }
            },
            "topicId": 41,
            "sortOrder": 1,
            "config": {
              "addEntryButtonLabel": "Add",
              "templateCategory": "SAMPLE_DECLARATION",
              "templateId": 36,
              "esiTemplateId": null,
              "small_label": "",
              "required": false,
              "maxEntries": null,
              "minEntries": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": []
          },
          {
            "question": {
              "categoryId": 1,
              "id": "selection_from_options_1605784613207",
              "naturalKey": "selection_from_options_instrument",
              "dataType": "SELECTION_FROM_OPTIONS",
              "question": "Select an instrument",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "variant": "dropdown",
                "options": ["LoKi", "MX"],
                "isMultipleSelect": false
              }
            },
            "topicId": 41,
            "sortOrder": 2,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "variant": "dropdown",
              "options": ["LoKi", "MX", "CRYO-EM"],
              "isMultipleSelect": true
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 5,
            "value": ["MX"]
          },
          {
            "question": {
              "categoryId": 1,
              "id": "generic_template_1674814357714",
              "naturalKey": "generic_template_1674814357714",
              "dataType": "GENERIC_TEMPLATE",
              "question": "MX",
              "config": {
                "addEntryButtonLabel": "Add",
                "copyButtonLabel": "",
                "canCopy": false,
                "isMultipleCopySelect": false,
                "isCompleteOnCopy": false,
                "templateCategory": "GENERIC_TEMPLATE",
                "templateId": 38,
                "small_label": "",
                "required": false,
                "maxEntries": "1",
                "minEntries": "1"
              }
            },
            "topicId": 41,
            "sortOrder": 5,
            "config": {
              "addEntryButtonLabel": "Add",
              "copyButtonLabel": "",
              "canCopy": false,
              "isMultipleCopySelect": false,
              "isCompleteOnCopy": false,
              "templateCategory": "GENERIC_TEMPLATE",
              "templateId": 38,
              "small_label": "",
              "required": false,
              "maxEntries": 1,
              "minEntries": 1
            },
            "dependencies": [
              {
                "questionId": "generic_template_1674814357714",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": [
              {
                "id": 1,
                "title": "template 1",
                "creatorId": 1,
                "proposalPk": 4,
                "questionaryId": 5,
                "questionId": "generic_template_1674814357714",
                "created": "2023-10-18T11:38:39.861Z"
              }
            ]
          },
          {
            "question": {
              "categoryId": 1,
              "id": "boolean_1674812264143",
              "naturalKey": "boolean_1674812264143",
              "dataType": "BOOLEAN",
              "question": "Do you want sample environment for MX",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 41,
            "sortOrder": 6,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [
              {
                "questionId": "boolean_1674812264143",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": 6,
            "value": true
          },
          {
            "question": {
              "categoryId": 1,
              "id": "embellishment_1636710963252",
              "naturalKey": "embellishment_1636710963252",
              "dataType": "EMBELLISHMENT",
              "question": "New question",
              "config": {
                "html": "<p>Users can also submit Expression of Interest in the following&nbsp;<strong>Crystallisation </strong>services:</p>\\n<ul>\\n<li>Support for large protein crystal growth of either protiated or deuterated proteins (incl. sitting drop vapour diffusion, dialysis, batch, optimization, targeted screening, testing with X-rays)</li>\\n</ul>",
                "plain": "Crystallisation text",
                "omitFromPdf": true
              }
            },
            "topicId": 41,
            "sortOrder": 7,
            "config": {
              "html": "<p>Users can also submit Expression of Interest in the following&nbsp;<strong>Crystallisation </strong>services:</p>\\n<ul>\\n<li>Support for large protein crystal growth of either protiated or deuterated proteins (incl. sitting drop vapour diffusion, dialysis, batch, optimization, targeted screening, testing with X-rays)</li>\\n</ul>",
              "plain": "Crystallisation text",
              "omitFromPdf": true
            },
            "dependencies": [
              {
                "questionId": "embellishment_1636710963252",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": null
          }
        ]
      },
      {
        "questionaryId": 4,
        "topic": {
          "id": 42,
          "title": "Sample environment",
          "templateId": 39,
          "sortOrder": 2,
          "isEnabled": true
        },
        "isCompleted": true,
        "fields": [
          {
            "question": {
              "categoryId": 1,
              "id": "boolean_1674821942563",
              "naturalKey": "boolean_1674821942563",
              "dataType": "BOOLEAN",
              "question": "Do you need lab-support?",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 42,
            "sortOrder": 0,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 7,
            "value": true
          },
          {
            "question": {
              "categoryId": 1,
              "id": "final_delivery_date_motivation",
              "naturalKey": "final_delivery_date_motivation",
              "dataType": "TEXT_INPUT",
              "question": "Please give a brief explanation for the chosen date",
              "config": {
                "required": true,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": "1",
                "max": 500,
                "multiline": true,
                "placeholder": "(maximum 500 characters)",
                "isCounterHidden": false
              }
            },
            "topicId": 42,
            "sortOrder": 1,
            "config": {
              "required": true,
              "small_label": "",
              "tooltip": "",
              "htmlQuestion": "",
              "isHtmlQuestion": false,
              "min": 1,
              "max": 500,
              "multiline": true,
              "placeholder": "(maximum 500 characters)",
              "isCounterHidden": false
            },
            "dependencies": [
              {
                "questionId": "final_delivery_date_motivation",
                "dependencyId": "boolean_1674821942563",
                "dependencyNaturalKey": "boolean_1674821942563",
                "condition": {
                  "params": true,
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": 8,
            "value": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, an"
          }
        ]
      }
    ],
    "attachments": [],
    "samples": [],
    "genericTemplates": [
      {
        "genericTemplate": {
          "id": 1,
          "title": "template 1",
          "creatorId": 1,
          "proposalPk": 4,
          "questionaryId": 5,
          "questionId": "generic_template_1674814357714",
          "created": "2023-10-18T11:38:39.861Z"
        },
        "genericTemplateQuestionaryFields": [
          {
            "question": {
              "categoryId": 7,
              "id": "generic_template_basis",
              "naturalKey": "generic_template_basis",
              "dataType": "GENERIC_TEMPLATE_BASIS",
              "question": "Template basic information",
              "config": {
                "titlePlaceholder": "Title",
                "questionLabel": "",
                "tooltip": "",
                "required": false,
                "small_label": ""
              }
            },
            "topicId": 39,
            "sortOrder": 0,
            "config": {
              "titlePlaceholder": "Title",
              "questionLabel": "",
              "tooltip": "",
              "required": false,
              "small_label": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": null
          },
          {
            "question": {
              "categoryId": 7,
              "id": "boolean_1674814267658",
              "naturalKey": "boolean_1674814267658",
              "dataType": "BOOLEAN",
              "question": "New question",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 39,
            "sortOrder": 1,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 1,
            "value": true
          },
          {
            "question": {
              "categoryId": 7,
              "id": "date_1674814304449",
              "naturalKey": "date_1674814304449",
              "dataType": "DATE",
              "question": "New question",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "includeTime": false,
                "maxDate": null,
                "minDate": null,
                "defaultDate": null
              }
            },
            "topicId": 39,
            "sortOrder": 2,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "includeTime": false,
              "maxDate": null,
              "minDate": null,
              "defaultDate": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 2,
            "value": "2023-10-19T22:00:00.000Z"
          },
          {
            "question": {
              "categoryId": 7,
              "id": "text_input_1674814274952",
              "naturalKey": "text_input_1674814274952",
              "dataType": "TEXT_INPUT",
              "question": "New question",
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              }
            },
            "topicId": 39,
            "sortOrder": 3,
            "config": {
              "required": false,
              "small_label": "",
              "tooltip": "",
              "htmlQuestion": "",
              "isHtmlQuestion": false,
              "min": null,
              "max": null,
              "multiline": false,
              "placeholder": "",
              "isCounterHidden": false
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 3,
            "value": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
          }
        ]
      }
    ]
  },
  "userRole": {
    "id": 2,
    "shortCode": "user_officer",
    "title": "User Officer"
  }
}
`,
      });
    });

    it('User officer can modify PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy="templateData"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateHeader-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateFooter-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateSampleDeclaration-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Dummy Data').click();

      cy.get('[data-cy="dummyData"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=dummyData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

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

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

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

    it.only('User officer opens a PDF template editor → PDF preview renders without error', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy="pdf-template-preview"] canvas', {
        timeout: 60000,
      }).should('be.visible');

      cy.get('[data-cy="pdf-template-preview-error"]').should('not.exist');
    });

    it('User officer can clone PDF template', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

      cy.contains(createdTemplateName)
        .parent()
        .find("[aria-label='Edit']")
        .click();

      cy.contains(createdTemplateName).should('exist');

      cy.get('[data-cy="templateData"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Header').click();

      cy.get('[data-cy="templateHeader"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateHeader-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Footer').click();

      cy.get('[data-cy="templateFooter"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateFooter-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Sample Declaration').click();

      cy.get('[data-cy="templateSampleDeclaration"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=templateSampleDeclaration-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.contains('Dummy Data').click();

      cy.get('[data-cy="dummyData"] .cm-content')
        .first()
        .invoke('text', pdfTemplateData)
        .should(($p) => {
          expect($p).to.contain(pdfTemplateData);
        });

      cy.get('[data-cy=dummyData-submit]').click();

      cy.notification({ variant: 'success', text: 'successfully' });

      cy.navigateToTemplatesSubmenu('PDF (Proposal)');

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
