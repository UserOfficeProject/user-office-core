import React, { useState } from 'react';
import MaterialTable from 'material-table';
import ParticipantModal from './ParticipantModal';


import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";

export default function ProposalParticipants(props) {

    const [modalOpen, setOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const addUser = (user) => {
        setUsers([
        ...users,
        user
        ]);
        props.onChange("user", users);
        setOpen(false);
    };


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
  const [state, setState] = React.useState({
    columns: [
      { title: 'Name', field: 'name' },
      { title: 'Surname', field: 'surname' },
      { title: 'Username', field: 'username' },
    ]
  });

  return (
    <React.Fragment>
        <ParticipantModal show={modalOpen} close={setOpen.bind(false)} addParticipant={addUser} />
        <MaterialTable
        icons={tableIcons}
        title="Add Participants"
        columns={state.columns}
        data={users}
        options={{
            search: false
        }}
        actions={[
            {
            icon: AddBox,
            tooltip: 'Add User',
            isFreeAction: true,
            onClick: (event) => setOpen(true)
            }
        ]}
        editable={{
            onRowDelete: oldData =>
            new Promise(resolve => {
                setTimeout(() => {
                resolve();
                const data = [...users];
                data.splice(data.indexOf(oldData), 1);
                setUsers({ ...state, data });
                }, 600);
            })
        }}
        />
    </React.Fragment>
  );
}