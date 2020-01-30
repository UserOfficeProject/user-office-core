import React, { useState, useContext } from "react";
import { useUserWithReviewsData } from "../hooks/useUserData";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { Edit, Visibility } from "@material-ui/icons";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { UserContext } from "../context/UserContextProvider";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useDownloadPDFProposal } from "../hooks/useDownloadPDFProposal";
import { StyledPaper } from "../styles/StyledComponents";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  fixedHeight: {
    height: 240
  }
}));

export default function ProposalTableReviewer() {
  const { user } = useContext(UserContext);
  const { loading, userData } = useUserWithReviewsData(user.id);
  const downloadPDFProposal = useDownloadPDFProposal();
  const classes = useStyles();

  const columns = [
    { title: "Proposal ID", field: "shortCode" },
    { title: "Title", field: "title" },
    { title: "Grade", field: "grade" },
    { title: "Status", field: "status" }
  ];

  const [editReviewID, setEditReviewID] = useState(0);

  if (editReviewID) {
    return <Redirect push to={`/ProposalGrade/${editReviewID}`} />;
  }

  if (loading) {
    return <p>Loading</p>;
  }
  const reviewData = userData.reviews.map(review => {
    return {
      shortCode: review.proposal.shortCode,
      proposalId: review.proposal.id,
      title: review.proposal.title,
      grade: review.grade,
      reviewId: review.id,
      comment: review.comment,
      status: review.status
    };
  });
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <MaterialTable
              icons={tableIcons}
              title={"Proposals to review"}
              columns={columns}
              data={reviewData}
              options={{
                search: false,
                selection: true
              }}
              localization={{
                toolbar: {
                  nRowsSelected: "{0} proposal(s) selected"
                }
              }}
              actions={[
                {
                  position: "row",
                  action: rowData => {
                    return {
                      position: "row",
                      icon:
                        rowData.status === "SUBMITTED"
                          ? () => <Visibility />
                          : () => <Edit />,
                      tooltip:
                        rowData.status === "SUBMITTED"
                          ? "View proposal"
                          : "Edit proposal",
                      onClick: (event, rowData) =>
                        setEditReviewID(rowData.reviewId)
                    };
                  }
                },
                {
                  icon: () => <GetAppIcon />,
                  tooltip: "Download proposal",
                  onClick: (event, rowData) =>
                    downloadPDFProposal(rowData.proposalId),
                  position: "row"
                },
                {
                  icon: () => <GetAppIcon />,
                  tooltip: "Download proposals",
                  onClick: (event, rowData) => {
                    downloadPDFProposal(
                      rowData.map(row => row.proposalId).join(",")
                    );
                  },
                  position: "toolbarOnSelect"
                }
              ]}
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
}
