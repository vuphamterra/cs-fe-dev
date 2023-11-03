/* eslint-disable camelcase */
import { useEffect, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Pencil, SignOut, NotepadEdit, VCheck, X } from '~/components/Icons';
import ChangePasswordModal from './components/ChangePasswordModal';
import LogoutModal from '~/components/LogoutModal';
import notification from '~/utils/notification';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { getUserById, resetMessage, updateUser } from '~/store/UserSlice';
import { updateDescCurrentUser } from '~/store/AuthSlice';
import styles from './AccountSetting.module.scss';

const AccountSetting = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const { id, username, email, description, created_at } = currentUser || {};
  const errMessage = useAppSelector((s) => s.user.message);
  const loading = useAppSelector((s) => s.user.loading);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userDesc, setUserDesc] = useState(description);
  const [editingDesc, setEditingDesc] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (errMessage) {
      notification[errMessage.type](errMessage);
      dispatch(resetMessage());
    }
  }, [errMessage]);

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleChangeDescription = (event: any) => {
    setUserDesc(event.target.value);
  };

  const handleSavingDescription = () => {
    dispatch(updateUser({ id, description: userDesc === '' ? 'No description' : userDesc })).then(
      (res) => {
        const {
          payload: { payload, statusCode },
        } = res;
        if (statusCode === 200) {
          dispatch(updateDescCurrentUser(payload.description));
          dispatch(getUserById(id));
        }
      },
    );
    setEditingDesc(false);
  };

  const handleCancelEditingDescription = () => {
    setUserDesc(description);
    setEditingDesc(false);
  };

  return (
    <div className={styles.container}>
      <div className="d-flex justify-content-between">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: '20px',
              margin: '0px',
            }}
          >
            Account Settings
          </p>
        </div>
        {loading && <Spin />}
        <div className={styles.buttons}>
          <Button
            className="btn-blue btn d-flex align-items-center"
            icon={<Pencil width={16} height={16} fill="#ffffff" />}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
          <Button
            className="d-flex justify-content-center align-items-center"
            shape="circle"
            icon={<SignOut width={15} height={14} fill="" />}
            onClick={handleLogout}
          />
        </div>
      </div>
      <div>
        <hr />
      </div>
      <div className={styles.profile}>
        <div className={styles.avatar_section}>
          <div className="d-flex justify-content-center">
            <div className={`${styles.user_icon}`}>
              <UserOutlined />
            </div>
          </div>
          {/* <div className={styles.avatar_actions}>
            <Button className="btn-blue btn">Upload</Button>
            <Button className="btn_outline_primary">Remove</Button>
          </div> */}
        </div>
        <div className={styles.info_section}>
          <div>
            <div>Username</div>
            <div>{username}</div>
          </div>
          <div>
            <div>Email</div>
            <div>{email}</div>
          </div>
          <div>
            <div>Description</div>
            <div>
              {!editingDesc && (
                <div className={styles.user_desc}>
                  <div>
                    {userDesc}
                    <Button
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        height: '100%',
                        padding: '0',
                      }}
                      shape="circle"
                      icon={<NotepadEdit width={14} height={14} fill="" />}
                      onClick={() => setEditingDesc(true)}
                    />
                  </div>
                  <div></div>
                </div>
              )}
              {editingDesc && (
                <div className={styles.user_desc_edit_area}>
                  <div>
                    <Input.TextArea
                      rows={4}
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      value={userDesc}
                      onChange={(e) => handleChangeDescription(e)}
                      maxLength={200}
                      showCount
                    />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <Button
                      shape="circle"
                      icon={<VCheck width={16} height={16} fill="" />}
                      onClick={handleSavingDescription}
                    />
                    <Button
                      shape="circle"
                      icon={<X width={16} height={16} fill="" />}
                      onClick={handleCancelEditingDescription}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div>Created date</div>
            <div>{moment(created_at?.split('T')[0]).format('MM/DD/YYYY') || 'No data'}</div>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onCancel={(value) => setShowChangePasswordModal(value)}
        onOk={() => {
          notification.success({
            message: 'Changed password successful',
            description: 'Password of user Tom Tran has been successfully changed.',
          });
          setShowChangePasswordModal(false);
        }}
      />
      <LogoutModal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} />
    </div>
  );
};

export default AccountSetting;
