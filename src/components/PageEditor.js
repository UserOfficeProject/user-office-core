// It is important to import the Editor which accepts plugins.

import React, { useState, useEffect } from "react";

import "tinymce/tinymce";
import "tinymce/themes/silver/theme";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/oxide/content.min.css";
import "tinymce/plugins/link";
import "tinymce/plugins/preview";
import "tinymce/plugins/image";
import "tinymce/plugins/code";

import { Editor } from "@tinymce/tinymce-react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Notification from "./Notification";
import { useSetPageContent } from "../hooks/useSetPageContent";
import { useGetPageContent } from "../hooks/useGetPageContent";

const useStyles = makeStyles(theme => ({
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
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
}));

export default function PageEditor() {
  const classes = useStyles();
  const [homeContent, setHomeContent] = useState("");
  const [helpContent, setHelpContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const [cookieContent, setCookieContent] = useState("");
  const [loadingHelpContent, helpPageContent] = useGetPageContent("HELPPAGE");
  const [loadingHomeContent, homePageContent] = useGetPageContent("HOMEPAGE");
  const [loadingPrivacyContent, privacyPageContent] = useGetPageContent(
    "PRIVACYPAGE"
  );
  const [loadingCookieContent, cookiePageContent] = useGetPageContent(
    "COOKIEPAGE"
  );
  const sendPageContent = useSetPageContent();

  useEffect(() => {
    setHelpContent(helpPageContent);
    setHomeContent(homePageContent);
    setPrivacyContent(privacyPageContent);
    setCookieContent(cookiePageContent);
  }, [helpPageContent, homePageContent, privacyPageContent, cookiePageContent]);

  const [state, setState] = useState({
    open: false,
    message: "",
    variant: "success"
  });

  const handleClick = async (pageName, text) => {
    const resp = await sendPageContent(pageName, text);
    if (resp) {
      setState({
        open: true,
        variant: "success",
        message: "Text Updated"
      });
    } else {
      setState({
        open: true,
        variant: "error",
        message: "Update Failed"
      });
    }
  };

  function handleClose() {
    setState({ ...state, open: false });
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Notification
        open={state.open}
        onClose={handleClose}
        variant={state.variant}
        message={state.message}
      />
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Set user homepage
        </Typography>
        <Divider />
        {loadingHomeContent ? null : (
          <Editor
            initialValue={homeContent}
            init={{
              skin: false,
              content_css: false,
              plugins: ["link", "preview", "image", "code"],
              toolbar: "bold italic",
              branding: false
            }}
            onEditorChange={content => setHomeContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick("HOMEPAGE", homeContent)}
          >
            Update
          </Button>
        </div>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Set help page
        </Typography>
        <Divider />
        {loadingHelpContent ? null : (
          <Editor
            initialValue={helpContent}
            init={{
              skin: false,
              content_css: false,
              plugins: ["link", "preview", "image", "code"],
              toolbar: "bold italic",
              branding: false,
              images_upload_url: "postAcceptor.php"
            }}
            onEditorChange={content => setHelpContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick("HELPPAGE", helpContent)}
          >
            Update
          </Button>
        </div>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Set privacy agreement
        </Typography>
        <Divider />
        {loadingPrivacyContent ? null : (
          <Editor
            initialValue={privacyContent}
            init={{
              skin: false,
              content_css: false,
              plugins: ["link", "preview", "image", "code"],
              toolbar: "bold italic",
              branding: false
            }}
            onEditorChange={content => setPrivacyContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick("PRIVACYPAGE", privacyContent)}
          >
            Update
          </Button>
        </div>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Set cookie policy
        </Typography>
        <Divider />
        {loadingCookieContent ? null : (
          <Editor
            initialValue={cookieContent}
            init={{
              skin: false,
              content_css: false,
              plugins: ["link", "preview", "image", "code"],
              toolbar: "bold italic",
              branding: false
            }}
            onEditorChange={content => setCookieContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick("COOKIEPAGE", cookieContent)}
          >
            Update
          </Button>
        </div>
      </Paper>
    </Container>
  );
}
