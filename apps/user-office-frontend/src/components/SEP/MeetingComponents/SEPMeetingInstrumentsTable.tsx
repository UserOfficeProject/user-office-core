import MaterialTable, { Options } from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import { Typography } from '@mui/material';
import i18n from 'i18n';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCheckAccess } from 'components/common/Can';
import { Call, InstrumentWithAvailabilityTime, UserRole } from 'generated/sdk';
import { useInstrumentsBySEPData } from 'hooks/instrument/useInstrumentsBySEPData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import SEPInstrumentProposalsTable from './SEPInstrumentProposalsTable';

type SEPMeetingInstrumentsTableProps = {
  sepId: number;
  Toolbar: (data: Options<JSX.Element>) => JSX.Element;
  selectedCall?: Call;
  confirm: WithConfirmType;
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

const SEPMeetingInstrumentsTable = ({
  sepId,
  selectedCall,
  Toolbar,
  confirm,
}: SEPMeetingInstrumentsTableProps) => {
  const { loadingInstruments, instrumentsData, setInstrumentsData } =
    useInstrumentsBySEPData(sepId, selectedCall?.id);
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const columns = instrumentTableColumns.map((column) => ({
    ...column,
    title:
      column.field === 'availabilityTime'
        ? `${column.title} (${selectedCall?.allocationTimeUnit}s)`
        : column.title,
  }));

  const SEPInstrumentProposalsTableComponent = React.useCallback(
    ({ rowData }) => {
      return (
        <SEPInstrumentProposalsTable
          sepId={sepId}
          sepInstrument={rowData}
          selectedCall={selectedCall}
        />
      );
    },
    [sepId, selectedCall]
  );

  const submitInstrument = async (
    instrumentToSubmit: InstrumentWithAvailabilityTime
  ) => {
    if (!selectedCall) {
      return;
    }

    if (instrumentToSubmit) {
      const response = await api().sepProposalsByInstrument({
        instrumentId: instrumentToSubmit.id,
        sepId: sepId,
        callId: selectedCall.id,
      });
      const allProposalsOnInstrumentHaveRankings =
        response.sepProposalsByInstrument?.every(
          ({ proposal }) => !!proposal.sepMeetingDecision?.submitted
        );

      if (allProposalsOnInstrumentHaveRankings) {
        const { submitInstrument } = await api({
          toastSuccessMessage: 'Instrument submitted!',
        }).submitInstrument({
          callId: selectedCall.id,
          instrumentId: instrumentToSubmit.id,
          sepId: sepId,
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
        enqueueSnackbar(
          'All proposal ' + t('SEP') + ' meetings should be submitted',
          {
            variant: 'error',
            className: 'snackbar-error',
          }
        );
      }
    }
  };

  const DoneAllIcon = (): JSX.Element => <DoneAll />;

  const actions = [];

  if (hasAccessRights) {
    actions.push(
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
              description: `No further changes to ${t(
                'SEP'
              )} meeting decisions and rankings are possible after submission. Are you sure you want to submit the ${t(
                'instrument'
              )}?`,
            }
          )(),
        tooltip: 'Submit ' + i18n.format(t('instrument'), 'lowercase'),
      })
    );
  }

  return (
    <div data-cy="SEP-meeting-components-table">
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            {`${i18n.format(t('instrument'), 'plural')} with proposals`}
          </Typography>
        }
        columns={columns}
        components={{
          Toolbar: Toolbar,
        }}
        data={instrumentsData}
        isLoading={loadingInstruments}
        actions={actions}
        detailPanel={[
          {
            tooltip: 'Show proposals',
            render: SEPInstrumentProposalsTableComponent,
          },
        ]}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

export default withConfirm(SEPMeetingInstrumentsTable);
