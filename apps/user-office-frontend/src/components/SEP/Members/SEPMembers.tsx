import MaterialTable from '@material-table/core';
import Clear from '@mui/icons-material/Clear';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Person from '@mui/icons-material/Person';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useState, useContext } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import ParticipantModal from 'components/proposal/ParticipantModal';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, UserRole, Sep } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useSEPReviewersData } from 'hooks/SEP/useSEPReviewersData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type BasicUserDetailsWithRole = BasicUserDetails & { roleId: UserRole };

type SEPMembersProps = {
  data: Sep;
  onSEPUpdate: (sep: Sep) => void;
  confirm: WithConfirmType;
};

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
  {
    title: '# proposals',
    field: 'proposalsCount',
  },
];

const SEPMembers: React.FC<SEPMembersProps> = ({
  data: sepData,
  onSEPUpdate,
  confirm,
}) => {
  const [modalOpen, setOpen] = useState(false);
  const [sepChairModalOpen, setSepChairModalOpen] = useState(false);
  const [sepSecretaryModalOpen, setSepSecretaryModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setRenewTokenValue } = useRenewToken();
  const { loadingMembers, SEPReviewersData, setSEPReviewersData } =
    useSEPReviewersData(
      sepData.id,
      modalOpen || sepChairModalOpen || sepSecretaryModalOpen
    );
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const sendSEPChairUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [sepChair] = value;

    const {
      assignChairOrSecretary: { rejection },
    } = await api({
      toastSuccessMessage: 'SEP chair assigned successfully!',
    }).assignChairOrSecretary({
      assignChairOrSecretaryToSEPInput: {
        sepId: sepData.id,
        roleId: UserRole.SEP_CHAIR,
        userId: sepChair.id,
      },
    });

    setOpen(false);

    if (rejection) {
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
      assignChairOrSecretary: { rejection },
    } = await api({
      toastSuccessMessage: 'SEP secretary assigned successfully!',
    }).assignChairOrSecretary({
      assignChairOrSecretaryToSEPInput: {
        sepId: sepData.id,
        roleId: UserRole.SEP_SECRETARY,
        userId: sepSecretary.id,
      },
    });

    setOpen(false);

    if (rejection) {
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
      assignReviewersToSEP: { rejection },
    } = await api({
      toastSuccessMessage: 'SEP member assigned successfully!',
    }).assignReviewersToSEP({
      memberIds: users.map((user) => user.id),
      sepId: sepData.id,
    });

    setOpen(false);

    if (rejection) {
      return;
    }

    setSEPReviewersData((sepReviewers) => [
      ...sepReviewers,
      ...users.map((user) => ({ userId: user.id, sepId: sepData.id, user })),
    ]);
  };

  const removeMember = async (
    user: BasicUserDetailsWithRole
  ): Promise<void> => {
    const {
      removeMemberFromSep: { rejection },
    } = await api({
      toastSuccessMessage: 'SEP member removed successfully!',
    }).removeMemberFromSep({
      memberId: user.id,
      sepId: sepData.id,
      roleId: user.roleId,
    });

    if (rejection) {
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

  const removeChairOrSecretary = (roleId: UserRole) => {
    const memberToRemove =
      roleId === UserRole.SEP_CHAIR ? sepData.sepChair : sepData.sepSecretary;

    confirm(
      () => {
        removeMember({
          ...(memberToRemove as BasicUserDetails),
          roleId,
        });
      },
      {
        title: 'Remove SEP member',
        description: `Are you sure you want to remove ${getFullUserName(
          memberToRemove
        )} from this SEP?`,
      }
    )();
  };

  if (loadingMembers) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
  }

  const AddPersonIcon = (): JSX.Element => <PersonAdd data-cy="add-member" />;

  const alreadySelectedMembers = SEPReviewersData.map(({ userId }) => userId);

  sepData.sepChair && alreadySelectedMembers.push(sepData.sepChair.id);
  sepData.sepSecretary && alreadySelectedMembers.push(sepData.sepSecretary.id);

  const SEPReviewersDataWithId = SEPReviewersData.map((sepReviewer) =>
    Object.assign(sepReviewer, { id: sepReviewer.userId })
  );

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
      <Typography variant="h6" component="h2" gutterBottom>
        SEP Members
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item sm={6} xs={12}>
          <TextField
            name="SEPChair"
            id="SEPChair"
            label="SEP Chair"
            type="text"
            value={getFullUserName(sepData.sepChair)}
            margin="none"
            fullWidth
            data-cy="SEPChair"
            required
            InputProps={{
              readOnly: true,
              endAdornment: isUserOfficer && (
                <>
                  {sepData.sepChair && (
                    <Tooltip title="Remove SEP Chair">
                      <IconButton
                        aria-label="Remove SEP chair"
                        onClick={() =>
                          removeChairOrSecretary(UserRole.SEP_CHAIR)
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
              startAdornment: sepData.sepChair && (
                <Tooltip
                  title={`Number of proposals to review: ${
                    sepData.sepChairProposalCount || 0
                  }`}
                  sx={{ padding: '2px', marginRight: '4px' }}
                >
                  <InfoOutlined
                    fontSize="small"
                    data-cy="sep-chair-reviews-info"
                  />
                </Tooltip>
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
            value={getFullUserName(sepData.sepSecretary)}
            margin="none"
            fullWidth
            data-cy="SEPSecretary"
            required
            InputProps={{
              readOnly: true,
              endAdornment: isUserOfficer && (
                <>
                  {sepData.sepSecretary && (
                    <Tooltip title="Remove SEP Secretary">
                      <IconButton
                        aria-label="Remove SEP secretary"
                        onClick={() =>
                          removeChairOrSecretary(UserRole.SEP_SECRETARY)
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
              startAdornment: sepData.sepSecretary && (
                <Tooltip
                  title={`Number of proposals to review: ${
                    sepData.sepSecretaryProposalCount || 0
                  }`}
                  sx={{ padding: '2px', marginRight: '4px' }}
                >
                  <InfoOutlined
                    fontSize="small"
                    data-cy="sep-secretary-reviews-info"
                  />
                </Tooltip>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid data-cy="sep-reviewers-table" item xs={12}>
          <MaterialTable
            icons={tableIcons}
            title={
              <Typography variant="h6" component="h3" gutterBottom>
                Reviewers
              </Typography>
            }
            columns={columns}
            data={SEPReviewersDataWithId}
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
          />
          {hasAccessRights && (
            <ActionButtonContainer>
              <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                data-cy="add-participant-button"
                startIcon={<AddPersonIcon />}
              >
                Add reviewers
              </Button>
            </ActionButtonContainer>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default withConfirm(SEPMembers);
