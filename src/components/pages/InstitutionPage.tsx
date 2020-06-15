import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React from 'react';

import { useDataApi } from '../../hooks/useDataApi';
import { useInstitutionData } from '../../hooks/useInstitutionData';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';

const InstitutionPage: React.FC = () => {
  const api = useDataApi();
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

  const createInstitution = (name: string, verified: boolean) => {
    api()
      .createInstitution({
        name: name,
        verified: verified,
      })
      .then(resp => {
        if (!resp.createInstitution.error && institutionData) {
          const tmp = [...institutionData];
          tmp.push({
            id: resp.createInstitution.institution?.id || 0,
            name: name,
            verified: verified,
          });
          setInstitutionData(tmp);
        } else {
          enqueueSnackbar('Failed to create', {
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
                  onRowAdd: (newData: {
                    verified: boolean | string;
                    name: string;
                  }) =>
                    new Promise(resolve => {
                      if (!(typeof newData.verified === 'boolean')) {
                        newData.verified = newData.verified === 'true';
                      }
                      createInstitution(newData.name, newData.verified);
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
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
};

export default InstitutionPage;
