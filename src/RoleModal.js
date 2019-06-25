import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";
import { request } from 'graphql-request'

function sendRoleRequest(){
    const query = `{
        roles{
          id
          shortCode
          title
        }
      }`
       
      return request('/graphql', query).then(data => { return {page: 0, totalCount: data.roles.length, data: data.roles.map((role) => {return {title: role.title, id: role.id}}) }})
  }
  

function RoleModal(props) {


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
          { title: 'Title', field: 'title' },
          { title: 'ID', field: 'id' }
        ];

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
        title="Add Role"
        columns={columns}
        data={query => sendRoleRequest()}
        options={{
            search: true
        }}
        actions={[
            {
              icon: () => <AddBox/>,
              tooltip: 'Select role',
              onClick: (event, rowData) => props.add({id: rowData.id, title: rowData.title})
            }
          ]}
        />
        </DialogContent>
      </Dialog>
  );
}

export default RoleModal;
