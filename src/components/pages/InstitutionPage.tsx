import { IconButton } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Done } from '@material-ui/icons';
import MaterialTable from 'material-table';
import React, { useState, useEffect } from 'react';

import { Institution } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { ContentContainer, StyledPaper } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';

const InstitutionPage: React.FC = () => {
  const api = useDataApi();
  const [dataList, setData] = useState<Institution[] | undefined | null>([]);
  const ApproveIcon = (): JSX.Element => <Done />;

  useEffect(() => {
    api()
      .getInstitutions()
      .then(data => setData(data.institutions));
  }, []);

  const verifyInstitution = (id: number) => {
    api()
      .updateInstitution({
        id: id,
        verified: true,
      })
      .then(resp => {
        if (!resp.updateInstitution.error && dataList) {
          const i = dataList?.findIndex(inst => inst.id === id);
          const tmp = [...dataList];
          tmp[i].verified = true;
          setData(tmp);
        }
      });
  };

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and want to hide based on propoerties like verified
   */
  const RowActionButtons = (rowData: Institution) => (
    <>
      {!rowData.verified && (
        <IconButton
          onClick={() => verifyInstitution((rowData as Institution).id)}
        >
          <ApproveIcon />
        </IconButton>
      )}
    </>
  );

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Name', field: 'name' },
    { title: 'Verified', field: 'verified' },
  ];

  if (!dataList) {
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
                data={dataList as Institution[]}
                options={{
                  search: true,
                  debounceInterval: 400,
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
