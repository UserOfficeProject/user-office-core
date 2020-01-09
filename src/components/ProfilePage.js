import React from "react";
import UpdateUserInformation from "./userInformation/UpdateUserInformation";
import UpdatePassword from "./userInformation/UpdatePassword";

export default function ProfilePage({ match }) {
  return (
    <React.Fragment>
      <UpdateUserInformation id={parseInt(match.params.id)} />
      <UpdatePassword id={parseInt(match.params.id)} />
    </React.Fragment>
  );
}
