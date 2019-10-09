import React, { useContext } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import ProposalTableUser from "./ProposalTableUser";
import { UserContext } from "../context/UserContextProvider";
import { useGetPageContent } from "../hooks/useGetPageContent";
import parse from "html-react-parser";

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
  }
}));

export default function OverviewPage() {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  const [loadingHomeContent, homePageContent] = useGetPageContent("HOMEPAGE");
  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              {loadingHomeContent ? null : parse(homePageContent)}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ProposalTableUser id={user.id} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
