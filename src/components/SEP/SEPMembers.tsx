import { makeStyles, Typography, Grid, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  SepAssignment,
  BasicUserDetails,
  UserRole,
  AddSepMembersRole,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useSEPAssignmentsData } from '../../hooks/useSEPAssignmentsData';
import { useUsersData } from '../../hooks/useUsersData';
import { ButtonContainer } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import FormikDropdown from '../common/FormikDropdown';
import ParticipantModal from '../proposal/ParticipantModal';

type SEPMembersProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

type SEPMemberAssignments = {
  SEPChair: string;
  SEPSecretary: string;
  SEPReviewers: BasicUserDetails[];
};

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPMembers: React.FC<SEPMembersProps> = ({ sepId }) => {
  const [modalOpen, setOpen] = useState(false);
  const { loadingAssignments, SEPAssignmentsData } = useSEPAssignmentsData(
    sepId,
    modalOpen
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
    { title: 'Name', field: 'firstname' },
    {
      title: 'Surname',
      field: 'lastname',
    },
    {
      title: 'Organisation',
      field: 'organisation',
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
          case 'SEP_Member':
            initialValues.SEPReviewers.push(assignment.user);
            break;
          default:
            break;
        }
      });
    });
  };

  const assignRolesToSEPMembers = (
    values: SEPMemberAssignments
  ): AddSepMembersRole[] => {
    const roleValues = [];

    if (values.SEPChair) {
      roleValues.push({ userID: +values.SEPChair, roleID: 4, SEPID: sepId });
    }

    if (values.SEPSecretary) {
      roleValues.push({
        userID: +values.SEPSecretary,
        roleID: 5,
        SEPID: sepId,
      });
    }

    if (values.SEPReviewers && values.SEPReviewers.length > 0) {
      values.SEPReviewers.forEach(sepReviewer => {
        roleValues.push({ userID: sepReviewer.id, roleID: 6, SEPID: sepId });
      });
    }

    return roleValues;
  };

  const assignMembersToSEP = (values: SEPMemberAssignments): number[] => {
    let memberIds = [];

    if (values.SEPChair) {
      memberIds.push(+values.SEPChair);
    }

    if (values.SEPSecretary) {
      memberIds.push(+values.SEPSecretary);
    }

    if (values.SEPReviewers && values.SEPReviewers.length > 0) {
      memberIds = memberIds.concat([
        ...values.SEPReviewers.map(reviewer => reviewer.id),
      ]);
    }

    return memberIds;
  };

  const sendSEPMembersUpdate = (values: SEPMemberAssignments): void => {
    const memberIds = assignMembersToSEP(values);

    api()
      .assignMembers({ memberIds, sepId })
      .then(() => {
        const roleValues = assignRolesToSEPMembers(values);

        api()
          .addSEPMembersRole({ addSEPMembersRole: roleValues })
          .then(result => {
            setOpen(false);
            enqueueSnackbar('Updated Information', {
              variant: result.addSEPMembersRole.error ? 'error' : 'success',
            });
          });
      });
  };

  const addUser = async (user: BasicUserDetails): Promise<void> => {
    sendSEPMembersUpdate({ SEPReviewers: [user] } as SEPMemberAssignments);
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
      <ParticipantModal
        show={modalOpen}
        close={(): void => setOpen(false)}
        addParticipant={addUser}
        selectedUsers={initialValues.SEPReviewers.map(reviewer => reviewer.id)}
        title={'Reviewer'}
        userRole={UserRole.REVIEWER}
      />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={initialValues}
        onSubmit={(values, actions): void => {
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
                  data={initialValues.SEPReviewers}
                  options={{
                    search: false,
                  }}
                  actions={[
                    {
                      icon: AddIcon,
                      isFreeAction: true,
                      tooltip: 'Add Member',
                      onClick: (): void => setOpen(true),
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
