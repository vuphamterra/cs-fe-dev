/* eslint-disable react/prop-types */
import {
  Col,
  Collapse,
  Row,
  Select,
  DatePickerProps,
  DatePicker,
  Space,
  Button,
  // Input,
  // Switch,
  ColorPicker,
  theme,
  Spin,
  Tag,
} from 'antd';
import auditTrail from '~/assets/images/audit_trail.png';
// import magnify from '~/assets/images/magnify.png';
// import securePath from '~/assets/images/secure_path.png';
// import cloudHosting from '~/assets/images/cloud_hosting.png';
// import dataSource from '~/assets/images/data_source.png';
import AuditModal from './components/AuditModal';
import SecureModal from './components/SecurePathModal';
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import { getListUser } from '~/store/UserSlice';
import { getAuditReport } from '~/store/AuditSlice';
import moment from 'moment';
import { Color } from 'antd/es/color-picker';
import { ColorPalette } from '~/components/Icons';
import { updateDatabase, getDatabases, selectDb } from '~/store/DatabaseSlice';
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';
import styles from './SettingPreferences.module.scss';

const { Panel } = Collapse;
const { useToken } = theme;

export default function SettingPreferences() {
  const { token } = useToken();
  const dispatch = useAppDispatch();
  const [audit, setAudit] = useState<boolean>(false);
  const [secure, setSecure] = useState<boolean>(false);
  // const [enableHosting, setEnableHosting] = useState<boolean>(false);
  const [userID, setUserID] = useState<Array<string>>([]);
  const [actionType, setActionType] = useState<Array<string>>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const listUser = useAppSelector((s) => s.user.listUser);
  const [currentColor, setCurrentColor] = useState(token.colorPrimary);
  const { loading: loadingDb, selectedDb } = useAppSelector((store) => store.db);

  const disableRunReportBtn = !!(
    startDate === '' ||
    endDate === '' ||
    !actionType.length ||
    !userID.length
  );

  useEffect(() => {
    dispatch(getListUser());
  }, [listUser.length]);

  const onStartDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setStartDate(dateString);
  };

  const onEndDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setEndDate(dateString);
  };

  // const onSwitchChange = () => {
  //   setEnableHosting(!enableHosting);
  // };

  const handleSelectedAction = (value) => {
    setActionType(value);
  };

  const handleSelectedUser = (value) => {
    setUserID(value);
  };
  const handleColorPickerChange = (value: Color, hex: string) => {
    setCurrentColor(hex);
  };

  const handleUpdateColorTheme = () => {
    if (!selectedDb || !currentColor) {
      return;
    }
    dispatch(updateDatabase({ id: selectedDb.id, color_palette: currentColor })).then(() => {
      dispatch(getDatabases({})).then((res) => {
        const {
          payload: { statusCode },
        } = res;
        if (statusCode && statusCode === 200) {
          const { payload: { payload: { data = [] } = {} } = {} } = res;
          if (Array.isArray(data) && data.length) {
            const db = data.find((item) => item.id === selectedDb.id);
            if (db) {
              dispatch(selectDb(db));
            }
          }
        }
      });
    });
  };

  const users = listUser.map((i) => [{ value: i.id, label: i.username }][0]);
  const allUsers = [...users];

  const createReport = () => {
    if (Date.parse(startDate) > Date.parse(endDate)) {
      alert('End date must be greater than start date!');
    }

    const startDateHour = moment(startDate).format('MM/DD/YYYY, 00:00:00').toString();
    const endDateHour = moment(endDate).format('MM/DD/YYYY, 23:59:59').toString();

    dispatch(
      getAuditReport({ from: startDateHour, to: endDateHour, actions: actionType, users: userID }),
    );
  };

  const header = (title: string, imgSrc: any) => (
    <div className={styles.common_header}>
      <img src={imgSrc} />
      <p>{title}</p>
    </div>
  );

  const tagRender = (props: CustomTagProps) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color="#bfbfbf"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          color: 'black',
          marginRight: 10,
          borderRadius: 10,
          height: '28px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <div className={`${styles.main_panel} scroll_content preferences_main_panel`}>
      <AuditModal open={audit} setOpen={() => setAudit(false)} />
      <SecureModal open={secure} setOpen={() => setSecure(false)} />
      <p>Preferences</p>
      <hr />
      {/* =====Audit Trail===== */}
      <Collapse
        defaultActiveKey={[1]}
        className={styles.audit_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel collapsible="disabled" header={header('Audit Trail', auditTrail)} key="1">
          <Row gutter={16} style={{ marginBottom: '18px' }}>
            <Col span={12}>
              <p className={styles.title}>From</p>
              <Space direction="vertical">
                <DatePicker onChange={onStartDateChange} format="MM/DD/YYYY" />
              </Space>
            </Col>
            <Col span={12}>
              <p className={styles.title}>To</p>
              <Space direction="vertical">
                <DatePicker placement="topLeft" onChange={onEndDateChange} format="MM/DD/YYYY" />
              </Space>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <p className={styles.title}>Action Type</p>
              <Select
                className={styles.select}
                size="large"
                mode="multiple"
                allowClear
                showArrow
                tagRender={tagRender}
                maxTagCount="responsive"
                placeholder="Select action"
                // defaultValue="Choose Actions"
                onChange={handleSelectedAction}
                options={[
                  {
                    value: 'Folder_Edit',
                    label: 'Folder Edit',
                  },
                  { value: 'Folder_Add', label: 'Folder Add' },

                  { value: 'Folder_Delete', label: 'Folder Delete' },
                  { value: 'Folder_Export', label: 'Folder Export' },
                  { value: 'File_Edit', label: 'File Edit' },
                  { value: 'File_Add', label: 'File Add' },
                  { value: 'File_Delete', label: 'File Delete' },
                  {
                    value: 'File_Export',
                    label: 'File Export',
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <p className={styles.title}>User</p>
              <Select
                className={styles.select}
                size="large"
                mode="multiple"
                allowClear
                showArrow
                tagRender={tagRender}
                maxTagCount="responsive"
                placeholder="Select user"
                onChange={handleSelectedUser}
                options={allUsers}
              />
            </Col>
          </Row>
          <div className={styles.audit_buttons_container}>
            {/* <Button
              className={styles.setting_btn}
              type="text"
              shape="round"
              size={'middle'}
              onClick={() => setAudit(true)}
            >
              Settings
            </Button> */}
            <Button
              disabled={disableRunReportBtn}
              className={styles.report_btn}
              type="primary"
              shape="round"
              size={'middle'}
              onClick={createReport}
              download
            >
              Run Report
            </Button>
          </div>
        </Panel>
      </Collapse>
      {/* =====Color Theme===== */}
      <Collapse
        defaultActiveKey={[2]}
        className={styles.cloud_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel
          header={
            <div className={styles.common_header}>
              <ColorPalette width={24} height={24} fill="" className={styles.color_palette_icon} />
              <p>Color Theme</p>
            </div>
          }
          key="2"
          className={styles.color_theme_panel}
        >
          {loadingDb && (
            <div className={styles.loading_block}>
              <Spin />
            </div>
          )}
          <div className="d-flex">
            <div>
              <p className={styles.title}>Color Theme Customization</p>
            </div>
            <div className="mx-3">
              <ColorPicker value={currentColor} onChange={handleColorPickerChange} />
            </div>
          </div>
          <div className={styles.cloud_buttons_container}>
            <Button
              disabled={currentColor === token.colorPrimary}
              className={styles.save_btn}
              type="primary"
              shape="round"
              size={'middle'}
              onClick={handleUpdateColorTheme}
            >
              Update
            </Button>
          </div>
        </Panel>
      </Collapse>
      {/* =====Secure Paths===== */}
      {/* <Collapse
        className={styles.secure_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('Secure Paths', securePath)} key="3">
          <div>
            <Row className={styles.secure_body}>
              <Row className={styles.secure_title}>
                <Col span={8}>
                  <p className={styles.title}>Path</p>
                </Col>
                <Col span={16}>
                  <p className={styles.title}>Account</p>
                </Col>
              </Row>
              <Row className={styles.secure_path_img}>
                <img src={magnify} />
              </Row>
            </Row>
          </div>

          <div className={styles.secure_buttons_container}>
            <Button className={styles.remove_btn} type="text" shape="round" size={'middle'}>
              Remove
            </Button>
            <Button
              onClick={() => setSecure(true)}
              className={styles.add_btn}
              type="primary"
              shape="round"
              size={'middle'}
            >
              Add
            </Button>
          </div>
        </Panel>
      </Collapse> */}
      {/* =====Cloud Hosting===== */}
      {/* <Collapse
        className={styles.cloud_collapse}
        // onChange={onChange}
        expandIconPosition={'end'}
      >
        <Panel header={header('Cloud Hosting', cloudHosting)} key="4">
          <Row gutter={16} style={{ marginBottom: '18px' }}>
            <Col span={6}>
              <p className={styles.title}>Web Service</p>
            </Col>
            <Col span={18}>
              <Input disabled={enableHosting} size="large" placeholder="Enter URL" />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: '18px' }}>
            <Col span={6}>
              <p className={styles.title}>Data Source</p>
            </Col>
            <Col span={17}>
              <Select
                disabled={enableHosting}
                defaultValue="Enter Data Source"
                // onChange={handleChange}
                options={[{ value: 'Enter Data Source', label: 'Enter Data Source' }]}
              />
            </Col>
            <Col span={1} className={styles.cloud_img}>
              <img src={dataSource} />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: '18px' }}>
            <Col span={6}>
              <p className={styles.title}>Enable Cloud Hosting</p>
            </Col>
            <Col span={18}>
              <Switch defaultChecked onChange={onSwitchChange} />
            </Col>
          </Row>
          <div className={styles.cloud_buttons_container}>
            <Button
              disabled={enableHosting}
              className={styles.cancel_btn}
              type="text"
              shape="round"
              size={'middle'}
            >
              Cancel
            </Button>
            <Button
              disabled={enableHosting}
              className={styles.verify_btn}
              type="primary"
              shape="round"
              size={'middle'}
            >
              Verify
            </Button>
            <Button
              disabled={enableHosting}
              className={styles.save_btn}
              type="primary"
              shape="round"
              size={'middle'}
            >
              Save
            </Button>
          </div>
        </Panel>
      </Collapse> */}
    </div>
  );
}
