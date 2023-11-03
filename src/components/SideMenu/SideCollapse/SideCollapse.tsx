/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable multiline-ternary */
import { useEffect, useState } from 'react';
import { Button, List, Menu } from 'antd';
import styles from './styles.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '~/store/hooks';
import arrowUp from '~/assets/images/sidebar_arrow_up.png';
import arrowDown from '~/assets/images/sidebar_arrow_down.png';

interface SideProps {
  routes: any;
  id: string;
}

const SideCollapse = (props: SideProps) => {
  const { routes, id } = props;
  const { pathname } = useLocation();
  const [openCollapse, setOpenCollapse] = useState<boolean>(false);
  const { name, icon, route, matches, sub } = routes.filter((i) => i.key === id)[0];
  const havSubNav = ['/settings'];
  const active = pathname.includes(matches);
  const subMatch = sub?.map((i) => i.matches);
  const activeSubMatch = subMatch?.includes(pathname.split('/')[2]);
  const navigate = useNavigate();
  const { isOpenSide, isSettingIconClicked } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (activeSubMatch) {
      setOpenCollapse(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpenSide && isSettingIconClicked) {
      setOpenCollapse(true);
    }
  }, [isOpenSide, isSettingIconClicked]);

  return (
    <List className={`${styles.list_nav_side}`}>
      {!havSubNav.includes(route) ? (
        <div
          className={`${styles.list_item} ${active ? styles.active_item : ''}`}
          onClick={() => navigate(`${route}`)}
        >
          {icon && <img src={icon} />}
          <List.Item>{name}</List.Item>
        </div>
      ) : (
        <div
          className={`${styles.list_item_havsub}`}
          onClick={() => setOpenCollapse((prev) => !prev)}
        >
          {icon && <img src={icon} />}
          <List.Item>{name}</List.Item>
          {Array.isArray(sub) && sub.length > 0 && (
            <Button
              style={{ marginRight: '-24px', boxShadow: 'none' }}
              icon={
                openCollapse ? (
                  <img src={arrowUp} alt="" onClick={() => setOpenCollapse((prev) => !prev)} />
                ) : (
                  <img src={arrowDown} alt="" onClick={() => setOpenCollapse((prev) => !prev)} />
                )
              }
              onClick={() => setOpenCollapse((prev) => !prev)}
            />
          )}
        </div>
      )}
      {Array.isArray(sub) && openCollapse && (
        <Menu className={`${styles.list_sub_menu}`}>
          {sub.map(({ key, name, route, matches }) => (
            <Menu.Item
              className={`${styles.sub_item} ${pathname.split('/')[2] === matches ? styles.list_sub_menu_active : ''
                }`}
              key={key}
              onClick={() => navigate(route)}
            >
              {name}
            </Menu.Item>
          ))}
        </Menu>
      )}
    </List>
  );
};
export default SideCollapse;
