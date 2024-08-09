import MaterialTable from '@material-table/core';
import React, { useEffect, useMemo, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
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
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    technique: StringParam,
  });

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

  const dummyRows: ProposalData[] = useMemo<ProposalData[]>(
    () => [
      { proposalId: '001', title: 'Proposal 1', submittedDate: '2024-08-01' },
      { proposalId: '002', title: 'Proposal 2', submittedDate: '2024-08-03' },
      { proposalId: '003', title: 'Proposal 3', submittedDate: '2024-08-05' },
      { proposalId: '004', title: 'Proposal 4', submittedDate: '2024-08-07' },
      { proposalId: '005', title: 'Proposal 5', submittedDate: '2024-08-09' },
    ],
    []
  );

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);
      const updatedSelection = dummyRows.filter((row) =>
        selection.has(row.proposalId)
      );

      setSelectedProposals(updatedSelection);
    } else {
      setSelectedProposals([]);
    }
  }, [dummyRows, urlQueryParams.selection]);

  const handleSelectionChange = (rows: ProposalData[]) => {
    setUrlQueryParams((params) => ({
      ...params,
      selection:
        rows.length > 0
          ? rows.map((row) => row.proposalId.toString())
          : undefined,
    }));
  };

  const handleSearchChange = (searchText: string) => {
    setUrlQueryParams({ search: searchText ? searchText : undefined });
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
      onSearchChange={handleSearchChange}
    />
  );
};

export default XpressProposalTable;
