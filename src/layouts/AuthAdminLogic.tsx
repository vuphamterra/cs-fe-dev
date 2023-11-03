import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '~/store/hooks';
import { DASHBOARD } from '~/constants';

const AuthAdminLogic = () => {
  const { isAdmin, isSuperAdmin, selectedDashboard } = useAppSelector((s) => s.auth);
  if ((isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.CLIENT) {
    return <Navigate to="/not-found" />;
  }
  if (!isAdmin && !isSuperAdmin) {
    return <Navigate to="/not-found" />;
  }
  return <Outlet />;
};
export default AuthAdminLogic;
