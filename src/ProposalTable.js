import React, { useState, useContext } from "react";
import { AppContext } from "./App";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import {
  AddBox,
  Check,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  ViewColumn,
  ArrowUpward,
  Search,
  FirstPage,
  LastPage,
  ChevronRight,
  ChevronLeft,
  Remove,
  SaveAlt
} from "@material-ui/icons";

function sendUserProposalRequest(searchQuery, userID, apiCall) {
  const query = `
  query($id: ID!) {
    user(id: $id){
      proposals {
        id
        abstract
        status
      }
    }
  }`;

  const variables = {
    id: userID
  };
  return apiCall(query, variables).then(data => {
    return {
      page: 0,
      totalCount: data.user.proposals.length,
      data: data.user.proposals.map(proposal => {
        return {
          id: proposal.id,
          abstract: proposal.abstract,
          status: proposal.status
        };
      })
    };
  });
}

function sendAllProposalRequest(searchQuery, apiCall) {
  const query = `
  query($filter: String!) {
    proposals(filter: $filter) {
        id
        abstract
        status
        }
    }`;

  const variables = {
    filter: searchQuery.search
  };
  return apiCall(query, variables).then(data => {
    return {
      page: 0,
      totalCount: data.proposals.length,
      data: data.proposals.map(proposal => {
        return {
          id: proposal.id,
          abstract: proposal.abstract,
          status: proposal.status
        };
      })
    };
  });
}

export default function ProposalTable(props) {
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
    { title: "ID", field: "id" },
    { title: "Abstract", field: "abstract" },
    { title: "Status", field: "status" }
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalSubmission/${editProposalID}`} />;
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title="Your Proposals"
      columns={columns}
      data={
        props.id
          ? query => sendUserProposalRequest(query, props.id, apiCall)
          : query => sendAllProposalRequest(query, apiCall)
      }
      options={{
        search: true,
        debounceInterval: 400
      }}
      actions={[
        {
          icon: () => <Edit />,
          tooltip: "Edit proposal",
          onClick: (event, rowData) => setEditProposalID(rowData.id)
        }
      ]}
    />
  );
}
