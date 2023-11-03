/* eslint-disable react/prop-types */
import homeIcon from '~/assets/images/home.svg';
import drawerIcon from '~/assets/images/drawer.svg';
import userIcon from '~/assets/images/user.svg';
import gearIcon from '~/assets/images/gear.svg';
import folderIcon from '~/assets/images/folder.svg';
import { List } from 'antd';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { DASHBOARD } from '~/constants';
import styles from './styles.module.scss';
import { handleSettingIconClick } from '~/store/AuthSlice';
import { useEffect } from 'react';

const iconListAdmin = [
  { key: 1, icon: homeIcon, matches: 'dashboard' },
  { key: 2, icon: drawerIcon, matches: 'drawer-management' },
  { key: 3, icon: userIcon, matches: 'user-management' },
  { key: 4, icon: gearIcon, matches: 'settings' },
];

const iconListClient = [
  { key: 1, icon: drawerIcon, matches: 'drawer' },
  { key: 2, icon: folderIcon, matches: 'folder-management' },
  { key: 3, icon: gearIcon, matches: 'settings' },
];

export default function SideIcon(props) {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, selectedDashboard, isOpenSide } = useAppSelector((s) => s.auth);
  const listIconSide =
    (isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN
      ? iconListAdmin
      : iconListClient;

  const handleSideIconClick = (matches) => {
    if (['drawer'].includes(matches)) {
      props.parentCallback(true);
    } else if (['settings'].includes(matches)) {
      props.parentCallback(true);
      dispatch(handleSettingIconClick(true));
    } else {
      navigate(`/${matches}`);
    }
  };

  useEffect(() => {
    if (!isOpenSide) {
      dispatch(handleSettingIconClick(false));
    }
  }, [isOpenSide]);

  return (
    <div className={styles.side_icon}>
      <List className={styles.list_icon}>
        {listIconSide.map(({ key, icon, matches }) => (
          <List.Item
            className={`${styles.icon_item} ${
              pathname.split('/')[1] === matches ? styles.active : ''
            }`}
            key={key}
            // onClick={() => navigate(`/${matches}`)}
            onClick={() => handleSideIconClick(matches)}
          >
            <img src={icon} />
          </List.Item>
        ))}
      </List>
    </div>
  );
}
