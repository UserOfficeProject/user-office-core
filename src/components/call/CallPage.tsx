import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import { Add } from '@material-ui/icons';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import React, { useState } from 'react';

import { Call } from '../../generated/sdk';
import { useCallsData } from '../../hooks/useCallsData';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import AddCall from './AddCall';

const CallPage: React.FC = () => {
  const [show, setShow] = useState(false);
  const { loading, callsData } = useCallsData(show);

  const columns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: 'Start Date',
      field: 'startCall',
      render: (rowData: Call): string =>
        dateformat(new Date(rowData.startCall), 'dd-mmm-yyyy'),
    },
    {
      title: 'End Date',
      field: 'endCall',
      render: (rowData: Call): string =>
        dateformat(new Date(rowData.endCall), 'dd-mmm-yyyy'),
    },
  ];

  if (loading) {
    return <p>Loading</p>;
  }

  const AddIcon = (): JSX.Element => <Add data-cy="add-call" />;

  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={(): void => setShow(false)}
      >
        <DialogContent>
          <AddCall close={(): void => setShow(false)} />
        </DialogContent>
      </Dialog>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <MaterialTable
                icons={tableIcons}
                title="Calls"
                columns={columns}
                data={callsData as Call[]}
                options={{
                  search: false,
                }}
                actions={[
                  {
                    icon: AddIcon,
                    isFreeAction: true,
                    tooltip: 'Add Call',
                    onClick: (): void => setShow(true),
                  },
                ]}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
};

export default CallPage;
