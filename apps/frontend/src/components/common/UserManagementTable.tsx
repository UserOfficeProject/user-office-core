import MaterialTable from '@material-table/core';
import { ScheduleSend } from '@mui/icons-material';
import GroupOffIcon from '@mui/icons-material/GroupOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SendIcon from '@mui/icons-material/Send';
import { Chip, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useContext, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import CardActionSheet, {
  CardActionSheetItem,
} from 'components/common/cards/CardActionSheet';
import CardEmptyState from 'components/common/cards/CardEmptyState';
import PersonList from 'components/common/people/PersonList';
import PersonListRow from 'components/common/people/PersonListRow';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, Invite } from 'generated/sdk';
import { useIsMobile } from 'hooks/common/useResponsive';
import { getFullUserName } from 'utils/user';

import ProposalPeopleSelectorModal from '../proposal/ProposalPeopleSelectorModal';

export type UserManagementTableProps = {
  /** Basic user details array to be shown in the table. */
  users: BasicUserDetails[];
  /** Function for setting up the users. */
  setUsers: (users: BasicUserDetails[]) => void;
  invites?: Invite[];
  setInvites?: (invites: Invite[]) => void;
  sx?: SxProps<Theme>;
  title: string;
  addButtonLabel?: string;
  addButtonTooltip?: string;
  /** Header shown at the top of the invite/selector modal */
  addModalTitle?: string;
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
  addButtonLabel = 'Add',
  addButtonTooltip = 'Add a participant',
  addModalTitle,
  disabled = false,
  onUserAction,
  excludeUserIds = [],
  allowInviteByEmail = false,
}: UserManagementTableProps) => {
  const isMobile = useIsMobile();
  const [sheetFor, setSheetFor] = useState<BasicUserDetails | null>(null);
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
    <ProposalPeopleSelectorModal
      modalOpen={modalOpen}
      title={addModalTitle}
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

  if (isMobile) {
    const sheetItems: CardActionSheetItem[] = sheetFor
      ? [
          ...(onUserAction
            ? [
                {
                  key: 'setPi',
                  label: 'Assign as PI',
                  icon: <PersonAddIcon />,
                  onClick: () => {
                    removeUser(sheetFor);
                    onUserAction('setPrincipalInvestigator', sheetFor);
                  },
                },
              ]
            : []),
          {
            key: 'remove',
            label: 'Remove',
            icon: <PersonRemoveIcon />,
            destructive: true,
            onClick: () => removeUser(sheetFor),
          },
        ]
      : [];

    return (
      <Box sx={sx} data-cy="user-management-list">
        {modalOpen && InviteComponent}
        <PersonList
          title={title}
          count={users.length + invites.length}
          onAdd={openModal}
          addButtonLabel={addButtonLabel}
          disabled={disabled}
          emptyState={
            <CardEmptyState
              icon={<GroupOffIcon fontSize="large" color="disabled" />}
              title="Nobody added yet"
              description={addButtonTooltip}
            />
          }
        >
          {users.map((user) => (
            <PersonListRow
              key={user.id}
              primary={getFullUserName(user)}
              secondary={user.institution}
              onOpenActions={() => setSheetFor(user)}
              dataCy={`person-row-${user.id}`}
            />
          ))}
          {invites.map((invite) => (
            <PersonListRow
              key={invite.email}
              primary={invite.email}
              chips={
                <Chip
                  size="small"
                  color="secondary"
                  label={invite.isEmailSent ? 'Invited' : 'Not sent yet'}
                />
              }
              onOpenActions={() => handleDeleteInvite(invite)}
              actionsLabel={`Remove invitation for ${invite.email}`}
              dataCy={`invite-row-${invite.email}`}
            />
          ))}
        </PersonList>
        <CardActionSheet
          open={sheetFor !== null}
          onClose={() => setSheetFor(null)}
          title={sheetFor ? getFullUserName(sheetFor) : ''}
          items={sheetItems}
        />
      </Box>
    );
  }

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
        <>
          <MaterialTable
            data={users}
            columns={[
              { title: 'Firstname', field: 'firstname' },
              { title: 'Lastname', field: 'lastname' },
              { title: 'Preferred name', field: 'preferredname' },
              { title: 'Institution', field: 'institution' },
            ]}
            options={{
              showTitle: false,
              paging: true,
              pageSize: 10,
            }}
            actions={[
              {
                hidden: !onUserAction,
                icon: () => (
                  <Button
                    data-cy="assign-as-pi"
                    component="a"
                    href="#"
                    variant="text"
                  >
                    Assign <br /> as PI
                  </Button>
                ),
                tooltip: 'Set Principal Investigator',
                onClick: (
                  event: React.MouseEvent<HTMLElement>,
                  rowData: BasicUserDetails | BasicUserDetails[]
                ) => {
                  event.preventDefault();

                  return new Promise<void>(() => {
                    const user = Array.isArray(rowData) ? rowData[0] : rowData;
                    removeUser(user);
                    onUserAction?.('setPrincipalInvestigator', user);
                  });
                },
              },
            ]}
            editable={{
              onRowDelete: (oldData) =>
                new Promise<void>((resolve) => {
                  removeUser(oldData);
                  resolve();
                }),
            }}
          />

          {invites.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                marginTop: 1,
                gap: 1,
                alignItems: 'flex-start',
              }}
              data-cy="invites-chips"
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'grey',
                  paddingRight: '10px',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  mt: '4px',
                }}
              >
                Invited:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
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
        </>
      </FormControl>
    </Box>
  );
};

export default UserManagementTable;
