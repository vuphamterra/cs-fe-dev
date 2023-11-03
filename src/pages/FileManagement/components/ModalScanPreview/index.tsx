import React, { useEffect, useState, useRef } from 'react';
import { Button, Col, Form, Modal, Row, Select, Skeleton, Spin } from 'antd';
import styles from './index.module.scss';
import ClosedIcon from '~/assets/images/fileManagement/ic_closed.svg';
import Flip from '~/assets/images/flip-vertical-icon.png';
import {
  getAnnotation,
  getDataTags,
  getResolutionItems,
  onColorFormatChanged,
  onPaperSizeChanged,
  onResolutionChanged,
  onScanClick,
  onScanModeChanged,
  onScannerSelect,
  showPage,
} from '~/assets/js/network';
import CustomButton from '~/components/CustomButton';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { PixColorFormat, Tags } from '~/assets/js/enums';
import PlaceholderImage from '~/assets/images/placeholder-image.jpg';
import { getBase64 } from '~/utils';
import axios from 'axios';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../FileList/StrictModeDroppable';
import { useAppSelector } from '~/store/hooks';
interface Props {
  visible: boolean;
  setVisible: (state: boolean) => void;
  dataScanner: any;
  nameScanner: string;
  listFileImage: any[];
  listImage?: any[];
  listImageDetail: any[];
  setListFileImage: (state: any[]) => void;
  setListImageDetail: (state: any[]) => void;
  setListImage: (state: any) => void;
  setNameScanner: (state: string) => void;
}

