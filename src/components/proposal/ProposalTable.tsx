import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import FileCopy from '@material-ui/icons/FileCopy';
import GetAppIcon from '@material-ui/icons/GetApp';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { Call } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { getProposalStatus } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { timeAgo } from 'utils/Time';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalClone from './CallSelectModalOnProposalClone';
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
  const [openCallSelection, setOpenCallSelection] = useState(false);
  const [proposalToCloneId, setProposalToCloneId] = useState<number | null>(
    null
  );

  useEffect(() => {
    searchQuery().then((data) => {
      if (data) {
        setPartialProposalsData(data.data);
      }
    });
  }, [searchQuery]);

  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Status', field: 'publicStatus' },
    {
      title: 'Call',
      render: (rowData: PartialProposalsDataType) => rowData.call?.shortCode,
    },
    { title: 'Created', field: 'created' },
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalEdit/${editProposalID}`} />;
  }

  const cloneProposalToCall = async (call: Call) => {
    setProposalToCloneId(null);

    if (!call?.id || !proposalToCloneId) {
      return;
    }

    const result = await api('Proposal cloned successfully').cloneProposal({
      callId: call.id,
      proposalToCloneId,
    });

    const resultProposal = result.cloneProposal.proposal;

    if (!result.cloneProposal.error && partialProposalsData && resultProposal) {
      const newClonedProposal = {
        id: resultProposal.id,
        title: resultProposal.title,
        status: getProposalStatus(resultProposal),
        publicStatus: resultProposal.publicStatus,
        submitted: resultProposal.submitted,
        shortCode: resultProposal.shortCode,
        created: timeAgo(resultProposal.created),
        notified: resultProposal.notified,
        proposerId: resultProposal.proposer?.id,
        call: resultProposal.call,
      };

      const newProposalsData = [newClonedProposal, ...partialProposalsData];

      setPartialProposalsData(newProposalsData);
    }
  };

  return (
    <div data-cy="proposal-table">
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openCallSelection}
        onClose={(): void => setOpenCallSelection(false)}
      >
        <DialogContent>
          <CallSelectModalOnProposalClone
            cloneProposalToCall={cloneProposalToCall}
            close={(): void => setOpenCallSelection(false)}
          />
        </DialogContent>
      </Dialog>
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
          (rowData) => {
            return {
              icon: rowData.submitted ? () => <Visibility /> : () => <Edit />,
              tooltip: rowData.submitted ? 'View proposal' : 'Edit proposal',
              onClick: (event, rowData) =>
                setEditProposalID((rowData as PartialProposalsDataType).id),
            };
          },
          {
            icon: FileCopy,
            tooltip: 'Clone proposal',
            onClick: (event, rowData) => {
              setProposalToCloneId((rowData as PartialProposalsDataType).id);
              setOpenCallSelection(true);
            },
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
          (rowData) => {
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
                          (item) => item.id !== deletedProposal?.id
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
    </div>
  );
};

ProposalTable.propTypes = {
  title: PropTypes.string.isRequired,
  search: PropTypes.bool.isRequired,
  searchQuery: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default withConfirm(ProposalTable);
