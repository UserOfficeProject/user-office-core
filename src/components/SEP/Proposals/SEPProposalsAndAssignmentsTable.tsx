import { Grid, DialogContent, Dialog } from '@material-ui/core';
import { AssignmentInd } from '@material-ui/icons';
import dateformat from 'dateformat';
import MaterialTable, { Options } from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import {
  SepProposal,
  SepMember,
  SepAssignment,
  ReviewStatus,
  Review,
  UserRole,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useSEPProposalsData } from 'hooks/SEP/useSEPProposalsData';
import { BasicUserDetails } from 'models/User';
import { tableIcons } from 'utils/materialIcons';
import { average } from 'utils/mathFunctions';

import AssignSEPMemberToProposal from './AssignSEPMemberToProposal';
import SEPAssignedReviewersTable from './SEPAssignedReviewersTable';

type SEPProposalsAndAssignmentsTableProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
  /** Toolbar component shown in the table */
  Toolbar: (data: Options) => JSX.Element;
  /** Call id that we want to filter by */
  selectedCallId: number;
};

const SEPProposalsAndAssignmentsTable: React.FC<SEPProposalsAndAssignmentsTableProps> = ({
  sepId,
  selectedCallId,
  Toolbar,
}) => {
  const {
    loadingSEPProposals,
    SEPProposalsData,
    setSEPProposalsData,
  } = useSEPProposalsData(sepId, selectedCallId);
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();
  const [proposalId, setProposalId] = useState<null | number>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);

  const getGradesFromAssignments = (assignments: SepAssignment[]) =>
    assignments
      ?.filter(
        assignment => assignment.review.status === ReviewStatus.SUBMITTED
      )
      .map(assignment => assignment.review.grade) ?? [];

  const SEPProposalColumns = [
    { title: 'ID', field: 'proposal.shortCode' },
    {
      title: 'Title',
      field: 'proposal.title',
    },
    {
      title: 'Status',
      field: 'proposal.status',
    },
    {
      title: 'Date assigned',
      field: 'dateAssigned',
      render: (rowData: SepProposal): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
    {
      title: 'Reviewers',
      render: (rowData: SepProposal): string =>
        rowData.assignments ? rowData.assignments.length.toString() : '-',
    },
    {
      title: 'Average grade',
      render: (rowData: SepProposal): string =>
        average(
          getGradesFromAssignments(
            rowData.assignments as SepAssignment[]
          ) as number[]
        ).toString(),
    },
  ];

  const removeProposalFromSEP = async (
    proposalToRemove: SepProposal
  ): Promise<void> => {
    const removeProposalAssignment = await api().removeProposalAssignment({
      proposalId: proposalToRemove.proposalId,
      sepId,
    });

    if (SEPProposalsData) {
      setSEPProposalsData(
        SEPProposalsData.filter(
          proposalItem =>
            proposalItem.proposalId !== proposalToRemove.proposalId
        )
      );
    }

    const isError = !!removeProposalAssignment.removeProposalAssignment.error;

    enqueueSnackbar('Assignment removed', {
      variant: isError ? 'error' : 'success',
    });
  };

  const removeAssignedReviewer = async (
    assignedReviewer: SepAssignment,
    proposalId: number
  ): Promise<void> => {
    const removeAssignedReviewer = await api().removeMemberFromSEPProposal({
      proposalId,
      sepId,
      memberId: assignedReviewer.sepMemberUserId as number,
    });

    await api().removeUserForReview({
      reviewID: assignedReviewer.review.id,
    });

    if (SEPProposalsData) {
      setSEPProposalsData(
        SEPProposalsData.map(proposalItem => {
          if (proposalItem.proposalId === proposalId) {
            const newAssignments =
              proposalItem.assignments?.filter(
                oldAssignment =>
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
    }

    const isError = !!removeAssignedReviewer.removeMemberFromSEPProposal.error;

    enqueueSnackbar('Reviewer removed', {
      variant: isError ? 'error' : 'success',
    });
  };

  const assignMemberToSEPProposal = async (memberUser: SepMember) => {
    const assignmentResult = await api().assignMemberToSEPProposal({
      memberId: memberUser.userId,
      proposalId: proposalId as number,
      sepId,
    });

    const addUserForReviewResilt = await api().addUserForReview({
      proposalID: proposalId as number,
      userID: memberUser.userId,
      sepID: sepId,
    });

    const reviewId = !addUserForReviewResilt.addUserForReview.error
      ? (addUserForReviewResilt.addUserForReview.review as Review).id
      : 0;

    if (!assignmentResult.assignMemberToSEPProposal.error && SEPProposalsData) {
      setSEPProposalsData(
        SEPProposalsData.map(proposalItem => {
          if (proposalItem.proposalId === proposalId) {
            const newAssignments: SepAssignment[] = [
              ...(proposalItem.assignments || []),
              {
                user: memberUser.user,
                roles: memberUser.roles,
                review: {
                  id: reviewId,
                  status: ReviewStatus.DRAFT,
                  comment: '',
                  grade: 0,
                  sepID: sepId,
                },
                dateAssigned: Date.now(),
                sepMemberUserId: memberUser.userId,
              } as SepAssignment,
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
    }

    setProposalId(null);

    enqueueSnackbar('Member assigned', {
      variant: assignmentResult.assignMemberToSEPProposal.error
        ? 'error'
        : 'success',
    });
  };

  const initialValues = SEPProposalsData as SepProposal[];
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const proposalAssignments = initialValues.find(
    assignment => assignment.proposalId === proposalId
  )?.assignments;

  const updateReviewStatusAndGrade = (
    editingProposalData: SepProposal,
    currentAssignment: SepAssignment
  ) => {
    const newProposalsData =
      SEPProposalsData?.map(sepProposalsData => {
        if (sepProposalsData.proposalId === editingProposalData.proposalId) {
          return {
            ...editingProposalData,
            assignments:
              editingProposalData.assignments?.map(proposalAssignment => {
                if (
                  proposalAssignment.review.id === currentAssignment?.review.id
                ) {
                  return currentAssignment;
                } else {
                  return proposalAssignment;
                }
              }) ?? [],
          };
        } else {
          return sepProposalsData;
        }
      }) || [];

    return newProposalsData;
  };

  const ReviewersTable = (rowData: SepProposal) => (
    <SEPAssignedReviewersTable
      sepProposal={rowData}
      removeAssignedReviewer={removeAssignedReviewer}
      updateView={currentAssignment => {
        const newProposalsData = updateReviewStatusAndGrade(
          rowData,
          currentAssignment
        );
        setSEPProposalsData(newProposalsData);
      }}
    />
  );

  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!proposalId}
        onClose={(): void => setProposalId(null)}
      >
        <DialogContent>
          <AssignSEPMemberToProposal
            sepId={sepId}
            assignedMembers={
              proposalAssignments?.map(
                assignment => assignment.user
              ) as BasicUserDetails[]
            }
            assignMemberToSEPProposal={memberUser =>
              assignMemberToSEPProposal(memberUser)
            }
          />
        </DialogContent>
      </Dialog>
      <Grid container spacing={3}>
        <Grid data-cy="sep-assignments-table" item xs={12}>
          <MaterialTable
            icons={tableIcons}
            columns={SEPProposalColumns}
            components={{
              Toolbar: Toolbar,
            }}
            title={'SEP Proposals'}
            data={initialValues}
            isLoading={loadingSEPProposals}
            detailPanel={[
              {
                tooltip: 'Show Reviewers',
                render: ReviewersTable,
              },
            ]}
            actions={
              hasAccessRights
                ? [
                    rowData => ({
                      icon: AssignmentIndIcon,
                      onClick: () => setProposalId(rowData.proposalId),
                      tooltip: 'Assign SEP Member',
                    }),
                  ]
                : []
            }
            editable={
              hasAccessRights
                ? {
                    onRowDelete: (rowData: SepProposal): Promise<void> =>
                      removeProposalFromSEP(rowData),
                  }
                : {}
            }
            options={{
              search: true,
            }}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

SEPProposalsAndAssignmentsTable.propTypes = {
  sepId: PropTypes.number.isRequired,
  selectedCallId: PropTypes.number.isRequired,
  Toolbar: PropTypes.func.isRequired,
};

export default SEPProposalsAndAssignmentsTable;