function ModalScanPreview(props: Props) {
  const {
    visible = false,
    setVisible = () => {},
    dataScanner = [],
    nameScanner = '',
    listImage = [],
    listImageDetail = [],
    setNameScanner = () => {},
    setListFileImage = () => {},
    setListImage = () => {},
    setListImageDetail = () => {},
  } = props;
  const [loading, setLoading] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [degree, setDegree] = useState(0);
  const [flip, setFlip] = useState(1);
  const [imageDetail, setImageDetail] = useState('');

  const [optionColor, setOptionColor] = useState([]);
  const [optionPagesize, setOptionPageSize] = useState([]);
  const [optionResolution, setOptionResolution] = useState([]);
  const [optionScanMode, setOptionScanMode] = useState([]);
  const defaultSetting = useRef([]);
  const defaultScannerSetting = useAppSelector((s) => s.scanner.defaultScannerSetting);

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
  };

  useEffect(() => {
    const numberLenght = listImageDetail.length ? listImageDetail.length - 1 : 0;
    setImageDetail(listImageDetail[numberLenght]?.urlImage);
    setSelectedItem(numberLenght);
  }, [listImageDetail.length]);

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
    }
  };
  const renderOptionResolution = (data: any) => {
    const df = { resolution: data.Value.IntegerValue };

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
    } else if (Choices && ChoiceKind === 1) {
      const choiceItems = getResolutionItems(Choices);
      for (let i = 0; i < choiceItems.length; i++) {
        arr.push({ value: choiceItems[i], label: choiceItems[i] });
      }
    }
    setOptionResolution(arr);
  };

  const renderOptionScanMode = (data: any) => {
    const df = { scanMode: data.Value.IntegerValue };

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
    }
  };
  const onCancel = () => {
    loadingScan ? setVisible(true) : setVisible(false);
  };
  const handleShowPageDetail = (numberImage: number) => {
    showPage(numberImage, getImageDetail);
  };

  const getImageDetail = (page: any, data: any) => {
    let width = 0;
    let height = 0;
    const maxSize = 4000;
    if (data.ImageInfo.Width > maxSize || data.ImageInfo.height > maxSize) {
      if (data.ImageInfo.Width > data.ImageInfo.height) {
        width = maxSize;
      } else {
        height = maxSize;
      }
    }
    const urlImage = page.getCurrent(width, height) + getAnnotation();
    setImageDetail(urlImage);
    setLoadingScan(false);
    const idImage = listImage.length ? listImage.length : 0;
    // setSelectedItem(idImage);
    const newData = { id: idImage, urlImage, degree: 0, flip: 1 };

    // urlToObject(urlImage, idImage);

    setListImageDetail([...listImageDetail, newData]);
  };

  const handleChooseDetail = (index: number) => {
    const { urlImage } = listImageDetail[index];
    // oldSelect.current = index;
    setSelectedItem(index);
    setImageDetail(urlImage);
  };

  const renderScanners = (list: any) => {
    return list.map((val: any) => {
      const { ScannerName = '' } = val;
      return { value: ScannerName, label: ScannerName };
    });
  };

  const optionsScanner = dataScanner.length ? renderScanners(dataScanner) : [];

  const handleClickScan = (nameScanner: any) => {
    onScannerSelect(nameScanner, getScannerSetting);
  };

  const getScannerSetting = (data: any) => {
    const { ScannerModel = null, DeviceConnectionName = null } = data;
    if (ScannerModel && DeviceConnectionName) {
      setLoading(false);
      setIsValid(true);
    } else {
      setLoading(true);
    }
  };

  // callback get list image
  const getDataScannResult = (data: any, page: any) => {
    // const imageUrl = page.getCurrent() ? page.getCurrent(100, 0) : page.getOriginal(100, 0);
    const imageUrl = page.getOriginal(100, 0);
    const imageNumber = page?.getPageNumber();
    const id = listImage.length ? listImage.length : 0;
    const newData = { imageUrl, imageNumber, degree: 0, flip: 1, id };
    setListImage([...listImage, newData]);
    handleShowPageDetail(0);
  };

  // loading scan
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => prev + 1);

      if (!loadingScan) {
        clearInterval(interval);
        setProgress(0);
      } else if (progress === 60 && loadingScan) {
        setLoadingScan(false);
        clearInterval(interval);
        setProgress(0);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [loadingScan, progress]);

  const handleLeftRotate = () => {
    degree === 270 ? setDegree(0) : setDegree(degree - 90);
    const changeDegree =
      Math.abs(listImageDetail[selectedItem].degree) === 270
        ? 0
        : listImageDetail[selectedItem].degree - 90;
    listImageDetail[selectedItem].degree = changeDegree;
    listImage[selectedItem].degree = changeDegree;
  };

  const handleRightRotate = () => {
    degree === 270 ? setDegree(0) : setDegree(degree + 90);
    const changeDegree =
      Math.abs(listImageDetail[selectedItem].degree) === 270
        ? 0
        : listImageDetail[selectedItem].degree + 90;
    listImageDetail[selectedItem].degree = changeDegree;
    listImage[selectedItem].degree = changeDegree;
  };

  const handleFlip = () => {
    setFlip(flip * -1);

    listImageDetail[selectedItem].flip *= -1;
    listImage[selectedItem].flip *= -1;
  };

  const urlToObject = async (image: string, id: number) => {
    const response = await axios.get(image, { responseType: 'blob' });
    const blob = await response.data;
    const file = new File([blob], `image-scan-${id}.png`, { type: blob.type });
    return file;
  };
  const handleImportFinish = async () => {
    // url to object file
    const fileArray = listImageDetail.map((val: any, index: number) => {
      return urlToObject(val.urlImage, index);
    });
    const dataObjectFile = await Promise.all(fileArray);
    // object file to base 64
    const listBase64 = dataObjectFile.map(async (val: any, index: number) => {
      return await getBase64(val);
    });
    const dataBase64 = await Promise.all(listBase64);
    // rotate file with base64
    const rotateList = listImageDetail.map((val: any, index: number) => {
      const { degree: degreeFile, flip: flipFile } = val;
      return rotateImage(dataBase64[index], degreeFile, flipFile);
    });
    const dataRotate = await Promise.all(rotateList);
    // base 64 to object file

    const fileObject = dataRotate.map((val: any, index: number) => {
      return urlToObject(val, index);
    });
    const result = await Promise.all(fileObject);

    setListFileImage(result);
    await onCancel();
  };

  const defaultDataSetting = (type: string) => {
    const dataArr = defaultScannerSetting.length ? defaultScannerSetting : defaultSetting.current;
    if (dataArr.length) {
      const find = dataArr.find((val) => Object.keys(val)[0] === type);
      return find && find[type] ? find[type] : 0;
    }
  };

  const rotateImage = async (imageBase64: any, rotation: any, flip: any) => {
    const image = new Image();
    image.src = imageBase64;
    return new Promise((resolve, reject) => {
      image.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const absRotate = Math.abs(rotation);
        canvas.width = image.width;
        canvas.height = image.height;

        if (absRotate === 90 || absRotate === 270) {
          canvas.width = image.height;
          canvas.height = image.width;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation / 180) * Math.PI);
        if (flip === -1) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(image, -image.width / 2, -image.height / 2);

        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      };
    });
  };
  const onCancelDiscard = () => {
    if (!isValid) {
      setOptionColor([]);
      setListImageDetail([]);
      setListImage([]);
      setImageDetail('');
      setOptionPageSize([]);
      setIsValid(false);
      setOptionResolution([]);
      setOptionScanMode([]);
    }

    onCancel();
  };
  const handleRemoveItem = (index: number) => {
    const removeList = listImage.filter((val: any, i: number) => i !== index);
    const removeListDetail = listImageDetail.filter((val: any, i: number) => i !== index);
    setListImage(removeList);
    setListImageDetail(removeListDetail);
  };
  const handleOnDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) {
      return;
    }
    const reorderedItems = listImage.map((item, index) => {
      if (index === source.index) {
        return { ...listImage[destination.index] };
      }
      if (index === destination.index) {
        return { ...listImage[source.index] };
      }
      return { ...listImage[index] };
    });
    const reorderFileList = listImageDetail.map((val: any, index: number) => {
      if (index === source.index) {
        return { ...listImageDetail[destination.index] };
      }
      if (index === destination.index) {
        return { ...listImageDetail[source.index] };
      }
      return { ...listImageDetail[index] };
    });
    setListImage(reorderedItems);
    setListImageDetail(reorderFileList);
  };
  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      wrapClassName={styles.ModalScanPreview}
      closeIcon={<img src={ClosedIcon as any} alt="closedIcon" />}
      // onOk={handleImport}
      width={1200}
      onCancel={onCancel}
      open={visible}
      title="Scan Preview"
      maskClosable={!loadingScan}
      destroyOnClose
      centered
      footer={[]}
    >
      <Row>
        <Col span={5} className={styles.scannerInfo}>
          <div className={styles.blockControl}>
            <Form.Item name="scanner" label="Scanner">
              <div className={styles.valid}>
                <Select
                  placeholder="Select Scanner"
                  className={styles.optionScanner}
                  defaultValue={nameScanner}
                  options={optionsScanner}
                  loading={loading}
                  onChange={(value: any) => setNameScanner(value)}
                >
                  {/* {dataSettings.current && filterData(dataSettings.current, 'color')} */}
                </Select>
                {isValid && <CheckCircleFilled style={{ color: 'green' }} className="checked" />}
              </div>

              {loading ? (
                <Spin />
              ) : isValid ? (
                <></>
              ) : (
                <CustomButton
                  text="Connect"
                  backgroundColor="rgb(58, 82, 197)"
                  color="#fff"
                  onHandleClick={() => handleClickScan(nameScanner)}
                />
              )}
            </Form.Item>
          </div>
          {isValid && optionScanMode ? (
            <>
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
                <Form.Item name="paperSize" label="Paper Size">
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
                <Form.Item name="scanmode" label="Scan Mode">
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
                <Button
                  className={styles.buttonScan}
                  onClick={() => {
                    onScanClick(getDataScannResult);
                    setLoadingScan(true);
                  }}
                  disabled={loadingScan}
                >
                  Scan
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
        </Col>
        <Col span={4} offset={1}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <StrictModeDroppable droppableId="listFile">
              {(provided) => (
                <div
                  className={styles.listFile}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {!listImage.length ? (
                    <Skeleton.Image active={loadingScan} />
                  ) : (
                    listImage.map((val: any, index: number) => {
                      const { imageUrl = '', degree = 0, flip = 1 } = val;
                      const absDegree = Math.abs(degree);
                      const id = `item-${index}`;
                      return (
                        <Draggable key={id} draggableId={`${id}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                selectedItem === index
                                  ? `${styles.fileItem} ${styles.active}`
                                  : styles.fileItem
                              }
                              // key={index}
                              onClick={() => handleChooseDetail(index)}
                            >
                              {selectedItem === index && (
                                <CloseCircleFilled
                                  className={
                                    absDegree === 90 || absDegree === 270
                                      ? 'close move-icon'
                                      : 'close'
                                  }
                                  onClick={() => handleRemoveItem(index)}
                                />
                              )}
                              <img
                                src={imageUrl}
                                alt={`${index}`}
                                style={{
                                  transform: `rotate(${degree}deg) scaleX(${flip})`,
                                  transformOrigin: '50% 50%',
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {loadingScan && listImage.length ? <Skeleton.Image active={loadingScan} /> : null}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </Col>
        <Col span={13} offset={1} className="imagePreview">
          {loadingScan ? (
            <Skeleton.Image active={loadingScan} />
          ) : (
            <div
              className={styles.imageDetail}
              style={{
                transform: `rotate(${listImageDetail[selectedItem]?.degree}deg) scaleX(${listImageDetail[selectedItem]?.flip})`,
                transformOrigin: '50% 50%',
              }}
            >
              <img src={imageDetail || PlaceholderImage} alt="" />
            </div>
          )}

          <div className={styles.editControl}>
            <div className={styles.editItem} onClick={handleLeftRotate}>
              <RotateLeftOutlined />
            </div>
            <div className={styles.editItem} onClick={handleRightRotate}>
              <RotateRightOutlined />
            </div>
            <div className={styles.editItem} onClick={handleFlip}>
              <img src={Flip} alt="" />
            </div>
          </div>
          <div className={styles.buttonControl}>
            <Button className={styles.cancel} onClick={onCancelDiscard}>
              Cancel & Discard
            </Button>
            <CustomButton
              text="Import & Finish"
              backgroundColor="rgb(58, 82, 197)"
              color="#fff"
              disabled={!listImageDetail.length}
              onHandleClick={handleImportFinish}
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
}

export default ModalScanPreview;
