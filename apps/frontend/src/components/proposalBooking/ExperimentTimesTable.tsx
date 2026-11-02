import MaterialTable, { Column, Options } from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

type ExperimentTimesTableProps = {
  title: string;
  isLoading: boolean;
  experiments: UserExperiment[];
  options?: Partial<Options<UserExperiment>>;
};

const RowActionButtons = ({ experimentId }: { experimentId: string }) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <Tooltip title="View Experiment">
      <IconButton
        data-cy="view-experiment"
        onClick={() => {
          setSearchParams((searchParams) => {
            searchParams.set('experiment', experimentId);

            return searchParams;
          });
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );
};

export default function ExperimentsTimesTable({
  title,
  isLoading,
  experiments,
  options,
}: ExperimentTimesTableProps) {
  const { t } = useTranslation();

  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const experimentsWithFormattedDates = experiments.map((event) => ({
    ...event,
    experimentId: event.experimentId,
    startsAtFormatted: toFormattedDateTime(event.startsAt),
    endsAtFormatted: toFormattedDateTime(event.endsAt),
    localContactFormatted: getFullUserName(event.localContact),
  }));

  const columns: (
    t: TFunction<'translation', undefined>
  ) => Column<UserExperiment>[] = (t) => [
    {
      title: 'Actions',
      cellStyle: { padding: 0 },
      sorting: false,
      removable: false,
      field: 'rowActionButtons',
      render: (rowData: UserExperiment) => (
        <RowActionButtons experimentId={rowData.experimentId} />
      ),
    },
    { title: 'Proposal title', field: 'proposal.title' },
    { title: 'Proposal ID', field: 'proposal.proposalId' },
    { title: 'Experiment Number', field: 'experimentId' },
    { title: t('instrument') as string, field: 'instrument.name' },
    {
      title: 'Local contact',
      field: 'localContactFormatted',
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

  return (
    <MaterialTable
      icons={tableIcons}
      title={title}
      isLoading={isLoading}
      columns={columns(t)}
      data={experimentsWithFormattedDates}
      options={{
        search: false,
        padding: 'dense',
        emptyRowsWhenPaging: false,
        paging: false,
        ...options,
      }}
    />
  );
}
