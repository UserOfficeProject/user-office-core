import DoneAll from '@material-ui/icons/DoneAll';
import MaterialTable, { Options } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import DialogConfirmation from 'components/common/DialogConfirmation';
import { InstrumentWithAvailabilityTime, UserRole } from 'generated/sdk';
import { useInstrumentsBySEPData } from 'hooks/instrument/useInstrumentsBySEPData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import SEPInstrumentProposalsTable from './SEPInstrumentProposalsTable';

type SEPMeetingInstrumentsTableProps = {
  sepId: number;
  Toolbar: (data: Options) => JSX.Element;
  selectedCallId: number;
};

const SEPMeetingInstrumentsTable: React.FC<SEPMeetingInstrumentsTableProps> = ({
  sepId,
  selectedCallId,
  Toolbar,
}) => {
  const {
    loadingInstruments,
    instrumentsData,
    setInstrumentsData,
  } = useInstrumentsBySEPData(sepId, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [
    instrumentToSubmit,
    setInstrumentToSubmit,
  ] = useState<InstrumentWithAvailabilityTime | null>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Availability time',
      render: (rowData: InstrumentWithAvailabilityTime) =>
        rowData.availabilityTime ? rowData.availabilityTime : '-',
    },
    {
      title: 'Submitted',
      render: (rowData: InstrumentWithAvailabilityTime) =>
        rowData.submitted ? 'Yes' : 'No',
    },
  ];

  const SEPInstrumentProposalsTableComponent = (
    instrument: InstrumentWithAvailabilityTime
  ) => (
    <SEPInstrumentProposalsTable
      sepId={sepId}
      sepInstrument={instrument}
      selectedCallId={selectedCallId}
    />
  );

  const submitInstrument = async () => {
    if (instrumentToSubmit) {
      const { submitInstrument } = await api(
        'Instrument submitted!'
      ).submitInstrument({
        callId: selectedCallId,
        instrumentId: instrumentToSubmit.id,
        sepId: sepId,
      });

      const isError = submitInstrument.error || !submitInstrument.isSuccess;

      if (!isError) {
        const newInstrumentsData = instrumentsData.map(instrument => {
          if (instrument.id === instrumentToSubmit.id) {
            return { ...instrument, submitted: true };
          }

          return instrument;
        });

        setInstrumentsData(newInstrumentsData);
      }

      setInstrumentToSubmit(null);
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
        onClick: () => {
          setInstrumentToSubmit(rowData as InstrumentWithAvailabilityTime);
        },
        tooltip: 'Submit instrument',
      })
    );
  }

  return (
    <div data-cy="SEP-meeting-components-table">
      <DialogConfirmation
        title="Submit instrument"
        text="Are you sure you want to submit the instrument?"
        open={!!instrumentToSubmit}
        action={submitInstrument}
        handleOpen={() => setInstrumentToSubmit(null)}
      />
      <MaterialTable
        icons={tableIcons}
        title={'Instruments with proposals'}
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

SEPMeetingInstrumentsTable.propTypes = {
  sepId: PropTypes.number.isRequired,
  selectedCallId: PropTypes.number.isRequired,
  Toolbar: PropTypes.func.isRequired,
};

export default SEPMeetingInstrumentsTable;
