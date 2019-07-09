import React, { useContext } from "react";
import { AppContext } from "./App";
import { Redirect } from "react-router-dom";

export default function LogOut() {
  const { setUserData, setCurrentRole } = useContext(AppContext);
  setUserData(null);
  setCurrentRole(null);
  return <Redirect to="/" />;
}
