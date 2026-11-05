import MaterialTableCore, {
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import Edit from '@mui/icons-material/Edit';
import { DialogContent, Typography, Link } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import MaterialTable from 'components/common/DenseMaterialTable';
import StyledDialog from 'components/common/StyledDialog';
import { Institution, PaginationSortDirection } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import UpdateInstitution from './UpdateInstitution';

const columns: Column<Institution>[] = [
  { title: 'Name', field: 'name' },
  { title: 'Country', field: 'country.value' },
  {
    title: 'ROR ID',
    field: 'rorId',
    render: (rowData: Institution) => {
      return rowData.rorId ? (
        <Link href={rowData.rorId} target="_blank" title={rowData.rorId}>
          {rowData.rorId}
        </Link>
      ) : (
        '-'
      );
    },
  },
];

const InstitutionPage = () => {
  const { api } = useDataApiWithFeedback();
  const tableRef = useRef<MaterialTableCore<Institution>>(null);
  const [editInstitution, setEditInstitution] = useState<Institution | null>(
    null
  );

  const fetchInstitutions = useCallback(
    async (query: Query<Institution>): Promise<QueryResult<Institution>> => {
      const [orderBy] = query.orderByCollection;
      const fetchPage = (page: number) =>
        api().getInstitutionsPage({
          first: query.pageSize,
          offset: page * query.pageSize,
          searchText: query.search,
          sortField: orderBy?.orderDirection ? orderBy.orderByField : undefined,
          sortDirection:
            orderBy?.orderDirection === PaginationSortDirection.ASC
              ? PaginationSortDirection.ASC
              : orderBy?.orderDirection === PaginationSortDirection.DESC
                ? PaginationSortDirection.DESC
                : undefined,
        });
      let { institutionsPage } = await fetchPage(query.page);
      if (!institutionsPage) {
        throw new Error('Unable to load institutions');
      }
      const page = Math.min(
        query.page,
        Math.max(0, Math.ceil(institutionsPage.totalCount / query.pageSize) - 1)
      );
      if (page !== query.page) {
        ({ institutionsPage } = await fetchPage(page));
        if (!institutionsPage) {
          throw new Error('Unable to load institutions');
        }
      }

      return {
        data: institutionsPage.institutions,
        page,
        totalCount: institutionsPage.totalCount,
      };
    },
    [api]
  );

  const EditIcon = () => <Edit />;

  return (
    <div data-cy="institutions-table">
      <StyledDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        data-cy="create-modal"
        open={!!editInstitution}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          setEditInstitution(null);
        }}
        title="Update institution"
      >
        <DialogContent dividers>
          {editInstitution && (
            <UpdateInstitution
              institution={editInstitution}
              close={(institution) => {
                setEditInstitution(null);
                if (institution) {
                  tableRef.current?.onQueryChange({});
                }
              }}
            />
          )}
        </DialogContent>
      </StyledDialog>
      <MaterialTable
        tableRef={tableRef}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Institutions
          </Typography>
        }
        columns={columns}
        data={fetchInstitutions}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            position: 'row',
            onClick: (_event, rowData) => {
              if (!Array.isArray(rowData)) {
                setEditInstitution(rowData);
              }
            },
          },
        ]}
        editable={{
          onRowDelete: async (institution) => {
            await api({
              toastSuccessMessage: 'Institution removed successfully!',
            }).deleteInstitution({ id: institution.id });
          },
        }}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

export default InstitutionPage;
