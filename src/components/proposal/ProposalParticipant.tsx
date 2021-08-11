import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import React, { useEffect, useState } from 'react';

import { BasicUserDetails, UserRole } from 'generated/sdk';
import { BasicUserData, useBasicUserData } from 'hooks/user/useUserData';

import ParticipantModal from './ParticipantModal';

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
      <FormControl margin="dense" fullWidth>
        <FormLabel component="div">
          Principal Investigator
          <Tooltip title="Edit Principal Investigator">
            <IconButton onClick={() => setIsPickerOpen(true)}>
              <EditIcon data-cy="edit-proposer-button" />
            </IconButton>
          </Tooltip>
        </FormLabel>
        <div>
          {curUser &&
            `${curUser.firstname} ${curUser.lastname}; ${curUser.organisation}`}
        </div>
      </FormControl>
    </div>
  );
}
