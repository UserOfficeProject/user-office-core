import React, { useState } from "react";
import { useProposalsData } from "../../hooks/useProposalsData";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import { tableIcons } from "../../utils/materialIcons";
import { Visibility, Delete } from "@material-ui/icons";
import { useDataApi } from "../../hooks/useDataApi";
import { useDownloadPDFProposal } from "../../hooks/useDownloadPDFProposal";
import GetAppIcon from "@material-ui/icons/GetApp";
import DialogConfirmation from "../common/DialogConfirmation"

export default function ProposalTableOfficer() {
  const { loading, proposalsData, setProposalsData } = useProposalsData("");
  const [open, setOpen] = React.useState(false);
  const [selectedProposals, setSelectedProposals] = React.useState([]);
  const downloadPDFProposal = useDownloadPDFProposal();
  const api = useDataApi();
  const columns = [
    { title: "Proposal ID", field: "shortCode" },
    { title: "Title", field: "title" },
    { title: "Time(Days)", field: "technicalReview.timeAllocation" },
    { title: "Technical status", field: "technicalReview.status" },
    { title: "Status", field: "status" }
  ];

  const [editProposalID, setEditProposalID] = useState(0);

  const deleteProposals = () => {
    selectedProposals.forEach(id => {
            new Promise(async resolve => {
              await api().deleteProposal({ id });
              proposalsData.splice(proposalsData.findIndex(val => val.id === id), 1);
              setProposalsData([...proposalsData]);
              resolve();
             })

            })
  }


  if (editProposalID) {
    return (
      <Redirect push to={`/ProposalReviewUserOfficer/${editProposalID}`} />
    );
  }

  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <>
    <DialogConfirmation title="Delete proposals" text="This action will delete proposals and all data associated with them" open={open} action={deleteProposals} handleOpen={setOpen} /> 
    <MaterialTable
      icons={tableIcons}
      title={"Proposals"}
      columns={columns}
      data={proposalsData}
      options={{
        search: true,
        selection: true,
        debounceInterval: 400
      }}
      actions={[
        {
          icon: () => <Visibility />,
          tooltip: "View proposal",
          // @ts-ignore
          onClick: (event, rowData) => setEditProposalID(rowData.id),
          position: "row"
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: "Download proposals",
          onClick: (event, rowData) => {
            downloadPDFProposal(
              // @ts-ignore
              rowData.id
            );
          },
          position: "row"
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: "Download proposals",
          onClick: (event, rowData) => {
            downloadPDFProposal(
              // @ts-ignore
              rowData.map(row => row.id).join(",")
            );
          },
          position: "toolbarOnSelect"
        },
        {
          icon: () => <Delete />,
          tooltip: "Delete proposals",
          onClick: (event, rowData) => {
            setOpen(true);
            // @ts-ignore
            setSelectedProposals(rowData.map(row => row.id))

          },
          position: "toolbarOnSelect"
        }
      ]}
    />
    </>
  );
}
