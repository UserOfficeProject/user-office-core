import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./App";

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
import { Redirect } from "react-router";

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

  const [proposals, setProposals] = useState([]);
  const [editProposalID, setEditProposalID] = useState(0);

  const getProposals = () => {
    const query = `{
        proposals {
            id
            abstract
            status
            }
        }`;
    return apiCall(query).then(data => setProposals(data.proposals));
  };

  useEffect(() => {
    getProposals();
  }, []);

  if (editProposalID) {
    return <Redirect push to={`/ProposalSubmission/${editProposalID}`} />;
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title="Your Proposals"
      columns={columns}
      data={proposals}
      options={{
        search: false
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
