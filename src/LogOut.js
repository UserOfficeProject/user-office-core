import React, { useContext } from "react";
import { AppContext } from "./App";
import { Redirect } from "react-router-dom";

export default function LogOut() {
  const { setToken } = useContext(AppContext);
  setToken(null);

  return <Redirect to="/" />;
}
