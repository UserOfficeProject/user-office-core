import faker from 'faker';

context('Calls tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  const call1 = {
    shortCode: faker.random.alphaNumeric(15),
    startDate: faker.date
      .past()
      .toISOString()
      .slice(0, 10),
    endDate: faker.date
      .future()
      .toISOString()
      .slice(0, 10),
  };

  const call2 = {
    shortCode: faker.random.alphaNumeric(15),
    startDate: faker.date
      .past()
      .toISOString()
      .slice(0, 10),
    endDate: faker.date
      .future()
      .toISOString()
      .slice(0, 10),
  };

  it('A user should not be able to see/visit calls', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.should('not.contain', 'Calls');

    cy.get('[data-cy="user-menu-items"]')
      .find('.MuiListItem-root')
      .should('have.length', 4);

    cy.visit('/CallPage');
    cy.contains('My proposals');
  });

  it('A user-officer should not be able go to next step or create call if there is validation error', () => {
    const shortCode = faker.random.alphaNumeric(15);

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

    cy.contains('Create').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="short-code"] input').should('be.focused');
    cy.get('[data-cy="short-code"] input:invalid').should('have.length', 1);

    cy.get('[data-cy=short-code] input')
      .type(shortCode)
      .should('have.value', shortCode);

    cy.get('[data-cy=start-date] input').clear();

    cy.get('[data-cy="next-step"]').click();

    cy.contains('Invalid Date');

    cy.get('[data-cy=start-date] input')
      .type(startDate)
      .should('have.value', startDate);

    cy.get('[data-cy=end-date] input').clear();
    cy.get('[data-cy=end-date] input')
      .type(endDate)
      .should('have.value', endDate);

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').should('not.exist');

    cy.get('[data-cy="survey-comment"] input').should('be.focused');
    cy.get('[data-cy="survey-comment"] input:invalid').should('have.length', 1);

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.get('[data-cy="cycle-comment"] input').should('be.focused');
    cy.get('[data-cy="cycle-comment"] input:invalid').should('have.length', 1);
  });

  it('A user-officer should be able to create a call', () => {
    const { shortCode, startDate, endDate } = call1;

    cy.login('officer');

    cy.contains('Proposals');

    cy.createCall({
      shortCode,
      startDate,
      endDate,
    });

    cy.contains(shortCode)
      .parent()
      .children()
      .last()
      .should('include.text', '0');
  });

  it('A user-officer should be able to edit a call', () => {
    const { shortCode, startDate, endDate } = call2;

    cy.login('officer');

    cy.contains('Proposals');

    cy.contains('Calls').click();

    // we updating the existing call 'call 1'
    cy.contains('call 1')
      .parent()
      .find('[title="Edit"]')
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

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=survey-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy=cycle-comment] input').type(
      faker.random.word().split(' ')[0]
    );

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains(shortCode);
  });

  it('A user-officer should be able to assign instrument/s to a call', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.alphaNumeric(15);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('Calls').click();

    cy.get('[title="Assign Instrument"]')
      .first()
      .click();

    cy.get('tbody [type="checkbox"]')
      .first()
      .check();

    cy.contains('Assign instrument').click();

    cy.notification({ variant: 'success', text: 'successfully' });

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

    cy.get('[data-cy="call-instrument-assignments-table"] [title="Edit"]')
      .first()
      .click();

    cy.get('[data-cy="availability-time"]').type('-10');

    cy.get('[title="Save"]')
      .first()
      .click();

    cy.notification({ variant: 'error', text: 'must be positive number' });
  });

  it('A user-officer should be able to set availability time on instrument per call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Show Instruments"]')
      .first()
      .click();

    cy.get('[data-cy="call-instrument-assignments-table"] [title="Edit"]')
      .first()
      .click();

    cy.get('[data-cy="availability-time"]').type('10');

    cy.get('[title="Save"]')
      .first()
      .click();

    cy.notification({ variant: 'success', text: 'successfully' });

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

    cy.get('[data-cy="call-instrument-assignments-table"] [title="Delete"]')
      .first()
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

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

  it('A user-officer should be able to add proposal workflow to a call', () => {
    let selectedProposalWorkflow = '';
    const name = faker.random.words(2);
    const description = faker.random.words(5);

    cy.login('officer');

    cy.contains('Settings').click();
    cy.contains('Proposal workflows').click();

    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('#description').type(description);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'created successfully' });

    cy.contains('Calls').click();

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.get('#mui-component-select-proposalWorkflowId').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[role="presentation"] [role="listbox"] li')
      .last()
      .then(element => {
        selectedProposalWorkflow = element.text();
      })
      .click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'Call updated successfully!' });

    cy.get('[data-cy="calls-table"]')
      .find('tbody tr')
      .first()
      .then(element => {
        expect(element.text()).to.include(selectedProposalWorkflow);
      });
  });

  it('A user-officer should be able to remove proposal workflow from a call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.get('#mui-component-select-proposalWorkflowId').click();

    cy.contains('Loading...').should('not.exist');

    cy.contains('None (remove selection)').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="next-step"]').click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'Call updated successfully!' });

    cy.get('[data-cy="calls-table"]')
      .find('tbody tr')
      .first()
      .find('td')
      .eq(6)
      .should('have.text', '-');
  });

  it('A user-officer should be able to remove a call', () => {
    cy.login('officer');

    cy.contains('Calls').click();

    cy.get('[title="Delete"]')
      .last()
      .click();

    cy.get('[title="Save"]').click();

    cy.notification({ variant: 'success', text: 'Call deleted successfully' });
    it('User officer can filter calls by their status', () => {
      cy.login('officer');
      cy.contains('Calls').click();

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]')
        .contains('Active')
        .click();

      cy.finishedLoading();

      cy.contains(call1.shortCode);
      cy.contains(call2.shortCode);

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]')
        .contains('Inactive')
        .click();

      cy.finishedLoading();

      cy.contains('No records to display');
      cy.contains(call1.shortCode).should('not.exist');
      cy.contains(call2.shortCode).should('not.exist');

      cy.get('[data-cy="call-status-filter"]').click();
      cy.get('[role="listbox"]')
        .contains('All')
        .click();

      cy.finishedLoading();

      cy.contains(call1.shortCode);
      cy.contains(call2.shortCode);
    });
  });
});
