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
        switch (role.shortCode.toUpperCase()) {
          case UserRole.SEP_CHAIR:
            initialValues.SEPChair = assignment.sepMemberUserId.toString();
            break;
          case UserRole.SEP_SECRETARY:
            initialValues.SEPSecretary = assignment.sepMemberUserId.toString();
            break;
          case UserRole.SEP_MEMBER:
            initialValues.SEPReviewers.push(assignment.user);
            break;
          default:
            break;
        }
      });
    });
  };

  const assignChairAndSecretaryToSEP = (
    values: SEPMemberAssignments
  ): [number[], AddSepMembersRole[]] => {
    const memberIds = [];
    const roleValues = [];

    if (values.SEPChair) {
      memberIds.push(+values.SEPChair);

      roleValues.push({
        userID: +values.SEPChair,
        roleID: UserRole.SEP_CHAIR,
        SEPID: sepId,
      });
    }

    if (values.SEPSecretary) {
      memberIds.push(+values.SEPSecretary);

      roleValues.push({
        userID: +values.SEPSecretary,
        roleID: UserRole.SEP_SECRETARY,
        SEPID: sepId,
      });
    }

    return [memberIds, roleValues];
  };

  const showNotification = (isError: boolean): void => {
    setOpen(false);
    enqueueSnackbar('Updated Information', {
      variant: isError ? 'error' : 'success',
    });
  };

  const sendSEPChairAndSecretaryUpdate = async (
    values: SEPMemberAssignments
  ): Promise<void> => {
    const [memberIds, roleValues] = assignChairAndSecretaryToSEP(values);

    const assignChairAndSecretaryResult = await api().assignChairAndSecretary({
      memberIds,
      sepId,
    });

    const SEPMembersRoleResult = await api().addSEPMembersRole({
      addSEPMembersRole: roleValues,
    });

    showNotification(
      !!assignChairAndSecretaryResult.assignChairAndSecretary.error ||
        !!SEPMembersRoleResult.addSEPMembersRole.error
    );
  };

  const addMember = async (user: BasicUserDetails): Promise<void> => {
    initialValues.SEPReviewers.push(user);

    const assignedMembersResult = await api().assignMember({
      memberId: user.id,
      sepId,
    });

    const SEPMembersRoleResult = await api().addSEPMembersRole({
      addSEPMembersRole: [
        {
          userID: user.id,
          roleID: UserRole.SEP_MEMBER,
          SEPID: sepId,
        },
      ],
    });

    showNotification(
      !!assignedMembersResult.assignMember.error ||
        !!SEPMembersRoleResult.addSEPMembersRole.error
    );
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
        addParticipant={addMember}
        selectedUsers={initialValues.SEPReviewers.map(reviewer => reviewer.id)}
        title={'Reviewer'}
        userRole={UserRole.REVIEWER}
      />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={initialValues}
        onSubmit={(values, actions): void => {
          sendSEPChairAndSecretaryUpdate(values);
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
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
                  data-cy="sep-chair"
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
              <Grid data-cy="sep-reviewers-table" item xs={12}>
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
              </Grid>
            </Grid>
            <ButtonContainer>
              <Button
                disabled={
                  isSubmitting ||
                  JSON.stringify(values) === JSON.stringify(initialValues)
                }
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
