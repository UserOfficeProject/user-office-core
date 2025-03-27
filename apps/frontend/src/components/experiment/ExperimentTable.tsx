import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import ExperimentSafetyReview from 'components/experimentSafetyReview/ExperimentSafetyReview';
import { GetExperimentsQuery, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useExperiments } from 'hooks/experiment/useExperiments';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import { getFullUserName } from 'utils/user';

import { DEFAULT_DATE_FORMAT } from './DateFilter';
import ExperimentVisitsTable from './ExperimentVisitsTable';

type RowType = GetExperimentsQuery['experiments'][0];

function ExperimentTable() {
  const [searchParams] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');
  const experimentFromDate = searchParams.get('from');
  const experimentToDate = searchParams.get('to');
  const { experiments, loadingEvents, setArgs } = useExperiments({});

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
      title: 'Experiment Safety',
      render: (rowData: RowType) =>
        rowData.experimentSafety ? (
          <ButtonWithDialog
            label="Review Experiment Safety"
            title="Review Experiment Safety"
          >
            <ExperimentSafetyReview
              experimentSafetyPk={rowData.experimentSafety.experimentSafetyPk}
            />
          </ButtonWithDialog>
        ) : (
          'No Experiment Safety'
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

  const ExperimentDetails = React.useCallback(
    ({ rowData }: Record<'rowData', RowType>) => {
      return <ExperimentVisitsTable experiment={rowData} />;
    },
    []
  );

  return (
    <MaterialTable
      icons={tableIcons}
      localization={tableLocalization}
      title={
        <Typography variant="h6" component="h2">
          Experiments
        </Typography>
      }
      columns={columns(t)}
      data={experiments}
      isLoading={loadingEvents}
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
