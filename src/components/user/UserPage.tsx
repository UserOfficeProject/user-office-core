import React from "react";
import { withRouter } from "react-router-dom";
import UpdateUserInformation from "./UpdateUserInformation";
import UpdatePassword from "./UpdatePassword";
import UpdateUserRoles from "./UpdateUserRoles";
import { Impersonate } from "./Impersonate";

function UserPage(props: { match: { params: { id: string } } }) {
  const userId = parseInt(props.match.params.id);

  return (
    <React.Fragment>
      <UpdateUserInformation id={userId} />
      <UpdatePassword id={userId} />
      <UpdateUserRoles id={userId} />
      <Impersonate id={userId} />
    </React.Fragment>
  );
}

export default withRouter(UserPage);
