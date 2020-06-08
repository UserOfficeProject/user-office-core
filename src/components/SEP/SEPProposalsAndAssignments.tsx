import { Grid, DialogContent, Dialog, makeStyles } from '@material-ui/core';
import { AssignmentInd } from '@material-ui/icons';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { SepProposal, SepMember, SepAssignment } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPProposalsData } from '../../hooks/useSEPProposalsData';
import { BasicUserDetails } from '../../models/User';
import { tableIcons } from '../../utils/materialIcons';
import AssignSEPMemberToProposal from './AssignSEPMemberToProposal';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
  },
}));

type SEPProposalsAndAssignmentsProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

const SEPProposalsAndAssignments: React.FC<SEPProposalsAndAssignmentsProps> = ({
  sepId,
}) => {
  const {
    loadingSEPProposals,
    SEPProposalsData,
    setSEPProposalsData,
  } = useSEPProposalsData(sepId);
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();
  const [proposalId, setProposalId] = useState<null | number>(null);
  const classes = useStyles();

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
  ];

  const assignmentColumns = [
    {
      title: 'First name',
      field: 'user.firstname',
    },
    {
      title: 'Last name',
      field: 'user.lastname',
    },
    {
      title: 'Date assigned',
      field: 'dateAssigned',
      render: (rowData: SepAssignment): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
  ];

  if (loadingSEPProposals) {
    return <p>Loading...</p>;
  }

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

    if (!assignmentResult.assignMemberToSEPProposal.error && SEPProposalsData) {
      setSEPProposalsData(
        SEPProposalsData.map(proposalItem => {
          if (proposalItem.proposalId === proposalId) {
            const newAssignments = [
              ...(proposalItem.assignments || []),
              {
                user: memberUser.user,
                roles: memberUser.roles,
                dateAssigned: Date.now(),
                sepMemberUserId: memberUser.userId,
              },
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
  const ReviewersTable = (
    rowData: SepProposal | SepProposal[]
  ): JSX.Element => (
    <div className={classes.root} data-cy="sep-reviewer-assignments-table">
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={(rowData as SepProposal).assignments as SepAssignment[]}
        editable={{
          onRowDelete: (rowAssignmentsData: SepAssignment): Promise<void> =>
            removeAssignedReviewer(
              rowAssignmentsData,
              (rowData as SepProposal).proposalId
            ),
        }}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </div>
  );

  const proposalAssignments = initialValues.find(
    assignment => assignment.proposalId === proposalId
  )?.assignments;

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
            title={'SEP Proposals'}
            data={initialValues}
            detailPanel={[
              {
                tooltip: 'Show Reviewers',
                render: ReviewersTable,
              },
            ]}
            actions={[
              rowData => ({
                icon: AssignmentIndIcon,
                onClick: () => setProposalId(rowData.proposalId),
                tooltip: 'Assign SEP Member',
              }),
            ]}
            editable={{
              onRowDelete: (rowData: SepProposal): Promise<void> =>
                removeProposalFromSEP(rowData),
            }}
            options={{
              search: true,
            }}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

SEPProposalsAndAssignments.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPProposalsAndAssignments;
