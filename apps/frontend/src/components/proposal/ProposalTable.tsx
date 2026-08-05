import MaterialTableCore, { Column } from '@material-table/core';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import PeopleIcon from '@mui/icons-material/People';
import Visibility from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import { rowComponents } from 'components/common/MaterialTableCardRow';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { Call, FeatureId, ProposalPublicStatus } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useIsMobile } from 'hooks/common/useResponsive';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { isCallEnded } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { tableLocalization } from 'utils/materialLocalization';
import { timeAgo } from 'utils/Time';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AcceptInviteWithCode from './AcceptInviteWithCode';
import CallSelectModalOnProposalsClone from './CallSelectModalOnProposalClone';
import DataAccessUsersModal from './DataAccessUsersModal';
import { ProposalStatusDefaultShortCodes } from './ProposalsSharedConstants';
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
  searchQuery: (
    page: number,
    pageSize: number
  ) => Promise<UserProposalDataType>;
  confirm: WithConfirmType;
};

const columns: Column<PartialProposalsDataType>[] = [
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
  { title: 'Status', field: 'publicStatus' },
  {
    title: 'Call',
    field: 'call.shortCode',
    emptyValue: '-',
  },
  {
    title: 'Created',
    field: 'created',
    render: (rawData) => timeAgo(rawData.created),
  },
];

const ProposalTable = ({
  title,
  search,
  searchQuery,
  confirm,
}: ProposalTableProps) => {
  const userContext = useContext(UserContext);
  const featureContext = useContext(FeatureContext);
  const tableRef =
    React.useRef<MaterialTableCore<PartialProposalsDataType>>(undefined);
  const isMobile = useIsMobile();
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
  const [isDataAccessUsersModalOpen, setIsDataAccessUsersModalOpen] =
    useState(false);
  const [selectedProposalPk, setSelectedProposalPk] = useState<
    number | undefined
  >();

  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const isEmailInviteEnabled = featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;

  const isDataAccessUsersEnabled = featureContext.featuresMap.get(
    FeatureId.DATA_ACCESS_USERS
  )?.isEnabled;

  const [editProposalPk, setEditProposalPk] = useState(0);
  const { isInternalUser } = useContext(UserContext);
  if (editProposalPk) {
    return <Navigate to={`/ProposalEdit/${editProposalPk}`} />;
  }

  const showReferenceText = (
    proposalData: PartialProposalsDataType[]
  ): boolean => {
    return proposalData.some((proposal) => {
      return proposal.call?.referenceNumberFormat && !proposal.submitted;
    });
  };

  const getProposalReadonlyStatus = (
    proposalData: PartialProposalsDataType
  ) => {
    if (!proposalData) {
      return true;
    }

    const readonly =
      proposalData.submitted &&
      proposalData.status?.id !==
        ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED;
    if (readonly && isInternalUser) {
      return (
        proposalData.status?.id !==
        ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL
      );
    }

    return readonly;
  };
  const cloneProposalsToCall = async (call: Call) => {
    setProposalToClone(null);

    if (!call?.id || !proposalToClone) {
      return;
    }

    const { cloneProposals } = await api({
      toastSuccessMessage: 'Proposal cloned successfully',
    }).cloneProposals({
      callId: call.id,
      proposalsToClonePk: [proposalToClone.primaryKey],
    });

    const [resultProposal] = cloneProposals;

    if (resultProposal) {
      refreshTableData();
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
          />
        </DialogContent>
      </Dialog>
      <DataAccessUsersModal
        open={isDataAccessUsersModalOpen}
        onClose={() => setIsDataAccessUsersModalOpen(false)}
        proposalPk={selectedProposalPk}
      />
      <MaterialTable
        tableRef={tableRef}
        icons={tableIcons}
        localization={tableLocalization}
        title={
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        }
        columns={columns}
        data={(query) =>
          searchQuery(query.page, query.pageSize).then((result) => {
            setPartialProposalsData(result.data ?? []);

            return {
              data: result.data ?? [],
              page: result.page,
              totalCount: result.totalCount ?? 0,
            };
          })
        }
        components={rowComponents(isMobile)}
        options={{
          search: search,
          debounceInterval: 400,
          header: !isMobile,
        }}
        actions={[
          (rowData) => {
            const callHasEnded = isCallEnded(
              rowData.call?.startCall,
              isInternalUser
                ? rowData.call?.endCallInternal
                : rowData.call?.endCall
            );
            const readOnly = callHasEnded || getProposalReadonlyStatus(rowData);

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
            icon: () => <FileCopy />,
            tooltip: 'Clone proposal',
            onClick: (_event, rowData) => {
              api()
                .getProposalToClone({
                  primaryKey: (rowData as PartialProposalsDataType).primaryKey,
                })
                .then((result) => {
                  setProposalToClone(result.proposal);
                  setOpenCallSelection(true);
                });
            },
          },
          (rowData) => {
            const isPI = rowData.proposerId === userContext.user.id;

            return {
              icon: () => <PeopleIcon />,
              tooltip: 'View data access users',
              hidden:
                isDataAccessUsersEnabled === false ||
                isPI === false ||
                rowData.publicStatus !== ProposalPublicStatus.ACCEPTED,
              onClick: (_event, rowData) => {
                setSelectedProposalPk(
                  (rowData as PartialProposalsDataType).primaryKey
                );
                setIsDataAccessUsersModalOpen(true);
              },
            };
          },
          {
            icon: () => <GetAppIcon />,
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
              icon: () => <DeleteIcon />,
              tooltip: isSubmitted
                ? 'Only draft proposals can be deleted'
                : !isPI
                  ? 'Only PI can delete proposal'
                  : 'Delete proposal',
              hidden: !canDelete,
              onClick: (_event, rowData) =>
                confirm(
                  async () => {
                    const { deleteProposal } = await api().deleteProposal({
                      proposalPk: (rowData as PartialProposalsDataType)
                        .primaryKey,
                    });
                    if (deleteProposal) {
                      refreshTableData();
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
      {isEmailInviteEnabled && (
        <ActionButtonContainer>
          <ButtonWithDialog
            label="Join proposal"
            data-cy="join-proposal-btn"
            startIcon={<AddIcon />}
            title="Join proposal"
          >
            <AcceptInviteWithCode onAccepted={() => refreshTableData()} />
          </ButtonWithDialog>
        </ActionButtonContainer>
      )}
      {showReferenceText(data) && (
        <span>
          <br />* Pre-submission reference. Reference will change upon
          submission.
        </span>
      )}
    </div>
  );
};

export default withConfirm(ProposalTable);
