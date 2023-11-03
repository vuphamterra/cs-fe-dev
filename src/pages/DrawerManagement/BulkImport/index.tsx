/* eslint-disable multiline-ternary */
/* eslint-disable indent */
import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormItemProps,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Steps,
  Upload,
} from 'antd';

import styles from './BulkImport.module.scss';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { DATE_FORMAT, DECIMAL_NUMBER, FIELD_FLAG, FIELD_TYPE_CODE, REGEX } from '~/constants';
import {
  bulkImport,
  getAutoIndexDataByAutoIndexKey,
  getDataReferenceDataByKeyRef,
  getDrawerDetail,
  removeAutoIndex,
  resetCreateFolderData,
  setCreateFolderAutoIndex,
  uploadFiles,
} from '~/store/DrawerSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { isStringEmpty } from '~/utils/validations';
import dayjs from 'dayjs';
import _ from 'lodash';
import {
  formatNumber,
  formatPhoneNumber,
  formatSocialSecurity,
  getOriginalPhoneNumber,
  getOriginalSSN,
} from '~/utils';
import { BulkImportIcon, UploadFileIcon } from '~/components/Icons';
import notification from '~/utils/notification';
import { getFolders } from '~/store/FolderSlice';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const BulkImportModal = (modelProps: ModalProps) => {
  const { open, setOpen } = modelProps;
  const dispatch = useAppDispatch();
  const listDrawer = useAppSelector((s) => s.draw.drawers);
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer) || null;
  const loading = useAppSelector((s) => s.draw.createFolderLoading) || false;
  const { folders } = useAppSelector((store) => store.folder);

  const [form] = Form.useForm();
  const [step, setStep] = useState<number>(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadFileError, setUploadFileError] = useState({
    // maxFiles: '',
    // maxFileSize: '',
    maxTotalFileSize: '',
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [justLoadedAutoKey, setJustLoadedAutoKey] = useState<number>(null);

  useEffect(() => {
    dispatch(getFolders({ drawer_id: currentDrawer?.id }));
  }, []);

  const headModal = (
    <div className={styles.modal_title}>
      <BulkImportIcon width={48} height={48} fill="" />
      <p>Admin Import Folder</p>
    </div>
  );

  const props: UploadProps = {
    accept: '.png, .jpg, .jpeg, .pdf, .tif, .tiff',
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    onChange: (fileList) => {
      setFileList(fileList.fileList);
      const sizeFileList = fileList.fileList.map((file) => file.size);
      setUploadFileError({
        ...uploadFileError,
        // maxFileSize:
        //   sizeFileList.filter((i) => i > 30).length > 0
        //     ? "The file you're trying to upload is too large. Please make sure the file is no larger than 300MB."
        //     : '',
        // maxFiles: fileList.fileList.length > 20 ? 'Maximum number of file upload: 20 files' : '',
        maxTotalFileSize:
          sizeFileList.reduce((a, b) => a + b, 0) > 300000000
            ? "The file you're trying to upload is too large. Please make sure the file is no larger than 300MB."
            : '',
      });
    },
    fileList,
  };

  const handleOnBlurInput = (
    value: string,
    fieldId: number,
    isKeyRef: boolean,
    isAutoIndex: boolean,
  ) => {
    if (!isKeyRef && !isAutoIndex) {
      return;
    }
    const { fields = [], id = null } = currentDrawer || {};
    setLocalLoading(true);
    const api = isKeyRef ? getDataReferenceDataByKeyRef : getAutoIndexDataByAutoIndexKey;
    if (!api) {
      return;
    }
    const payload = isKeyRef
      ? { drawer_id: id, name: value }
      : { drawer_id: id, name: value, field_id: fieldId };

    dispatch(api(payload))
      .then((res) => {
        setLocalLoading(false);
        const {
          payload: { statusCode = '' },
        } = res || {};
        if (statusCode === 200) {
          const { payload: { payload = [] } = {} } = res || {};
          if (_.isEmpty(payload)) {
            return;
          }
          let data = [];
          if (isKeyRef) {
            const { data: apiData = [] } = payload[0] || {};
            data = [...apiData];
          }
          if (isAutoIndex) {
            data = [...payload];
          }
          if (_.isEmpty(data)) {
            return;
          }
          let callingCbFlag = false;
          _.forEach(data, (item) => {
            const field = fields.find((f) => f.id === item.fieldId);
            if (isAutoIndex) {
              const { auto_key: autoKey = null } = item || {};
              if (!callingCbFlag && autoKey) {
                setJustLoadedAutoKey(autoKey);
                callingCbFlag = true;
              }
            }
            if (!field) {
              return;
            }
            const { type, lists } = field;
            if (type.type_code === FIELD_TYPE_CODE.DATE) {
              const date = dayjs(item.name, DATE_FORMAT[type.format]);
              form.setFieldsValue({ [`${item.fieldId}`]: date });
            }
            if (
              [
                FIELD_TYPE_CODE.TEXT,
                FIELD_TYPE_CODE.NUMBER,
                FIELD_TYPE_CODE.PHONE_NUMBER,
                FIELD_TYPE_CODE.SOCIAL_SECURITY,
                FIELD_TYPE_CODE.LIST,
              ].includes(type.type_code)
            ) {
              let value = item.name;
              if (type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER) {
                value = getOriginalPhoneNumber(item.name);
              }
              if (type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY) {
                value = getOriginalSSN(item.name);
              }
              if (type.type_code === FIELD_TYPE_CODE.LIST) {
                const option = lists.find(
                  (o) => _.trim(_.toLower(item.name)) === _.trim(_.toLower(o.name)),
                );
                if (option) {
                  value = option.name;
                }
              }
              form.setFieldsValue({ [`${item.fieldId}`]: value });
            }
          });
        }
      })
      .catch(() => {
        setLocalLoading(false);
      });
  };

  const renderInput = (field: any) => {
    const controlName = field.id;
    const required = field.flags.findIndex((flag) => flag.id === FIELD_FLAG.REQUIRED) > -1;
    const isKeyRef = field.flags.findIndex((flag) => flag.id === FIELD_FLAG.KEY_REFERENCE) > -1;
    const isAutoIndex = field.flags.findIndex((flag) => flag.id === FIELD_FLAG.AUTO_INDEX) > -1;
    const isDataRef = field.flags.findIndex((flag) => flag.id === FIELD_FLAG.DATA_REFERENCE) > -1;
    const refTxt = isKeyRef ? 'Key Reference' : isDataRef ? 'Data Reference' : '';
    const controlLabel = isKeyRef || isDataRef ? `${field.name} | ${refTxt}` : field.name;

    const rules: FormItemProps['rules'] = [
      () => ({
        validator(rule, value) {
          if (isStringEmpty(_.trim(value)) && required) {
            return Promise.reject(new Error('This field is required!'));
          }
          return Promise.resolve();
        },
      }),
    ];
    if (
      [
        FIELD_TYPE_CODE.TEXT,
        FIELD_TYPE_CODE.NUMBER,
        FIELD_TYPE_CODE.SOCIAL_SECURITY,
        FIELD_TYPE_CODE.PHONE_NUMBER,
      ].includes(field.type?.type_code)
    ) {
      const inputType =
        field.type?.type_code === FIELD_TYPE_CODE.TEXT ||
          field.type?.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY
          ? 'text'
          : 'number';
      if (field.type?.type_code === FIELD_TYPE_CODE.TEXT) {
        const moreRules = [
          { min: 1, message: 'Minimum 1 character' },
          { max: field.width, message: `Maximum ${field.width} characters` },
          () => ({
            validator(rules, value) {
              if (!required && !value) return Promise.resolve();
              const sanitizedValue = _.trim(value);
              const isValueTaken = folders.some((folder) => folder[field.name] === sanitizedValue);
              const isUnique = field.flags.some((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && isValueTaken) {
                return Promise.reject(new Error('Value must be unique'));
              }
              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      if (field.type?.type_code === FIELD_TYPE_CODE.NUMBER) {
        const moreRules = [
          { min: 1, message: 'Minimum 1 character' },
          () => ({
            validator(rules, value) {
              if (!_.isEmpty(value)) {
                // Check negative number
                if (value.match(/^[-]/g)) {
                  return Promise.reject(new Error('Negative number is not allowed'));
                }
                // Check length
                const valueWithNoDecimalPoint = value.replace('.', '');
                if (valueWithNoDecimalPoint.length > field.width) {
                  return Promise.reject(new Error(`Maximum ${field.width} characters`));
                }
                // Check unique
                const sanitizedValue = _.trim(value);
                const isValueTaken = folders.some(
                  (folder) => folder[field.name] === sanitizedValue,
                );
                const isUnique = field.flags.some((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY);
                if (isUnique && isValueTaken) {
                  return Promise.reject(new Error('Value must be unique'));
                }
              }
              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      if (field.type?.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY) {
        const moreRules = [
          () => ({
            validator(rules, value) {
              const maxLength = 9;
              if (isStringEmpty(value)) {
                return Promise.resolve();
              }
              if (!REGEX.NUMBER_ONLY.test(value)) {
                return Promise.reject(new Error('Only accept number'));
              }
              if (value.length !== maxLength && REGEX.NUMBER_ONLY.test(value)) {
                return Promise.reject(new Error(`${field.name} must have ${maxLength} characters`));
              }

              const sanitizedValue = _.trim(value);
              const isValueTaken = folders.some((folder) => folder[field.name] === sanitizedValue);
              const isUnique = field.flags.some((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && isValueTaken) {
                return Promise.reject(new Error('Value must be unique'));
              }

              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      if (field.type?.type_code === FIELD_TYPE_CODE.PHONE_NUMBER) {
        const moreRules = [
          () => ({
            validator(rules, value) {
              if (isStringEmpty(value)) {
                return Promise.resolve();
              }
              const length = field.type?.format.split('').filter((i) => i === '#').length;
              if (value.length !== length) {
                return Promise.reject(new Error(`${field.name} must have exact ${length} numbers`));
              }
              if (!REGEX.NUMBER_ONLY.test(value)) {
                return Promise.reject(new Error('Only accept number'));
              }
              const sanitizedValue = _.trim(value);
              const isValueTaken = folders.some(
                (folder) => getOriginalPhoneNumber(folder[field.name] ?? '') === sanitizedValue,
              );
              const isUnique = field.flags.some((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && isValueTaken) {
                return Promise.reject(new Error('Value must be unique'));
              }
              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      return (
        <Form.Item name={controlName} label={controlLabel} rules={rules}>
          <Input
            type={inputType}
            onBlur={(e) => handleOnBlurInput(e.target.value, field.id, isKeyRef, isAutoIndex)}
            onPressEnter={(e) => {
              const inputEle = e.target as HTMLInputElement;
              handleOnBlurInput(inputEle.value, field.id, isKeyRef, isAutoIndex);
            }}
            onKeyDown={(e) => {
              if (inputType === 'number' && e.key === 'e') {
                e.preventDefault();
              }
            }}
          />
        </Form.Item>
      );
    }
    if (field.type?.type_code === FIELD_TYPE_CODE.DATE) {
      const format = DATE_FORMAT[field.format_id];
      const currentDate = dayjs(new Date());
      const hasDateStamp = field.flags.some((flag) => flag.id === FIELD_FLAG.DATE_STAMP);
      const dynamicProps = hasDateStamp ? { initialValue: currentDate } : {};
      const moreRules = [
        () => ({
          validator(rules, value) {
            if (isStringEmpty(value)) {
              return Promise.resolve();
            }
            const selectedDate = _.trim(value.format(DATE_FORMAT[field.format_id]));
            const isValueTaken = folders.some((folder) => folder[field.name] === selectedDate);
            const isUnique = field.flags.some((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY);
            if (isUnique && isValueTaken) {
              return Promise.reject(new Error('Value must be unique'));
            }
            return Promise.resolve();
          },
        }),
      ];
      rules.push(...moreRules);
      return (
        <Form.Item name={controlName} label={controlLabel} rules={rules} {...dynamicProps}>
          <DatePicker
            format={format}
            onChange={(date, dateString) => {
              handleOnBlurInput(dateString, field.id, isKeyRef, isAutoIndex);
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
      );
    }
    if (field.type?.type_code === FIELD_TYPE_CODE.LIST) {
      const list = _.cloneDeep(field.lists).sort((a, b) => a.order_no - b.order_no);
      const options = list.map((item) => ({ value: item.name, label: item.name }));
      const emptyOption = '-- Choose --';
      options.unshift({ value: '', label: emptyOption });
      const isRequired = field.flags.some((flag) => flag.id === FIELD_FLAG.REQUIRED);
      const moreRules = [
        () => ({
          validator(rules, value) {
            if (value === emptyOption && isRequired) {
              return Promise.reject(new Error('This field is required'));
            }
            return Promise.resolve();
          },
        }),
      ];
      rules.push(...moreRules);
      return (
        <Form.Item
          name={controlName}
          label={controlLabel}
          rules={rules}
          initialValue={options[0].value}
        >
          <Select
            options={options}
            onChange={(value) => {
              handleOnBlurInput(value, field.id, isKeyRef, isAutoIndex);
            }}
          />
        </Form.Item>
      );
    }
    return null;
  };

  const FiledsTable = () => {
    return (
      <>
        {step !== 2 ? (
          ''
        ) : (
          <div className={styles.create_folder}>
            <Row className={styles.table_head}>
              <Col span={10}>Field</Col>
              <Col span={4}>Type</Col>
              <Col span={4}>Width</Col>
              <Col span={3}>Required</Col>
              <Col span={3}>Unique</Col>
            </Row>
            <Form
              layout="vertical"
              form={form}
              className={styles.form_contain}
              disabled={step !== 2}
              requiredMark={false}
            >
              {currentDrawer.fields.map((field) => (
                <Row key={field.id} className={styles.row}>
                  <Col span={10}>{renderInput(field)}</Col>
                  <Col span={4} className="d-flex align-items-center justify-content-center">
                    {field.type.type_name}
                  </Col>
                  <Col span={4} className="d-flex align-items-center justify-content-center">
                    {_.isNumber(field.width) && field.width > 0 ? field.width : '-'}
                  </Col>
                  <Col span={3} className="d-flex align-items-center justify-content-center">
                    {field.flags.findIndex((flag) => flag.id === FIELD_FLAG.REQUIRED) > -1
                      ? 'Yes'
                      : 'No'}
                  </Col>
                  <Col span={3} className="d-flex align-items-center justify-content-center">
                    {field.flags.findIndex((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY) > -1
                      ? 'Yes'
                      : 'No'}
                  </Col>
                </Row>
              ))}
            </Form>
          </div>
        )}
      </>
    );
  };

  const FileTab = () => {
    return (
      <div className={styles.upload_files}>
        <div className={styles.file_notification}>
          {/* <p>{uploadFileError.maxFileSize}</p> */}
          <p>{uploadFileError.maxTotalFileSize}</p>
          {/* <p>{uploadFileError.maxFiles}</p> */}
        </div>
        <Upload
          disabled={step !== 1}
          {...props}
          listType="picture"
          multiple
          defaultFileList={[...fileList]}
        >
          <div className={styles.upload_tab}>
            <UploadFileIcon width={24} height={24} fill="" />
            <p>Upload Files (PNG, JPG, PDF, JPEG, TIF, TIFF)</p>
          </div>
        </Upload>
      </div>
    );
  };

  const handleChangDrawer = (value: number) => {
    dispatch(getDrawerDetail({ id: value })).then(() => {
      dispatch(resetCreateFolderData());
    });
  };

  const handleCloseModal = () => {
    setFileList([]);
    form.resetFields();
    setOpen(false);
    dispatch(resetCreateFolderData());
    setStep(0);
    setUploadFileError({ maxTotalFileSize: '' });
  };

  const handleSubmit = () => {
    if (step === 0) {
      setStep(1);
    }
    if (step === 1) {
      if (fileList.length === 0) {
        notification.error({ message: 'Invalid', description: 'No files uploaded' });
      } else {
        setStep(2);
      }
    }
    if (step === 2) {
      form
        .validateFields()
        .then((values) => {
          const payload = { drawer_id: currentDrawer.id, fields: [] };
          Object.keys(values).forEach((fieldId) => {
            if (values[fieldId]) {
              const field = currentDrawer.fields.find((item) => item.id === +fieldId);
              let description = _.trim(values[fieldId]);
              if (field && field.type.type_code === FIELD_TYPE_CODE.NUMBER) {
                const { width } = field;
                const num = formatNumber(values[fieldId], DECIMAL_NUMBER[field.format_id]);
                const numSizeDiff = num.length - (width + 1);
                if (numSizeDiff > 0) {
                  const updatedNum = num.substring(0, num.length - numSizeDiff);
                  if (updatedNum[updatedNum.length - 1] === '.') {
                    description = parseFloat(updatedNum).toString();
                  } else {
                    description = updatedNum;
                  }
                } else {
                  description = num;
                }
              }
              if (field && field.type.type_code === FIELD_TYPE_CODE.DATE) {
                description = _.trim(values[fieldId].format(DATE_FORMAT[field.format_id]));
              }
              if (field && field.type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER) {
                description = formatPhoneNumber(values[fieldId], field.format_id);
              }
              if (
                field &&
                field.type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY &&
                field.format_id === 8
              ) {
                description = formatSocialSecurity(values[fieldId]);
              }
              payload.fields.push({ id: fieldId, description });
            }
          });
          dispatch(bulkImport({ id: payload.drawer_id, dataSubmit: payload.fields })).then(
            (result) => {
              const {
                payload: { payload },
              } = result;
              if (fileList.length > 0) {
                const formData: any = new FormData();
                formData.append(
                  'destination',
                  `${currentDrawer.image_path}/${currentDrawer.name}/${payload[0].name}`,
                );
                formData.append('folder_id', payload[0].id);
                fileList.forEach((file) => {
                  formData.append('files[]', file.originFileObj);
                });
                dispatch(uploadFiles(formData)).then(() => {
                  handleCloseModal();
                  // Remove Auto Index Data
                  if (justLoadedAutoKey) {
                    dispatch(setCreateFolderAutoIndex(true));
                    dispatch(removeAutoIndex({ id: justLoadedAutoKey }))
                      .then(() => {
                        setJustLoadedAutoKey(null);
                      })
                      .catch((error) => console.log(error));
                  }
                });
              }
            },
          );
        })
        .catch((err) => {
          console.log('catch', err);
        });
    }
  };

  const handleActionButton = () => {
    if (step !== 1) {
      handleCloseModal();
    }
    if (step === 1) {
      setStep(0);
      setFileList([]);
    }
  };

  return (
    <>
      <Modal
        className={styles.bulk_import_modal}
        title={headModal}
        centered
        open={open}
        width={800}
        onCancel={handleCloseModal}
        destroyOnClose
        closable={!loading}
        maskClosable={!loading}
        footer={[
          <Button
            className={styles.btn_cancel}
            key="back"
            onClick={handleActionButton}
            disabled={loading}
          >
            {step !== 1 && 'Cancel'}
            {step === 1 && 'Back'}
          </Button>,
          <Button
            className={styles.btn_submit}
            key="submit"
            onClick={handleSubmit}
            disabled={
              (step === 2 && fileList.length === 0) ||
              Object.values(uploadFileError).filter((i) => i !== '').length > 0 ||
              loading
            }
          >
            {step !== 2 && 'Next'}
            {step === 2 && 'Create'}
          </Button>,
        ]}
      >
        <Spin spinning={loading || localLoading} size="large">
          <div className={styles.modal_body}>
            <Steps
              className={styles.step_body}
              direction="vertical"
              size="default"
              current={step}
              items={[
                {
                  title: 'Select Drawer',
                  description: (
                    <Select
                      style={{ width: '100%' }}
                      defaultValue={currentDrawer?.id}
                      options={listDrawer?.map((i) => [{ value: i.id, label: i.name }][0])}
                      onChange={handleChangDrawer}
                      disabled={step > 0}
                    />
                  ),
                },
                {
                  title: 'Import Files',
                  description: <FileTab />,
                },
                {
                  title: 'Create Folder',
                  description: <FiledsTable />,
                },
              ]}
            />
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default BulkImportModal;
