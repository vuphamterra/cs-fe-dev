/* eslint-disable multiline-ternary */
import { useEffect, useState } from 'react';
import { Col, Row, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import createDrawer from '~/assets/images/create_drawer_img.png';
import createUser from '~/assets/images/create_user_img.png';
import generateReport from '~/assets/images/generate_report.png';
import importFolder from '~/assets/images/import_folder_img.png';
import { getDashboardData } from '~/store/DashboardSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import BulkImportModal from '../DrawerManagement/BulkImport';
import { getDrawerData, getDrawerDetail, updateMessage } from '~/store/DrawerSlice';
import notification from '~/utils/notification';
import {
  DownloadFolder as DownloadFolderIcon,
  Folder as FolderIcon,
  People as UserIcon,
} from '~/components/Icons';
import styles from './styles.module.scss';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.dashboard.loading);
  const drawers = useAppSelector((s) => s.dashboard.drawers);
  const folders = useAppSelector((s) => s.dashboard.folders);
  const users = useAppSelector((s) => s.dashboard.users);
  const { message } = useAppSelector((store) => store.draw);
  const [bulkImport, setBulkImport] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getDashboardData());
    dispatch(getDrawerData({})).then((response) => {
      const {
        payload: { payload },
      } = response;
      const { data } = payload;
      if (Array.isArray(data) && data.length) {
        dispatch(getDrawerDetail({ id: data[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    if (message) {
      notification[message.type]({ message: message.title, description: message.text });
      dispatch(updateMessage(null));
    }
  }, [message]);

  return (
    <div className={`${styles.dashboard_sec} scroll_content`}>
      <BulkImportModal open={bulkImport} setOpen={() => setBulkImport(false)} />
      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : (
        <div className={styles.dashboard_container}>
          <div className={styles.dashboard_statistics}>
            <h4 style={{ marginTop: '10px' }}>Statistics</h4>
            <p>Overview statistics of your usage.</p>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div className={styles.card_content_statistic}>
                  <div className={styles.icon}>
                    <DownloadFolderIcon width={24} height={24} fill="" />
                  </div>
                  <h3>{drawers}</h3>
                  <p>{`Number of Drawer${+drawers > 1 ? 's' : ''}`}</p>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.card_content_statistic}>
                  <div className={styles.icon}>
                    <FolderIcon width={24} height={24} fill="" />
                  </div>
                  <h3>{folders}</h3>
                  <p>{`Number of Folder${+folders > 1 ? 's' : ''}`}</p>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.card_content_statistic}>
                  <div className={styles.icon}>
                    <UserIcon width={24} height={24} fill="" />
                  </div>
                  <h3>{users}</h3>
                  <p>{`Number of User${+users > 1 ? 's' : ''}`}</p>
                </div>
              </Col>
            </Row>
          </div>
          {/* Quick Actions */}
          <div className={styles.dashboard_quick_action}>
            <h4>Quick Action</h4>
            <p>Quick shortcuts for your actions.</p>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={6}>
                <div
                  className={styles.card_content_quick}
                  onClick={() => navigate('/drawer-management/create-drawer')}
                >
                  <img src={createDrawer} />
                  <h6>Create New Drawer</h6>
                </div>
              </Col>
              <Col span={6}>
                <div
                  className={styles.card_content_quick}
                  onClick={() => navigate('/user-management/new')}
                >
                  <img src={createUser} />
                  <h6>Create New User</h6>
                </div>
              </Col>
              <Col span={6}>
                <div className={styles.card_content_quick} onClick={() => setBulkImport(true)}>
                  <img src={importFolder} />
                  <h6>Import Folder</h6>
                </div>
              </Col>
              <Col span={6}>
                <div
                  className={styles.card_content_quick}
                  onClick={() => navigate('/settings/preferences-settings')}
                >
                  <img src={generateReport} />
                  <h6>Generate Audit Report</h6>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}
