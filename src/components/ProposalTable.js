import React, { useState } from "react";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { Edit } from "@material-ui/icons";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useDownloadPDFProposal } from "../hooks/useDownloadPDFProposal";

export default function ProposalTable(props) {
  const downloadPDFProposal = useDownloadPDFProposal();
  const columns = [
    { title: "ID", field: "id" },
    { title: "Title", field: "title" },
    { title: "Status", field: "status" }
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  if (editProposalID) {
    return <Redirect push to={`/ProposalSubmission/${editProposalID}`} />;
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title={props.title}
      columns={columns}
      data={query => props.searchQuery(query)}
      options={{
        search: props.search,
        debounceInterval: 400
      }}
      actions={[
        {
          icon: () => <Edit />,
          tooltip: "Edit proposal",
          onClick: (event, rowData) => setEditProposalID(rowData.id)
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: "Download proposal",
          onClick: (event, rowData) => downloadPDFProposal(rowData.id)
        }
      ]}
    />
  );
}
