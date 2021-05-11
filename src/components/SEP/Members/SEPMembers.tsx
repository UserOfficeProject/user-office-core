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
import React, { useState, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import ParticipantModal from 'components/proposal/ParticipantModal';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, UserRole, Sep } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useSEPReviewersData } from 'hooks/SEP/useSEPReviewersData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles(() => ({
  darkerDisabledTextField: {
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.7) !important',
    },
  },
}));

type BasicUserDetailsWithRole = BasicUserDetails & { roleId: UserRole };

type SEPMembersProps = {
  data: Sep;
  /** Id of the SEP we are assigning members to */
  sepId: number;
  onSEPUpdate: (sep: Sep) => void;
  confirm: WithConfirmType;
};

const SEPMembers: React.FC<SEPMembersProps> = ({
  data: sepData,
  sepId,
  onSEPUpdate,
  confirm,
}) => {
  const [modalOpen, setOpen] = useState(false);
  const [sepChairModalOpen, setSepChairModalOpen] = useState(false);
  const [sepSecretaryModalOpen, setSepSecretaryModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setRenewTokenValue } = useRenewToken();
  const classes = useStyles();
  const {
    loadingMembers,
    SEPReviewersData,
    setSEPReviewersData,
  } = useSEPReviewersData(
    sepId,
    modalOpen || sepChairModalOpen || sepSecretaryModalOpen
  );
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const columns = [
    { title: 'Name', field: 'user.firstname' },
    {
      title: 'Surname',
      field: 'user.lastname',
    },
    {
      title: 'Organization',
      field: 'user.organisation',
    },
  ];

  const sendSEPChairUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepChair] = value;

    const {
      assignChairOrSecretary: { error },
    } = await api('SEP chair assigned successfully!').assignChairOrSecretary({
      assignChairOrSecretaryToSEPInput: {
        sepId: sepId,
        roleId: UserRole.SEP_CHAIR,
        userId: sepChair.id,
      },
    });

    setOpen(false);

    if (error) {
      return;
    }
    setSepChairModalOpen(false);
    onSEPUpdate({
      ...sepData,
      sepChair,
    });

    if (sepChair.id === user.id || sepData.sepChair?.id === user.id) {
      setRenewTokenValue();
    }
  };

  const sendSEPSecretaryUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepSecretary] = value;

    const {
      assignChairOrSecretary: { error },
    } = await api(
      'SEP secretary assigned successfully!'
    ).assignChairOrSecretary({
      assignChairOrSecretaryToSEPInput: {
        sepId: sepId,
        roleId: UserRole.SEP_SECRETARY,
        userId: sepSecretary.id,
      },
    });

    setOpen(false);

    if (error) {
      return;
    }

    setSepSecretaryModalOpen(false);
    onSEPUpdate({
      ...sepData,
      sepSecretary,
    });

    if (sepSecretary.id === user.id || sepData.sepSecretary?.id === user.id) {
      setRenewTokenValue();
    }
  };

  const addMember = async (users: BasicUserDetails[]): Promise<void> => {
    const {
      assignReviewersToSEP: { error },
    } = await api('SEP member assigned successfully!').assignReviewersToSEP({
      memberIds: users.map((user) => user.id),
      sepId,
    });

    setOpen(false);

    if (error) {
      return;
    }

    setSEPReviewersData((sepReviewers) => [
      ...sepReviewers,
      ...users.map((user) => ({ userId: user.id, sepId, user })),
    ]);
  };

  const removeMember = async (
    user: BasicUserDetailsWithRole
  ): Promise<void> => {
    const {
      removeMemberFromSep: { error },
    } = await api('SEP member removed successfully!').removeMemberFromSep({
      memberId: user.id,
      sepId,
      roleId: user.roleId,
    });

    if (error) {
      return;
    }

    if (user.roleId === UserRole.SEP_REVIEWER) {
      setSEPReviewersData((sepReviewers) =>
        sepReviewers.filter(({ userId }) => userId !== user.id)
      );
    } else {
      const key =
        user.roleId === UserRole.SEP_CHAIR ? 'sepChair' : 'sepSecretary';
      onSEPUpdate({
        ...sepData,
        [key]: null,
      });
    }
  };

  if (loadingMembers) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
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

  const alreadySelectedMembers = (SEPReviewersData ?? []).map(
    ({ userId }) => userId
  );

  sepData.sepChair && alreadySelectedMembers.push(sepData.sepChair.id);
  sepData.sepSecretary && alreadySelectedMembers.push(sepData.sepSecretary.id);

  return (
    <>
      <ParticipantModal
        show={modalOpen}
        close={(): void => setOpen(false)}
        addParticipants={addMember}
        selectedUsers={alreadySelectedMembers}
        selection={true}
        title={'Reviewer'}
        invitationUserRole={UserRole.SEP_REVIEWER}
        userRole={UserRole.SEP_REVIEWER}
      />
      <ParticipantModal
        show={sepChairModalOpen}
        close={(): void => setSepChairModalOpen(false)}
        addParticipants={sendSEPChairUpdate}
        selectedUsers={alreadySelectedMembers}
        title={'SEP Chair'}
        invitationUserRole={UserRole.SEP_CHAIR}
        userRole={UserRole.SEP_REVIEWER}
      />
      <ParticipantModal
        show={sepSecretaryModalOpen}
        close={(): void => setSepSecretaryModalOpen(false)}
        addParticipants={sendSEPSecretaryUpdate}
        selectedUsers={alreadySelectedMembers}
        title={'SEP Secretary'}
        invitationUserRole={UserRole.SEP_SECRETARY}
        userRole={UserRole.SEP_REVIEWER}
      />
      <>
        <Typography variant="h6" gutterBottom>
          SEP Members
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item sm={6} xs={12}>
            <TextField
              name="SEPChair"
              id="SEPChair"
              label="SEP Chair"
              type="text"
              value={
                sepData.sepChair
                  ? `${sepData.sepChair.firstname} ${sepData.sepChair.lastname}`
                  : ''
              }
              margin="none"
              fullWidth
              data-cy="SEPChair"
              required
              disabled
              className={
                sepData.sepChair ? classes.darkerDisabledTextField : ''
              }
              InputProps={{
                endAdornment: isUserOfficer && (
                  <>
                    {sepData.sepChair && (
                      <Tooltip title="Remove SEP Chair">
                        <IconButton
                          aria-label="Remove SEP chair"
                          onClick={() =>
                            confirm(
                              () => {
                                removeMember({
                                  ...(sepData.sepChair as BasicUserDetails),
                                  roleId: UserRole.SEP_CHAIR,
                                });
                              },
                              {
                                title: 'Remove SEP member',
                                description: `Are you sure you want to remove ${sepData.sepChair?.firstname} ${sepData.sepChair?.lastname} from this SEP?`,
                              }
                            )()
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
          <Grid item sm={6} xs={12}>
            <TextField
              name="SEPSecretary"
              id="SEPSecretary"
              label="SEP Secretary"
              type="text"
              value={
                sepData.sepSecretary
                  ? `${sepData.sepSecretary.firstname} ${sepData.sepSecretary.lastname}`
                  : ''
              }
              margin="none"
              fullWidth
              data-cy="SEPSecretary"
              required
              disabled
              className={
                sepData.sepSecretary ? classes.darkerDisabledTextField : ''
              }
              InputProps={{
                endAdornment: isUserOfficer && (
                  <>
                    {sepData.sepSecretary && (
                      <Tooltip title="Remove SEP Secretary">
                        <IconButton
                          aria-label="Remove SEP secretary"
                          onClick={() =>
                            confirm(
                              () => {
                                removeMember({
                                  ...(sepData.sepSecretary as BasicUserDetails),
                                  roleId: UserRole.SEP_SECRETARY,
                                });
                              },
                              {
                                title: 'Remove SEP member',
                                description: `Are you sure you want to remove ${sepData.sepSecretary?.firstname} ${sepData.sepSecretary?.lastname} from this SEP?`,
                              }
                            )()
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
              data={SEPReviewersData ?? []}
              editable={
                hasAccessRights
                  ? {
                      deleteTooltip: () => 'Remove reviewer',
                      onRowDelete: ({
                        user,
                      }: {
                        user: BasicUserDetails;
                      }): Promise<void> =>
                        removeMember({
                          ...user,
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
    </>
  );
};

export default withConfirm(SEPMembers);
