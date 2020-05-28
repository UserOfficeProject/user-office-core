/// <reference types="Cypress" />
/// <reference types="../types" />

context('User tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/SignUp?code=WRMVXa');
  });

  afterEach(() => {
    cy.wait(1000);
  });

  // Login details
  const password = 'aslaksjdajsl9#ASdADSlk!';

  // Personal details
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const middleName = faker.name.firstName();
  const birthDate = faker.date
    .past()
    .toISOString()
    .slice(0, 10);

  //Organization detail
  const department = faker.commerce.department();
  const position = faker.name.jobTitle();

  //Contact details
  const email = faker.internet.email();
  const telephone = faker.phone.phoneNumber();
  const telephoneAlt = faker.phone.phoneNumber();

  it('A user should be able to create a new account', () => {
    cy.get('[data-cy=email] input')
      .type(email)
      .should('have.value', email);

    cy.get('[data-cy=password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=confirmPassword] input')
      .type(password)
      .should('have.value', password);

    // Personal details
    cy.get('#mui-component-select-user_title').click();
    cy.contains('Prof.').click();
    cy.get('[data-cy=firstname] input')
      .clear()
      .type(firstName)
      .should('have.value', firstName);

    cy.get('[data-cy=middlename] input')
      .type(middleName)
      .should('have.value', middleName);
    cy.get('[data-cy=lastname] input')
      .clear()
      .type(lastName)
      .should('have.value', lastName);
    cy.get('[data-cy=preferredname] input')
      .type(firstName)
      .should('have.value', firstName);

    cy.get('#mui-component-select-gender').click();

    cy.contains('Male').click();

    cy.get('#mui-component-select-nationality').click();

    cy.contains('Swedish').click();

    cy.get('[data-cy=birthdate] input')
      .type(birthDate)
      .should('have.value', birthDate);

    //Organization details
    cy.get('#mui-component-select-organisation').click();

    cy.contains('Lund University').click();

    cy.get('[data-cy=department] input')
      .type(department)
      .should('have.value', department);

    cy.get('[data-cy=position] input')
      .type(position)
      .should('have.value', position);

    //Contact details

    cy.get('[data-cy=telephone] input')
      .type(telephone)
      .should('have.value', telephone);

    cy.get('[data-cy=telephone-alt] input')
      .type(telephoneAlt)
      .should('have.value', telephoneAlt);

    cy.get('[data-cy=privacy-agreement] input').click();

    cy.get('[data-cy=cookie-policy] input').click();

    //Submit
    cy.get('[data-cy=submit]').click();

    cy.contains('Click here for sign in').click();
    //Check redirect to Sign in page
    cy.contains('Sign in');
  });

  it('A user should be able to login and out', () => {
    cy.contains('Have an account? Sign In').click();

    cy.get('[data-cy=input-email] input')
      .type(email)
      .should('have.value', email);

    cy.get('[data-cy=input-password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=submit]').click();

    cy.contains('Your proposals');

    cy.contains('Logout').click();

    cy.contains('Sign in');
  });
});
