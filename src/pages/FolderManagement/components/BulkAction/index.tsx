import { useState } from 'react';
import moment from 'moment';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ExportModal from '../ExportModal';
import MoveFolderModal from '../MoveFolderModal';
import DeleteModal from '../DeleteModal';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { exportFolder, updateFoldersToDelete, updateFoldersToMove } from '~/store/FolderSlice';
import { DRAWER_PERMISSION } from '~/constants';
import styles from './styles.module.scss';

const BulkAction = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { drawerPermissions } = useAppSelector((store) => store.draw);
  const { selectedFolders, folders } = useAppSelector((store) => store.folder);
  const [openExport, setOpenExport] = useState<boolean>(false);
  const [moveFolder, setMoveFolder] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const isAbleToDelete =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.DELETE_FOLDER) > -1;
  const isAbleToExport =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.EXPORT) > -1;
  const isAbleToMove =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.MIGRATE_FOLDER) > -1;

  const handleDeleteFolders = () => {
    if (selectedFolders.length) {
      const foldersToDelete = folders.filter((item) => selectedFolders.includes(item.csId));
      dispatch(updateFoldersToDelete(foldersToDelete));
      setDeleteModal(true);
    }
  };

  const onClickMoveFolders = () => {
    const foldersToMove = folders.filter((item) => selectedFolders.includes(item.csId));
    if (!foldersToMove.length) {
      return;
    }
    dispatch(updateFoldersToMove(foldersToMove));
    setMoveFolder(true);
  };

  const handleExportFolders = () => {
    if (!selectedFolders.length) {
      return;
    }
    dispatch(exportFolder({ folderIds: selectedFolders })).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.payload]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moment().format('DD-MM-YYYY HH:mm')}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const items = [
    {
      key: '1',
      label: (
        <p onClick={() => navigate('/folder-management/folder-details/files')}>
          Open Selected Folders
        </p>
      ),
    },
    isAbleToExport && {
      key: '2',
      label: <p onClick={handleExportFolders}>Export Selected Folders</p>,
    },
    // {
    //   key: '3',
    //   label: <p onClick={() => window.print()}>Print</p>,
    // },
    isAbleToMove && {
      key: '4',
      label: <p onClick={onClickMoveFolders}>Move Selected Folders</p>,
    },
    // {
    //   key: '5',
    //   label: <p>Lock With Password</p>,
    // },
    isAbleToDelete && {
      key: '6',
      label: <p onClick={handleDeleteFolders}>Delete Selected Folders</p>,
    },
  ];

  return (
    <>
      <Dropdown
        overlayClassName="dropdown_head_folder"
        className={styles.dropdown_bulk}
        menu={{ items }}
        trigger={['click']}
        placement="bottomRight"
      >
        <div className={styles.btn_bulk}>
          <p>Bulk Action</p> <DownOutlined />
        </div>
      </Dropdown>
      <ExportModal open={openExport} setOpen={() => setOpenExport(false)} />
      <MoveFolderModal open={moveFolder} setOpen={() => setMoveFolder(false)} />
      <DeleteModal open={deleteModal} setOpen={() => setDeleteModal(false)} />
    </>
  );
};
export default BulkAction;
