import { Grid, DialogContent, Dialog } from '@material-ui/core';
import { AssignmentInd } from '@material-ui/icons';
import dateformat from 'dateformat';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { SepAssignment } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPAssignmentsData } from '../../hooks/useSEPAssignmentsData';
import { BasicUserDetails } from '../../models/User';
import { tableIcons } from '../../utils/materialIcons';
import AssignSEPMemberToProposal from './AssignSEPMemberToProposal';

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
      render: (rowData: SepAssignment): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
    {
      title: 'Reaassigned',
      render: (rowData: SepAssignment): string =>
        rowData.reassigned ? 'Yes' : 'No',
    },
    {
      title: 'Reviewer assigned',
      render: (rowData: SepAssignment): string =>
        rowData.user
          ? `${rowData.user.firstname} ${rowData.user.lastname}`
          : '-',
    },
  ];

  if (loadingAssignments) {
    return <p>Loading...</p>;
  }

  const removeAssignedProposal = async (
    assignment: SepAssignment
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

  const assignMemberToSEPProposal = async (memberUser: BasicUserDetails) => {
    const assignmentResult = await api().assignMemberToSEPProposal({
      memberId: memberUser.id,
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
            return {
              ...assitnmentItem,
              sepMemberUserId: memberUser.id,
              user: memberUser,
            };
          } else {
            return assitnmentItem;
          }
        })
      );
    }

    enqueueSnackbar('Member assigned', {
      variant: assignmentResult.assignMemberToSEPProposal.error
        ? 'error'
        : 'success',
    });
  };

  const initialValues = SEPAssignmentsData as SepAssignment[];
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

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
            close={() => setProposalId(null)}
            assignedMember={
              initialValues.find(
                assignment => assignment.proposalId === proposalId
              )?.sepMemberUserId
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
                  actions={[
                    rowData => ({
                      icon: AssignmentIndIcon,
                      onClick: () => setProposalId(rowData.proposalId),
                      tooltip: 'Assign SEP Member',
                    }),
                  ]}
                  editable={{
                    onRowDelete: (rowData: SepAssignment): Promise<void> =>
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
