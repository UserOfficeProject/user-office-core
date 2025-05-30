import 'cypress-real-events';

import { faker } from '@faker-js/faker';
import {
  AllocationTimeUnits,
  CreateApiAccessTokenMutation,
  CreateApiAccessTokenMutationVariables,
  getSdk,
} from '@user-office-software-libs/shared-types';
import { GraphQLClient } from 'graphql-request';
import { DateTime } from 'luxon';

import initialDBData from './initialDBData';

const KEY_CODES = {
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

const currentDayStart = DateTime.now().startOf('day');

const closedCallStartDate = faker.date.past();

export const updatedCall = {
  shortCode: faker.random.alphaNumeric(15),
  startCall: faker.date.past().toISOString().slice(0, 10),
  endCall: faker.date.future().toISOString().slice(0, 10),
  startReview: currentDayStart,
  endReview: currentDayStart,
  startFapReview: currentDayStart,
  endFapReview: currentDayStart,
  startNotify: currentDayStart,
  endNotify: currentDayStart,
  startCycle: currentDayStart,
  endCycle: currentDayStart,
  allocationTimeUnit: AllocationTimeUnits.DAY,
  cycleComment: faker.lorem.word(10),
  surveyComment: faker.lorem.word(10),
  templateId: initialDBData.template.id,
  fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
  technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
};

export const closedCall = {
  shortCode: faker.random.alphaNumeric(15),
  startCall: closedCallStartDate.toISOString().slice(0, 10),
  endCall: closedCallStartDate.toISOString().slice(0, 10),
  startReview: currentDayStart,
  endReview: currentDayStart,
  startFapReview: faker.date.past(),
  endFapReview: faker.date.future(),
  startNotify: currentDayStart,
  endNotify: currentDayStart,
  startCycle: currentDayStart,
  endCycle: currentDayStart,
  allocationTimeUnit: AllocationTimeUnits.DAY,
  cycleComment: faker.lorem.word(10),
  surveyComment: faker.lorem.word(10),
  templateId: initialDBData.template.id,
  fapReviewTemplateId: initialDBData.fapReviewTemplate.id,
  technicalReviewTemplateId: initialDBData.technicalReviewTemplate.id,
  callFapReviewEnded: false,
};

const numbersOnly = (date: string): string => date.replace(/[^0-9]/gi, '');

export const getE2EApi = (token?: string | null) => {
  // NOTE: Token is used when we want to do some action as a specific logged in user.
  const authHeader = `Bearer ${token ? token : Cypress.env('SVC_ACC_TOKEN')}`;

  return getSdk(
    new GraphQLClient('/graphql', {
      headers: { authorization: authHeader },
    })
  );
};

const createApiAccessToken = (
  createApiAccessTokenInput: CreateApiAccessTokenMutationVariables
): Cypress.Chainable<CreateApiAccessTokenMutation> => {
  const api = getE2EApi();
  const request = api.createApiAccessToken(createApiAccessTokenInput);

  return cy.wrap(request);
};

const notification = ({
  variant,
  text,
}: {
  variant: 'success' | 'error' | 'info' | 'warning';
  text: string | RegExp;
}) => {
  let notificationQuerySelector = '';

  switch (variant) {
    case 'error':
      notificationQuerySelector = '.snackbar-error #notistack-snackbar';
      break;
    default:
      notificationQuerySelector = '.snackbar-success #notistack-snackbar';
      break;
  }
  cy.get(notificationQuerySelector).should('exist');

  if (text) {
    if (text instanceof RegExp) {
      cy.get(notificationQuerySelector).should(($el) =>
        expect($el.text()).to.match(text)
      );
    } else {
      cy.get(notificationQuerySelector).should('contains.text', text);
    }
  }
};

const closeNotification = () => {
  cy.get('body').then((body) => {
    if (body.has('[aria-describedby="notistack-snackbar"]')) {
      cy.get(
        '[aria-describedby="notistack-snackbar"] button.MuiIconButton-root'
      ).click();
    }
  });
};

const closeModal = () => {
  cy.get('[role="dialog"] [data-cy="close-modal"]').click();

  cy.get('body').should(
    'not.have.descendants',
    '[role="presentation"] [role="dialog"]'
  );
};

const finishedLoading = () => {
  cy.get('[role="progressbar"]')
    .should('not.exist')
    .get('[data-cy="loading"]')
    .should('not.exist')
    .get('[data-cy="UO-loader"]')
    .should('not.exist')
    .get('.MuiPaper-root [role="progressbar"]')
    .should('not.exist');
};

const dragElement = (
  element: JQuery<HTMLElement>,
  moveArgs: {
    direction: 'left' | 'up' | 'right' | 'down';
    length: number;
  }[]
) => {
  // @ts-expect-error FIXME: This should be fixed maybe using something like cy.find(element.attr('class')!);
  cy.get(element).as('focusedElement');

  cy.get('@focusedElement').trigger('keydown', { keyCode: KEY_CODES.space });

  moveArgs.forEach(({ direction, length }) => {
    for (let i = 1; i <= length; i++) {
      cy.get('@focusedElement').trigger('keydown', {
        keyCode: KEY_CODES[direction],
        force: true,
      });
    }
  });

  cy.get('@focusedElement').trigger('keydown', {
    keyCode: KEY_CODES.space,
    force: true,
  });

  return cy.get('@focusedElement');
};

const getEditorById = (win: Cypress.AUTWindow, tinyMceId: string) =>
  win.tinyMCE.EditorManager.get().find((editor) => editor.id === tinyMceId);

const setTinyMceContent = (tinyMceId: string, content: string) => {
  cy.window().should('have.property', 'tinymce'); // wait for tinyMCE
  cy.get(`#${tinyMceId}`).should('exist');

  // NOTE: // wait for editor to be ready
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);

  cy.window().then((win) => {
    const editor = getEditorById(win, tinyMceId);
    editor?.setContent(content);
  });
};

