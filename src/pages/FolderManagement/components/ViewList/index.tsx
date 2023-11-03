import { FilterFilled } from '@ant-design/icons';
import { Button, Collapse, UploadFile } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { initNetwork } from '~/assets/js/network';
import CSButton from '~/components/CSButton';
import ConfirmModal from '~/components/ConfirmModal';
import { Info as InfoIcon, NewFolder, Plus, TrashBin } from '~/components/Icons';
import { DATE_FORMAT, DECIMAL_NUMBER, DRAWER_PERMISSION, FIELD_TYPE } from '~/constants';
import { removeAutoIndex, uploadFiles } from '~/store/DrawerSlice';
import {
  createFolder,
  getFolders,
  handleSelectFolder,
  handleSetFolderToOpen,
  setOpenSingleFolder,
  updateSelectedFolders,
  uploadFolders,
} from '~/store/FolderSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { formatNumber, formatPhoneNumber, formatSocialSecurity } from '~/utils';
import notification from '~/utils/notification';
import ModalErrorRuntime from '~/pages/FileManagement/components/ModalErrorRuntime';
import ModalPleaseWait from '~/pages/FileManagement/components/ModalPleaseWait';
import ModalScanPreview from '~/pages/FileManagement/components/ModalScanPreview';
import SearchFolder from '~/pages/Search/Search';
import FolderList from '../FolderList';
import BulkAction from '../BulkAction';
// import CreateDropdown from './components/CreateDropdown';
import IndexFieldForm from '../IndexFieldForm';
import styles from './ViewList.module.scss';

