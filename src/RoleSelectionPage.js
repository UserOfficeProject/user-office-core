import React, { useContext } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { AppContext } from "./App";

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

export default function PeoplePage({ match, onSelect }) {
  const classes = useStyles();
  const { userData, currentRole } = useContext(AppContext);

  if (!userData) {
    return <Redirect to="/SignIn" />;
  }
  if (currentRole) {
    return <Redirect to="/" />;
  }

  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>Select role: </Paper>
          </Grid>
          {userData.user.roles.map(role => (
            <Grid item xs={6} onClick={() => onSelect(role.shortCode)}>
              <Paper className={classes.paper}>{role.title}</Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
}
