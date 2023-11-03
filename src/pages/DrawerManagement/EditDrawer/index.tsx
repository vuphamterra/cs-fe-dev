/* eslint-disable multiline-ternary */
import { useEffect, FC, useReducer, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { Button, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { initialState, reducer } from '../reducer';
import {
  DRAWER,
  DRAWER_MODEL,
  ERROR,
  INDEX_FIELD,
  INDEX_FIELD_MODEL,
  LIST_OPTION,
} from '../interfaces';
import { getFormatOptions, getIndexFields, getTypeNameByTypeId } from '../utils';
import { ACTION, FIELD_KEY, MOCK_DATA } from '../constants';
import { getTypes } from '~/store/IndexField';
import {
  checkFileLocationPath,
  getDrawerDetail,
  updateDrawer,
  updateMessage,
} from '~/store/DrawerSlice';
import IndexFieldForm from '../components/IndexFieldForm';
import IndexFieldTable from '../components/IndexFieldTable';
import ConfirmModal from '~/components/ConfirmModal';
import CSButton from '~/components/CSButton';
import notification from '~/utils/notification';
import { TrashBin } from '~/components/Icons';
import { isStringEmpty } from '~/utils/validations';
import styles from './EditDrawer.module.scss';
import { MAX_LENGTH } from '~/constants';

interface Props { }

const EditDrawer: FC<Props> = () => {
  const navigate = useNavigate();
  const { drawerId } = useParams();
  const appDispatch = useAppDispatch();
  const { drawers, currentDrawer, loading, message } = useAppSelector((store) => store.draw);
  const { formats, types } = useAppSelector((store) => store.indexField);
  const { selectedDb } = useAppSelector((store) => store.db);
  const [
    {
      drawer,
      originalDrawer,
      selectedIndexField,
      formatOptions,
      isEditingIndexField,
      deletingIndexField,
      indexFieldsToRemove,
      isModalOpen,
      error,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const onDrawerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ACTION.CHANGE_DRAWER_NAME, payload: e.target.value });
  };

  const onDrawerDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ACTION.CHANGE_DRAWER_DESC, payload: e.target.value });
  };

  const onFileLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ACTION.CHANGE_FILE_LOCATION, payload: e.target.value });
  };

  const convertBeforeUpdate = (data: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    const newOriginDrawer = JSON.parse(JSON.stringify(originalDrawer.fields));
    newData.lists = newData.userDefinedList;
    newData.redflags = newData.redflag;
    const newFields = [];
    for (const [index, item] of newData.entries()) {
      if (typeof item.id === 'string') {
        item.id = undefined;
        newOriginDrawer.push(item);
      }
    }
    newOriginDrawer.forEach(originItem => {
      originItem.isDelete = true;
      originItem.order_no = undefined;
      let object = originItem;
      for (const [index, item] of newData.entries()) {
        item.order_no = index + 1;
        if (originItem.name === item.name) {
          object = item;
          break;
        }
      }

      const redflags = [];
      let cnt = 1;
      for (const [key, value] of Object.entries(object.redflags)) {
        if (value === 1) {
          redflags.push(cnt);
        }
        cnt++;
      }
      const list = [];
      object.userDefinedList.forEach(element => {
        list.push({
          id: element.id,
          name: element.name,
          isDelete: element.isDelete || false,
          ordered: element.order_no
        });
      });

      // console.log('result', object.format, object.format_id)
      newFields.push({
        name: object.name,
        order_no: object.order_no,
        format_id: object.format,
        width: object.width.toString(),
        redflag: redflags,
        lists: list,
        isDelete: object.isDelete || false,
        id: object.id
      });
    });
    return newFields;
  };

  const handleSaveClick = () => {
    if (error) {
      return;
    }
    if (drawer.name === '') {
      dispatch({ type: ACTION.CHANGE_DRAWER_NAME, payload: drawer.name });
    }
    if (drawer.image_path === '') {
      dispatch({ type: ACTION.CHANGE_FILE_LOCATION, payload: drawer.image_path });
    } else {
      // appDispatch(checkFileLocationPath({ imgPath: drawer.image_path })).then((res) => {
      // const {
      //   payload: { statusCode },
      // } = res;
      // if (statusCode && statusCode === 200) {
      if (!drawer.fields.length) {
        notification.error({
          message: 'Invalid index fields',
          description: 'There is no index field. Please add at least one.',
        });
        return;
      }
      if (drawer.fields.length > 10) {
        notification.error({
          message: 'Invalid index fields',
          description:
            'Maximum 10 Index Fields only. Please edit or remove current Index Fields',
        });
        return;
      }
      const indexFieldsExistedOnDatabase = indexFieldsToRemove.filter(
        (item) => typeof item.id === 'number',
      );
      const fields = drawer.fields.concat(indexFieldsExistedOnDatabase);
      const indexFields: INDEX_FIELD_MODEL[] = fields.map((field: INDEX_FIELD) => {
        const redflag = Object.keys(field.redflags).reduce((accumulator, currentValue) => {
          if (field.redflags[currentValue]) {
            accumulator.push(MOCK_DATA.REDFLAG_IDS[currentValue]);
          }
          return accumulator;
        }, []);
        const lists = field.userDefinedList.map((item, index) => {
          if (item.id) {
            return {
              id: item.id,
              name: _.trim(item.name),
              isDelete: item.isDelete || item.plannedToDelete,
              ordered: index + 1,
            };
          }
          return {
            name: _.trim(item.name),
            ordered: index + 1,
          };
        });
        const updatedIndexField = {
          name: _.trim(field.name),
          format_id: field.format,
          width: field.width.toString(),
          redflag,
          lists,
          isDelete: indexFieldsToRemove.findIndex((f: INDEX_FIELD) => f.id === field.id) > -1,
        } as INDEX_FIELD_MODEL;

        if (field.id) {
          updatedIndexField.id = field.id;
        }

        return updatedIndexField;
      });
      const updatedDrawer: DRAWER_MODEL = {
        name: _.trim(drawer.name),
        description: _.trim(drawer.description),
        database_id: selectedDb.id,
        image_path: _.trim(drawer.image_path),
        fields: convertBeforeUpdate(drawers),
        isDelete: false
      };

      dispatch({ type: ACTION.CHANGE_INDEX_FIELDS_TO_REMOVE, payload: [] });
      appDispatch(updateDrawer({ id: currentDrawer.id, drawer: updatedDrawer })).then(() => {
        appDispatch(getDrawerDetail({ id: +drawerId }));
      });
      // } else {
      //   dispatch({
      //     type: ACTION.CHANGE_ERROR,
      //     payload: {
      //       key: FIELD_KEY.FILE_PATH,
      //       message: 'This file location is not eligible',
      //     },
      //   });
      // }
      // });
    }
  };

  const onEditIndexField = (indexField: INDEX_FIELD) => {
    dispatch({
      type: ACTION.EDIT_INDEX_FIELD,
      payload: { isEditingIndexField: true, indexFieldToBeEdited: indexField },
    });
    dispatch({
      type: ACTION.CHANGE_FORMAT_OPTIONS,
      payload: getFormatOptions(types, formats, +indexField.type),
    });
  };

  const onDeleteIndexField = (indexField: INDEX_FIELD) => {
    dispatch({
      type: ACTION.CHANGE_MODAL_STATUS,
      payload: { status: true, deletingIndexField: indexField },
    });
  };

  const onFieldNameChange = (e) => {
    dispatch({ type: ACTION.CHANGE_FIELD_NAME, payload: e.target.value });
  };

  const onFieldTypeChange = (e) => {
    dispatch({ type: ACTION.CHANGE_FIELD_TYPE, payload: +e.target.value });
    dispatch({
      type: ACTION.CHANGE_FORMAT_OPTIONS,
      payload: getFormatOptions(types, formats, +e.target.value),
    });
  };

  const onFormatChange = (e) => {
    dispatch({ type: ACTION.CHANGE_FORMAT, payload: +e.target.value });
  };

  const onWidthChange = (e) => {
    let value: number;
    if (!e.target.value) {
      value = 0;
    }
    value = parseInt(e.target.value);
    if (value < 0) {
      value = 0;
    }
    dispatch({ type: ACTION.CHANGE_WIDTH, payload: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    dispatch({ type: ACTION.CHANGE_REDFLAG, payload: { name, value: checked } });
  };

  const onInsertIndexField = () => {
    if (error) {
      return;
    }
    const seletedTypeName = getTypeNameByTypeId(types, selectedIndexField.type);
    if (isStringEmpty(selectedIndexField.name)) {
      // Trigger validating Field Name
      dispatch({ type: ACTION.CHANGE_FIELD_NAME, payload: '' });
    } else if (selectedIndexField.name.length < 1) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_NAME,
          message: 'Minimum 1 character',
        } as ERROR,
      });
    } else if (selectedIndexField.name.length > 36) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_NAME,
          message: 'Maximum 36 characters',
        } as ERROR,
      });
    } else if (['Text', 'Number'].includes(seletedTypeName) && +selectedIndexField.width === 0) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: 'Width must larger than 0',
        } as ERROR,
      });
    } else if (
      ['Text'].includes(seletedTypeName) &&
      +selectedIndexField.width > MAX_LENGTH[selectedIndexField.type]
    ) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: `Width must be equal or less than ${MAX_LENGTH[selectedIndexField.type]}`,
        } as ERROR,
      });
    } else if (
      seletedTypeName === 'Number' &&
      +selectedIndexField.width > MAX_LENGTH[selectedIndexField.type]
    ) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: `Width must be equal or less than ${MAX_LENGTH[selectedIndexField.type]}`,
        } as ERROR,
      });
    } else {
      if (!error) {
        const existedField = drawer.fields.find(
          (field: INDEX_FIELD) => field.name === selectedIndexField.name,
        );
        if (!existedField) {
          let format = null;
          if (!selectedIndexField.format) {
            format = formatOptions.find((item) => item.type_id === selectedIndexField.type);
          }
          const isFieldTypeList = getTypeNameByTypeId(types, selectedIndexField.type) === 'List';
          if (isFieldTypeList && !selectedIndexField.userDefinedList.length) {
            notification.error({
              message: 'Invalid',
              description: 'User-defined List must have at least 1 option',
            });
            return;
          }
          dispatch({
            type: ACTION.INSERT_INDEX_FIELD,
            payload: {
              format: format ? format.id : null,
              types,
              formats,
            },
          });
        } else {
          dispatch({
            type: ACTION.CHANGE_ERROR,
            payload: {
              key: FIELD_KEY.FIELD_NAME,
              message: 'Field name exists. Please choose another Field Name',
            } as ERROR,
          });
        }
      }
    }
  };

  const onUpdateIndexField = () => {
    if (error) {
      return;
    }
    const seletedTypeName = getTypeNameByTypeId(types, selectedIndexField.type);
    if (!selectedIndexField.name) {
      // Trigger validating Field Name
      dispatch({ type: ACTION.CHANGE_FIELD_NAME, payload: '' });
    } else if (selectedIndexField.name.length < 1) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_NAME,
          message: 'Minimum 1 character',
        } as ERROR,
      });
    } else if (selectedIndexField.name.length > 36) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_NAME,
          message: 'Maximum 36 characters',
        } as ERROR,
      });
    } else if (['Text', 'Number'].includes(seletedTypeName) && +selectedIndexField.width === 0) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: 'Width must larger than 0',
        } as ERROR,
      });
    } else if (
      ['Text'].includes(seletedTypeName) &&
      +selectedIndexField.width > MAX_LENGTH[selectedIndexField.type]
    ) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: `Width must be equal or less than ${MAX_LENGTH[selectedIndexField.type]}`,
        } as ERROR,
      });
    } else if (
      seletedTypeName === 'Number' &&
      +selectedIndexField.width > MAX_LENGTH[selectedIndexField.type]
    ) {
      dispatch({
        type: ACTION.CHANGE_ERROR,
        payload: {
          key: FIELD_KEY.FIELD_WIDTH,
          message: `Width must be equal or less than ${MAX_LENGTH[selectedIndexField.type]}`,
        } as ERROR,
      });
    } else if (!error) {
      const isFieldTypeList = getTypeNameByTypeId(types, selectedIndexField.type) === 'List';
      if (isFieldTypeList && !selectedIndexField.userDefinedList.length) {
        notification.error({
          message: 'Invalid',
          description: 'User-defined List must have at least 1 option',
        });
        return;
      }
      dispatch({
        type: ACTION.UPDATE_INDEX_FIELD,
        payload: { selectedIndexField, types, formats },
      });
    }
  };

  const onCancelEditIndexField = () => {
    dispatch({
      type: ACTION.EDIT_INDEX_FIELD,
      payload: { isEditingIndexField: false },
    });
    dispatch({
      type: ACTION.CHANGE_FORMAT_OPTIONS,
      payload: getFormatOptions(types, formats, initialState.selectedIndexField.type),
    });
  };

  const onUserDefinedListChange = (list: LIST_OPTION[]) => {
    dispatch({ type: ACTION.CHANGE_LIST_OPTIONS, payload: list });
  };

  const handleModalOk = () => {
    dispatch({ type: ACTION.DELETE_INDEX_FIELD });
  };

  const handleModalCancel = () => {
    dispatch({ type: ACTION.CHANGE_MODAL_STATUS, payload: false });
  };

  useEffect(() => {
    appDispatch(getTypes({ skip: 0, take: 100 }));
  }, []);

  useEffect(() => {
    if (types.length && formats.length) {
      dispatch({
        type: ACTION.CHANGE_FORMAT_OPTIONS,
        payload: getFormatOptions(types, formats, types[0].id),
      });
    }
  }, [types, formats]);

  useEffect(() => {
    if (!_.isEmpty(currentDrawer)) {
      const { name = '', description = '', image_path: imagePath = '' } = currentDrawer;
      const drawerIndexFieldData =
        currentDrawer && currentDrawer.fields ? currentDrawer.fields : [];
      const fields = getIndexFields(drawerIndexFieldData, formats);
      const drawer: DRAWER = {
        name,
        description,
        image_path: imagePath,
        fields,
      };
      dispatch({ type: ACTION.CHANGE_DRAWER, payload: drawer });
    }
  }, [currentDrawer, formats]);

  useEffect(() => {
    if (!_.isEmpty(message)) {
      notification[message.type]({ message: message.title, description: message.text });
      appDispatch(updateMessage(null));
    }
  }, [message]);

  useEffect(() => {
    if (drawerId) {
      appDispatch(getDrawerDetail({ id: +drawerId }));
    }
  }, []);

  const renderModalFooter = (
    cancelText: string,
    okText: string,
    handleOk: () => void,
    handleCancel: () => void,
  ) => {
    return (
      <div className={styles.modal_footer}>
        <Button className={`cs_modal_cancel_btn ${styles.cancel_btn}`} onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button className={`cs_modal_ok_btn ${styles.remove_btn}`} onClick={handleOk}>
          {okText}
        </Button>
      </div>
    );
  };

  return (
    <div className="scroll_content">
      <ConfirmModal
        headerTitle="Remove Field"
        headerIcon={<TrashBin width={20} height={20} fill="" />}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
        isOpen={isModalOpen}
        centered
        footer={renderModalFooter('Cancel', 'Remove', handleModalOk, handleModalCancel)}
      >
        <p className={styles.modal_text}>
          Are you sure you want to remove the field{' '}
          <span>{deletingIndexField ? deletingIndexField.name : ''}</span>? This action cannot be
          undone.
        </p>
      </ConfirmModal>
      <div className="margin__row mb-3 position-relative">
        {loading && (
          <div className={styles.loading_spinner}>
            <Spin tip="Updating drawer..." />
          </div>
        )}
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center crt__drw">
              <h4 className="statistics txt-384">Edit Drawer</h4>
            </div>
            <div>
              <CSButton className="cs_secodary_btn" onClick={() => navigate(-1)}>
                Cancel
              </CSButton>
              <CSButton
                className={`cs_primary_btn ${!_.isEmpty(error) ? 'disabled' : ''}`}
                onClick={handleSaveClick}
              >
                Save
              </CSButton>
            </div>
          </div>
          <hr className="mt-md-3 " />
        </div>
        <Row>
          <h5 className="pb-3">Drawer Information</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="login-form_label form__label_fnt">Drawer name</Form.Label>
              <Form.Control
                type="text"
                value={drawer.name || ''}
                onChange={onDrawerNameChange}
                disabled
                isInvalid={error && error.key === FIELD_KEY.DRAWER_NAME}
              />
              {error && error.key === FIELD_KEY.DRAWER_NAME && (
                <Form.Control.Feedback type="invalid">{error.message}</Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label className="login-form_label form__label_fnt">Description</Form.Label>
              <Form.Control
                autoFocus
                name="description"
                value={drawer.description || ''}
                onChange={onDrawerDescriptionChange}
                maxLength={200}
              />
            </Form.Group>
            {/* <Row className="pt-3">
              <Form.Group className="mb-3">
                <Form.Label className="login-form_label form__label_fnt">File location</Form.Label>
                <Form.Control
                  type="text"
                  disabled
                  value={drawer.image_path}
                  onChange={onFileLocationChange}
                  isInvalid={error && error.key === FIELD_KEY.FILE_PATH}
                />
                {error && error.key === FIELD_KEY.FILE_PATH && (
                  <Form.Control.Feedback type="invalid">{error.message}</Form.Control.Feedback>
                )}
              </Form.Group>
            </Row> */}
          </Form>
        </Row>
        <Row className="pt-5">
          <h5 className="pb-2">Index fields</h5>
          <Col lg={4}>
            <IndexFieldForm
              onFieldNameChange={onFieldNameChange}
              onFieldTypeChange={onFieldTypeChange}
              onFormatChange={onFormatChange}
              onWidthChange={onWidthChange}
              handleCheckboxChange={handleCheckboxChange}
              onInsertIndexField={onInsertIndexField}
              onUpdateIndexField={onUpdateIndexField}
              onCancelEditIndexField={onCancelEditIndexField}
              onUserDefinedListChange={onUserDefinedListChange}
              selectedIndexField={selectedIndexField}
              isEditingIndexField={isEditingIndexField}
              formatOptions={formatOptions}
              error={error}
              indexFields={drawer.fields}
            />
          </Col>
          <Col lg={8}>
            <IndexFieldTable
              data={drawer.fields || []}
              onEditRow={onEditIndexField}
              onDeleteRow={onDeleteIndexField}
              editing={true}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditDrawer;
