import { Outlet } from 'react-router';
import { FloatButton } from 'antd';
import { Feedback } from '~/components/Icons';

export default function AuthLayout() {
  return (
    <div className="auth_layout">
      <Outlet />
      <FloatButton
        onClick={() =>
          window.open(
            'https://docs.google.com/forms/d/e/1FAIpQLScrKKr0ho5qbq9r7e9QTAJkVgaq5hs-cFs2NRIv4olLjcDszg/viewform',
            '_blank',
          )
        }
        type="primary"
        icon={<Feedback width={20} height={20} fill="" />}
        className="feedback_btn"
      />
    </div>
  );
}
