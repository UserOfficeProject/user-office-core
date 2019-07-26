import React, { useState } from "react";
import { useDataAPI } from "../hooks/useDataAPI";
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

export default function ProposalTable(props) {
  const sendRequest = useDataAPI();

  const sendAllProposalRequest = searchQuery => {
    const query = `
    query($filter: String!, $first: Int!, $offset: Int!) {
      proposals(filter: $filter, first: $first, offset: $offset) {
        proposals{
          id
          abstract
          status
          }
        totalCount
        }
      }`;

    const variables = {
      filter: searchQuery.search,
      offset: searchQuery.pageSize * searchQuery.page,
      first: searchQuery.pageSize
    };
    return sendRequest(query, variables).then(data => {
      return {
        page: searchQuery.page,
        totalCount: data.proposals.totalCount,
        data: data.proposals.proposals.map(proposal => {
          return {
            id: proposal.id,
            abstract: proposal.abstract,
            status: proposal.status
          };
        })
      };
    });
  };

  const sendUserProposalRequest = (searchQuery, userID) => {
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
    return sendRequest(query, variables).then(data => {
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
          ? query => sendUserProposalRequest(query, props.id)
          : query => sendAllProposalRequest(query)
      }
      options={{
        search: props.search,
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
