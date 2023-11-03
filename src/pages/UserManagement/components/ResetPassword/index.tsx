import { Button, Modal } from 'antd';
import { Lock as LockIcon } from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { resetUserPassword } from '~/store/UserSlice';
import styles from './ResetPassword.module.scss';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const ResetPasswordModal = (props: ModalProps) => {
  const { open, setOpen } = props;
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.user.loading);
  const userId = useAppSelector((s) => s.user.selectedUserId);

  const headModal = (
    <div className={styles.modal_title}>
      <div className={styles.icon}>
        <LockIcon width={24} height={24} fill="" />
      </div>
      <p>Reset Password</p>
    </div>
  );

  const handleResetPassword = () => {
    dispatch(resetUserPassword(userId));
    setOpen(false);
  };

  const defaultPass = 'P@ssw0rd';

  return (
    <Modal
      className={styles.modal_reset_password}
      title={headModal}
      centered
      open={open}
      onCancel={() => setOpen(false)}
      destroyOnClose
      footer={[
        <Button className={styles.btn_cancel} key="back" onClick={() => setOpen(false)}>
          Cancel
        </Button>,
        <Button
          className={styles.btn_delete}
          key="submit"
          loading={loading}
          onClick={handleResetPassword}
        >
          Confirm
        </Button>,
      ]}
    >
      <p className={styles.modal_body}>
        Password will be reset into <span>{`"${defaultPass}"`}</span>. Are you sure you want to
        continue?
      </p>
    </Modal>
  );
};

export default ResetPasswordModal;
