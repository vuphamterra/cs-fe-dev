import { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import styles from './styles.module.scss';

import lockImg from '~/assets/images/lock_img.png';
import { useAppDispatch } from '~/store/hooks';
import { changePasswordUser } from '~/store/UserSlice';
import notification from '~/utils/notification';

interface ModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  userId: number;
}

interface ChangePassObj {
  currentPassword: string;
  newPassword: string;
  confirmPass: string;
}

const ChangePassModal = (props: ModalProps) => {
  const { open, setOpen, userId } = props;
  const dispatch = useAppDispatch();
  const [changePass, setChangePass] = useState<ChangePassObj>({
    currentPassword: '',
    newPassword: '',
    confirmPass: '',
  });
  const { currentPassword, newPassword, confirmPass } = changePass;
  const checkFormVal = Object.values(changePass).every((val) => Boolean(val));

  const handleInputChange = (event: any) => {
    setChangePass({ ...changePass, [event.target.name]: event.target.value });
  };

  const handleChangePassword = () => {
    const reqData = {
      id: userId as number,
      currentPassword,
      newPassword,
    };
    dispatch(changePasswordUser(reqData)).then((res) => {
      const { payload } = res;
      if (payload && payload.statusCode === 200) {
        notification.success({ message: 'Change Password Successful!' });
        handleCloseModal();
      } else {
        notification.error({ message: 'Change Password Failed!', description: '' });
      }
    });
  };

  const handleCloseModal = () => {
    setOpen(false);
    setChangePass({
      currentPassword: '',
      newPassword: '',
      confirmPass: '',
    });
  };

  const modalTitle = (
    <div className={styles.modal_header}>
      <img src={lockImg} />
      <div>
        <p className={styles.title}>Change Password</p>
        <p className={styles.sub_title}>Re-enter your authentication to change to new password.</p>
      </div>
    </div>
  );

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={handleCloseModal} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button
        disabled={!checkFormVal || newPassword !== confirmPass}
        className={styles.export_btn}
        onClick={handleChangePassword}
      >
        Confirm
      </Button>
    </div>
  );

  return (
    <Modal
      className={styles.change_pass_modal}
      open={open}
      onCancel={handleCloseModal}
      centered
      title={modalTitle}
      footer={modalActions}
    >
      <div className={styles.modal_body}>
        <Form layout="vertical">
          <Form.Item
            label="New Password"
            name="Password"
            rules={[
              { required: true, message: 'Please enter Password!' },
              { type: 'string', min: 8 },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter new password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => handleInputChange(e)}
            />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="Confirm password"
            rules={[
              {
                required: true,
                message: 'Please confirm password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('Password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Must exactly match with "Password"'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Re-enter password"
              name="confirmPass"
              value={confirmPass}
              onChange={(e) => handleInputChange(e)}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
export default ChangePassModal;
