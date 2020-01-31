import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { ContentContainer, StyledPaper } from "../styles/StyledComponents";
import ProposalTableOfficer from "./ProposalTableOfficer";

const useStyles = makeStyles(theme => ({
  fixedHeight: {
    height: 240
  }
}));

export default function ProposalPage({ match }) {
  const classes = useStyles();

  return (
    <>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper className={classes.paper}>
              <ProposalTableOfficer />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
