import { Column } from '@material-table/core';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { Box, Dialog, DialogContent, Link, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import CardEmptyState from 'components/common/cards/CardEmptyState';
import { CardTaskItem } from 'components/common/cards/CardTaskList';
import ExperimentCard from 'components/common/cards/ExperimentCard';
import MaterialTable from 'components/common/ResponsiveMaterialTable';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { minTouchTarget, useCardRows } from 'hooks/common/useResponsive';
import {
  UserExperiment,
  useUserExperiments,
} from 'hooks/experiment/useUserExperiments';
import {
  ExperimentAction,
  useActionButtons,
} from 'hooks/proposalBooking/useActionButtons';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

const columns: (
  t: TFunction<'translation', undefined>
) => Column<UserExperiment>[] = (t) => [
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

type UserUpcomingExperimentsTableProps = {
  hideIfEmpty?: boolean;
};

export default function UserUpcomingExperimentsTable({
  hideIfEmpty = true,
}: UserUpcomingExperimentsTableProps) {
  const {
    loading: experimentsLoading,
    userExperiments,
    setUserUpcomingExperiments,
  } = useUserExperiments({ notDraft: true, onlyUpcoming: true });
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const { t } = useTranslation();
  const asCards = useCardRows();

  const [modalContents, setModalContents] = useState<ReactNode>(null);

  const {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    declareShipmentAction,
    giveFeedback,
  } = useActionButtons({
    openModal: (contents) => setModalContents(contents),
    closeModal: () => {
      setModalContents(null);
    },
    eventUpdated: (updatedExperiment) => {
      const updatedExperiments = userExperiments.map((experiment) =>
        experiment?.experimentPk === updatedExperiment?.experimentPk
          ? updatedExperiment
          : experiment
      );
      setUserUpcomingExperiments(updatedExperiments);
    },
  });

  const actions = [
    formTeamAction,
    finishEsi,
    registerVisitAction,
    declareShipmentAction,
    giveFeedback,
  ];

  const taskItemsFor = (experiment: UserExperiment): CardTaskItem[] =>
    actions.flatMap((buildAction) => {
      const action: ExperimentAction = buildAction(experiment);

      if (action.hidden || !action.task) {
        return [];
      }

      return [
        {
          task: action.task,
          onClick: (event: React.MouseEvent<HTMLElement>) =>
            action.onClick?.(event, experiment),
        },
      ];
    });

  if (hideIfEmpty && userExperiments.length === 0) {
    return null;
  }

  const userExperimentsWithFormattedDates = userExperiments.map(
    (experiment) => ({
      ...experiment,
      startsAtFormatted: toFormattedDateTime(experiment.startsAt),
      endsAtFormatted: toFormattedDateTime(experiment.endsAt),
    })
  );

  return (
    <div data-cy="upcoming-experiments">
      {asCards && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
            padding: 1,
            paddingBottom: 1.5,
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
            Upcoming Experiments
          </Typography>
        </Box>
      )}
      {asCards && !experimentsLoading && userExperiments.length === 0 ? (
        <CardEmptyState
          icon={<EventBusyIcon fontSize="large" color="disabled" />}
          title="No upcoming experiments"
          description="Once a proposal of yours is accepted and scheduled, the experiment and everything it needs from you will show up here."
          action={
            <Link
              component={RouterLink}
              to="/ProposalSelectType"
              data-cy="empty-new-proposal-link"
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: minTouchTarget(theme),
              })}
            >
              New proposal
            </Link>
          }
        />
      ) : (
        <MaterialTable
          actions={actions}
          icons={tableIcons}
          title="Upcoming experiments"
          isLoading={experimentsLoading}
          columns={columns(t)}
          data={userExperimentsWithFormattedDates}
          cardRow={(experiment) => (
            <ExperimentCard
              experiment={experiment}
              tasks={taskItemsFor(experiment)}
            />
          )}
          options={{
            search: false,
            padding: 'dense',
            emptyRowsWhenPaging: false,
            paging: false,
            actionsColumnIndex: -1,
            toolbar: !asCards,
          }}
        />
      )}
      <Dialog
        open={modalContents !== null}
        onClose={() => setModalContents(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>{modalContents}</DialogContent>
      </Dialog>
    </div>
  );
}
