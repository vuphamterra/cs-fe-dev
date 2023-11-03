import { useState } from 'react';
import { Col, Modal, Radio, Row, Checkbox, Input, Button } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import settingIcon from '~/assets/images/export_settings.png';
import styles from './styles.module.scss';

interface ExModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const ExportModal = (props: ExModalProps) => {
  const { open, setOpen } = props;
  const [optionVal, setOptionVal] = useState<any>('');
  const [typeVal, setTypeVal] = useState<any>();
  const [checkedVal, setCheckedVal] = useState<any>([]);

  const modalTitle = (
    <div className={styles.modal_header}>
      <img src={settingIcon} />
      <div>
        <p className={styles.title}>Export Folder Settings</p>
        <p className={styles.sub_title}>Please select some export settings.</p>
      </div>
    </div>
  );

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={() => setOpen(false)} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button className={styles.export_btn}>Export</Button>
    </div>
  );

  const options = [
    { label: 'Export Include Annotations', value: 1 },
    { label: 'Include In Email As Attachment', value: 2 },
  ];

  const onClickCancel = () => {
    setOpen(false);
  };

  const onChangeOption = (e: RadioChangeEvent) => {
    setOptionVal(e.target.value);
  };

  const onChangeType = (e: RadioChangeEvent) => {
    setTypeVal(e.target.value);
  };

  const onChangeCheckBox = (checked: CheckboxValueType[]) => {
    setCheckedVal(checked);
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
        <div className={styles.export_option}>
          <p>Export Options</p>
          <Radio.Group className={styles.group_radio} onChange={onChangeOption} value={optionVal}>
            <Row>
              <Col span={8}>
                <Radio value={1}>All Files</Radio>
              </Col>
              <Col span={16}>
                <Radio value={2}>Current File</Radio>
              </Col>
            </Row>
          </Radio.Group>
        </div>
        <div className={styles.export_type}>
          <p>Export Type</p>
          <Radio.Group className={styles.group_radio} onChange={onChangeType} value={typeVal}>
            <Row>
              <Col span={8}>
                <Radio value={1}>PDF</Radio>
              </Col>
              <Col span={8}>
                <Radio value={2}>JPEG</Radio>
              </Col>
              <Col span={8}>
                <Radio value={3}>Multi-Page Tiff</Radio>
              </Col>
            </Row>
          </Radio.Group>
        </div>
        <div className={styles.option_choices}>
          <p>Optional Choices</p>
          <Checkbox.Group
            className={styles.checkbox_group}
            options={options}
            onChange={onChangeCheckBox}
          />
        </div>
        <div className={styles.export_derectory}>
          <p>Export Directory</p>
          <div className={styles.browse}>
            <Input />
            <Button>Browse</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ExportModal;
