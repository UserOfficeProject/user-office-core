import { Column } from '@material-table/core';
import { Box, Chip, Dialog, DialogContent, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { useEffect, useState, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { CardTaskItem } from 'components/common/cards/CardTaskList';
import ExperimentCard from 'components/common/cards/ExperimentCard';
import MaterialTable from 'components/common/ResponsiveMaterialTable';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCardRows } from 'hooks/common/useResponsive';
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
  /** Reports the outstanding task count so the section nav can badge it. */
  onTasksDueChange?: (count: number) => void;
};

export default function UserUpcomingExperimentsTable({
  hideIfEmpty = true,
  onTasksDueChange,
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

  const context = useContext(FeatureContext);
  const isShipmentActionEnabled = !!context.featuresMap.get(FeatureId.SHIPPING)
    ?.isEnabled;

  // One list feeds both views, so the shipping feature flag hides the action
  // on the cards as well as in the table.
  const actions = [
    formTeamAction,
    finishEsi,
    registerVisitAction,
    ...(isShipmentActionEnabled ? [declareShipmentAction] : []),
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

  const tasksDue = userExperiments.reduce(
    (total, experiment) =>
      total +
      taskItemsFor(experiment).filter((item) => item.task.status === 'todo')
        .length,
    0
  );

  useEffect(() => {
    onTasksDueChange?.(tasksDue);
  }, [tasksDue, onTasksDueChange]);

  // if there are no upcoming experiments, the dashboard hides the table
  // altogether; the standalone page keeps it and shows its empty state
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
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 500 }}
          >
            Upcoming experiments
          </Typography>
          {tasksDue > 0 && (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={`${tasksDue} task${tasksDue === 1 ? '' : 's'} due`}
              data-cy="experiment-tasks-due"
            />
          )}
        </Box>
      )}
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
