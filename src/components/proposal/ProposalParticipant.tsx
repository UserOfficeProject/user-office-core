import EditIcon from '@mui/icons-material/Edit';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState, useEffect } from 'react';

import { BasicUserDetails, UserRole } from 'generated/sdk';
import { BasicUserData, useBasicUserData } from 'hooks/user/useUserData';

import ParticipantModal from './ParticipantModal';

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addButton: {
    padding: '5px',
    marginLeft: theme.spacing(1),
  },
}));

export default function ProposalParticipant(props: {
  userId?: number;
  userChanged: (user: BasicUserDetails) => void;
  className?: string;
}) {
  const [curUser, setCurUser] = useState<BasicUserData | null | undefined>(
    null
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { userData } = useBasicUserData(props.userId);
  useEffect(() => {
    setCurUser(userData);
  }, [userData]);

  const classes = useStyles();

  return (
    <div className={props.className}>
      <ParticipantModal
        show={isPickerOpen}
        userRole={UserRole.USER}
        title={'Set Principal Investigator'}
        close={() => {
          setIsPickerOpen(false);
        }}
        selectedUsers={!!curUser ? [curUser?.id] : []}
        addParticipants={(users: BasicUserDetails[]) => {
          setCurUser(users[0]);
          props.userChanged(users[0]);
          setIsPickerOpen(false);
        }}
        participant={true}
      />
      <FormControl className={classes.container} margin="dense" fullWidth>
        <TextField
          label="Principal Investigator"
          value={
            curUser
              ? `${curUser.firstname} ${curUser.lastname}; ${curUser.organisation}`
              : ''
          }
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: true,
          }}
          data-cy="principal-investigator"
          required
          fullWidth
        />

        <Tooltip title="Edit Principal Investigator">
          <IconButton
            onClick={() => setIsPickerOpen(true)}
            className={classes.addButton}
          >
            <EditIcon data-cy="edit-proposer-button" fontSize="small" />
          </IconButton>
        </Tooltip>
      </FormControl>
    </div>
  );
}
