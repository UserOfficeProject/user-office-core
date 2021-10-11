import MaterialTable from '@material-table/core';
import { Dialog, DialogContent } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { useState } from 'react';
import { ReactNode } from 'react';

import { useActionButtons } from 'hooks/proposalBooking/useActionButtons';
import {
  ProposalScheduledEvent,
  useProposalBookingsScheduledEvents,
} from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import {
  parseTzLessDateTime,
  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT,
} from 'utils/Time';

export default function UserUpcomingExperimentsTable() {
  const {
    loading,
    proposalScheduledEvents,
    setProposalScheduledEvents,
  } = useProposalBookingsScheduledEvents({
    onlyUpcoming: true,
    notDraft: true,
  });

  const [modalContents, setModalContents] = useState<ReactNode>(null);

  const {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    individualTrainingAction,
    declareShipmentAction,
  } = useActionButtons({
    openModal: (contents) => setModalContents(contents),
    closeModal: () => {
      setModalContents(null);
    },
    eventUpdated: (updatedEvent) => {
      const updatedEvents = proposalScheduledEvents.map((event) =>
        event?.id === updatedEvent?.id ? updatedEvent : event
      );
      setProposalScheduledEvents(updatedEvents);
    },
  });

  const columns = [
    { title: 'Proposal title', field: 'proposal.title' },
    { title: 'Proposal ID', field: 'proposal.proposalId' },
    { title: 'Instrument', field: 'instrument.name' },
    {
      title: 'Starts at',
      field: 'startsAt',
      render: (rowData: ProposalScheduledEvent) =>
        parseTzLessDateTime(rowData.startsAt).format(
          TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
        ),
    },
    {
      title: 'Ends at',
      field: 'endsAt',
      render: (rowData: ProposalScheduledEvent) =>
        parseTzLessDateTime(rowData.endsAt).format(
          TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
        ),
    },
  ];

  // if there are no upcoming experiments
  // just hide the whole table altogether
  if (proposalScheduledEvents.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <StyledPaper margin={[0]}>
        <MaterialTable
          actions={[
            formTeamAction,
            finishEsi,
            registerVisitAction,
            individualTrainingAction,
            declareShipmentAction,
          ]}
          icons={tableIcons}
          title="Upcoming experiments"
          isLoading={loading}
          columns={columns}
          data={proposalScheduledEvents}
          options={{
            search: false,
            padding: 'dense',
            emptyRowsWhenPaging: false,
            paging: false,
            actionsColumnIndex: -1,
          }}
        />
      </StyledPaper>
      <Dialog
        open={modalContents !== null}
        onClose={() => setModalContents(null)}
        style={{ maxWidth: 'inherit' }}
      >
        <DialogContent>{modalContents}</DialogContent>
      </Dialog>
    </Grid>
  );
}
