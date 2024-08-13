import { faker } from '@faker-js/faker';
import {
  DataType,
  TemplateCategoryId,
  TemplateGroupId,
} from '@user-office-software-libs/shared-types';

import initialDBData from '../support/initialDBData';

context('Technique tests', () => {
  const title = faker.word.words(5);
  const abstract = faker.word.words(5);

  const technique1 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique2 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const technique3 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;
  const scientist3 = initialDBData.users.user3;
  const scientist4 = initialDBData.users.placeholderUser;
  const scientist5 = initialDBData.users.reviewer;

  const instrument1 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist1.id,
  };

  const instrument2 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist2.id,
  };

  const instrument3 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist3.id,
  };

  const instrument4 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist4.id,
  };

  const instrument5 = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
    managerUserId: scientist5.id,
  };

  const proposalWorkflow = {
    name: faker.word.words(1),
    description: faker.word.words(5),
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  it('User should not be able to see Techniques page', () => {
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Techniques');
  });

  describe('Techniques basic tests', () => {
    let createdInstrumentId: number;
    let createdTechniqueId: number;

    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
      cy.finishedLoading();
    });

    it('User officer should be able to create technique', function () {
      cy.contains('Techniques').click();
      cy.contains('Create').click();
      cy.get('#name').type(technique1.name);
      cy.get('#shortCode').type(technique1.shortCode);
      cy.get('#description').type(technique1.description);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.contains(technique1.name);
      cy.contains(technique1.shortCode);
      cy.contains(technique1.description);
    });

    it('User officer should be able to update technique', function () {
      const newName = faker.word.words(1);
      const newShortCode = faker.string.alphanumeric(15);
      const newDescription = faker.word.words(5);
      cy.createTechnique(technique1);

      cy.contains('Techniques').click();
      cy.contains(technique1.name).parent().find('[aria-label="Edit"]').click();
      cy.get('#name').clear();
      cy.get('#name').type(newName);
      cy.get('#shortCode').clear();
      cy.get('#shortCode').type(newShortCode);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      cy.get('[data-cy="techniques-table"]').as('techniquesTable');

      cy.get('@techniquesTable').should('contain', newName);
      cy.get('@techniquesTable').should('contain', newShortCode);
      cy.get('@techniquesTable').should('contain', newDescription);
    });

    it('User officer should be able to delete technique', function () {
      cy.createInstrument(instrument1)
        .then((result) => {
          if (result.createInstrument) {
            createdInstrumentId = result.createInstrument.id;
          }
        })
        .then(() => {
          cy.createTechnique(technique1).then((result) => {
            if (result.createTechnique) {
              createdTechniqueId = result.createTechnique.id;
            }
          });
        })
        .then(() => {
          cy.assignInstrumentsToTechnique({
            instrumentIds: [createdInstrumentId],
            techniqueId: createdTechniqueId,
          });
        });

      cy.contains('Techniques').click();
      cy.finishedLoading();

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Technique deleted' });

      cy.contains(technique1.name).should('not.exist');
    });

    it('User officer should be able to assign and unassign instruments to technique without page refresh', function () {
      cy.createTechnique(technique1);
      cy.createInstrument(instrument1);
      cy.createInstrument(instrument2);

      cy.contains('Techniques').click();

      cy.finishedLoading();

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label*="Assign/remove"]')
        .click();

      cy.get('[data-cy="technique-instruments-assignment"]').click();

      cy.get('[data-cy="technique-instruments-assignment"]')
        .contains('Loading...')
        .should('not.exist');

      cy.get('#selectedInstrumentIds-input').first().click();

      cy.get('[data-cy="instrument-selection-options"] li')
        .contains(instrument1.name)
        .click();

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'successfully!',
      });

      cy.contains(technique1.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="technique-instrument-assignments-table"]').contains(
        instrument1.shortCode
      );

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label*="Assign/remove"]')
        .click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[data-cy="instrument-selection"]').should(
        'contain',
        instrument1.name
      );

      cy.get('[data-cy="technique-instruments-assignment"]').click();

      cy.get('[data-cy="technique-instruments-assignment"]')
        .contains('Loading...')
        .should('not.exist');

      cy.get('[title="Clear"]').click();

      cy.get('[data-cy="remove-instrument-alert"]').should('exist');

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.notification({
        variant: 'success',
        text: 'successfully!',
      });

      cy.get('[data-cy="technique-instrument-assignments-table"]')
        .children()
        .should('not.contain', instrument1.shortCode);
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    let techniqueId1: number;
    let techniqueId2: number;
    let techniqueId3: number;

    let techniqueName1: string;
    let techniqueName2: string;
    let techniqueName3: string;

    let instrumentId1: number;
    let instrumentId2: number;
    let instrumentId3: number;
    let instrumentId4: number;
    let instrumentId5: number;

    let topicId: number;

    let techniquePickerQuestionId: string;
    const techniquePickerQuestion = 'Select your technique';

    beforeEach(() => {
      cy.window().then((win) => {
        win.location.href = 'about:blank';
      });
      cy.resetDB();
      cy.getAndStoreFeaturesEnabled();

      cy.createTemplate({
        name: 'Proposal Template with Technique Picker',
        groupId: TemplateGroupId.PROPOSAL,
      });

      cy.createProposalWorkflow({
        name: proposalWorkflow.name,
        description: proposalWorkflow.description,
      });

      cy.createTechnique(technique1).then((result) => {
        techniqueName1 = result.createTechnique.name;
        techniqueId1 = result.createTechnique.id;
      });

      cy.createTechnique(technique2).then((result) => {
        techniqueName2 = result.createTechnique.name;
        techniqueId2 = result.createTechnique.id;
      });

      cy.createInstrument(instrument1).then((result) => {
        instrumentId1 = result.createInstrument.id;
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: instrumentId1 }],
        });
      });

      cy.createInstrument(instrument2).then((result) => {
        instrumentId2 = result.createInstrument.id;
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: instrumentId2 }],
        });
      });

      cy.createInstrument(instrument3)
        .then((result) => {
          instrumentId3 = result.createInstrument.id;
          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: instrumentId3 }],
          });
        })
        .then(() => {
          cy.assignInstrumentsToTechnique({
            instrumentIds: [instrumentId1, instrumentId2],
            techniqueId: techniqueId1,
          });
        })
        .then(() => {
          cy.assignInstrumentsToTechnique({
            instrumentIds: [instrumentId3],
            techniqueId: techniqueId2,
          });
        });

      cy.createTopic({
        templateId: initialDBData.template.id,
        sortOrder: 1,
      }).then((topicResult) => {
        if (topicResult.createTopic) {
          topicId =
            topicResult.createTopic.steps[
              topicResult.createTopic.steps.length - 1
            ].topic.id;
          cy.createQuestion({
            categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
            dataType: DataType.TECHNIQUE_PICKER,
          }).then((result) => {
            techniquePickerQuestionId = result.createQuestion.id;
            cy.updateQuestion({
              id: result.createQuestion.id,
              question: techniquePickerQuestion,
              config: `{"variant":"dropdown","isMultipleSelect":false,"required":true}`,
            });
            cy.createQuestionTemplateRelation({
              questionId: techniquePickerQuestionId,
              templateId: initialDBData.template.id,
              sortOrder: 0,
              topicId: topicId,
            });
          });
        }
      });
    });

    it('Single technique selection assigns all instruments to the proposal that are both linked to the technique and assigned to the call', function () {
      cy.createInstrument(instrument4).then((result) => {
        instrumentId4 = result.createInstrument.id;

        cy.assignInstrumentsToTechnique({
          instrumentIds: [instrumentId4],
          techniqueId: techniqueId1,
        });
      });

      cy.createInstrument(instrument5).then((result) => {
        instrumentId5 = result.createInstrument.id;

        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: instrumentId5 }],
        });
      });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.get('[data-natural-key^="technique_picker"]').click();
      cy.get('[role="option"]').contains(techniqueName1).click();
      cy.contains('Save and continue').click();
      cy.finishedLoading();
      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Dashboard').click();
      cy.contains(title).parent().contains('draft');
      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('exist')
        .click();
      cy.contains('Submit').click();
      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');
      cy.get('[aria-label="View proposal"]').should('exist');

      cy.login('officer');
      cy.visit('/');
      cy.contains('Proposals').click();

      cy.contains(title).parent().contains(instrument1.name);
      cy.contains(title).parent().contains(instrument2.name);

      // Instrument 3 is on a different technique
      cy.contains(title)
        .parent()
        .contains(instrument3.name)
        .should('not.exist');
      // Instrument 4 is assigned to the technique but not the call
      cy.contains(title)
        .parent()
        .contains(instrument4.name)
        .should('not.exist');
      // Instrument 5 is assigned to the call but not the technique
      cy.contains(title)
        .parent()
        .contains(instrument5.name)
        .should('not.exist');

      cy.contains(title).parent().find('[aria-label="View proposal"]').click();

      cy.contains('td', instrument1.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
      cy.contains('td', instrument3.name).should('not.exist');
      cy.contains('td', instrument4.name).should('not.exist');
      cy.contains('td', instrument5.name).should('not.exist');
    });

    it('Multiple technique selection assigns all instruments to the proposal that are both linked to the technique and assigned to the call', function () {
      cy.createInstrument(instrument4)
        .then((result) => {
          instrumentId4 = result.createInstrument.id;

          cy.assignInstrumentsToTechnique({
            instrumentIds: [instrumentId4],
            techniqueId: techniqueId1,
          });
        })
        .then(() => {
          cy.createInstrument(instrument5).then((result) => {
            instrumentId5 = result.createInstrument.id;

            cy.assignInstrumentToCall({
              callId: initialDBData.call.id,
              instrumentFapIds: [{ instrumentId: instrumentId5 }],
            });
          });
        });

      cy.updateQuestionTemplateRelationSettings({
        questionId: techniquePickerQuestionId,
        templateId: initialDBData.template.id,
        config: `{"variant":"dropdown","isMultipleSelect":true,"required":true}`,
        dependencies: [],
      });
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.get('[data-natural-key^="technique_picker"]').click();
      cy.get('[role="option"]').contains(techniqueName1).click();
      cy.get('[role="option"]').contains(techniqueName2).click();
      cy.get('body').type('{esc}');
      cy.contains('Save and continue').click();
      cy.finishedLoading();
      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Dashboard').click();
      cy.contains(title).parent().contains('draft');
      cy.contains(title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .should('exist')
        .click();
      cy.contains('Submit').click();
      cy.contains('OK').click();

      cy.contains('Dashboard').click();
      cy.contains(title);
      cy.contains('submitted');
      cy.get('[aria-label="View proposal"]').should('exist');

      cy.login('officer');
      cy.visit('/');
      cy.contains('Proposals').click();

      cy.contains(title).parent().contains(instrument1.name);
      cy.contains(title).parent().contains(instrument2.name);
      cy.contains(title).parent().contains(instrument3.name);

      // Instrument 4 is assigned to technique 1 but not the call
      cy.contains(title)
        .parent()
        .contains(instrument4.name)
        .should('not.exist');
      // Instrument 5 is assigned to the call but not any technique
      cy.contains(title)
        .parent()
        .contains(instrument5.name)
        .should('not.exist');

      cy.contains(title).parent().find('[aria-label="View proposal"]').click();

      cy.contains('td', instrument1.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
      cy.contains('td', instrument3.name).should('exist');
      cy.contains('td', instrument4.name).should('not.exist');
      cy.contains('td', instrument5.name).should('not.exist');
    });

    it('When instruments are assigned to multiple techniques, only unique techniques are shown in the questionnaire', function () {
      // Instruments 1 and 2 are now assigned to both techniques 1 and 2
      cy.assignInstrumentsToTechnique({
        instrumentIds: [instrumentId1, instrumentId2],
        techniqueId: techniqueId2,
      });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.get('[data-natural-key^="technique_picker"]').click();

      cy.get('[role="option"]')
        .should('have.length', 2)
        .then((options) => {
          const techniques = [...options].map((option) => option.textContent);
          expect(techniques).to.include.members([
            techniqueName1,
            techniqueName2,
          ]);
        });
    });

    it('Techniques options display in the questionnaire based on the instruments attached to the call', function () {
      cy.createTechnique(technique3).then((result) => {
        techniqueName3 = result.createTechnique.name;
        techniqueId3 = result.createTechnique.id;
      });

      cy.createInstrument(instrument4).then((result) => {
        instrumentId4 = result.createInstrument.id;

        cy.assignInstrumentsToTechnique({
          instrumentIds: [instrumentId4],
          techniqueId: techniqueId3,
        });
      });

      cy.createInstrument(instrument5).then((result) => {
        instrumentId5 = result.createInstrument.id;

        cy.assignInstrumentsToTechnique({
          instrumentIds: [instrumentId5],
          techniqueId: techniqueId1,
        });
      });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=title] input').type(title).should('have.value', title);
      cy.get('[data-cy=abstract] textarea')
        .first()
        .type(abstract)
        .should('have.value', abstract);
      cy.contains('Save and continue').click();
      cy.finishedLoading();

      cy.get('[data-natural-key^="technique_picker"]').click();

      cy.get('[role="option"]')
        .should('have.length', 2)
        .then((options) => {
          const techniques = [...options].map((option) => option.textContent);
          /*
          Technique 1 has an instrument 5 not attached to the call, but should
          still show as there are other instruments attached. Technique 2
          has all attached and should show.
          */
          expect(techniques).to.include.members([
            techniqueName1,
            techniqueName2,
          ]);
          /*
          Technique 3 contains a single instrument 4 that is not attached
          to the call, so it should therefore not show as an option.
          */
          expect(techniques).to.not.include.members([techniqueName3]);
        });
    });
  });
});
