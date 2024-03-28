import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Proposal administration tests', () => {
  const proposalName1 = faker.lorem.words(3);
  const proposalAbstract1 = faker.lorem.paragraph(3);
  const proposalName2 = faker.lorem.words(3);
  const proposalFixedName = '0000. Alphabetically first title';
  const proposalFixedAbstract =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  const textUser = faker.lorem.words(5);
  const textManager = faker.lorem.words(5);

  const existingUserId = initialDBData.users.user1.id;
  const existingTopicId = 1;
  const existingQuestionaryId = 1;
  let createdProposalPk: number;
  let createdProposalId: string;
  let createdInstrumentId: number;

  const instrument1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: existingUserId,
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Proposal administration advanced search filter tests', () => {
    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        cy.updateUserRoles({
          id: existingUserId,
          roles: [
            initialDBData.roles.user,
            initialDBData.roles.instrumentScientist,
          ],
        });
      }

      cy.createProposal({ callId: initialDBData.call.id }).then(
        ({ createProposal }) => {
          if (createProposal) {
            createdProposalPk = createProposal.primaryKey;
            createdProposalId = createProposal.proposalId;
            cy.updateProposal({
              proposalPk: createProposal.primaryKey,
              proposerId: existingUserId,
              title: proposalName1,
              abstract: proposalAbstract1,
            });
            cy.answerTopic({
              answers: [],
              topicId: existingTopicId,
              questionaryId: existingQuestionaryId,
              isPartialSave: false,
            });
            cy.submitProposal({
              proposalPk: createProposal.primaryKey,
            });

            cy.createInstrument(instrument1).then((result) => {
              if (result.createInstrument) {
                createdInstrumentId = result.createInstrument.id;

                cy.assignInstrumentToCall({
                  callId: initialDBData.call.id,
                  instrumentFapIds: [{ instrumentId: createdInstrumentId }],
                });
              }
            });
          }
        }
      );
      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to whitelist origin for download proposal pdf endpoint', function () {
      if (featureFlags.getEnabledFeatures().get(FeatureId.OAUTH)) {
        this.skip();
      }
      cy.contains('Proposals').click();

      const token = window.localStorage.getItem('token');
      const whitelistedUrl = 'https://whitelistedUrl.com';

      cy.request({
        url: '/download/pdf/proposal/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
          Origin: whitelistedUrl,
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
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
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
        if (result.createProposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.primaryKey,
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

    it('User officer should see Reviews tab before doing the Admin(management decision)', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.TECHNICAL_REVIEW)) {
        this.skip();
      }
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy=view-proposal]').first().click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Reviews').click();

      cy.get('[role="dialog"]').contains('External reviews');
      cy.get('[role="dialog"]').contains('Fap Meeting decision');
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

  describe('Proposal administration API token access', () => {
    let createdProposalPk: number;
    let createdProposalId: string;
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;
          cy.updateProposal({
            proposalPk: createdProposalPk,
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
            proposalPk: createdProposalPk,
          });
        }
      });

      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to download proposal pdf with valid API token', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        /*temporarily skipping, until issue is fixed on github stfc actions (no such file or directory, open '/config/logos)
        This test is passing when you run it in local environment.
       */
        this.skip();
      }

      const accessTokenName = faker.lorem.words(2);
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions: '{"FactoryServices.getPdfProposals":true}',
      });

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

      cy.contains('Other Services').click();

      cy.contains('FactoryServices.getPdfProposals');
      cy.get('#accessToken')
        .invoke('val')
        .then((value) => {
          const accessToken = value as string;
          cy.request({
            url: `/download/pdf/proposal/${createdProposalPk}`,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.be.equal(
              'application/pdf'
            );
            expect(response.status).to.be.equal(200);
          });
          cy.request({
            url: `/download/pdf/proposal/${createdProposalId}?filter=id`,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).to.be.equal(
              'application/pdf'
            );
            expect(response.status).to.be.equal(200);
          });
        });
    });

    it('Should not be able to download proposal pdf with invalid API token', () => {
      const accessTokenName = faker.lorem.words(2);
      cy.createApiAccessToken({
        name: accessTokenName,
        accessPermissions: '{"ProposalQueries.getAll":true}',
      });

      cy.contains('Settings').click();
      cy.contains('API access tokens').click();

      cy.contains(accessTokenName).parent().find('[aria-label="Edit"]').click();

      cy.finishedLoading();

      cy.contains('Other Services').click();

      cy.contains('FactoryServices.getPdfProposals').should('not.be.checked');

      cy.get('#accessToken')
        .invoke('val')
        .then((value) => {
          const accessToken = value as string;
          cy.request({
            url: `/download/pdf/proposal/${createdProposalPk}`,
            failOnStatusCode: false,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).not.be.equal(
              'application/pdf'
            );
            expect(response.status).not.equal(200);
          });

          cy.request({
            url: `/download/pdf/proposal/${createdProposalId}?filter=id`,
            failOnStatusCode: false,
            method: 'GET',
            headers: {
              authorization: accessToken,
            },
          }).then((response) => {
            expect(response.headers['content-type']).not.be.equal(
              'application/pdf'
            );
            expect(response.status).not.equal(200);
          });
        });
    });
  });
});
