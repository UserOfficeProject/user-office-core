import { Dialog, DialogContent, makeStyles, Button } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import MaterialTable from 'material-table';
import React, { useState } from 'react';
import { Redirect } from 'react-router';

import { Sep } from '../../generated/sdk';
import { useSEPsData } from '../../hooks/useSEPsData';
import { ButtonContainer } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import AddSEP from './AddSEP';

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPsTableOfficer: React.FC = () => {
  const [show, setShow] = useState(false);
  const { loading, SEPsData } = useSEPsData(show, '');
  const classes = useStyles();
  const columns = [
    { title: 'SEP ID', field: 'id' },
    { title: 'Code', field: 'code' },
    { title: 'Description', field: 'description' },
    {
      title: 'Active',
      field: 'active',
      render: (rowData: Sep): string => (rowData.active ? 'Yes' : 'No'),
    },
  ];
  const [editSEPID, setEditSEPID] = useState(0);

  if (editSEPID) {
    return <Redirect push to={`/SEPPage/${editSEPID}`} />;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  const EditIcon = (): JSX.Element => <Edit />;

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={(): void => setShow(false)}
      >
        <DialogContent>
          <AddSEP close={(): void => setShow(false)} />
        </DialogContent>
      </Dialog>
      <div data-cy="SEPs-table">
        <MaterialTable
          icons={tableIcons}
          title={'Scientific evaluation panels'}
          columns={columns}
          data={SEPsData}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          actions={[
            {
              icon: EditIcon,
              tooltip: 'Edit SEP',
              onClick: (event, rowData): void =>
                setEditSEPID((rowData as Sep).id),
              position: 'row',
            },
          ]}
        />
        <ButtonContainer>
          <Button
            type="button"
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={(): void => setShow(true)}
          >
            Create SEP
          </Button>
        </ButtonContainer>
      </div>
    </>
  );
};

export default SEPsTableOfficer;
