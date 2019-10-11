import React, { FunctionComponent } from "react";

import { Container, Typography, makeStyles } from "@material-ui/core";

const TitledContainer: FunctionComponent<{ label: string }> = props => {
  const classes = makeStyles(theme => ({
    container: {
      marginTop: "35px",
      position: "relative"
    },
    heading: {
      top: "-15px",
      left: "10px",
      position: "absolute",
      marginBottom: "-15px",
      background: "#FFF",
      zIndex: 1,
      padding: "0 8px",
      color: theme.palette.grey[600]
    },
    contents: {
      border: "1px solid #ccc",
      borderRadius: "5px",
      paddingTop: "26px",
      padding: "16px",
      zIndex: 0
    }
  }))();

  return (
    <div className={classes.container}>
      <Typography variant="h6" className={classes.heading}>
        {props.label}
      </Typography>
      <Container className={classes.contents}>{props.children}</Container>
    </div>
  );
};

export default TitledContainer;
