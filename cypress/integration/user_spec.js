/// <reference types="Cypress" />
const faker = require("faker");

context("User tests", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  // Login details
  const userName = faker.internet.userName();
  const password = faker.internet.password();

  // Personal details
  const title = "Mr.";
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const middleName = faker.name.firstName();
  const birthDate = faker.date
    .past()
    .toISOString()
    .slice(0, 10);

  //Organization detail
  const organisation = faker.company.companyName();
  const department = faker.commerce.department();
  const orgAddress = faker.address.streetAddress();
  const position = faker.name.jobTitle();

  //Contact details
  const email = faker.internet.email();
  const telephone = faker.phone.phoneNumber();
  const telephoneAlt = faker.phone.phoneNumber();

  it("A user should be able to create a new account", () => {
    cy.get("[data-cy=create-account]").click();

    // Login details
    cy.get("[data-cy=username] input")
      .type(userName)
      .should("have.value", userName);

    cy.get("[data-cy=password] input")
      .type(password)
      .should("have.value", password);

    // Personal details
    cy.get("#select-user_title").click();
    
    cy.contains("Mr.").click();

    cy.get("[data-cy=firstname] input")
      .type(firstName)
      .should("have.value", firstName);

    cy.get("[data-cy=middlename] input")
      .type(middleName)
      .should("have.value", middleName);

    cy.get("[data-cy=lastname] input")
      .type(lastName)
      .should("have.value", lastName);

    cy.get("[data-cy=preferredname] input")
      .type(firstName)
      .should("have.value", firstName);

    cy.get("#select-gender").click();

    cy.contains("Male").click();

    cy.get("#select-nationality").click();

    cy.contains("Swedish").click();

    cy.get("[data-cy=birthdate] input")
      .type(birthDate)
      .should("have.value", birthDate);

    //Organization details
    cy.get("[data-cy=orcid] input")
      .type("0000-0000-0000-0000")
      .should("have.value", "0000-0000-0000-0000");

    cy.get("[data-cy=organisation] input")
      .type(organisation)
      .should("have.value", organisation);

    cy.get("[data-cy=department] input")
      .type(department)
      .should("have.value", department);

    cy.get("[data-cy=organisation-address] input")
      .type(orgAddress)
      .should("have.value", orgAddress);

    cy.get("[data-cy=position] input")
      .type(position)
      .should("have.value", position);

    //Contact details
    cy.get("[data-cy=email] input")
      .type(email)
      .should("have.value", email);

    cy.get("[data-cy=telephone] input")
      .type(telephone)
      .should("have.value", telephone);

    cy.get("[data-cy=telephone-alt] input")
      .type(telephoneAlt)
      .should("have.value", telephoneAlt);

    //Submit
    cy.get("[data-cy=submit]").click();

    //Check redirect to Sign in page
    cy.contains("Sign in");
  });

  it("A user should be able to login and out", () => {
    cy.get("[data-cy=input-username] input")
      .type(userName)
      .should("have.value", userName);

    cy.get("[data-cy=input-password] input")
      .type(password)
      .should("have.value", password);

    cy.get("[data-cy=submit]").click();

    cy.contains("Your proposals");

    cy.contains("Logout").click();

    cy.contains("Sign in");
  });
});
