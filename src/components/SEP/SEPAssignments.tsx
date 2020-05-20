import { Grid, DialogContent, Dialog, makeStyles } from '@material-ui/core';
import { AssignmentInd } from '@material-ui/icons';
import dateformat from 'dateformat';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { SepProposal, SepMember } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPAssignmentsData } from '../../hooks/useSEPAssignmentsData';
import { BasicUserDetails } from '../../models/User';
import { tableIcons } from '../../utils/materialIcons';
import AssignSEPMemberToProposal from './AssignSEPMemberToProposal';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& .MuiTableFooter-root .MuiTableCell-footer': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
  },
}));

type SEPAssignmentsProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

const SEPAssignments: React.FC<SEPAssignmentsProps> = ({ sepId }) => {
  const {
    loadingAssignments,
    SEPAssignmentsData,
    setSEPAssignmentsData,
  } = useSEPAssignmentsData(sepId);
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();
  const [proposalId, setProposalId] = useState<null | number>(null);
  const classes = useStyles();

  const columns = [
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

  const reviewerColumns = [
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
      render: (rowData: SepProposal): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
  ];

  if (loadingAssignments) {
    return <p>Loading...</p>;
  }

  const removeAssignedProposal = async (
    assignment: SepProposal
  ): Promise<void> => {
    const removeProposalAssignment = await api().removeProposalAssignment({
      proposalId: assignment.proposalId,
      sepId,
    });

    if (SEPAssignmentsData) {
      setSEPAssignmentsData(
        SEPAssignmentsData.filter(
          assitnmentItem => assitnmentItem.proposalId !== assignment.proposalId
        )
      );
    }

    const isError = !!removeProposalAssignment.removeProposalAssignment.error;

    enqueueSnackbar('Assignment removed', {
      variant: isError ? 'error' : 'success',
    });
  };

  const removeAssignedReviewer = async (
    assignment: SepMember,
    proposalId: number
  ): Promise<void> => {
    const removeAssignedReviewer = await api().removeMemberFromSEPProposal({
      proposalId,
      sepId,
      memberId: assignment.user.id,
    });

    if (SEPAssignmentsData) {
      setSEPAssignmentsData(
        SEPAssignmentsData.map(assitnmentItem => {
          if (assitnmentItem.proposalId === proposalId) {
            const newAssignments =
              assitnmentItem.assignments?.filter(
                oldAssignment =>
                  oldAssignment.sepMemberUserId !== assignment.user.id
              ) || [];

            return {
              ...assitnmentItem,
              assignments: newAssignments,
            };
          } else {
            return assitnmentItem;
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

    if (
      !assignmentResult.assignMemberToSEPProposal.error &&
      SEPAssignmentsData
    ) {
      setSEPAssignmentsData(
        SEPAssignmentsData.map(assitnmentItem => {
          if (assitnmentItem.proposalId === proposalId) {
            const newAssignments = [
              ...(assitnmentItem.assignments || []),
              {
                user: memberUser.user,
                roles: memberUser.roles,
                dateAssigned: Date.now(),
                sepMemberUserId: memberUser.userId,
              },
            ];

            return {
              ...assitnmentItem,
              assignments: newAssignments,
            };
          } else {
            return assitnmentItem;
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

  const initialValues = SEPAssignmentsData as SepProposal[];
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;
  const ReviewersTable = (rowData: any): JSX.Element => (
    <div className={classes.root}>
      <MaterialTable
        icons={tableIcons}
        columns={reviewerColumns}
        title={'Proposal reviewers'}
        data={rowData.assignments}
        editable={{
          onRowDelete: (rowAssignmentsData: any): Promise<void> =>
            removeAssignedReviewer(rowAssignmentsData, rowData.proposalId),
        }}
        options={{
          search: false,
          emptyRowsWhenPaging: false,
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
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={initialValues}
        onSubmit={(values, actions): void => {
          actions.setSubmitting(false);
        }}
      >
        {(): JSX.Element => (
          <Form>
            <Grid container spacing={3}>
              <Grid data-cy="sep-assignments-table" item xs={12}>
                <MaterialTable
                  icons={tableIcons}
                  columns={columns}
                  title={'SEP Assignments'}
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
                      removeAssignedProposal(rowData),
                  }}
                  options={{
                    search: true,
                  }}
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

SEPAssignments.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPAssignments;
