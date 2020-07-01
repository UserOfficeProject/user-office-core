import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { useDataApi } from '../../hooks/useDataApi';
import { useInstitutionData } from '../../hooks/useInstitutionData';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import InputDialog from '../common/InputDialog';
import CreateInstitution from './CreateInstitution';

const InstitutionPage: React.FC = () => {
  const api = useDataApi();
  const [show, setShow] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { institutionData, setInstitutionData } = useInstitutionData();

  const deleteInstitution = (id: number) => {
    api()
      .deleteInstitution({
        id: id,
      })
      .then(resp => {
        if (!resp.deleteInstitution.error && institutionData) {
          const i = institutionData?.findIndex(inst => inst.id === id);
          const tmp = [...institutionData];
          tmp.splice(i, 1);
          setInstitutionData(tmp);
        } else {
          enqueueSnackbar('Failed to delete', {
            variant: 'error',
          });
        }
      });
  };

  const updateInstitution = (id: number, verified: boolean, name: string) => {
    api()
      .updateInstitution({
        id: id,
        name: name,
        verified: verified,
      })
      .then(resp => {
        if (!resp.updateInstitution.error && institutionData) {
          const i = institutionData?.findIndex(inst => inst.id === id);
          const tmp = [...institutionData];
          tmp[i].verified = verified;
          tmp[i].name = name;
          setInstitutionData(tmp);
        } else {
          enqueueSnackbar('Failed to update', {
            variant: 'error',
          });
        }
      });
  };

  const columns = [
    { title: 'Name', field: 'name' },
    {
      title: 'Verified',
      field: 'verified',
      lookup: { true: 'true', false: 'false' },
    },
  ];

  if (!institutionData) {
    return <p>Loading</p>;
  }

  return (
    <>
      <InputDialog open={show} onClose={() => setShow(false)}>
        <CreateInstitution
          onComplete={newInstitution => {
            if (newInstitution) {
              setInstitutionData([...institutionData, newInstitution]);
            }
            setShow(false);
          }}
        />
      </InputDialog>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <MaterialTable
                icons={tableIcons}
                title={'Institutions'}
                columns={columns}
                data={institutionData}
                options={{
                  search: true,
                  debounceInterval: 400,
                }}
                editable={{
                  onRowDelete: (oldData: { id: number }) =>
                    new Promise(resolve => {
                      deleteInstitution(oldData.id);
                      resolve();
                    }),
                  onRowUpdate: (data: {
                    id: number;
                    name: string;
                    verified: boolean | string;
                  }) =>
                    new Promise(resolve => {
                      if (!(typeof data.verified === 'boolean')) {
                        data.verified = data.verified === 'true';
                      }
                      updateInstitution(data.id, data.verified, data.name);
                      resolve();
                    }),
                }}
              />
              <ActionButtonContainer>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={() => setShow(true)}
                >
                  Create institution
                </Button>
              </ActionButtonContainer>
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
};

export default InstitutionPage;
