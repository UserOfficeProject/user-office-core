import Grid from "@material-ui/core/Grid";
import { Edit } from "@material-ui/icons";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { ContentContainer, StyledPaper } from "../styles/StyledComponents";
import PeopleTable from "./PeopleTable";

export default function PeoplePage({ match }) {
  const [userData, setUserData] = useState(null);

  if (userData) {
    return <Redirect to={`/PeoplePage/${userData.id}`} />;
  }

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <PeopleTable
                title="Users"
                actionText="Edit user"
                actionIcon={<Edit />}
                action={setUserData}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
