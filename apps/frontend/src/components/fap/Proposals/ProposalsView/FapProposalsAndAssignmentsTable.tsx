import { Action, Column } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import AssignFapMemberToProposalModal, {
  FapAssignedMember,
} from 'components/fap/Proposals/ProposalsView/AssignFapMemberToProposalModal';
import FapAssignedReviewersTable from 'components/fap/Proposals/ProposalsView/FapAssignedReviewersTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserRole, Review, SettingsId, Fap } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useExpandCollapseAll } from 'hooks/fap/useExpandCollapseAll';
import {
  FapProposalType,
  FapProposalAssignmentType,
  FapProposals,
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
  fap: Fap;
  /** Call this function in case of Fap assigned members update */
  onAssignmentsUpdate: (fap: Fap) => void;
  /** Confirmation function that comes from withConfirm HOC */
  confirm: WithConfirmType;
  fapProposals: FapProposals;
  handleMemberAssignmentToFapProposals: (
    memberUsers: FapAssignedMember[],
    proposalPks: number[]
  ) => void;
  updateFapProposalAssignmentsView: (proposalPk: number) => Promise<void>;
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
    title: 'Principal Investigator',
    render: (rowData) => {
      return getFullUserName(rowData.proposal.proposer);
    },
    customSort(a, b) {
      const name1 = getFullUserName(a.proposal.proposer);
      const name2 = getFullUserName(b.proposal.proposer);

      return name1 < name2 ? -1 : 1;
    },
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
    customSort: (a, b) =>
      (a.assignments?.length || 0) - (b.assignments?.length || 0),
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
    customSort: (a, b) => {
      const totalReviewsA = a.assignments?.length || 0;
      const totalReviewsB = b.assignments?.length || 0;
      const gradedProposalsA =
        a.assignments?.filter(
          (assignment) =>
            assignment.review !== null && assignment.review.grade !== null
        ).length || 0;
      const gradedProposalsB =
        b.assignments?.filter(
          (assignment) =>
            assignment.review !== null && assignment.review.grade !== null
        ).length || 0;

      const incompleteReviewsA = totalReviewsA - gradedProposalsA;
      const incompleteReviewsB = totalReviewsB - gradedProposalsB;

      if (incompleteReviewsA === incompleteReviewsB) {
        return totalReviewsB - totalReviewsA;
      }

      return incompleteReviewsA - incompleteReviewsB;
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
  {
    title: 'Instrument',
    field: 'instrument.name',
  },
];

const FapProposalsAndAssignmentsTable = ({
  fap,
  onAssignmentsUpdate,
  confirm,
  fapProposals,
  handleMemberAssignmentToFapProposals,
  updateFapProposalAssignmentsView,
}: FapProposalsAndAssignmentsTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewModal = searchParams.get('reviewModal');

  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    fapProposals;
  const { api } = useDataApiWithFeedback();
  const [proposals, setProposals] = useState<
    { proposalPk: number; proposalId: string }[]
  >([]);
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
  const { t } = useTranslation();
  const { tableRef, expandCollapseAllButton } = useExpandCollapseAll(
    '[data-cy="fap-assignments-table"]',
    [loadingFapProposals]
  );

  const translatedColumns = FapProposalColumns.map((column) =>
    column.title === 'Instrument'
      ? { ...column, title: t('instrument') }
      : column
  );

  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selection = searchParams.getAll('selection');
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
      fapIds: [fap.id],
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

    const proposalPksToAssign = proposalsToAssign.map((proposalToAssign) => {
      return {
        proposalPk: proposalToAssign.proposalPk,
        proposalId: proposalToAssign.proposal.proposalId,
      };
    });
    setProposals(proposalPksToAssign);
  };

  const handleBulkRemoveProposalsFromFap = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    proposalsToRemove: FapProposalType | FapProposalType[]
  ): Promise<void> => {
    if (!Array.isArray(proposalsToRemove)) {
      return;
    }
    confirm(() => removeProposalsFromFap(proposalsToRemove), {
      title: `Remove ${t('Fap')} assignment/s`,
      description: `Are you sure you want to remove the selected proposal/s from this ${t('Fap')}?`,
    })();
  };

  const initialValues: FapProposalType[] = FapProposalsData;
  const tableActions: Action<FapProposalType>[] = [];
  hasRightToAssignReviewers &&
    tableActions.push({
      icon: () => <AssignmentInd data-cy="assign-fap-members" />,
      tooltip: `Assign ${t('Fap')} members`,
      onClick: handleAssignMembersToFapProposals,
      position: 'toolbarOnSelect',
    });
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
        await api({
          toastSuccessMessage: 'Reviewer removed',
        }).removeMemberFromFapProposal({
          proposalPk,
          fapId: fap.id,
          memberId: assignedReviewer.fapMemberUserId as number,
        });

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
          ...fap,
          fapChairsCurrentProposalCounts:
            fap.fapChairsCurrentProposalCounts.map((value) => {
              return {
                userId: value.userId,
                count:
                  assignedReviewer.fapMemberUserId === value.userId
                    ? value.count - 1
                    : value.count,
              };
            }),
          fapSecretariesCurrentProposalCounts:
            fap.fapSecretariesCurrentProposalCounts.map((value) => {
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

      return (
        <FapAssignedReviewersTable
          fapProposal={rowData}
          fapSecs={fap.fapSecretaries.map((user) => user.id)}
          removeAssignedReviewer={removeAssignedReviewer}
          updateView={updateFapProposalAssignmentsView}
        />
      );
    },
    [
      fap,
      updateFapProposalAssignmentsView,
      api,
      setFapProposalsData,
      onAssignmentsUpdate,
    ]
  );

  const FapProposalsWitIdAndFormattedDate = initialValues.map((fapProposal) =>
    Object.assign(fapProposal, {
      id: fapProposal.proposalPk,
      rowActionButtons: RowActionButtons(fapProposal),
      dateAssignedFormatted: toFormattedDateTime(fapProposal.dateAssigned),
      tableData: {
        checked: selection.includes(fapProposal.proposalPk.toString()),
      },
    })
  );

  const maxPageLength = FapProposalsWitIdAndFormattedDate.length;

  const pageSizeOptions = [5, 10, 20, maxPageLength]
    .sort((a, b) => a - b)
    .filter((n) => n <= maxPageLength);

  return (
    <>
      <ProposalReviewModal
        title={`${t('Fap')} - Proposal View`}
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
          fapSec={fap.fapSecretaries.map((user) => user.id)}
        />
      </ProposalReviewModal>
      <AssignFapMemberToProposalModal
        proposals={proposals}
        setProposals={setProposals}
        fapId={fap.id}
        assignMembersToFapProposals={(fm, p) => {
          handleMemberAssignmentToFapProposals(fm, p);
          setProposals([]);
        }}
      />
      <div data-cy="fap-assignments-table">
        <MaterialTable
          tableRef={tableRef}
          icons={tableIcons}
          columns={translatedColumns}
          title={
            <Typography variant="h6" component="h2">
              {`${fap.code} - ${t('Fap')} Proposals`}
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
            columnsButton: true,
            search: true,
            selection: true,
            pageSize: pageSize ? +pageSize : Math.min(10, maxPageLength),
            initialPage: page ? +page : 0,
            pageSizeOptions: pageSizeOptions,
            headerSelectionProps: {
              inputProps: {
                'aria-label': 'Select all rows',
                id: 'select-all-table-rows',
              },
            },
          }}
          onPageChange={(page) => {
            setSearchParams((searchParams) => {
              searchParams.set('page', page.toString());

              return searchParams;
            });
          }}
          onRowsPerPageChange={(pageSize) => {
            setSearchParams((searchParams) => {
              searchParams.set('pageSize', pageSize.toString());

              return searchParams;
            });
          }}
          onSelectionChange={(selectedItems) => {
            const selectedProposalPks = selectedItems.map(
              (item) => item.proposalPk
            );

            setSearchParams((searchParams) => {
              searchParams.delete('selection');
              selectedProposalPks.forEach((pk) =>
                searchParams.append('selection', pk.toString())
              );

              return searchParams;
            });
          }}
        />
      </div>
      {expandCollapseAllButton}
    </>
  );
};

export default withConfirm(FapProposalsAndAssignmentsTable);
