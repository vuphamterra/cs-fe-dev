import { Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { generate } from '@ant-design/colors';
import { logEvent } from 'firebase/analytics';
import { analytics } from '~/firebase/firebase';
import Loading from './components/Loading';
import DatabasePage from './pages/DatabasePage';
import DrawerManagement from './pages/DrawerManagement';
import CreateDrawer from './pages/DrawerManagement/CreateDrawer';
import EditDrawer from './pages/DrawerManagement/EditDrawer';
import Dashboard from './pages/Dashboard';
import DatabaseSettings from './pages/DatabasePage/DatabaseSettings';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import FileManagement from './pages/FileManagement';
import FolderManagement from './pages/FolderManagement';
import ViewFolderDetails from './pages/FolderManagement/Details';
import SettingPreferences from './pages/SettingPreferences';
import ClientSettingPreferences from './pages/ClientSettingPreferences';
import ScannerSettings from './pages/ScannerSettings';
import UserManagement from './pages/UserManagement';
import AccountSetting from './pages/AccountSetting';
import AuthAdminLogic from './layouts/AuthAdminLogic';
import PageNotFound from './pages/NotFound';
import AuthClientLogic from './layouts/AuthClientLogic';
import FileDetail from './pages/FileManagement/components/FileDetail';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { updateTheme } from './store/ThemeSlice';
import { updateRootColors } from './utils';
import UserGuide from './pages/UserGuide';
import GeneralSettings from './pages/AppSettings/GeneralSettings';
import AppSettings from './pages/AppSettings';
import NewDBForm from './pages/DatabasePage/components/NewDBForm';
import MigrateDBForm from './pages/DatabasePage/components/MigrateDBForm';
import './global.css';

function App() {
  const dispatch = useAppDispatch();
  const { theme: themeStore } = useAppSelector((store) => store.theme);
  const { selectedDb } = useAppSelector((store) => store.db);

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'clickscan',
        firebase_screen_class: 'clickscan',
      });
    }
  }, []);

  useEffect(() => {
    if (selectedDb) {
      const { setting } = selectedDb;
      const colorPrimary =
        setting && setting.color_palette ? setting.color_palette : themeStore.token.colorPrimary;
      const colorPalette = generate(colorPrimary);
      dispatch(updateTheme({ token: { colorPrimary } }));
      updateRootColors(colorPrimary, colorPalette[2], colorPalette[0], `${colorPalette[1]}`);
    }
  }, [selectedDb]);

  useEffect(() => {
    const colorPalette = generate(themeStore.token.colorPrimary);
    updateRootColors(
      themeStore.token.colorPrimary,
      colorPalette[2],
      colorPalette[0],
      `${colorPalette[1]}`,
    );
  }, [themeStore]);

  return (
    <ConfigProvider theme={themeStore}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route element={<AppSettings />}>
              <Route path="add-database" element={<NewDBForm />} />
              <Route path="app-setting" element={<GeneralSettings />} />
              <Route path="migrate-database" element={<MigrateDBForm />} />
            </Route>
          </Route>

          <Route element={<MainLayout />}>
            <Route element={<AuthAdminLogic />}>
              <Route path="database" element={<DatabasePage />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="drawer-management" element={<Outlet />}>
                <Route index element={<DrawerManagement />} />
                <Route path="create-drawer" element={<CreateDrawer />} />
                <Route path=":drawerId" element={<EditDrawer />} />
              </Route>
              <Route path="user-management" element={<UserManagement />}>
                <Route path=":userId" element={<UserManagement />} />
              </Route>
              <Route path="/database-settings" element={<DatabaseSettings />} />

              <Route path="settings" element={<Outlet />}>
                <Route index element={<Navigate to="database-settings" />} />
                <Route path="database-settings" element={<DatabaseSettings />} />
                <Route path="account-settings" element={<AccountSetting />} />
                <Route path="preferences-settings" element={<SettingPreferences />} />
              </Route>
              <Route path="admin-user-guide" element={<UserGuide />} />
            </Route>

            {/* Client Route */}
            <Route element={<AuthClientLogic />}>
              <Route path="folder-management" element={<FolderManagement />}>
                <Route path=":activeId" element={<ViewFolderDetails />} />
              </Route>
              <Route path="folder-management/folder-details" element={<FileManagement />}>
                <Route path=":activeId" element={<FileDetail />} />
              </Route>
              <Route path="settings" element={<Outlet />}>
                <Route path="account-client-settings" element={<AccountSetting />} />
                <Route path="preferences-client-settings" element={<ClientSettingPreferences />} />
                <Route path="scanner-settings" element={<ScannerSettings />} />
              </Route>
              <Route path="user-guide" element={<UserGuide />} />
            </Route>
          </Route>

          {/* Not Found */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
