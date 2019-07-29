import React, { useContext } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProposalTableUser from "./ProposalTableUser";
import clsx from "clsx";
import { UserContext } from "../context/UserContextProvider";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  fixedHeight: {
    height: 240
  }
}));

export default function OverviewPage() {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const { user } = useContext(UserContext);

  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ProposalTableUser id={user.id} />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper}>Upcoming visits</Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper}>Actions to be done</Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
