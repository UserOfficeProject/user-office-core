import MaterialTable, { Column } from '@material-table/core';
import { Dialog, DialogContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import {
  UpcomingExperimentsType,
  useUserUpcomingExperiments,
} from 'hooks/experiment/useUserExperiments';
import { useActionButtons } from 'hooks/proposalBooking/useActionButtons';
import { StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

const columns: (
  t: TFunction<'translation', undefined>
) => Column<UpcomingExperimentsType>[] = (t) => [
  { title: 'Experiment Number', field: 'experimentId' },
  { title: 'Proposal title', field: 'proposal.title' },
  { title: 'Proposal ID', field: 'proposal.proposalId' },
  { title: t('instrument') as string, field: 'instrument.name' },
  {
    title: 'Local contact',
    render: (rowData) => getFullUserName(rowData.localContact),
  },
  {
    title: 'Starts at',
    field: 'startsAtFormatted',
  },
  {
    title: 'Ends at',
    field: 'endsAtFormatted',
  },
];

export default function UserUpcomingExperimentsTable() {
  const { loading: upcomingExperimentsLoading, userUpcomingExperiments } =
    useUserUpcomingExperiments();
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const { t } = useTranslation();

  const [modalContents, setModalContents] = useState<ReactNode>(null);

  const {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    individualTrainingAction,
    declareShipmentAction,
    giveFeedback,
  } = useActionButtons({
    openModal: (contents) => setModalContents(contents),
    closeModal: () => {
      setModalContents(null);
    },
    eventUpdated: (updatedEvent) => {
      // const updatedEvents = proposalScheduledEvents.map((event) =>
      //   event?.id === updatedEvent?.id ? updatedEvent : event
      // );
      // setProposalScheduledEvents(updatedEvents);
    },
  });

  // if there are no upcoming experiments
  // just hide the whole table altogether
  if (userUpcomingExperiments.length === 0) {
    return null;
  }

  const userUpcomingExperimentsWithFormattedDates = userUpcomingExperiments.map(
    (experiment) => ({
      ...experiment,
      startsAtFormatted: toFormattedDateTime(experiment.startsAt),
      endsAtFormatted: toFormattedDateTime(experiment.endsAt),
    })
  );

  console.log({ userUpcomingExperimentsWithFormattedDates });

  return (
    <Grid item xs={12} data-cy="upcoming-experiments">
      <StyledPaper>
        <MaterialTable
          actions={[
            formTeamAction,
            finishEsi,
            registerVisitAction,
            individualTrainingAction,
            declareShipmentAction,
            giveFeedback,
          ]}
          icons={tableIcons}
          title="Upcoming experiments"
          isLoading={upcomingExperimentsLoading}
          columns={columns(t)}
          data={userUpcomingExperimentsWithFormattedDates}
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
