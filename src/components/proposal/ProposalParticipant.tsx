import { makeStyles, TextField } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import React, { useEffect, useState } from 'react';

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
  const { loadBasicUserData } = useBasicUserData();

  const classes = useStyles();

  useEffect(() => {
    let unmounted = false;
    if (props.userId) {
      loadBasicUserData(props.userId).then((user) => {
        if (unmounted) {
          return;
        }
        setCurUser(user);
      });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [props.userId, loadBasicUserData]);

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
      <FormControl className={classes.container} margin="dense">
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
