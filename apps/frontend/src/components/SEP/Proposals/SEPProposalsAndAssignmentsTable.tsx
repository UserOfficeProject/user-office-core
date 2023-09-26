import MaterialTable, { Action, Column, Options } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import CopyToClipboard from 'components/common/CopyToClipboard';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserRole, Review, SettingsId, Sep } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  useSEPProposalsData,
  SEPProposalType,
  SEPProposalAssignmentType,
} from 'hooks/SEP/useSEPProposalsData';
import { tableIcons } from 'utils/materialIcons';
import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AssignSEPMemberToProposalModal, {
  SepAssignedMember,
} from './AssignSEPMemberToProposalModal';
import SEPAssignedReviewersTable from './SEPAssignedReviewersTable';

type SEPProposalsAndAssignmentsTableProps = {
  /** SEP we are assigning members to */
  data: Sep;
  /** Call this function in case of SEP assigned members update */
  onAssignmentsUpdate: (sep: Sep) => void;
  /** Toolbar component shown in the table */
  Toolbar: (data: Options<JSX.Element>) => JSX.Element;
  /** Call id that we want to filter by */
  selectedCallId: number | null;
  /** Confirmation function that comes from withConfirm HOC */
  confirm: WithConfirmType;
};

const getReviewsFromAssignments = (assignments: SEPProposalAssignmentType[]) =>
  assignments
    .map((assignment) => assignment.review)
    .filter((review): review is Review => !!review);

const SEPProposalColumns: Column<SEPProposalType>[] = [
  {
    title: 'Actions',
    cellStyle: { padding: 0, minWidth: 80 },
    sorting: false,
    removable: false,
    field: 'rowActionButtons',
  },
  {
    title: 'ID',
    field: 'proposal.proposalId',
    render: (rawData) => (
      <CopyToClipboard
        text={rawData.proposal.proposalId}
        successMessage={`'${rawData.proposal.proposalId}' copied to clipboard`}
        position="right"
      >
        {rawData.proposal.proposalId || ''}
      </CopyToClipboard>
    ),
  },
  {
    title: 'Title',
    field: 'proposal.title',
  },
  {
    title: 'Status',
    field: 'proposal.status.name',
  },
  {
    title: 'Date assigned',
    field: 'dateAssignedFormatted',
  },
  {
    title: 'Reviewers',
    field: 'assignments.length',
    emptyValue: '-',
  },
  {
    title: 'Average grade',
    render: (rowData) => {
      const avgGrade = average(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return avgGrade === 0 ? '-' : `${avgGrade}`;
    },
    customSort: (a, b) =>
      average(
        getGradesFromReviews(getReviewsFromAssignments(a.assignments ?? []))
      ) -
      average(
        getGradesFromReviews(getReviewsFromAssignments(b.assignments ?? []))
      ),
  },
  {
    title: 'Deviation',
    field: 'deviation',
    render: (rowData) => {
      const stdDeviation = standardDeviation(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return isNaN(stdDeviation) ? '-' : `${stdDeviation}`;
    },
    customSort: (a, b) =>
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(a.assignments ?? []))
      ) -
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(b.assignments ?? []))
      ),
  },
];

