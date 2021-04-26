/**
 * Declare the command types on the global cypress object before you use them.
 * This way we avoid typescript errors and have better overview of the commands.
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Resets database.
       *
       * @returns {typeof resetDB}
       * @memberof Chainable
       * @example
       *    cy.resetDB()
       */
      resetDB: () => void;

      /**
       * Resets the scheduler database
       *
       * @returns {typeof resetSchedulerDB}
       * @memberof Chainable
       * @example
       *    cy.resetSchedulerDB()
       */
      resetSchedulerDB: (includeSeeds?: boolean) => void;

      /**
       * Logs in user with provided credentials
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login('user')
       */
      login: (role: string | { email: string; password: string }) => void;

      /**
       * Expands templates submenu
       *
       * @returns {typeof expandTemplatesSubmenu}
       * @memberof Chainable
       * @example
       *    cy.expandTemplatesSubmenu()
       */
      navigateToTemplatesSubmenu: (submenuName: string) => void;

      /**
       * Logs user out
       *
       * @returns {typeof logout}
       * @memberof Chainable
       * @example
       *    cy.logout()
       */
      logout: () => void;

      /**
       * Checks for notification with variant text if passed. Default variant is 'success'.
       *
       * @returns {typeof notification}
       * @memberof Chainable
       * @example
       *    cy.notification({ variant: 'error', text: 'failed'})
       */
      notification: (options: {
        variant: 'success' | 'error' | 'info';
        text: string | RegExp;
      }) => void;

      /**
       * Closes notification.
       *
       * @returns {typeof notification}
       * @memberof Chainable
       * @example
       *    cy.closeNotification()
       */
      closeNotification: () => void;

      /**
       * Closes modal.
       *
       * @returns {typeof closeModal}
       * @memberof Chainable
       * @example
       *    cy.closeModal()
       */
      closeModal: () => void;

      /**
       * Checks if the progressbar does not exist in the dom anymore.
       *
       * @returns {typeof finishedLoading}
       * @memberof Chainable
       * @example
       *    cy.finishedLoading()
       */
      finishedLoading: () => void;

      /**
       * Creates new proposal with title and abstract passed. If nothing is passed it generates title and abstract on its own. You need to be logged in as a user.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createProposal('Proposal title', 'Proposal abstract')
       */
      createProposal: (
        proposalTitle?: string,
        proposalAbstract?: string,
        call?: string,
        proposer?: string
      ) => void;

      /**
       * Creates new proposal workflow with name and description passed.
       *
       * @returns {typeof createProposalWorkflow}
       * @memberof Chainable
       * @example
       *    cy.createProposalWorkflow('Workflow name', 'Workflow description')
       */
      createProposalWorkflow: (
        workflowName: string,
        workflowDescription: string
      ) => void;

      /**
       * Adds status changing event/s to status. When those event/s are fired the the status will be changed to statusCode you pass.
       *
       * @returns {typeof addProposalStatusChangingEventToStatus}
       * @memberof Chainable
       * @example
       *    cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', ['PROPOSAL_SUBMITTED'])
       */
      addProposalStatusChangingEventToStatus: (
        statusCode: string,
        statusChangingEvents: string[]
      ) => void;

      /**
       * Creates new call with values passed. If nothing is passed it generates random values. You need to be logged in as a user-officer.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createCall({shortCode: 'Test call 1', startDate: '22-02-2021', endDate: '28-02-2021', surveyComment: 'This is survey comment', cycleComment: 'This is cycle comment'})
       */
      createCall: (values: {
        shortCode?: string;
        startDate?: string;
        endDate?: string;
        surveyComment?: string;
        cycleComment?: string;
        template?: string;
        workflow?: string;
      }) => void;

      /**
       * Moves the element in the given direction with given length.
       * For example direction "left" means that the element will go to the left and length "2" means that two times left arrow will be pressed.
       *
       * @returns {typeof dragElement}
       * @memberof Chainable
       * @example
       *    cy.dragElement([{ direction: 'left', length: 1 }, { direction: 'down', length: 2 }])
       */
      dragElement: (
        arguments: {
          direction: 'left' | 'up' | 'right' | 'down';
          length: number;
        }[]
      ) => Cypress.Chainable<JQuery<HTMLElement>>;

      /**
       * Creates template
       *
       * @returns {typeof createTemplate}
       * @memberof Chainable
       * @example
       *    cy.createTemplate('proposal')
       */
      createTemplate: (
        type: string,
        title?: string,
        description?: string
      ) => void;

      /**
       * Creates topic in template
       *
       * @returns {typeof createTopic}
       * @memberof Chainable
       * @example
       *    cy.createTopic('New topic')
       */
      createTopic: (topic: string) => void;

      /**
       * Creates sample question
       *
       * @returns {typeof createSampleQuestion}
       * @memberof Chainable
       * @example
       *    cy.createSampleQuestion('Provide sample', 'default sample template', '1', '5')
       */
      createSampleQuestion: (
        question: string,
        template: string,
        minEntries?: string,
        maxEntries?: string
      ) => void;

      /**
       * Lets you change the logged in user's active role
       *
       * @returns {typeof changeActiveRole}
       * @memberof Chainable
       * @example
       *    cy.changeActiveRole('User Officer')
       */
      changeActiveRole: (role: string) => void;

      /**
       * Call this method before your test to have delay between clicks
       * Excellent for presentation purposes
       *
       * @returns {typeof presentationMode}
       * @memberof Chainable
       * @example
       *    cy.presentationMode()
       */
      presentationMode: () => void;

      /**
       * Creates boolean question. You have to be in edit template view to call this method
       *
       * @returns {typeof createBooleanQuestion}
       * @memberof Chainable
       * @example
       *    cy.createBooleanQuestion('Is dangerous')
       */
      createBooleanQuestion: (title: string) => void;

      /**
       * Creates Text question. You have to be in edit template view to call this method
       *
       * @returns {typeof createTextQuestion}
       * @memberof Chainable
       * @example
       *    cy.createTextQuestion()
       */
      createTextQuestion: (
        title: string,
        isRequired: boolean,
        isMultipleLines: boolean,
        minimumCharacters?: number
      ) => void;

      /**
       * Creates date question. You have to be in edit template view to call this method
       *
       * @returns {typeof createDateQuestion}
       * @memberof Chainable
       * @example
       *    cy.createDateQuestion('Is dangerous')
       */
      createDateQuestion: (title: string) => void;

      /**
       * Creates multiple choice question. You have to be in edit template view to call this method
       *
       * @returns {typeof createMultipleChoiceQuestion}
       * @memberof Chainable
       * @example
       *    cy.createMultipleChoiceQuestion('Is dangerous')
       */
      createMultipleChoiceQuestion: (
        title: string,
        option1: string,
        option2: string,
        option3: string
      ) => void;

      /**
       * Creates FileUpload question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createFileUploadQuestion}
       * @memberof Chainable
       * @example
       *    cy.createFileUploadQuestion('Provide a file')
       */
      createFileUploadQuestion: (title: string) => void;

      /**
       * Creates NumberImput question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createNumberInputQuestion}
       * @memberof Chainable
       * @example
       *    cy.createNumberInputQuestion('Specify temperature')
       */
      createNumberInputQuestion: (title: string) => void;

      /**
       * Creates interval question.
       * You have to be in edit template view to call this method
       *
       * @returns {typeof createIntervalQuestion}
       * @memberof Chainable
       * @example
       *    cy.createIntervalQuestion('Specify temperature interval')
       */
      createIntervalQuestion: (title: string) => void;

      /**
       * Assigns an instrument to a selected call
       *
       * @returns {typeof assignInstrumentToCall}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentToCall('call name or code', 'instrument code or short code')
       */
      assignInstrumentToCall: (call: string, instrument: string) => void;

      /**
       * Assigns an instrument to a selected proposal
       *
       * @returns {typeof assignInstrumentToProposal}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentToProposal('proposal name or code', 'instrument name')
       */
      assignInstrumentToProposal: (
        proposal: string,
        instrument: string
      ) => void;

      /**
       * Assigns the Instrument Scientist role to a user
       *
       * @returns {typeof addScientistRoleToUser}
       * @memberof Chainable
       * @example
       *    cy.addScientistRoleToUser('John')
       */
      addScientistRoleToUser: (user: string) => void;

      /**
       * Assigns all available scientist to an instrument
       *
       * @returns {typeof assignScientistsToInstrument}
       * @memberof Chainable
       * @example
       *    cy.assignScientistsToInstrument('instrument name / code');
       */
      assignScientistsToInstrument: (instrument) => void;

      /**
       * Creates a new instrument with the given values
       *
       * @returns {typeof createInstrument}
       * @memberof Chainable
       * @example
       *    cy.createInstrument({
       *      name: faker.random.words(2),
       *      shortCode: faker.random.alphaNumeric(15),
       *      description: faker.random.words(5),
       *    })
       */
      createInstrument: (instrument: {
        name: string;
        shortCode: string;
        description: string;
      }) => void;
    }
  }

  interface Window {
    tinyMCE: any;
  }
}

export {};
