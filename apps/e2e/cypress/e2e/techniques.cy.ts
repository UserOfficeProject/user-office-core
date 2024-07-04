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

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;
  const scientist3 = initialDBData.users.user3;

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
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;
        }
      });
      cy.createTechnique(technique1).then((result) => {
        if (result.createTechnique) {
          createdTechniqueId = result.createTechnique.id;
        }
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId],
        techniqueId: createdTechniqueId,
      });

      cy.contains('Techniques').click();

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Technique deleted' });

      cy.contains(technique1.name).should('not.exist');
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
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

      cy.screenshot('DEBUG BEFORE EXPECTED NOTIFICATION');

      cy.notification({
        variant: 'success',
        text: 'assigned.+successfully',
      });

      cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'assigned.+successfully!',
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
        text: 'unassigned.+successfully!',
      });

      cy.get('[data-cy="technique-instrument-assignments-table"]')
        .children()
        .should('not.contain', instrument1.shortCode);
    });
  });

  describe('Technique picker automatic instrument assignment', () => {
    let techniqueId1: number;
    let techniqueId2: number;

    let techniqueName1: string;
    let techniqueName2: string;

    let instrumentId1: number;
    let instrumentId2: number;
    let instrumentId3: number;

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
      cy.createInstrument(instrument3).then((result) => {
        instrumentId3 = result.createInstrument.id;
        cy.assignInstrumentToCall({
          callId: initialDBData.call.id,
          instrumentFapIds: [{ instrumentId: instrumentId3 }],
        });
      });

      cy.assignInstrumentsToTechnique({
        instrumentIds: [instrumentId1, instrumentId2],
        techniqueId: techniqueId1,
      });

      cy.assignInstrumentsToTechnique({
        instrumentIds: [instrumentId3],
        techniqueId: techniqueId2,
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

    it('Single technique selection assigns all instruments to the proposal that are linked to the technique', function () {
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
      cy.contains(title).parent().find('[aria-label="View proposal"]').click();
      cy.contains('td', instrument1.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
    });

    it('Multiple technique selection assigns all instruments to the proposal that are linked to the techniques', function () {
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
      cy.contains(title).parent().find('[aria-label="View proposal"]').click();
      cy.contains('td', instrument1.name).should('exist');
      cy.contains('td', instrument2.name).should('exist');
      cy.contains('td', instrument3.name).should('exist');
    });
  });
});
