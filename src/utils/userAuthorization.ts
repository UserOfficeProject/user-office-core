import User from "../models/User";

export function isUserOfficer(agent: User | null) {
  if (agent == null) {
    return false;
  }

  if (!agent.roles.includes("User_Officer")) {
    return false;
  }
  return true;
}

export function isUser(agent: User | null, id: number) {
  if (agent == null) {
    return false;
  }
  if (agent.id !== id) {
    return false;
  }
  return true;
}
