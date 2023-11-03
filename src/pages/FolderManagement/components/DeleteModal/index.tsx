import React from 'react';
import { Button, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import notification from '~/utils/notification';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import deleteIcon from '~/assets/images/delete_icon_modal.png';
import styles from './index.module.scss';
import { clearFolderToOpen, deleteFolder, getFolders } from '~/store/FolderSlice';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DeleteModal = (props: ModalProps) => {
  const dispatch = useAppDispatch();
  const { foldersToDelete, loading } = useAppSelector((store) => store.folder);
  const { currentDrawer } = useAppSelector((store) => store.draw);
  const { open, setOpen } = props;

  const headModal = (
    <div className={styles.modal_title}>
      <img src={deleteIcon} />
      <p>Delete Folder</p>
    </div>
  );

  const handleDeleteFolder = () => {
    if (foldersToDelete.length) {
      const ids = foldersToDelete.map((item) => item.csId);
      dispatch(deleteFolder({ drawer_id: currentDrawer.id, ids })).then((res) => {
        const { payload: { statusCode = '' } = {} } = res;
        let description = React.createElement('span', {}, [
          'The folder of ',
          React.createElement('b', { key: uuidv4() }, currentDrawer.name),
          ' was deleted successfully',
        ]);
        if (foldersToDelete.length > 1) {
          description = React.createElement('span', {}, [
            'The folders of ',
            React.createElement('b', { key: uuidv4() }, currentDrawer.name),
            ' were deleted successfully',
          ]);
        }
        if (statusCode === 200) {
          notification.success({
            message: 'Folder(s) deleted successfully',
            description,
          });
          setOpen(false);
          dispatch(clearFolderToOpen());
          dispatch(getFolders({ drawer_id: currentDrawer.id }));
        }
      });
    }
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
        {foldersToDelete.length && foldersToDelete.length > 1
          ? 'Are you sure you want to delete selected folders? This action cannot be undone.'
          : 'Are you sure you want to delete this folder? This action cannot be undone.'}
      </p>
    </Modal>
  );
};

export default DeleteModal;
