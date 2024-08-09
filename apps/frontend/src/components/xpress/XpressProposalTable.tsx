import MaterialTable from '@material-table/core';
import React, { useState } from 'react';

import { tableIcons } from 'utils/materialIcons';

export interface ProposalData {
  proposalId: string;
  title: string;
  submittedDate: string;
}

const XpressProposalTable = () => {
  const [selectedProposals, setSelectedProposals] = useState<ProposalData[]>(
    []
  );

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      removable: false,
      field: 'rowActionButtons',
    },
    {
      title: 'Proposal ID',
      field: 'proposalId',
    },
    {
      title: 'Title',
      field: 'title',
      ...{ width: 'auto' },
    },
    {
      title: 'Date submitted',
      field: 'submittedDate',
      ...{ width: 'auto' },
    },
  ];

  const dummyRows: ProposalData[] = [
    { proposalId: '001', title: 'Proposal 1', submittedDate: '2024-08-01' },
    { proposalId: '002', title: 'Proposal 2', submittedDate: '2024-08-03' },
    { proposalId: '003', title: 'Proposal 3', submittedDate: '2024-08-05' },
    { proposalId: '004', title: 'Proposal 4', submittedDate: '2024-08-07' },
    { proposalId: '005', title: 'Proposal 5', submittedDate: '2024-08-09' },
  ];

  const handleSelectionChange = (rows: ProposalData[]) => {
    setSelectedProposals(rows);
  };

  return (
    <MaterialTable<ProposalData>
      icons={tableIcons}
      title={'Xpress Proposals'}
      columns={columns}
      data={dummyRows}
      totalCount={20}
      options={{
        search: true,
        searchText: undefined,
        selection: true,
        headerSelectionProps: {
          inputProps: { 'aria-label': 'Select All Rows' },
        },
        debounceInterval: 600,
        columnsButton: true,
        selectionProps: (rowData: ProposalData) => ({
          inputProps: {
            'aria-label': `${rowData.title}-select`,
          },
        }),
        pageSize: 20,
      }}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default XpressProposalTable;
