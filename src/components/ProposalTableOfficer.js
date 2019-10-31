import React, { useState } from "react";
import { useProposalsData } from "../hooks/useProposalsData";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { Edit } from "@material-ui/icons";

export default function ProposalTableOfficer() {
  const { loading, proposalsData } = useProposalsData("");

  const columns = [
    { title: "Sortcode", field: "shortCode" },
    { title: "Title", field: "title" },
    { title: "Status", field: "status" }
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return (
      <Redirect push to={`/ProposalReviewUserOfficer/${editProposalID}`} />
    );
  }

  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title={"Proposals"}
      columns={columns}
      data={proposalsData}
      options={{
        search: true,
        debounceInterval: 400
      }}
      actions={[
        {
          icon: () => <Edit />,
          tooltip: "View proposal",
          onClick: (event, rowData) => setEditProposalID(rowData.id)
        }
      ]}
    />
  );
}
