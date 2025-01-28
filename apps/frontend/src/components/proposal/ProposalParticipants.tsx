import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import { Chip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Invite, UserRole } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';

import InviteUser from './InviteUser';

type ParticipantsProps = {
  /** Basic user details array to be shown in the modal. */
  users: BasicUserDetails[];
  /** Function for setting up the users. */
  setUsers: (users: BasicUserDetails[]) => void;
  invites: Invite[];
  setInvites: (invites: Invite[]) => void;
  principalInvestigator?: BasicUserData | null;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
  sx?: SxProps<Theme>;
  title: string;
  preserveSelf?: boolean;
  loadingPrincipalInvestigator?: boolean;
};

const Participants = ({
  users,
  setUsers,
  invites,
  setInvites,
  principalInvestigator,
  setPrincipalInvestigator,
  sx,
  title,
  preserveSelf,
  loadingPrincipalInvestigator,
}: ParticipantsProps) => {
  const [modalOpen, setOpen] = useState(false);

  const removeUser = (user: BasicUserDetails) => {
    const newUsers = users.filter((u) => u.id !== user.id);
    setUsers(newUsers);
  };

  const openModal = () => {
    setOpen(true);
  };

  const handleAddParticipants = (props: {
    users: BasicUserDetails[];
    invites: Invite[];
  }) => {
    setUsers([...users, ...props.users]);
    setInvites([...invites, ...props.invites]);
    setOpen(false);
  };

  const handleDeleteInvite = (invite: Invite) => {
    setInvites(invites.filter((i) => i.email !== invite.email));
  };

  return (
    <Box sx={sx}>

      {modalOpen && (
        <InviteUser
          modalOpen={modalOpen}
          onClose={() => setOpen(false)}
          onAddParticipants={handleAddParticipants}
          excludeUserIds={
            !!principalInvestigator // add principal investigator if one exists
              ? users.map((user) => user.id).concat([principalInvestigator.id])
              : users.map((user) => user.id)
          }
          excludeEmails={invites.map((invite) => invite.email)}
        />
      )}
      <FormControl margin="dense" fullWidth>
        <Typography
          sx={{
            fontSize: '12px',
            color: 'grey',
          }}
        >
          {title}
        </Typography>
        <div>
          <PeopleTable
            selection={false}
            mtOptions={{
              showTitle: false,
              toolbar: false,
              paging: false,
              headerStyle: {
                padding: '4px 10px',
              },
            }}
            isFreeAction={true}
            data={users}
            search={false}
            userRole={UserRole.USER}
            invitationUserRole={UserRole.USER}
            onRemove={removeUser}
            preserveSelf={preserveSelf}
            setPrincipalInvestigator={setPrincipalInvestigator}
          />

          {invites.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 1,
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'grey',
                  paddingRight: '10px',
                  display: 'inline-block',
                }}
              >
                Invited:
              </Typography>
              {invites.map((invite) => (
                <Chip
                  sx={{ gap: '2px', padding: '6px' }}
                  color="secondary"
                  icon={<SendIcon />}
                  size="small"
                  label={invite.email}
                  key={invite.email}
                  onDelete={() => handleDeleteInvite(invite)}
                />
              ))}
            </Box>
          ) : null}
          <ActionButtonContainer
            sx={(theme) => ({
              marginTop: theme.spacing(1),
            })}
          >
            <Button
              variant="outlined"
              onClick={openModal}
              data-cy="add-participant-button"
              size="small"
              startIcon={<PersonAddIcon />}
              disabled={loadingPrincipalInvestigator}
            >
              Add
            </Button>
          </ActionButtonContainer>
        </div>
      </FormControl>
    </Box>
  );
};

export default Participants;
