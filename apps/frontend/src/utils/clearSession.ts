const clearSession = (itemKey?: string) => {
  // Call this method to clear the session.
  // Don't use localStorage.clear() because it will clear all the
  // localStorage data, not just the session data
  if (itemKey) {
    return localStorage.removeItem(itemKey);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('currentRole');
  localStorage.removeItem('user');
  localStorage.removeItem('expToken');
  localStorage.removeItem('impersonatingUserId');
  localStorage.removeItem('isInternalUser');
};

export default clearSession;