const setDatePickerValue = (selector: string, value: string) =>
  cy
    .get(selector)
    // NOTE: Clears the value from the datepicker
    .type('{selectall}{backspace}')
    // NOTE: Points to the first sub-field which is usually the date.
    .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}')
    .type(numbersOnly(value));

const getTinyMceContent = (tinyMceId: string) => {
  cy.get(`#${tinyMceId}`).should('exist');

  cy.window().should('have.property', 'tinymce'); // wait for tinyMCE
  cy.get(`#${tinyMceId}`).should('exist');

  // NOTE: // wait for editor to be ready
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);

  return cy.window().then((win) => {
    const editor = getEditorById(win, tinyMceId);

    return editor?.getContent();
  });
};

const getIconByCyTag = (cyTag: string) => {
  return cy
    .get('[data-cy=upcoming-experiments]')
    .contains(initialDBData.experiments.upcoming.startsAt)
    .closest('TR')
    .find(`[data-cy="${cyTag}"]`);
};
const getButtonByIconCyTag = (cyTag: string) =>
  getIconByCyTag(cyTag).closest('button');

const testActionButton = (
  iconCyTag: string,
  state:
    | 'completed'
    | 'active'
    | 'inactive'
    | 'neutral'
    | 'invisible'
    | 'pending'
    | 'cancelled'
) => {
  switch (state) {
    case 'completed':
      getButtonByIconCyTag(iconCyTag).should('not.be.disabled');

      getButtonByIconCyTag(iconCyTag).find('.MuiBadge-badge').contains('✔');
      break;
    case 'active':
      getButtonByIconCyTag(iconCyTag).should('not.be.disabled');

      getButtonByIconCyTag(iconCyTag)
        .find('.MuiBadge-badge')
        .should('have.css', 'background-color', 'rgb(235, 26, 108)');
      break;

    case 'neutral':
      getButtonByIconCyTag(iconCyTag).should('not.be.disabled');

      getButtonByIconCyTag(iconCyTag)
        .find('.MuiBadge-badge')
        .should('not.have.css', 'background-color', 'rgb(235, 26, 108)');
      break;

    case 'pending':
      getButtonByIconCyTag(iconCyTag)
        .find('.MuiBadge-badge')
        .should('have.css', 'background-color', 'rgb(255, 153, 0)');
      break;

    case 'inactive':
      getButtonByIconCyTag(iconCyTag).should('be.disabled');
      break;
    case 'invisible':
      getIconByCyTag(iconCyTag).should('not.exist');
      break;
  }
};

Cypress.Commands.add('notification', notification);

Cypress.Commands.add('closeNotification', closeNotification);

Cypress.Commands.add('closeModal', closeModal);

Cypress.Commands.add('finishedLoading', finishedLoading);

Cypress.Commands.add(
  'dragElement',
  { prevSubject: 'element' },
  (element, args) => {
    return dragElement(element, args);
  }
);

Cypress.Commands.add('setTinyMceContent', setTinyMceContent);
Cypress.Commands.add('setDatePickerValue', setDatePickerValue);
Cypress.Commands.add('getTinyMceContent', getTinyMceContent);
Cypress.Commands.add('testActionButton', testActionButton);
Cypress.Commands.add('createApiAccessToken', createApiAccessToken);
