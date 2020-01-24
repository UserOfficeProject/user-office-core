import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Email from "@material-ui/icons/Email";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDataApi } from "../hooks/useDataApi";
import PhotoInSide from "./PhotoInSide";

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "blue"
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  signLink: {
    textDecoration: "none"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

export default function EmailVerification({ match }) {
  const classes = useStyles();
  const [emailVerified, setEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const api = useDataApi();

  if (!emailVerified) {
    api()
      .verifyEmail({ token: match.params.token })
      .then(data =>
        data.emailVerification.success
          ? setEmailVerified(true)
          : setErrorMessage(true)
      );
  }

  return (
    <PhotoInSide>
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <Email />
        </Avatar>
        <Typography component="h1" variant="h5">
          {emailVerified && "Email Verified"}
          {errorMessage && "Email Verfication Failed"}
        </Typography>
        {emailVerified && (
          <Link to="/SignIn/" className={classes.signLink}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              click here to sign in
            </Button>
          </Link>
        )}
        {errorMessage && (
          <p>
            Something went wrong, please contact user office at
            useroffice@esss.se
          </p>
        )}
      </div>
    </PhotoInSide>
  );
}
