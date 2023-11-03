/* eslint-disable multiline-ternary */
import { useEffect, useState, useReducer, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as AntButton, Button, Spin, theme } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import _ from 'lodash';
import IndexFieldTable from '../components/IndexFieldTable';
import { DRAWER_MODEL, ERROR, INDEX_FIELD, INDEX_FIELD_MODEL, LIST_OPTION } from '../interfaces';
import { ACTION, FIELD_KEY, MOCK_DATA } from '../constants';
import { initialState, reducer } from '../reducer';
import ConfirmModal from '~/components/ConfirmModal';
import {
  BackArrow,
  Cancel,
  TrashBin,
} from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { createDrawer, updateMessage } from '~/store/DrawerSlice';
import notification from '~/utils/notification';
import { getTypes } from '~/store/IndexField';
import { getFormatOptions, getTypeNameByTypeId } from '../utils';
import IndexFieldForm from '../components/IndexFieldForm';
import useHttp from '~/hooks/use-http';
import { isStringEmpty } from '~/utils/validations';
import { MAX_LENGTH } from '~/constants';
import styles from './CreateDrawer.module.scss';

const CreateDrawer = () => {
  const appDispatch = useAppDispatch();
  const { selectedDb } = useAppSelector((state) => state.db);
  const {
    message,
    creating: creatingDrawer,
    total: totalDrawers,
  } = useAppSelector((state) => state.draw);
  const {
    loading: indexFieldSliceLoading,
    types: indexFieldTypes,
    formats: indexFieldFormats,
  } = useAppSelector((state) => state.indexField);
  const navigate = useNavigate();
  const [
    {
      currentTab,
      drawer,
      selectedIndexField,
      formatOptions,
      error,
      isModalOpen,
      deletingIndexField,
      isEditingIndexField,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const [navigationModalOpen, setNavigationModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { sendRequest, loading: findingDrawer } = useHttp();

  const loading = creatingDrawer || indexFieldSliceLoading || findingDrawer;
  const { setting: { root_path: rootPath = process.env.REACT_APP_IMAGE_PATH } = {} } = selectedDb;

  useEffect(() => {
    if (message) {
      notification[message.type]({ message: message.title, description: message.text });
      appDispatch(updateMessage(null));
      if (message.type === 'success') {
        setNavigationModalOpen(true);
      }
    }
    appDispatch(getTypes({ skip: 0, take: 100 }));
  }, [message]);

  useEffect(() => {
    if (indexFieldTypes.length && indexFieldFormats.length) {
      dispatch({
        type: ACTION.CHANGE_FORMAT_OPTIONS,
        payload: getFormatOptions(indexFieldTypes, indexFieldFormats, indexFieldTypes[0].id),
      });
    }
  }, [indexFieldTypes, indexFieldFormats]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    dispatch({ type: ACTION.CHANGE_REDFLAG, payload: { name, value: checked } });
  };

  const onDrawerNameChange = (e) => {
    dispatch({ type: ACTION.CHANGE_DRAWER_NAME, payload: e.target.value });
  };

  const onDrawerDescriptionChange = (e) => {
    dispatch({ type: ACTION.CHANGE_DRAWER_DESC, payload: e.target.value });
  };

  // const onFileLocationChange = (e) => {
  //   dispatch({ type: ACTION.CHANGE_FILE_LOCATION, payload: e.target.value });
  // };

  const onFieldNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ACTION.CHANGE_FIELD_NAME, payload: e.target.value });
  };

  const onFieldTypeChange = (e) => {
    dispatch({ type: ACTION.CHANGE_FIELD_TYPE, payload: +e.target.value });
    dispatch({
      type: ACTION.CHANGE_FORMAT_OPTIONS,
      payload: getFormatOptions(indexFieldTypes, indexFieldFormats, +e.target.value),
    });
  };

  const onWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value: number;
    if (!e.target.value) {
      value = 0;
    } else {
      value = parseInt(e.target.value);
      if (value < 0) {
        value = 0;
      }
    }

    dispatch({ type: ACTION.CHANGE_WIDTH, payload: value });
  };

  const onFormatChange = (e) => {
    dispatch({ type: ACTION.CHANGE_FORMAT, payload: +e.target.value });
  };

  const onInsertIndexField = () => {
    if (error) {
      return;
    }
    const seletedTypeName = getTypeNameByTypeId(indexFieldTypes, selectedIndexField.type);
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
    } else if (!error) {
      const { fields } = drawer;
      const existedField = fields.find(
        (field: INDEX_FIELD) => field.name === selectedIndexField.name,
      );
      if (!existedField) {
        let format = null;
        if (!selectedIndexField.format) {
          format = formatOptions.find((item) => item.type_id === selectedIndexField.type);
        }
        const isFieldTypeList =
          getTypeNameByTypeId(indexFieldTypes, selectedIndexField.type) === 'List';
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
            types: indexFieldTypes,
            formats: indexFieldFormats,
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
  };

  const onCreateDrawer = () => {
    if (_.trim(drawer.name) !== '') {
      sendRequest(
        {
          method: 'get',
          url: '/drawer/list',
          params: { skip: 0, take: totalDrawers, name: drawer.name },
        },
        (data) => {
          const { total } = data;
          if (total === 1) {
            dispatch({
              type: ACTION.CHANGE_ERROR,
              payload: { key: FIELD_KEY.DRAWER_NAME, message: 'This name already exists' },
            });
          } else {
            dispatch({ type: ACTION.CHANGE_TAB, payload: 2 });
            executeCreateDrawer();
          }
        },
      );
    } else {
      dispatch({ type: ACTION.CHANGE_DRAWER_NAME, payload: drawer.name });
    };
  };

  const executeCreateDrawer = () => {
    if (!drawer.fields.length) {
      notification.error({
        message: 'Invalid index fields',
        description: 'There is no index field. Please add at least one.',
      });
      return;
    } else if (drawer.fields.length > 10) {
      notification.error({
        message: 'Invalid index fields',
        description: 'Maximum 10 Index Fields only. Please edit or remove current Index Fields',
      });
      return;
    }

    const indexFields: INDEX_FIELD_MODEL[] = drawer.fields.map((field: INDEX_FIELD) => {
      const redflag = Object.keys(field.redflags).reduce((accumulator, currentValue) => {
        if (field.redflags[currentValue]) {
          accumulator.push(MOCK_DATA.REDFLAG_IDS[currentValue]);
        }
        return accumulator;
      }, []);
      const lists = field.userDefinedList.map((item, index) => ({
        name: _.trim(item.name),
        ordered: index + 1,
      }));
      return {
        name: field.name,
        format_id: field.format,
        width: field.width.toString(),
        redflag,
        lists,
      } as INDEX_FIELD_MODEL;
    });
    const newDrawer: DRAWER_MODEL = {
      name: drawer.name,
      description: drawer.description,
      database_id: selectedDb.id,
      // image_path: drawer.image_path,
      isDelete: false,
      image_path: rootPath,
      fields: indexFields,
    };
    appDispatch(createDrawer(newDrawer));
  };

  // const onButtonClick = () => {
  //   inputFile1.current.click();
  //   console.log(inputFile1.current);
  // };

  // const inputFile1 = useRef(null);

  const onEditIndexField = (indexField: INDEX_FIELD) => {
    dispatch({
      type: ACTION.EDIT_INDEX_FIELD,
      payload: { isEditingIndexField: true, indexFieldToBeEdited: indexField },
    });
    dispatch({
      type: ACTION.CHANGE_FORMAT_OPTIONS,
      payload: getFormatOptions(indexFieldTypes, indexFieldFormats, +indexField.type),
    });
  };

  const onDeleteIndexField = (indexField: INDEX_FIELD) => {
    dispatch({
      type: ACTION.CHANGE_MODAL_STATUS,
      payload: { status: true, deletingIndexField: indexField },
    });
  };

  const onUpdateIndexField = () => {
    if (error) {
      return;
    }
    const seletedTypeName = getTypeNameByTypeId(indexFieldTypes, selectedIndexField.type);
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
      const isFieldTypeList =
        getTypeNameByTypeId(indexFieldTypes, selectedIndexField.type) === 'List';
      if (isFieldTypeList && !selectedIndexField.userDefinedList.length) {
        notification.error({
          message: 'Invalid',
          description: 'User-defined List must have at least 1 option',
        });
        return;
      }
      dispatch({
        type: ACTION.UPDATE_INDEX_FIELD,
        payload: { selectedIndexField, types: indexFieldTypes, formats: indexFieldFormats },
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
      payload: getFormatOptions(
        indexFieldTypes,
        indexFieldFormats,
        initialState.selectedIndexField.type,
      ),
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

  const handleNavigationModalOk = () => {
    dispatch({ type: ACTION.RESET_STATE, payload: null });
    setNavigationModalOpen(false);
  };

  const handleNavigationModalCancel = () => {
    navigate(-1);
    setNavigationModalOpen(false);
  };

  const handleCancelModalOk = () => {
    setIsCancelModalOpen(false);
    navigate(-1);
  };

  const handleCancelModalCancel = () => {
    setIsCancelModalOpen(false);
  };

  const handleCancelCreateDrawerProcess = () => {
    setIsCancelModalOpen(true);
  };

  const renderModalFooter = (
    cancelText: string,
    okText: string,
    handleOk: () => void,
    handleCancel: () => void,
  ) => {
    return (
      <div className={styles.modal_footer}>
        <AntButton className={`cs_modal_cancel_btn ${styles.cancel_btn}`} onClick={handleCancel}>
          {cancelText}
        </AntButton>
        <AntButton className={`cs_modal_ok_btn ${styles.remove_btn}`} onClick={handleOk}>
          {okText}
        </AntButton>
      </div>
    );
  };

  return (
    <div className={`scroll_content ${styles.container}`}>
      <ConfirmModal
        isOpen={isCancelModalOpen}
        headerIcon={<Cancel width={24} height={24} fill="" />}
        headerTitle="Cancel"
        handleOk={handleCancelModalCancel}
        handleCancel={handleCancelModalCancel}
        centered
        footer={renderModalFooter('Yes', 'No', handleCancelModalCancel, handleCancelModalOk)}
        wrapClassName="primary_modal_container"
      >
        <p className={styles.modal_text}>Are you sure you want to cancel creating this drawer?</p>
      </ConfirmModal>
      <ConfirmModal
        isOpen={navigationModalOpen}
        headerIcon={<QuestionCircleFilled />}
        headerTitle="What's next?"
        handleOk={handleNavigationModalOk}
        handleCancel={handleNavigationModalCancel}
        closable={false}
        maskClosable={false}
        centered
        footer={renderModalFooter(
          'Back',
          'Stay',
          handleNavigationModalOk,
          handleNavigationModalCancel,
        )}
        wrapClassName="primary_modal_container"
      >
        <p className={styles.modal_text}>
          Go back to Drawer Dashboard or stay and create another drawer?
        </p>
      </ConfirmModal>
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
      <div className="margin__row position-relative">
        {loading && (
          <div className={styles.loading_spinner}>
            <Spin />
          </div>
        )}
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center crt__drw">
              <Button
                className={styles.cancel_create_process_btn}
                icon={<BackArrow width={20} height={20} fill="" />}
                onClick={handleCancelCreateDrawerProcess}
              />
              <h4 className="statistics txt-384">Create New Drawer</h4>
            </div>
            <div>
              <button className="next__btn" type="submit" onClick={onCreateDrawer}>
                Save
              </button>
            </div>
          </div>
          <hr className="mt-md-3 " />
        </div>
        <Row>
          <h5 className="pb-2">Add Drawer Information</h5>
          <Form name="firstStepFrm">
            <Form.Group className="mb-3" controlId="drawerName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                placeholder="Enter drawer name"
                value={drawer.name}
                onChange={onDrawerNameChange}
                isInvalid={error && error.key === FIELD_KEY.DRAWER_NAME}
              />
              {error && error.key === FIELD_KEY.DRAWER_NAME && (
                <Form.Control.Feedback type="invalid">
                  {error.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mt-3" controlId="drawerDesc">
              <Form.Label className="login-form_label form__label_fnt">
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description (optional)"
                // id="description"
                name="description"
                value={drawer.description}
                onChange={onDrawerDescriptionChange}
                maxLength={200}
              />
            </Form.Group>
          </Form>
        </Row>
        <Row className="pt-5">
          <h5 className="pb-2">Create index fields</h5>
          <Col lg={4}>
            <div>
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
                creatingDrawer={true}
                onViewing={true}
              />
            </div>
          </Col>
          <Col lg={8}>
            <div>
              <IndexFieldTable
                data={drawer.fields}
                onEditRow={onEditIndexField}
                onDeleteRow={onDeleteIndexField}
                editing={isEditingIndexField}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CreateDrawer;
