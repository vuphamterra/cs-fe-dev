import styles from './index.module.scss';
import { Button, Input, Modal } from 'antd';
import auditTrailSetting from '~/assets/images/audit_trail_setting.png';

interface SecureModalProps {
  open: boolean;
  setOpen: (value: any) => void;
}

const SecureModal = (props: SecureModalProps) => {
  const { open, setOpen } = props;

  const modalTitle = (
    <div className={styles.modal_title}>
      <img src={auditTrailSetting} />
      <p>Add Secure Path</p>
    </div>
  );
  const modalActions = (
    <div className={styles.buttons_container}>
      <Button onClick={() => setOpen(false)} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button onClick={() => setOpen(false)} className={styles.apply_btn}>
        Apply
      </Button>
    </div>
  );

  return (
    <Modal
      className={`${styles.secure_modal} audit_trail_setting audit_trail_close_btn secure_modal`}
      title={modalTitle}
      open={open}
      onCancel={() => setOpen(false)}
      footer={modalActions}
      centered
    >
      <div className={styles.modal_body}>
        <div>
          <p className={styles.main_title}>Source Path</p>
          <Input size="large" placeholder="Enter source path" />
          <p className={styles.sub_title}>
            Enter a UNC path to the network share. For example: \\server\share
          </p>
          <p className={styles.main_title}>Authentication Account</p>
        </div>
        <div className={styles.account}>
          <p className={styles.main_title}>Domain\User</p>
          <Input size="large" placeholder="Enter domain" />
          <p className={styles.main_title}>Password</p>
          <Input size="large" placeholder="Enter password" />
          <p className={styles.main_title}>Confirm Password</p>
          <Input size="large" placeholder="Enter confirm password" />
        </div>
      </div>
    </Modal>
  );
};
export default SecureModal;
