export const getAuth = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  return token && user ? { token, user: JSON.parse(user) } : null;
};

export const setAuth = (token: string, user: any) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const removeAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};