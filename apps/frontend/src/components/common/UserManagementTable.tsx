import MaterialTable, {
  Action,
  Column,
  MaterialTableProps,
} from '@material-table/core';
import { ScheduleSend } from '@mui/icons-material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import { Chip, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useContext, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, Invite } from 'generated/sdk';
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
  readonly?: boolean;
  addButtonLabel?: string;
  addButtonTooltip?: string;
  addButtonPosition?: 'top' | 'bottom';
  mtOptions?: MaterialTableProps<BasicUserDetails>['options'];
  compact?: boolean;
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
  readonly,
  invites = [],
  setInvites,
  sx,
  title,
  addButtonLabel = 'Add',
  addButtonTooltip = 'Add a participant',
  addButtonPosition = 'bottom',
  mtOptions,
  compact = false,
  addModalTitle,
  disabled = false,
  onUserAction,
  excludeUserIds = [],
  allowInviteByEmail = false,
}: UserManagementTableProps) => {
  const theme = useTheme();
  const [modalOpen, setOpen] = useState(false);
  const currentUser = useContext(UserContext)?.user;

  const openModal = () => {
    setOpen(true);
  };

  const removeUser = (user: BasicUserDetails) => {
    const newUsers = users.filter((u) => u.id !== user.id);
    setUsers(newUsers);
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

  // material-table decides whether to render the actions column from the
  // registered actions, not from their `hidden` flag, so in readonly mode we
  // register none at all to drop the column altogether
  const rowActions: Action<BasicUserDetails>[] = !!readonly
    ? []
    : [
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
        ...(compact
          ? [
              {
                icon: () => <DeleteOutlineIcon fontSize="small" />,
                tooltip: 'Remove',
                onClick: (
                  _event: React.MouseEvent<HTMLElement>,
                  rowData: BasicUserDetails | BasicUserDetails[]
                ) => removeUser(Array.isArray(rowData) ? rowData[0] : rowData),
              },
            ]
          : []),
      ];

  const editable: MaterialTableProps<BasicUserDetails>['editable'] =
    !!readonly || compact
      ? {}
      : {
          onRowDelete: (oldData) =>
            new Promise<void>((resolve) => {
              removeUser(oldData);
              resolve();
            }),
        };

  const columns: Column<BasicUserDetails>[] = compact
    ? [
        { title: 'Name', render: (user) => getFullUserName(user) },
        { title: 'Institution', field: 'institution' },
      ]
    : [
        { title: 'Firstname', field: 'firstname' },
        { title: 'Lastname', field: 'lastname' },
        { title: 'Preferred name', field: 'preferredname' },
        { title: 'Institution', field: 'institution' },
      ];

  const tableOptions: MaterialTableProps<BasicUserDetails>['options'] = compact
    ? {
        showTitle: false,
        search: false,
        toolbar: false,
        paging: false,
        padding: 'dense',
        maxBodyHeight: '40vh',
        actionsColumnIndex: -1,
        headerStyle: {
          fontWeight: theme.typography.fontWeightMedium,
          backgroundColor: theme.palette.grey[50],
          whiteSpace: 'nowrap',
        },
      }
    : {
        showTitle: false,
        paging: true,
        pageSize: 10,
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

  const invitesChips = invites.length > 0 && (
    <Box
      sx={{
        display: 'flex',
        marginTop: compact ? 0 : 1,
        gap: 1,
        alignItems: 'flex-start',
        flex: compact ? 1 : undefined,
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
  );

  const addButtonAtTop = addButtonPosition === 'top';
  const addButton = (
    <Tooltip title={addButtonTooltip}>
      <Button
        variant="outlined"
        onClick={openModal}
        data-cy="add-participant-button"
        size={addButtonAtTop ? 'medium' : 'small'}
        startIcon={<PersonAddIcon />}
        disabled={disabled || !!readonly}
        sx={
          compact && !addButtonAtTop ? { flexShrink: 0, ml: 'auto' } : undefined
        }
      >
        {addButtonLabel}
      </Button>
    </Tooltip>
  );

  return (
    <Box sx={sx}>
      {modalOpen && InviteComponent}
      <FormControl margin="dense" fullWidth>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: compact || addButtonAtTop ? 1 : 0,
          }}
        >
          {compact ? (
            <Typography variant="subtitle2">
              {title} ({users.length})
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '12px', color: 'grey' }}>
              {title}
            </Typography>
          )}
          {addButtonAtTop && addButton}
        </Box>
        <MaterialTable
          data={users}
          columns={columns}
          options={{ ...tableOptions, ...mtOptions }}
          actions={rowActions}
          editable={editable}
          localization={
            compact
              ? {
                  header: { actions: '' },
                  body: {
                    emptyDataSourceMessage: `No ${title.toLowerCase()} added yet`,
                  },
                }
              : undefined
          }
          style={
            compact
              ? {
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  overflow: 'hidden',
                }
              : undefined
          }
        />
        {compact ? (
          (invitesChips || !addButtonAtTop) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mt: 1.5,
              }}
            >
              {invitesChips}
              {!addButtonAtTop && addButton}
            </Box>
          )
        ) : (
          <>
            {invitesChips}
            {!addButtonAtTop && (
              <ActionButtonContainer
                sx={(theme) => ({
                  marginTop: theme.spacing(1),
                })}
              >
                {addButton}
              </ActionButtonContainer>
            )}
          </>
        )}
      </FormControl>
    </Box>
  );
};

export default UserManagementTable;
