import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams, NumberParam, StringParam } from 'use-query-params';

import SuperMaterialTable, {
  DefaultQueryParams,
} from 'components/common/SuperMaterialTable';
import ProposalEsiDetailsButton from 'components/questionary/questionaryComponents/ProposalEsiBasis/ProposalEsiDetailsButton';
import { GetScheduledEventsCoreQuery, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useScheduledEvents } from 'hooks/scheduledEvent/useScheduledEvents';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

import { DEFAULT_DATE_FORMAT } from './DateFilter';
import { ExperimentUrlQueryParamsType } from './ExperimentUrlQueryParamsType';
import ExperimentVisitsTable from './ExperimentVisitsTable';

type RowType = GetScheduledEventsCoreQuery['scheduledEventsCore'][0];

function ExperimentTable() {
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<ExperimentUrlQueryParamsType>({
      ...DefaultQueryParams,
      call: NumberParam,
      instrument: NumberParam,
      from: StringParam,
      to: StringParam,
    });

  const { scheduledEvents, setScheduledEvents, loadingEvents, setArgs } =
    useScheduledEvents({});

  const { toFormattedDateTime, format } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const columns = (t: TFunction<'translation', undefined>) => [
    {
      title: 'Proposal ID',
      field: 'proposal.proposalId',
    },
    {
      title: 'Principal investigator',
      render: (rowData: RowType) => getFullUserName(rowData.proposal.proposer),
    },
    {
      title: 'Proposal',
      field: 'proposal.title',
    },
    {
      title: 'Experiment start',
      field: 'startsAt',
      render: (rowData: RowType) => toFormattedDateTime(rowData.startsAt),
    },
    {
      title: 'Experiment end',
      field: 'endsAt',
      render: (rowData: RowType) => toFormattedDateTime(rowData.endsAt),
    },
    {
      title: 'ESI',
      render: (rowData: RowType) =>
        rowData.esi ? (
          <ProposalEsiDetailsButton esiId={rowData.esi?.id} />
        ) : (
          'No ESI'
        ),
    },
    {
      title: t('instrument'),
      field: 'instrument.name',
    },
  ];

  const { t } = useTranslation();

  useEffect(() => {
    setArgs({
      filter: {
        callId: urlQueryParams.call,
        instrumentId: urlQueryParams.instrument,
        overlaps: {
          from: urlQueryParams.from
            ? DateTime.fromFormat(
                urlQueryParams.from,
                format || DEFAULT_DATE_FORMAT
              )
            : undefined,
          to: urlQueryParams.to
            ? DateTime.fromFormat(
                urlQueryParams.to,
                format || DEFAULT_DATE_FORMAT
              )
            : undefined,
        },
      },
    });
  }, [
    setArgs,
    urlQueryParams.call,
    urlQueryParams.instrument,
    urlQueryParams.from,
    urlQueryParams.to,
    format,
  ]);

  const ScheduledEventDetails = React.useCallback(
    ({ rowData }: Record<'rowData', RowType>) => {
      return <ExperimentVisitsTable scheduledEvent={rowData} />;
    },
    []
  );

  return (
    <SuperMaterialTable
      data={scheduledEvents}
      setData={setScheduledEvents}
      icons={tableIcons}
      title={
        <Typography variant="h6" component="h2">
          Experiments
        </Typography>
      }
      columns={columns(t)}
      isLoading={loadingEvents}
      options={{
        search: false,
      }}
      urlQueryParams={urlQueryParams}
      setUrlQueryParams={setUrlQueryParams}
      detailPanel={[
        {
          tooltip: 'Show details',
          render: ScheduledEventDetails,
        },
      ]}
      hasAccess={{
        create: false,
        remove: false,
        update: false,
      }}
    />
  );
}

export default ExperimentTable;
