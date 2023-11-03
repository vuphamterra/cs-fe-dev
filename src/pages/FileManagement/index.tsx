/* eslint-disable no-unneeded-ternary */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dropdown, MenuProps, Tooltip, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import AddIcon from '~/assets/images/fileManagement/ic_add.svg';
import ExportIcon from '~/assets/images/fileManagement/ic_export.svg';
import MoveToIcon from '~/assets/images/fileManagement/ic_move_folder_to.svg';
import styles from './index.module.scss';
import AddNotesIcon from '~/assets/images/fileManagement/ic_add_notes.svg';
import DeleteIcon from '~/assets/images/fileManagement/ic_delete.svg';
import PrintIcon from '~/assets/images/fileManagement/ic_print.svg';
import DownArrowSideBarIcon from '~/assets/images/fileManagement/ic_down_arrow_sidebar.svg';
import RemoveFilesIcon from '~/assets/images/fileManagement/ic_remove_file.svg';
import notification from '~/utils/notification/index';
import FileReview from './components/FileReview';
import FolderTabs from './components/FolderTabs';
import ModalAddNewFiles from './components/ModalAddNewFiles';
import ModalRemoveFiles from './components/ModalRemoveFiles';
import ModalExportFilePdf from './components/ModalExportFilePdf';

import {
  getFilesByFolder,
  getFolderDetail,
  resetFileSlice,
  setCurrentFolderId,
  updateMessage,
} from '~/store/FileSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';

import { InfoCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { initNetwork } from '~/assets/js/network';
import { updateFoldersToMove } from '~/store/FolderSlice';
import DeleteModal from './components/ModalDeleteFolder';
import ModalErrorRuntime from './components/ModalErrorRuntime';
import ModalPleaseWait from './components/ModalPleaseWait';
import ModalScanPreview from './components/ModalScanPreview';
import MoveFolderModal from '../FolderManagement/components/MoveFolderModal';
import { setListNameScanner } from '~/store/ScannerSlice';
import { DRAWER_PERMISSION } from '~/constants';
import { getDrawerPermissions } from '~/store/DrawerSlice';
import AnnotationBar from './components/AnnotationBar';
import { downloadURI } from '~/utils';
import { useToken } from 'antd/es/theme/internal';

const FileManagement: React.FC = () => {
  const { token } = theme.useToken();
  const [visibleAddNewModal, setVisibleAddNewModal] = useState<boolean>(false);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState<boolean>(false);
  const [isExpandSidebar, setExpandSidebar] = useState<boolean>(false);
  const [isViewInfo, setViewInfo] = useState<boolean>(false);
  const [onViewHistory, setViewHistory] = useState<boolean>(false);
  const [deleteFolder, setDeleteFolder] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [addNoteItem, setAddNoteItem] = useState('');
  const [visiblePleaseWait, setVisiblePleaseWait] = useState(false);
  const [visibleScanPreview, setVisibleScanPreview] = useState(false);
  const [visibleErrorRuntime, setVisibleErrorRuntime] = useState(false);
  const [dataScanner, setDataScanner] = useState([]);
  const [nameScanner, setNameScanner] = useState('');
  const [listImage, setListImage] = useState([]);
  const [listImageDetail, setListImageDetail] = useState<any>([]);
  const [listFileImage, setListFileImage] = useState<any>([]);
  const [pdf, setPdf] = useState([]);
  const [errorScan, setErrorScan] = useState(false);
  const [disableScan, setDisableScan] = useState(false);
  const [moveFolder, setMoveFolder] = useState<boolean>(false);
  const [newAnnotText, setNewAnnotText] = useState([]);
  const [newAnnotHighlight, setNewAnnotHighlight] = useState([]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const message = useAppSelector((s) => s.file.message);
  const files = useAppSelector((s) => s.file.files);
  const streamFile = useAppSelector((s) => s.file.streamFile);
  const selectedFolders = useAppSelector((s) => s.folder.selectedFolders);
  const folderId = useAppSelector((s) => s.file.folderId);
  const drawerPermissions = useAppSelector((s) => s.draw.drawerPermissions);
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer);
  const folders = useAppSelector((s) => s.folder.folders);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openExportFile, setOpenExportFile] = useState<boolean>(false);

  useEffect(() => {
    let timeout = 0;
    const checkRuntime = localStorage.getItem('runtime_load');
    const interval = setInterval(() => {
      if (localStorage.getItem('cct_session_id')) {
        initNetwork();

        const inter = setInterval(() => {
          timeout += 1;
          setProgress(progress + timeout * 6.3);
        }, 100);
        setTimeout(() => {
          setVisiblePleaseWait(false);
          clearInterval(inter);
        }, 2000);
        localStorage.removeItem('runtime_load');
        setDisableScan(false);
        clearInterval(interval);
      } else {
        if (checkRuntime === 'false') {
          clearInterval(interval);
          setVisiblePleaseWait(false);
          setDisableScan(true);
        } else {
          timeout += 1;
          setVisiblePleaseWait(true);
          setProgress(timeout * 15 + progress);
          initNetwork();
          if (timeout === 7) {
            localStorage.setItem('runtime_load', 'false');

            clearInterval(interval);
            setDisableScan(true);

            setVisibleErrorRuntime(true);
            setVisiblePleaseWait(false);
          }
        }
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (message) {
      notification[message.type]({ message: message.title, description: message.text });
      dispatch(updateMessage(null));
    }
  }, [message]);

  useEffect(() => {
    if (selectedFolders.length > 0) {
      dispatch(getFilesByFolder(selectedFolders[0]));
      dispatch(setCurrentFolderId(selectedFolders[0]));
      dispatch(getDrawerPermissions({ id: currentDrawer.id }));
    }
  }, [selectedFolders]);

  useEffect(() => {
    if (errorScan && localStorage.getItem('cct_session_id')) {
      localStorage.removeItem('cct_session_id');
      initNetwork();
    } else if (!localStorage.getItem('cct_session_id') && disableScan) {
      initNetwork();
    }
  }, [errorScan, disableScan]);

  useEffect(
    () => () => {
      dispatch(resetFileSlice());
    },
    [],
  );

  const handleDataScanner = (object: any) => {
    const { Scanners = null } = object;
    if (disableScan) {
      setVisiblePleaseWait(true);
      setDisableScan(false);
      setProgress(0);
    } else {
      if (Scanners != null && Scanners !== undefined) {
        const defaultScan = nameScanner ? nameScanner : Scanners[0].ScannerName;
        setDataScanner(Scanners);
        dispatch(setListNameScanner(Scanners));
        setNameScanner(defaultScan);
        setVisibleScanPreview(true);
        setErrorScan(false);
      } else {
        setErrorScan(true);
      }
    }
  };

  const headerItem = [
    {
      icon: AddIcon,
      label: 'Add Files',
      action: () => {
        setVisibleAddNewModal(true);
      },
      key: 'ADD_FILE',
      rendered: true,
    },
    {
      icon: ExportIcon,
      label: 'Export',
      action: () => {
        if (files.length > 0) {
          handExport();
        } else {
          notification.warning({ message: 'File Not found!', description: '' });
        }
      },
      rendered:
        drawerPermissions &&
        drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.EXPORT),
    },
    {
      icon: MoveToIcon,
      label: 'Move Folder to',
      action: () => {
        const folderToMove = folders.filter((folder) => folder.csId === +folderId);
        dispatch(updateFoldersToMove(folderToMove));
        setMoveFolder(true);
      },
      rendered:
        drawerPermissions &&
        drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.MIGRATE_FOLDER),
    },
    {
      icon: AddNotesIcon,
      label: 'Add Note',
      rendered:
        drawerPermissions &&
        drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.ADD_NOTE),
    },
    {
      icon: RemoveFilesIcon,
      label: 'Remove File',
      action: () => {
        if (files.length > 0) {
          setVisibleDeleteModal(true);
        } else {
          notification.warning({ message: 'File Not found!', description: '' });
        }
      },
      rendered:
        drawerPermissions &&
        drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.DELETE_FILE),
    },
    {
      icon: DeleteIcon,
      label: 'Delete Folder',
      action: () => {
        setDeleteFolder(true);
      },
      rendered:
        drawerPermissions &&
        drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.DELETE_FOLDER),
    },
    {
      icon: PrintIcon,
      label: 'Print File',
      action: () => {
        if (files.length > 0) {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = streamFile;
          document.body.appendChild(iframe);
          iframe.contentWindow.print();
        } else {
          notification.warning({ message: 'File Not found!', description: '' });
        }
      },
      rendered:
        drawerPermissions && drawerPermissions.map((i) => i.code).includes(DRAWER_PERMISSION.PRINT),
    },
  ];

  const items: MenuProps['items'] = [
    {
      label: <p>Freehand</p>,
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label: <p>Add Text</p>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: <p>Draw Shape</p>,
      key: '3',
    },
    {
      type: 'divider',
    },
    {
      label: <p>Add Comment</p>,
      key: '4',
    },
  ];

  const addNoteMenu = (text: any) => {
    return (
      <Dropdown
        menu={{ items, selectable: true, onClick }}
        trigger={['hover']}
        key={text}
        className="child-dropdown"
        disabled
      >
        {text}
      </Dropdown>
    );
  };
  const createUniqueId = () => {
    return 'CS' + Math.floor(Math.random() * (99999 - 10000 + 1));
  };
  const onClick: MenuProps['onClick'] = ({ key }) => {
    // const checkEmpty = newAnnotText.filter((val: any) => val.content === '');
    if (key === '1') {
      const uid = createUniqueId();
      const obj = {
        content: '',
        rotate: 0,
        size: 20,
        x: 0,
        y: 0,
        color: [0, 0, 0],
        id: uid,
        bold: false,
        italic: false,
        underline: false,
      };
      setNewAnnotText([...newAnnotText, obj]);
      setIsBold(false);
      setIsItalic(false);
    }
    if (key === '3') {
      const uid = createUniqueId();
      const obj = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        color: [0, 0, 0],
        opacity: 0.5,
        id: uid,
      };
      setNewAnnotHighlight([...newAnnotHighlight, obj]);
    }
    setAddNoteItem(key);
  };

  const viewInfo = () => {
    navigate(`/folder-management/folder-details/${folderId}`);
    dispatch(getFolderDetail(folderId));
  };

  const handExport = async () => {
    setOpenExportFile(true);
    // const link = document.createElement('a');
    // link.href = streamFile;
    // link.download = `${moment().format('DD-MM-YYYY HH:mm')}`;
    // link.click();
  };

  const renderHeader = () => {
    return headerItem.map((item) => {
      if (item.label === 'Add Note' && item.rendered) {
        return addNoteMenu(
          <Tooltip title="Coming soon">
            <div onClick={item.action} className={styles.item_disable} key={item.label}>
              <img src={item.icon} alt="icon" />
              <span>{item.label}</span>
              <img src={DownArrowSideBarIcon} alt="icon" />
            </div>
          </Tooltip>,
        );
      }
      return (
        item.rendered && (
          <div onClick={item.action} className={styles.item} key={item.label}>
            <img src={item.icon} alt="icon" />
            <span>{item.label}</span>
          </div>
        )
      );
    });
  };

  return (
    <div className={styles.file_management_section}>
      <FolderTabs />
      <div className={styles.file_management}>
        <div className={styles.file_review}>
          <div className={styles.header}>
            <div className={styles.header_action}>{renderHeader()}</div>
            <div className={styles.icon_folder_info}>
              <InfoCircleFilled
                onClick={viewInfo}
                style={{
                  color:
                    folderId && pathname.split('/')[3] === folderId.toString()
                      ? token.colorPrimary
                      : '',
                }}
              />
            </div>
          </div>
          <div className={styles.render_file}>
            <FileReview
              setExpandSidebar={setExpandSidebar}
              fileList={files}
              addNoteItem={addNoteItem}
              setAddNoteItem={setAddNoteItem}
              setPdf={setPdf}
              pdf={pdf}
              setNewAnnotText={setNewAnnotText}
              setNewAnnotHighlight={setNewAnnotHighlight}
              newAnnotHighlight={newAnnotHighlight}
              newAnnotText={newAnnotText}
              setIsBold={setIsBold}
              isBold={isBold}
              setIsItalic={setIsItalic}
              isItalic={isItalic}
              setIsUnderline={setIsUnderline}
              isUnderline={isUnderline}
            />
          </div>
        </div>
        <Outlet />

        <ModalAddNewFiles
          handleDataScanner={handleDataScanner}
          setVisible={setVisibleAddNewModal}
          visible={visibleAddNewModal}
          errorScan={errorScan}
          listFileImage={listFileImage}
          disableScan={disableScan}
          setListFileImage={setListFileImage}
          setListImage={setListImage}
          setListImageDetail={setListImageDetail}
        />
        <ModalRemoveFiles setVisible={setVisibleDeleteModal} visible={visibleDeleteModal} />
        <MoveFolderModal
          open={moveFolder}
          setOpen={() => setMoveFolder(false)}
          folderFromFilePage={folderId}
        />
        <ModalPleaseWait
          visible={visiblePleaseWait}
          setVisible={setVisiblePleaseWait}
          progress={progress}
        />
        <ModalScanPreview
          visible={visibleScanPreview}
          setVisible={setVisibleScanPreview}
          dataScanner={dataScanner}
          nameScanner={nameScanner}
          setListFileImage={setListFileImage}
          listFileImage={listFileImage}
          setNameScanner={setNameScanner}
          setListImageDetail={setListImageDetail}
          setListImage={setListImage}
          listImage={listImage}
          listImageDetail={listImageDetail}
        />
        <ModalErrorRuntime visible={visibleErrorRuntime} setVisible={setVisibleErrorRuntime} />
        <DeleteModal open={deleteFolder} setOpen={() => setDeleteFolder(false)} />
        <ModalExportFilePdf open={openExportFile} setOpen={() => setOpenExportFile(false)} />
      </div>
    </div>
  );
};

export default FileManagement;
