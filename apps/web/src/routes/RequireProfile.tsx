import { Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useProfileStore } from '../store/profileStore';

/** Chưa đặt tên nhân vật thì mọi đường đều dẫn về màn khởi hành. */
export function RequireProfile() {
  const name = useProfileStore((s) => s.name);
  const location = useLocation();

  if (!name) return <Navigate to="/signup" replace state={{ from: location }} />;
  return <AppShell />;
}
