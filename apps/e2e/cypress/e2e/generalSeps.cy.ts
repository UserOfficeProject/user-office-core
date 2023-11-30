import { faker } from '@faker-js/faker';
import { UserRole, FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

function searchMuiTableAsync(search: string) {
  cy.get('[data-cy="co-proposers"] [aria-label="Search"]').type(search);

  cy.get('[role="progressbar"]').should('exist');
  cy.get('[role="progressbar"]').should('not.exist');
}

const sepMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user1,
  reviewer: initialDBData.users.reviewer,
};

const sep1 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

const sep2 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
  gradeGuide: faker.random.words(8),
};

context('General scientific evaluation panel tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SEP_REVIEW)) {
        this.skip();
      }
    });
  });

  it('User should not be able to see SEPs page', () => {
    cy.login('user1');
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

    cy.get('@userMenuItems').should('not.contain', 'SEPs');
  });

  describe('SEP basic tests as user officer role', () => {
    beforeEach(function () {
      cy.login('officer');
      cy.visit('/');
    });

    it('Officer should be able to assign SEP Reviewer role', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.contains('People').click();
      searchMuiTableAsync(sepMembers.chair.lastName);
      cy.get('[aria-label="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[data-cy="role-modal"] input[aria-label="Search"]').type(
        'SEP Reviewer'
      );
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
      cy.contains('People').click();

      searchMuiTableAsync(sepMembers.secretary.lastName);
      cy.get('[aria-label="Edit user"]').click();
      cy.get('[cy-data="user-page"]').contains('Settings').click();
      cy.contains('Add role').click();

      cy.get('[data-cy="role-modal"] input[aria-label="Search"]').type(
        'SEP Reviewer'
      );
      cy.get('[role="dialog"] input[type="checkbox"]').first().click();

      cy.contains('Update').click();
      cy.notification({
        text: 'Roles updated successfully!',
        variant: 'success',
      });
    });

    it('Officer should be able to delete SEP', () => {
      cy.contains('SEPs').click();
      cy.get('[aria-label="Delete"]').last().click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP deleted successfully',
      });
    });

    it('Officer should be able to create SEP', () => {
      const { code, description } = sep1;

      cy.contains('SEPs').click();
      cy.contains('Create').click();
      cy.get('#code').type(code);
      cy.get('#description').type(description);

      cy.get('[data-cy="sepActive"] input').should('be.checked');
      cy.get('[data-cy="sepActive"] input').uncheck();
      cy.get('[data-cy="sepActive"] input').should('not.be.checked');
      cy.get('[data-cy="sepActive"] input').check();
      cy.get('[data-cy="sepActive"] input').should('be.checked');

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'SEP created successfully' });
      cy.contains('Update SEP');
      cy.get('#code').should('contain.value', code);
      cy.get('#description').should('contain.value', description);
    });

    it('Officer should be able to edit existing SEP', () => {
      cy.createSep({
        code: sep1.code,
        description: sep1.description,
        numberRatingsRequired: 2,
        gradeGuide: sep1.gradeGuide,
        active: true,
      });
      const newCode = faker.random.words(3);
      const newDescription = faker.random.words(8);

      cy.contains('SEPs').click();
      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();
      cy.get('#code').type(newCode);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'SEP updated successfully' });

      cy.contains('SEPs').click();

      cy.get('[data-cy="SEPs-table"]').as('SEPsTable');

      cy.get('@SEPsTable').should('contain', newCode);
      cy.get('@SEPsTable').should('contain', newDescription);
    });

    it('Should be able to download SEP as Excel file', () => {
      cy.contains('SEPs').click();

      const token = window.localStorage.getItem('token');

      cy.request({
        url: '/download/xlsx/sep/1/call/1',
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

  describe('SEP members manipulation tests as user officer role', () => {
    let createdSepId: number;

    beforeEach(function () {
      cy.login('officer');
      cy.visit('/');
      cy.createSep({
        code: sep1.code,
        description: sep1.description,
        numberRatingsRequired: 2,
        gradeGuide: sep1.gradeGuide,
        active: true,
      }).then((response) => {
        if (response.createSEP) {
          createdSepId = response.createSEP.id;
        }
      });
    });
    it('Officer should be able to assign SEP Chair and SEP Secretary to existing SEP', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.updateUserRoles({
        id: sepMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      cy.updateUserRoles({
        id: sepMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      let selectedChairUserFirstName = '';
      let selectedChairUserLastName = '';
      let selectedSecretaryUserFirstName = '';
      let selectedSecretaryUserLastName = '';

      cy.contains('SEPs').click();
      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[aria-label="Set SEP Chair"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.chair.lastName);

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
        text: 'SEP chair assigned successfully',
      });

      cy.reload();

      cy.finishedLoading();

      cy.get('input[id="SEPChair"]').should((element) => {
        expect(element.val()).to.equal(
          `${selectedChairUserFirstName} ${selectedChairUserLastName}`
        );
      });

      cy.get('[aria-label="Set SEP Secretary"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.secretary.lastName);

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
        text: 'SEP secretary assigned successfully',
      });

      cy.contains('Logs').click();

      cy.contains('SEP_MEMBERS_ASSIGNED');

      cy.contains('Members').click();

      cy.get('input[id="SEPSecretary"]').should((element) => {
        expect(element.val()).to.contain(
          `${selectedSecretaryUserFirstName} ${selectedSecretaryUserLastName}`
        );
      });
    });

    it('Officer should be able to remove assigned SEP Chair and SEP Secretary from existing SEP', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.updateUserRoles({
        id: sepMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      cy.updateUserRoles({
        id: sepMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.chair.id,
          roleId: UserRole.SEP_CHAIR,
        },
      });
      cy.assignChairOrSecretary({
        assignChairOrSecretaryToSEPInput: {
          sepId: createdSepId,
          userId: sepMembers.secretary.id,
          roleId: UserRole.SEP_SECRETARY,
        },
      });
      cy.contains('SEPs').click();
      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Remove SEP chair"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.get('[aria-label="Remove SEP secretary"]').click();

      cy.get('[data-cy="confirm-ok"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });
    });

    it('Officer should be able to assign SEP Reviewers to existing SEP', () => {
      cy.contains('SEPs').click();
      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.lastName);

      cy.contains('Logs').click();

      cy.contains('SEP_MEMBERS_ASSIGNED');
    });

    it('Officer should be able to remove SEP Reviewers from existing SEP', () => {
      cy.assignReviewersToSep({
        sepId: createdSepId,
        memberIds: [sepMembers.reviewer.id],
      });
      cy.contains('SEPs').click();
      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[aria-label="Remove reviewer"]').click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.contains('Logs').click();

      cy.finishedLoading();

      cy.contains('SEP_MEMBER_REMOVED');

      cy.contains('Members').click();

      cy.get('[data-cy="sep-reviewers-table"]')
        .find('tbody td')
        .should('have.length', 1);

      cy.get('[data-cy="sep-reviewers-table"]')
        .find('tbody td')
        .first()
        .then((element) => {
          expect(element.text()).to.be.equal('No records to display');
        });
    });
  });

  describe('SEP tests as SEP Chair role', () => {
    let createdSepId: number;

    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.updateUserRoles({
        id: sepMembers.chair.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      cy.createSep({
        code: sep1.code,
        description: sep1.description,
        gradeGuide: sep1.gradeGuide,
        numberRatingsRequired: 2,
        active: true,
      }).then((response) => {
        if (response.createSEP) {
          createdSepId = response.createSEP.id;

          cy.assignChairOrSecretary({
            assignChairOrSecretaryToSEPInput: {
              sepId: createdSepId,
              userId: sepMembers.chair.id,
              roleId: UserRole.SEP_CHAIR,
            },
          });
          cy.login(sepMembers.chair);
        }
      });
    });

    it('SEP Chair should not be able to modify SEP Chair and SEP Secretary', () => {
      cy.changeActiveRole(initialDBData.roles.sepChair);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Set SEP Chair"]').should('not.exist');
      cy.get('[aria-label="Set SEP Secretary"]').should('not.exist');

      cy.get('[aria-label="Remove SEP chair"]').should('not.exist');
      cy.get('[aria-label="Remove SEP secretary"]').should('not.exist');
    });

    it('SEP Chair should be able to modify SEP Reviewers', () => {
      cy.changeActiveRole(initialDBData.roles.sepChair);

      cy.visit('/');

      cy.contains('SEPs').click();

      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.lastName);

      cy.closeNotification();

      cy.get('[aria-label="Remove reviewer"]').click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.get('body').should('not.contain', sepMembers.reviewer.lastName);
      cy.contains('No records to display');
    });

    it('SEP Chair should only see SEPs where they have SEP Chair role', () => {
      cy.createSep({
        code: sep2.code,
        description: sep2.description,
        numberRatingsRequired: 2,
        gradeGuide: sep2.gradeGuide,
        active: true,
      });

      cy.changeActiveRole(initialDBData.roles.sepChair);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code);
      cy.contains(sep2.code).should('not.exist');
    });
  });

  describe('SEP tests as SEP Secretary', () => {
    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.updateUserRoles({
        id: sepMembers.secretary.id,
        roles: [initialDBData.roles.user, initialDBData.roles.sepReviewer],
      });
      cy.createSep({
        code: sep1.code,
        description: sep1.description,
        numberRatingsRequired: 2,
        gradeGuide: sep2.gradeGuide,
        active: true,
      }).then((response) => {
        if (response.createSEP) {
          const createdSepId = response.createSEP.id;

          cy.assignChairOrSecretary({
            assignChairOrSecretaryToSEPInput: {
              sepId: createdSepId,
              userId: sepMembers.secretary.id,
              roleId: UserRole.SEP_SECRETARY,
            },
          });
          cy.login(sepMembers.secretary);
        }
      });
    });

    it('SEP Secretary should not be able to modify SEP Chair and SEP Secretary', () => {
      cy.changeActiveRole(initialDBData.roles.sepSecretary);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.finishedLoading();

      cy.get('[aria-label="Set SEP Chair"]').should('not.exist');
      cy.get('[aria-label="Set SEP Secretary"]').should('not.exist');

      cy.get('[aria-label="Remove SEP Chair"]').should('not.exist');
      cy.get('[aria-label="Remove SEP Secretary"]').should('not.exist');
    });

    it('SEP Secretary should be able to modify SEP Reviewers', () => {
      cy.changeActiveRole(initialDBData.roles.sepSecretary);

      cy.visit('/');

      cy.contains('SEPs').click();

      cy.contains(sep1.code)
        .closest('tr')
        .find('button[aria-label="Edit"]')
        .click();

      cy.contains('Members').click();

      cy.get('[data-cy="add-member"]').click();

      cy.finishedLoading();

      searchMuiTableAsync(sepMembers.reviewer.lastName);

      cy.get('input[type="checkbox"]').eq(1).click();

      cy.contains('Update').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member assigned successfully',
      });

      cy.contains(sepMembers.reviewer.lastName);

      cy.closeNotification();

      cy.get('[aria-label="Remove reviewer"]').click();
      cy.get('[aria-label="Save"]').click();

      cy.notification({
        variant: 'success',
        text: 'SEP member removed successfully',
      });

      cy.get('body').should('not.contain', sepMembers.reviewer.lastName);
      cy.contains('No records to display');
    });

    it('SEP Secretary should only see SEPs where they have SEP Secretary role', () => {
      cy.changeActiveRole(initialDBData.roles.sepSecretary);

      cy.visit('/');

      cy.finishedLoading();

      cy.contains('SEPs').click();

      cy.contains(sep1.code);
      cy.contains(sep2.code).should('not.exist');
    });
  });
});
