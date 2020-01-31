import Grid from "@material-ui/core/Grid";
import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { UserContext } from "../context/UserContextProvider";
import { ContentContainer, StyledPaper } from "../styles/StyledComponents";

export default function RoleSelectionPage() {
  const { roles, currentRole, handleRole } = useContext(UserContext);
  if (!roles) {
    return <Redirect to="/SignIn" />;
  }
  if (currentRole) {
    return <Redirect to="/" />;
  }

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>Select role: </StyledPaper>
          </Grid>
          {roles.map(role => (
            <Grid item xs={6} onClick={() => handleRole(role.shortCode)}>
              <StyledPaper>{role.title}</StyledPaper>
            </Grid>
          ))}
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
