import {
  makeStyles,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { SepAssignment } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPAssignmentsData } from '../../hooks/useSEPAssignmentsData';
import { useUsersData } from '../../hooks/useUsersData';
import { ButtonContainer } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import FormikDropdown from '../common/FormikDropdown';

type SEPMembersProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

type SEPMemberAssignments = {
  SEPChair: string;
  SEPSecretary: string;
  SEPReviewers: string[];
};

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPMembers: React.FC<SEPMembersProps> = ({ sepId }) => {
  const [show, setShow] = useState(false);
  const { loadingAssignments, SEPAssignmentsData } = useSEPAssignmentsData(
    sepId,
    show
  );
  const { loading, usersData } = useUsersData('');
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const initialValues: SEPMemberAssignments = {
    SEPChair: '',
    SEPSecretary: '',
    SEPReviewers: [],
  };
  const columns = [
    { title: 'First name', field: 'firstName' },
    {
      title: 'Last name',
      field: 'lastName',
    },
    {
      title: 'Email',
      field: 'email',
    },
  ];

  const initializeValues = (assignments: SepAssignment[]): void => {
    assignments.forEach(assignment => {
      assignment.roles.forEach(role => {
        switch (role.shortCode) {
          case 'SEP_Chair':
            initialValues.SEPChair = assignment.sepMemberUserId.toString();
            break;
          case 'SEP_Secretary':
            initialValues.SEPSecretary = assignment.sepMemberUserId.toString();
            break;
          default:
            initialValues.SEPReviewers.push(
              assignment.sepMemberUserId.toString()
            );
            break;
        }
      });
    });
  };

  const sendSEPMembersUpdate = (values: SEPMemberAssignments): void => {
    const newValues = {
      memberIds: [
        +values.SEPChair,
        +values.SEPSecretary,
        ...values.SEPReviewers.map(Number),
      ],
      sepId,
    };

    api()
      .assignMembers(newValues)
      .then(() => {
        const roleValues = [];

        roleValues.push({ userID: +values.SEPChair, roleID: 4, SEPID: sepId });
        roleValues.push({
          userID: +values.SEPSecretary,
          roleID: 5,
          SEPID: sepId,
        });

        values.SEPReviewers.forEach(sepReviewer => {
          roleValues.push({ userID: +sepReviewer, roleID: 6, SEPID: sepId });
        });

        api()
          .addSEPMembersRole({ addSEPMembersRole: roleValues })
          .then(result => {
            enqueueSnackbar('Updated Information', {
              variant: result.addSEPMembersRole.error ? 'error' : 'success',
            });
          });
      });
  };

  if (!usersData || loading || loadingAssignments) {
    return <p>Loading...</p>;
  }

  const usersForDropdown = usersData.users.map(user => {
    return {
      text: `${user.firstname} ${user.lastname}`,
      value: user.id.toString(),
    };
  });

  if (SEPAssignmentsData && SEPAssignmentsData.length > 0) {
    initializeValues(SEPAssignmentsData as SepAssignment[]);
  }

  const AddIcon = (): JSX.Element => <Add data-cy="add-member" />;

  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={(): void => setShow(false)}
      >
        <DialogContent>
          <p>Add member</p>
        </DialogContent>
      </Dialog>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={initialValues}
        onSubmit={(values, actions): void => {
          // Convert all strings to nu
          sendSEPMembersUpdate(values);
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography variant="h6" gutterBottom>
              SEP Members
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="SEPChair"
                  label="SEP Chair"
                  items={usersForDropdown}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormikDropdown
                  name="SEPSecretary"
                  label="SEP Secretary"
                  items={usersForDropdown}
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <div data-cy="sep-reviewers-table" style={{ width: '100%' }}>
                <MaterialTable
                  icons={tableIcons}
                  title={'Reviewers'}
                  columns={columns}
                  data={[]}
                  options={{
                    search: false,
                  }}
                  actions={[
                    {
                      icon: AddIcon,
                      isFreeAction: true,
                      tooltip: 'Add Member',
                      onClick: (): void => setShow(true),
                    },
                  ]}
                />
              </div>
            </Grid>
            <ButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Save SEP Members
              </Button>
            </ButtonContainer>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

SEPMembers.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMembers;
