import React, { useState } from "react";
import ParticipantModal from "./ParticipantModal";
import { makeStyles } from "@material-ui/styles";
import PeopleTable from "../user/PeopleTable";
import { People } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  errorText: {
    color: theme.palette.error.main
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
}));

export default function ProposalParticipants(props) {
  const classes = useStyles();
  const [modalOpen, setOpen] = useState(false);

  const addUser = user => {
    props.setUsers([...props.users, user]);
    setOpen(false);
  };

  const removeUser = user => {
    let newUsers = [...props.users];
    newUsers.splice(newUsers.indexOf(user), 1);
    props.setUsers(newUsers);
  };

  const openModal = rowData => {
    setOpen(true);
  };
  return (
    <form>
      <ParticipantModal
        show={modalOpen}
        close={setOpen.bind(this, false)}
        addParticipant={addUser}
        selectedUsers={props.users}
        title={"Add Co-Proposer"}
        userRole={"USER"}
      />
      <PeopleTable
        title="Co-Proposers"
        actionIcon={<People data-cy="co-proposers-button" />}
        actionText={"Add Co-Proposers"}
        action={openModal}
        isFreeAction={true}
        data={props.users}
        search={false}
        onRemove={removeUser}
      />
      {props.error && (
        <p className={classes.errorText}>
          You must be part of the proposal. Either add yourself as Principal
          Investigator or a Co-Proposer!
        </p>
      )}
    </form>
  );
}
