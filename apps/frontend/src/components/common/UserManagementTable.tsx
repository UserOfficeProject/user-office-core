import { ScheduleSend } from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import { Chip, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useContext, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import PeopleTable from 'components/user/PeopleTable';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, Invite, UserRole } from 'generated/sdk';

import ParticipantSelector from '../proposal/ParticipantSelector';

export type UserManagementTableProps = {
  /** Basic user details array to be shown in the table. */
  users: BasicUserDetails[];
  /** Function for setting up the users. */
  setUsers: (users: BasicUserDetails[]) => void;
  invites?: Invite[];
  setInvites?: (invites: Invite[]) => void;
  sx?: SxProps<Theme>;
  title: string;
  preserveSelf?: boolean;
  addButtonLabel?: string;
  addButtonTooltip?: string;
  /** Disable the add button */
  disabled?: boolean;
  /** Custom actions to be passed to PeopleTable */
  onUserAction?: (action: string, user: BasicUserDetails) => void;
  /** Additional excluded user IDs for invite flow */
  excludeUserIds?: number[];
  allowInviteByEmail?: boolean;
};

const UserManagementTable = ({
  users,
  setUsers,
  invites = [],
  setInvites,
  sx,
  title,
  preserveSelf,
  addButtonLabel = 'Add',
  addButtonTooltip = 'Add a participant',
  disabled = false,
  onUserAction,
  excludeUserIds = [],
  allowInviteByEmail = false,
}: UserManagementTableProps) => {
  const [modalOpen, setOpen] = useState(false);
  const currentUser = useContext(UserContext)?.user;

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
    setInvites?.([...invites, ...props.invites]);
    setOpen(false);
  };

  const handleDeleteInvite = (invite: Invite) => {
    setInvites?.(invites.filter((i) => i.email !== invite.email));
  };

  const InviteComponent = (
    <ParticipantSelector
      modalOpen={modalOpen}
      title="Add co-proposers"
      onClose={() => setOpen(false)}
      onAddParticipants={handleAddParticipants}
      excludeUserIds={[...users.map((user) => user.id), ...excludeUserIds]}
      excludeEmails={[
        ...(invites?.map((invite) => invite.email) || []),
        ...(currentUser.email ? [currentUser.email.toLowerCase()] : []),
      ]}
      allowInviteByEmail={allowInviteByEmail}
    />
  );

  return (
    <Box sx={sx}>
      {modalOpen && InviteComponent}
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
            setPrincipalInvestigator={
              onUserAction
                ? (user) => onUserAction('setPrincipalInvestigator', user)
                : undefined
            }
          />

          {invites.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 1,
                gap: 1,
                alignItems: 'center',
              }}
              data-cy="invites-chips"
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
                  icon={invite.isEmailSent ? <SendIcon /> : <ScheduleSend />}
                  size="small"
                  label={invite.email}
                  key={invite.email}
                  onDelete={() => handleDeleteInvite(invite)}
                />
              ))}
            </Box>
          )}
          <ActionButtonContainer
            sx={(theme) => ({
              marginTop: theme.spacing(1),
            })}
          >
            <Tooltip title={addButtonTooltip}>
              <Button
                variant="outlined"
                onClick={openModal}
                data-cy="add-participant-button"
                size="small"
                startIcon={<PersonAddIcon />}
                disabled={disabled}
              >
                {addButtonLabel}
              </Button>
            </Tooltip>
          </ActionButtonContainer>
        </div>
      </FormControl>
    </Box>
  );
};

export default UserManagementTable;
