import { Action, Column } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  UserRole,
  Review,
  SettingsId,
  Fap,
  ReviewStatus,
  FeatureId,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
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

type ProposalReview = {
  id: number;
  userID: number;
  comment: string | null;
  grade: number | null;
  status: ReviewStatus;
  fapID: number;
  proposalPk?: number;
  questionaryID: number;
};

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
    render: (data) => data.assignments?.length,
  },
  {
    title: 'Reviews',
    render: (rowData) => {
      const totalReviews = rowData.assignments?.length;
      const gradedProposals = rowData.assignments?.filter(
        (assignment) =>
          assignment.review !== null && assignment.review.grade !== null
      );
      const countReviews = gradedProposals?.length || 0;

      return totalReviews === 0 ? '-' : `${countReviews} / ${totalReviews}`;
    },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewModal = searchParams.get('reviewModal');

  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    useFapProposalsData(data.id, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPks, setProposalPks] = useState<number[]>([]);
  const downloadPDFProposal = useDownloadPDFProposal();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const { enqueueSnackbar } = useSnackbar();
  const { featuresMap } = useContext(FeatureContext);

  const isUseConflictOfInterestWarningEnabled = featuresMap.get(
    FeatureId.CONFLICT_OF_INTEREST_WARNING
  )?.isEnabled;

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
            setSearchParams((searchParams) => {
              searchParams.set('reviewModal', rowData.proposalPk.toString());

              return searchParams;
            });
          }}
        >
          <Visibility />
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
    }).removeProposalsFromFaps({
      proposalPks: proposalsToRemove.map(
        (proposalToRemove) => proposalToRemove.proposalPk
      ),
      fapIds: [data.id],
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

  const handleAssignMembersToFapProposals = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    proposalsToAssign: FapProposalType | FapProposalType[]
  ): Promise<void> => {
    if (!Array.isArray(proposalsToAssign)) {
      return;
    }

    const proposalPksToAssign = proposalsToAssign.map(
      (proposalToAssign) => proposalToAssign.proposalPk
    );
    setProposalPks(proposalPksToAssign);
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

  const assignMembersToFapProposals = async (
    assignedMembers: FapAssignedMember[]
  ) => {
    if (proposalPks.length === 0) {
      return;
    }

    const existingProposalAssignments = FapProposalsData.flatMap(
      (assignment) => assignment.assignments
    );

    const proposalAssignments: { memberId: number; proposalPk: number }[] = [];
    const updatedMembers = new Set<FapAssignedMember>();

    for (const proposalPk of proposalPks) {
      for (const assignedMember of assignedMembers) {
        const isExistingAssignment = !!existingProposalAssignments.find(
          (existingProposalAssignment) =>
            assignedMember.id === existingProposalAssignment?.user?.id &&
            proposalPk === existingProposalAssignment.proposalPk
        );
        if (!isExistingAssignment) {
          proposalAssignments.push({ memberId: assignedMember.id, proposalPk });
          updatedMembers.add(assignedMember);
        }
      }
    }

    const fapMemberPluralMsg =
      assignedMembers.length === 1
        ? 'The FAP member is'
        : 'All FAP members are';
    const proposalPluralMsg = proposalPks.length === 1 ? '' : 's';

    if (proposalAssignments.length === 0) {
      enqueueSnackbar(
        `${fapMemberPluralMsg} already assigned to the selected proposal${proposalPluralMsg}`,
        {
          variant: 'error',
          className: 'snackbar-error',
        }
      );

      return;
    }

    await api({
      toastSuccessMessage:
        Array.from(updatedMembers).length === 1
          ? 'Member assigned'
          : 'Members assigned',
    }).assignFapReviewersToProposals({
      assignments: proposalAssignments,
      fapId: data.id,
    });

    setProposalPks([]);

    const allProposalReviews: ProposalReview[] = [];

    for (const proposalPk of proposalPks) {
      const { proposalReviews } = await api().getProposalReviews({
        proposalPk,
        fapId: data.id,
      });

      if (!proposalReviews) {
        continue;
      }

      allProposalReviews.push(...proposalReviews);
      allProposalReviews.map(
        (proposalReview) => (proposalReview.proposalPk = proposalPk)
      );
    }

    if (allProposalReviews.length === 0) {
      return;
    }

    setFapProposalsData((fapProposalData) => {
      const proposalAssignmentsPks = proposalAssignments.map(
        (proposalAssignment) => proposalAssignment.proposalPk
      );
      const updatedMembersValues = Array.from(updatedMembers);

      return fapProposalData.map((proposalItem) => {
        if (proposalAssignmentsPks.includes(proposalItem.proposalPk)) {
          const newlyAssignedFapMemberIds = proposalAssignments
            .filter(
              (proposalAssignment) =>
                proposalAssignment.proposalPk === proposalItem.proposalPk
            )
            .map((proposalAssignment) => proposalAssignment.memberId);
          const newlyAssignedFapMembers = updatedMembersValues.filter(
            (updatedMember) =>
              newlyAssignedFapMemberIds.includes(updatedMember.id)
          );

          const newAssignments: FapProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...newlyAssignedFapMembers.map(({ role = null, ...user }) => ({
              proposalPk: proposalItem.proposalPk,
              fapMemberUserId: user.id,
              dateAssigned: DateTime.now(),
              user,
              role,
              rank: null,
              review:
                allProposalReviews.find(
                  (review) =>
                    review.userID === user.id &&
                    review.proposalPk === proposalItem.proposalPk
                ) ?? null,
            })),
          ];

          return {
            ...proposalItem,
            assignments: newAssignments,
          };
        } else {
          return proposalItem;
        }
      });
    });

    onAssignmentsUpdate({
      ...data,
      fapChairsCurrentProposalCounts: data.fapChairsCurrentProposalCounts.map(
        (value) => {
          return {
            userId: value.userId,
            count: assignedMembers.find(
              (assignedMember) => assignedMember.id === value.userId
            )
              ? value.count + 1
              : value.count,
          };
        }
      ),
      fapSecretariesCurrentProposalCounts:
        data.fapSecretariesCurrentProposalCounts.map((value) => {
          return {
            userId: value.userId,
            count: assignedMembers.find(
              (assignedMember) => assignedMember.id === value.userId
            )
              ? value.count + 1
              : value.count,
          };
        }),
    });
  };

  const handleMemberAssignmentToFapProposals = (
    memberUsers: FapAssignedMember[]
  ) => {
    const selectedProposals = FapProposalsData.filter((fapProposal) =>
      proposalPks.includes(fapProposal.proposalPk)
    );

    if (selectedProposals.length === 0) {
      return;
    }

    const proposalPIsMap = new Map<number, FapAssignedMember>();
    const proposalCoIsMap = new Map<number, FapAssignedMember[]>();
    const pIInstitutionConflictMap = new Map<number, FapAssignedMember>();
    const coIInstitutionConflictMap = new Map<number, FapAssignedMember[]>();

    for (const fapProposal of selectedProposals) {
      const selectedPI = memberUsers.find(
        (member) => member.id === fapProposal.proposal.proposer?.id
      );

      if (selectedPI) {
        proposalPIsMap.set(fapProposal.proposalPk, selectedPI);
      }

      const selectedCoProposers = memberUsers.filter((member) =>
        fapProposal.proposal.users.find((user) => user.id === member.id)
      );

      if (selectedCoProposers.length > 0) {
        proposalCoIsMap.set(fapProposal.proposalPk, selectedCoProposers);
      }

      const selectedReviewerWithSameInstitutionAsPI = memberUsers.find(
        (member) =>
          member.institutionId === fapProposal.proposal.proposer?.institutionId
      );

      if (selectedReviewerWithSameInstitutionAsPI) {
        pIInstitutionConflictMap.set(
          fapProposal.proposalPk,
          selectedReviewerWithSameInstitutionAsPI
        );
      }

      const selectedReviewerWithSameInstitutionAsCoProposers =
        memberUsers.filter((member) =>
          fapProposal.proposal.users.find(
            (user) => user.institutionId === member.institutionId
          )
        );

      if (selectedReviewerWithSameInstitutionAsCoProposers.length > 0) {
        coIInstitutionConflictMap.set(
          fapProposal.proposalPk,
          selectedReviewerWithSameInstitutionAsCoProposers
        );
      }
    }

    const shouldShowWarning =
      isUseConflictOfInterestWarningEnabled &&
      (proposalPIsMap.size > 0 ||
        proposalCoIsMap.size > 0 ||
        pIInstitutionConflictMap.size > 0 ||
        coIInstitutionConflictMap.size > 0);

    const alertText: JSX.Element[] = [];

    const selectedProposalPks = selectedProposals.map(
      (selectedProposal) => selectedProposal.proposalPk
    );

    for (const selectedProposalPk of selectedProposalPks) {
      alertText.push(
        <ul>
          {(!!proposalPIsMap.get(selectedProposalPk) ||
            !!proposalCoIsMap.get(selectedProposalPk) ||
            !!pIInstitutionConflictMap.get(selectedProposalPk) ||
            !!coIInstitutionConflictMap.get(selectedProposalPk)) && (
            <li>Proposal: {selectedProposalPk}</li>
          )}
          {!!proposalPIsMap.get(selectedProposalPk) && (
            <li>
              PI: {getFullUserName(proposalPIsMap.get(selectedProposalPk))}
            </li>
          )}
          {!!proposalCoIsMap.get(selectedProposalPk) && (
            <li>
              Co-proposers:{' '}
              {proposalCoIsMap
                .get(selectedProposalPk)
                ?.map((selectedCoProposer) =>
                  getFullUserName(selectedCoProposer)
                )
                .join(', ')}
            </li>
          )}
          {!!pIInstitutionConflictMap.get(selectedProposalPk) && (
            <li>
              Same institution as PI:{' '}
              {getFullUserName(
                pIInstitutionConflictMap.get(selectedProposalPk)
              )}
            </li>
          )}
          {!!coIInstitutionConflictMap.get(selectedProposalPk) && (
            <li>
              Same institution as co-proposers:{' '}
              {coIInstitutionConflictMap
                .get(selectedProposalPk)
                ?.map((selectedCoProposer) =>
                  getFullUserName(selectedCoProposer)
                )
                .join(', ')}
            </li>
          )}
        </ul>
      );
    }

    if (shouldShowWarning) {
      confirm(() => assignMembersToFapProposals(memberUsers), {
        title: 'Fap reviewers assignment',
        description: ' ',
        shouldEnableOKWithAlert: true,
        alertText: (
          <>
            Some of the selected reviewers are already part of the proposal(s)
            as a PI/Co-proposer or belong to the same institution{' '}
            <strong>{alertText}</strong>
            {`Are you sure you want to assign all selected users to the Fap proposal(s)?`}
          </>
        ),
      })();
    } else {
      assignMembersToFapProposals(memberUsers);
    }
  };

  const initialValues: FapProposalType[] = FapProposalsData;
  const tableActions: Action<FapProposalType>[] = [];
  hasRightToAssignReviewers &&
    tableActions.push({
      icon: () => <AssignmentInd data-cy="assign-fap-members" />,
      tooltip: 'Assign Fap members',
      onClick: handleAssignMembersToFapProposals,
      position: 'toolbarOnSelect',
    });
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
          fapChairsCurrentProposalCounts:
            data.fapChairsCurrentProposalCounts.map((value) => {
              return {
                userId: value.userId,
                count:
                  assignedReviewer.fapMemberUserId === value.userId
                    ? value.count - 1
                    : value.count,
              };
            }),
          fapSecretariesCurrentProposalCounts:
            data.fapSecretariesCurrentProposalCounts.map((value) => {
              return {
                userId: value.userId,
                count:
                  assignedReviewer.fapMemberUserId === value.userId
                    ? value.count - 1
                    : value.count,
              };
            }),
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

  const maxPageLength = FapProposalsWitIdAndFormattedDate.length;

  const pageSizeOptions = [5, 10, 20, maxPageLength]
    .sort((a, b) => a - b)
    .filter((n) => n <= maxPageLength);

  return (
    <>
      <ProposalReviewModal
        title="Fap - Proposal View"
        proposalReviewModalOpen={!!reviewModal}
        setProposalReviewModalOpen={() => {
          setSearchParams((searchParams) => {
            searchParams.delete('reviewModal');

            return searchParams;
          });
        }}
      >
        <ProposalReviewContent
          proposalPk={reviewModal ? +reviewModal : undefined}
          tabNames={[
            PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
            PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
          ]}
        />
      </ProposalReviewModal>
      <AssignFapMemberToProposalModal
        proposalPks={proposalPks}
        setProposalPks={setProposalPks}
        fapId={data.id}
        assignMembersToFapProposals={handleMemberAssignmentToFapProposals}
      />
      <div data-cy="fap-assignments-table">
        <MaterialTable
          icons={tableIcons}
          columns={FapProposalColumns}
          title={
            <Typography variant="h6" component="h2">
              {`${data.code} - Fap Proposals`}
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
            pageSize: Math.min(10, maxPageLength),
            pageSizeOptions: pageSizeOptions,
            headerSelectionProps: {
              inputProps: {
                'aria-label': 'Select all rows',
                id: 'select-all-table-rows',
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default withConfirm(FapProposalsAndAssignmentsTable);
