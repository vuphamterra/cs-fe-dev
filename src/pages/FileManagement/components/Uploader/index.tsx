import React, { useState } from 'react';
import './index.scss';
import { Upload, theme } from 'antd';
import { UPLOAD_TYPE } from '~/constants/index';
import UploadIcon from '~/assets/images/fileManagement/ic_upload.svg';
import notification from '~/utils/notification/index';

const { Dragger } = Upload;
const { PNG, JPEG, PDF } = UPLOAD_TYPE;
interface Props {
  fileList: any;
  setFileList: (value: any) => void;
}

const Uploader: React.FC<Props> = (props) => {
  const { token } = theme.useToken();
  const { fileList, setFileList } = props;
  const [isError, setError] = useState<boolean>(false);

  const styleError = { border: '2px red dashed' };
  const style = { border: `2px ${token.colorPrimary} dashed` };

  const onChange = (info: any) => {
    // const reader = new FileReader();
    const type = info.file.type;
    const checkType = type === PNG || type === JPEG || type === PDF;
    if (!checkType) {
      setError(true);
      notification.error({
        message: 'File added failed',
        description: 'File must be type : pdf , jpeg, or jpg',
      });
      return false;
    }
    setError(false);
    notification.success({
      message: 'Files added successful',
      description: ' 2 documents has been added to Folder Test PDF',
    });
    setFileList(info.fileList);
    // reader.onload = (e) => {
    //   console.log('result', e.target.result);
    // };
    // reader.readAsDataURL(info.file.originFileObj);
  };

  return (
    <div className="CommonUploadImage">
      <Dragger
        beforeUpload={() => false}
        accept=".png, .jpg, .jpeg, .pdf"
        fileList={fileList}
        style={!isError ? style : styleError}
        onChange={onChange}
        maxCount={4}
        listType="picture"
      >
        <>
          <img className="uploadIcon" src={UploadIcon as any} alt="uploadIcon" />
          <p className="text">
            <strong>Click to import</strong> or drag and drop
          </p>
          <p className="text">SVG, PNG, JPG (max. 800x400px)</p>
        </>
      </Dragger>
    </div>
  );
};

export default Uploader;
