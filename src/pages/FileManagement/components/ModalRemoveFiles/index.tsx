import React from 'react';
import { Button, Modal } from 'antd';
import { DeleteIconModal } from '~/components/Icons';
import { deleteFile, getFilesByFolder } from '~/store/FileSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import './index.scss';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  children?: React.ReactNode;
  setFileList?: (value: any) => void;
}

const ModalRemoveFiles: React.FC<Props> = (props) => {
  const { visible, setVisible } = props;

  const currentFileId = useAppSelector((s) => s.file.currentFile?.id);
  const currenFolderId = useAppSelector((s) => s.file.folderId);
  const dispatch = useAppDispatch();

  const title = (
    <div className="titleModal">
      <DeleteIconModal width={44} height={44} fill="" />
      <div>
        <p className="title">Remove Current File</p>
      </div>
    </div>
  );

  const handleDeleteFile = () => {
    dispatch(deleteFile(currentFileId)).then(() => {
      dispatch(getFilesByFolder(currenFolderId));
      onCancel();
    });
  };

  const onCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      wrapClassName="ModalRemoveFiles"
      onCancel={onCancel}
      open={visible}
      title={title}
      maskClosable
      destroyOnClose
      centered
      footer={
        <div className="footer">
          <Button onClick={onCancel} className="cancel_button">
            Cancel
          </Button>
          <Button onClick={handleDeleteFile} className="delete_button">
            Remove
          </Button>
        </div>
      }
    >
      <p className="subTitle">
        Are you sure you want to remove this file? This action cannot be undone.
      </p>
    </Modal>
  );
};

export default ModalRemoveFiles;
