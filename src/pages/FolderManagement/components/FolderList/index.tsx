import { DownloadOutlined, FolderOpenOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import _, { truncate } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DRAWER_PERMISSION } from '~/constants';
import { getDrawerPermissions } from '~/store/DrawerSlice';
import {
  exportFolder,
  getFolders,
  handleSelectFolder,
  setOpenSingleFolder,
  updateFoldersToDelete,
  updateFoldersToMove,
  updateSelectedFolders,
} from '~/store/FolderSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import DeleteModal from '../DeleteModal';
import ExportModal from '../ExportModal';
import MoveFolderModal from '../MoveFolderModal';
import { FOLDER_MODEL_EXTENDED } from '../../interfaces';
import { setCurrentFolderId } from '~/store/FileSlice';
import styles from './FolderList.module.scss';

const FolderList: React.FC = () => {
  const [deleteOpen, setOpenDelete] = useState<boolean>(false);
  const [openExport, setOpenExport] = useState<boolean>(false);
  const [moveFolder, setMoveFolder] = useState<boolean>(false);
  const [seletedDrawerId, setSelectedDrawerId] = useState<number>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { openSingleFolder } = useAppSelector((s) => s.folder);
  const {
    loading: loadingDrawer,
    currentDrawer,
    drawerPermissions,
  } = useAppSelector((store) => store.draw);
  const {
    folders,
    fields,
    selectedFolders,
    loading: loadingFolders,
  } = useAppSelector((store) => store.folder);

  const isAbleToDelete =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.DELETE_FOLDER) > -1;
  // const isAbleToPrint =
  //   drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.PRINT) > -1;
  const isAbleToMove =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.MIGRATE_FOLDER) > -1;
  const isAbleToExport =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.EXPORT) > -1;

  useEffect(() => {
    if (!_.isEmpty(currentDrawer) && currentDrawer.id !== seletedDrawerId) {
      setSelectedDrawerId(currentDrawer.id);
      dispatch(getFolders({ drawer_id: currentDrawer.id })).then(() => {
        dispatch(getDrawerPermissions({ id: currentDrawer.id }));
      });
      dispatch(updateSelectedFolders([]));
    }
  }, [currentDrawer]);

  useEffect(() => {
    const folderIds = folders.map((item) => item.csId);
    const newSelectedFolders = [];
    selectedFolders.forEach((folderId) => {
      if (folderIds.includes(folderId)) {
        newSelectedFolders.push(folderId);
      }
    });
    dispatch(updateSelectedFolders(newSelectedFolders));
  }, [folders]);

  // Uncheck when repload page
  useEffect(() => {
    window.addEventListener('beforeunload', onUncheck);
    return () => {
      window.removeEventListener('beforeunload', onUncheck);
    };
  }, []);

  const onUncheck = () => {
    dispatch(updateSelectedFolders([]));
  };

  const openFolder = (folder) => {
    if (!folder) {
      return;
    }
    dispatch(updateSelectedFolders([folder.csId]));
    dispatch(setCurrentFolderId(folder.csId));
    dispatch(setOpenSingleFolder(true));
    navigate('/folder-management/folder-details/files');
  };

  const handleViewInfo = (e) => {
    const el = e.target.closest('div.dropdown_list');
    const className = el.getAttribute('class');
    const classes = className.split(' ').filter((item) => item.includes('folder_key_'));
    const folderId = parseInt(classes[0].split('_')[2]);
    if (Number.isInteger(folderId) && folderId > 0) {
      navigate(`/folder-management/${folderId}`);
    }
  };

  const handleMoveFolder = (e) => {
    const el = e.target.closest('div.dropdown_list');
    const className = el.getAttribute('class');
    const classes = className.split(' ').filter((item) => item.includes('folder_key_'));
    const folderId = parseInt(classes[0].split('_')[2]);
    if (Number.isInteger(folderId) && folderId > 0) {
      const folder = folders.find((item) => item.csId === folderId);
      dispatch(updateFoldersToMove([folder]));
      setMoveFolder(true);
    }
  };

  const handleDeleteFolder = (e) => {
    const el = e.target.closest('div.dropdown_list');
    const className = el.getAttribute('class');
    const classes = className.split(' ').filter((item) => item.includes('folder_key_'));
    const folderId = parseInt(classes[0].split('_')[2]);
    if (Number.isInteger(folderId) && folderId > 0) {
      const folder = folders.find((item) => item.csId === folderId);
      dispatch(updateFoldersToDelete([folder]));
      setOpenDelete(true);
    }
  };

  const handleExportFolder = (folder) => {
    if (!folder || !folder.csId) {
      return;
    }
    dispatch(exportFolder({ folderIds: [folder.csId] })).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.payload]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moment().format('DD-MM-YYYY HH:mm')}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const handleExportPdfFie = (e) => {
    alert('Son Bao is working on')
  };

  const handleExportZipFie = (e) => {
    alert('Son Bao is working on')
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span onClick={handleViewInfo}>View Info</span>,
    },
    // isAbleToPrint && {
    //   key: '2',
    //   label: <p onClick={() => window.print()}>Print Folder</p>,
    // },
    isAbleToMove && {
      key: '3',
      label: <span onClick={handleMoveFolder}>Move Folder To</span>,
    },
    isAbleToDelete && {
      key: '4',
      label: <span onClick={handleDeleteFolder}>Delete Folder</span>,
    },
    {
      key: '5',
      label: <span>Export Folder</span>,
      children: [
        {
          key: '5-1',
          label: <span onClick={handleExportZipFie}>Compress and Export as ZIP File</span>,
        },
        {
          key: '5-2',
          label: <span onClick={handleExportPdfFie}>Compress and Export as single PDF</span>,
        },
      ],
    },
  ];

  const getColumns = (): ColumnsType<FOLDER_MODEL_EXTENDED> => {
    let limitLength = 80;
    if (fields.length > 7) {
      limitLength = 30;
    } else if (fields.length > 3) {
      limitLength = 40;
    }
    const columns: ColumnsType<FOLDER_MODEL_EXTENDED> = [
      ...fields.map((item) => ({
        dataIndex: item.name,
        title: item.name,
        render(value) {
          if (!value || _.trim(value).length === 0) {
            return '-';
          }
          return truncate(value, { length: limitLength });
        },
      })),
      {
        title: 'Last modified',
        dataIndex: 'updated_at',
        fixed: 'right',
        width: 150,
        render: (value) => {
          if (!value) {
            return '-';
          }
          return moment(value).format('HH:mm DD MMM YYYY');
        },
      },
      {
        title: 'Files',
        fixed: 'right',
        dataIndex: 'fileCount',
        width: 80,
        align: 'center',
      },
      {
        title: 'Actions',
        fixed: 'right',
        width: 100,
        align: 'center',
        onCell: () => {
          return {
            onClick: (e) => e.stopPropagation(),
          };
        },
        render: (value) => {
          return (
            <span className={styles.actions_container}>
              <Tooltip title="Open folder">
                <FolderOpenOutlined
                  onClick={() => {
                    openFolder(value);
                  }}
                />
              </Tooltip>
              {isAbleToExport && (
                <Tooltip title="Export folder">
                  <DownloadOutlined
                    title="Export folder"
                    onClick={() => {
                      handleExportFolder(value);
                    }}
                  />
                </Tooltip>
              )}
              <Dropdown
                overlayClassName={`dropdown_list folder_key_${value.csId}`}
                menu={{ items }}
                placement="bottomRight"
                trigger={['click']}
              >
                <MoreOutlined />
              </Dropdown>
            </span>
          );
        },
      },
    ];

    return columns;
  };

  const isOpenSingleFolder = () => {
    return selectedFolders.length && openSingleFolder ? [] : selectedFolders;
  };

  return (
    <>
      <Table
        className={`${styles.folder_table} table_folder`}
        columns={getColumns()}
        dataSource={folders}
        scroll={{ x: 1000, y: 295 }}
        sticky
        loading={loadingDrawer || loadingFolders}
        rowKey="csId"
        rowSelection={{
          selectedRowKeys: isOpenSingleFolder(),
          onChange: (selectedRowKeys) => {
            dispatch(setOpenSingleFolder(false));
            dispatch(updateSelectedFolders(selectedRowKeys));
          },
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              dispatch(handleSelectFolder(record.csId));
            },
          };
        }}
      />
      <DeleteModal open={deleteOpen} setOpen={setOpenDelete} />
      <ExportModal open={openExport} setOpen={() => setOpenExport(false)} />
      <MoveFolderModal open={moveFolder} setOpen={() => setMoveFolder(false)} />
    </>
  );
};

export default FolderList;
