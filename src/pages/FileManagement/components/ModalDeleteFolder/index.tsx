import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { deleteFolder, getFolders } from '~/store/FolderSlice';
import notification from '~/utils/notification';
import { DeleteIconModal } from '~/components/Icons';
import styles from './ModalDeleteFolder.module.scss';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DeleteModal = (props: ModalProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((store) => store.folder);
  const { currentDrawer } = useAppSelector((store) => store.draw);
  const folderId = useAppSelector((s) => s.file.folderId);
  const { open, setOpen } = props;

  const headModal = (
    <div className={styles.modal_title}>
      <DeleteIconModal width={44} height={44} fill="" />
      <p>Delete Folder</p>
    </div>
  );

  const handleDeleteFolder = () => {
    dispatch(deleteFolder({ drawer_id: currentDrawer.id, ids: [folderId] })).then((res) => {
      const { payload: { statusCode = '' } = {} } = res;
      const description = React.createElement('span', {}, [
        'Folder ',
        React.createElement('b', { key: uuidv4() }, folderId),
        ' was deleted successfully',
      ]);
      if (statusCode === 200) {
        notification.success({
          message: 'Folder deleted successfully',
          description,
        });
        setOpen(false);
        navigate('/folder-management');
        dispatch(getFolders({ drawer_id: currentDrawer.id }));
      }
    });
  };

  return (
    <Modal
      className={styles.folder_delete_modal}
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
          onClick={handleDeleteFolder}
        >
          Delete
        </Button>,
      ]}
    >
      <p className={styles.modal_body}>
        Are you sure you want to delete this folder? This action cannot be undone
      </p>
    </Modal>
  );
};

export default DeleteModal;
