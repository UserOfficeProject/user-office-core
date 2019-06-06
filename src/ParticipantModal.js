import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";
import { request } from 'graphql-request'


function sendUserlRequest(searchQuery){
    console.log(searchQuery)
    const query = `{
        users{
          firstname
          lastname
          id
        }
      }`
       
      return request('/graphql', query).then(data => { return {page: 0, totalCount: 9, data: data.users.map((user) => {return {name: user.firstname, surname: user.lastname, username: user.id}}) }})
  }
  

function ParticipantModal(props) {


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
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={props.show}
        onClose={() => props.close()}
      >
        <DialogContent>
        <MaterialTable
        icons={tableIcons}
        title="Add Participants"
        columns={state.columns}
        data={query => sendUserlRequest(query)}
        options={{
            search: true
        }}
        actions={[
            {
              icon: Check,
              tooltip: 'Select user',
              onClick: (event, rowData) => props.addParticipant({name: rowData.name, surname: rowData.surname, username: rowData.username})
            }
          ]}
        />
        </DialogContent>
      </Dialog>
  );
}

export default ParticipantModal;
