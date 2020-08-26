import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Person from '@material-ui/icons/Person';
import PersonAdd from '@material-ui/icons/PersonAdd';
import { Formik, Form, Field } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import ParticipantModal from 'components/proposal/ParticipantModal';
import { UserContext } from 'context/UserContextProvider';
import { SepMember, BasicUserDetails, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';
import { tableIcons } from 'utils/materialIcons';

type SEPMembersProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

type SEPMemberAssignments = {
  SEPChair: BasicUserDetails | null;
  SEPSecretary: BasicUserDetails | null;
  SEPReviewers: BasicUserDetails[];
};

const DarkerDisabledTextField = withStyles({
  root: {
    marginRight: 8,
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.7)', // (default alpha is 0.38)
    },
  },
})(TextField);

const SEPMembers: React.FC<SEPMembersProps> = ({ sepId }) => {
  const [modalOpen, setOpen] = useState(false);
  const [sepChairModalOpen, setSepChairModalOpen] = useState(false);
  const [sepSecretaryModalOpen, setSepSecretaryModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setRenewTokenValue } = useRenewToken();
  const {
    loadingMembers,
    SEPMembersData,
    setSEPMembersData,
  } = useSEPMembersData(
    sepId,
    modalOpen || sepChairModalOpen || sepSecretaryModalOpen
  );
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);

  const initialValues: SEPMemberAssignments = {
    SEPChair: null,
    SEPSecretary: null,
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

  const initializeValues = (members: SepMember[]): void => {
    members.forEach(member => {
      member.roles.forEach(role => {
        switch (role.shortCode.toUpperCase()) {
          case UserRole.SEP_CHAIR:
            initialValues.SEPChair = member.user;
            break;
          case UserRole.SEP_SECRETARY:
            initialValues.SEPSecretary = member.user;
            break;
          case UserRole.SEP_REVIEWER:
            initialValues.SEPReviewers.push(member.user);
            break;
          default:
            break;
        }
      });
    });
  };

  const showNotification = (isError: boolean): void => {
    setOpen(false);
    enqueueSnackbar('Updated Information', {
      variant: isError ? 'error' : 'success',
    });
  };

  const sendSEPChairUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepChair] = value;

    const assignChairResult = await api().assignChairOrSecretary({
      addSEPMembersRole: {
        SEPID: sepId,
        roleID: UserRole.SEP_CHAIR,
        userIDs: [sepChair.id],
      },
    });

    showNotification(!!assignChairResult.assignChairOrSecretary.error);
    setSepChairModalOpen(false);

    if (sepChair.id === user.id || initialValues.SEPChair?.id === user.id) {
      setRenewTokenValue();
    }
  };

  const sendSEPSecretaryUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepSecretary] = value;

    const assignSecretaryResult = await api().assignChairOrSecretary({
      addSEPMembersRole: {
        SEPID: sepId,
        roleID: UserRole.SEP_SECRETARY,
        userIDs: [sepSecretary.id],
      },
    });

    showNotification(!!assignSecretaryResult.assignChairOrSecretary.error);

    if (!assignSecretaryResult.assignChairOrSecretary.error) {
      setSepSecretaryModalOpen(false);
    }

    if (
      sepSecretary.id === user.id ||
      initialValues.SEPSecretary?.id === user.id
    ) {
      setRenewTokenValue();
    }
  };

  const addMember = async (users: BasicUserDetails[]): Promise<void> => {
    initialValues.SEPReviewers.push(...users);

    const assignedMembersResult = await api().assignMembers({
      memberIds: users.map(user => user.id),
      sepId,
    });

    showNotification(!!assignedMembersResult.assignMembers.error);
  };

  const removeMember = async (user: BasicUserDetails): Promise<void> => {
    const removedMembersResult = await api().removeMember({
      memberId: user.id,
      sepId,
    });

    if (SEPMembersData) {
      setSEPMembersData(
        SEPMembersData.map(member => {
          if (member.userId === user.id) {
            return {
              ...member,
              roles: member.roles.filter(
                role => role.shortCode.toUpperCase() !== UserRole.SEP_REVIEWER
              ),
            };
          }

          return member;
        })
      );
    }

    showNotification(!!removedMembersResult.removeMember.error);
  };

  if (loadingMembers) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
  }

  if (SEPMembersData && SEPMembersData.length > 0) {
    initializeValues(SEPMembersData as SepMember[]);
  }

  const AddPersonIcon = (): JSX.Element => <PersonAdd data-cy="add-member" />;

  const tableActions = hasAccessRights
    ? [
        {
          icon: AddPersonIcon,
          isFreeAction: true,
          tooltip: 'Add Member',
          onClick: (): void => setOpen(true),
        },
      ]
    : [];

  return (
    <React.Fragment>
      <ParticipantModal
        show={modalOpen}
        close={(): void => setOpen(false)}
        addParticipants={addMember}
        selectedUsers={initialValues.SEPReviewers.map(reviewer => reviewer.id)}
        selection={true}
        title={'Reviewer'}
        userRole={UserRole.REVIEWER}
      />
      <ParticipantModal
        show={sepChairModalOpen}
        close={(): void => setSepChairModalOpen(false)}
        addParticipants={sendSEPChairUpdate}
        selectedUsers={[
          ...initialValues.SEPReviewers.map(reviewer => reviewer.id),
        ].concat(initialValues.SEPChair ? [initialValues.SEPChair?.id] : [])}
        title={'SEP Chair'}
        invitationUserRole={UserRole.SEP_CHAIR}
      />
      <ParticipantModal
        show={sepSecretaryModalOpen}
        close={(): void => setSepSecretaryModalOpen(false)}
        addParticipants={sendSEPSecretaryUpdate}
        selectedUsers={[
          ...initialValues.SEPReviewers.map(reviewer => reviewer.id),
        ].concat(
          initialValues.SEPSecretary ? [initialValues.SEPSecretary?.id] : []
        )}
        title={'SEP Secretary'}
        invitationUserRole={UserRole.SEP_SECRETARY}
      />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={initialValues}
        onSubmit={(values, actions): void => {
          actions.setSubmitting(false);
        }}
      >
        {({ errors }): JSX.Element => (
          <Form>
            <Typography variant="h6" gutterBottom>
              SEP Members
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={5}>
                <Field
                  name="SEPChair"
                  id="SEPChair"
                  label="SEP Chair"
                  type="text"
                  value={
                    initialValues.SEPChair
                      ? `${initialValues.SEPChair.firstname} ${initialValues.SEPChair.lastname}`
                      : ''
                  }
                  component={
                    initialValues.SEPChair ? DarkerDisabledTextField : TextField
                  }
                  margin="none"
                  fullWidth
                  data-cy="SEPChair"
                  m={0}
                  required
                  disabled
                  error={errors.SEPChair !== undefined}
                  helperText={errors.SEPChair && errors.SEPChair}
                />
              </Grid>
              <Grid item xs={1}>
                {hasAccessRights && (
                  <Tooltip title="Set SEP Chair">
                    <IconButton
                      edge="start"
                      onClick={() => setSepChairModalOpen(true)}
                    >
                      <Person />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs={5}>
                <Field
                  name="SEPSecretary"
                  id="SEPSecretary"
                  label="SEP Secretary"
                  type="text"
                  value={
                    initialValues.SEPSecretary
                      ? `${initialValues.SEPSecretary.firstname} ${initialValues.SEPSecretary.lastname}`
                      : ''
                  }
                  component={
                    initialValues.SEPSecretary
                      ? DarkerDisabledTextField
                      : TextField
                  }
                  margin="none"
                  fullWidth
                  data-cy="SEPSecretary"
                  required
                  disabled
                  error={errors.SEPSecretary !== undefined}
                  helperText={errors.SEPSecretary && errors.SEPSecretary}
                />
              </Grid>
              <Grid item xs={1}>
                {hasAccessRights && (
                  <Tooltip title="Set SEP Secretary">
                    <IconButton
                      edge="start"
                      onClick={() => setSepSecretaryModalOpen(true)}
                    >
                      <Person />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid data-cy="sep-reviewers-table" item xs={12}>
                <MaterialTable
                  icons={tableIcons}
                  title={'Reviewers'}
                  columns={columns}
                  data={initialValues.SEPReviewers}
                  editable={
                    hasAccessRights
                      ? {
                          onRowDelete: (
                            rowData: BasicUserDetails
                          ): Promise<void> => removeMember(rowData),
                        }
                      : {}
                  }
                  options={{
                    search: false,
                  }}
                  actions={tableActions}
                />
              </Grid>
            </Grid>
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
