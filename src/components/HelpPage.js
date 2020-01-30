import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import parse from "html-react-parser";
import React from "react";
import { useGetPageContent } from "../hooks/useGetPageContent";
import { StyledPaper } from "../styles/StyledComponents";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
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
            <StyledPaper>
              {loadingHelpContent ? null : parse(helpPageContent)}
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
