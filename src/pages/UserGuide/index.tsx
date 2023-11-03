import DocViewer from '@cyntler/react-doc-viewer';
import { theme } from 'antd';
import { DASHBOARD } from '~/constants';
import { useAppSelector } from '~/store/hooks';

const { useToken } = theme;

const UserGuide = () => {
  const { token } = useToken();
  const { isSuperAdmin, isAdmin, selectedDashboard } = useAppSelector((store) => store.auth);
  const pdfUri =
    (isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN
      ? '/admin_help.pdf'
      : '/client_help.pdf';
  const docs = [{ uri: process.env.PUBLIC_URL + pdfUri }];

  return (
    <DocViewer
      documents={docs}
      theme={{ primary: token.colorPrimary, textPrimary: '#384250', textSecondary: '#dc3545' }}
    />
  );
};

export default UserGuide;
