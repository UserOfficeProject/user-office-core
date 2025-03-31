import MaterialTable, { Column, Options } from '@material-table/core';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

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

const columns: (
  t: TFunction<'translation', undefined>
) => Column<UserExperiment>[] = (t) => [
  { title: 'Proposal title', field: 'proposal.title' },
  { title: 'Proposal ID', field: 'proposal.proposalId' },
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
    startsAtFormatted: toFormattedDateTime(event.startsAt),
    endsAtFormatted: toFormattedDateTime(event.endsAt),
    localContactFormatted: getFullUserName(event.localContact),
  }));

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
