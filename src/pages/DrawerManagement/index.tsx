/* eslint-disable multiline-ternary */
/* eslint-disable camelcase */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import updownimg from '~/assets/images/up-down.png';
import { Plus } from '~/components/Icons';
import {
  getDrawerData,
  getDrawerDetail,
  setSelectedDrawerId,
  updateMessage,
} from '~/store/DrawerSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import notification from '~/utils/notification';
import BulkImportModal from './BulkImport';
import styles from './DrawerManagement.module.scss';
import DrawerDetail from './components/DrawerDetail';

const DrawerManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  let drawers = useAppSelector((s) => s.draw.drawers);
  const [nameAsc, setNameAsc] = useState<boolean>(false);
  const [dateAsc, setDateAsc] = useState<boolean>(false);
  const [isSortByName, setIsSortByName] = useState<boolean>(false);
  const [openBulkImport, setOpenBulkImport] = useState<boolean>(false);
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer) || null;
  const { message } = useAppSelector((store) => store.draw);
  const [searchKey, setSearchKey] = useState<string>('');

  useEffect(() => {
    if (message) {
      notification[message.type]({ message: message.title, description: message.text });
      dispatch(updateMessage(null));
    }
  }, [message]);

  useEffect(() => {
    if (currentDrawer && currentDrawer.id) {
      dispatch(setSelectedDrawerId(currentDrawer.id));
    }
  }, [currentDrawer]);

  useEffect(() => {
    dispatch(getDrawerData({})).then((response) => {
      const {
        payload: { payload },
      } = response;
      const { data } = payload;
      if (Array.isArray(data) && data.length) {
        let drawerId = data[0].id;
        if (currentDrawer) {
          drawerId = currentDrawer.id;
        }
        dispatch(getDrawerDetail({ id: drawerId }));
      }
    });
  }, []);

  const onDrawerClick = (drawerId) => {
    dispatch(setSelectedDrawerId(drawerId));
    dispatch(getDrawerDetail({ id: drawerId }));
  };

  const sortByName = () => {
    setNameAsc(!nameAsc);
    setIsSortByName(true);
  };

  const sortByDate = () => {
    setDateAsc(!dateAsc);
    setIsSortByName(false);
  };

  if (isSortByName) {
    drawers = nameAsc
      ? [...drawers].sort((a, b) => (a.name > b.name ? 1 : -1))
      : [...drawers].sort((a, b) => (b.name > a.name ? 1 : -1));
  } else {
    drawers = dateAsc
      ? [...drawers].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      : [...drawers].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }

  const searchDrawerList = useMemo(() => {
    let searchList = [...drawers];
    if (searchKey !== '') {
      searchList = searchList.filter((i) => i.name.toLowerCase().includes(searchKey.toLowerCase()));
    }
    return searchList;
  }, [drawers, searchKey]);

  return (
    <div className="scroll_content">
      <div className="bg__row">
        <BulkImportModal open={openBulkImport} setOpen={() => setOpenBulkImport(false)} />
        <div className="d-flex justify-content-between px-0">
          <div>
            <h4 className={styles.page_title}>Drawer Management</h4>
            <p className={styles.page_desc}>Manage drawer in your organization.</p>
          </div>
          <div className="d-flex align-items-center">
            <Button
              className={['btn-blue', styles.createBtn].join(' ')}
              onClick={() => navigate('create-drawer')}
              icon={<Plus width={16} height={16} fill="" style={{ display: 'block' }} />}
            >
              Create New Drawer
            </Button>
            {currentDrawer && (
              <Button
                icon={<DownloadOutlined size={24} />}
                className={['btn-blue', styles.import_folder_button].join(' ')}
                onClick={() => setOpenBulkImport(true)}
              >
                Import Folder
              </Button>
            )}
          </div>
        </div>
        <hr className="my-3" />
        <Row>
          <Col span={6}>
            <div>
              <Input
                autoFocus
                placeholder="Search"
                suffix={<SearchOutlined />}
                size="large"
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
            <div className={`pt-md-3 ${styles.drawer_list_section}`}>
              <div className={styles.headers}>
                <div className="d-flex align-items-center padding__drawer gap-2">
                  <p className="mb-0 p_secondary">Drawers</p>
                  <img className={styles.clickable} src={updownimg} alt="" onClick={sortByName} />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <p className="mb-0 p_secondary">Create Date</p>
                  <img className={styles.clickable} src={updownimg} alt="" onClick={sortByDate} />
                </div>
              </div>
              <div className={`${styles.list} scroll_content`}>
                {drawers.length === 0 ? (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>No data found!</div>
                ) : searchDrawerList.length === 0 ? (
                  searchKey.trim().length === 0 ? (
                    Array.isArray(drawers) &&
                    drawers.map(({ id, name, created_at }) => (
                      <div
                        className={`d-flex d-flex justify-content-between ${styles.clickable} ${
                          id === currentDrawer.id ? styles.activeItem : ''
                        }`}
                        key={id}
                        onClick={() => onDrawerClick(id)}
                      >
                        <p className="mb-0 p_normal_txt">
                          {_.truncate(name, { length: 30, omission: ' ...' })}
                        </p>
                        <p className="mb-0 p_normal_txt">
                          {moment(String(created_at)).format('MM/DD/YYYY')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>No data found!</div>
                  )
                ) : (
                  Array.isArray(searchDrawerList) &&
                  searchDrawerList.map(({ id, name, created_at }) => (
                    <div
                      className={`d-flex d-flex justify-content-between ${styles.clickable} ${
                        currentDrawer && id === currentDrawer.id ? styles.activeItem : ''
                      }`}
                      key={id}
                      onClick={() => onDrawerClick(id)}
                    >
                      <p className="mb-0 p_normal_txt">
                        {_.truncate(name, {
                          length: Math.round(window.innerWidth / 72),
                          omission: ' ...',
                        })}
                      </p>
                      <p className="mb-0 p_normal_txt">
                        {moment(String(created_at)).format('MM/DD/YYYY')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Col>
          <Col span={18}>
            <DrawerDetail />
          </Col>
        </Row>
      </div>

      {/* <Outlet /> */}
    </div>
  );
};

export default DrawerManagement;
