import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

import {
  createTopicWithQuestionsAndRelations,
  proposal,
  intervalId,
  numberId,
  boolId,
  textId,
  dateId,
  timeId,
  richTextInputId,
  multipleChoiceId,
  richTextInputAllowImagesId,
  templateDependencies,
  booleanQuestion,
  dateQuestion,
  fileQuestion,
  multipleChoiceQuestion,
  richTextInputQuestion,
  richTextInputQuestionAllowImages,
  textQuestion,
} from './templateContext';
import initialDBData from '../support/initialDBData';

context('Template tests', () => {
  beforeEach(() => {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled();
    cy.viewport(1920, 1680);
  });

  describe('Proposal templates advanced tests', () => {
    beforeEach(() => {
      createTopicWithQuestionsAndRelations(true);
    });

    it('User can create proposal with template', () => {
      const dateTimeFieldValue = DateTime.fromJSDate(
        faker.date.past()
      ).toFormat(initialDBData.getFormats().dateTimeFormat);
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });
      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.finishedLoading();
      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get(`[data-cy="${intervalId}.min"]`).click().type('1');
      cy.get(`[data-cy="${intervalId}.max"]`).click().type('2');
      cy.get(`[data-cy="${numberId}.value"]`).click().type('1');
      cy.get(`#${boolId}`).click();
      cy.get(`#${textId}`).clear().type('this_word_{enter}should_be_multiline');
      cy.contains('this_word_should_be_multiline').should('not.exist');
      cy.get(`#${textId}`).clear().type(textQuestion.answer);
      cy.contains(`${textQuestion.answer.length}/${textQuestion.maxChars}`);
      cy.get(`[data-cy='${dateId}.value'] button`).click();
      cy.contains('15').click();
      cy.setDatePickerValue(
        `[data-cy='${timeId}.value'] input`,
        dateTimeFieldValue
      );

      cy.setTinyMceContent(richTextInputId, richTextInputQuestion.answer);

      cy.getTinyMceContent(richTextInputId).then((content) =>
        expect(content).to.have.string(richTextInputQuestion.answer)
      );

      cy.get(`#${multipleChoiceId}`).click();
      cy.contains(multipleChoiceQuestion.answers[0]).click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.get(`#${richTextInputId}`)
        .parent()
        .find('[data-cy="rich-text-char-count"]')
        .then((element) => {
          expect(element.text()).to.be.equal(
            `Characters: ${richTextInputQuestion.answer.length} / ${richTextInputQuestion.maxChars}`
          );
        });

      cy.setTinyMceContent(
        richTextInputAllowImagesId,
        richTextInputQuestionAllowImages.answer
      );

      cy.getTinyMceContent(richTextInputAllowImagesId).then((content) =>
        expect(content).to.have.string(richTextInputQuestionAllowImages.answer)
      );

      cy.contains('Save and continue').click();

      cy.contains('Submit').click();

      cy.contains('OK').click();

      cy.contains(proposal.title);
      cy.contains(proposal.abstract);
      cy.contains(textQuestion.answer);
      cy.contains(multipleChoiceQuestion.answers[0]);
      cy.contains(multipleChoiceQuestion.answers[1]).should('not.exist');
      cy.contains(multipleChoiceQuestion.answers[2]);
      cy.contains(dateTimeFieldValue);

      cy.contains(richTextInputQuestion.title);
      cy.get(`[data-cy="${richTextInputId}_open"]`).click();
      cy.get('[role="dialog"]').contains(richTextInputQuestion.title);
      cy.get('[role="dialog"]').contains(richTextInputQuestion.answer);
      cy.get('[role="dialog"]').contains('Close').click();

      cy.contains('Dashboard').click();
      cy.contains(proposal.title);
      cy.contains('submitted');
    });

    it('File Upload field could be set as required', () => {
      const fileName = 'file_upload_test.png';

      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion).click();

      cy.get('[role="presentation"]').contains('image/*').click();

      cy.get('body').type('{esc}');

      cy.contains('Is required').click();

      cy.contains('Update').click();

      cy.logout();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=title] input').type(faker.lorem.words(2));
      cy.get('[data-cy=abstract] textarea').first().type(faker.lorem.words(2));
      cy.contains('Save and continue').click();

      cy.contains(fileQuestion);
      cy.contains('Save and continue').click();
      cy.contains(fileQuestion).parent().contains('Please upload a file');

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.contains(fileQuestion)
        .parent()
        .should('not.contain.text', 'field must have at least 1 items');

      cy.logout();
    });

    it('File Upload max files should be required', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(fileQuestion).click();

      cy.get('[role="presentation"]').contains('image/*').click();

      cy.get('body').type('{esc}');

      cy.get('[data-cy="max_files"] input').clear().type('-1');

      cy.contains('Update').should('be.disabled');

      cy.get('[data-cy="max_files"] input').clear();

      cy.get('[data-cy="max_files"] input').should('be.focused');
      cy.get('[data-cy="max_files"] input:invalid').should('have.length', 1);

      cy.get('[data-cy="max_files"] input').clear().type('1');

      cy.contains('Update').click();

      cy.get('[data-cy="question-relation-dialogue"]').should('not.exist');

      cy.logout();
    });

    it('Officer can delete proposal questions', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(textQuestion.title).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(booleanQuestion).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(dateQuestion.title).click();
      cy.get("[data-cy='remove-from-template']").click();

      cy.contains(fileQuestion).click();
      cy.get("[data-cy='remove-from-template']").click();
    });

    it('User officer can add multiple dependencies on a question', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.createTextQuestion(templateDependencies.questions.textQuestion.title);

      cy.contains(templateDependencies.questions.textQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[data-cy="dependencyField"]').click();

      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.title)
        .click();

      cy.get('[data-cy="dependencyValue"]').click();

      cy.contains(multipleChoiceQuestion.answers[1]).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[data-cy="dependencyField"]').last().click();

      cy.get('[role="presentation"]').contains(booleanQuestion).click();

      cy.get('[data-cy="dependencyValue"]').last().click();

      cy.get('li[data-value="true"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.logout();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.contains(multipleChoiceQuestion.answers[1]).click();
      cy.get('body').type('{esc}');
      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(booleanQuestion).click();

      cy.get('main form').should(
        'contain.text',
        templateDependencies.questions.textQuestion.title
      );

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.answers[1])
        .click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.get('main form').should(
        'not.contain.text',
        templateDependencies.questions.textQuestion.title
      );
    });

    it('User officer can change dependency logic operator', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.get('[aria-label="Edit"]').last().click();

      cy.contains(textQuestion.title).click();

      cy.get('[data-cy="add-dependency-button"]').click();

      cy.get('[data-cy="dependencyField"]').last().click();

      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.title)
        .click();

      cy.get('[data-cy="dependencyValue"]').last().click();

      cy.contains(multipleChoiceQuestion.answers[1]).click();

      cy.get('[data-cy="dependencies-operator"]').click();

      cy.get('[data-value="OR"]').click();

      cy.get('[data-cy="submit"]').click();

      cy.logout();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();

      cy.contains('save and continue', { matchCase: false }).click();
      cy.finishedLoading();

      cy.get('main form').should('not.contain.text', textQuestion.title);

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.contains(multipleChoiceQuestion.answers[1]).click();
      cy.get('body').type('{esc}');
      cy.contains(textQuestion.title);

      cy.contains(multipleChoiceQuestion.title).parent().click();
      cy.get('[role="presentation"]')
        .contains(multipleChoiceQuestion.answers[1])
        .click();
      cy.contains(multipleChoiceQuestion.answers[2]).click();
      cy.get('body').type('{esc}');

      cy.get('main form').should('not.contain.text', textQuestion.title);

      cy.contains(booleanQuestion).click();
      cy.contains(textQuestion.title);
    });

    it('Can delete dependee, which will remove the dependency on depender', () => {
      cy.login('officer');
      cy.visit('/');

      cy.navigateToTemplatesSubmenu('Proposal');

      cy.contains(initialDBData.template.name)
        .parent()
        .find("[aria-label='Edit']")
        .first()
        .click();

      cy.contains(textQuestion.title)
        .closest('[data-cy=question-container]')
        .find('[data-cy=dependency-list]')
        .should('exist');
      cy.contains(booleanQuestion).click();
      cy.get('[data-cy=remove-from-template]').click();
      cy.contains(textQuestion.title)
        .closest('[data-cy=question-container]')
        .find('[data-cy=dependency-list]')
        .should('not.exist');
    });

    it('User can add captions after uploading image/* file', () => {
      const fileName = 'file_upload_test2.png'; // need to use another file due to bug in cypress, which do not allow the same fixture to be reused
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal;
        if (createdProposal) {
          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal.title,
            abstract: proposal.abstract,
            proposerId: initialDBData.users.user1.id,
          });
        }
      });

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');

      cy.contains(proposal.title)
        .parent()
        .find('[aria-label="Edit proposal"]')
        .click();
      cy.finishedLoading();

      cy.contains('Save and continue').click();

      cy.closeNotification();

      cy.contains(fileQuestion);

      cy.intercept({
        method: 'POST',
        url: '/files/upload',
      }).as('upload');

      // NOTE: Force is needed because file input is not visible and has display: none
      cy.contains(fileQuestion)
        .parent()
        .find('input[type="file"]')
        .selectFile(
          {
            contents: `cypress/fixtures/${fileName}`,
            fileName: fileName,
          },
          { force: true }
        );

      // wait for the '/files/upload' request, and leave a 30 seconds delay before throwing an error
      cy.wait('@upload', { requestTimeout: 30000 });

      cy.contains(fileName);

      cy.get('[aria-label="Add image caption"]').click();

      cy.get('[data-cy="image-figure"] input').type('Fig_test');
      cy.get('[data-cy="image-caption"] input').type('Test caption').blur();

      cy.get('[data-cy="save-button"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.closeNotification();

      cy.finishedLoading();

      cy.get('.MuiStep-root').contains('Review').click();

      cy.contains(proposal.abstract);

      cy.contains(fileName);

      cy.get('[data-cy="questionary-stepper"]')
        .contains(initialDBData.template.topic.title)
        .click();

      cy.finishedLoading();
      cy.contains('Save and continue');

      cy.contains(fileQuestion)
        .parent()
        .should('contain.text', fileName)
        .find('[data-cy="image-caption"] input')
        .should('have.value', 'Test caption');
      cy.contains(fileQuestion)
        .parent()
        .find('[data-cy="image-figure"] input')
        .should('have.value', 'Fig_test');
    });
  });
});
