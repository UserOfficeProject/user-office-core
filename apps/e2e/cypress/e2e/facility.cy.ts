import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

const facilityName = faker.word.words(2);
const facilityShortCode = faker.word.words(1);

const facilityName2 = faker.word.words(2);
const facilityShortCode2 = faker.word.words(1);

const proposal1 = {
  title: faker.word.words(2),
  abstract: faker.word.words(5),
};

const proposal2 = {
  title: faker.word.words(2),
  abstract: faker.word.words(5),
};

const scientist1 = initialDBData.users.user1;

const instrument1 = {
  name: faker.word.words(2),
  shortCode: faker.word.words(1),
  description: faker.word.words(5),
  managerUserId: scientist1.id,
};

const instrument2 = {
  name: faker.word.words(2),
  shortCode: faker.word.words(1),
  description: faker.word.words(5),
  managerUserId: scientist1.id,
};

context('Facility tests', () => {
  beforeEach(function () {
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FACILITIES)) {
        this.skip();
      }
    });

    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Facility tests User officer', () => {
    beforeEach(() => {
      cy.login('officer');
    });

    it('User officer should be able to create and delete facility', () => {
      cy.visit('/');
      cy.contains('Facility').click();

      cy.get('[data-cy="create-new-entry"]').click();
      cy.get('[data-cy="facility-name"]').type(facilityName);
      cy.get('[data-cy="shortCode"]').type(facilityShortCode);

      cy.get('[data-cy="submit"]').click();

      cy.contains(facilityName);
      cy.contains(facilityShortCode);
    });

    it('User officer should be able to assign and remove instruments from facilities', () => {
      cy.createFacility({ name: facilityName, shortCode: facilityShortCode });
      cy.createInstrument(instrument1);
      cy.visit('/Facility');

      cy.contains(facilityName);

      cy.contains(instrument1.name).should('not.exist');

      cy.get('[aria-label="Assign Instrument"]').click();

      cy.contains(instrument1.name).parent().find('[type="checkbox"]').click();

      cy.get('[data-cy="assign-selected-instruments"]').click();

      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains(instrument1.name);

      // It persisits after reload
      cy.visit('/Facility');
      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains(instrument1.name);

      cy.get('[data-testId=DeleteIcon]').click();
      cy.contains(instrument1.name).should('not.exist');
    });

    it('User officer should be able to assign and remove users from facilities', () => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: scientist1.id,
          roles: [initialDBData.roles.instrumentScientist],
        });
      }
      cy.contains(scientist1.firstName).should('not.exist');

      cy.createFacility({ name: facilityName, shortCode: facilityShortCode });
      cy.visit('/Facility');

      cy.get('[aria-label="Assign scientist"]').click();

      cy.contains(scientist1.firstName)
        .parent()
        .find('[type="checkbox"]')
        .click();

      cy.get('[data-cy="assign-selected-users"]').click();

      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.contains(scientist1.firstName);

      // It persisits after reload
      cy.visit('/Facility');
      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .click();
      cy.contains(scientist1.firstName);

      cy.get('[data-testId=DeleteIcon]').click();

      cy.contains(scientist1.firstName).should('not.exist');
    });
  });

  describe('Facility tests Facility Member', () => {
    let createdInstrument1Id: number;
    let createdInstrument2Id: number;
    let createdProposalId: string;

    beforeEach(() => {
      if (featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        cy.updateUserRoles({
          id: initialDBData.users.user1.id,
          roles: [initialDBData.roles.facilityMember],
        });
      }

      cy.createFacility({
        name: facilityName,
        shortCode: facilityShortCode,
      }).then((facility) => {
        cy.createInstrument({
          name: instrument1.name,
          shortCode: instrument1.shortCode,
          description: instrument1.description,
          managerUserId: scientist1.id,
        }).then((instrument) => {
          createdInstrument1Id = instrument.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [
              { instrumentId: instrument.createInstrument.id },
            ],
          });

          cy.addInstrumentToFacility({
            instrumentIds: [instrument.createInstrument.id],
            facilityId: facility.createFacility.id,
          });
          cy.addUserToFacility({
            userIds: [scientist1.id],
            facilityId: facility.createFacility.id,
          });
        });
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          const createdProposalPk = result.createProposal.primaryKey;
          createdProposalId = result.createProposal.proposalId;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal1.title,
            abstract: proposal1.abstract,
            proposerId: initialDBData.users.user1.id,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposalPk],
            instrumentIds: [createdInstrument1Id],
          });
        }
      });
    });

    it('Facility Member should only be able to see instruments on its facility', () => {
      cy.createFacility({
        name: facilityName2,
        shortCode: facilityShortCode2,
      }).then((facility) => {
        cy.createInstrument({
          name: instrument2.name,
          shortCode: instrument2.shortCode,
          description: instrument2.description,
          managerUserId: scientist1.id,
        }).then((instrument) => {
          cy.addInstrumentToFacility({
            instrumentIds: [instrument.createInstrument.id],
            facilityId: facility.createFacility.id,
          });
        });
      });

      cy.login('user1', initialDBData.roles.facilityMember);
      cy.visit('/Facility');
      cy.contains(facilityName)
        .parent()
        .get('[aria-label="Detail panel visibility toggle"]')
        .first()
        .click();
      cy.contains(instrument1.name);

      cy.contains(facilityName2).should('not.exist');
      cy.contains(instrument2.name).should('not.exist');
    });

    it('Facility Member should only be able to see proposals data on its facility', () => {
      cy.login('user1', initialDBData.roles.facilityMember);
      cy.visit('/');

      cy.contains(proposal1.title);

      cy.get('[data-cy="view-proposal"]').click();
    });

    it('Facility Member should be able to filter by facility', () => {
      cy.createFacility({
        name: facilityName2,
        shortCode: facilityShortCode2,
      }).then((facility) => {
        cy.createInstrument({
          name: instrument2.name,
          shortCode: instrument2.shortCode,
          description: instrument2.description,
          managerUserId: scientist1.id,
        }).then((instrument) => {
          createdInstrument2Id = instrument.createInstrument.id;

          cy.assignInstrumentToCall({
            callId: initialDBData.call.id,
            instrumentFapIds: [{ instrumentId: createdInstrument2Id }],
          });

          cy.addInstrumentToFacility({
            instrumentIds: [createdInstrument2Id],
            facilityId: facility.createFacility.id,
          });
          cy.addUserToFacility({
            userIds: [scientist1.id],
            facilityId: facility.createFacility.id,
          });
        });
      });

      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal) {
          const createdProposalPk = result.createProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposalPk,
            title: proposal1.title,
            abstract: proposal1.abstract,
          });

          cy.assignProposalsToInstruments({
            proposalPks: [createdProposalPk],
            instrumentIds: [createdInstrument2Id],
          });
        }
      });

      cy.login('user1', initialDBData.roles.facilityMember);
      cy.visit('/');

      cy.get('#facility-select').click();
      cy.contains(facilityShortCode).click();

      cy.contains(proposal1.title);
      cy.contains(proposal2.title).should('not.exist');
    });

    it('Facility Member should be able to download proposal PDFs', () => {
      cy.login('user1', initialDBData.roles.facilityMember);
      cy.visit('/');

      cy.contains(proposal1.title).parent().find('[type="checkbox"]').click();
      cy.get('[data-cy="download-proposals"]').click();

      cy.contains('Proposal(s)').click();
      cy.contains('Download as single file').click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposal1.title
      );

      const currentYear = new Date().getFullYear();
      const downloadedFileName = `${createdProposalId}_${initialDBData.users.user1.lastName}_${currentYear}.pdf`;
      const downloadsFolder = Cypress.config('downloadsFolder');
      const downloadFilePath = `${downloadsFolder}/${downloadedFileName}`;

      cy.readFile(downloadFilePath).should('exist');
    });
  });
});
