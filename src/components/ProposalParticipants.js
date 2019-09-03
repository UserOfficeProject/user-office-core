import React, { useState, useContext } from "react";
import ParticipantModal from "./ParticipantModal";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import PeopleTable from "./PeopleTable";
import { Add } from "@material-ui/icons";
import { useDataAPI } from "../hooks/useDataAPI";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";

const useStyles = makeStyles({
  errorText: {
    color: "#f44336"
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
});

export default function ProposalParticipants(props) {
  const api = useContext(FormApi);
  const classes = useStyles();
  const [modalOpen, setOpen] = useState(false);
  const [users, setUsers] = useState(props.data.users || []);
  const [userError, setUserError] = useState(false);
  const updateProposal = useUpdateProposal();


  const addUser = user => {
    setUsers([...users, user]);
    setOpen(false);
  };

  const removeUser = user => {
    let newUsers = [...users];
    newUsers.splice(newUsers.indexOf(user), 1);
    setUsers(newUsers);
  };

  const handleNext = () => {
    if (users.length < 1) {
      setUserError(true);
    } else {
      const userIds = users.map(user => user.id);
      updateProposal({
        id: props.data.id,
        users: userIds
      }).then(data => api.next({ users }));
    }
  };

  const openModal = rowData => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <ParticipantModal
        show={modalOpen}
        close={setOpen.bind(this, false)}
        addParticipant={addUser}
      />
      <PeopleTable
        title="Users"
        actionIcon={<Add />}
        action={openModal}
        isFreeAction={true}
        data={users}
        search={false}
        onRemove={removeUser}
      />
      {userError && (
        <p className={classes.errorText}>
          You need to add at least one Co-Proposer
        </p>
      )}
      {api.back ? (
        <div className={classes.buttons}>
          <Button onClick={api.back} className={classes.button}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            className={classes.button}
          >
            Next
          </Button>
        </div>
      ) : null}
    </React.Fragment>
  );
}
