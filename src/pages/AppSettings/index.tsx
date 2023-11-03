import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Button } from 'antd';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import notification from '~/utils/notification';
import { clearMessage, toggleInInstallDBProcess } from '~/store/DatabaseSlice';
import { BackArrow } from '~/components/Icons';
import loginPic from '~/assets/images/loginimg.png';
import styles from './AppSettings.module.scss';
import { INITIAL_SETTING_STEP } from '~/constants';

export default function AppSettings() {
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { message, creating: creatingDb, inInstallDBProcess } = useAppSelector((state) => state.db);
  useEffect(() => {
    if (message) {
      notification[message.type](message);
      appDispatch(clearMessage());
    }
  }, [message]);

  const handleBackBtn = () => {
    if (inInstallDBProcess === INITIAL_SETTING_STEP.FIRST) {
      navigate('/');
      return;
    }
    if (inInstallDBProcess === INITIAL_SETTING_STEP.SECOND) {
      appDispatch(toggleInInstallDBProcess(INITIAL_SETTING_STEP.FIRST));
      navigate('/app-setting');
    }
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.left_side}>
          <p>Welcome to</p>
          <p>ClickScan !</p>
          <img src={loginPic} alt="" />
        </div>
        <div className={styles.right_side}>
          <div>
            <Button
              className={`${styles.back_btn} ${creatingDb ? styles.disabled : ''}`}
              onClick={handleBackBtn}
            >
              <BackArrow width={20} height={20} fill="" />
              Back
            </Button>
          </div>
          <Outlet />
        </div>
      </div>
    </section>
  );
}
