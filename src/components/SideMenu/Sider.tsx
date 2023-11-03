/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Collapse, List, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { adminRoutes, clientRoutes } from './routes';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { DASHBOARD } from '~/constants';
import SideCollapse from './SideCollapse/SideCollapse';
import { getDrawerDetail } from '~/store/DrawerSlice';
import styles from './styles.module.scss';

const { Panel } = Collapse;

const SiderBar = (props) => {
  const { activeId } = useParams();
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();
  const { isSuperAdmin, isAdmin, selectedDashboard } = useAppSelector((s) => s.auth);
  const { drawers, loading: loadingDrawer, currentDrawer } = useAppSelector((store) => store.draw);
  const routes =
    (isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN ? adminRoutes : clientRoutes;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (drawers.length && !currentDrawer) {
      const { id } = drawers[0] || {};
      if (id) {
        appDispatch(getDrawerDetail({ id }));
      }
    }
  }, [drawers]);

  const renderRoutes = routes.map(({ key }) => {
    return <SideCollapse key={key} id={key} routes={routes} />;
  });

  const onChange = (key: string | string[]) => {
    setIsCollapsed(!key.length);
  };

  const onSelectDrawer = ({ id }: { id: number }) => {
    if (activeId) {
      navigate('/folder-management');
    }
    appDispatch(getDrawerDetail({ id }));
  };

  return (
    <Fragment>
      {selectedDashboard === DASHBOARD.CLIENT && (
        <div className={`${styles.side_bar_collapse} side_collapse_drawer`}>
          {isCollapsed && loadingDrawer && (
            <div className={styles.spinner_container}>
              <Spin />
            </div>
          )}
          <Collapse
            className={styles.collapse_drawer}
            onChange={onChange}
            expandIconPosition="end"
            size="large"
            defaultActiveKey={1}
          >
            <Panel
              className={styles.collapse_panel}
              header={
                currentDrawer
                  ? _.truncate(currentDrawer.name, { length: 25, omission: ' ...' })
                  : '-- No Drawer --'
              }
              key="1"
            >
              <List className={styles.list_drawer}>
                {drawers.map(({ id, name }) => (
                  <List.Item
                    className={styles.list_drawer_item}
                    key={id}
                    onClick={() => onSelectDrawer({ id })}
                  >
                    {_.truncate(name, { length: 25, omission: ' ...' })}
                    {currentDrawer && name === currentDrawer.name && <CheckOutlined />}
                  </List.Item>
                ))}
              </List>
            </Panel>
          </Collapse>
        </div>
      )}

      <div style={{ paddingInline: 16 }}>{renderRoutes}</div>
    </Fragment>
  );
};
export default SiderBar;
