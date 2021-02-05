import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import {
  PartialProposalsDataType,
  UserProposalDataType,
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
  confirm: WithConfirmType;
};

const ProposalTable = ({
  title,
  search,
  searchQuery,
  isLoading,
  confirm,
}: ProposalTableProps) => {
  const userContext = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const downloadPDFProposal = useDownloadPDFProposal();
  const [partialProposalsData, setPartialProposalsData] = useState<
    PartialProposalsDataType[] | undefined
  >([]);
  useEffect(() => {
    searchQuery().then(data => {
      if (data) {
        setPartialProposalsData(data.data);
      }
    });
  }, [searchQuery]);

  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Status', field: 'publicStatus' },
    { title: 'Created', field: 'created' },
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalEdit/${editProposalID}`} />;
  }

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
            icon: rowData.submitted ? () => <Visibility /> : () => <Edit />,
            tooltip: rowData.submitted ? 'View proposal' : 'Edit proposal',
            onClick: (event, rowData) =>
              setEditProposalID((rowData as PartialProposalsDataType).id),
          };
        },
        {
          icon: GetAppIcon,
          tooltip: 'Download proposal',
          onClick: (event, rowData) =>
            downloadPDFProposal(
              [(rowData as PartialProposalsDataType).id],
              (rowData as PartialProposalsDataType).title
            ),
        },
        rowData => {
          const isPI = rowData.proposerId === userContext.user.id;
          const isSubmitted = rowData.submitted;
          const canDelete = isPI && !isSubmitted;

          return {
            icon: DeleteIcon,
            tooltip: isSubmitted
              ? 'Only draft proposals can be deleted'
              : !isPI
              ? 'Only PI can delete proposal'
              : 'Delete proposal',
            disabled: !canDelete,
            onClick: (_event, rowData) =>
              confirm(
                async () => {
                  const deletedProposal = (
                    await api().deleteProposal({
                      id: (rowData as PartialProposalsDataType).id,
                    })
                  ).deleteProposal.proposal;
                  if (deletedProposal) {
                    setPartialProposalsData(
                      partialProposalsData?.filter(
                        item => item.id !== deletedProposal?.id
                      )
                    );
                  }
                },
                {
                  title: 'Are you sure?',
                  description: `Are you sure you want to delete proposal '${
                    (rowData as PartialProposalsDataType).title
                  }'`,
                }
              )(),
          };
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

export default withConfirm(ProposalTable);
