import React, { useContext } from "react";
import { AppContext } from "./App";
import { Redirect } from "react-router-dom";

export default function LogOut() {
  const { setUserData } = useContext(AppContext);
  setUserData(null);

  return <Redirect to="/" />;
}
