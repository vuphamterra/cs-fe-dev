import React, { useEffect, useState, useRef } from 'react';
import styles from './index.module.scss';
import ClosedIcon from '~/assets/images/fileManagement/ic_closed.svg';
import { Button, Form, Modal, Select } from 'antd';
import {
  getDataTags,
  onColorFormatChanged,
  onPaperSizeChanged,
  onResolutionChanged,
  getResolutionItems,
  onScanModeChanged,
} from '~/assets/js/network';
import { PixColorFormat, Tags } from '~/assets/js/enums';
import { useDispatch } from 'react-redux';
import { setDefaultScannerSetting } from '~/store/ScannerSlice';
import { useAppSelector } from '~/store/hooks';

interface Props {
  visible: boolean;
  isValid: boolean;
  setVisible: (state: boolean) => void;
}
function SettingScanner(props: Props) {
  const { visible = false, isValid = false, setVisible = () => {} } = props;
  const [optionColor, setOptionColor] = useState([]);
  const [optionPagesize, setOptionPageSize] = useState([]);
  const [optionResolution, setOptionResolution] = useState([]);
  const [optionScanMode, setOptionScanMode] = useState([]);
  const defaultSetting = useRef([]);
  const defaultScannerSetting = useAppSelector((s) => s.scanner.defaultScannerSetting);
  const dispatch = useDispatch();
  const onCancel = () => setVisible(false);
  useEffect(() => {
    getDataTags(getSettingCallback);
  }, [isValid]);
  const getSettingCallback = async (data: any) => {
    if (data.TagID === Tags.TAG_PAGESIZE) {
      renderOptionsPageSize(data);
    }
    if (data.TagID === Tags.TAG_XRESOLUTION) {
      renderOptionResolution(data);
    }
    if (data.TagID === Tags.TAG_SCANTYPE) {
      renderOptionScanMode(data);
    }
    if (data.TagID === Tags.TAG_MODE_COMBO) {
      renderOptionColor(data);
    }

    // dataSettings.current.push(data);
  };
  const renderOptionsPageSize = (data: any) => {
    const df = { pageSize: data.Value.StringValue };
    // setDefaultSetting([...defaultSetting, df]);
    defaultSetting.current.push(df);
    const {
      Choices: { ChoiceKind = null, StringList = [] },
      Choices = {},
    } = data;
    const arr = [];
    if (Choices && ChoiceKind === 2 && StringList) {
      for (let i = 0; i < StringList.length; i++) {
        arr.push({ value: StringList[i], label: StringList[i] });
      }
      setOptionPageSize(arr);
      // return StringList.map((data: any) => {
      //   setOptionPageSize([...optionPagesize, { value: data, label: data }]);
      //   return { value: data, label: data };
      // });
    }
  };
  const renderOptionResolution = (data: any) => {
    const df = { resolution: data.Value.IntegerValue };
    // setDefaultSetting([...defaultSetting, df]);
    defaultSetting.current.push(df);

    const {
      Choices: { ChoiceKind = null, IntegerList = [] },
      Choices = {},
    } = data;
    const arr = [];
    if (Choices && ChoiceKind === 2 && IntegerList) {
      for (let i = 0; i < IntegerList.length; i++) {
        arr.push({ value: IntegerList[i], label: IntegerList[i] });
      }
      setOptionResolution(arr);
      // return IntegerList.map((data: any) => {
      //   setOptionResolution([...optionResolution, { value: data, label: data }]);
      //   return { value: data, label: data };
      // });
    } else if (Choices && ChoiceKind === 1) {
      const choiceItems = getResolutionItems(Choices);
      for (let i = 0; i < choiceItems.length; i++) {
        arr.push({ value: choiceItems[i], label: choiceItems[i] });
      }
      // return choiceItems.map((data: any) => {
      //   setOptionResolution([...optionResolution, { value: data, label: data }]);
      //   return { value: data, label: data };
      // });
    }
    setOptionResolution(arr);
  };
  const renderOptionScanMode = (data: any) => {
    const df = { scanMode: data.Value.IntegerValue };
    // setDefaultSetting([...defaultSetting, df]);

    defaultSetting.current.push(df);

    const {
      Choices: { ChoiceKind = null, IntegerList = [] },
      Choices = {},
    } = data;
    const arr = [];
    if (Choices && ChoiceKind === 2 && IntegerList) {
      for (let i = 0; i < IntegerList.length; i++) {
        arr.push({ value: IntegerList[i], label: Tags.getScanType(IntegerList[i]) });
      }
      setOptionScanMode(arr);
      // return IntegerList.map((data: any) => {
      //   setOptionScanMode([...optionScanMode, { value: data, label: Tags.getScanType(data) }]);
      //   return { value: data, label: Tags.getScanType(data) };
      // });
    }
  };

  const renderOptionColor = (data: any) => {
    const df = { color: data.Value.IntegerValue };
    // setDefaultSetting([...defaultSetting, df]);
    defaultSetting.current.push(df);

    const {
      Choices: { ChoiceKind = null, IntegerList = [] },
      Choices = {},
    } = data;
    const arr = [];
    if (Choices && ChoiceKind === 2 && IntegerList) {
      for (let i = 0; i < IntegerList.length; i++) {
        arr.push({ value: IntegerList[i], label: PixColorFormat.getFormatName(IntegerList[i]) });
      }
      setOptionColor(arr);
      // return IntegerList.map((data: any) => {
      //   setOptionColor([
      //     ...optionColor,
      //     { value: data, label: PixColorFormat.getFormatName(data) },
      //   ]);
      //   return { value: data, label: PixColorFormat.getFormatName(data) };
      // });
    }
  };
  const defaultDataSetting = (type: string) => {
    const dataArr = defaultScannerSetting || defaultSetting.current;
    if (dataArr.length) {
      const find = dataArr.find((val) => Object.keys(val)[0] === type);
      return find && find[type] ? find[type] : 0;
    }
  };

  const onFinish = (values: any) => {
    console.log(values);
    let arr;
    if (Object.values(values).includes(undefined)) {
      arr = defaultSetting.current.map((val: any) => {
        let data;
        for (const key in values) {
          if (!values[key] && key === Object.keys(val)[0]) {
            data = val;
          } else if (values[key] && key === Object.keys(val)[0]) {
            console.log(values[key]);
            data = { [key]: values[key] };
          }
        }
        return data;
      });
    }
    dispatch(setDefaultScannerSetting(arr));
    onCancel();
    // const data = defaultSetting.current.map((val: any, i: number) => {});
    // console.log('Success:', values);
  };

  return (
    <Modal
      bodyStyle={{ padding: '18px 0' }}
      wrapClassName={styles.SettingScanner}
      closeIcon={<img src={ClosedIcon as any} alt="closedIcon" />}
      // onOk={handleImport}
      width={700}
      onCancel={onCancel}
      open={visible}
      title="Setting Scanner"
      maskClosable
      destroyOnClose
      centered
      footer={[]}
    >
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        style={{ maxWidth: 600 }}
        // initialValues={{
        //   color: defaultDataSetting('color'),
        //   pageSize: defaultDataSetting('pageSize'),
        //   resolution: defaultDataSetting('resolution'),
        //   scanMode: defaultDataSetting('scanMode'),
        // }}
        onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <div className={styles.blockControl}>
          <Form.Item name="color" label="Color Mode">
            <Select
              placeholder="Select Color Mode"
              className={styles.optionScanner}
              defaultValue={defaultDataSetting('color')}
              options={optionColor}
              onChange={(e) => onColorFormatChanged(e)}
            ></Select>
          </Form.Item>
        </div>
        <div className={styles.blockControl}>
          <Form.Item name="pageSize" label="Paper Size">
            <Select
              placeholder="Select Paper size"
              className={styles.optionScanner}
              // defaultValue={filterData(dataSettings.current, 'pagesize')[0].label}
              defaultValue={defaultDataSetting('pageSize')}
              options={optionPagesize}
              onChange={onPaperSizeChanged}
            ></Select>
          </Form.Item>
        </div>
        <div className={styles.blockControl}>
          <Form.Item name="resolution" label="Resolution">
            <Select
              placeholder="Select Resolution"
              className={styles.optionScanner}
              defaultValue={defaultDataSetting('resolution')}
              // defaultValue={filterData(dataSettings.current, 'resolusion')[0].label}
              options={optionResolution}
              onChange={onResolutionChanged}
            ></Select>
          </Form.Item>
        </div>
        <div className={styles.blockControl}>
          <Form.Item name="scanMode" label="Scan Mode">
            <Select
              placeholder="Scan Mode"
              className={styles.optionScanner}
              defaultValue={defaultDataSetting('scanMode')}
              // defaultValue={filterData(dataSettings.current, 'scanmode')[0].label}
              options={optionScanMode}
              onChange={onScanModeChanged}
            ></Select>
          </Form.Item>
        </div>
        <div className={styles.blockControl}>
          <Button type="primary" htmlType="submit" className={styles.buttonSave}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default SettingScanner;
