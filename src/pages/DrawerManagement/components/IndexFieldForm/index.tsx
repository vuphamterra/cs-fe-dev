import { ChangeEvent, FC, useState, useEffect, useRef } from 'react';
import { Form as AntForm, Input, Button as AntButton, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  ProfileOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { ERROR, INDEX_FIELD, LIST_OPTION } from '../../interfaces';
import { FIELD_KEY } from '../../constants';
import { useAppSelector } from '~/store/hooks';
import CSButton from '~/components/CSButton';
import { Plus } from '~/components/Icons';
import { getTypeNameByTypeId } from '../../utils';
import ConfirmModal from '~/components/ConfirmModal';
import { isStringEmpty } from '~/utils/validations';
import notification from '~/utils/notification';
import UserDefinedList from '../UserDefinedList';
import { FIELD_TYPE, SORT } from '~/constants';
import { initialState } from '../../reducer';
import styles from './IndexFieldForm.module.scss';

interface Props {
  onFieldNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFieldTypeChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onWidthChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFormatChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInsertIndexField: () => void;
  onUpdateIndexField: () => void;
  onCancelEditIndexField: () => void;
  onUserDefinedListChange: (list: LIST_OPTION[]) => void;
  selectedIndexField: INDEX_FIELD;
  formatOptions: [];
  isEditingIndexField: boolean;
  error: ERROR;
  indexFields: INDEX_FIELD[];
  creatingDrawer?: boolean;
  onViewing?: boolean;
}

const getUserDefinedList = (list: LIST_OPTION[]) => {
  return (
    list.map((item) => ({
      ...item,
      plannedToDelete: item.isDelete ?? false,
      key: item.key ? item.key : uuidv4(),
    })) || []
  );
};

const handleSortListBy = (data: LIST_OPTION[], field: string, sortBy: string) => {
  const cloneList = _.cloneDeep(data);
  if (sortBy === SORT.DESC) {
    cloneList.sort((a, b) => {
      if (a[field] > b[field]) {
        return -1;
      }
      if (a[field] < b[field]) {
        return 1;
      }
      return 0;
    });
  } else if (sortBy === SORT.ASC) {
    cloneList.sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }
      return 0;
    });
  }
  return cloneList;
};

const csvData = [['option 1'], ['option 2'], ['option 3']];

