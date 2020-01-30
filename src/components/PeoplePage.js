import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import PeopleTable from "./PeopleTable";
import { Edit } from "@material-ui/icons";
import { Redirect } from "react-router-dom";
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

export default function PeoplePage({ match }) {
  const classes = useStyles();
  const [userData, setUserData] = useState(null);

  if (userData) {
    return <Redirect to={`/PeoplePage/${userData.id}`} />;
  }

  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <PeopleTable
                title="Users"
                actionText="Edit user"
                actionIcon={<Edit />}
                action={setUserData}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
