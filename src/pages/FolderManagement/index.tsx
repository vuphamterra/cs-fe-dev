import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Row } from 'antd';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { getDrawerData } from '~/store/DrawerSlice';
import ViewListFolder from './components/ViewList';
import { getTypes } from '~/store/IndexField';
import styles from './FolderManagement.module.scss';

export default function FolderManagement() {
  const appDispatch = useAppDispatch();
  const { types } = useAppSelector((store) => store.indexField);
  useEffect(() => {
    appDispatch(getDrawerData({ view_mode: 'CLIENT' }));
    if (!types.length) {
      appDispatch(getTypes({}));
    }
  }, []);
  return (
    <Row className={`${styles.folder_sec} folder_section`}>
      <Row className={styles.view_container}>
        <Row className={`${styles.list_container} scroll_content`}>
          <ViewListFolder />
        </Row>
        <Outlet />
      </Row>
    </Row>
  );
}
