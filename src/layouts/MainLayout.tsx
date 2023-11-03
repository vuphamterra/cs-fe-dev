/* eslint-disable multiline-ternary */
import { Outlet } from 'react-router';
// import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, FloatButton } from 'antd';
import Navbar from '~/components/NavBar';
import { FileOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import logo from '~/assets/images/logo_side.png';
import logoMini from '~/assets/images/logo_mini.png';
import SideIcon from '~/components/SideMenu/SideIcon';
import SiderBar from '~/components/SideMenu/Sider';
import BuildVersion from '~/components/BuildVersion';
import { Feedback } from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { DASHBOARD } from '~/constants';
import { handleOpenSide } from '~/store/AuthSlice';

export default function MainLayout() {
  // const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, selectedDashboard } = useAppSelector((store) => store.auth);
  const [openSide, setOpenSide] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  const handleCallback = (isSettings: boolean) => {
    setOpenSide(isSettings);
  };

  useEffect(() => {
    dispatch(handleOpenSide(openSide));
  }, [openSide]);

  return (
    <div className="main_layout">
      <div className={openSide ? 'sider_bar' : 'sider_bar_close'}>
        <div className="left_panel">
          <div className="wrap_side">
            <div className={openSide ? 'logo_side' : 'logo_side_collapsed'}>
              <img src={openSide ? logo : logoMini} />
            </div>
            <div className="list_side_bar">
              {openSide ? (
                <SiderBar isOpenSide={openSide} />
              ) : (
                <SideIcon parentCallback={handleCallback} />
              )}
            </div>
          </div>
          <div className="btn_collapse">
            {openSide && (
              <div style={{ alignSelf: 'center' }}>
                <BuildVersion />
              </div>
            )}
          </div>
        </div>
        <div style={{ width: '1%', display: 'flex', alignItems: 'center' }}>
          <Button
            color="#0882F0"
            className="close_button"
            icon={openSide ? <LeftOutlined /> : <RightOutlined />}
            shape="circle"
            onClick={() => setOpenSide(!openSide)}
          />
        </div>
      </div>
      <div className="main_content">
        <div className="header_content">
          <Navbar />
        </div>
        <div className="outlet_contain">
          <Outlet />
        </div>
      </div>
      <FloatButton.Group shape="square">
        <FloatButton
          icon={<FileOutlined />}
          tooltip="User guide"
          type="primary"
          onClick={() => {
            let url = `${process.env.REACT_APP_USER_GUIDE_URL}/client.html`;
            if ((isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN) {
              url = `${process.env.REACT_APP_USER_GUIDE_URL}/admin.html`;
            }
            window.open(url);
          }}
          className="feedback_btn"
        />
        <FloatButton
          onClick={() =>
            window.open(
              'https://docs.google.com/forms/d/e/1FAIpQLScrKKr0ho5qbq9r7e9QTAJkVgaq5hs-cFs2NRIv4olLjcDszg/viewform',
              '_blank',
            )
          }
          tooltip="Feedback"
          type="primary"
          icon={<Feedback width={20} height={20} fill="" />}
          className="feedback_btn"
        />
      </FloatButton.Group>
    </div>
  );
}
