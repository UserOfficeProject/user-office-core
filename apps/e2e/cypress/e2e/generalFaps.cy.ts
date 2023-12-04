import { faker } from '@faker-js/faker';
import {
  UserRole,
  FeatureId,
  Event,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

function searchMuiTableAsync(search: string) {
  cy.get('[data-cy="co-proposers"] [aria-label="Search"]').type(search);

  cy.get('[role="progressbar"]').should('exist');
  cy.get('[role="progressbar"]').should('not.exist');
}

const fapMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user1,
  reviewer: initialDBData.users.reviewer,
};

const fap1 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

const fap2 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

context('General scientific evaluation panel tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.FAP_REVIEW)) {
        this.skip();
      }
    });
  });

  it('User should not be able to see Faps page', () => {
    cy.login('user1');
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

    cy.get('@userMenuItems').should('not.contain', 'FAPs');
  });

  describe('Fap basic tests as user officer role', () => {
    beforeEach(function () {
      cy.login('officer');
      cy.visit('/');
    });

    it('Officer should be able to assign Fap Reviewer role', () => {
      cy.contains('People').click();
      searchMuiTableAsync(fapMembers.chair.lastName);
      cy.get('[aria-label="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[data-cy="role-modal"] input[aria-label="Search"]').type(
        'Fap Reviewer'
      );
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
      cy.contains('People').click();

      searchMuiTableAsync(fapMembers.secretary.lastName);
      cy.get('[aria-label="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[data-cy="role-modal"] input[aria-label="Search"]').type(
        'Fap Reviewer'
      );
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
    });

    it('Officer should be able to delete Fap', () => {
      cy.contains('FAPs').click();
      cy.get('[aria-label="Delete"]').last().click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Fap deleted successfully' });
    });

    it('Officer should be able to create Fap', () => {
      const { code, description } = fap1;

      cy.contains('FAPs').click();
      cy.contains('Create').click();
      cy.get('#code').type(code);
      cy.get('#description').type(description);

      cy.get('[data-cy="fapActive"] input').should('be.checked');
      cy.get('[data-cy="fapActive"] input').uncheck();
      cy.get('[data-cy="fapActive"] input').should('not.be.checked');
      cy.get('[data-cy="fapActive"] input').check();
      cy.get('[data-cy="fapActive"] input').should('be.checked');

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'Fap created successfully' });
      cy.contains('Update Fap');
      cy.get('#code').should('contain.value', code);
      cy.get('#description').should('contain.value', description);
    });

    it('Officer should be able to edit existing Fap', () => {
      cy.createFap({
        code: fap1.code,
        description: fap1.description,
        numberRatingsRequired: 2,
        gradeGuide: fap1.gradeGuide,
        active: true,
      });
      const newCode = faker.random.words(3);
      const newDescription = faker.random.words(8);

      cy.contains('FAPs').click();
      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();
      cy.get('#code').type(newCode);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'Fap updated successfully' });

      cy.contains('FAPs').click();

      cy.get('[data-cy="Faps-table"]').as('FapsTable');

      cy.get('@FapsTable').should('contain', newCode);
      cy.get('@FapsTable').should('contain', newDescription);
    });

    it('Should be able to download Fap as Excel file', () => {
      cy.contains('FAPs').click();

      const token = window.localStorage.getItem('token');

      cy.request({
        url: '/download/xlsx/fap/1/call/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        expect(response.headers['content-type']).to.be.equal(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        expect(response.status).to.be.equal(200);
      });
    });
  });

  describe('Fap members manipulation tests as user officer role', () => {
    let createdFapId: number;

    beforeEach(function () {
      cy.login('officer');
      cy.visit('/');
      cy.createFap({
        code: fap1.code,
        description: fap1.description,
        numberRatingsRequired: 2,
        gradeGuide: fap1.gradeGuide,
        active: true,
      }).then((response) => {
        if (response.createFap) {
          createdFapId = response.createFap.id;
        }
      });
    });
    it('Officer should be able to assign Fap Chair and Fap Secretary to existing Fap', () => {
      cy.updateUserRoles({
        id: fapMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      cy.updateUserRoles({
        id: fapMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      let selectedChairUserFirstName = '';
      let selectedChairUserLastName = '';
      let selectedSecretaryUserFirstName = '';
      let selectedSecretaryUserLastName = '';

      cy.contains('FAPs').click();
      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[aria-label="Set Fap Chair"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(fapMembers.chair.lastName);

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .first()
        .then((element) => {
          selectedChairUserFirstName = element.text();
        });

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .eq(1)
        .then((element) => {
          selectedChairUserLastName = element.text();
        });

      cy.get('[aria-label="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'Fap chair assigned successfully',
      });

      cy.reload();

      cy.finishedLoading();

      cy.get('input[id="FapChair"]').should((element) => {
        expect(element.val()).to.equal(
          `${selectedChairUserFirstName} ${selectedChairUserLastName}`
        );
      });

      cy.get('[aria-label="Set Fap Secretary"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(fapMembers.secretary.lastName);

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .first()
        .then((element) => {
          selectedSecretaryUserFirstName = element.text();
        });

      cy.get('[role="dialog"] table tbody tr')
        .first()
        .find('td.MuiTableCell-alignLeft')
        .eq(1)
        .then((element) => {
          selectedSecretaryUserLastName = element.text();
        });

      cy.get('[aria-label="Select user"]').first().click();

      cy.notification({
        variant: 'success',
        text: 'Fap secretary assigned successfully',
      });

      cy.contains('Logs').click();

      cy.contains(Event.FAP_MEMBERS_ASSIGNED);

      cy.contains('Members').click();

      cy.get('input[id="FapSecretary"]').should((element) => {
        expect(element.val()).to.contain(
          `${selectedSecretaryUserFirstName} ${selectedSecretaryUserLastName}`
        );
      });
    });

    it('Officer should be able to remove assigned Fap Chair and Fap Secretary from existing Fap', () => {
      cy.updateUserRoles({
        id: fapMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      cy.updateUserRoles({
        id: fapMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.chair.id,
          roleId: UserRole.FAP_CHAIR,
        },
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToFapInput: {
          fapId: createdFapId,
          userId: fapMembers.secretary.id,
          roleId: UserRole.FAP_SECRETARY,
        },
      });
      cy.contains('FAPs').click();
      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Remove Fap chair"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member removed successfully',
      });

      cy.get('[aria-label="Remove Fap secretary"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member removed successfully',
      });
    });

    it('Officer should be able to assign Fap Reviewers to existing Fap', () => {
      cy.contains('FAPs').click();
      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(fapMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member assigned successfully',
      });

      cy.contains(fapMembers.reviewer.lastName);

      cy.contains('Logs').click();

      cy.contains(Event.FAP_MEMBERS_ASSIGNED);
    });

    it('Officer should be able to remove Fap Reviewers from existing Fap', () => {
      cy.assignReviewersToFap({
        fapId: createdFapId,
        memberIds: [fapMembers.reviewer.id],
      });
      cy.contains('FAPs').click();
      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[aria-label="Remove reviewer"]').click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member removed successfully',
      });

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains(Event.FAP_MEMBER_REMOVED);

      cy.contains('Members').click();

      cy.get('[data-cy="fap-reviewers-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="fap-reviewers-table"]')
        .find('tbody td')
        .first()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });
  });

  describe('Fap tests as Fap Chair role', () => {
    let createdFapId: number;

    beforeEach(function () {
      cy.updateUserRoles({
        id: fapMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      cy.createFap({
        code: fap1.code,
        description: fap1.description,
        gradeGuide: fap1.gradeGuide,
        numberRatingsRequired: 2,
        active: true,
      }).then((response) => {
        if (response.createFap) {
          createdFapId = response.createFap.id;

          cy.assignChairOrSecretary({
            assignChairOrSecretaryToFapInput: {
              fapId: createdFapId,
              userId: fapMembers.chair.id,
              roleId: UserRole.FAP_CHAIR,
            },
          });
          cy.login(fapMembers.chair);
        }
      });
    });

    it('Fap Chair should not be able to modify Fap Chair and Fap Secretary', () => {
      cy.changeActiveRole(initialDBData.roles.fapChair);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('FAPs').click();

      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Set Fap Chair"]').should('not.exist');
      cy.get('[aria-label="Set Fap Secretary"]').should('not.exist');

      cy.get('[aria-label="Remove Fap chair"]').should('not.exist');
      cy.get('[aria-label="Remove Fap secretary"]').should('not.exist');
    });

    it('Fap Chair should be able to modify Fap Reviewers', () => {
      cy.changeActiveRole(initialDBData.roles.fapChair);

      cy.visit('/');

      cy.contains('FAPs').click();

      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(fapMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member assigned successfully',
      });

      cy.contains(fapMembers.reviewer.lastName);

      cy.closeNotification();

      cy.get('[aria-label="Remove reviewer"]').click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member removed successfully',
      });

      cy.get('body').should('not.contain', fapMembers.reviewer.lastName);
      cy.contains('No records to display');
    });

    it('Fap Chair should only see Faps where they have Fap Chair role', () => {
      cy.createFap({
        code: fap2.code,
        description: fap2.description,
        numberRatingsRequired: 2,
        gradeGuide: fap2.gradeGuide,
        active: true,
      });

      cy.changeActiveRole(initialDBData.roles.fapChair);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('FAPs').click();

      cy.contains(fap1.code);
      cy.contains(fap2.code).should('not.exist');
    });
  });

  describe('Fap tests as Fap Secretary', () => {
    beforeEach(function () {
      cy.updateUserRoles({
        id: fapMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.fapReviewer],
      });
      cy.createFap({
        code: fap1.code,
        description: fap1.description,
        numberRatingsRequired: 2,
        gradeGuide: fap2.gradeGuide,
        active: true,
      }).then((response) => {
        if (response.createFap) {
          const createdFapId = response.createFap.id;

          cy.assignChairOrSecretary({
            assignChairOrSecretaryToFapInput: {
              fapId: createdFapId,
              userId: fapMembers.secretary.id,
              roleId: UserRole.FAP_SECRETARY,
            },
          });
          cy.login(fapMembers.secretary);
        }
      });
    });

    it('Fap Secretary should not be able to modify Fap Chair and Fap Secretary', () => {
      cy.changeActiveRole(initialDBData.roles.fapSecretary);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('FAPs').click();

      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Set Fap Chair"]').should('not.exist');
      cy.get('[aria-label="Set Fap Secretary"]').should('not.exist');

      cy.get('[aria-label="Remove Fap Chair"]').should('not.exist');
      cy.get('[aria-label="Remove Fap Secretary"]').should('not.exist');
    });

    it('Fap Secretary should be able to modify Fap Reviewers', () => {
      cy.changeActiveRole(initialDBData.roles.fapSecretary);

      cy.visit('/');

      cy.contains('FAPs').click();

      cy.contains(fap1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(fapMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member assigned successfully',
      });

      cy.contains(fapMembers.reviewer.lastName);

      cy.closeNotification();

      cy.get('[aria-label="Remove reviewer"]').click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'Fap member removed successfully',
      });

      cy.get('body').should('not.contain', fapMembers.reviewer.lastName);
      cy.contains('No records to display');
    });

    it('Fap Secretary should only see Faps where they have Fap Secretary role', () => {
      cy.changeActiveRole(initialDBData.roles.fapSecretary);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('FAPs').click();

      cy.contains(fap1.code);
      cy.contains(fap2.code).should('not.exist');
    });
  });
});
