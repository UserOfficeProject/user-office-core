import Grid from "@material-ui/core/Grid";
import { Edit } from "@material-ui/icons";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { ContentContainer, StyledPaper } from "../../styles/StyledComponents";
import PeopleTable from "./PeopleTable";
import { InviteUserForm } from "./InviteUserForm";
import { UserRole } from "../../generated/sdk";

export default function PeoplePage({ match }) {
  const [userData, setUserData] = useState(null);
  const [sendUserEmail, setSendUserEmail] = useState({
    show: false,
    title: ""
  });

  if (userData) {
    return <Redirect to={`/PeoplePage/${userData.id}`} />;
  }

  let menyItems = [];

  menyItems.push({
    title: "Invite User",
    action: (event, rowData) =>
      setSendUserEmail({
        show: true,
        title: "Invite User",
        userRole: UserRole.USER
      })
  });

  menyItems.push({
    title: "Invite Reviewer",
    action: (event, rowData) =>
      setSendUserEmail({
        show: true,
        title: "Invite Reviewer",
        userRole: UserRole.REVIEWER
      })
  });

  return (
    <React.Fragment>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              {sendUserEmail.show ? (
                <InviteUserForm
                  title={sendUserEmail.title}
                  userRole={sendUserEmail.userRole}
                  close={() =>
                    setSendUserEmail({
                      show: false
                    })
                  }
                  action={() => console.log()}
                />
              ) : (
                <PeopleTable
                  title="Users"
                  actionText="Edit user"
                  actionIcon={<Edit />}
                  action={setUserData}
                  menyItems={menyItems}
                />
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}
