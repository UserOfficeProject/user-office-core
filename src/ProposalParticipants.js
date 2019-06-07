import React, { useState } from 'react';
import MaterialTable from 'material-table';
import ParticipantModal from './ParticipantModal';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";

const useStyles = makeStyles({
  errorText: {
    color: "#f44336"
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px",
  },
});


export default function ProposalParticipants(props) {

    const classes = useStyles();
    const [modalOpen, setOpen] = useState(false);
    const [users, setUsers] = useState(props.data.users || []);
    const [userError, setUserError] = useState(false);

    const addUser = (user) => {
        setUsers([
        ...users,
        user
        ]);
        setOpen(false);
    };

    const removeUser = (user) => {
      let newUsers = [...users];
      newUsers.splice(newUsers.indexOf(user), 1);
      setUsers(
        newUsers
      );
  };

  const handleNext = () => {
    if(users.length < 1){
      setUserError(true);
    }else{
      props.next({users});
    }
  }

    const tableIcons = {
        Add: AddBox,
        Check: Check,
        Clear: Clear,
        Delete: DeleteOutline,
        DetailPanel: ChevronRight,
        Edit: Edit,
        Export: SaveAlt,
        Filter: FilterList,
        FirstPage: FirstPage,
        LastPage: LastPage,
        NextPage: ChevronRight,
        PreviousPage: ChevronLeft,
        ResetSearch: Clear,
        Search: Search,
        SortArrow: ArrowUpward,
        ThirdStateCheck: Remove,
        ViewColumn: ViewColumn
      };
  const columns =  [
      { title: 'Name', field: 'name' },
      { title: 'Surname', field: 'surname' },
      { title: 'Username', field: 'username' },
    ];

  return (
    <React.Fragment>
        <ParticipantModal show={modalOpen} close={setOpen.bind(this, false)} addParticipant={addUser} />
        <MaterialTable
        className={classes.table}
        icons={tableIcons}
        title="Add Co-Proposers"
        columns={columns}
        data={users}
        options={{
            search: false
        }}
        actions={[
            {
            icon: "+",
            tooltip: 'Add User',
            isFreeAction: true,
            onClick: (event) => setOpen(true)
            }
        ]}
        editable={{
            onRowDelete: oldData =>
            new Promise(resolve => {
              resolve();
              removeUser(oldData);
            })
        }}
        />
      {userError && <p className={classes.errorText}>You need to add at least one Co-Proposer</p>}
      <div className={classes.buttons}>
        <Button onClick={props.back} className={classes.button}>
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
    </React.Fragment>
  );
}