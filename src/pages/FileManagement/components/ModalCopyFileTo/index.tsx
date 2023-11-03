/* eslint-disable multiline-ternary */
import React, { useEffect, useState } from 'react';
import { Button, Modal, Select, Spin, theme } from 'antd';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { copyFileTo } from '~/store/FileSlice';
import { AddNewFileIcon } from '~/components/Icons';
import { CloseOutlined } from '@ant-design/icons';
import FolderTable from '~/pages/FolderManagement/components/FolderTable';
import { getDrawerData } from '~/store/DrawerSlice';
import { getFolders } from '~/store/FolderSlice';
import styles from './styles.module.scss';

let destinaitonDrawerId = 0;
interface Props {
  visible: boolean;
  fileId: number;
  setVisible: (value: boolean) => void;
}

const ModalCopyFileTo: React.FC<Props> = (props) => {
  const {
    fileId,
    visible,
    setVisible,
  } = props;
  const [dawerList, setDawerList] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);

  const dispatch = useAppDispatch();
  const { loading, currentFolder } = useAppSelector((s) => s.file);
  const currentDrawerId = useAppSelector((store) => store.draw).currentDrawer.id;

  const title = (
    <div className="titleModal" style={{ paddingBottom: 40 }}>
      <AddNewFileIcon width={44} height={44} fill="" />
      <div>
        <p className="title">Copy File</p>
        <p className="subTitle">Copy file to other folders</p>
      </div>
    </div>
  );

  const onDrawerChange = (drawerId: number) => {
    destinaitonDrawerId = drawerId;
    dispatch(getFolders({ drawer_id: drawerId }));
  };

  const renderModal = () => {
    return (
      <div>
        <p>Select Drawer</p>
        <Select
          onChange={onDrawerChange}
          showSearch
          style={{ width: 350, marginBottom: 12 }}
          placeholder="--Select Drawer--"
          defaultValue={currentDrawerId}
          optionFilterProp="children"
          filterOption={(input, option) => (option?.label ?? '').includes(input)}
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
          }
          options={dawerList}
        />
        <FolderTable exceptFolderId={currentFolder?.id} setFolders={setFolders} />
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className={styles.modal_actions}>
        <Button onClick={onCancel} className={styles.cancel_btn} disabled={loading}>
          Cancel
        </Button>
        <Button disabled={folders.length === 0} className={styles.move_btn} onClick={onCopyTo}>
          Copy
        </Button>
      </div>
    );
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onCopyTo = () => {
    const body = {
      drawer_id: destinaitonDrawerId || currentDrawerId,
      folder_id: folders,
      id: [fileId],
    };
    dispatch(copyFileTo(body));
    // Temp
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      dispatch(getDrawerData({})).then((response) => {
        const {
          payload: { payload },
        } = response;
        const { data } = payload;
        const list = data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          }
        });
        setDawerList(list);
        dispatch(getFolders({ drawer_id: currentDrawerId }));
      });
    }
  }, [visible]);

  return (
    <Modal
      className={styles.copy_file_modal}
      wrapClassName="ModalAddNewFiles"
      closeIcon={<CloseOutlined />}
      onCancel={onCancel}
      open={visible}
      width={'60%'}
      title={title}
      maskClosable={!loading}
      destroyOnClose
      centered
      footer={renderFooter()}
      closable={!loading}
    >
      <Spin style={{ width: '100%', height: '100%' }} spinning={loading}>
        {renderModal()}
      </Spin>
    </Modal>
  );
};

export default ModalCopyFileTo;
