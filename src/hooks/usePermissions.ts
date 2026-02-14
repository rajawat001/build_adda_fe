import { useState, useEffect, useCallback } from 'react';
import { getPermissions } from '../utils/auth';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPermissions(getPermissions());
    setLoading(false);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;
    const [entity] = permission.split('.');
    if (permissions.includes(`${entity}.*`)) return true;
    return false;
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    return perms.some(p => hasPermission(p));
  }, [hasPermission]);

  return { permissions, hasPermission, hasAnyPermission, loading };
}
