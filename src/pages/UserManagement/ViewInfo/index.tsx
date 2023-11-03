/* eslint-disable multiline-ternary */
/* eslint-disable camelcase */
import moment from 'moment';
import { useEffect, useState } from 'react';

import { Button, Col, Input, Row, Spin, Switch, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditFilled } from '@ant-design/icons';

import editDesc from '~/assets/images/edit_note.png';
import noData from '~/assets/images/nodata.svg';
import styles from './styles.module.scss';
import DeleteUserModal from '../components/DeleteUserModal';
import ResetPasswordModal from '../components/ResetPassword';

import { getUserById, updateUser, updateUserRole } from '~/store/UserSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { updateDescCurrentUser } from '~/store/AuthSlice';

const UserInfo = () => {
  const dispatch = useAppDispatch();
  const [editDes, setEditDes] = useState<boolean>(false);
  const [desc, setDesc] = useState<string>('');
  const [deleteUser, setDeleteUser] = useState<boolean>(false);
  const [resetPassword, setResetPassword] = useState<boolean>(false);
  const userInfo = useAppSelector((s) => s.user.user) || null;
  const currentUser = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.user.loading);

  useEffect(() => {
    if (userInfo !== null) {
      setDesc(userInfo?.description);
    }
  }, [userInfo]);

  const handleEditDescription = (id: any) => {
    const params = { id, description: desc };
    dispatch(updateUser(params)).then((res) => {
      const {
        payload: { payload },
      } = res;
      if (id === currentUser.id) {
        dispatch(updateDescCurrentUser(payload.description));
      }
      dispatch(getUserById(id));
      setEditDes(false);
      setDesc(desc);
    });
  };

  const handleUpdateUserRole = () => {
    const reqData = {
      userId: userInfo.id,
      roleId: userInfo?.roles?.length === 2 ? [3] : [2, 3],
    };
    dispatch(updateUserRole(reqData)).then(() => {
      dispatch(getUserById(userInfo.id));
    });
  };

  return (
    <div className={styles.user_info_comp}>
      <DeleteUserModal open={deleteUser} setOpen={() => setDeleteUser(false)} />
      <ResetPasswordModal open={resetPassword} setOpen={() => setResetPassword(false)} />
      <Spin spinning={loading}>
        <div className={styles.title}>
          <p style={{ fontSize: '18px' }}>User Information</p>
          {userInfo !== null && (
            <div className={styles.btn_group}>
              <Button
                icon={<EditFilled />}
                onClick={() => setResetPassword(true)}
                disabled={userInfo?.id === undefined}
              >
                Reset Password
              </Button>
              <Tooltip title="This action can only be performed on User with no administrator permissions.">
                <Button
                  className={styles.btn_delete}
                  icon={<DeleteOutlined />}
                  onClick={() => setDeleteUser(true)}
                  disabled={
                    userInfo?.id === undefined ||
                    userInfo?.id === currentUser.id ||
                    userInfo?.roles?.map((i) => i.code).includes('ADMIN')
                  }
                />
              </Tooltip>
            </div>
          )}
        </div>
        <div className={styles.user_details}>
          {userInfo !== null ? (
            <>
              <Row>
                <Col span={8}>
                  <p>Username</p>
                </Col>
                <Col span={16}>
                  <p>{userInfo?.username || 'No data'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <p>Email</p>
                </Col>
                <Col span={16}>
                  <p>{userInfo?.email || 'No data'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <p>Description</p>
                </Col>
                <Col span={16}>
                  {editDes ? (
                    <div className={styles.edit_description}>
                      <Input.TextArea
                        maxLength={200}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                      <Button
                        className={styles.ibtn_confirm}
                        icon={<CheckOutlined />}
                        shape="circle"
                        onClick={() => handleEditDescription(userInfo?.id)}
                        disabled={userInfo?.id === undefined}
                      />
                      <Button
                        className={styles.ibtn_cancel}
                        icon={<CloseOutlined />}
                        shape="circle"
                        onClick={() => {
                          setEditDes(false);
                          setDesc(userInfo.description);
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.user_description}>
                      <p>
                        {userInfo?.description || 'No description'}
                        <span>
                          <img
                            style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                            src={editDesc}
                            onClick={() => setEditDes(true)}
                          />
                        </span>
                      </p>
                    </div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <p>Created date</p>
                </Col>
                <Col span={16}>
                  <p>
                    {moment(userInfo?.created_at?.split('T')[0]).format('MM/DD/YYYY') || 'No data'}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <p>Administrator permissions</p>
                </Col>
                <Col span={16}>
                  <div className={styles.user_administrator}>
                    <Switch
                      checked={userInfo?.roles?.length === 2}
                      onChange={handleUpdateUserRole}
                      disabled={userInfo?.roles?.length === undefined}
                      className={`${styles.switch_buton} ${
                        userInfo?.roles?.length === 2 ? '' : styles.switch_off
                      }`}
                    />
                    <span className={styles.switch_text}>
                      {userInfo?.roles?.length === 2 ? 'Yes' : 'No'}
                    </span>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <div className={styles.nodata_user}>
              <img src={noData} />
              <p>No data. Please proceed to Create New User</p>
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};
export default UserInfo;
