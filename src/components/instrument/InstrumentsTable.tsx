import { Dialog, DialogContent, makeStyles, Button } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Instrument, UserRole } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useInstrumentsData } from '../../hooks/useInstrumentsData';
import { ButtonContainer } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import Can from '../common/Can';
import CreateUpdateInstrument from './CreateUpdateInstrument';

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const InstrumentsTable: React.FC = () => {
  const [show, setShow] = useState(false);
  const { loading, instrumentsData, setInstrumentsData } = useInstrumentsData();
  const classes = useStyles();
  const columns = [
    { title: 'Instrument ID', field: 'instrumentId' },
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
  ];
  const [editInstrument, setEditInstrument] = useState<Instrument | null>(null);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  if (loading) {
    return <p>Loading...</p>;
  }

  const onInstrumentCreated = (instrumentAdded: Instrument | null) => {
    instrumentAdded &&
      setInstrumentsData([...instrumentsData, instrumentAdded]);

    setShow(false);
  };

  const onInstrumentUpdated = (instrumentUpdated: Instrument | null) => {
    if (instrumentUpdated) {
      const newInstrumentsArray = instrumentsData.map(instrumentItem =>
        instrumentItem.instrumentId === instrumentUpdated.instrumentId
          ? instrumentUpdated
          : instrumentItem
      );

      setInstrumentsData(newInstrumentsArray);
    }

    setEditInstrument(null);
  };

  const onInstrumentDelete = async (instrumentDeletedId: number) => {
    const deleteInstrumentResult = await api().deleteInstrument({
      instrumentId: instrumentDeletedId,
    });

    const isError = !!deleteInstrumentResult.deleteInstrument.error;

    enqueueSnackbar('Instrument deleted', {
      variant: isError ? 'error' : 'success',
    });

    if (!isError) {
      const newInstrumentsArray = instrumentsData.filter(
        instrumentItem => instrumentItem.instrumentId !== instrumentDeletedId
      );

      setInstrumentsData(newInstrumentsArray);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!editInstrument || show}
        onClose={(): void =>
          !!editInstrument ? setEditInstrument(null) : setShow(false)
        }
      >
        <DialogContent>
          <CreateUpdateInstrument
            instrument={editInstrument as Instrument}
            close={(instrument: Instrument | null): void =>
              !!editInstrument
                ? onInstrumentUpdated(instrument)
                : onInstrumentCreated(instrument)
            }
          />
        </DialogContent>
      </Dialog>
      <div data-cy="instruments-table">
        <MaterialTable
          icons={tableIcons}
          title={'Instruments'}
          columns={columns}
          data={instrumentsData}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          editable={{
            onRowDelete: (rowInstrumentData: Instrument): Promise<void> =>
              onInstrumentDelete(rowInstrumentData.instrumentId),
          }}
          actions={[
            {
              icon: EditIcon,
              tooltip: 'Edit Instrument',
              onClick: (event, rowData): void =>
                setEditInstrument(rowData as Instrument),
              position: 'row',
            },
          ]}
        />
        <Can
          allowedRoles={[UserRole.USER_OFFICER]}
          yes={() => (
            <ButtonContainer>
              <Button
                type="button"
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={(): void => setShow(true)}
              >
                Create instrument
              </Button>
            </ButtonContainer>
          )}
          no={() => null}
        ></Can>
      </div>
    </>
  );
};

export default InstrumentsTable;
