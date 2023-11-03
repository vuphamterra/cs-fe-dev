/* eslint-disable multiline-ternary */
import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Radio, Row, Spin, Upload, theme } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { getFilesByFolder, uploadFiles } from '~/store/FileSlice';
import { onLoadScannerClick } from '~/assets/js/network';
import { AddNewFileIcon, UploadFileIcon } from '~/components/Icons';
import './index.scss';
import { CloseOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
interface Props {
  visible: boolean;
  errorScan: boolean;
  disableScan: boolean;
  listFileImage?: any[];
  children?: React.ReactNode;
  setVisible: (value: boolean) => void;
  handleDataScanner: (object: any) => void;
  setListFileImage: (state: any[]) => void;
  setListImage: (state: any[]) => void;
  setListImageDetail: (state: any[]) => void;
}

const ModalAddNewFiles: React.FC<Props> = (props) => {
  const { token } = theme.useToken();
  const {
    listFileImage,
    visible,
    errorScan = false,
    disableScan = false,
    setVisible,
    handleDataScanner = () => { },
    setListFileImage = () => { },
    setListImageDetail = () => { },
    setListImage = () => { },
  } = props;
  const [fileList, setFileList] = useState<any[]>([]);
  const [importPosition, setImportPosition] = useState<number>(1);
  const [uploadFileError, setUploadFileError] = useState({
    maxFiles: '',
    maxFileSize: '',
    maxTotalFileSize: '',
  });

  const dispatch = useAppDispatch();
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer);
  const drawerList = useAppSelector((s) => s.draw.drawers);
  const currentFolder = useAppSelector((s) => s.file.currentFolder);
  const folderId = useAppSelector((s) => s.file.folderId);
  const currentFilePosition = useAppSelector((s) => s.file.currentFilePosition);
  const numberOfFile = useAppSelector((s) => s.file.files.length);
  const loading = useAppSelector((s) => s.file.loading);

  useEffect(() => {
    if (listFileImage.length > 0) {
      setFileList(listFileImage);
    }
  }, [listFileImage]);

  const title = (
    <div className="titleModal">
      <AddNewFileIcon width={44} height={44} fill="" />
      <div>
        <p className="title">Add New Files</p>
        <p className="subTitle">Add new files to this folder</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (listFileImage) {
      setFileList(listFileImage);
    }
  }, [listFileImage]);

  const propsUpload: UploadProps = {
    accept: '.png, .jpg, .jpeg, .pdf, .tif, .tiff',
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      console.log(file);
      setFileList([...fileList, file]);
      return false;
    },
    onChange: (fileList) => {
      setFileList(fileList.fileList);
      const sizeFileList = fileList.fileList.map((file) => file.size);
      setUploadFileError({
        ...uploadFileError,
        // maxFileSize:
        //   sizeFileList.filter((i) => i > 30000000).length > 0
        //     ? 'Maximum single file size: 30MB'
        //     : '',
        // maxFiles: fileList.fileList.length > 20 ? 'Maximum number of file upload: 20 files' : '',
        maxTotalFileSize:
          sizeFileList.reduce((a, b) => a + b, 0) > 300000000
            ? "The file you're trying to upload is too large. Please make sure the file is no larger than 300MB."
            : '',
      });
    },
    fileList,
  };

  const onClickImport = () => {
    let location = '';

    switch (importPosition) {
      case 4:
        location = 'replace';
        break;

      case 3:
        location = 'after';
        break;

      case 2:
        location = 'before';
        break;

      default:
        location = 'default';
        break;
    }

    const folderName = currentFolder.name;
    const drawerName =
      drawerList.length > 0 && drawerList.find((i) => i.id === currentDrawer.id).name;
    const formData = new FormData();
    formData.append('destination', `${currentDrawer.image_path}/${drawerName}/${folderName}`);
    formData.append('folder_id', `${folderId}`);
    formData.append('order_no', `${currentFilePosition}`);
    formData.append('location', `${location}`);
    const data = fileList.length > 0 ? fileList : listFileImage;
    data.forEach((file) => {
      Object.keys(file).includes('originFileObj')
        ? formData.append('files[]', file.originFileObj)
        : formData.append('files[]', file);
    });
    dispatch(uploadFiles(formData)).then(() => {
      dispatch(getFilesByFolder(folderId));
      onCancel();
    });
  };

  const renderModal = () => {
    return (
      <div className="upload_modal">
        <Dragger {...propsUpload} multiple listType="picture">
          <UploadFileIcon width={44} height={44} fill="" />
          <p className="text">
            <strong>Click to import</strong> or drag and drop
          </p>
          <p className="text">PNG, JPG, PDF, JPEG, TIF, TIFF</p>
        </Dragger>
        <div className="upload_error">
          <p>{uploadFileError.maxFileSize}</p>
          <p>{uploadFileError.maxFiles}</p>
          <p>{uploadFileError.maxTotalFileSize}</p>
        </div>
        <div>
          <Radio.Group
            className='insert-pos-option'
            value={importPosition}
            onChange={(e) => setImportPosition(e.target.value)}
          >
            <Row>
              <Col span={12}>
                <Radio value={1}>Append(Default)</Radio>
              </Col>
              <Col span={12}>
                <Radio value={2}>Insert Before Current Page</Radio>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Radio value={3}>Insert After Current Page</Radio>
              </Col>
              <Col span={12}>
                <Radio value={4}>Replace</Radio>
              </Col>
            </Row>
          </Radio.Group>
        </div>
      </div>
    );
  };

  const handleClick = () => {
    onLoadScannerClick(handleDataScanner);
  };
  const renderFooter = () => {
    return (
      <div className="footer">
        <Button
          onClick={onClickImport}
          style={{ background: token.colorPrimary }}
          disabled={
            fileList.length === 0 ||
            Object.values(uploadFileError).filter((i) => i !== '').length > 0 ||
            loading
          }
        >
          Import
        </Button>
        <Button
          onClick={handleClick}
          style={{ background: errorScan ? 'red' : token.colorPrimary }}
          disabled={loading}
        >
          {errorScan ? 'Try again' : disableScan ? 'Conect runtime' : 'Scan'}
        </Button>
      </div>
    );
  };

  const onCancel = () => {
    setVisible(false);
    setFileList([]);
    setListFileImage([]);
    setListImage([]);
    setListImageDetail([]);
  };

  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      wrapClassName="ModalAddNewFiles"
      closeIcon={<CloseOutlined />}
      onCancel={onCancel}
      open={visible}
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

export default ModalAddNewFiles;
