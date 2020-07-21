import { Edit, Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';

import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { tableIcons } from 'utils/materialIcons';

import {
  UserProposalDataType,
  PartialProposalsDataType,
} from './ProposalTableUser';

type ProposalTableProps = {
  /** Error flag */
  title: string;
  /** Basic user details array to be shown in the modal. */
  search: boolean;
  /** Function for getting data. */
  searchQuery: () => Promise<UserProposalDataType>;
  /** Loading data indicator */
  isLoading: boolean;
};

const ProposalTable: React.FC<ProposalTableProps> = ({
  title,
  search,
  searchQuery,
  isLoading,
}) => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const [partialProposalsData, setPartialProposalsDataData] = useState<
    PartialProposalsDataType[] | undefined
  >([]);
  useEffect(() => {
    searchQuery().then(data => {
      if (data) {
        setPartialProposalsDataData(data.data);
      }
    });
  }, [searchQuery]);

  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    {
      title: 'Status',
      field: 'status',
    },
    { title: 'Created', field: 'created' },
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalEdit/${editProposalID}`} />;
  }

  const GetAppIconCompopnent = (): JSX.Element => <GetAppIcon />;

  return (
    <MaterialTable
      icons={tableIcons}
      title={title}
      columns={columns}
      data={partialProposalsData as PartialProposalsDataType[]}
      isLoading={isLoading}
      options={{
        search: search,
        debounceInterval: 400,
      }}
      actions={[
        rowData => {
          return {
            icon:
              rowData.status === 'Submitted' || rowData.status === 'Accepted'
                ? () => <Visibility />
                : () => <Edit />,
            tooltip:
              rowData.status === 'Submitted' || rowData.status === 'Accepted'
                ? 'View proposal'
                : 'Edit proposal',
            onClick: (event, rowData) =>
              setEditProposalID((rowData as PartialProposalsDataType).id),
          };
        },
        {
          icon: GetAppIconCompopnent,
          tooltip: 'Download proposal',
          onClick: (event, rowData) =>
            downloadPDFProposal((rowData as PartialProposalsDataType).id),
        },
      ]}
    />
  );
};

ProposalTable.propTypes = {
  title: PropTypes.string.isRequired,
  search: PropTypes.bool.isRequired,
  searchQuery: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default ProposalTable;
