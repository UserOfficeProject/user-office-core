import MaterialTable from '@material-table/core';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { Call } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import { timeAgo } from 'utils/Time';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalsClone from './CallSelectModalOnProposalClone';
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

const columns = [
  { title: 'Proposal ID', field: 'proposalId' },
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'publicStatus' },
  {
    title: 'Call',
    field: 'call.shortCode',
    emptyValue: '-',
  },
  { title: 'Created', field: 'created' },
];

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
  const [proposalToClone, setProposalToClone] = useState<Pick<
    ProposalData,
    'primaryKey' | 'questionary'
  > | null>(null);

  // TODO: This api call here should be replaced with a hook for getting user proposals.
  useEffect(() => {
    let unmounted = false;

    searchQuery().then((data) => {
      if (unmounted) {
        return;
      }

      if (data) {
        setPartialProposalsData(data.data);
      }
    });

    return () => {
      unmounted = true;
    };
  }, [searchQuery]);

  const [editProposalPk, setEditProposalPk] = useState(0);

  if (editProposalPk) {
    return <Redirect push to={`/ProposalEdit/${editProposalPk}`} />;
  }

  const showReferenceText = (
    proposalData: PartialProposalsDataType[]
  ): boolean => {
    return proposalData.some((proposal) => {
      return proposal.call?.referenceNumberFormat && !proposal.submitted;
    });
  };

  const cloneProposalsToCall = async (call: Call) => {
    setProposalToClone(null);

    if (!call?.id || !proposalToClone) {
      return;
    }

    const result = await api({
      toastSuccessMessage: 'Proposal cloned successfully',
    }).cloneProposals({
      callId: call.id,
      proposalsToClonePk: [proposalToClone.primaryKey],
    });

    const [resultProposal] = result.cloneProposals.proposals ?? [];

    if (
      !result.cloneProposals.rejection &&
      partialProposalsData &&
      resultProposal
    ) {
      const newClonedProposal = {
        primaryKey: resultProposal.primaryKey,
        title: resultProposal.title,
        status: resultProposal.status,
        publicStatus: resultProposal.publicStatus,
        submitted: resultProposal.submitted,
        proposalId: resultProposal.proposalId,
        created: timeAgo(resultProposal.created),
        notified: resultProposal.notified,
        proposerId: resultProposal.proposer?.id,
        call: resultProposal.call,
      };

      const newProposalsData = [newClonedProposal, ...partialProposalsData];

      setPartialProposalsData(newProposalsData);
    }
  };
  const data = partialProposalsData as PartialProposalsDataType[];

  return (
    <div data-cy="proposal-table">
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openCallSelection}
        onClose={(): void => setOpenCallSelection(false)}
      >
        <DialogContent>
          <CallSelectModalOnProposalsClone
            cloneProposalsToCall={cloneProposalsToCall}
            close={(): void => setOpenCallSelection(false)}
            templateId={proposalToClone?.questionary.templateId}
          />
        </DialogContent>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        localization={tableLocalization}
        title={
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        }
        columns={columns}
        data={data}
        isLoading={isLoading}
        options={{
          search: search,
          debounceInterval: 400,
        }}
        actions={[
          (rowData) => {
            const isCallActive = rowData.call?.isActive ?? true;
            const readOnly =
              !isCallActive ||
              (rowData.submitted &&
                rowData.status?.shortCode !== 'EDITABLE_SUBMITTED');

            return {
              icon: readOnly ? () => <Visibility /> : () => <Edit />,
              tooltip: readOnly ? 'View proposal' : 'Edit proposal',
              onClick: (event, rowData) =>
                setEditProposalPk(
                  (rowData as PartialProposalsDataType).primaryKey
                ),
            };
          },
          {
            icon: FileCopy,
            tooltip: 'Clone proposal',
            onClick: (_event, rowData) => {
              api()
                .getProposal({ primaryKey: rowData.primaryKey })
                .then((result) => {
                  setProposalToClone(result.proposal);
                  setOpenCallSelection(true);
                });
            },
          },
          {
            icon: GetAppIcon,
            tooltip: 'Download proposal',
            onClick: (event, rowData) =>
              downloadPDFProposal(
                [(rowData as PartialProposalsDataType).primaryKey],
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
                        proposalPk: (rowData as PartialProposalsDataType)
                          .primaryKey,
                      })
                    ).deleteProposal.proposal;
                    if (deletedProposal) {
                      setPartialProposalsData(
                        partialProposalsData?.filter(
                          (item) =>
                            item.primaryKey !== deletedProposal?.primaryKey
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
      {showReferenceText(data) && (
        <span>
          <br />* Pre-submission reference. Reference will change upon
          submission.
        </span>
      )}
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
