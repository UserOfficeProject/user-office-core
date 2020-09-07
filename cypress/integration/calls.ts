/// <reference types="Cypress" />
/// <reference types="../types" />

context('Calls tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(500);
  });

  it('A user should not be able to see/visit calls', () => {
    cy.login('user');

    cy.should('not.contain', 'Calls');

    cy.get('[data-cy="user-menu-items"]')
      .find('.MuiListItem-root')
      .should('have.length', 3);

    cy.visit('/CallPage');
    cy.contains('Your proposals');
  });

  it('A user-officer should be able to add a call', () => {
    const shortCode = faker.random.word().split(' ')[0]; // faker random word is buggy, it ofter returns phrases

    const startDate = faker.date
      .past()
      .toISOString()
      .slice(0, 10);

    const endDate = faker.date
      .future()
      .toISOString()
      .slice(0, 10);

    cy.login('officer');

    cy.contains('Proposals');

    cy.contains('Calls').click();

    cy.get('[data-cy=add-call]').click();

    cy.get('[data-cy=short-code] input')
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input').clear();
    cy.get('[data-cy=start-date] input')
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input').clear();
    cy.get('[data-cy=end-date] input')
      .type(endDate)
      .should('have.value', endDate);

    cy.contains('Next').click();

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.contains('Next').click();

    cy.get('[data-cy=cycle-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="submit"]').click();

    cy.wait(500);

    cy.contains(shortCode);
  });

  it('A user-officer should be able to edit a call', () => {
    const shortCode = faker.random.word().split(' ')[0]; // faker random word is buggy, it ofter returns phrases

    const startDate = faker.date
      .past()
      .toISOString()
      .slice(0, 10);

    const endDate = faker.date
      .future()
      .toISOString()
      .slice(0, 10);

    cy.login('officer');

    cy.contains('Proposals');

    cy.contains('Calls').click();

    cy.get('[title="Edit Call"]')
      .first()
      .click();

    cy.get('[data-cy=short-code] input').clear();
    cy.get('[data-cy=short-code] input')
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input').clear();
    cy.get('[data-cy=start-date] input')
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input').clear();
    cy.get('[data-cy=end-date] input')
      .type(endDate)
      .should('have.value', endDate);

    cy.contains('Next').click();

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.contains('Next').click();

    cy.get('[data-cy=cycle-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="submit"]').click();

    cy.wait(500);

    cy.contains(shortCode);
  });

  it('A user-officer should be able to assign instrument/s to a call', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.words(1);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.wait(1000);

    cy.contains('Calls').click();

    cy.get('[title="Assign Instrument"]')
      .first()
      .click();

    cy.wait(1000);
    cy.get('[type="checkbox"]')
      .eq(1)
      .check();

    cy.contains('Assign instrument').click();

    cy.wait(1000);

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[title="Delete"]').should('exist');

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .should('have.length', 5);
  });

  it('A user-officer should not be able to set negative availability time on instrument per call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.get('[data-cy="availability-time"]').type('-10');

    cy.get('[title="Save"]')
      .first()
      .click();

    cy.wait(1000);

    cy.contains('Time available must be positive number');
  });

  it('A user-officer should be able to set availability time on instrument per call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.get('[data-cy="availability-time"]').type('10');

    cy.get('[title="Save"]')
      .first()
      .click();

    cy.wait(1000);

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).to.be.equal('10');
      });
  });

  it('A user-officer should be able to remove instrument from a call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[title="Delete"]')
      .first()
      .click();

    cy.get('[title="Save"]').click();

    cy.wait(1000);

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="call-instrument-assignments-table"]')
      .find('tbody td')
      .last()
      .then(element => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });
});
