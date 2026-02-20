import { Column } from '@material-table/core';
import Visibility from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import { fromArrayToCommaSeparated } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import withConfirm from 'utils/withConfirm';

const columns: Column<ProposalViewData>[] = [
  {
    title: 'Proposal ID',
    field: 'proposalId',
    render: (rawData) => (
      <CopyToClipboard
        text={rawData.proposalId}
        successMessage={`'${rawData.proposalId}' copied to clipboard`}
        position="right"
      >
        {rawData.proposalId || ''}
      </CopyToClipboard>
    ),
  },

  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'statusName' },
  {
    title: t('instrument'),
    field: 'instrumentNames',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(rowData.instruments?.map((i) => i.name)),
  },
  {
    title: 'Call',
    field: 'callShortCode',
    emptyValue: '-',
  },
];

const PREFETCH_SIZE = 200;

const ProposalTableReader = () => {
  const [editProposalPk, setEditProposalPk] = useState<number | undefined>(
    undefined
  );

  const [queryParameters] = useState({
    query: {
      first: PREFETCH_SIZE,
      offset: 0,
      refetch: false,
    },
    searchText: undefined as string | undefined,
  });

  const { loading, proposalsData } = useProposalsCoreData(
    {},
    queryParameters.query
  );

  // Redirect to edit when set
  if (editProposalPk) {
    return <Navigate to={`/ProposalEdit/${editProposalPk}`} />;
  }

  const title = 'Proposals';
  const isLoading = loading;
  const search = true;

  return (
    <div data-cy="proposal-table">
      <MaterialTable
        icons={tableIcons}
        localization={tableLocalization}
        title={
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        }
        columns={columns}
        data={proposalsData}
        isLoading={isLoading}
        options={{
          search,
          debounceInterval: 400,
        }}
        actions={[
          (rowData: ProposalViewData) => ({
            icon: () => <Visibility />,
            tooltip: 'View proposal',
            onClick: () =>
              setEditProposalPk((rowData as ProposalViewData).primaryKey),
          }),
        ]}
      />
    </div>
  );
};

export default withConfirm(ProposalTableReader);
