import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage:
      "url(https://lh3.googleusercontent.com/W9_mgCQO_-4zO4p1RY4sXa13iHERfHucZf6IJNYrb_0OqeySCYI7oUJ8c4-YCpjlWRUfaMMM3RNasQ=w1572-h1233-rw)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center"
  }
}));

export default function PhotoInSide(props) {
  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        {props.children}
      </Grid>
    </Grid>
  );
}
