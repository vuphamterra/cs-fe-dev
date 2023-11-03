import { useState } from 'react';
import { Col, Modal, Radio, Row, Input, Button, Select, Tooltip, Checkbox } from 'antd';

import exportIcon from '~/assets/images/export.png';
import styles from './styles.module.scss';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { exportFileByOption } from '~/store/FolderSlice';

interface ExModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const ModalExportFilePdf = (props: ExModalProps) => {
  const dispatch = useAppDispatch();
  const { open, setOpen } = props;
  const [from, setFrom] = useState<any>(1);
  const [isCorrectFrom, setIsCorrectFrom] = useState<boolean>(true);
  const [to, setTo] = useState<any>(2);
  const [isCorrectTo, setIsCorrectTo] = useState<boolean>(true);
  const [checkedVal, setCheckedVal] = useState<any>(1);
  const [selectFileValue, setSelectFileValue] = useState<string>('');
  const [isCorrectToSelectFile, setIsCorrectSelectFile] = useState<boolean>(true);
  const [format, setFormat] = useState<string>('muti-tiff');
  const [exportFileList, setExportFileList] = useState<number[]>([]);
  const [includeAnnotations, setIncludeAnnotations] = useState<boolean>(false);

  const folderId = useAppSelector((s) => s.file.folderId);

  const modalTitle = (
    <div className={styles.modal_header}>
      <img src={exportIcon} />
      <div>
        <p className={styles.title}>Export File</p>
      </div>
    </div>
  );

  const onExportByOption = () => {
    const body = {
      folder_id: folderId,
      is_group_pdf: false,
      file_ids: exportFileList,
      isAll: checkedVal === 1,
      isCurrentFile: checkedVal === 2,
      from: from,
      to: to,
      format: format,
      includeAnnotations: includeAnnotations
    };
    setOpen(false);
    dispatch(exportFileByOption(body));
  };

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={() => setOpen(false)} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button
        onClick={onExportByOption}
        disabled={((!isCorrectFrom || !isCorrectTo) && checkedVal === 4) || (!isCorrectToSelectFile && checkedVal === 3)}
        className={styles.export_btn}>
        Export
      </Button>
    </div>
  );

  const onClickCancel = () => {
    setOpen(false);
  };

  const onChangeCheckBox = (e: any) => {
    setCheckedVal(e.target.value);
  };

  const isNumeric = (value: string) => {
    return /^\d+$/.test(value);
  };

  const onChangeFrom = (e: any) => {
    setFrom(e.target.value);
    if (!isNumeric(e.target.value) || (e.target.value >= to) || e.target.value < 1) {
      setIsCorrectFrom(false);
    } else {
      setIsCorrectFrom(true);
      setIsCorrectTo(true);
    }
  };

  const onChangeTo = (e: any) => {
    setTo(e.target.value);
    if (!isNumeric(e.target.value) || e.target.value <= from) {
      setIsCorrectTo(false);
    } else {
      setIsCorrectFrom(true);
      setIsCorrectTo(true);
    }
  };

  const onIncludeChange = (e: any) => {
    setIncludeAnnotations(e.target.checked);
  };

  const onChangeSelectFile = (e: any) => {
    const list = [];
    setSelectFileValue(e.target.value);
    const split = e.target.value.split(',');
    let count = 0;
    for (const [index, value] of split.entries()) {
      if ((index + 1 === split.length && value.trim() !== '' && !isNumeric(value.trim())) ||
        (index + 1 !== split.length && !isNumeric(value.trim()))) {
        setIsCorrectSelectFile(false);
        break;
      }
      list.push(parseInt(value.trim()));
      count++;
    }
    if (count === split.length) {
      setIsCorrectSelectFile(true);
    }
    setExportFileList(list);
  };

  return (
    <Modal
      className={styles.export_modal}
      title={modalTitle}
      open={open}
      onCancel={onClickCancel}
      destroyOnClose
      centered
      footer={modalActions}
    >
      <div className={styles.modal_body}>
        <div className={styles.export_option} style={{ marginBottom: 24 }}>
          <p>Export Options</p>
          <Radio.Group className={styles.group_radio} onChange={onChangeCheckBox} value={checkedVal}>
            <Row style={{ padding: 10 }}>
              <Col span={8}>
                <Radio value={1}>All Files</Radio>
              </Col>
            </Row>
            <Row style={{ padding: 10 }}>
              <Col span={16}>
                <Radio value={2}>Current File</Radio>
              </Col>
            </Row>
            <Row style={{ padding: '5px 10px', alignItems: 'center' }}>
              <Col span={8}>
                <Radio value={3}>Select File</Radio>
              </Col>
              <Col span={13}>
                <Tooltip title="Using comma to distinguish the file">
                  <Input
                    style={{ borderColor: !isCorrectToSelectFile && checkedVal === 3 ? '#ff4d4f' : '', color: !isCorrectToSelectFile && checkedVal === 3 ? '#ff4d4f' : '' }}
                    value={selectFileValue}
                    onChange={onChangeSelectFile}
                    disabled={checkedVal !== 3} />
                </Tooltip>

              </Col>
            </Row>
            <Row style={{ padding: '5px 10px', alignItems: 'center' }}>
              <Col span={8}>
                <Radio value={4}>Select File range</Radio>
              </Col>
              <Col span={2}>
                <p>From</p>
              </Col>
              <Col span={4}>
                <Input
                  style={{ borderColor: !isCorrectFrom && checkedVal === 4 ? '#ff4d4f' : '', color: !isCorrectFrom && checkedVal === 4 ? '#ff4d4f' : '' }}
                  value={from}
                  onChange={onChangeFrom}
                  disabled={checkedVal !== 4} />
              </Col>
              <Col span={2}>
              </Col>
              <Col span={1}>
                <p>To</p>
              </Col>
              <Col span={4}>
                <Input
                  style={{ borderColor: !isCorrectTo && checkedVal === 4 ? '#ff4d4f' : '', color: !isCorrectTo && checkedVal === 4 ? '#ff4d4f' : '' }}
                  value={to}
                  onChange={onChangeTo}
                  disabled={checkedVal !== 4}
                />
              </Col>
            </Row>
          </Radio.Group>
        </div>
        <div className={styles.export_type}>
          <p>Export Formats</p>
          <Row style={{ padding: 10, alignItems: 'center' }}>
            <Col span={12}>
              <Select
                defaultValue={format}
                style={{ width: 200 }}
                onChange={(value) => setFormat(value)}
                options={[
                  { value: 'muti-tiff', label: 'Multi Page TIFF' },
                  { value: 'jpeg', label: 'JPEG' },
                  { value: 'pdf', label: 'PDF' },
                ]}
              />
            </Col>
            <Col span={12} onChange={onIncludeChange} style={{ paddingLeft: 10 }}>
              <Checkbox >Include Annotations</Checkbox>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};
export default ModalExportFilePdf;
