import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { StyledPaper } from "../styles/StyledComponents";
import ProposalTableOfficer from "./ProposalTableOfficer";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  fixedHeight: {
    height: 240
  }
}));

export default function ProposalPage({ match }) {
  const classes = useStyles();

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper className={classes.paper}>
              <ProposalTableOfficer />
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
