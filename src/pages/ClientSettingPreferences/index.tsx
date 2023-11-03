import styles from './index.module.scss';
import { Col, Collapse, Row, Input, Switch, Radio, RadioChangeEvent, Select } from 'antd';
import { useState } from 'react';
import search from '~/assets/images/client_pref_search.png';
import view from '~/assets/images/client_pref_view.png';
import print from '~/assets/images/Print.png';
import document from '~/assets/images/document_text.png';

const { Panel } = Collapse;

export default function ClientSettingPreferences() {
  const [radioValue, setRadioValue] = useState(1);
  const header = (title: string, imgSrc: any) => (
    <div className={styles.common_header}>
      <img src={imgSrc} />
      <p>{title}</p>
    </div>
  );

  const onRadioChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setRadioValue(e.target.value);
  };

  return (
    <div className={`${styles.main_panel} scroll_content preferences_main_panel`}>
      <p>Preferences</p>
      <hr />
      {/* Search */}
      <Collapse
        className={styles.search_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('Search', search)} key="1">
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Show Folder ID in Search Results</p>
            </Col>
            <Col style={{ display: 'flex', alignItems: 'center' }} span={18}>
              <Switch defaultChecked onChange={() => {}} />
            </Col>
          </Row>
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Maximum number of folder returned in Results</p>
            </Col>
            <Col span={18}>
              <Input className={styles.max_num_folder} size="large" placeholder="Enter numbers" />
            </Col>
          </Row>
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Show Folder ID in Search Results</p>
            </Col>
            <Col span={18}>
              <Radio.Group onChange={onRadioChange} value={radioValue}>
                <Radio value={1}>From Newest to Oldest</Radio>
                <Radio style={{ marginLeft: '40px' }} value={2}>
                  From Oldest to Newest
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      {/* View */}
      <Collapse
        className={styles.view_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('View', view)} key="1">
          <Row gutter={16} className={styles.row_layout}>
            <Col style={{ display: 'flex', alignItems: 'center' }} span={6}>
              <p className={styles.title}>Display size</p>
            </Col>
            <Col span={18}>
              <Select
                className={styles.view_select}
                defaultValue="Fit To Window"
                // onChange={handleChange}
                options={[
                  { value: 'Fit To Window', label: 'Fit To Window' },
                  { value: 'Fit to Width', label: 'Fit to Width' },
                  { value: 'Actual Size', label: 'Actual Size' },
                  { value: '50%', label: '50%' },
                  { value: '200%', label: '200%' },
                ]}
              />
            </Col>
          </Row>
        </Panel>
      </Collapse>
      {/* Print */}
      <Collapse
        className={styles.print_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('Print', print)} key="1">
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Maximum number of folder returned in Results</p>
            </Col>
            <Col span={18}>
              <Select
                className={styles.view_select}
                defaultValue="Printer 1"
                // onChange={handleChange}
                options={[
                  { value: 'Printer 1', label: 'Printer 1' },
                  { value: 'Printer 2', label: 'Printer 2' },
                  { value: 'Printer 3', label: 'Printer 3' },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Show Folder ID in Search Results</p>
            </Col>
            <Col span={18}>
              <Radio.Group onChange={onRadioChange} value={radioValue}>
                <Radio value={1}>From Newest to Oldest</Radio>
                <Radio style={{ marginLeft: '40px' }} value={2}>
                  From Oldest to Newest
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>Display size</p>
            </Col>
            <Col span={18}>
              <Select
                className={styles.view_select}
                defaultValue="Show Print Dialog"
                // onChange={handleChange}
                options={[
                  { value: 'Show Print Dialog', label: 'Show Print Dialog' },
                  { value: 'Print Current Document', label: 'Print Current Document' },
                  { value: 'Print Current Page', label: 'Print Current Page' },
                ]}
              />
            </Col>
          </Row>
        </Panel>
      </Collapse>
      {/* Documents */}
      <Collapse
        className={styles.document_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('Documents', document)} key="1">
          <Row gutter={16} className={styles.row_layout}>
            <Col span={6}>
              <p className={styles.title}>When importing PDF</p>
            </Col>
            <Col style={{ display: 'flex', alignItems: 'center' }} span={18}>
              <Switch defaultChecked onChange={() => {}} />
              <p className={styles.generate_title}>Generate Images</p>
              <Switch defaultChecked onChange={() => {}} />
              <p className={styles.generate_title}>Keep original PDF files</p>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
}