const SEPProposalsAndAssignmentsTable = ({
  data,
  onAssignmentsUpdate,
  selectedCallId,
  Toolbar,
  confirm,
}: SEPProposalsAndAssignmentsTableProps) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewModal: NumberParam,
  });
  const { loadingSEPProposals, SEPProposalsData, setSEPProposalsData } =
    useSEPProposalsData(data.id, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPk, setProposalPk] = useState<null | number>(null);
  const downloadPDFProposal = useDownloadPDFProposal();
  const { t } = useTranslation();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: SEPProposalType) => (
    <>
      <Tooltip title="View proposal">
        <IconButton
          data-cy="view-proposal"
          onClick={() => {
            setUrlQueryParams({ reviewModal: rowData.proposalPk });
          }}
        >
          <Visibility />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Assign ${t('SEP')} Member`}>
        <IconButton
          data-cy="assign-sep-member"
          onClick={() => setProposalPk(rowData.proposalPk)}
        >
          <AssignmentInd />
        </IconButton>
      </Tooltip>
    </>
  );

  const handleBulkDownloadClick = (
    event: React.MouseEventHandler<HTMLButtonElement>,
    rowData: SEPProposalType | SEPProposalType[]
  ) => {
    if (!Array.isArray(rowData)) {
      return;
    }

    downloadPDFProposal(
      rowData.map((row) => row.proposalPk),
      rowData[0].proposal.title
    );
  };

  const removeProposalsFromSEP = async (
    proposalsToRemove: SEPProposalType[]
  ): Promise<void> => {
    await api({
      toastSuccessMessage: 'Assignment/s removed',
    }).removeProposalsFromSep({
      proposalPks: proposalsToRemove.map(
        (proposalToRemove) => proposalToRemove.proposalPk
      ),
      sepId: data.id,
    });

    setSEPProposalsData((sepProposalData) =>
      sepProposalData.filter((proposalItem) =>
        proposalsToRemove.every(
          (proposalToRemove) =>
            proposalToRemove.proposalPk !== proposalItem.proposalPk
        )
      )
    );
  };

  const handleBulkRemoveProposalsFromSEP = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    proposalsToRemove: SEPProposalType | SEPProposalType[]
  ): Promise<void> => {
    if (!Array.isArray(proposalsToRemove)) {
      return;
    }
    confirm(() => removeProposalsFromSEP(proposalsToRemove), {
      title: 'Remove ' + t('SEP') + ' assignment/s',
      description: `Are you sure you want to remove the selected proposal/s from this ${t(
        'SEP'
      )}?`,
    })();
  };

  const assignMemberToSEPProposal = async (
    assignedMembers: SepAssignedMember[]
  ) => {
    if (!proposalPk) {
      return;
    }

    await api({
      toastSuccessMessage: 'Members assigned',
    }).assignSepReviewersToProposal({
      memberIds: assignedMembers.map(({ id }) => id),
      proposalPk: proposalPk,
      sepId: data.id,
    });

    setProposalPk(null);

    const { proposalReviews } = await api().getProposalReviews({
      proposalPk,
    });

    if (!proposalReviews) {
      return;
    }

    setSEPProposalsData((sepProposalData) =>
      sepProposalData.map((proposalItem) => {
        if (proposalItem.proposalPk === proposalPk) {
          const newAssignments: SEPProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...assignedMembers.map(({ role = null, ...user }) => ({
              proposalPk: proposalItem.proposalPk,
              sepMemberUserId: user.id,
              dateAssigned: DateTime.now(),
              user,
              role,
              review:
                proposalReviews.find(({ userID }) => userID === user.id) ??
                null,
            })),
          ];

          return {
            ...proposalItem,
            assignments: newAssignments,
          };
        } else {
          return proposalItem;
        }
      })
    );

    onAssignmentsUpdate({
      ...data,
      sepChairProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.sepChair?.id
      )
        ? (data.sepChairProposalCount || 0) + 1
        : data.sepChairProposalCount,
      sepSecretaryProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.sepSecretary?.id
      )
        ? (data.sepSecretaryProposalCount || 0) + 1
        : data.sepSecretaryProposalCount,
    });
  };

  const handleMemberAssignmentToSEPProposal = (
    memberUsers: SepAssignedMember[]
  ) => {
    const selectedProposal = SEPProposalsData.find(
      (sepProposal) => sepProposal.proposalPk === proposalPk
    );

    if (!selectedProposal) {
      return;
    }

    const selectedPI = memberUsers.find(
      (member) => member.id === selectedProposal.proposal.proposer?.id
    );
    const selectedCoProposers = memberUsers.filter((member) =>
      selectedProposal.proposal.users.find((user) => user.id === member.id)
    );

    const selectedReviewerWithSameOrganizationAsPI = memberUsers.find(
      (member) =>
        member.organizationId ===
        selectedProposal.proposal.proposer?.organizationId
    );

    const selectedReviewerWithSameOrganizationAsCoProposers =
      memberUsers.filter((member) =>
        selectedProposal.proposal.users.find(
          (user) => user.organizationId === member.organizationId
        )
      );

    const shouldShowWarning =
      !!selectedPI ||
      !!selectedCoProposers.length ||
      selectedReviewerWithSameOrganizationAsPI ||
      selectedReviewerWithSameOrganizationAsCoProposers;

    if (shouldShowWarning) {
      confirm(() => assignMemberToSEPProposal(memberUsers), {
        title: t('SEP') + ' reviewers assignment',
        description: ' ',
        shouldEnableOKWithAlert: true,
        alertText: (
          <>
            Some of the selected reviewers are already part of the proposal as a
            PI/Co-proposer or belong to the same organization{' '}
            <strong>
              <ul>
                {!!selectedPI && <li>PI: {getFullUserName(selectedPI)}</li>}
                {!!selectedCoProposers.length && (
                  <li>
                    Co-proposers:{' '}
                    {selectedCoProposers
                      .map((selectedCoProposer) =>
                        getFullUserName(selectedCoProposer)
                      )
                      .join(', ')}
                  </li>
                )}
                {!!selectedReviewerWithSameOrganizationAsPI && (
                  <li>
                    Same organization as PI:{' '}
                    {getFullUserName(selectedReviewerWithSameOrganizationAsPI)}
                  </li>
                )}
                {!!selectedReviewerWithSameOrganizationAsCoProposers.length && (
                  <li>
                    Same organization as co-proposers:{' '}
                    {selectedReviewerWithSameOrganizationAsCoProposers
                      .map((selectedCoProposer) =>
                        getFullUserName(selectedCoProposer)
                      )
                      .join(', ')}
                  </li>
                )}
              </ul>
            </strong>
            {`. Are you sure you want to assign all selected users to the ${t(
              'SEP'
            )}
            proposal?`}
          </>
        ),
      })();
    } else {
      assignMemberToSEPProposal(memberUsers);
    }
  };

  const initialValues: SEPProposalType[] = SEPProposalsData;
  const tableActions: Action<SEPProposalType>[] = [];
  hasRightToAssignReviewers &&
    tableActions.push({
      icon: () => <GetAppIcon data-cy="download-sep-proposals" />,
      tooltip: 'Download proposals',
      onClick: handleBulkDownloadClick,
      position: 'toolbarOnSelect',
    });
  hasRightToRemoveAssignedProposal &&
    tableActions.push({
      icon: () => <DeleteOutline data-cy="remove-assigned-sep-proposal" />,
      tooltip: 'Remove assigned proposal',
      onClick: handleBulkRemoveProposalsFromSEP,
      position: 'toolbarOnSelect',
    });

  const proposalAssignments = initialValues.find(
    (assignment) => assignment.proposalPk === proposalPk
  )?.assignments;

  const ReviewersTable = React.useCallback(
    ({ rowData }: Record<'rowData', SEPProposalType>) => {
      const removeAssignedReviewer = async (
        assignedReviewer: SEPProposalAssignmentType,
        proposalPk: number
      ): Promise<void> => {
        /**
         * TODO(asztalos): merge `removeMemberFromSEPProposal` and `removeUserForReview` (same goes for creation)
         *                otherwise if one of them fails we may end up with an broken state
         */
        await api({
          toastSuccessMessage: 'Reviewer removed',
        }).removeMemberFromSEPProposal({
          proposalPk,
          sepId: data.id,
          memberId: assignedReviewer.sepMemberUserId as number,
        });

        assignedReviewer.review &&
          (await api().removeUserForReview({
            reviewId: assignedReviewer.review.id,
            sepId: data.id,
          }));

        setSEPProposalsData((sepProposalData) =>
          sepProposalData.map((proposalItem) => {
            if (proposalItem.proposalPk === proposalPk) {
              const newAssignments =
                proposalItem.assignments?.filter(
                  (oldAssignment) =>
                    oldAssignment.sepMemberUserId !==
                    assignedReviewer.sepMemberUserId
                ) || [];

              return {
                ...proposalItem,
                assignments: newAssignments,
              };
            } else {
              return proposalItem;
            }
          })
        );

        onAssignmentsUpdate({
          ...data,
          sepChairProposalCount:
            assignedReviewer.sepMemberUserId === data.sepChair?.id
              ? data.sepChairProposalCount! - 1
              : data.sepChairProposalCount,
          sepSecretaryProposalCount:
            assignedReviewer.sepMemberUserId === data.sepSecretary?.id
              ? data.sepSecretaryProposalCount! - 1
              : data.sepSecretaryProposalCount,
        });
      };

      const loadSEPProposal = async (proposalPk: number) => {
        return api()
          .getSEPProposal({ sepId: data.id, proposalPk })
          .then((data) => {
            return data.sepProposal;
          });
      };

      const updateSEPProposalAssignmentsView = async (proposalPk: number) => {
        const refreshedSepProposal = await loadSEPProposal(proposalPk);

        if (refreshedSepProposal) {
          setSEPProposalsData((sepProposalsData) => {
            return sepProposalsData.map((sepProposal) => ({
              ...sepProposal,
              proposal: {
                ...sepProposal.proposal,
                status:
                  refreshedSepProposal.proposalPk === sepProposal.proposalPk
                    ? refreshedSepProposal.proposal.status
                    : sepProposal.proposal.status,
              },
              assignments:
                refreshedSepProposal.proposalPk === sepProposal.proposalPk
                  ? refreshedSepProposal.assignments
                  : sepProposal.assignments,
            }));
          });
        }
      };

      return (
        <SEPAssignedReviewersTable
          sepProposal={rowData}
          removeAssignedReviewer={removeAssignedReviewer}
          updateView={updateSEPProposalAssignmentsView}
        />
      );
    },
    [setSEPProposalsData, data, onAssignmentsUpdate, api]
  );

  const SEPProposalsWitIdAndFormattedDate = initialValues.map((sepProposal) =>
    Object.assign(sepProposal, {
      id: sepProposal.proposalPk,
      rowActionButtons: RowActionButtons(sepProposal),
      dateAssignedFormatted: toFormattedDateTime(sepProposal.dateAssigned),
    })
  );

  return (
    <>
      <ProposalReviewModal
        title={`${t('SEP')} - Proposal View`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={() => {
          setUrlQueryParams({ reviewModal: undefined });
        }}
      >
        <ProposalReviewContent
          proposalPk={urlQueryParams.reviewModal}
          tabNames={[
            PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
            PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
          ]}
        />
      </ProposalReviewModal>
      <AssignSEPMemberToProposalModal
        proposalPk={proposalPk}
        setProposalPk={setProposalPk}
        sepId={data.id}
        assignedMembers={
          proposalAssignments?.map((assignment) => assignment.user) ?? []
        }
        assignMemberToSEPProposal={handleMemberAssignmentToSEPProposal}
      />
      <Grid container spacing={3}>
        <Grid data-cy="sep-assignments-table" item xs={12}>
          <MaterialTable
            icons={tableIcons}
            columns={SEPProposalColumns}
            components={{
              Toolbar: Toolbar,
            }}
            title={
              <Typography variant="h6" component="h2" gutterBottom>
                {`${t('SEP')} Proposals`}
              </Typography>
            }
            data={SEPProposalsWitIdAndFormattedDate}
            isLoading={loadingSEPProposals}
            localization={{
              toolbar: {
                nRowsSelected: '{0} proposal(s) selected',
              },
            }}
            detailPanel={[
              {
                tooltip: 'Show Reviewers',
                render: ReviewersTable,
              },
            ]}
            actions={tableActions}
            options={{
              search: true,
              selection: true,
              headerSelectionProps: {
                inputProps: {
                  'aria-label': 'Select all rows',
                  'data-cy': 'select-all-table-rows',
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default withConfirm(SEPProposalsAndAssignmentsTable);
