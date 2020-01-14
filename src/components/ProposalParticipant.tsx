import React, { useState, useEffect } from "react";
import { User } from "../models/User";
import { IconButton, Typography } from "@material-ui/core";
import ParticipantModal from "./ParticipantModal";
import EditIcon from "@material-ui/icons/Edit";
import { useBasicUserData, IBasicUserData } from "../hooks/useUserData";

export default function ProposalParticipant(props: {
  userId?: number;
  userChanged: (user: User) => void;
  title?: string;
  className?: string;
}) {
  const [curUser, setCurUser] = useState<IBasicUserData | null>(null);
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
        title={"Add Co-Proposer"}
        close={() => {
          setIsPickerOpen(false);
        }}
        addParticipant={(user: User) => {
          setCurUser(user);
          props.userChanged(user);
          setIsPickerOpen(false);
        }}
      />
      <Typography variant="h6" component="h6">
        {props.title}
      </Typography>
      <div>
        {curUser
          ? `${curUser.firstname} ${curUser.lastname}; ${curUser.organisation}`
          : ""}
        <IconButton edge="end" onClick={() => setIsPickerOpen(true)}>
          <EditIcon />
        </IconButton>
      </div>
    </div>
  );
}
