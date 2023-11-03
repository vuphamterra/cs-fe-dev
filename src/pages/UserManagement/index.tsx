/* eslint-disable multiline-ternary */
import { Button, Col, Input, Row, theme } from 'antd';
import styles from './styles.module.scss';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import updownimg from '~/assets/images/up-down.png';
import { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import UserInfo from './ViewInfo';
import ModalCreateUser from './components/ModalCreateUser';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import {
  getListPermission,
  getListUser,
  getUserById,
  getUserPermission,
  handleSelectUserId,
  handleSortByCreateDate,
  handleSortByName,
  resetMessage,
} from '~/store/UserSlice';
import UserPermission from './UserPermission';
import notification from '~/utils/notification';
import { useParams } from 'react-router-dom';

const { useToken } = theme;

export default function UserManagement() {
  const { token: themeToken } = useToken();
  const { userId } = useParams();
  const [createUser, setCreateUser] = useState<boolean>(userId && userId === 'new');
  const [sortByName, setSortByName] = useState<boolean>(false);
  const [sortByDate, setSortByDate] = useState<boolean>(true);
  const [searchKey, setSearchKey] = useState<string>('');
  const listUser = useAppSelector((s) => s.user.listUser);
  const selectedUserId = useAppSelector((s) => s.user.selectedUserId);
  const errMessage = useAppSelector((s) => s.user.message);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (errMessage) {
      notification[errMessage.type](errMessage);
      dispatch(resetMessage());
    }
  }, [errMessage]);

  useEffect(() => {
    dispatch(getListUser()).then((response) => {
      const {
        payload: { payload },
      } = response;
      const { data } = payload;
      if (data.length > 0) {
        dispatch(getUserPermission(data[0].id));
        dispatch(getUserById(data[0].id));
      }
    });
    dispatch(getListPermission({ skip: 0, take: 11 }));
  }, []);

  const handleClickUserItem = (id: any) => {
    dispatch(handleSelectUserId(id));
    dispatch(getUserById(id));
    dispatch(getUserPermission(id));
  };

  const handleSortByUserName = () => {
    setSortByName((prev) => !prev);
    dispatch(handleSortByName(sortByName));
  };

  const handleSortByDate = () => {
    setSortByDate((prev) => !prev);
    dispatch(handleSortByCreateDate(sortByDate));
  };

  const list = useMemo(() => {
    let searchList = [...listUser];
    if (searchKey !== '') {
      searchList = searchList.filter((i) =>
        i.username.toLowerCase().includes(searchKey.toLowerCase()),
      );
    }
    return searchList;
  }, [listUser, searchKey]);

  return (
    <div className={`${styles.user_management_sec} scroll_content`}>
      <div className={styles.user_container}>
        <ModalCreateUser open={createUser} setOpen={() => setCreateUser(false)} />
        <div className={styles.user_head}>
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '20px', lineHeight: '30px' }}>
              User Management
            </h4>
            <p>Manage users and their permissions.</p>
          </div>
          <div className={styles.btn_create_user}>
            <Button icon={<PlusOutlined />} onClick={() => setCreateUser(true)}>
              Create New User
            </Button>
          </div>
        </div>
        <hr />
        <Row className={styles.user_body}>
          <Col className={styles.user_list} span={6}>
            <div className={styles.wrap_user_list}>
              <div className={styles.search_user}>
                <Input
                  autoFocus
                  placeholder="Search"
                  suffix={<SearchOutlined />}
                  size="large"
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
              <div className={styles.list_user}>
                <div className={styles.head_list_user}>
                  <p>
                    Account Name
                    <span onClick={handleSortByUserName}>
                      {sortByName ? <img src={updownimg} /> : <img src={updownimg} />}
                    </span>
                  </p>
                  <p>
                    Create Date
                    <span onClick={handleSortByDate}>{<img src={updownimg} />}</span>
                  </p>
                </div>
                <div className={styles.list}>
                  {listUser.length > 0 ? (
                    list.length === 0 ? (
                      searchKey.trim().length === 0 ? (
                        Array.isArray(listUser) &&
                        listUser.map((i) => (
                          <div
                            className={styles.list_item}
                            style={{
                              backgroundColor:
                                selectedUserId === i?.id ? themeToken.colorPrimaryBg : '',
                            }}
                            key={i?.id}
                            onClick={() => handleClickUserItem(i?.id)}
                          >
                            <span className="username">{i?.username}</span>
                            <p className="p_normal_txt mb-0">
                              {moment(i?.created_at.split('T')[0]).format('MM/DD/YYYY')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>No data found!</div>
                      )
                    ) : (
                      Array.isArray(list) &&
                      list.map((i) => (
                        <div
                          className={styles.list_item}
                          style={{
                            backgroundColor:
                              selectedUserId === i?.id ? themeToken.colorPrimaryBg : '',
                          }}
                          key={i?.id}
                          onClick={() => handleClickUserItem(i?.id)}
                        >
                          <span className="username">{i?.username}</span>
                          <p className="p_normal_txt mb-0">
                            {moment(i?.created_at.split('T')[0]).format('MM/DD/YYYY')}
                          </p>
                        </div>
                      ))
                    )
                  ) : (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>No data found!</div>
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col className={styles.user_infomation} span={18}>
            <>
              <UserInfo />
              <div className="dotted_underline mt-4"></div>
              <UserPermission userId={selectedUserId} />
            </>
          </Col>
        </Row>
      </div>
    </div>
  );
}
