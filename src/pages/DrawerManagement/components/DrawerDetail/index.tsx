/* eslint-disable indent */
/* eslint-disable multiline-ternary */
import {
  Col,
  Dropdown,
  MenuProps,
  Row,
  Space,
  theme,
  Form,
  Button,
  Input,
  Table,
  Spin,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import styles from '../../DrawerManagement.module.scss';
import { ChevronDown, Duplicate, Purge, TrashBin } from '~/components/Icons';
import { useNavigate } from 'react-router-dom';
import { ReactElement, cloneElement, useEffect, useState } from 'react';
import {
  clearAutoIndexData,
  clearKeyDataReferenceData,
  downloadAutoIndexCSVTemplate,
  downloadKeyDataReferenceCSVTemplate,
  duplicateDrawer,
  getDrawerData,
  getDrawerDetail,
  importAutoIndexCSV,
  importKeyDataReferenceCSV,
  purgeDrawer,
  removeDrawer,
} from '~/store/DrawerSlice';
import moment from 'moment';
import ConfirmModal from '~/components/ConfirmModal';
import { isStringEmpty } from '~/utils/validations';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import noData from '~/assets/images/nodata.svg';
import { ColumnsType } from 'antd/es/table';
import KeyDataRef from '../KeyDataRef';
import { hasAutoIndex, hasKeyReference } from '../../utils';
import { ClearOutlined, DownloadOutlined, ImportOutlined, UploadOutlined } from '@ant-design/icons';
import { DECIMAL_NUMBER, FIELD_TYPE_CODE, REGEX } from '~/constants';
import ReviewKeyDataRefImport from '../ReviewKeyDataRefImport';
import { KeyDataRefImportType } from '../../interfaces';
import { validateKeyDataRefImport } from '../../validator';
import { formatNumber } from '~/utils';

const { useToken } = theme;

interface FlagType {
  id: number;
  name: string;
}

interface FieldTableDataType {
  id: number;
  name: string;
  flags: Array<FlagType>;
  format_id: number;
  width: number;
  description: string | null;
}

const dropdownItems: MenuProps['items'] = [
  {
    label: 'Edit Drawer',
    key: 'edit-drawer',
  },
  {
    type: 'divider',
  },
  {
    label: 'Remove Drawer',
    key: 'remove-drawer',
  },
  {
    type: 'divider',
  },
  {
    label: 'Duplicate Drawer',
    key: 'duplicate-drawer',
  },
  {
    type: 'divider',
  },
  {
    label: 'Purge Drawer',
    key: 'purge-drawer',
  },
];

const fieldTableColumns: ColumnsType<FieldTableDataType> = [
  {
    title: 'Field Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Field Type',
    dataIndex: 'type',
    key: 'fieldType',
    render(value) {
      return value && value.type_name ? value.type_name : '';
    },
  },
  {
    title: 'Width',
    dataIndex: 'width',
    key: 'width',
    render(value) {
      return value > 0 ? value : '-';
    },
  },
  {
    title: 'Required',
    dataIndex: 'flags',
    key: 'flags',
    render(value) {
      const req = value.map((i) => i.name).includes('Required');
      return req ? 'Yes' : 'No';
    },
  },
  {
    title: 'Unique',
    dataIndex: 'flags',
    key: 'flags',
    render(value) {
      const unique = value.map((i) => i.name).includes('Unique Key');
      return unique ? 'Yes' : 'No';
    },
  },
];

const DrawerDetail = () => {
  const navigate = useNavigate();
  const { token } = useToken();
  const selectedId = useAppSelector((s) => s.draw.selectedDrawerId);
  const drawers = useAppSelector((s) => s.draw.drawers);
  const [isRemoveConfirmModalOpen, setIsRemoveConfirmModalOpen] = useState(false);
  const [isDuplicateConfirmModalOpen, setIsDuplicateConfirmModalOpen] = useState(false);
  const [isPurgeConfirmModalOpen, setIsPurgeConfirmModalOpen] = useState(false);
  const [isClearDataConfirmModalOpen, setIsClearDataConfirmModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [duplicateDrawerForm] = Form.useForm();
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer) || null;
  const { selectedDb } = useAppSelector((store) => store.db);
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.draw.loading);
  const [importLoading, setImportLoading] = useState(false);
  const [hasKeyDataRef, setHasKeyDataRef] = useState(false);
  const [hasAutoIndexFlag, setHasAutoIndexFlag] = useState(false);
  const [keyIndexImportedData, setKeyIndexImportedData] = useState<KeyDataRefImportType[]>([]);

  const uploadCsvProps: UploadProps = {
    accept: '.csv',
    multiple: false,
    showUploadList: false,
    beforeUpload(file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        const csvData = e.target.result as string;
        const csvRowData = csvData.split('\n');
        const { fields = [] } = currentDrawer || {};
        if (hasKeyReference(fields)) {
          processImportingKeyDataReference(csvRowData);
        } else if (hasAutoIndex(fields)) {
          processImportingAutoIndex(csvRowData);
        }
      };
      return false;
    },
    fileList: [],
  };

  const processImportingKeyDataReference = (data = []) => {
    const keyIndexImportedData = data.reduce((accumulator, currentItem, currentIndex) => {
      if (_.isEmpty(currentItem)) {
        return accumulator;
      }
      const cellValues = currentItem
        .replace('\r', '')
        .split(',')
        .map((value) => _.trim(value).replace('"', ''));
      let fields = [];
      if (currentIndex === 0) {
        fields = cellValues.reduce((fieldAccumulator, currentFieldInfo) => {
          const fieldInfo = currentFieldInfo.split('|');
          const idInfo = fieldInfo[2].split(':');
          const fieldDetails = currentDrawer.fields.find((field) => field.id === +idInfo[1]);
          const field: {
            id: number | string;
            name: string;
            fieldDetails: any;
            isKeyRef?: boolean;
            isDataRef?: boolean;
            isAutoIndex?: boolean;
          } = {
            id: +idInfo[1] || '',
            name: fieldInfo[0] || '',
            isKeyRef: fieldInfo[1] && fieldInfo[1] === 'KY_REF',
            isDataRef: fieldInfo[1] && fieldInfo[1] === 'DTA_RF',
            fieldDetails,
          };
          fieldAccumulator.push(field);
          return fieldAccumulator;
        }, []);
      } else {
        fields = _.cloneDeep(accumulator[0].fields);
      }

      const row = {
        id: uuidv4(),
        rowIdx: currentIndex,
        cellValues,
        fields,
        valid: true,
        messages: [],
      };
      accumulator.push(row);
      return accumulator;
    }, []);
    validateKeyDataRefImport(keyIndexImportedData.filter((item) => item.rowIdx > 0));
    setKeyIndexImportedData(keyIndexImportedData);
    setIsReviewModalOpen(true);
  };

  const processImportingAutoIndex = (data = []) => {
    const importedAutoIndexData = data.reduce((accumulator, currentItem, currentIndex) => {
      if (_.isEmpty(currentItem)) {
        return accumulator;
      }
      const cellValues = currentItem
        .replace('\r', '')
        .split(',')
        .map((value) => _.trim(value).replace('"', ''));
      let fields = [];
      if (currentIndex === 0) {
        fields = cellValues.reduce((fieldAccumulator, currentFieldInfo) => {
          const fieldInfo = currentFieldInfo.split('|');
          const idInfo = fieldInfo[1].split(':');
          const fieldDetails = currentDrawer.fields.find((field) => field.id === +idInfo[1]);
          const field: {
            id: number | string;
            name: string;
            fieldDetails: any;
            isAutoIndex?: boolean;
          } = {
            id: +idInfo[1] || '',
            name: fieldInfo[0] || '',
            isAutoIndex: true,
            fieldDetails,
          };
          fieldAccumulator.push(field);
          return fieldAccumulator;
        }, []);
      } else {
        fields = _.cloneDeep(accumulator[0].fields);
      }

      const row = {
        id: uuidv4(),
        rowIdx: currentIndex,
        cellValues,
        fields,
        valid: true,
        messages: [],
      };
      accumulator.push(row);
      return accumulator;
    }, []);
    validateKeyDataRefImport(importedAutoIndexData.filter((item) => item.rowIdx > 0));
    setKeyIndexImportedData(importedAutoIndexData);
    setIsReviewModalOpen(true);
  };

  const onClickDropdownItem: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'edit-drawer':
        navigate(selectedId.toString());
        break;
      case 'remove-drawer':
        setIsRemoveConfirmModalOpen(true);
        break;
      case 'duplicate-drawer':
        setIsDuplicateConfirmModalOpen(true);
        break;
      case 'purge-drawer':
        setIsPurgeConfirmModalOpen(true);
        break;
    }
  };

  const handleRemoveConfirmModalOk = () => {
    if (currentDrawer) {
      dispatch(removeDrawer({ id: currentDrawer.id, current_drawer: currentDrawer })).then(
        (res) => {
          const {
            payload: { statusCode },
          } = res;
          if (statusCode && statusCode === 200) {
            dispatch(getDrawerData({})).then((res) => {
              const {
                payload,
                payload: { statusCode },
              } = res;
              if (statusCode && statusCode === 200) {
                const {
                  payload: { data },
                } = payload;
                if (Array.isArray(data) && data.length) {
                  dispatch(getDrawerDetail({ id: data[0].id }));
                }
              }
            });
            setIsRemoveConfirmModalOpen(false);
          }
        },
      );
    }
  };

  const handleRemoveConfirmModalCancel = () => {
    setIsRemoveConfirmModalOpen(false);
  };

  const handleDuplicateConfirmModalOk = () => {
    duplicateDrawerForm
      .validateFields()
      .then((values) => {
        if (isStringEmpty(values.name)) {
          duplicateDrawerForm.setFieldsValue({ name: '' });
          duplicateDrawerForm.submit();
          return;
        }
        const payload = {
          name: _.trim(values.name),
          description: _.trim(values.description),
          database_id: selectedDb.id,
          drawer_id: currentDrawer.id,
          current_drawer: currentDrawer,
        };
        dispatch(duplicateDrawer(payload)).then((res) => {
          const {
            payload: { statusCode },
          } = res;
          if (statusCode && statusCode === 200) {
            dispatch(getDrawerData({})).then((res) => {
              const {
                payload,
                payload: { statusCode },
              } = res;
              if (statusCode && statusCode === 200) {
                const {
                  payload: { data },
                } = payload;
                if (Array.isArray(data) && data.length) {
                  dispatch(getDrawerDetail({ id: data[0].id }));
                }
              }
            });
            setIsDuplicateConfirmModalOpen(false);
          }
        });
      })
      .catch(() => { });
  };

  const handleDuplicateConfirmModalCancel = () => {
    setIsDuplicateConfirmModalOpen(false);
  };

  const handlePurgeConfirmModalOk = () => {
    const payload = {
      id: currentDrawer.id,
      current_drawer: currentDrawer,
    };
    dispatch(purgeDrawer(payload));
    setIsPurgeConfirmModalOpen(false);
  };

  const handlePurgeConfirmModalCancel = () => {
    setIsPurgeConfirmModalOpen(false);
  };

  const handleClearDataConfirmModalOk = () => {
    if (!currentDrawer || !currentDrawer.id) {
      return;
    }
    setImportLoading(true);
    const { fields = [] } = currentDrawer || {};
    const api = hasKeyReference(fields)
      ? clearKeyDataReferenceData
      : hasAutoIndex(fields)
        ? clearAutoIndexData
        : null;
    if (!api) {
      return;
    }
    dispatch(api({ id: currentDrawer.id }))
      .then(() => {
        setImportLoading(false);
      })
      .catch(() => {
        setImportLoading(false);
      });
    setIsClearDataConfirmModalOpen(false);
  };

  const handleClearDataConfirmModalCancel = () => {
    setIsClearDataConfirmModalOpen(false);
  };

  const handleImportKeyIndexConfirmModalOk = () => {
    if (!keyIndexImportedData.filter((item) => item.rowIdx > 0).length) {
      return;
    }
    setIsReviewModalOpen(false);
    const { fields = [] } = currentDrawer || {};
    if (hasKeyReference(fields)) {
      callingAPIImportKeyDataReference();
    } else if (hasAutoIndex(fields)) {
      callingAPIImportAutoIndex();
    }
  };

  const callingAPIImportKeyDataReference = () => {
    keyIndexImportedData.forEach((item, idx) => {
      const values = _.cloneDeep(item.cellValues);
      if (idx > 0) {
        item.cellValues.forEach((v, vIdx) => {
          const { type, format_id: formatId } = item.fields[vIdx].fieldDetails;
          if (type.type_code === FIELD_TYPE_CODE.NUMBER) {
            values[vIdx] = formatNumber(v, DECIMAL_NUMBER[formatId]);
          }
        });
      }
      item.cellValues = _.cloneDeep(values);
    });
    const validData = keyIndexImportedData.reduce((accumulator, currentItem) => {
      if (currentItem.rowIdx > 0 && currentItem.valid) {
        const keyRefFieldIdx = currentItem.fields.findIndex((f) => f.isKeyRef);
        if (keyRefFieldIdx > -1) {
          const dataRef = currentItem.cellValues.map((value, vIdx) => ({
            field_id: currentItem.fields[vIdx].id,
            name: value,
          }));
          const obj = {
            field_id: currentItem.fields[keyRefFieldIdx].id,
            name: currentItem.cellValues[keyRefFieldIdx],
            data_ref: dataRef,
          };
          accumulator.push(obj);
        }
      }
      return accumulator;
    }, []);
    const payload = {
      drawer_id: currentDrawer.id,
      key_ref: validData,
    };
    setImportLoading(true);
    // Call API
    dispatch(importKeyDataReferenceCSV(payload))
      .then(() => {
        setImportLoading(false);
      })
      .catch(() => {
        setImportLoading(false);
      });
  };

  const callingAPIImportAutoIndex = () => {
    keyIndexImportedData.forEach((item, idx) => {
      const values = _.cloneDeep(item.cellValues);
      if (idx > 0) {
        item.cellValues.forEach((v, vIdx) => {
          const { type, format_id: formatId } = item.fields[vIdx].fieldDetails;
          if (type.type_code === FIELD_TYPE_CODE.NUMBER) {
            values[vIdx] = formatNumber(v, DECIMAL_NUMBER[formatId]);
          }
        });
      }
      item.cellValues = _.cloneDeep(values);
    });
    const validData = keyIndexImportedData.reduce((accumulator, currentItem) => {
      if (currentItem.rowIdx > 0 && currentItem.valid) {
        const autoIndexData = currentItem.cellValues.map((value, vIdx) => ({
          field_id: currentItem.fields[vIdx].id,
          name: value,
        }));
        accumulator.push([...autoIndexData]);
      }
      return accumulator;
    }, []);
    const payload = {
      drawer_id: currentDrawer.id,
      auto_index: validData,
    };
    setImportLoading(true);
    // Call API
    dispatch(importAutoIndexCSV(payload))
      .then(() => {
        setImportLoading(false);
      })
      .catch(() => {
        setImportLoading(false);
      });
  };

  const handleImportKeyIndexConfirmModalCancel = () => {
    setIsReviewModalOpen(false);
  };

  const renderConfirmModalFooter = (
    cancelText: string,
    okText: string,
    handleOk: () => void,
    handleCancel: () => void,
    disabledOk: boolean = false,
  ) => {
    return (
      <div className={styles.modal_footer}>
        <Button className={`cs_modal_cancel_btn ${styles.cancel_btn}`} onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button
          className={`cs_modal_ok_btn ${styles.remove_btn}`}
          onClick={handleOk}
          disabled={disabledOk}
        >
          {okText}
        </Button>
      </div>
    );
  };

  const locale = {
    emptyText: (
      <div>
        <img style={{ width: '152px', height: '128px' }} src={noData} alt="" />
      </div>
    ),
  };

  const handleDownloadTemplate = () => {
    if (!currentDrawer || !currentDrawer.id) {
      return;
    }
    const { fields = [] } = currentDrawer || {};
    const api = hasKeyReference(fields)
      ? downloadKeyDataReferenceCSVTemplate
      : hasAutoIndex(currentDrawer.fields)
        ? downloadAutoIndexCSVTemplate
        : null;
    if (!api) {
      return;
    }
    dispatch(api({ drawerId: currentDrawer.id })).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.payload]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = hasKeyReference(fields)
        ? 'Key_Data_Reference_CSV_Template.csv'
        : hasAutoIndex(fields)
          ? 'Auto_Index_CSV_Template.csv'
          : '';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    });
  };

  const handleClearData = () => {
    setIsClearDataConfirmModalOpen(true);
  };

  useEffect(() => {
    duplicateDrawerForm.setFieldsValue({ name: currentDrawer ? `${currentDrawer.name}_Copy` : '' });
    duplicateDrawerForm.setFieldsValue({ description: '' });
  }, [currentDrawer]);

  const { fields: currentDrawerFields = [] } = currentDrawer || {};

  const drawerHasKeyRef =
    currentDrawer && currentDrawer.fields ? hasKeyReference(currentDrawerFields) : false;

  const drawerHasAutoIndex =
    currentDrawer && currentDrawer.fields ? hasAutoIndex(currentDrawerFields) : false;

  const disableClearDataBtn =
    (drawerHasKeyRef && !hasKeyDataRef) || (drawerHasAutoIndex && !hasAutoIndexFlag);

  return (
    <div className={styles.right_column}>
      <ConfirmModal
        headerTitle="Duplicate drawer"
        headerIcon={<Duplicate width={20} height={20} fill="" />}
        handleOk={handleDuplicateConfirmModalOk}
        handleCancel={handleDuplicateConfirmModalCancel}
        isOpen={isDuplicateConfirmModalOpen}
        centered
        footer={renderConfirmModalFooter(
          'Cancel',
          'Duplicate',
          handleDuplicateConfirmModalOk,
          handleDuplicateConfirmModalCancel,
        )}
        wrapClassName="primary_modal_container"
      >
        <Form form={duplicateDrawerForm} layout="vertical">
          <Form.Item
            className={styles.form_item}
            label="Name"
            name="name"
            rules={[
              {
                min: 4,
                message: 'Minimum 4 characters',
              },
              {
                pattern: REGEX.DRAWER_NAME,
                message: 'Invalida drawer name',
              },
              {
                max: 64,
                message: 'Maximum 64 characters',
              },
              () => ({
                validator(rules, value) {
                  if (isStringEmpty(value)) {
                    return Promise.reject(
                      new Error('Drawer name cannot be empty. Please enter the drawer name'),
                    );
                  }
                  if (drawers.find((item) => _.trim(item.name) === _.trim(value))) {
                    return Promise.reject(new Error('This name already exists'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 200, message: 'Maximum 200 characters' }]}
          >
            <Input placeholder="Enter description (optional)" />
          </Form.Item>
        </Form>
      </ConfirmModal>
      <ConfirmModal
        headerTitle="Remove this drawer"
        headerIcon={<TrashBin width={20} height={20} fill="" />}
        handleOk={handleRemoveConfirmModalOk}
        handleCancel={handleRemoveConfirmModalCancel}
        isOpen={isRemoveConfirmModalOpen}
        centered
        footer={renderConfirmModalFooter(
          'Cancel',
          'Remove',
          handleRemoveConfirmModalOk,
          handleRemoveConfirmModalCancel,
        )}
      >
        <p className={styles.modal_text}>
          Are you sure you want to remove drawer{' '}
          <span>{currentDrawer ? currentDrawer.name : ''}</span>? This action cannot be undone.
        </p>
      </ConfirmModal>
      <ConfirmModal
        headerTitle="Purge this drawer"
        headerIcon={<Purge width={20} height={20} fill="" />}
        handleOk={handlePurgeConfirmModalOk}
        handleCancel={handlePurgeConfirmModalCancel}
        isOpen={isPurgeConfirmModalOpen}
        centered
        footer={renderConfirmModalFooter(
          'Cancel',
          'Purge',
          handlePurgeConfirmModalOk,
          handlePurgeConfirmModalCancel,
        )}
      >
        <p className={styles.modal_text}>
          Are you sure you want to purge drawer{' '}
          <span>{currentDrawer ? currentDrawer.name : ''}</span>? This action cannot be undone.
        </p>
      </ConfirmModal>
      <ConfirmModal
        headerTitle={
          hasKeyReference(currentDrawerFields)
            ? 'Clear Key Index Data'
            : hasAutoIndex(currentDrawerFields)
              ? 'Clear Auto Index Data'
              : ''
        }
        headerIcon={<TrashBin width={20} height={20} fill="" />}
        handleOk={handleClearDataConfirmModalOk}
        handleCancel={handleClearDataConfirmModalCancel}
        isOpen={isClearDataConfirmModalOpen}
        centered
        footer={renderConfirmModalFooter(
          'Cancel',
          'Clear',
          handleClearDataConfirmModalOk,
          handleClearDataConfirmModalCancel,
        )}
      >
        <p className={styles.modal_text}>
          Are you sure you want to clear all{' '}
          {hasKeyReference(currentDrawerFields)
            ? 'key'
            : hasAutoIndex(currentDrawerFields)
              ? 'auto'
              : ''}{' '}
          index data of drawer <span>{currentDrawer ? currentDrawer.name : ''}</span>? This action
          cannot be undone.
        </p>
      </ConfirmModal>
      <ConfirmModal
        headerTitle="Review"
        headerIcon={<ImportOutlined />}
        handleOk={handleImportKeyIndexConfirmModalOk}
        handleCancel={handleImportKeyIndexConfirmModalCancel}
        isOpen={isReviewModalOpen}
        centered
        width={920}
        footer={renderConfirmModalFooter(
          'Cancel',
          'Import',
          handleImportKeyIndexConfirmModalOk,
          handleImportKeyIndexConfirmModalCancel,
          keyIndexImportedData.filter((item) => item.rowIdx > 0).length === 0,
        )}
        wrapClassName="primary_modal_container"
      >
        <ReviewKeyDataRefImport importedData={keyIndexImportedData} />
      </ConfirmModal>
      <Col>
        <div className={styles.drawer_detail_section}>
          {(loading || importLoading) && (
            <div className={styles.loading_content}>
              <Spin />
            </div>
          )}
          <div className="d-flex align-items-center justify-content-between position-relative">
            <h6 className={styles.title}>Drawer Information</h6>
            {drawers.length !== 0 && (
              <Dropdown
                className={styles.dropdown}
                menu={{ items: dropdownItems, onClick: onClickDropdownItem }}
                dropdownRender={(menu) => (
                  <div
                    className="drawer_management_dropdown_container"
                    style={{
                      backgroundColor: token.colorBgElevated,
                      borderRadius: token.borderRadiusLG,
                      boxShadow: token.boxShadowSecondary,
                      minWidth: '256px',
                    }}
                  >
                    {cloneElement(menu as ReactElement, {
                      style: {
                        boxShadow: 'none',
                      },
                    })}
                  </div>
                )}
                trigger={['click']}
              >
                <Space>
                  <span className={styles.dropdown_text}>Action</span>
                  <ChevronDown
                    className={styles.action_dropdown_icon}
                    width={20}
                    height={20}
                    fill=""
                  />
                </Space>
              </Dropdown>
            )}
          </div>
          <div className="pt-md-4">
            {drawers.length === 0 ? (
              <div className={styles.drawer_nodata}>
                <div>
                  <img src={noData} alt="" />
                </div>
                <div>
                  <p className="mb-0 p_normal_txt">No Data, Please proceed to Create New Drawer</p>
                </div>
              </div>
            ) : (
              <Row>
                <Col md={4} lg={4}>
                  <div className={styles.drawer_info}>
                    <p className={styles.label}>Name</p>
                    <p className={styles.label}>Description</p>
                    <p className={styles.label}>Created Date</p>
                    {/* <p className={styles.label}>Allow Full Text</p> */}
                  </div>
                </Col>
                <Col>
                  {currentDrawer && (
                    <div className={styles.drawer_info}>
                      <p className={[styles.value, styles.bold].join(' ')}>
                        {/* {currentDrawer.name || 'No data'} */}
                        {_.truncate(currentDrawer.name, { length: 60, omission: ' ...' }) ||
                          'No data'}
                      </p>
                      <p className={styles.value}>
                        {_.truncate(currentDrawer.description, { length: 64, omission: ' ...' }) ||
                          'No data'}
                      </p>
                      <p className={styles.value}>
                        {moment(currentDrawer.created_at?.split('T')[0]).format('MM/DD/YYYY') ||
                          'No data'}
                      </p>
                    </div>
                  )}
                </Col>
              </Row>
            )}

            <div className={`mt-4 ${styles.seperator}`}></div>
          </div>
          <div className={styles.field_list}>
            <h6>Fields</h6>
            <Table
              scroll={
                currentDrawer && currentDrawer.fields !== null && currentDrawer.fields.length > 5
                  ? { y: 270 }
                  : {}
              }
              locale={locale}
              className="table_folder"
              dataSource={
                currentDrawer && currentDrawer.fields
                  ? currentDrawer.fields.map((item) => ({ ...item, key: item.id }))
                  : []
              }
              columns={fieldTableColumns}
              pagination={{ position: [] }}
              bordered
            />
          </div>
          {(drawerHasKeyRef || drawerHasAutoIndex) && (
            <div className={styles.field_list}>
              <h6>
                {drawerHasKeyRef
                  ? 'Key Index Import'
                  : drawerHasAutoIndex
                    ? 'Auto Index Import'
                    : ''}
              </h6>
              <Row className="mb-3 justify-content-start">
                <Button onClick={handleDownloadTemplate} icon={<DownloadOutlined />}>
                  Download CSV
                </Button>
                <Upload {...uploadCsvProps}>
                  <Button className="mx-1" icon={<UploadOutlined />}>
                    Index File Import
                  </Button>
                </Upload>
                <Button
                  className="mx-1"
                  icon={<ClearOutlined />}
                  disabled={disableClearDataBtn}
                  onClick={handleClearData}
                >
                  Clear Data
                </Button>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <KeyDataRef
                    reload={!importLoading}
                    dataCheck={(flag) => {
                      if (hasKeyReference(currentDrawerFields)) {
                        setHasKeyDataRef(flag);
                      } else if (hasAutoIndex(currentDrawerFields)) {
                        setHasAutoIndexFlag(flag);
                      }
                    }}
                  />
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Col>
    </div>
  );
};

export default DrawerDetail;
