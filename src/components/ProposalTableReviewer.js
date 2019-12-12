import React, { useState, useContext } from "react";
import { useUserWithReviewsData } from "../hooks/useUserData";
import { Redirect } from "react-router";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { Edit } from "@material-ui/icons";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { UserContext } from "../context/UserContextProvider";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3)
    }
  },
  fixedHeight: {
    height: 240
  }
}));

export default function ProposalTableReviewer() {
  const { user } = useContext(UserContext);
  const { loading, userData } = useUserWithReviewsData(user.id);

  const classes = useStyles();

  const columns = [
    { title: "Proposal ID", field: "shortCode" },
    { title: "Title", field: "title" },
    { title: "Comment", field: "comment" },
    { title: "Grade", field: "grade" }
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
      id: review.id,
      title: review.proposal.title,
      grade: review.grade,
      comment: review.comment
    };
  });
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <MaterialTable
              icons={tableIcons}
              title={"Proposals to review"}
              columns={columns}
              data={reviewData}
              actions={[
                {
                  icon: () => <Edit />,
                  tooltip: "Review proposal",
                  onClick: (event, rowData) => setEditReviewID(rowData.id)
                }
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
