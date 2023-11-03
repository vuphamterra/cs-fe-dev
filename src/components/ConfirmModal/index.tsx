import type { FC, ReactNode } from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd/es/modal';
import styles from './ConfirmModal.module.scss';

interface Props extends ModalProps {
  headerIcon: ReactNode;
  headerTitle: string;
  isOpen: boolean;
  handleOk: (data?: any) => void;
  handleCancel: (data: any) => void;
}

const ConfirmModal: FC<Props> = (props) => {
  const renderTitle = () => {
    return (
      <div className={`cs_modal_header ${styles.header}`}>
        <div className={`cs_modal_header_icon ${styles.icon}`}>{props.headerIcon}</div>
        <div className={`cs_modal_header_title ${styles.title}`}>{props.headerTitle}</div>
      </div>
    );
  };
  return (
    <Modal
      {...props}
      title={renderTitle()}
      open={props.isOpen}
      onOk={props.handleOk}
      onCancel={props.handleCancel}
      className={styles.confirm_modal}
    >
      {props.children}
    </Modal>
  );
};

export default ConfirmModal;
