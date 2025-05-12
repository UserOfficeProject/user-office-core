import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import {
  GetAllExperimentsQuery,
  SettingsId,
  WorkflowType,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';

import { DEFAULT_DATE_FORMAT } from './DateFilter';
import ExperimentVisitsTable from './ExperimentVisitsTable';

type RowType = GetAllExperimentsQuery['allExperiments'][0];

function ExperimentTable() {
  const [searchParams] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');
  const experimentFromDate = searchParams.get('from');
  const experimentToDate = searchParams.get('to');

  const { experiments, loadingEvents, setArgs } = useExperiments({});
  const {
    statuses: experimentStatuses,
    loadingStatuses: loadingExperimentStatuses,
  } = useStatusesData(WorkflowType.EXPERIMENT);
  const { toFormattedDateTime, format } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const columns = React.useCallback(
    (t: TFunction<'translation', undefined>) => [
      {
        title: 'Experiment ID',
        field: 'experimentId',
        render: (rowData: RowType) => (
          <a href={`/experiments/${rowData.experimentId}`}>
            {rowData.experimentId}
          </a>
        ),
      },
    ],
    [experimentStatuses.toString(), toFormattedDateTime]
  );

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

  const ExperimentDetails = React.useCallback(
    ({ rowData }: Record<'rowData', RowType>) => {
      return <ExperimentVisitsTable experiment={rowData} />;
    },
    []
  );

  return (
    <MaterialTable
      icons={tableIcons}
      localization={tableLocalization} //todo: What is this
      title={
        <Typography variant="h6" component="h2">
          Experiments
        </Typography>
      }
      columns={columns(t)}
      data={experiments}
      isLoading={loadingEvents || loadingExperimentStatuses}
      options={{
        search: false,
      }}
      detailPanel={[
        {
          tooltip: 'Show details',
          render: ExperimentDetails,
        },
      ]}
    />
  );
}

export default ExperimentTable;
