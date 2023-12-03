import { Action, Column } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import AssignFapMemberToProposalModal, {
  FapAssignedMember,
} from 'components/fap/Proposals/AssignFapMemberToProposalModal';
import FapAssignedReviewersTable from 'components/fap/Proposals/FapAssignedReviewersTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserRole, Review, SettingsId, Fap } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import {
  useFapProposalsData,
  FapProposalType,
  FapProposalAssignmentType,
} from 'hooks/fap/useFapProposalsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { tableIcons } from 'utils/materialIcons';
import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type FapProposalsAndAssignmentsTableProps = {
  /** Fap we are assigning members to */
  data: Fap;
  /** Call this function in case of Fap assigned members update */
  onAssignmentsUpdate: (fap: Fap) => void;
  /** Call id that we want to filter by */
  selectedCallId: number | null;
  /** Confirmation function that comes from withConfirm HOC */
  confirm: WithConfirmType;
};

const getReviewsFromAssignments = (assignments: FapProposalAssignmentType[]) =>
  assignments
    .map((assignment) => assignment.review)
    .filter((review): review is Review => !!review);

const FapProposalColumns: Column<FapProposalType>[] = [
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

const FapProposalsAndAssignmentsTable = ({
  data,
  onAssignmentsUpdate,
  selectedCallId,
  confirm,
}: FapProposalsAndAssignmentsTableProps) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewModal: NumberParam,
  });
  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    useFapProposalsData(data.id, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPk, setProposalPk] = useState<null | number>(null);
  const downloadPDFProposal = useDownloadPDFProposal();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: FapProposalType) => (
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
      <Tooltip title="Assign Fap Member">
        <IconButton
          data-cy="assign-fap-member"
          onClick={() => setProposalPk(rowData.proposalPk)}
        >
          <AssignmentInd />
        </IconButton>
      </Tooltip>
    </>
  );

  const handleBulkDownloadClick = (
    event: React.MouseEventHandler<HTMLButtonElement>,
    rowData: FapProposalType | FapProposalType[]
  ) => {
    if (!Array.isArray(rowData)) {
      return;
    }

    downloadPDFProposal(
      rowData.map((row) => row.proposalPk),
      rowData[0].proposal.title
    );
  };

  const removeProposalsFromFap = async (
    proposalsToRemove: FapProposalType[]
  ): Promise<void> => {
    await api({
      toastSuccessMessage: 'Assignment/s removed',
    }).removeProposalsFromFap({
      proposalPks: proposalsToRemove.map(
        (proposalToRemove) => proposalToRemove.proposalPk
      ),
      fapId: data.id,
    });

    setFapProposalsData((fapProposalData) =>
      fapProposalData.filter((proposalItem) =>
        proposalsToRemove.every(
          (proposalToRemove) =>
            proposalToRemove.proposalPk !== proposalItem.proposalPk
        )
      )
    );
  };

  const handleBulkRemoveProposalsFromFap = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    proposalsToRemove: FapProposalType | FapProposalType[]
  ): Promise<void> => {
    if (!Array.isArray(proposalsToRemove)) {
      return;
    }
    confirm(() => removeProposalsFromFap(proposalsToRemove), {
      title: 'Remove Fap assignment/s',
      description:
        'Are you sure you want to remove the selected proposal/s from this Fap?',
    })();
  };

  const assignMemberToFapProposal = async (
    assignedMembers: FapAssignedMember[]
  ) => {
    if (!proposalPk) {
      return;
    }

    await api({
      toastSuccessMessage: 'Members assigned',
    }).assignFapReviewersToProposal({
      memberIds: assignedMembers.map(({ id }) => id),
      proposalPk: proposalPk,
      fapId: data.id,
    });

    setProposalPk(null);

    const { proposalReviews } = await api().getProposalReviews({
      proposalPk,
    });

    if (!proposalReviews) {
      return;
    }

    setFapProposalsData((fapProposalData) =>
      fapProposalData.map((proposalItem) => {
        if (proposalItem.proposalPk === proposalPk) {
          const newAssignments: FapProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...assignedMembers.map(({ role = null, ...user }) => ({
              proposalPk: proposalItem.proposalPk,
              fapMemberUserId: user.id,
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
      fapChairProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.fapChair?.id
      )
        ? (data.fapChairProposalCount || 0) + 1
        : data.fapChairProposalCount,
      fapSecretaryProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.fapSecretary?.id
      )
        ? (data.fapSecretaryProposalCount || 0) + 1
        : data.fapSecretaryProposalCount,
    });
  };

  const handleMemberAssignmentToFapProposal = (
    memberUsers: FapAssignedMember[]
  ) => {
    const selectedProposal = FapProposalsData.find(
      (fapProposal) => fapProposal.proposalPk === proposalPk
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
      confirm(() => assignMemberToFapProposal(memberUsers), {
        title: 'Fap reviewers assignment',
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
            {`. Are you sure you want to assign all selected users to the Fap proposal?`}
          </>
        ),
      })();
    } else {
      assignMemberToFapProposal(memberUsers);
    }
  };

  const initialValues: FapProposalType[] = FapProposalsData;
  const tableActions: Action<FapProposalType>[] = [];
  hasRightToAssignReviewers &&
    tableActions.push({
      icon: () => <GetAppIcon data-cy="download-fap-proposals" />,
      tooltip: 'Download proposals',
      onClick: handleBulkDownloadClick,
      position: 'toolbarOnSelect',
    });
  hasRightToRemoveAssignedProposal &&
    tableActions.push({
      icon: () => <DeleteOutline data-cy="remove-assigned-fap-proposal" />,
      tooltip: 'Remove assigned proposal',
      onClick: handleBulkRemoveProposalsFromFap,
      position: 'toolbarOnSelect',
    });

  const proposalAssignments = initialValues.find(
    (assignment) => assignment.proposalPk === proposalPk
  )?.assignments;

  const ReviewersTable = React.useCallback(
    ({ rowData }: Record<'rowData', FapProposalType>) => {
      const removeAssignedReviewer = async (
        assignedReviewer: FapProposalAssignmentType,
        proposalPk: number
      ): Promise<void> => {
        /**
         * TODO(asztalos): merge `removeMemberFromFapProposal` and `removeUserForReview` (same goes for creation)
         *                otherwise if one of them fails we may end up with an broken state
         */
        await api({
          toastSuccessMessage: 'Reviewer removed',
        }).removeMemberFromFapProposal({
          proposalPk,
          fapId: data.id,
          memberId: assignedReviewer.fapMemberUserId as number,
        });

        assignedReviewer.review &&
          (await api().removeUserForReview({
            reviewId: assignedReviewer.review.id,
            fapId: data.id,
          }));

        setFapProposalsData((fapProposalData) =>
          fapProposalData.map((proposalItem) => {
            if (proposalItem.proposalPk === proposalPk) {
              const newAssignments =
                proposalItem.assignments?.filter(
                  (oldAssignment) =>
                    oldAssignment.fapMemberUserId !==
                    assignedReviewer.fapMemberUserId
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
          fapChairProposalCount:
            assignedReviewer.fapMemberUserId === data.fapChair?.id
              ? data.fapChairProposalCount! - 1
              : data.fapChairProposalCount,
          fapSecretaryProposalCount:
            assignedReviewer.fapMemberUserId === data.fapSecretary?.id
              ? data.fapSecretaryProposalCount! - 1
              : data.fapSecretaryProposalCount,
        });
      };

      const loadFapProposal = async (proposalPk: number) => {
        return api()
          .getFapProposal({ fapId: data.id, proposalPk })
          .then((data) => {
            return data.fapProposal;
          });
      };

      const updateFapProposalAssignmentsView = async (proposalPk: number) => {
        const refreshedFapProposal = await loadFapProposal(proposalPk);

        if (refreshedFapProposal) {
          setFapProposalsData((fapProposalsData) => {
            return fapProposalsData.map((fapProposal) => ({
              ...fapProposal,
              proposal: {
                ...fapProposal.proposal,
                status:
                  refreshedFapProposal.proposalPk === fapProposal.proposalPk
                    ? refreshedFapProposal.proposal.status
                    : fapProposal.proposal.status,
              },
              assignments:
                refreshedFapProposal.proposalPk === fapProposal.proposalPk
                  ? refreshedFapProposal.assignments
                  : fapProposal.assignments,
            }));
          });
        }
      };

      return (
        <FapAssignedReviewersTable
          fapProposal={rowData}
          removeAssignedReviewer={removeAssignedReviewer}
          updateView={updateFapProposalAssignmentsView}
        />
      );
    },
    [setFapProposalsData, data, onAssignmentsUpdate, api]
  );

  const FapProposalsWitIdAndFormattedDate = initialValues.map((fapProposal) =>
    Object.assign(fapProposal, {
      id: fapProposal.proposalPk,
      rowActionButtons: RowActionButtons(fapProposal),
      dateAssignedFormatted: toFormattedDateTime(fapProposal.dateAssigned),
    })
  );

  return (
    <>
      <ProposalReviewModal
        title="Fap - Proposal View"
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
      <AssignFapMemberToProposalModal
        proposalPk={proposalPk}
        setProposalPk={setProposalPk}
        fapId={data.id}
        assignedMembers={
          proposalAssignments?.map((assignment) => assignment.user) ?? []
        }
        assignMemberToFapProposal={handleMemberAssignmentToFapProposal}
      />
      <div data-cy="fap-assignments-table">
        <MaterialTable
          icons={tableIcons}
          columns={FapProposalColumns}
          title={
            <Typography variant="h6" component="h2">
              Fap Proposals
            </Typography>
          }
          data={FapProposalsWitIdAndFormattedDate}
          isLoading={loadingFapProposals}
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
      </div>
    </>
  );
};

export default withConfirm(FapProposalsAndAssignmentsTable);
