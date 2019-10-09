import React from "react";
import { useGetPageContent } from "../hooks/useGetPageContent";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
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
export default function HelpPage() {
  const classes = useStyles();
  const [loadingHelpContent, helpPageContent] = useGetPageContent("HELPPAGE");
  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              {loadingHelpContent ? null : parse(helpPageContent)}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
