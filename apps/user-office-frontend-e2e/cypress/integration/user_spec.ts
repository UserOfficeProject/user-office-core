import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('User tests', () => {
  // Login details
  const password = 'aslaksjdajsl9#ASdADSlk!';

  // Personal details
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const birthDate = DateTime.fromJSDate(faker.date.past(80, '2002-01-01'));

  //Organization detail
  const department = faker.commerce.department();
  const position = faker.name.jobTitle();

  //Contact details
  const email = faker.internet.email();
  const telephone = faker.phone.phoneNumber('0##########');

  beforeEach(() => {
    cy.resetDB();

    cy.visit('/SignUp?code=WRMVXa');
  });

  it('A user should be able to create a new account with mandatory fields only', () => {
    const birthDateValue = birthDate.toFormat(
      initialDBData.getFormats().dateFormat
    );
    cy.get('[data-cy=email] input').type(email).should('have.value', email);

    cy.get('[data-cy=password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=confirmPassword] input')
      .type(password)
      .should('have.value', password);

    // Personal details
    cy.get('[data-cy="title"]').click();
    cy.contains('Prof.').click();
    cy.get('[data-cy=firstname] input')
      .clear()
      .type(firstName)
      .should('have.value', firstName);

    cy.get('[data-cy=lastname] input')
      .clear()
      .type(lastName)
      .should('have.value', lastName);

    cy.get('[data-cy="gender"]').click();

    cy.contains('Male').click();

    cy.get('[data-cy="nationality"]').click();

    cy.contains('Swedish').click();

    cy.get('[data-cy=birthdate] input')
      .clear()
      .type(birthDateValue)
      .should('have.value', birthDateValue);

    //Organization details
    cy.get('[data-cy="organisation"]').click();

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
      .blur()
      .should('have.value', telephone);

    cy.get('[data-cy=privacy-agreement] input').click();

    cy.get('[data-cy=cookie-policy] input').click();

    //Submit
    cy.get('[data-cy=submit]').click();

    cy.contains('Click here for sign in').click();
    //Check redirect to Sign in page
    cy.contains('Sign in');
  });

  it('Error message should be shown if confirm password does not match password', () => {
    cy.get('[data-cy=password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=confirmPassword] input')
      .type(password + 'test')
      .should('have.value', password + 'test');

    cy.get('body').click();

    cy.get('[data-cy=confirmPassword] .Mui-error')
      .should('exist')
      .and('include.text', 'Confirm password does not match password');
  });

  it('A user should be able to login and out', () => {
    cy.createUser({
      user_title: faker.name.prefix(),
      firstname: firstName,
      lastname: lastName,
      password: password,
      orcid: '0000-0000-0000-0000',
      orcidHash: 'WRMVXa',
      refreshToken: '-',
      gender: '-',
      nationality: 1,
      birthdate: birthDate,
      organisation: 1,
      department: department,
      position: position,
      email: email,
      telephone: telephone,
    });
    cy.contains('Have an account? Sign In').click();

    cy.get('[data-cy=input-email] input')
      .type(email)
      .should('have.value', email);

    cy.get('[data-cy=input-password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=submit]').click();

    cy.contains('My proposals');

    cy.logout();

    cy.contains('Sign in');
  });

  it('A user should be able to create a new account by filling in optional fields also', () => {
    // Login details
    const password = 'aslaksjdajsl9#ASdADSlk!';

    // Personal details
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    const middleName = faker.name.firstName();
    const preferredName = faker.name.firstName();
    const birthDateValue = birthDate.toFormat(
      initialDBData.getFormats().dateFormat
    );

    //Organization detail
    const department = faker.commerce.department();
    const position = faker.name.jobTitle();

    //Contact details
    const email = faker.internet.email();
    const telephone = faker.phone.phoneNumber('0##########');
    const telephoneAlt = faker.phone.phoneNumber('0##########');

    cy.get('[data-cy=email] input').type(email).should('have.value', email);

    cy.get('[data-cy=password] input')
      .type(password)
      .should('have.value', password);

    cy.get('[data-cy=confirmPassword] input')
      .type(password)
      .should('have.value', password);

    // Personal details
    cy.get('[data-cy="title"]').click();
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
      .type(preferredName)
      .should('have.value', preferredName);

    cy.get('[data-cy="gender"]').click();

    cy.contains('Male').click();

    cy.get('[data-cy="nationality"]').click();

    cy.contains('Swedish').click();

    cy.get('[data-cy=birthdate] input')
      .clear()
      .type(birthDateValue)
      .should('have.value', birthDateValue);

    //Organization details
    cy.get('[data-cy="organisation"]').click();

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
});
