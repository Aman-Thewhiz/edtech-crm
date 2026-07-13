import { useMemo } from 'react';
import usePermissions from '../../hooks/usePermissions';

export default function Can({ do: action, on: resource, children, fallback = null }) {
  const { can } = usePermissions();
  const allowed = useMemo(() => can(action, resource), [action, resource, can]);
  return allowed ? children : fallback;
}