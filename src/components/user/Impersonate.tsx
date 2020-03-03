import { Button, Container, Grid, Typography } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useContext } from "react";
import { useHistory } from "react-router";
import { UserContext } from "../../context/UserContextProvider";
import { useDataApi } from "../../hooks/useDataApi";
import { StyledPaper } from "../../styles/StyledComponents";

export function Impersonate(props: { id: number }) {
  const api = useDataApi();
  const { handleLogin } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  return (
    <React.Fragment>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Impersonate
              </Typography>
              <Button
                variant="contained"
                color="primary"
                style={{ display: "block", margin: "0 auto" }}
                onClick={() =>
                  api()
                    .getTokenForUser({ id: props.id })
                    .then(data => {
                      const { token, error } = data.getTokenForUser;
                      if (error) {
                        enqueueSnackbar(error, { variant: "error" });
                      } else {
                        handleLogin(token);
                        history.push("/home");
                      }
                    })
                }
              >
                Connect as this user...
              </Button>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}
