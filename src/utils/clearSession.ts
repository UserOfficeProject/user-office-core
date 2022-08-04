const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentRole');
  localStorage.removeItem('user');
  localStorage.removeItem('expToken');
  localStorage.removeItem('impersonatingUserId');
};

export default clearSession;
