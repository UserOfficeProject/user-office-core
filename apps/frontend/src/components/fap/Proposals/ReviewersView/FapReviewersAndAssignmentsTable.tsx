import MaterialTable, { Action, Column } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Fap } from 'generated/sdk';
import { useExpandCollapseAll } from 'hooks/fap/useExpandCollapseAll';
import { FapMember, useFapMembersData } from 'hooks/fap/useFapMembersData';
import {
  FapProposalAssignmentType,
  FapProposals,
} from 'hooks/fap/useFapProposalsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserNameWithInstitution } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AssignProposalsToReviewerModal from './AssignProposalsToReviewerModal';
import FapAssignedProposalsTable from './FapAssignedProposalsTable';
import { FapAssignedMember } from '../ProposalsView/AssignFapMemberToProposalModal';

type FapReviewersAndAssignmentsTableProps = {
  /** Fap we are assigning members to */
  fap: Fap;
  /** Call this function in case of Fap assigned members update */
  onAssignmentsUpdate: (fap: Fap) => void;
  /** Call id that we want to filter by */
  confirm: WithConfirmType;
  fapProposals: FapProposals;
  handleMemberAssignmentToFapProposals: (
    memberUsers: FapAssignedMember[],
    proposalPks: number[]
  ) => void;
  updateFapProposalAssignmentsView: (proposalPk: number) => Promise<void>;
};

type ReviewerAndProposals = {
  user: FapMember;
  assignedProposals: {
    proposal: {
      proposalPk: number;
      proposalId: string;
      title: string;
      instrument: string;
    };
    assignment: FapProposalAssignmentType;
  }[];
};

const FapReviewersAndAssignmentsTableColumns: Column<ReviewerAndProposals>[] = [
  {
    title: 'User',
    cellStyle: {
      whiteSpace: 'nowrap',
    },
    render: (rowData) => getFullUserNameWithInstitution(rowData.user.user),
    customSort(data1, data2, _, sortDirection) {
      const name1 = getFullUserNameWithInstitution(data1.user.user);
      const name2 = getFullUserNameWithInstitution(data2.user.user);

      if (sortDirection === 'asc') {
        return name1 < name2 ? -1 : 1;
      } else {
        return name1 > name2 ? -1 : 1;
      }
    },
  },
  {
    title: 'Role',
    field: 'user.role.title',
  },
  {
    title: 'Proposals assigned',
    render: (rowData) => rowData.assignedProposals.length,
    customSort(data1, data2, _, sortDirection) {
      const count1 = data1.assignedProposals.length;
      const count2 = data2.assignedProposals.length;

      if (count1 === count2) {
        return 0;
      }

      if (sortDirection === 'asc') {
        return count1 < count2 ? -1 : 1;
      } else {
        return count1 > count2 ? -1 : 1;
      }
    },
  },
  {
    title: 'Reviews Completed',
    render: (rowData) => {
      const totalReviews = rowData.assignedProposals.length;
      const gradedProposals = rowData.assignedProposals.filter(
        (proposal) => proposal.assignment.review?.grade !== null
      );
      const countReviews = gradedProposals?.length || 0;

      return totalReviews === 0 ? '-' : `${countReviews} / ${totalReviews}`;
    },
    sorting: false,
  },
];

