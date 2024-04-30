import MaterialTable from '@material-table/core';
import Clear from '@mui/icons-material/Clear';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Person from '@mui/icons-material/Person';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { Button, Stack } from '@mui/material';
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
import { BasicUserDetails, UserRole, Fap } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useFapReviewersData } from 'hooks/fap/useFapReviewersData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type BasicUserDetailsWithRole = BasicUserDetails & { roleId: UserRole };

type FapMembersProps = {
  data: Fap;
  onFapUpdate: (fap: Fap) => void;
  confirm: WithConfirmType;
};

const columns = [
  { title: 'Name', field: 'user.firstname' },
  {
    title: 'Surname',
    field: 'user.lastname',
  },
  {
    title: 'Institution',
    field: 'user.institution',
  },
  {
    title: '# proposals currently assigned',
    field: 'proposalsCountByCall',
  },
];

const FapMembers = ({
  data: fapData,
  onFapUpdate,
  confirm,
}: FapMembersProps) => {
  const [modalOpen, setOpen] = useState(false);
  const [fapChairModalOpen, setFapChairModalOpen] = useState(false);
  const [fapSecretaryModalOpen, setFapSecretaryModalOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { setRenewTokenValue } = useRenewToken();
  const { loadingMembers, FapReviewersData, setFapReviewersData } =
    useFapReviewersData(
      fapData.id,
      modalOpen || fapChairModalOpen || fapSecretaryModalOpen
    );
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const sendFapChairUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [fapChair] = value;

    await api({
      toastSuccessMessage: 'Fap chair assigned successfully!',
    }).assignChairOrSecretary({
      assignChairOrSecretaryToFapInput: {
        fapId: fapData.id,
        roleId: UserRole.FAP_CHAIR,
        userId: fapChair.id,
      },
    });

    setOpen(false);

    setFapChairModalOpen(false);
    onFapUpdate({
      ...fapData,
      fapChairs: fapData.fapChairs?.concat([fapChair]) ?? fapData.fapChairs,
      fapChairsProposalCounts: fapData.fapChairsProposalCounts.concat([
        {
          userId: fapChair.id,
          count: 0,
        },
      ]),
    });

    if (
      fapChair.id === user.id ||
      fapData.fapChairs?.find((chair) => chair.id === user.id)
    ) {
      setRenewTokenValue();
    }
  };

  const sendFapSecretaryUpdate = async (
    value: BasicUserDetails[]
  ): Promise<void> => {
    const [fapSecretary] = value;

    await api({
      toastSuccessMessage: 'Fap secretary assigned successfully!',
    }).assignChairOrSecretary({
      assignChairOrSecretaryToFapInput: {
        fapId: fapData.id,
        roleId: UserRole.FAP_SECRETARY,
        userId: fapSecretary.id,
      },
    });

    setOpen(false);

    setFapSecretaryModalOpen(false);
    onFapUpdate({
      ...fapData,
      fapSecretaries:
        fapData.fapSecretaries?.concat([fapSecretary]) ??
        fapData.fapSecretaries,
      fapSecretariesProposalCounts: fapData.fapSecretariesProposalCounts.concat(
        [
          {
            userId: fapSecretary.id,
            count: 0,
          },
        ]
      ),
    });

    if (
      fapSecretary.id === user.id ||
      fapData.fapSecretaries?.find((sec) => sec.id === user.id)
    ) {
      setRenewTokenValue();
    }
  };

  const addMember = async (users: BasicUserDetails[]): Promise<void> => {
    await api({
      toastSuccessMessage: 'Fap member assigned successfully!',
    }).assignReviewersToFap({
      memberIds: users.map((user) => user.id),
      fapId: fapData.id,
    });

    setOpen(false);

    setFapReviewersData((fapReviewers) => [
      ...fapReviewers,
      ...users.map((user) => ({ userId: user.id, fapId: fapData.id, user })),
    ]);
  };

  const removeMember = async (
    user: BasicUserDetailsWithRole
  ): Promise<void> => {
    await api({
      toastSuccessMessage: 'Fap member removed successfully!',
    }).removeMemberFromFap({
      memberId: user.id,
      fapId: fapData.id,
      roleId: user.roleId,
    });

    switch (user.roleId) {
      case UserRole.FAP_REVIEWER:
        setFapReviewersData((fapReviewers) =>
          fapReviewers.filter(({ userId }) => userId !== user.id)
        );
        break;
      case UserRole.FAP_SECRETARY:
        onFapUpdate({
          ...fapData,
          fapSecretaries: fapData.fapSecretaries.filter(
            (sec) => sec.id !== user.id
          ),
        });
        break;
      case UserRole.FAP_CHAIR:
        onFapUpdate({
          ...fapData,
          fapChairs: fapData.fapChairs.filter((chair) => chair.id !== user.id),
        });
    }
  };

  const removeChairOrSecretary = (
    memberToRemove: BasicUserDetails,
    roleId: UserRole
  ) => {
    confirm(
      () => {
        removeMember({
          ...memberToRemove,
          roleId: roleId,
        });
      },
      {
        title: 'Remove Fap member',
        description: `Are you sure you want to remove ${getFullUserName(
          memberToRemove
        )} from this Fap?`,
      }
    )();
  };

  if (loadingMembers) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
  }

  const AddPersonIcon = (): JSX.Element => <PersonAdd data-cy="add-member" />;

  const alreadySelectedMembers = FapReviewersData.map(({ userId }) => userId)
    .concat(fapData.fapSecretaries.map((sec) => sec.id))
    .concat(fapData.fapChairs.map((chair) => chair.id));

  const FapReviewersDataWithId = FapReviewersData.map((fapReviewer) =>
    Object.assign(fapReviewer, { id: fapReviewer.userId })
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
        invitationUserRole={UserRole.FAP_REVIEWER}
        userRole={UserRole.FAP_REVIEWER}
      />
      <ParticipantModal
        show={fapChairModalOpen}
        close={(): void => setFapChairModalOpen(false)}
        addParticipants={sendFapChairUpdate}
        selectedUsers={alreadySelectedMembers}
        title="Fap Chair"
        invitationUserRole={UserRole.FAP_CHAIR}
        userRole={UserRole.FAP_REVIEWER}
      />
      <ParticipantModal
        show={fapSecretaryModalOpen}
        close={(): void => setFapSecretaryModalOpen(false)}
        addParticipants={sendFapSecretaryUpdate}
        selectedUsers={alreadySelectedMembers}
        title="Fap Secretary"
        invitationUserRole={UserRole.FAP_SECRETARY}
        userRole={UserRole.FAP_REVIEWER}
      />
      <Typography variant="h6" component="h2" gutterBottom>
        {`${fapData.code} - Fap Members`}
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item sm={6} xs={12}>
          {fapData.fapChairs.map((chair, index) => (
            <TextField
              key={chair.id}
              name="FapChair"
              id={'FapChair-' + chair.id}
              label="Fap Chair"
              type="text"
              value={getFullUserName(chair)}
              margin="normal"
              fullWidth
              data-cy="FapChair"
              required
              InputProps={{
                readOnly: true,
                endAdornment: isUserOfficer && (
                  <>
                    {
                      <Tooltip title="Remove Fap Chair">
                        <IconButton
                          aria-label="Remove Fap chair"
                          onClick={() =>
                            removeChairOrSecretary(chair, UserRole.FAP_CHAIR)
                          }
                        >
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    }
                    <Tooltip title="Set Fap Chair">
                      <IconButton
                        edge="start"
                        onClick={() => setFapChairModalOpen(true)}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                  </>
                ),
                startAdornment: fapData.fapChairs && (
                  <Tooltip
                    title={`Number of proposals to review: ${
                      fapData.fapChairsProposalCounts[index].count || 0
                    }`}
                    sx={{ padding: '2px', marginRight: '4px' }}
                  >
                    <InfoOutlined
                      fontSize="small"
                      data-cy="fap-chair-reviews-info"
                    />
                  </Tooltip>
                ),
              }}
            />
          ))}
        </Grid>
        <Grid item sm={6} xs={12}>
          {fapData.fapSecretaries.map((sec, index) => (
            <TextField
              key={sec.id}
              name="FapSecretary"
              id={'FapSecretary-' + sec.id}
              label="Fap Secretary"
              type="text"
              value={getFullUserName(sec)}
              margin="normal"
              fullWidth
              data-cy="FapSecretary"
              required
              InputProps={{
                readOnly: true,
                endAdornment: isUserOfficer && (
                  <>
                    <Tooltip title="Remove Fap Secretary">
                      <IconButton
                        aria-label="Remove Fap secretary"
                        onClick={() =>
                          removeChairOrSecretary(sec, UserRole.FAP_SECRETARY)
                        }
                      >
                        <Clear />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Set Fap Secretary">
                      <IconButton
                        edge="start"
                        onClick={() => setFapSecretaryModalOpen(true)}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                  </>
                ),
                startAdornment: fapData.fapSecretaries && (
                  <Tooltip
                    title={`Number of proposals to review: ${
                      fapData.fapSecretariesProposalCounts[index].count || 0
                    }`}
                    sx={{ padding: '2px', marginRight: '4px' }}
                  >
                    <InfoOutlined
                      fontSize="small"
                      data-cy="fap-secretary-reviews-info"
                    />
                  </Tooltip>
                ),
              }}
            />
          ))}
        </Grid>
      </Grid>
      {isUserOfficer && (
        <Stack direction="row" display="flex" justifyContent="space-between">
          <Button
            onClick={() => setFapChairModalOpen(true)}
            aria-label="Add New FAP Chair Button"
            data-cy="add-chair-button"
          >
            Add Chair
          </Button>
          <Button
            onClick={() => setFapSecretaryModalOpen(true)}
            aria-label="Add New FAP Secretary Button"
            data-cy="add-secretary-button"
          >
            Add Secretary
          </Button>
        </Stack>
      )}
      <Grid container spacing={3}>
        <Grid data-cy="fap-reviewers-table" item xs={12}>
          <MaterialTable
            icons={tableIcons}
            title={
              <Typography variant="h6" component="h3">
                Reviewers
              </Typography>
            }
            columns={columns}
            data={FapReviewersDataWithId}
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
                        roleId: UserRole.FAP_REVIEWER,
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

export default withConfirm(FapMembers);