export default function ViewListFolder() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    fields,
    selectedFolders,
    loading: folderLoading,
    folders,
  } = useAppSelector((store) => store.folder);
  const { currentDrawer, drawerPermissions, createFolderLoading } = useAppSelector(
    (store) => store.draw,
  );
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isDiscardFilesModalOpened, setDiscardFilesModalOpened] = useState(false);
  const [tmpImportScanType, setTmpImportScanType] = useState<number>(null);
  const [creatingFolders, setCreatingFolders] = useState<boolean>(false);
  const [createFolderCurrentStep, setCreateFolderCurrentStep] = useState<number>(1);
  const [importScanType, setImportScanType] = useState<number>(1);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadFileError, setUploadFileError] = useState({
    maxFiles: '',
    maxFileSize: '',
    maxTotalFileSize: '',
  });
  const [visibleScanPreview, setVisibleScanPreview] = useState(false);
  const [dataScanner, setDataScanner] = useState([]);
  const [nameScanner, setNameScanner] = useState('');
  const [progress, setProgress] = useState(0);
  const [listImage, setListImage] = useState([]);
  const [listImageDetail, setListImageDetail] = useState<any>([]);
  const [visiblePleaseWait, setVisiblePleaseWait] = useState(false);
  const [visibleErrorRuntime, setVisibleErrorRuntime] = useState(false);
  const [disableScan, setDisableScan] = useState(false);
  const [isConfirmationModalOpened, setConfirmationModalOpened] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [justLoadedAutoKey, setJustLoadedAutoKey] = useState<number>(null);

  const createFolderForm = useRef(null);
  const ableToCreateFolder =
    drawerPermissions.findIndex((item) => item.code === DRAWER_PERMISSION.CREATE_FOLDER) > -1;
  const loading = folderLoading || createFolderLoading;

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
  }, [disableScan]);

  useEffect(() => {
    selectedFolders.length > 1
      ? dispatch(setOpenSingleFolder(false))
      : dispatch(updateSelectedFolders([]));
  }, []);

  const handleCreateSingleFolder = () => {
    setCreatingFolders(false);
    setIsModalOpened(true);
  };

  // const handleCreateMultipleFolders = () => {
  //   setCreatingFolders(true);
  //   setIsModalOpened(true);
  // };

  const handleModalOk = () => {
    if (creatingFolders) {
      createMultipleFolders();
    } else {
      createSingleFolder();
    }
  };

  const handleModalCancel = () => {
    if (createFolderCurrentStep === 2 && !fileList.length) {
      setConfirmationModalOpened(true);
      return;
    }
    setCreateFolderCurrentStep(1);
    setImportScanType(1);
    setIsModalOpened(false);
    setFileList([]);
  };

  const handleDiscardModalOk = () => {
    setImportScanType(tmpImportScanType);
    setTmpImportScanType(null);
    setFileList([]);
    setDiscardFilesModalOpened(false);
  };

  const handleDiscardModalCancel = () => {
    setTmpImportScanType(null);
    setDiscardFilesModalOpened(false);
  };

  const createMultipleFolders = () => {
    if (!Array.isArray(fileList) || !fileList.length) {
      notification.error({ message: 'Invalid', description: 'No files uploaded' });
      return;
    }

    if (fileList.length > 1) {
      notification.error({
        message: 'Invalid',
        description: 'Multiple files uploading not allowed',
      });
      return;
    }

    const formData: any = new FormData();
    formData.append('drawer_id', currentDrawer.id);
    fileList.forEach((file) => {
      importScanType === 2
        ? formData.append('files', file)
        : formData.append('files', file.originFileObj);
    });
    dispatch(uploadFolders(formData)).then((res) => {
      const {
        payload: { statusCode },
      } = res;
      if (statusCode && statusCode === 201) {
        notification.success({
          message: 'Folder(s) created successfully',
          description: 'Folder(s) were created successfully',
        });
        dispatch(getFolders({ drawer_id: currentDrawer.id }));
        setFileList([]);
        setIsModalOpened(false);
      }
    });
  };

  const createSingleFolder = () => {
    if (createFolderCurrentStep === 1) {
      if ((importScanType === 1 || importScanType === 2) && !fileList.length) {
        notification.error({ message: 'Invalid', description: 'No files uploaded' });
        return;
      }

      const { maxFileSize, maxFiles, maxTotalFileSize } = uploadFileError;
      const invalidUpload = maxFileSize || maxFiles || maxTotalFileSize;
      if (invalidUpload) {
        return;
      }
      setCreateFolderCurrentStep(2);
      return;
    }

    if (!createFolderForm || !createFolderForm.current) {
      return;
    }
    createFolderForm.current
      .validateFields()
      .then((values) => {
        const payload = { drawer_id: currentDrawer.id, fields: [] };
        Object.keys(values).forEach((fieldId) => {
          if (values[fieldId]) {
            const field = fields.find((item) => item.fieldId === +fieldId);
            let description = _.trim(values[fieldId]);
            if (field && field.typeId === FIELD_TYPE.NUMBER) {
              const { width } = field;
              const num = formatNumber(values[fieldId], DECIMAL_NUMBER[field.formatId]);
              const numSizeDiff = num.length - (width + 1);
              if (numSizeDiff > 0) {
                const updatedNum = num.substring(0, num.length - numSizeDiff);
                if (updatedNum[updatedNum.length - 1] === '.') {
                  description = parseFloat(updatedNum).toString();
                } else {
                  description = updatedNum;
                }
              } else {
                description = num;
              }
            }
            if (field && field.typeId === FIELD_TYPE.DATE) {
              description = _.trim(values[fieldId].format(DATE_FORMAT[field.formatId]));
            }
            if (field && field.typeId === FIELD_TYPE.PHONE_NUMBER) {
              description = formatPhoneNumber(values[fieldId], field.formatId);
            }
            if (field && field.typeId === FIELD_TYPE.SOCIAL_SECURITY && field.formatId === 8) {
              description = formatSocialSecurity(values[fieldId]);
            }
            payload.fields.push({ id: fieldId, description });
          }
        });
        dispatch(createFolder(payload)).then((res) => {
          const { payload: { statusCode = '', payload = [] } = {} } = res;
          if (statusCode === 200) {
            const { id: folderId = '', name: folderName = '' } = payload[0] || {};
            const formData: any = new FormData();
            formData.append(
              'destination',
              `${currentDrawer.image_path}/${currentDrawer.name}/${folderName}`,
            );
            formData.append('folder_id', folderId);
            formData.append('order_no', 0);
            formData.append('location', 'before');
            fileList.forEach((file) => {
              importScanType === 2
                ? formData.append('files[]', file)
                : formData.append('files[]', file.originFileObj);
            });
            dispatch(uploadFiles(formData)).then(() => {
              notification.success({
                message: 'Folder created successfully',
                description: React.createElement('span', {}, [
                  'Folder with ID ',
                  React.createElement('b', { key: uuidv4() }, folderId),
                  ' is created successfully',
                ]),
              });
              setFileList([]);
              setIsModalOpened(false);
              dispatch(handleSelectFolder(folderId));
              dispatch(getFolders({ drawer_id: currentDrawer.id }));
              dispatch(
                handleSetFolderToOpen({
                  drawerId: currentDrawer.id,
                  selectedFolderIds: [folderId],
                }),
              );
              navigate('/folder-management/folder-details/files');

              // Remove Auto Index Data
              if (justLoadedAutoKey) {
                dispatch(removeAutoIndex({ id: justLoadedAutoKey }))
                  .then(() => {
                    setJustLoadedAutoKey(null);
                  })
                  .catch((error) => console.log(error));
              }
            });
          }
        });
      })
      .catch((error) => console.log(error));
  };

  const renderModalFooter = (
    cancelText: string,
    okText: string,
    handleOk: () => void,
    handleCancel: () => void,
  ) => {
    const { maxFileSize, maxFiles, maxTotalFileSize } = uploadFileError;
    const uploadError = !!(maxFileSize || maxFiles || maxTotalFileSize);
    const disableOkBtn = uploadError || loading;
    return (
      <div>
        <CSButton
          className={`${styles.cs_modal_cancel_btn} ${loading ? styles.disabled : ''}`}
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </CSButton>
        <CSButton
          className={`${styles.cs_modal_ok_btn} ${loading ? styles.disabled : ''}`}
          onClick={handleOk}
          disabled={disableOkBtn}
        >
          {okText}
        </CSButton>
      </div>
    );
  };

  const renderOkButtonText = () => {
    switch (createFolderCurrentStep) {
      case 0:
        return 'Next';
      case 1:
        return 'Next';
      case 2:
        return 'Create';
      default:
        return 'Confirm';
    }
  };

  const renderCancelButtonText = () => {
    switch (createFolderCurrentStep) {
      case 0:
      case 1:
      case 2:
        return 'Cancel';
      default:
        return 'Cancel';
    }
  };

  const handleDataScanner = (object: any) => {
    const { Scanners = null } = object;
    if (Scanners != null && Scanners !== undefined) {
      const defaultScan = Scanners[0].ScannerName;
      setDataScanner(Scanners);
      setNameScanner(defaultScan);
      setVisibleScanPreview(true);
    }
  };

  const handleConfirmationOk = () => {
    setConfirmationModalOpened(false);
    setCreateFolderCurrentStep(1);
    setImportScanType(1);
    setIsModalOpened(false);
    setFileList([]);
  };

  const handleConfirmationCancel = () => {
    setConfirmationModalOpened(false);
  };

  let searchCriteriaCount = 0;
  if (!_.isEmpty(searchCriteria)) {
    searchCriteriaCount = Object.keys(searchCriteria).reduce((accumulator, currentValue) => {
      if (!_.isEmpty(searchCriteria[currentValue])) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);
  }

  let extra = null;
  if (searchCriteriaCount > 0) {
    extra = (
      <div className={styles.filter_icon}>
        <FilterFilled />
        <span>{searchCriteriaCount}</span>
      </div>
    );
  }

  let title = <span>All</span>;
  if (isSearching) {
    title = <span>{folders.length} Result(s)</span>;
  }

  return (
    <div className={`${styles.folder_list} list_folder`}>
      <ConfirmModal
        isOpen={isConfirmationModalOpened}
        headerIcon={<InfoIcon width={24} height={24} fill="" />}
        headerTitle="Confirmation"
        handleOk={handleConfirmationOk}
        handleCancel={handleConfirmationCancel}
        centered
        footer={renderModalFooter('Stay', 'Leave', handleConfirmationOk, handleConfirmationCancel)}
        wrapClassName="primary_modal_container"
        destroyOnClose
      >
        <p className={styles.modal_text}>
          You have not imported and scanned any file. Are you sure you want to leave?
        </p>
      </ConfirmModal>
      <ConfirmModal
        isOpen={isDiscardFilesModalOpened}
        headerIcon={<TrashBin width={20} height={20} fill="" />}
        headerTitle="Discard"
        handleOk={handleDiscardModalOk}
        handleCancel={handleDiscardModalCancel}
        centered
        footer={renderModalFooter(
          'Cancel',
          'Discard',
          handleDiscardModalOk,
          handleDiscardModalCancel,
        )}
        wrapClassName="primary_modal_container"
        destroyOnClose
      >
        <p className={styles.modal_text}>
          All uploaded files will be discarded. Are you sure you want to continue?
        </p>
      </ConfirmModal>
      <ConfirmModal
        width={720}
        isOpen={isModalOpened}
        headerIcon={<NewFolder width={24} height={24} fill="" />}
        headerTitle="Create New Folder"
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
        centered
        footer={renderModalFooter(
          renderCancelButtonText(),
          renderOkButtonText(),
          handleModalOk,
          handleModalCancel,
        )}
        wrapClassName="primary_modal_container"
        destroyOnClose
        maskClosable={!loading}
        closable={!loading}
      >
        <IndexFieldForm
          ref={createFolderForm}
          multipleFolders={creatingFolders}
          currentStep={createFolderCurrentStep}
          importScanType={importScanType}
          fileList={fileList}
          updateCurrentStep={(step: number) => setCreateFolderCurrentStep(step)}
          updateImportScanType={(type) => {
            if (!fileList.length) {
              setImportScanType(type);
              return;
            }

            setTmpImportScanType(type);
            if (fileList.length && type !== importScanType) {
              setDiscardFilesModalOpened(true);
            }
          }}
          updateFileList={(list) => setFileList(list)}
          handleDataScanner={handleDataScanner}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          autoIndexCb={(autoKey) => setJustLoadedAutoKey(autoKey)}
        />
      </ConfirmModal>
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
        setListFileImage={setFileList}
        listFileImage={fileList}
        setNameScanner={setNameScanner}
        setListImageDetail={setListImageDetail}
        setListImage={setListImage}
        listImage={listImage}
        listImageDetail={listImageDetail}
      />
      <ModalErrorRuntime visible={visibleErrorRuntime} setVisible={setVisibleErrorRuntime} />

      <Collapse
        className={styles.search_collapse}
        expandIconPosition="end"
        defaultActiveKey={['1']}
        items={[
          {
            key: '1',
            label: 'Search',
            children: (
              <SearchFolder
                onCriteriaChange={(values) => setSearchCriteria(values)}
                onSearch={(value) => setIsSearching(value)}
              />
            ),
            extra,
          },
        ]}
      />
      <div className={`${styles.head_list} list_head`}>
        <p>Folders: {title}</p>
        <div className={styles.btn_group}>
          {ableToCreateFolder && (
            // <CreateDropdown
            //   handleCreateSingleFolder={handleCreateSingleFolder}
            //   handleCreateMultipleFolders={handleCreateMultipleFolders}
            // />
            <Button
              className={styles.btn_create_folder}
              icon={<Plus width={16} height={16} fill="" />}
              onClick={handleCreateSingleFolder}
            >
              Create New Folder
            </Button>
          )}
          {selectedFolders.length > 0 && <BulkAction />}
        </div>
      </div>
      <hr />
      <div className={styles.table_list_folder}>
        <FolderList />
      </div>
    </div>
  );
}
