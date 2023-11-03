import { Outlet } from 'react-router-dom';
// import { Navigate, Outlet } from 'react-router-dom';
// import { DASHBOARD } from '~/constants';
// import { useAppSelector } from '~/store/hooks';

const AuthClientLogic = () => {
  // const { selectedDashboard } = useAppSelector((s) => s.auth);
  // if (selectedDashboard !== DASHBOARD.CLIENT) {
  //   return <Navigate to="/not-found" />;
  // }

  return <Outlet />;
};
export default AuthClientLogic;
