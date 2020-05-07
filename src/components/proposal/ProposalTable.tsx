import { Edit, Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable, { Query, QueryResult } from 'material-table';
import React, { useState } from 'react';
import { Redirect } from 'react-router';

import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { ProposalData } from '../../hooks/useProposalsData';
import { tableIcons } from '../../utils/materialIcons';

export default function ProposalTable(props: {
  title: string;
  searchQuery: (x: Query<ProposalData>) => Promise<QueryResult<ProposalData>>;
  search: boolean;
}) {
  const downloadPDFProposal = useDownloadPDFProposal();
  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Status', field: 'status' },
    { title: 'Created', field: 'created' },
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalEdit/${editProposalID}`} />;
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title={props.title}
      columns={columns}
      data={(query: Query<ProposalData>) => props.searchQuery(query)}
      options={{
        search: props.search,
        debounceInterval: 400,
      }}
      actions={[
        rowData => {
          return {
            icon:
              rowData.status === 'Submitted'
                ? () => <Visibility />
                : () => <Edit />,
            tooltip:
              rowData.status === 'Submitted'
                ? 'View proposal'
                : 'Edit proposal',
            onClick: (event, rowData) =>
              setEditProposalID(Array.isArray(rowData) ? 0 : rowData.id),
          };
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: 'Download proposal',
          onClick: (event, rowData) =>
            downloadPDFProposal(Array.isArray(rowData) ? 0 : rowData.id),
        },
      ]}
    />
  );
}
