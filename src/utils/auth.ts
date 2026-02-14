export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

export const isDistributor = (): boolean => {
  return getUserRole() === 'distributor';
};

export const isUser = (): boolean => {
  return getUserRole() === 'user';
};

export const requireAuth = (redirectUrl: string = '/login'): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    return false;
  }
  return true;
};

export const requireRole = (allowedRoles: string[], redirectUrl: string = '/'): boolean => {
  const role = getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    return false;
  }
  return true;
};

export const getPermissions = (): string[] => {
  const user = getUser();
  return user?.permissions || [];
};

export const hasPermission = (permission: string): boolean => {
  const permissions = getPermissions();
  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;
  const [entity] = permission.split('.');
  if (permissions.includes(`${entity}.*`)) return true;
  return false;
};

export const setUserWithPermissions = (user: any): void => {
  setUser(user);
};