import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import dateformat from 'dateformat';
import MaterialTable, { Options } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { SepAssignment, ReviewStatus, UserRole } from 'generated/sdk';
import {
  useSEPProposalsData,
  SEPProposalType,
  SEPProposalAssignmentType,
} from 'hooks/SEP/useSEPProposalsData';
import { tableIcons } from 'utils/materialIcons';
import { average } from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignSEPMemberToProposal, {
  SepAssignedMember,
} from './AssignSEPMemberToProposal';
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
  const { api } = useDataApiWithFeedback();
  const [proposalId, setProposalId] = useState<null | number>(null);
  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  const getGradesFromAssignments = (assignments: SEPProposalAssignmentType[]) =>
    assignments
      ?.filter(
        assignment => assignment.review?.status === ReviewStatus.SUBMITTED
      )
      .map(assignment => assignment.review?.grade!) ?? [];

  const SEPProposalColumns = [
    { title: 'ID', field: 'proposal.shortCode' },
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
      field: 'dateAssigned',
      render: (rowData: SEPProposalType): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
    {
      title: 'Reviewers',
      render: (rowData: SEPProposalType): string =>
        rowData.assignments ? rowData.assignments.length.toString() : '-',
    },
    {
      title: 'Average grade',
      render: (rowData: SEPProposalType): string => {
        const avgGrade = average(
          getGradesFromAssignments(rowData.assignments ?? [])
        );

        return isNaN(avgGrade) ? '-' : `${avgGrade}`;
      },
    },
  ];

  const removeProposalFromSEP = async (
    proposalToRemove: SEPProposalType
  ): Promise<void> => {
    await api('Assignment removed').removeProposalAssignment({
      proposalId: proposalToRemove.proposalId,
      sepId,
    });

    setSEPProposalsData(sepProposalData =>
      sepProposalData.filter(
        proposalItem => proposalItem.proposalId !== proposalToRemove.proposalId
      )
    );
  };

  const removeAssignedReviewer = async (
    assignedReviewer: SepAssignment,
    proposalId: number
  ): Promise<void> => {
    /**
     * TODO(asztalos): merge `removeMemberFromSEPProposal` and `removeUserForReview` (same goes for creation)
     *                otherwise if one of them fails we may end up with an broken state
     */
    await api('Reviewer removed').removeMemberFromSEPProposal({
      proposalId,
      sepId,
      memberId: assignedReviewer.sepMemberUserId as number,
    });

    assignedReviewer.review &&
      (await api().removeUserForReview({
        reviewId: assignedReviewer.review.id,
        sepId,
      }));

    setSEPProposalsData(sepProposalData =>
      sepProposalData.map(proposalItem => {
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
  };

  const assignMemberToSEPProposal = async (
    assignedMembers: SepAssignedMember[]
  ) => {
    setProposalId(null);

    if (!proposalId) {
      return;
    }

    const {
      assignSepReviewersToProposal: { error },
    } = await api('Members assigned').assignSepReviewersToProposal({
      memberIds: assignedMembers.map(({ id }) => id),
      proposalId: proposalId,
      sepId,
    });

    if (error) {
      return;
    }

    const { proposalReviews } = await api().getProposalReviews({
      proposalId,
    });

    if (!proposalReviews) {
      return;
    }

    setSEPProposalsData(sepProposalData =>
      sepProposalData.map(proposalItem => {
        if (proposalItem.proposalId === proposalId) {
          const newAssignments: SEPProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...assignedMembers.map(({ role, ...user }) => ({
              sepMemberUserId: user.id,
              dateAssigned: Date.now(),
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
  };

  const initialValues: SEPProposalType[] = SEPProposalsData;
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const proposalAssignments = initialValues.find(
    assignment => assignment.proposalId === proposalId
  )?.assignments;

  const updateReviewStatusAndGrade = (
    sepProposalData: SEPProposalType[],
    editingProposalData: SEPProposalType,
    currentAssignment: SepAssignment
  ) => {
    const newProposalsData =
      sepProposalData?.map(sepProposalsData => {
        if (sepProposalsData.proposalId === editingProposalData.proposalId) {
          return {
            ...editingProposalData,
            assignments:
              editingProposalData.assignments?.map(proposalAssignment => {
                if (
                  proposalAssignment?.review?.id ===
                  currentAssignment?.review?.id
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

  const ReviewersTable = (rowData: SEPProposalType) => (
    <SEPAssignedReviewersTable
      sepProposal={rowData}
      removeAssignedReviewer={removeAssignedReviewer}
      updateView={currentAssignment => {
        setSEPProposalsData(sepProposalData =>
          updateReviewStatusAndGrade(
            sepProposalData,
            rowData,
            currentAssignment
          )
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <Dialog
        maxWidth="sm"
        fullWidth
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!proposalId}
        onClose={(): void => setProposalId(null)}
      >
        <DialogContent>
          <AssignSEPMemberToProposal
            sepId={sepId}
            assignedMembers={
              proposalAssignments?.map(assignment => assignment.user) ?? []
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
              hasRightToAssignReviewers
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
              hasRightToRemoveAssignedProposal
                ? {
                    deleteTooltip: () => 'Remove assigned proposal',
                    onRowDelete: (rowData: SEPProposalType): Promise<void> =>
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
