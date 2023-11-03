import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { UserOutlined } from '@ant-design/icons';
import Logoutimg from '~/assets/images/logout.svg';
import LogoutModal from '../LogoutModal';
import { RootState } from '~/store';
import type { MenuProps } from 'antd';
import { Dropdown, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { DASHBOARD } from '~/constants';
import { selectDashboard } from '~/store/AuthSlice';
import styles from './NavBar.module.scss';
import { setDrawer } from '~/store/DrawerSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedDb, databases } = useAppSelector((store) => store.db);
  const { user, isSuperAdmin, isAdmin, selectedDashboard } = useSelector(
    (state: RootState) => state.auth,
  );
  const [modalShow, setModalShow] = useState(false);

  const items: MenuProps['items'] = [
    {
      label: (
        <div className={styles.dropdown_item}>
          <div className={styles.user_icon}>
            <UserOutlined />
          </div>
          <p className={styles.uname_txt}>{user?.username}</p>
        </div>
      ),
      key: '0',
    },
    {
      label: (
        <div className={styles.dropdown_item} onClick={() => setModalShow(true)}>
          <img src={Logoutimg} alt="" />
          <p className="mb-0 p_500_txt">Logout</p>
        </div>
      ),
      key: '1',
    },
  ];

  const handleSwitchViewChange = (checked: boolean) => {
    const dashboard = checked ? DASHBOARD.ADMIN : DASHBOARD.CLIENT;
    const url = checked ? '/dashboard' : '/folder-management';
    dispatch(selectDashboard(dashboard));
    dispatch(setDrawer(null));
    navigate(url);
  };

  const db = databases.find((item) => item.id === selectedDb.id);
  let organizationName = '--';
  if (db) {
    const { setting: { organization_name: orgName = '' } = {} } = db;
    if (orgName) {
      organizationName = orgName;
    }
  }

  const showSwitchViewButton = isSuperAdmin || isAdmin;

  return (
    <div className={styles.navbar_sec}>
      <LogoutModal show={modalShow} onHide={() => setModalShow(false)} />
      <div className={styles.header_container}>
        <div className={styles.header_content}>
          <h3>{organizationName}</h3>
          {showSwitchViewButton && (
            <div className={styles.switch_view_box}>
              <Switch
                defaultChecked={selectedDashboard === DASHBOARD.ADMIN}
                checkedChildren={_.capitalize(DASHBOARD.CLIENT)}
                unCheckedChildren={_.capitalize(DASHBOARD.ADMIN)}
                onChange={handleSwitchViewChange}
              />
            </div>
          )}
          <Dropdown menu={{ items }} trigger={['click']}>
            <div className={styles.dropdown_user}>
              <UserOutlined />
              <p>{user?.username}</p>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
