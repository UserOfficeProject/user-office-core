import { Grid } from '@material-ui/core';
import dateformat from 'dateformat';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { SepAssignment } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPAssignmentsData } from '../../hooks/useSEPAssignmentsData';
import { tableIcons } from '../../utils/materialIcons';

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

  const initialValues = SEPAssignmentsData as SepAssignment[];

  return (
    <React.Fragment>
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
