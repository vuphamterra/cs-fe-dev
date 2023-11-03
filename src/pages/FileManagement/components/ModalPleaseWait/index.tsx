import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Modal, Progress } from 'antd';
import ClosedIcon from '~/assets/images/fileManagement/ic_closed.svg';

interface Props {
  visible: boolean;
  progress: number;
  setVisible: (value: boolean) => void;
}

const ModalPleaseWait = (props: Props) => {
  const { visible = false, setVisible = () => { }, progress = 10 } = props;

  const onCancel = () => setVisible(false);

  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      wrapClassName={styles.ModalPleaseWait}
      closeIcon={<img src={ClosedIcon as any} alt="closedIcon" />}
      // onOk={handleImport}
      width={700}
      // onCancel={onCancel}
      open={visible}
      title="Please wait to check runtime..."
      maskClosable
      destroyOnClose
      centered
      closable={false}
      footer={[]}
    // footer={
    //   <div className="footer">
    //     <CustomButton onHandleClick={onCancel} text="Cancel" color="#384250" />
    //     <CustomButton
    //       onHandleClick={handleImport}
    //       text="Remove"
    //       color="#F7F8FA"
    //       backgroundColor="#FF3B30"
    //     />
    //   </div>
    // }
    >
      <Progress
        percent={+progress.toFixed(1)}
        status="active"
        strokeColor={{ from: '#4B00FC', to: '#D2D6DB' }}
      />
    </Modal>
  );
};

export default ModalPleaseWait;
