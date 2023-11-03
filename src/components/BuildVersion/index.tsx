/* eslint-disable multiline-ternary */
import { useState, useEffect } from 'react';
import { Row, Col, Popover } from 'antd';

import metadata from '~/metadata.json';

import { InfoCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';
import { useAppDispatch } from '~/store/hooks';
import styles from './BuildVersion.module.scss';
import { downloadChangeLogs } from '~/store/DatabaseSlice';

const BuildVersion = () => {
  const appDispatch = useAppDispatch();
  const [contentBuild, setContentBuild] = useState([]);
  const { pathname = '' } = useLocation();

  useEffect(() => {
    appDispatch(downloadChangeLogs())
      .then(async (res) => {
        const { payload } = res || {};
        const changelogs = new File([payload], 'changelogs.txt');
        const reader = new FileReader();
        reader.readAsText(changelogs);
        reader.onload = (e) => {
          const fileDataStr = e.target.result as string;
          const fileData = fileDataStr.split('\n');
          setContentBuild(fileData);
        };
      })
      .catch(() => { });
  }, []);

  const content = (
    <div
      className={`${styles.Doc} changeLogs`}
      style={{ height: '35vh', overflow: 'auto', padding: '15px' }}
    >
      {contentBuild.map((val: string, index: number) =>
        val.includes('*') && val.split('')[0] !== ' ' ? (
          <div style={{ display: 'flex', alignItems: 'center' }} key={index}>
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                background: '#000',
                borderRadius: '50%',
                marginRight: '5px',
              }}
            ></span>
            <span style={{ display: 'block', marginBottom: '5px' }}>{val.replace('*', '')}</span>
          </div>
        ) : val.split('')[0] === ' ' ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }} key={index}>
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                border: '1px solid #000',
                borderRadius: '50%',
                marginRight: '5px',
              }}
            ></span>
            <span style={{ display: 'block', marginBottom: '5px' }}>{val.replace('*', '')}</span>
          </div>
        ) : (
          <p key={index} style={{ marginBottom: '8px' }}>
            {val}
          </p>
        ),
      )}
    </div>
  );
  const style = pathname.includes('login') && { color: '#efefef', marginBottom: '5px' };
  return (
    <Row className={styles.container} style={style}>
      <Col span={24}>&copy; 2023 ClickScan</Col>
      <Col span={24}>
        {`Version ${metadata.buildMajor}.${metadata.buildMinor} (build ${metadata.buildRevision})`}{' '}
        <Popover content={content} placement="rightTop" trigger="click">
          <InfoCircleOutlined style={{ cursor: 'pointer' }} />
        </Popover>
      </Col>
    </Row>
  );
};

export default BuildVersion;
