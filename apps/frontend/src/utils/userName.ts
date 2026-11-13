type UserNameDetails = {
  firstname: string;
  lastname?: string | null;
  preferredname?: string | null;
};

export const getPreferredNameWithLastname = (user: UserNameDetails): string => {
  const preferredName = user.preferredname || user.firstname;

  return user.lastname ? `${user.lastname}, ${preferredName}` : preferredName;
};
