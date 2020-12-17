import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Clear from '@material-ui/icons/Clear';
import Person from '@material-ui/icons/Person';
import PersonAdd from '@material-ui/icons/PersonAdd';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import DialogConfirmation from 'components/common/DialogConfirmation';
import UOLoader from 'components/common/UOLoader';
import ParticipantModal from 'components/proposal/ParticipantModal';
import { UserContext } from 'context/UserContextProvider';
import { SepMember, BasicUserDetails, UserRole } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(() => ({
  darkerDisabledTextField: {
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.7) !important',
    },
  },
}));

type BasicUserDetailsWithRole = BasicUserDetails & { roleId: UserRole };

type SEPMembersProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

type SEPMemberAssignments = {
  SEPChair: BasicUserDetails | null;
  SEPSecretary: BasicUserDetails | null;
  SEPReviewers: BasicUserDetails[];
};

const SEPMembers: React.FC<SEPMembersProps> = ({ sepId }) => {
  const [modalOpen, setOpen] = useState(false);
  const [sepChairModalOpen, setSepChairModalOpen] = useState(false);
  const [sepSecretaryModalOpen, setSepSecretaryModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setRenewTokenValue } = useRenewToken();
  const [
    memberToRemove,
    setMemberToRemove,
  ] = useState<BasicUserDetailsWithRole | null>(null);
  const classes = useStyles();
  const {
    loadingMembers,
    SEPMembersData,
    setSEPMembersData,
  } = useSEPMembersData(
    sepId,
    modalOpen || sepChairModalOpen || sepSecretaryModalOpen
  );
  const { api } = useDataApiWithFeedback();
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

  const sendSEPChairUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepChair] = value;

    const assignChairResult = await api(
      'SEP chair assigned successfully!'
    ).assignChairOrSecretary({
      addSEPMembersRole: {
        SEPID: sepId,
        roleID: UserRole.SEP_CHAIR,
        userIDs: [sepChair.id],
      },
    });

    setOpen(false);

    if (!assignChairResult.assignChairOrSecretary.error) {
      setSepChairModalOpen(false);
    }

    if (sepChair.id === user.id || initialValues.SEPChair?.id === user.id) {
      setRenewTokenValue();
    }
  };

  const sendSEPSecretaryUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepSecretary] = value;

    const assignSecretaryResult = await api(
      'SEP secretary assigned successfully!'
    ).assignChairOrSecretary({
      addSEPMembersRole: {
        SEPID: sepId,
        roleID: UserRole.SEP_SECRETARY,
        userIDs: [sepSecretary.id],
      },
    });

    setOpen(false);

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

    await api('SEP member assigned successfully!').assignMembers({
      memberIds: users.map(user => user.id),
      sepId,
    });

    setOpen(false);
  };

  const removeMember = async (
    user: BasicUserDetailsWithRole
  ): Promise<void> => {
    const result = await api('SEP member removed successfully!').removeMember({
      memberId: user.id,
      sepId,
      roleId: user.roleId,
    });

    if (SEPMembersData && !result.removeMember.error) {
      setSEPMembersData(
        SEPMembersData.map(member => {
          if (member.userId === user.id) {
            return {
              ...member,
              roles: member.roles.filter(
                role => role.shortCode.toUpperCase() !== user.roleId
              ),
            };
          }

          return member;
        })
      );
    }
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

  const alreadySelectedMembers = [
    ...initialValues.SEPReviewers.map(reviewer => reviewer.id),
  ]
    .concat(initialValues.SEPChair ? [initialValues.SEPChair?.id] : [])
    .concat(initialValues.SEPSecretary ? [initialValues.SEPSecretary?.id] : []);

  return (
    <React.Fragment>
      <DialogConfirmation
        title="Remove SEP member"
        text={`Are you sure you want to remove ${memberToRemove?.firstname} ${memberToRemove?.lastname} from this SEP?`}
        open={!!memberToRemove}
        action={() => removeMember(memberToRemove as BasicUserDetailsWithRole)}
        handleOpen={() => setMemberToRemove(null)}
      />
      <ParticipantModal
        show={modalOpen}
        close={(): void => setOpen(false)}
        addParticipants={addMember}
        selectedUsers={alreadySelectedMembers}
        selection={true}
        title={'Reviewer'}
        userRole={UserRole.REVIEWER}
      />
      <ParticipantModal
        show={sepChairModalOpen}
        close={(): void => setSepChairModalOpen(false)}
        addParticipants={sendSEPChairUpdate}
        selectedUsers={alreadySelectedMembers}
        title={'SEP Chair'}
        invitationUserRole={UserRole.SEP_CHAIR}
      />
      <ParticipantModal
        show={sepSecretaryModalOpen}
        close={(): void => setSepSecretaryModalOpen(false)}
        addParticipants={sendSEPSecretaryUpdate}
        selectedUsers={alreadySelectedMembers}
        title={'SEP Secretary'}
        invitationUserRole={UserRole.SEP_SECRETARY}
      />
      <>
        <Typography variant="h6" gutterBottom>
          SEP Members
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={6}>
            <TextField
              name="SEPChair"
              id="SEPChair"
              label="SEP Chair"
              type="text"
              value={
                initialValues.SEPChair
                  ? `${initialValues.SEPChair.firstname} ${initialValues.SEPChair.lastname}`
                  : ''
              }
              margin="none"
              fullWidth
              data-cy="SEPChair"
              required
              disabled
              className={
                initialValues.SEPChair ? classes.darkerDisabledTextField : ''
              }
              InputProps={{
                endAdornment: hasAccessRights && (
                  <>
                    {!!initialValues.SEPChair && (
                      <Tooltip title="Remove SEP Chair">
                        <IconButton
                          aria-label="Remove SEP chair"
                          onClick={() =>
                            setMemberToRemove({
                              ...(initialValues.SEPChair as BasicUserDetails),
                              roleId: UserRole.SEP_CHAIR,
                            })
                          }
                        >
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Set SEP Chair">
                      <IconButton
                        edge="start"
                        onClick={() => setSepChairModalOpen(true)}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                  </>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="SEPSecretary"
              id="SEPSecretary"
              label="SEP Secretary"
              type="text"
              value={
                initialValues.SEPSecretary
                  ? `${initialValues.SEPSecretary.firstname} ${initialValues.SEPSecretary.lastname}`
                  : ''
              }
              margin="none"
              fullWidth
              data-cy="SEPSecretary"
              required
              disabled
              className={
                initialValues.SEPSecretary
                  ? classes.darkerDisabledTextField
                  : ''
              }
              InputProps={{
                endAdornment: hasAccessRights && (
                  <>
                    {!!initialValues.SEPSecretary && (
                      <Tooltip title="Remove SEP Secretary">
                        <IconButton
                          aria-label="Remove SEP secretary"
                          onClick={() =>
                            setMemberToRemove({
                              ...(initialValues.SEPSecretary as BasicUserDetails),
                              roleId: UserRole.SEP_SECRETARY,
                            })
                          }
                        >
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Set SEP Secretary">
                      <IconButton
                        edge="start"
                        onClick={() => setSepSecretaryModalOpen(true)}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                  </>
                ),
              }}
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
              editable={
                hasAccessRights
                  ? {
                      onRowDelete: (rowData: BasicUserDetails): Promise<void> =>
                        removeMember({
                          ...rowData,
                          roleId: UserRole.SEP_REVIEWER,
                        }),
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
      </>
    </React.Fragment>
  );
};

SEPMembers.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMembers;
