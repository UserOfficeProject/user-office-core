import faker from 'faker';

context('Calls tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  it('A user should not be able to see/visit calls', () => {
    cy.login('user');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

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

    cy.contains('Create').click();

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

    cy.get('[title="Edit"]')
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

    cy.get('[title="Delete"]')
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
      .find('td')
      .last()
      .then(element => {
        expect(element.text()).to.be.equal(selectedProposalWorkflow);
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
      .last()
      .then(element => {
        expect(element.text()).to.be.equal('-');
      });
  });
});
