import { useState, useEffect } from 'react';
import { Form, Input, Select, Row, Col, DatePicker, Tooltip, theme } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { useAppSelector, useAppDispatch } from '~/store/hooks';
import {
  handleSelectSearchField,
  setSearchCondition,
  handleRemoveIndexSearchField,
  FIELD_UI_EXTENDED,
} from '~/store/FolderSlice';
import { FIELD_TYPE } from '../../FolderManagement/constants';
import { Plus, TrashBin } from '~/components/Icons';
import { SearchField } from '../interfaces';
import { DATE_FORMAT } from '~/constants';
import { FIELD_UI } from '~/pages/FolderManagement/interfaces';
import styles from './SearchIndexField.module.scss';

type Props = {
  handleSearchFieldCallback: (data: SearchField[]) => void;
  reset: boolean;
  onReset: (reset: boolean) => void;
};

const initialSearchField: SearchField = {
  id: uuidv4(),
  field_id: null,
  type_code: 'text',
  format_name: '',
  description: '',
  from: '',
  to: '',
  fieldName: '',
  isSelected: false,
};

const SearchIndexField = (props: Props) => {
  const { token } = theme.useToken();
  const [advSearchField, setAdvSearchField] = useState<Array<SearchField>>([
    { ...initialSearchField },
  ]);
  const { currentDrawer } = useAppSelector((s) => s.draw);
  const dispatch = useAppDispatch();
  const fields = useAppSelector((s) => s.folder.fieldsToSelect);
  const [isDisableAddField, setIsDisableAddField] = useState<boolean>(false);

  useEffect(() => {
    if (props.reset) {
      setAdvSearchField([{ ...initialSearchField, id: uuidv4() }]);
      props.onReset(false);
      // Marking fields as not selected
      const clonedFields = _.cloneDeep(fields);
      clonedFields.forEach((item: FIELD_UI_EXTENDED) => {
        item.rowId = '';
      });
      dispatch(handleRemoveIndexSearchField(clonedFields));
    }
  }, [props.reset]);

  const addField = () => {
    const { fields = [] } = currentDrawer || {};
    if (advSearchField.length < fields.length + 10) {
      const newOjb = { ...initialSearchField, id: uuidv4() };
      const updatedAdvSearchField = [...advSearchField, { ...newOjb }];
      setAdvSearchField(updatedAdvSearchField);
    } else {
      setIsDisableAddField(true);
    }
  };

  const removeField = (index: string) => {
    if (advSearchField.length > 1) {
      setIsDisableAddField(false);

      const fieldToRemove = advSearchField.filter((obj) => {
        return obj.id === index;
      });

      const clonedFields = _.cloneDeep(fields);
      clonedFields.forEach((item: FIELD_UI_EXTENDED) => {
        if (item.fieldId === fieldToRemove[0].field_id) {
          item.rowId = '';
        }
      });

      dispatch(handleRemoveIndexSearchField(clonedFields));

      setAdvSearchField(advSearchField.filter((el) => el.id !== index));
      props.handleSearchFieldCallback(advSearchField.filter((el) => el.id !== index));
    }
  };

  const handleFieldChange = (value: any, rowId: string) => {
    const { fields = [] } = currentDrawer || {};
    dispatch(handleSelectSearchField({ value, rowId }));

    const selectedField = fields.filter((i) => i.id === value);
    if (!selectedField.length) {
      return;
    }
    const updatedAdvSearchField = advSearchField.map((item) => {
      if (rowId === item.id) {
        return {
          ...item,
          field_id: selectedField[0].id,
          type_code: selectedField[0].type.type_code,
          fieldName: selectedField[0].name,
          format_name: selectedField[0].type.format,
          isSelected: true,
        };
      }
      return { ...item };
    });
    setAdvSearchField(updatedAdvSearchField);
    props.handleSearchFieldCallback(updatedAdvSearchField);
  };

  const handleFieldType = (
    type: string,
    name: string,
    index: string,
    isSelected: boolean,
    field: FIELD_UI,
  ) => {
    switch (type) {
      case FIELD_TYPE.TEXT:
        return (
          <Form.Item name={name} key={index} style={{ margin: 0 }}>
            <Input autoFocus type="text" size="large" disabled={!isSelected} />
          </Form.Item>
        );
      case FIELD_TYPE.LIST:
        return (
          <Form.Item name={name} key={index} style={{ margin: 0 }}>
            <Input autoFocus type="text" size="large" disabled={!isSelected} />
          </Form.Item>
        );
      case FIELD_TYPE.SECURITY:
        return (
          <Form.Item name={name} key={index} style={{ margin: 0 }}>
            <Input
              autoFocus
              type="text"
              size="large"
              disabled={!isSelected}
              placeholder={field.formatName}
              addonAfter={
                <Tooltip
                  title={`Please search with correct format of ${field.typeName} in order to get the most accurate results`}
                  color={token.colorPrimary}
                >
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                </Tooltip>
              }
            />
          </Form.Item>
        );
      case FIELD_TYPE.PHONE:
        return (
          <Form.Item name={name} key={index} style={{ margin: 0 }}>
            <Input
              autoFocus
              type="text"
              size="large"
              disabled={!isSelected}
              placeholder={field.formatName}
              addonAfter={
                <Tooltip
                  title={`Please search with correct format of ${field.typeName} in order to get the most accurate results`}
                  color={token.colorPrimary}
                >
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} />
                </Tooltip>
              }
            />
          </Form.Item>
        );
      case FIELD_TYPE.NUMBER:
        return (
          <Form.Item name={name} key={index} style={{ margin: 0 }}>
            <Input autoFocus type="number" size="large" disabled={!isSelected} />
          </Form.Item>
        );
      case FIELD_TYPE.DATETIME:
        return (
          <Row key={index} gutter={8}>
            <Col span={12}>
              <Form.Item name={`${name}___from`} className="m-0">
                <DatePicker
                  format={DATE_FORMAT[field.formatId]}
                  size="large"
                  style={{ width: '100%' }}
                  disabled={!isSelected}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={`${name}___to`} className="m-0">
                <DatePicker
                  format={DATE_FORMAT[field.formatId]}
                  size="large"
                  style={{ width: '100%' }}
                  disabled={!isSelected}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      default:
        return (
          <Form.Item key={index} style={{ margin: 0 }}>
            <Input type="text" size="large" placeholder="Search" disabled={!isSelected} />
          </Form.Item>
        );
    }
  };

  const handleSearchCondition = (value: string) => {
    dispatch(setSearchCondition(value));
  };

  return (
    <div>
      <div className={styles.search_title}>
        <p
          style={{ display: 'flex', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}
        >
          Match
          <span style={{ margin: '0px 12px' }}>
            <Select
              style={{ width: '80px' }}
              defaultValue="Any"
              onChange={(value) => handleSearchCondition(value)}
              options={[
                { value: 'or', label: 'Any' },
                { value: 'and', label: 'All' },
              ]}
            />
          </span>
          of the following search
        </p>
      </div>
      <div className="scroll_content" style={{ maxHeight: '248px' }}>
        {advSearchField.map(
          ({ id: rowId, type_code: typeCode, fieldName, isSelected, field_id: fieldId }, index) => {
            const showDeleteBtn = advSearchField.length > 1;
            const showAddBtn =
              advSearchField.length < fields.length && advSearchField.length === index + 1;
            let options = [];
            if (!_.isEmpty(fields)) {
              options = fields
                .filter((item) => !item.rowId || item.rowId === '')
                .map(({ fieldId, name }) => [{ value: fieldId, label: name }][0]);
            }
            const field = fields.find((item) => item.fieldId === fieldId) || {};
            return (
              <Row key={rowId} className="my-2">
                <Col span={4}>
                  <Select
                    size="large"
                    className={styles.search_select}
                    onChange={(value) => handleFieldChange(value, rowId)}
                    placeholder="--Choose field--"
                    options={options}
                  ></Select>
                </Col>
                <Col span={18} className={styles.index_search_col}>
                  {handleFieldType(typeCode, fieldName, rowId, isSelected, field as FIELD_UI)}
                </Col>
                <Col span={2} className={styles.index_field_actions}>
                  {showDeleteBtn && (
                    <span className={styles.action_icon} onClick={() => removeField(rowId)}>
                      <TrashBin width={20} height={20} fill="" />
                    </span>
                  )}
                  {showAddBtn && (
                    <span className={styles.action_icon} onClick={() => addField()}>
                      <Plus width={20} height={20} fill="" />
                    </span>
                  )}
                </Col>
              </Row>
            );
          },
        )}
      </div>
    </div>
  );
};

export default SearchIndexField;
