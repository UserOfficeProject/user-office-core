import React from "react";
import { withRouter } from "react-router-dom";
import UpdateUserInformation from "./userInformation/UpdateUserInformation";
import UpdatePassword from "./userInformation/UpdatePassword";
import UpdateUserRoles from "./userInformation/UpdateUserRoles";

function UserPage(props: { match: {params: {id: string}} }) {
  const userId = parseInt(props.match.params.id);

  return (
    <React.Fragment>
      <UpdateUserInformation id={userId} />
      <UpdatePassword id={userId} />
      <UpdateUserRoles id={userId} />
    </React.Fragment>
  );
}

export default withRouter(UserPage);
