import { IconButton, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import React, { useState, useEffect } from 'react';

import { UserRole, BasicUserDetails } from 'generated/sdk';
import { useBasicUserData, BasicUserData } from 'hooks/user/useUserData';

import ParticipantModal from './ParticipantModal';

export default function ProposalParticipant(props: {
  userId?: number;
  userChanged: (user: BasicUserDetails) => void;
  title?: string;
  className?: string;
}) {
  const [curUser, setCurUser] = useState<BasicUserData | null | undefined>(
    null
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { loadBasicUserData } = useBasicUserData();

  useEffect(() => {
    if (props.userId) {
      loadBasicUserData(props.userId).then(user => {
        setCurUser(user);
      });
    }
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
        addParticipants={(users: BasicUserDetails[]) => {
          setCurUser(users[0]);
          props.userChanged(users[0]);
          setIsPickerOpen(false);
        }}
      />
      <Typography variant="h6" component="h6">
        {props.title}
      </Typography>
      <div>
        {curUser
          ? `${curUser.firstname} ${curUser.lastname}; ${curUser.organisation}`
          : ''}
        <IconButton edge="end" onClick={() => setIsPickerOpen(true)}>
          <EditIcon />
        </IconButton>
      </div>
    </div>
  );
}
