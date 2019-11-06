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
      "url(https://lh3.googleusercontent.com/Ha2a4uO-rMRdrgPrc-7c609rHWk8W2b6I9_7j6Maz6BSBnUEED8vvadc3AmbvD1ipqLWOiweFJYV4EAurr-vl5Un9-AnVbLCNdzbrVi9gafMOg2KIHcbu9LBjKaQ_n0VpjGTdy67o_zh1Let8518vR0l2H9Iut814s7D8qBNDduJ6qsHuqOEftlSHTwveqBsNOOHmQ7HurrfIOBtZXaXKYd7u3In2DZSbDmMraKoQ1QssISRNc8C_nuGC2rQaK2KCftqsMNGAqrg0cOw7ayAEiS7W5XSCr9c0NvoIsPaMqiBqTfnM_k-5eb_rPXnQqeZ8FwUDvB-w9vubNTw_cP9l82MVGPmTXwTTQ79-dfIlG8HD1HTyDYCygg8BCyK-QI_mk-m-UngfUMPVeQ4M2AK1rvo_PKAjYdasSz2E6ZDxHlAv5q5rg0NXulua9SWaVUPifMs2vVwJJ8L7QvD_MOhAzCmF70F8xq390ugLKo9No8El-GrRk532BoIhoYIjhbTNbQ-b_HgEimX0V6yoGsf8p2gEYJbHzhqVWnD7vfgapv1Dp1XLtUE83kx77xYQca1J600eqUGe5bjTem00Q-qkBMO9IhRMABxdXUty1AK45vkV-EF62lBo__Z9OfUf0DpGvjbXOmrqCFelYe3HLgGtrEJmgSwRBN1aAQShNZTOkADX9o=w1478-h1213-no)",
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
