// The calendar only needs to yield *a* valid future range — no visit test
// asserts on the dates it picked. Selecting whatever the open month already
// offers avoids paging the calendar to a specific date, which is slow and
// breaks as soon as the target lands in another month.
const SELECTABLE_DAY = '[data-day]:not([data-disabled]):not([data-outside])';

// Only needed when the open month is nearly over and has fewer than two days
// left to select.
const MAX_MONTH_HOPS = 3;

function selectFirstAvailableRange(hops = 0) {
  cy.get('.rdp-root').then(($calendar) => {
    const days = $calendar.find(SELECTABLE_DAY);

    if (days.length < 2) {
      if (hops >= MAX_MONTH_HOPS) {
        throw new Error('No selectable day range in the day range picker');
      }

      cy.get('.rdp-button_next').click();
      selectFirstAvailableRange(hops + 1);

      return;
    }

    const from = days.eq(0).attr('data-day');
    const to = days.eq(1).attr('data-day');

    // Re-query by date rather than reusing the jQuery handles above: selecting
    // the start day re-renders the calendar and detaches them.
    cy.get(`[data-day="${from}"] .rdp-day_button`).click();
    cy.get(`[data-day="${to}"] .rdp-day_button`).click();
  });
}

/**
 * Selects the earliest available date range in a FormikUIDayRangePicker. Its
 * text field is readonly by design, so the range can only be set through the
 * calendar popover.
 *
 * `id` is the picker's id, e.g. `visit_basis.dateRange`.
 */
export function selectDateRange(id: string) {
  cy.get(`[data-cy="${id}-calendar-btn"]`).click();

  selectFirstAvailableRange();

  cy.get(`[data-cy="${id}-done-btn"]`).click();
}