const FapReviewersAndAssignmentsTable = ({
  fap,
  onAssignmentsUpdate,
  fapProposals,
  handleMemberAssignmentToFapProposals,
  updateFapProposalAssignmentsView,
}: FapReviewersAndAssignmentsTableProps) => {
  const { api } = useDataApiWithFeedback();

  const { loadingMembers, FapMembersData } = useFapMembersData(fap.id, false);

  const [membersToAssign, setMembersToAssign] = React.useState<
    FapAssignedMember[]
  >([]);

  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    fapProposals;
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const { tableRef, expandCollapseAllButton } = useExpandCollapseAll(
    '[data-cy="fap-reviewers-assignments-table"]',
    loadingMembers || loadingFapProposals
  );

  const reviewersAndProposals: ReviewerAndProposals[] = FapMembersData.map(
    (member) => {
      const assignedProposals = fapProposals.FapProposalsData.filter(
        (proposal) =>
          proposal.assignments &&
          proposal.assignments.some(
            (reviewer) => reviewer.fapMemberUserId === member.userId
          )
      ).map((proposal) => {
        const assignment: FapProposalAssignmentType | undefined =
          proposal.assignments?.find(
            (reviewer) => reviewer.fapMemberUserId === member.userId
          );

        return {
          proposal: {
            proposalPk: proposal.proposalPk,
            proposalId: proposal.proposal.proposalId,
            title: proposal.proposal.title,
            instrument: proposal.instrument?.shortCode || '-',
          },
          assignment: assignment!,
        };
      });

      return {
        user: member,
        assignedProposals,
      };
    }
  );

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
      fapChairsCurrentProposalCounts: fap.fapChairsCurrentProposalCounts.map(
        (value) => {
          return {
            userId: value.userId,
            count:
              assignedReviewer.fapMemberUserId === value.userId
                ? value.count - 1
                : value.count,
          };
        }
      ),
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

  const handleAssignProposalsToMembers = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    membersToAssign: ReviewerAndProposals | ReviewerAndProposals[]
  ): Promise<void> => {
    if (!Array.isArray(membersToAssign)) {
      return;
    }

    const fapMemberUsersToAssign: FapAssignedMember[] = membersToAssign.map(
      (member) =>
        ({
          ...member.user.user,
          role: member.user.role,
          rank: null,
        }) as FapAssignedMember
    );
    setMembersToAssign(fapMemberUsersToAssign);
  };

  const tableActions: Action<ReviewerAndProposals>[] = [];
  tableActions.push({
    icon: () => <AssignmentInd data-cy="assign-proposals-to-member" />,
    tooltip: `Assign Proposals to Member`,
    onClick: handleAssignProposalsToMembers,
    position: 'toolbarOnSelect',
  });

  const maxPageLength = reviewersAndProposals.length;

  const pageSizeOptions = [5, 10, 20, maxPageLength]
    .sort((a, b) => a - b)
    .filter((n) => n <= maxPageLength);

  return (
    <>
      <AssignProposalsToReviewerModal
        reviewers={membersToAssign}
        setReviewers={setMembersToAssign}
        fapProposalsData={FapProposalsData}
        assignProposalsToReviewer={handleMemberAssignmentToFapProposals}
      />
      <div data-cy="fap-reviewers-assignments-table">
        <MaterialTable
          tableRef={tableRef}
          title="Reviewers and Assignments"
          columns={FapReviewersAndAssignmentsTableColumns}
          actions={tableActions}
          detailPanel={(rowData) => (
            <FapAssignedProposalsTable
              assignedProposals={rowData.rowData.assignedProposals}
              fapSecs={fap.fapSecretaries.map((s) => s.id)}
              removeAssignedReviewer={removeAssignedReviewer}
              updateView={updateFapProposalAssignmentsView}
            />
          )}
          data={reviewersAndProposals}
          isLoading={loadingMembers || loadingFapProposals}
          options={{
            pageSize: pageSize ? +pageSize : Math.min(10, maxPageLength),
            selection: true,
            initialPage: page ? +page : 0,
            pageSizeOptions: pageSizeOptions,
          }}
          localization={{
            toolbar: {
              nRowsSelected: (rowCount) => `${rowCount} reviewer(s) selected`,
            },
          }}
          onSelectionChange={(selectedItems) => {
            const selectedReviewers = selectedItems.map(
              (item) => item.user.userId
            );

            setSearchParams((searchParams) => {
              searchParams.delete('selection');
              selectedReviewers.forEach((pk) =>
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

export default withConfirm(FapReviewersAndAssignmentsTable);
