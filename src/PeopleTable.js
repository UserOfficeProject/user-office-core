import React, {useContext} from 'react';
import MaterialTable from 'material-table';
import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";
import { withRouter } from 'react-router-dom'
import {AppContext } from "./App"

// TODO fix filtering in API
function sendUserRequest(searchQuery, apiCall){
    const query = `{
        users{
          firstname
          lastname
          id
        }
      }`
       
      return apiCall(query).then(data => { return {page: 0, totalCount: data.users.length, data: data.users.map((user) => {return {name: user.firstname, surname: user.lastname, username: user.id}}) }})
  }
  

function PeopleTable(props) {
   const { apiCall } = useContext(AppContext);

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


    const columns = [
          { title: 'Name', field: 'name' },
          { title: 'Surname', field: 'surname' },
          { title: 'Username', field: 'username' },
        ];
  return (

        <MaterialTable
        icons={tableIcons}
        title={props.title}
        columns={columns}
        data={query => sendUserRequest(query, apiCall)}
        options={{
            search: true
        }}
        actions={[
            {
              icon: () => props.actionIcon,
              tooltip: props.title,
              onClick: (event, rowData) => props.action(rowData)
            }
          ]}
        />
  );
}

export default withRouter(PeopleTable);
