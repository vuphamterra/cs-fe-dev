import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Modal } from 'antd';
import ClosedIcon from '~/assets/images/fileManagement/ic_closed.svg';

import {
  CheckCircleOutlined,
  DownloadOutlined,
  PauseCircleOutlined,
  PauseCircleTwoTone,
  PauseOutlined,
  WarningFilled,
} from '@ant-design/icons';
import axios from 'axios';
interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
}
function ModalErrorRuntime(props: Props) {
  const { visible = false, setVisible = () => {} } = props;
  const [progress, setProgress] = useState({ windows: 0, macs: 0 });
  const getFileRuntime = async (type: string) => {
    setProgress({ ...progress, [type]: 1 });
    await axios
      .get(`${process.env.REACT_APP_BASE_URL}/software?os=${type}`, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const currentPercent: any = progressEvent.progress * 100;
          const newData = { ...progress, [type]: currentPercent };
          setProgress(newData);
        },
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'PixToolsForWeb.zip');
        link.click();
      });
  };

  const onCancel = () => setVisible(false);
  const title = (
    <div className={styles.title}>
      <WarningFilled />
      <p>Run Time Error</p>
    </div>
  );
  return (
    <Modal
      bodyStyle={{ padding: '0 18px 18px 18px' }}
      wrapClassName={styles.ModalRuntimeError}
      // closeIcon={<img src={ClosedIcon as any} alt="closedIcon" />}
      destroyOnClose
      width={700}
      onCancel={onCancel}
      open={visible}
      title={title}
      maskClosable
      centered
      footer={[]}
    >
      <div className={styles.error}>
        <p>
          ClickScan unable to communicate with Scanner. Please recheck your Scanner or reinstall the
          Extention from the link below
        </p>
        <div className={styles.runtime}>
          <div className={styles.runTimeItem} onClick={() => getFileRuntime('windows')}>
            <h4>
              {progress.windows > 0 && progress.windows < 100 ? (
                <span
                  className={styles.downloading}
                  style={{
                    background: `conic-gradient(var(--cs-primary-color) ${progress.windows}%, rgb(255, 255, 255) ${progress.windows}%)`,
                  }}
                >
                  <PauseOutlined />
                </span>
              ) : progress.windows === 100 ? (
                <CheckCircleOutlined />
              ) : (
                <DownloadOutlined />
              )}
              <small>Window</small>
            </h4>
          </div>
          <div className={styles.runTimeItem} onClick={() => getFileRuntime('macs')}>
            <h4>
              {progress.macs > 0 && progress.macs < 100 ? (
                <span
                  className={styles.downloading}
                  style={{
                    background: `conic-gradient(var(--cs-primary-color) ${progress.macs}%, rgb(255, 255, 255) ${progress.macs}%)`,
                  }}
                >
                  <PauseOutlined />
                </span>
              ) : progress.macs === 100 ? (
                <CheckCircleOutlined />
              ) : (
                <DownloadOutlined />
              )}
              <small>Macos</small>
            </h4>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalErrorRuntime;
