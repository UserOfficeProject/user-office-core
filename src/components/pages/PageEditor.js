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
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { useGetPageContent } from "../../hooks/useGetPageContent";
import { useSnackbar } from "notistack";
import { StyledPaper } from "../../styles/StyledComponents";
import { useDataApi } from "../../hooks/useDataApi";
import { PageName } from "../../generated/sdk";

const useStyles = makeStyles(theme => ({
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
  const { enqueueSnackbar } = useSnackbar();
  const [homeContent, setHomeContent] = useState("");
  const [helpContent, setHelpContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const [cookieContent, setCookieContent] = useState("");
  const [loadingHelpContent, helpPageContent] = useGetPageContent(
    PageName.HELPPAGE
  );
  const [loadingHomeContent, homePageContent] = useGetPageContent(
    PageName.HOMEPAGE
  );
  const [loadingPrivacyContent, privacyPageContent] = useGetPageContent(
    PageName.PRIVACYPAGE
  );
  const [loadingCookieContent, cookiePageContent] = useGetPageContent(
    PageName.COOKIEPAGE
  );
  const api = useDataApi();

  useEffect(() => {
    setHelpContent(helpPageContent);
    setHomeContent(homePageContent);
    setPrivacyContent(privacyPageContent);
    setCookieContent(cookiePageContent);
  }, [helpPageContent, homePageContent, privacyPageContent, cookiePageContent]);

  const handleClick = async (pageName, text) => {
    api()
      .setPageContent({ id: pageName, text: text })
      .then(() => enqueueSnackbar("Updated Page", { variant: "success" }));
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <StyledPaper>
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
            id={PageName.HOMEPAGE}
            onEditorChange={content => setHomeContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick(PageName.HOMEPAGE, homeContent)}
          >
            Update
          </Button>
        </div>
      </StyledPaper>
      <StyledPaper>
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
            id={PageName.HELPPAGE}
            onEditorChange={content => setHelpContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick(PageName.HELPPAGE, helpContent)}
            id="help-update-btn"
          >
            Update
          </Button>
        </div>
      </StyledPaper>
      <StyledPaper>
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
            id={PageName.PRIVACYPAGE}
            onEditorChange={content => setPrivacyContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick(PageName.PRIVACYPAGE, privacyContent)}
          >
            Update
          </Button>
        </div>
      </StyledPaper>
      <StyledPaper>
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
            id={PageName.COOKIEPAGE}
            onEditorChange={content => setCookieContent(content)}
          />
        )}
        <div className={classes.buttons}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick(PageName.COOKIEPAGE, cookieContent)}
          >
            Update
          </Button>
        </div>
      </StyledPaper>
    </Container>
  );
}
