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
  const technique = {
    name: faker.word.words(1),
    shortCode: faker.string.alphanumeric(15),
    description: faker.word.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;

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
    });

    it('User officer should be able to create technique', function () {
      cy.contains('Techniques').click();
      cy.contains('Create').click();
      cy.get('#name').type(technique.name);
      cy.get('#shortCode').type(technique.shortCode);
      cy.get('#description').type(technique.description);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.contains(technique.name);
      cy.contains(technique.shortCode);
      cy.contains(technique.description);
    });

    it('User officer should be able to update technique', function () {
      const newName = faker.word.words(1);
      const newShortCode = faker.string.alphanumeric(15);
      const newDescription = faker.word.words(5);
      cy.createTechnique(technique);

      cy.contains('Techniques').click();
      cy.contains(technique.name).parent().find('[aria-label="Edit"]').click();
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
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;
        }
      });
      cy.createTechnique(technique).then((result) => {
        if (result.createTechnique) {
          createdTechniqueId = result.createTechnique.id;
        }
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId],
        techniqueId: createdTechniqueId,
      });

      cy.contains('Techniques').click();

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Technique deleted' });

      cy.contains(technique.name).should('not.exist');
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('User officer should be able to assign and unassign instruments to technique without page refresh', function () {
      cy.createTechnique(technique);
      cy.createInstrument(instrument1);
      cy.createInstrument(instrument2);

      cy.contains('Techniques').click();

      cy.finishedLoading();

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Assign/remove"]')
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
        text: 'Instrument/s assigned to the selected technique successfully!',
      });

      cy.contains(technique.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="technique-instrument-assignments-table"]').contains(
        instrument1.shortCode
      );

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Assign/remove"]')
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
        text: 'Instrument/s unassigned from selected technique successfully!',
      });

      cy.get('[data-cy="technique-instrument-assignments-table"]')
        .children()
        .should('not.contain', instrument1.shortCode);
    });
  });

  describe('Technique picker automatic instrument assignment', () => {
    let createdTechniqueId: number;
    let createdInstrumentId1: number;
    let createdInstrumentId2: number;
    let topicId: number;
    let techniquePickerQuestionId: string;
    const techniquePickerQuestion = 'Select your technique';
    let techniqueName: string;

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

      cy.createTechnique(technique).then((result) => {
        createdTechniqueId = result.createTechnique.id;
        techniqueName = result.createTechnique.name;
      });

      cy.createInstrument(instrument1).then((result) => {
        createdInstrumentId1 = result.createInstrument.id;
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId1 }],
        });
      });

      cy.createInstrument(instrument2).then((result) => {
        createdInstrumentId2 = result.createInstrument.id;
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: createdInstrumentId2 }],
        });
      });

      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId1, createdInstrumentId2],
        techniqueId: createdTechniqueId,
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

    it('Single technique selection assigns all instruments to the proposal that are linked to the technique on saving', function () {
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
      cy.get('[data-cy=principal-investigator] input').should(
        'contain.value',
        'Carl'
      );
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
      cy.get('[role="option"]').contains(techniqueName).click();
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
      cy.contains(title).parent().find('[aria-label="View proposal"]').click();
      cy.contains('td', instrument1.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
    });

    it('Multiple technique selection assigns all instruments to the proposal that are linked to the techniques on saving', function () {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');
    });
  });
});
