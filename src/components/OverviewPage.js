import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import parse from "html-react-parser";
import React, { useContext } from "react";
import { UserContext } from "../context/UserContextProvider";
import { useGetPageContent } from "../hooks/useGetPageContent";
import { StyledPaper } from "../styles/StyledComponents";
import ProposalTableUser from "./ProposalTableUser";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
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
            <StyledPaper margin={[0]}>
              {loadingHomeContent ? null : parse(homePageContent)}
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              <ProposalTableUser id={user.id} />
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
