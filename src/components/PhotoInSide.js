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
      "url(https://lh3.googleusercontent.com/-M6eItc6QC1k/XS8Gew8sG8I/AAAAAAAANmo/_7-Tnmk8jKU6CSwcrB32-UAM0PnQMLMDQCK8BGAs/s0/2019-07-17.png)",
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
