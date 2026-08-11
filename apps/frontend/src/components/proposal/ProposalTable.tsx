import MaterialTableCore, { Column } from '@material-table/core';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import PeopleIcon from '@mui/icons-material/People';
import Visibility from '@mui/icons-material/Visibility';
import { Box, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { CardActionSheetItem } from 'components/common/cards/CardActionSheet';
import ProposalCard from 'components/common/cards/ProposalCard';
import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { Call, FeatureId, ProposalPublicStatus } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useCardRows } from 'hooks/common/useResponsive';
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

  const asCards = useCardRows();

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
  // Behaviour shared by the desktop row icons and the mobile card, so the two
  // presentations cannot drift apart.
  const isReadOnly = (rowData: PartialProposalsDataType) =>
    isCallEnded(
      rowData.call?.startCall,
      isInternalUser ? rowData.call?.endCallInternal : rowData.call?.endCall
    ) || getProposalReadonlyStatus(rowData);

  const isProposer = (rowData: PartialProposalsDataType) =>
    rowData.proposerId === userContext.user.id;

  const canViewDataAccessUsers = (rowData: PartialProposalsDataType) =>
    isDataAccessUsersEnabled !== false &&
    isProposer(rowData) &&
    rowData.publicStatus === ProposalPublicStatus.ACCEPTED;

  const canDeleteProposal = (rowData: PartialProposalsDataType) =>
    isProposer(rowData) && !rowData.submitted;

  const openProposal = (rowData: PartialProposalsDataType) =>
    setEditProposalPk(rowData.primaryKey);

  const cloneProposal = (rowData: PartialProposalsDataType) => {
    api()
      .getProposalToClone({ primaryKey: rowData.primaryKey })
      .then((result) => {
        setProposalToClone(result.proposal);
        setOpenCallSelection(true);
      });
  };

  const downloadProposal = (rowData: PartialProposalsDataType) =>
    downloadPDFProposal([rowData.primaryKey], rowData.title);

  const openDataAccessUsers = (rowData: PartialProposalsDataType) => {
    setSelectedProposalPk(rowData.primaryKey);
    setIsDataAccessUsersModalOpen(true);
  };

  const deleteProposal = (rowData: PartialProposalsDataType) =>
    confirm(
      async () => {
        const { deleteProposal } = await api().deleteProposal({
          proposalPk: rowData.primaryKey,
        });
        if (deleteProposal) {
          refreshTableData();
        }
      },
      {
        title: 'Are you sure?',
        description: `Are you sure you want to delete proposal '${rowData.title}'`,
      }
    )();

  const sheetItemsFor = (
    rowData: PartialProposalsDataType
  ): CardActionSheetItem[] => [
    {
      key: 'clone',
      label: 'Clone proposal',
      icon: <FileCopy />,
      onClick: () => cloneProposal(rowData),
    },
    {
      key: 'download',
      label: 'Download PDF',
      icon: <GetAppIcon />,
      onClick: () => downloadProposal(rowData),
    },
    ...(canViewDataAccessUsers(rowData)
      ? [
          {
            key: 'data-access',
            label: 'Data access users',
            icon: <PeopleIcon />,
            onClick: () => openDataAccessUsers(rowData),
          },
        ]
      : []),
    ...(canDeleteProposal(rowData)
      ? [
          {
            key: 'delete',
            label: 'Delete proposal',
            icon: <DeleteIcon />,
            onClick: () => deleteProposal(rowData),
            destructive: true,
          },
        ]
      : []),
  ];

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
      {asCards && (
        <Box sx={{ padding: 1, paddingBottom: 1.5 }}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
        </Box>
      )}
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
        options={{
          search: search,
          debounceInterval: 400,
          toolbar: !asCards,
        }}
        actions={[
          (rowData) => {
            const readOnly = isReadOnly(rowData);

            return {
              icon: readOnly ? () => <Visibility /> : () => <Edit />,
              tooltip: readOnly ? 'View proposal' : 'Edit proposal',
              onClick: (_event, rowData) =>
                openProposal(rowData as PartialProposalsDataType),
            };
          },
          {
            icon: FileCopy,
            tooltip: 'Clone proposal',
            onClick: (_event, rowData) =>
              cloneProposal(rowData as PartialProposalsDataType),
          },
          (rowData) => ({
            icon: () => <PeopleIcon />,
            tooltip: 'View data access users',
            hidden: !canViewDataAccessUsers(rowData),
            onClick: (_event, rowData) =>
              openDataAccessUsers(rowData as PartialProposalsDataType),
          }),
          {
            icon: GetAppIcon,
            tooltip: 'Download proposal',
            onClick: (_event, rowData) =>
              downloadProposal(rowData as PartialProposalsDataType),
          },
          (rowData) => ({
            icon: () => <DeleteIcon />,
            tooltip: rowData.submitted
              ? 'Only draft proposals can be deleted'
              : !isProposer(rowData)
                ? 'Only PI can delete proposal'
                : 'Delete proposal',
            hidden: !canDeleteProposal(rowData),
            onClick: (_event, rowData) =>
              deleteProposal(rowData as PartialProposalsDataType),
          }),
        ]}
        cardRow={(proposal) => (
          <ProposalCard
            proposal={proposal}
            readOnly={isReadOnly(proposal)}
            onOpen={() => openProposal(proposal)}
            sheetItems={sheetItemsFor(proposal)}
          />
        )}
      />
      {isEmailInviteEnabled &&
        (asCards ? (
          <ButtonWithDialog
            label="Join proposal"
            data-cy="join-proposal-btn"
            startIcon={<AddIcon />}
            title="Join proposal"
            variant="outlined"
            fullWidth
            sx={{ minHeight: 44, marginTop: 2 }}
          >
            <AcceptInviteWithCode onAccepted={() => refreshTableData()} />
          </ButtonWithDialog>
        ) : (
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
        ))}
      {showReferenceText(data) &&
        (asCards ? (
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ paddingX: 1, paddingTop: 1.5 }}
          >
            * Pre-submission reference. Reference will change upon submission.
          </Typography>
        ) : (
          <span>
            <br />* Pre-submission reference. Reference will change upon
            submission.
          </span>
        ))}
    </div>
  );
};

export default withConfirm(ProposalTable);
