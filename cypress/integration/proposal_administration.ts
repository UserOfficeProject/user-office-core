import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('Proposal administration tests', () => {
  const proposalName1 = faker.lorem.words(3);
  const proposalName2 = faker.lorem.words(3);
  const proposalFixedName = '0000. Alphabetically first title';

  const textUser = faker.lorem.words(5);
  const textManager = faker.lorem.words(5);

  const existingUserId = 1;
  const existingTopicId = 1;
  const existingQuestionaryId = 1;

  beforeEach(() => {
    cy.resetDB();
  });

  describe('Proposal administration advanced search filter tests', () => {
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            proposerId: existingUserId,
            title: proposalName1,
            abstract: proposalName1,
          });
          cy.answerTopic({
            answers: [],
            topicId: existingTopicId,
            questionaryId: existingQuestionaryId,
            isPartialSave: false,
          });
          cy.submitProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to set comment for user/manager and final status', () => {
      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Admin').click();
      cy.get('[data-cy="proposal-final-status"]').should('exist');
      cy.get('[role="dialog"]').contains('Logs').click();
      cy.get('[role="dialog"]').contains('Admin').click();

      cy.get('[data-cy="proposal-final-status"]').click();

      cy.get('[data-cy="proposal-final-status-options"] li')
        .contains('Accepted')
        .click();

      cy.get('[data-cy="managementTimeAllocation"] label').should(
        'include.text',
        initialDBData.call.allocationTimeUnit
      );

      cy.get('[data-cy="managementTimeAllocation"] input')
        .clear()
        .type('-123')
        .blur();
      cy.contains('Must be greater than or equal to');

      cy.get('[data-cy="managementTimeAllocation"] input')
        .clear()
        .type('987654321')
        .blur();
      cy.contains('Must be less than or equal to');

      cy.get('[data-cy="managementTimeAllocation"] input').clear().type('20');

      cy.setTinyMceContent('commentForUser', textUser);
      cy.setTinyMceContent('commentForManagement', textManager);

      cy.on('window:confirm', (str) => {
        expect(str).to.equal(
          'Changes you recently made in this tab will be lost! Are you sure?'
        );

        return false;
      });

      cy.contains('Proposal information').click();

      cy.get('[data-cy="is-management-decision-submitted"]').click();

      cy.get('[data-cy="save-admin-decision"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.reload();

      cy.getTinyMceContent('commentForUser').then((content) =>
        expect(content).to.have.string(textUser)
      );

      cy.getTinyMceContent('commentForManagement').then((content) =>
        expect(content).to.have.string(textManager)
      );

      cy.get('[data-cy="managementTimeAllocation"] input').should(
        'have.value',
        '20'
      );

      cy.get('[data-cy="is-management-decision-submitted"] input').should(
        'have.value',
        'true'
      );

      cy.closeModal();

      cy.contains('Accepted');
      cy.contains('DRAFT');
      cy.get("[aria-label='Show Columns']").first().click();
      cy.get('.MuiPopover-paper').contains('Final time allocation').click();
      cy.get('body').click();
      cy.contains(proposalName1)
        .parent()
        .should('include.text', initialDBData.call.allocationTimeUnit);
    });

    it('Should show warning if proposal status is changing to SCHEDULING and proposal has no instrument', () => {
      cy.contains('Proposals').click();

      if (proposalName1) {
        cy.contains(proposalName1).parent().find('[type="checkbox"]').check();
      } else {
        cy.get('[type="checkbox"]').first().check();
      }

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal/s status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('SCHEDULING').click();

      cy.get('[role="alert"] .MuiAlert-message')
        .should('exist')
        .and(
          'contain.text',
          'Be aware that proposal/s not assigned to an instrument will not be shown in the scheduler after changing status to "SCHEDULING"'
        );
    });

    it('Should be able to re-open proposal for submission', () => {
      cy.contains('Proposals').click();

      if (proposalName1) {
        cy.contains(proposalName1).parent().find('[type="checkbox"]').check();
      } else {
        cy.get('[type="checkbox"]').first().check();
      }

      cy.get('[data-cy="change-proposal-status"]').click();

      cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
      cy.get('@dialog').contains('Change proposal/s status');

      cy.get('@dialog')
        .find('#selectedStatusId-input')
        .should('not.have.class', 'Mui-disabled');

      cy.get('@dialog').find('#selectedStatusId-input').click();

      cy.get('[role="listbox"]').contains('DRAFT').click();

      cy.get('[role="alert"] .MuiAlert-message').contains(
        'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
      );

      cy.get('[data-cy="submit-proposal-status-change"]').click();

      cy.notification({
        variant: 'success',
        text: 'status changed successfully',
      });

      cy.contains(proposalName1).parent().contains('No');

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains(proposalName1)
        .parent()
        .get('[aria-label="Edit proposal"]')
        .click();

      cy.finishedLoading();
      cy.contains(proposalName1);

      cy.contains('Submit').parent().should('not.be.disabled');
    });

    it('If you select a tab in tabular view and reload the page it should stay on specific selected tab', () => {
      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Admin').click();

      cy.reload();

      cy.get('#commentForUser').should('exist');

      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.reload();

      cy.get('[data-cy="timeAllocation"]').should('exist');
    });

    it('Download proposal is working with dialog window showing up', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      cy.contains(proposalName1)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposalName1
      );

      cy.contains(proposalFixedName)
        .parent()
        .find('input[type="checkbox"]')
        .check();

      cy.get('[data-cy="download-proposals"]').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        '2 selected items'
      );
    });

    it('Should be able to download proposal pdf', () => {
      cy.contains('Proposals').click();

      cy.request({
        url: '/download/pdf/proposal/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`,
        },
      }).then((response) => {
        expect(response.headers['content-type']).to.be.equal('application/pdf');
        expect(response.status).to.be.equal(200);
      });
    });

    it('Should be able to save table selection state in url', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[type="checkbox"]').eq(1).click();

      cy.url().should('contain', 'selection=');

      cy.reload();

      cy.contains('1 row(s) selected');
    });

    it('Should be able to save table search state in url', () => {
      cy.contains('Proposals').click();

      cy.get('[placeholder="Search"]').type('test');

      cy.url().should('contain', 'search=test');

      cy.reload();

      cy.get('[placeholder="Search"]').should('have.value', 'test');
    });

    it('Should be able to save table sort state in url', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      let officerProposalsTableAsTextBeforeSort = '';
      let officerProposalsTableAsTextAfterSort = '';

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextBeforeSort = element.text();
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextAfterSort = element.text();
      });

      cy.reload();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        expect(element.text()).to.be.equal(
          officerProposalsTableAsTextAfterSort
        );
        expect(element.text()).not.equal(officerProposalsTableAsTextBeforeSort);
      });

      cy.contains('Title')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'Ascendant');

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('Short Code')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.reload();

      cy.finishedLoading();

      cy.contains('Short Code')
        .parent()
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'Ascendant');
    });

    it('Should preserve the ordering when row is selected', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalFixedName,
            abstract: proposalName2,
            proposerId: existingUserId,
          });
        }
      });
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('table tbody tr').eq(1).contains(proposalFixedName);
      cy.contains('Title').click();
      cy.finishedLoading();
      cy.get('table tbody tr').eq(0).contains(proposalFixedName);

      cy.get('table tbody tr input[type="checkbox"]').first().click();

      cy.get('table tbody tr').eq(0).contains(proposalFixedName);
    });

    it('User officer should see Reviews tab before doing the Admin(management decision)', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy=view-proposal]').first().click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Reviews').click();

      cy.get('[role="dialog"]').contains('External reviews');
      cy.get('[role="dialog"]').contains('SEP Meeting decision');
    });
  });

  describe('Proposal administration advanced search tests', () => {
    beforeEach(() => {
      cy.resetDB(true);

      cy.viewport(1920, 1080);

      cy.login('officer');

      cy.visit('/');

      cy.get('[data-cy=call-filter]').click();

      cy.get('[role=listbox]').contains('call 1').first().click();

      cy.get('[data-cy=question-search-toggle]').click();
    });

    it('Should be able to search Boolean question', () => {
      // If answer true, find when search for Yes
      cy.answerTopic({
        questionaryId: initialDBData.proposal.questionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [
          {
            questionId: initialDBData.questions.boolean.id,
            value: '{"value":true}',
          },
        ],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');

      // If answer false, find when search for No
      cy.answerTopic({
        questionaryId: initialDBData.proposal.questionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [
          {
            questionId: initialDBData.questions.boolean.id,
            value: '{"value":false}',
          },
        ],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      // If missing answer, do not find the result for both, Yes and No
      cy.answerTopic({
        questionaryId: initialDBData.proposal.questionaryId,
        topicId: initialDBData.template.topic.id,
        answers: [],
      });
      cy.get('[data-cy=question-list]').click();
      cy.contains(initialDBData.questions.boolean.text).click();
      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');

      cy.get('[data-cy=is-checked]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.finishedLoading();
      cy.contains(initialDBData.proposal.title).should('not.exist');
    });

    it('Should be able to search Date question', () => {
      // Date questions
      const { questions, proposal, answers } = initialDBData;

      const DATE_ANSWER = answers.proposal.date.value;

      const DATE_BEFORE = DateTime.fromFormat(
        DATE_ANSWER,
        initialDBData.getFormats().dateFormat
      )
        .minus({ days: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);

      const DATE_AFTER = DateTime.fromFormat(
        DATE_ANSWER,
        initialDBData.getFormats().dateFormat
      )
        .plus({ days: 1 })
        .toFormat(initialDBData.getFormats().dateFormat);

      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.date.text).click();

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Exact').click();
      cy.get('[data-cy=value] input').clear().type(DATE_BEFORE);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Exact').click();
      cy.get('[data-cy=value] input').clear().type(DATE_ANSWER);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('After').click();
      cy.get('[data-cy=value] input').clear().type(DATE_BEFORE);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Before').click();
      cy.get('[data-cy=value] input').clear().type(DATE_BEFORE);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('After').click();
      cy.get('[data-cy=value] input').clear().type(DATE_AFTER);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Before').click();
      cy.get('[data-cy=value] input').clear().type(DATE_AFTER);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Select from options question', () => {
      const { questions, proposal, answers } = initialDBData;

      // Selection from options questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(questions.selectionFromOptions.text).click();

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]').contains('Two').click();

      cy.contains('Search').click();

      cy.contains(proposal.title).should('not.exist');

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]')
        .contains(answers.proposal.selectionFromOptions.value[0])
        .click();

      cy.contains('Search').click();

      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Text question', () => {
      const { questions, proposal, answers } = initialDBData;

      // Text questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.textInput.text).click();
      cy.get('[name=value]').clear().type(faker.lorem.words(3));
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');

      cy.get('[name=value]').clear().type(answers.proposal.textInput.value);
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search File upload question', () => {
      const { questions, proposal } = initialDBData;

      // File upload questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.fileUpload.text).click();
      cy.get('[data-cy=has-attachments]').click();
      cy.get('[role=listbox]').contains('Yes').click();
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      cy.get('[data-cy=has-attachments]').click();
      cy.get('[role=listbox]').contains('No').click();
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
    });

    it('Should be able to search Number input question', () => {
      const { questions, proposal, answers } = initialDBData;
      // NumberInput questions
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.numberInput.text).click();
      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value - 1).toString());
      cy.get('[data-cy=unit-select]').click();
      cy.get('[role=listbox]')
        .contains(answers.proposal.numberInput.value.unit.symbol)
        .click();
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      // NumberInput questions - Equals
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Equals').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.numberInput.value.value.toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value - 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.numberInput.value.value + 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');
    });

    it('Should be able to search Interval input question', () => {
      const { questions, proposal, answers } = initialDBData;
      // Interval question
      cy.get('[data-cy=question-list]').click();
      cy.contains(questions.interval.text).click();
      // Interval question - Less than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Less than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.interval.value.max.toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.interval.value.max + 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');

      // Interval question -  Greater than
      cy.get('[data-cy=comparator]').click();
      cy.get('[role=listbox]').contains('Greater than').click();
      cy.get('[data-cy=value] input')
        .clear()
        .type(answers.proposal.interval.value.min.toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('not.exist');
      cy.get('[data-cy=value] input')
        .clear()
        .type((answers.proposal.interval.value.min - 1).toString());
      cy.contains('Search').click();
      cy.contains(proposal.title).should('exist');
    });
  });
});
