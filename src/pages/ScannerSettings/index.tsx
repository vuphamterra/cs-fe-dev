import { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';

import {
  PlusOutlined,
  PrinterFilled,
  SecurityScanOutlined,
  SettingFilled,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import AddNewScanner from './components/AddNewScanner';
import scannerNotFound from '~/assets/images/scanner_notfound.png';
import { useAppSelector } from '~/store/hooks';
import { initNetwork, onLoadScannerClick, onScannerSelect } from '~/assets/js/network';
import { useDispatch } from 'react-redux';
import { setListNameScanner } from '~/store/ScannerSlice';
import SettingScanner from './components/SettingScanner';

export default function ScannerSettings() {
  const [addScanner, setAddScanner] = useState<boolean>(false);
  // const [selectedScanner, setSelectedScanner] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [visibleScannerSetting, setVisibleScannerSetting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const dispatch = useDispatch();
  const ScannerList = useAppSelector((s) => s.scanner.listNameScanner);
  // console.log(ScannerList);
  useEffect(() => {
    if (!ScannerList) onLoadScannerClick(detectScanner);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      count < 5 ? setCount((prev) => prev + 1) : timoutLoading();
    }, 1000);
  }, [count]);

  const timoutLoading = () => {
    setLoading(false);
    setCount(0);
    initNetwork();
  };
  const detectScanner = (object: any) => {
    const { Scanners = null } = object;
    if (Scanners != null && Scanners !== undefined) {
      setLoading(false);
      dispatch(setListNameScanner(Scanners));
      localStorage.removeItem('runtime_load');
    }
  };
  const handleDetectScanner = () => {
    setCount(0);
    setLoading(true);
    onLoadScannerClick(detectScanner);
  };

  const handleClickScannerSetting = (nameScanner: string) => {
    onScannerSelect(nameScanner, getScannerSetting);
  };
  const getScannerSetting = (data: any) => {
    const { ScannerModel = null, DeviceConnectionName = null } = data;
    if (ScannerModel && DeviceConnectionName) {
      setLoading(false);
      setIsValid(true);
      setTimeout(() => {
        setVisibleScannerSetting(true);
      }, 1000);
    } else {
      setLoading(true);
    }
  };
  return (
    <div className={`${styles.scanner_setting_sec} scroll_content`}>
      <AddNewScanner open={addScanner} setOpen={() => setAddScanner(false)} />
      <div className={styles.scanner_settings}>
        <div className={styles.head_list}>
          <p style={{ margin: 0 }}>Scanner Settings</p>
          {loading ? (
            <Spin />
          ) : (
            <Button icon={<SecurityScanOutlined />} onClick={handleDetectScanner}>
              Detect Scanners
            </Button>
          )}
        </div>
        <hr />
        <div className={styles.list_scanner}>
          {ScannerList.length ? (
            ScannerList.map(({ ScannerName }: any, index: number) =>
              ScannerName === 'Any Device with PixTWAIN' ? null : (
                <div key={index} className={styles.scanner_info}>
                  <div className={styles.scanner_name}>
                    <PrinterFilled />
                    <p>{ScannerName}</p>
                  </div>
                  <div className={styles.scanner_action}>
                    {/* <Button
                  className={selectedScanner === id ? styles.btn_connected : styles.btn_connect}
                  disabled={selectedScanner === id}
                  onClick={() => setSelectedScanner(id)}
                >
                  {selectedScanner === id ? 'Connected' : 'Connect'}
                </Button> */}
                    <Button
                      className={styles.btn_settings}
                      icon={<SettingFilled />}
                      shape="circle"
                      // disabled
                      onClick={() => handleClickScannerSetting(ScannerName)}
                    />
                  </div>
                </div>
              ),
            )
          ) : (
            <div className={styles.scanner_notfound}>
              <img src={scannerNotFound} />
              <p>Scanner is empty, please add new scanner</p>
            </div>
          )}
        </div>
      </div>
      <SettingScanner
        visible={visibleScannerSetting}
        isValid={isValid}
        setVisible={setVisibleScannerSetting}
      />
    </div>
  );
}
