import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Col, Form, Modal, Row, Select, Spin, Steps, theme } from 'antd';
import ClosedIcon from '~/assets/images/fileManagement/ic_closed.svg';
import CustomButton from '~/components/CustomButton';
import { getDataTags, onScanClick, onScannerSelect, getResolutionItems } from '~/assets/js/network';
import { PixColorFormat, Tags } from '~/assets/js/enums';
import { CloseOutlined, FileImageOutlined, PlusCircleOutlined } from '@ant-design/icons';
const { Option } = Select;

interface Props {
  visible: boolean;
  dataScanner: any;
  setVisible: (state: boolean) => void;
  setDataInfoSetting: (state: any) => void;
  setVisibleScanPreview: (state: boolean) => void;
  setListImage: (state: any[]) => void;
  dataSettings: any;
  dataInfoSetting: any[];
  listImage: any[];
}

const ModalScanner = (props: Props) => {
  const { token } = theme.useToken();
  const {
    visible = false,
    setVisible = () => {},
    dataScanner = [],
    dataSettings,
    setDataInfoSetting = () => {},
    dataInfoSetting = [],
    setListImage = () => {},
    listImage = [],
  } = props;
  const [form] = Form.useForm();
  const [nameScanner, setNameScanner] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isValidSelect, setIsValidSelect] = useState(false);

  useEffect(() => {
    getDataTags(getSettingCallback);
  }, [isValidSelect]);
  const getSettingCallback = (data: any) => {
    dataSettings.current.push(data);
  };

  const steps = [
    {
      title: 'Step 1',
      description: 'Select Scanner',
    },
    {
      title: 'Step 2',
      description: 'Scan setting',
    },
    {
      title: 'Step 3',
      description: 'Scan file',
    },
  ];

  const onCancel = () => setVisible(false);
  const renderScanners = (list: any) => {
    return list.map((val: any, index: number) => {
      const { ScannerName = '' } = val;
      return (
        <Option value={ScannerName} selected key={index}>
          {ScannerName}
        </Option>
      );
    });
  };
  const handleClickScan = (nameScanner: any) => {
    onScannerSelect(nameScanner, getScannerSetting);
  };

  const getScannerSetting = (data: any) => {
    const { ScannerModel = null, DeviceConnectionName = null } = data;
    if (ScannerModel && DeviceConnectionName) {
      setLoading(false);
      setIsValidSelect(true);
    } else {
      setLoading(true);
    }
  };
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  const handleChange = (value: any) => {
    setDataInfoSetting([...dataInfoSetting, value]);
  };
  const step1 = (
    <>
      <div className={styles.blockControl}>
        <Form.Item name="scanner" label="Scanner">
          <Select
            placeholder="Select Scanner"
            onChange={(value: any) => setNameScanner(value)}
            className={styles.optionScanner}
            allowClear
          >
            {dataScanner.length && renderScanners(dataScanner)}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.selectedScanner}>
        {loading ? (
          <Spin />
        ) : (
          <CustomButton
            text="Ok"
            backgroundColor={token.colorPrimary}
            color="#fff"
            onHandleClick={() => handleClickScan(nameScanner)}
          />
        )}
      </div>
    </>
  );
  const step2 = (
    <>
      <div className={styles.blockControl}>
        <Form.Item name="color" label="Color Mode">
          <Select
            placeholder="Select Color Mode"
            className={styles.optionScanner}
            defaultActiveFirstOption={true}
            onChange={handleChange}
            filterOption={true}
          >
            {/* {dataScanner.length && renderScanners(dataScanner)} */}
            {dataSettings.current && filterData(dataSettings.current, 'color')}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.blockControl}>
        <Form.Item name="paperSize" label="Paper Size">
          <Select
            placeholder="Select Paper size"
            className={styles.optionScanner}
            defaultActiveFirstOption={true}
            onChange={handleChange}
            filterOption={true}
          >
            {dataSettings.current && filterData(dataSettings.current, 'pagesize')}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.blockControl}>
        <Form.Item name="resolution" label="Resolution">
          <Select
            placeholder="Select Resolution"
            className={styles.optionScanner}
            defaultActiveFirstOption={true}
            filterOption={true}
            onChange={handleChange}
          >
            {dataSettings.current && filterData(dataSettings.current, 'resolusion')}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.blockControl}>
        <Form.Item name="scanmode" label="Scan Mode">
          <Select
            placeholder="Scan Mode"
            className={styles.optionScanner}
            defaultActiveFirstOption={true}
            onChange={handleChange}
            filterOption={true}
          >
            {dataSettings.current && filterData(dataSettings.current, 'scanmode')}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.blockControl}>
        <Form.Item name="fileType" label="File type">
          <Select placeholder="Select File type" className={styles.optionScanner}>
            {/* {dataScanner.length && renderScanners(dataScanner)} */}
          </Select>
        </Form.Item>
      </div>
    </>
  );
  const step3 = (
    <div className={styles.stepLast}>
      <div id="thumbList">
        {listImage.map((val: any, index: number) => {
          // const { imageUrl, imageNumber } = val;
          return (
            <div className="divThumb" key={index}>
              {/* <img src={imageUrl} alt={`Page: ${imageNumber}`} /> */}
              <FileImageOutlined style={{ color: '#fff' }} />
              <span>Scann00{index}.png</span>
              <CloseOutlined style={{ color: '#fff' }} className="close" />
            </div>
          );
        })}
      </div>
      {loading ? (
        <div className="loading">
          <Spin />
        </div>
      ) : listImage.length > 0 ? (
        <div
          className={styles.anotherButton}
          onClick={() => {
            onScanClick(getDataScannResult);
            setLoading(true);
          }}
        >
          <PlusCircleOutlined /> Scan Another
        </div>
      ) : (
        <CustomButton
          text="Scan file"
          backgroundColor={token.colorPrimary}
          color="#fff"
          onHandleClick={() => {
            onScanClick(getDataScannResult);
            setLoading(true);
          }}
        />
      )}
    </div>
  );
  const getDataScannResult = (page: any) => {
    const imageUrl = page.getCurrent() ? page.getCurrent(100, 0) : page.getOriginal(100, 0);
    const imageNumber = page.getPageNumber();
    const newData = { imageUrl, imageNumber };
    // const array = [];
    // array.push(newData);
    setListImage([newData, ...listImage]);
    setLoading(false);
  };
  const renderContentStep = () => {
    switch (currentStep) {
      case 0:
        return step1;
      case 1:
        return step2;
      case 2:
        return step3;
      default:
        break;
    }
  };
  return (
    <>
      <Modal
        bodyStyle={{ padding: '24px 0' }}
        wrapClassName={styles.ModalScanner}
        closeIcon={<img src={ClosedIcon as any} alt="closedIcon" />}
        // onOk={handleImport}
        width={700}
        onCancel={onCancel}
        open={visible}
        title="Scan file"
        maskClosable
        destroyOnClose
        centered
        footer={[]}
      >
        <div
          className={
            currentStep === 0 ? `${styles.headerModal} ${styles.right}` : styles.headerModal
          }
        >
          {currentStep > 0 && (
            <div className={styles.back}>
              <CustomButton text="Back" color="#9F7FF9" onHandleClick={handleBack} />
            </div>
          )}

          {currentStep < steps.length - 1 && (
            <CustomButton
              text="Next"
              backgroundColor={token.colorPrimary}
              color="#fff"
              onHandleClick={handleNext}
              disabled={!isValidSelect}
            />
          )}
          {listImage.length > 0 && (
            <CustomButton
              text="Preview"
              backgroundColor={token.colorPrimary}
              color="#fff"
              // onHandleClick={() => setVisibleScanPreview(true)}
              // disabled={!isValidSelect}
            />
          )}
        </div>
        <Steps className={styles.Steps} current={currentStep} items={steps} />
        <Row>
          <Col span={24}>
            <Form
              form={form}
              name="scanner-form"
              className={styles.FormScanner}
              //   onFinish={onFinish}
            >
              <div className={styles.content}>{renderContentStep()}</div>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ModalScanner;

export const filterData = (list: any, type: string) => {
  // eslint-disable-next-line array-callback-return
  return list.map((val: any) => {
    const {
      Choices: { ChoiceKind = null, StringList = [], IntegerList = [] },
      Choices = {},
    } = val;
    if (val.TagID === Tags.TAG_PAGESIZE && type === 'pagesize') {
      if (Choices && ChoiceKind === 2 && StringList) {
        return StringList.map((value: any, i: number) => {
          return (
            <Option value={value} selected key={i}>
              {value}
            </Option>
          );
        });
      }
    } else if (val.TagID === Tags.TAG_XRESOLUTION && type === 'resolusion') {
      if (Choices && ChoiceKind === 2 && IntegerList) {
        return IntegerList.map((value: any, i: number) => {
          return (
            <Option value={value} selected key={i}>
              {value}
            </Option>
          );
        });
      } else if (Choices && ChoiceKind === 1) {
        const choiceItems = getResolutionItems(Choices);
        return choiceItems.map((value: any, i: number) => {
          return (
            <Option value={value} selected key={i}>
              {value}
            </Option>
          );
        });
      }
    } else if (val.TagID === Tags.TAG_SCANTYPE && type === 'scanmode') {
      if (Choices && ChoiceKind === 2 && IntegerList) {
        return IntegerList.map((value: any, i: number) => {
          return (
            <Option value={value} selected key={i}>
              {Tags.getScanType(value)}
            </Option>
          );
        });
      }
    } else if (val.TagID === Tags.TAG_MODE_COMBO && type === 'color') {
      if (Choices && ChoiceKind === 2 && IntegerList) {
        return IntegerList.map((value: any, i: number) => {
          return (
            <Option value={value} selected key={i}>
              {PixColorFormat.getFormatName(value)}
            </Option>
          );
        });
      }
    }
  });
};