const IndexFieldForm: FC<Props> = ({
  onFieldNameChange,
  onFieldTypeChange,
  onWidthChange,
  onFormatChange,
  handleCheckboxChange,
  onInsertIndexField,
  onUpdateIndexField,
  onCancelEditIndexField,
  onUserDefinedListChange,
  selectedIndexField,
  formatOptions,
  isEditingIndexField,
  error,
  indexFields,
  creatingDrawer,
  onViewing,
}) => {
  const [listSortBy, setListSortBy] = useState<string>(null);
  const [openListModal, setOpenListModal] = useState<boolean>(false);
  const [userDefinedList, setUserDefinedList] = useState<LIST_OPTION[]>(
    handleSortListBy(getUserDefinedList(selectedIndexField.userDefinedList), 'order_no', SORT.ASC),
  );
  const { types: fieldTypes } = useAppSelector((store) => store.indexField);
  const disableUniqueKey = [FIELD_TYPE.LIST, FIELD_TYPE.DATE].includes(selectedIndexField.type);
  const disableWidth = ![FIELD_TYPE.TEXT, FIELD_TYPE.NUMBER].includes(selectedIndexField.type);
  const disableFormat =
    [FIELD_TYPE.TEXT, FIELD_TYPE.LIST].includes(selectedIndexField.type) ||
    (selectedIndexField.type === FIELD_TYPE.DATE && !creatingDrawer && isEditingIndexField);
  const [addListForm] = AntForm.useForm();
  const [originalIndexField, setOriginalIndexField] = useState(
    _.cloneDeep(initialState.selectedIndexField),
  );

  const disableKeyRefence = () => {
    const hasKeyRef = indexFields.some((item) => item.redflags.keyReference === 1);
    const hasAutoIndex =
      indexFields.some((item) => item.redflags.autoIndex === 1) ||
      selectedIndexField.redflags.autoIndex === 1;
    return hasKeyRef || hasAutoIndex;
  };

  const disableDataReference = () => {
    const fieldHasKeyRef = indexFields.find((item) => item.redflags.keyReference === 1);
    return !fieldHasKeyRef || (fieldHasKeyRef && selectedIndexField.redflags.keyReference === 1);
  };

  const disableAutoIndex = () => {
    const hasKeyRef =
      indexFields.findIndex((item) => item.redflags.keyReference === 1) > -1 ||
      selectedIndexField.redflags.keyReference === 1;
    return hasKeyRef || selectedIndexField.type === FIELD_TYPE.LIST;
  };

  const disableDateStamp =
    selectedIndexField.type !== FIELD_TYPE.DATE || (!creatingDrawer && isEditingIndexField);

  const fieldNameRef = useRef(null);

  const uploadCsvProps: UploadProps = {
    accept: '.csv',
    multiple: false,
    showUploadList: false,
    beforeUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const { target: { result = '' } = { result: '' } } = e || { target: {} };
        if (!result) {
          return;
        }
        const list = result
          .toString()
          .replaceAll('"', '')
          .split(/\r?\n/)
          .map((item) => _.trim(item))
          .reduce((accumulator, currentValue) => {
            if (currentValue) {
              accumulator[currentValue] = currentValue;
            }
            return accumulator;
          }, {});
        handleImportListFromCsv(Object.keys(list));
      };
      reader.readAsText(file);
      return false;
    },
    fileList: [],
  };

  useEffect(() => {
    const list = getUserDefinedList(selectedIndexField.userDefinedList);
    setUserDefinedList(list);
  }, [selectedIndexField.userDefinedList]);

  useEffect(() => {
    if (isEditingIndexField) {
      const originalIndeField = { ...selectedIndexField };
      setOriginalIndexField(_.cloneDeep(originalIndeField));
    }
  }, [isEditingIndexField]);

  useEffect(() => {
    if (onViewing && fieldNameRef && fieldNameRef.current) {
      fieldNameRef.current.focus();
    }
  }, [onViewing]);

  const handleImportListFromCsv = (list: string[]) => {
    const currentList = _.cloneDeep(userDefinedList);
    // Mark existing items as deleted items
    currentList.forEach((item) => {
      item.plannedToDelete = true;
      if (item.plannedToAdd) {
        item.plannedToAdd = false;
      }
    });
    // Add new items
    list.forEach((item) => {
      currentList.push({ name: item, plannedToAdd: true, key: uuidv4() } as LIST_OPTION);
    });
    setUserDefinedList(currentList);
  };

  const onClickAddOption = () => {
    addListForm
      .validateFields()
      .then((values) => {
        if (values.name) {
          const existingItem = userDefinedList.find(
            (item) => !item.plannedToDelete && item.name === values.name,
          );
          if (existingItem) {
            notification.error({ message: 'Invalid', description: 'This option has been added' });
            return;
          }
          setUserDefinedList([
            ...userDefinedList,
            { ...values, plannedToAdd: true, key: uuidv4() },
          ]);
          resetAddListForm();
        }
      })
      .catch(() => { });
  };

  const onDeleteOption = (option: LIST_OPTION) => {
    const optionIdx = userDefinedList.findIndex((item) => item.key === option.key);
    if (optionIdx > -1) {
      userDefinedList[optionIdx].plannedToDelete = true;
    }
    setUserDefinedList([...userDefinedList]);
  };

  const onSaveAddListModal = () => {
    const list = userDefinedList
      .map((item) => {
        return {
          ...item,
          isDelete: item.plannedToDelete ?? false,
          plannedToDelete: false,
          plannedToAdd: false,
        };
      })
      .filter((item) => (!item.id && !item.isDelete) || item.id);
    if (!list.length || list.every((item) => item.isDelete)) {
      notification.error({
        message: 'Invalid',
        description: 'User-defined List must have at least 1 option',
      });
      return;
    }
    onUserDefinedListChange(list);
    setOpenListModal(false);
    resetAddListForm();
  };

  const onCancelAddListModal = () => {
    setUserDefinedList(
      userDefinedList
        .filter((item) => !item.plannedToAdd)
        .map((item) => ({ ...item, plannedToDelete: item.isDelete ?? false })),
    );
    setOpenListModal(false);
    resetAddListForm();
  };

  const getFormatName = (name: string): string => {
    if (disableFormat) {
      if ([FIELD_TYPE.LIST, FIELD_TYPE.TEXT].includes(selectedIndexField.type)) {
        return getTypeNameByTypeId(fieldTypes, selectedIndexField.type);
      }
    }
    return name;
  };

  const resetAddListForm = () => {
    addListForm.setFieldsValue({ name: '' });
  };

  const renderListModalFooter = () => {
    return (
      <div className={styles.modal_footer}>
        <AntButton
          className={`cs_modal_cancel_btn ${styles.cancel_btn}`}
          onClick={onCancelAddListModal}
        >
          Cancel
        </AntButton>
        <AntButton className={`cs_modal_ok_btn ${styles.remove_btn}`} onClick={onSaveAddListModal}>
          Save
        </AntButton>
      </div>
    );
  };

  const dataSource = userDefinedList.filter((item) => !item.plannedToDelete);

  return (
    <div className={styles.container}>
      <ConfirmModal
        headerIcon={<ProfileOutlined />}
        headerTitle="Add List"
        okText="Save"
        cancelText="Cancel"
        isOpen={openListModal}
        handleOk={onSaveAddListModal}
        handleCancel={onCancelAddListModal}
        centered
        wrapClassName="primary_modal_container"
        footer={renderListModalFooter()}
        destroyOnClose
      >
        <AntForm form={addListForm} layout="vertical">
          <div
            className={`mt-4 d-flex justify-content-between align-items-center gap-3 ${styles.option_input_container}`}
          >
            <AntForm.Item
              label="Option"
              name="name"
              className="flex-grow-1"
              rules={[
                { min: 1, message: 'Minimum 1 character' },
                { max: 36, message: 'Maximum 36 characters' },
                () => ({
                  validator(rules, value) {
                    if (isStringEmpty(value)) {
                      return Promise.reject(new Error('Option cannot be empty'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input className={styles.option_input} placeholder="Enter options" />
            </AntForm.Item>
            <CSButton onClick={onClickAddOption}>Add</CSButton>
          </div>
          <div className={styles.list_options_container}>
            <div className="d-flex mb-2">
              <div className={styles.label}>
                List Options{' '}
                {(listSortBy === null || listSortBy === SORT.ASC) && (
                  <span
                    className={`${styles.sort_btn} ${listSortBy === SORT.ASC ? styles.selected : ''
                      }`}
                    onClick={() => {
                      setListSortBy(SORT.DESC);
                      setUserDefinedList(handleSortListBy(userDefinedList, 'name', SORT.DESC));
                    }}
                  >
                    <SortAscendingOutlined />
                  </span>
                )}
                {listSortBy === SORT.DESC && (
                  <span
                    className={`${styles.sort_btn} ${listSortBy === SORT.DESC ? styles.selected : ''
                      }`}
                    onClick={() => {
                      setListSortBy(SORT.ASC);
                      setUserDefinedList(handleSortListBy(userDefinedList, 'name', SORT.ASC));
                    }}
                  >
                    <SortDescendingOutlined />
                  </span>
                )}
              </div>
              <div className={styles.csv_btns}>
                <CSVLink data={csvData} filename={'User Defined List Template.csv'}>
                  Download CSV
                </CSVLink>
                <Upload {...uploadCsvProps}>
                  <AntButton icon={<UploadOutlined />}>Import CSV</AntButton>
                </Upload>
              </div>
            </div>
            <UserDefinedList
              dataSource={dataSource}
              setDataSource={(data) => {
                setListSortBy(null);
                const clonedData = _.cloneDeep(data);
                userDefinedList.forEach((item) => {
                  const idx = data.findIndex((ele) => ele.key === item.key);
                  if (idx === -1 && item.plannedToDelete) {
                    clonedData.push(_.cloneDeep(item));
                  }
                });
                setUserDefinedList(_.cloneDeep(clonedData));
              }}
              removeOption={onDeleteOption}
            />
          </div>
        </AntForm>
      </ConfirmModal>
      <Form name="thirdStepFrm">
        <Form.Group className="mb-3" controlId="fieldName">
          <Form.Label>Field Name</Form.Label>
          <Form.Control
            // ref={fieldNameRef}
            type="text"
            placeholder="Enter field name"
            value={selectedIndexField ? selectedIndexField.name : ''}
            onChange={onFieldNameChange}
            isInvalid={error && error.key === FIELD_KEY.FIELD_NAME}
          />
          {error && error.key === FIELD_KEY.FIELD_NAME && (
            <Form.Control.Feedback type="invalid">{error.message}</Form.Control.Feedback>
          )}
        </Form.Group>
        <div className="width__place align-items-start">
          <Form.Group className="mb-3" controlId="fieldType">
            <Form.Label>Field Type</Form.Label>
            <Form.Select
              aria-label="Default select example"
              value={selectedIndexField ? selectedIndexField.type : ''}
              onChange={onFieldTypeChange}
            >
              {fieldTypes.map((item) => {
                // Field type is Text
                const cond1 =
                  originalIndexField.type === FIELD_TYPE.TEXT && item.id !== FIELD_TYPE.TEXT;
                // Field type is Number
                const arrCond2 = [FIELD_TYPE.TEXT, FIELD_TYPE.NUMBER];
                const cond2 =
                  originalIndexField.type === FIELD_TYPE.NUMBER && !arrCond2.includes(item.id);
                // Field type is Phone Number
                const arrCond3 = [FIELD_TYPE.TEXT, FIELD_TYPE.NUMBER, FIELD_TYPE.PHONE_NUMBER];
                const cond3 =
                  originalIndexField.type === FIELD_TYPE.PHONE_NUMBER &&
                  !arrCond3.includes(item.id);
                // Field type is Social Security
                const arrCond4 = [FIELD_TYPE.TEXT, FIELD_TYPE.NUMBER, FIELD_TYPE.SOCIAL_SECURITY];
                const cond4 =
                  originalIndexField.type === FIELD_TYPE.SOCIAL_SECURITY &&
                  !arrCond4.includes(item.id);
                // Field type is Date
                const arrCond5 = [FIELD_TYPE.TEXT, FIELD_TYPE.DATE];
                const cond5 =
                  originalIndexField.type === FIELD_TYPE.DATE && !arrCond5.includes(item.id);
                // Field type is List
                const arrCond6 = [FIELD_TYPE.TEXT, FIELD_TYPE.LIST];
                const cond6 =
                  originalIndexField.type === FIELD_TYPE.LIST && !arrCond6.includes(item.id);

                const disabled =
                  isEditingIndexField && (cond1 || cond2 || cond3 || cond4 || cond5 || cond6);
                return (
                  <option key={item.id} value={item.id} disabled={disabled}>
                    {item.name}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="width">
            <Form.Label>Width</Form.Label>
            <Form.Control
              type="number"
              placeholder="0"
              disabled={disableWidth}
              value={selectedIndexField ? selectedIndexField.width : 0}
              onChange={onWidthChange}
              isInvalid={error && error.key === FIELD_KEY.FIELD_WIDTH}
            />
            {error && error.key === FIELD_KEY.FIELD_WIDTH && (
              <Form.Control.Feedback type="invalid">{error.message}</Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        <div className="d-flex gap-3">
          <Form.Group className="mb-3 flex-grow-1" controlId="format">
            <Form.Label>Format</Form.Label>
            <Form.Select
              disabled={disableFormat}
              aria-label="Default select example"
              value={selectedIndexField ? selectedIndexField.format : ''}
              onChange={onFormatChange}
            >
              {formatOptions.map((item: { id: number; name: string }) => (
                <option key={item.id} value={item.id}>
                  {getFormatName(item.name)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {selectedIndexField.type === FIELD_TYPE.LIST && (
            <Form.Group className="d-flex align-items-center flex-grow-0">
              <Button
                className={`mt-3 ${styles.modify_btn}`}
                onClick={() => setOpenListModal(true)}
              >
                Modify
              </Button>
            </Form.Group>
          )}
        </div>
        <div>
          <p>Red Flag</p>
          <Row>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_required"
                  type="checkbox"
                  value={selectedIndexField.redflags.required}
                  name="required"
                  checked={selectedIndexField.redflags.required === 1}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="rf_required" className="form-check-label">
                  Required
                </label>
              </div>
            </Col>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_uniqueKey"
                  type="checkbox"
                  value={selectedIndexField.redflags.uniqueKey}
                  name="uniqueKey"
                  checked={selectedIndexField.redflags.uniqueKey === 1}
                  onChange={handleCheckboxChange}
                  disabled={disableUniqueKey}
                />
                <label
                  htmlFor="rf_uniqueKey"
                  className={`form-check-label ${disableUniqueKey ? styles.label_disabled : ''}`}
                >
                  Unique Key
                </label>
              </div>
            </Col>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_keyReference"
                  type="checkbox"
                  value={selectedIndexField.redflags.keyReference}
                  name="keyReference"
                  checked={selectedIndexField.redflags.keyReference === 1}
                  onChange={handleCheckboxChange}
                  disabled={disableKeyRefence()}
                />
                <label
                  htmlFor="rf_keyReference"
                  className={`form-check-label ${disableKeyRefence() ? styles.label_disabled : ''}`}
                >
                  Key Reference
                </label>
              </div>
            </Col>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_autoIndex"
                  type="checkbox"
                  value={selectedIndexField.redflags.autoIndex}
                  name="autoIndex"
                  checked={selectedIndexField.redflags.autoIndex === 1}
                  onChange={handleCheckboxChange}
                  disabled={disableAutoIndex()}
                />
                <label
                  htmlFor="rf_autoIndex"
                  className={`form-check-label ${disableAutoIndex() ? styles.label_disabled : ''}`}
                >
                  Auto Index
                </label>
              </div>
            </Col>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_dateStamp"
                  type="checkbox"
                  value={selectedIndexField.redflags.dateStamp}
                  name="dateStamp"
                  checked={selectedIndexField.redflags.dateStamp === 1}
                  onChange={handleCheckboxChange}
                  disabled={disableDateStamp}
                />
                <label
                  htmlFor="rf_dateStamp"
                  className={`form-check-label ${disableDateStamp ? styles.label_disabled : ''}`}
                >
                  Date Stamp
                </label>
              </div>
            </Col>
            <Col lg={6}>
              <div className="form-check">
                <Form.Check
                  id="rf_dataReference"
                  type="checkbox"
                  value={selectedIndexField.redflags.dataReference}
                  name="dataReference"
                  checked={selectedIndexField.redflags.dataReference === 1}
                  onChange={handleCheckboxChange}
                  disabled={disableDataReference()}
                />
                <label
                  htmlFor="rf_dataReference"
                  className={`form-check-label ${disableDataReference() ? styles.label_disabled : ''
                    }`}
                >
                  Data Reference
                </label>
              </div>
            </Col>
          </Row>
        </div>
        <Row className="mx-0 mt-4 justify-content-center">
          {!isEditingIndexField && (
            <Row className={`${styles.insert_field_btn} px-0`}>
              <CSButton onClick={onInsertIndexField} icon={<Plus width={20} height={20} fill="" />}>
                Insert
              </CSButton>
            </Row>
          )}
          {isEditingIndexField && (
            <div className="d-flex justify-content-between px-0">
              <div className={styles.update_field_btn}>
                <CSButton
                  onClick={() => {
                    setOriginalIndexField(_.cloneDeep(initialState.selectedIndexField));
                    onUpdateIndexField();
                  }}
                >
                  Update
                </CSButton>
              </div>
              <div className={styles.cancel_update_field_btn}>
                <CSButton
                  onClick={() => {
                    setOriginalIndexField(_.cloneDeep(initialState.selectedIndexField));
                    onCancelEditIndexField();
                  }}
                >
                  Cancel
                </CSButton>
              </div>
            </div>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default IndexFieldForm;
