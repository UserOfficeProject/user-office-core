// Benign browser notification: ResizeObserver retries automatically on next frame.
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes(
      'ResizeObserver loop completed with undelivered notifications'
    )
  ) {
    return false;
  }
});
