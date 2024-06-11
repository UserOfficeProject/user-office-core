import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import DoneAll from '@mui/icons-material/DoneAll';
import GridOnIcon from '@mui/icons-material/GridOn';
import { Typography } from '@mui/material';
import i18n from 'i18n';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import MaterialTable from 'components/common/DenseMaterialTable';
import FapInstrumentProposalsTable from 'components/fap/MeetingComponents/FapInstrumentProposalsTable';
import { Call, InstrumentWithAvailabilityTime, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useDownloadXLSXFap } from 'hooks/fap/useDownloadXLSXFap';
import { useInstrumentsByFapData } from 'hooks/instrument/useInstrumentsByFapData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import FapUpdateInstrumentTime from './FapUpdateInstrumentTime';

type FapMeetingInstrumentsTableProps = {
  fapId: number;
  selectedCall: Call;
  confirm: WithConfirmType;
  code: string;
};

const instrumentTableColumns = [
  { title: 'Name', field: 'name' },
  { title: 'Short code', field: 'shortCode' },
  { title: 'Description', field: 'description' },
  {
    title: 'Availability time',
    field: 'availabilityTime',
    emptyValue: '-',
  },
  {
    title: 'Submitted',
    field: 'submitted',
    lookup: { true: 'Yes', false: 'No' },
  },
];

const FapMeetingInstrumentsTable = ({
  fapId,
  selectedCall,
  confirm,
  code,
}: FapMeetingInstrumentsTableProps) => {
  const { loadingInstruments, instrumentsData, setInstrumentsData } =
    useInstrumentsByFapData(fapId, selectedCall.id);
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const downloadFapXLSX = useDownloadXLSXFap();
  const [updateInstrumentTime, setUpdateInstrumentTime] =
    useState<InstrumentWithAvailabilityTime | null>(null);

  const columns = instrumentTableColumns.map((column) => ({
    ...column,
    title:
      column.field === 'availabilityTime'
        ? `${column.title} (${selectedCall.allocationTimeUnit}s)`
        : column.title,
  }));

  const FapInstrumentProposalsTableComponent = React.useCallback(
    ({ rowData }: { rowData: InstrumentWithAvailabilityTime }) => {
      return (
        <FapInstrumentProposalsTable
          fapId={fapId}
          fapInstrument={rowData}
          selectedCall={selectedCall}
        />
      );
    },
    [fapId, selectedCall]
  );

  const submitInstrument = async (
    instrumentToSubmit: InstrumentWithAvailabilityTime
  ) => {
    if (!selectedCall) {
      return;
    }

    if (instrumentToSubmit) {
      const response = await api().fapProposalsByInstrument({
        instrumentId: instrumentToSubmit.id,
        fapId: fapId,
        callId: selectedCall.id,
      });
      const allProposalsOnInstrumentHaveRankings =
        response.fapProposalsByInstrument?.every(
          ({ proposal }) => !!proposal.fapMeetingDecision?.submitted
        );

      if (allProposalsOnInstrumentHaveRankings) {
        const { submitInstrument } = await api({
          toastSuccessMessage: 'Instrument submitted!',
        }).submitInstrument({
          callId: selectedCall.id,
          instrumentId: instrumentToSubmit.id,
          fapId: fapId,
        });
        if (submitInstrument) {
          const newInstrumentsData = instrumentsData.map((instrument) => {
            if (instrument.id === instrumentToSubmit.id) {
              return { ...instrument, submitted: true };
            }

            return instrument;
          });
          setInstrumentsData(newInstrumentsData);
        }
      } else {
        enqueueSnackbar('All proposal Fap meetings should be submitted', {
          variant: 'error',
          className: 'snackbar-error',
        });
      }
    }
  };

  const DoneAllIcon = (): JSX.Element => <DoneAll />;
  const AddTimeIcon = (): JSX.Element => <AddAlarmIcon />;

  const accessDependentActions = [];

  if (hasAccessRights) {
    accessDependentActions.push(
      (
        rowData:
          | InstrumentWithAvailabilityTime
          | InstrumentWithAvailabilityTime[]
      ) => ({
        icon: DoneAllIcon,
        disabled: !!(rowData as InstrumentWithAvailabilityTime).submitted,
        onClick: (
          event: Event,
          rowData:
            | InstrumentWithAvailabilityTime
            | InstrumentWithAvailabilityTime[]
        ) =>
          confirm(
            () => {
              submitInstrument(rowData as InstrumentWithAvailabilityTime);
            },
            {
              title: 'Submit ' + i18n.format(t('instrument'), 'lowercase'),
              description: `No further changes to Fap meeting decisions and rankings are possible after submission. Are you sure you want to submit the ${t(
                'instrument'
              )}?`,
            }
          )(),
        tooltip: 'Submit ' + i18n.format(t('instrument'), 'lowercase'),
      })
    );
    accessDependentActions.push((rowData: InstrumentWithAvailabilityTime) => ({
      icon: AddTimeIcon,
      onClick: () => {
        setUpdateInstrumentTime(rowData);
      },
      tooltip: 'Update ' + i18n.format(t('instrument'), 'lowercase') + ' Time',
    }));
  }

  const updatedInstrumentTime = (newTime: number, instrumentId: number) => {
    setInstrumentsData(
      instrumentsData.map((inst) =>
        inst.id === instrumentId ? { ...inst, availabilityTime: newTime } : inst
      )
    );
    setUpdateInstrumentTime(null);
  };

  return (
    <div data-cy="Fap-meeting-components-table">
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h1">
            {`${code} - ${i18n.format(
              t('instrument'),
              'plural'
            )} with proposals`}
          </Typography>
        }
        columns={columns}
        data={instrumentsData}
        isLoading={loadingInstruments}
        actions={[
          ...accessDependentActions,
          {
            icon: GridOnIcon,
            tooltip: 'Export in Excel',
            disabled: !selectedCall || loadingInstruments,
            onClick: (): void => {
              if (selectedCall.id) {
                downloadFapXLSX(
                  fapId,
                  selectedCall.id,
                  selectedCall.shortCode ?? 'unknown'
                );
              }
            },
            position: 'toolbar',
          },
        ]}
        detailPanel={[
          {
            tooltip: 'Show proposals',
            render: FapInstrumentProposalsTableComponent,
          },
        ]}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />

      {updateInstrumentTime && selectedCall && (
        <FapUpdateInstrumentTime
          close={(): void => setUpdateInstrumentTime(null)}
          updateTime={updatedInstrumentTime}
          callId={selectedCall.id}
          instrument={updateInstrumentTime}
        ></FapUpdateInstrumentTime>
      )}
    </div>
  );
};

export default withConfirm(FapMeetingInstrumentsTable);
