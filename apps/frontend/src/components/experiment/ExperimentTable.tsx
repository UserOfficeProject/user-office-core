import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import ProposalEsiDetailsButton from 'components/questionary/questionaryComponents/ProposalEsiBasis/ProposalEsiDetailsButton';
import { GetScheduledEventsCoreQuery, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { useScheduledEvents } from 'hooks/scheduledEvent/useScheduledEvents';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

import { DEFAULT_DATE_FORMAT } from './DateFilter';
import ExperimentVisitsTable from './ExperimentVisitsTable';

type RowType = GetScheduledEventsCoreQuery['scheduledEventsCore'][0];

function ExperimentTable() {
  const initialParams = useMemo(
    () => ({
      call: null,
      instrument: null,
      from: null,
      to: null,
    }),
    []
  );

  const [typedParams] = useTypeSafeSearchParams<{
    call: string | null;
    instrument: string | null;
    from: string | null;
    to: string | null;
  }>(initialParams);

  const {
    call,
    instrument,
    from: experimentFromDate,
    to: experimentToDate,
  } = typedParams;

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
        callId: call ? +call : undefined,
        instrumentId: instrument ? +instrument : undefined,
        overlaps: {
          from: experimentFromDate
            ? DateTime.fromFormat(
                experimentFromDate,
                format || DEFAULT_DATE_FORMAT
              )
            : undefined,
          to: experimentToDate
            ? DateTime.fromFormat(
                experimentToDate,
                format || DEFAULT_DATE_FORMAT
              )
            : undefined,
        },
      },
    });
  }, [setArgs, format, call, instrument, experimentFromDate, experimentToDate]);

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
