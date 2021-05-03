import 'cypress-file-upload';

const KEY_CODES = {
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

const notification = ({ variant, text }) => {
  let notificationQuerySelector = '';
  let bgColor = '';

  switch (variant) {
    case 'error':
      notificationQuerySelector = '.snackbar-error [role="alert"]';
      bgColor = 'rgb(211, 47, 47)';
      break;

    default:
      notificationQuerySelector = '.snackbar-success [role="alert"]';
      bgColor = 'rgb(67, 160, 71)';
      break;
  }
  let notification = cy
    .get(notificationQuerySelector)
    .should('exist')
    .and('have.css', 'background-color', bgColor);

  if (text) {
    if (text instanceof RegExp) {
      notification.and(($el) => expect($el.text()).to.match(text));
    } else {
      notification.and('contains.text', text);
    }
  }
};

const closeNotification = () => {
  cy.get('body').then((body) => {
    if (body.has('[aria-describedby="client-snackbar"]')) {
      cy.get('.MuiSnackbarContent-action button').click();
    }
  });
};

const closeModal = () => {
  cy.get('[role="dialog"] [data-cy="close-modal"]').click();
  // NOTE: Need to wait for modal to close with animation.
  cy.wait(100);

  cy.get('[role="dialog"]').should('not.exist');
};

const finishedLoading = () => {
  cy.get('[role="progressbar"]').should('not.exist');
};

function presentationMode() {
  const COMMAND_DELAY = 300;

  for (const command of [
    'visit',
    'click',
    'trigger',
    'type',
    'clear',
    'reload',
    'contains',
  ]) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
      const origVal = originalFn(...args);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(origVal);
        }, COMMAND_DELAY);
      });
    });
  }
}

const dragElement = (element, moveArgs) => {
  const focusedElement = cy.get(element);

  focusedElement.trigger('keydown', { keyCode: KEY_CODES.space });

  moveArgs.forEach(({ direction, length }) => {
    for (let i = 1; i <= length; i++) {
      focusedElement.trigger('keydown', {
        keyCode: KEY_CODES[direction],
        force: true,
      });
    }
  });

  focusedElement.trigger('keydown', { keyCode: KEY_CODES.space, force: true });

  return element;
};

Cypress.Commands.add('notification', notification);

Cypress.Commands.add('closeNotification', closeNotification);

Cypress.Commands.add('closeModal', closeModal);

Cypress.Commands.add('finishedLoading', finishedLoading);

Cypress.Commands.add(
  'dragElement',
  { prevSubject: 'element' },
  (element, args) => {
    dragElement(element, args);
  }
);

Cypress.Commands.add('presentationMode', presentationMode);
