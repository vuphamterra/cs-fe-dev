import { UploadOutlined } from '@ant-design/icons';
import type { FormItemProps } from 'antd';
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Spin,
  Steps,
  Upload,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import _ from 'lodash';
import { forwardRef, useState } from 'react';
import { onLoadScannerClick } from '~/assets/js/network';
import {
  DATE_FORMAT,
  FIELD_FLAG,
  FIELD_TYPE,
  FIELD_TYPE_CODE,
  MAX_LENGTH,
  REGEX,
} from '~/constants';
import { getAutoIndexDataByAutoIndexKey, getDataReferenceDataByKeyRef } from '~/store/DrawerSlice';
import { downloadFolderTemplate } from '~/store/FolderSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { getOriginalPhoneNumber, getOriginalSSN } from '~/utils';
import { isStringEmpty } from '~/utils/validations';
import { FIELD_UI } from '../../interfaces';
import styles from './IndexFieldForm.module.scss';

type Props = {
  currentStep: number;
  multipleFolders: boolean;
  importScanType: number;
  updateCurrentStep: (step: number) => void;
  updateImportScanType: (type: number) => void;
  fileList: UploadFile[];
  updateFileList: (fileList: UploadFile[]) => void;
  handleDataScanner: (object: any) => void;
  uploadFileError: { maxFiles: string; maxFileSize: string; maxTotalFileSize: string };
  setUploadFileError: (error: {
    maxFiles: string;
    maxFileSize: string;
    maxTotalFileSize: string;
  }) => void;
  autoIndexCb?: (autoKey: number) => void;
};

const IndexFieldForm = forwardRef<FormInstance, Props>((props, ref) => {
  const dispatch = useAppDispatch();
  const { currentDrawer, createFolderLoading } = useAppSelector((store) => store.draw);
  const { fields, folders, loading } = useAppSelector((store) => store.folder);
  const [form] = Form.useForm();
  const [localLoading, setLocalLoading] = useState(false);

  const uploadProps: UploadProps = {
    accept: props.multipleFolders ? '.csv, .xls, .xlsx' : '.png, .jpg, .jpeg, .pdf, .tif, .tiff',
    multiple: true,
    listType: 'picture',
    defaultFileList: _.cloneDeep(props.fileList),
    onChange({ fileList }) {
      props.updateFileList([...fileList]);
      const sizeFileList = fileList.map((file) => file.size);
      props.setUploadFileError({
        ...props.uploadFileError,
        // maxFileSize:
        //   sizeFileList.filter((i) => i > 30000000).length > 0
        //     ? 'Maximum single file size: 30MB'
        //     : '',
        // maxFiles: fileList.length > 20 ? 'Maximum number of file upload: 20 files' : '',
        maxTotalFileSize:
          sizeFileList.reduce((a, b) => a + b, 0) > 300000000
            ? "The file you're trying to upload is too large. Please make sure the file is no larger than 300MB."
            : '',
      });
    },
    beforeUpload() {
      return false;
    },
    onRemove: (file) => {
      const filteredFileList = props.fileList.filter((item) => item.uid !== file.uid);
      props.updateFileList(filteredFileList);
    },
    fileList: [...props.fileList],
  };

  const handleDownloadCSV = () => {
    if (currentDrawer && currentDrawer.id) {
      dispatch(downloadFolderTemplate({ drawerId: currentDrawer.id })).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.payload]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Folder_CSV_Template.csv');
        document.body.appendChild(link);
        link.click();
      });
    }
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
            if (isAutoIndex) {
              const { auto_key: autoKey = null } = item || {};
              if (!callingCbFlag && autoKey) {
                props.autoIndexCb(autoKey);
                callingCbFlag = true;
              }
            }
            const field = fields.find((f) => f.id === item.fieldId);
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

  const renderInput = (field: FIELD_UI, focus?: boolean) => {
    const controlName = field.fieldId;
    const required = field.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.REQUIRED) > -1;
    const isKeyRef = field.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.KEY_REFERENCE) > -1;
    const isAutoIndex = field.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.AUTO_INDEX) > -1;
    const isDataRef =
      field.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.DATA_REFERENCE) > -1;
    const refTxt = isKeyRef ? 'Key Reference' : isDataRef ? 'Data Reference' : '';
    const controlLabel = isKeyRef || isDataRef ? `${field.name} | ${refTxt}` : field.name;
    const rules: FormItemProps['rules'] = [
      () => ({
        validator(rule, value) {
          if (isStringEmpty(_.trim(value)) && required) {
            return Promise.reject(new Error('This field is required'));
          }
          return Promise.resolve();
        },
      }),
    ];
    if (
      [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.NUMBER,
        FIELD_TYPE.SOCIAL_SECURITY,
        FIELD_TYPE.PHONE_NUMBER,
      ].includes(field.typeId)
    ) {
      const inputType =
        field.typeId === FIELD_TYPE.TEXT || field.typeId === FIELD_TYPE.SOCIAL_SECURITY
          ? 'text'
          : 'number';
      if (FIELD_TYPE.TEXT === field.typeId) {
        const moreRules = [
          { min: 1, message: 'Minimum 1 character' },
          { max: field.width, message: `Maximum ${field.width} characters` },
          () => ({
            validator(rules, value) {
              const sanitizedValue = _.trim(value);
              const isValueTaken = folders.some((folder) => folder[field.name] === sanitizedValue);
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && isValueTaken) {
                return Promise.reject(new Error('Value must be unique'));
              }
              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      if (FIELD_TYPE.NUMBER === field.typeId) {
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
                const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
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
      if (FIELD_TYPE.SOCIAL_SECURITY === field.typeId) {
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
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && isValueTaken) {
                return Promise.reject(new Error('Value must be unique'));
              }

              return Promise.resolve();
            },
          }),
        ];
        rules.push(...moreRules);
      }
      if (FIELD_TYPE.PHONE_NUMBER === field.typeId) {
        const moreRules = [
          () => ({
            validator(rules, value) {
              if (isStringEmpty(value)) {
                return Promise.resolve();
              }
              const length = MAX_LENGTH[`${field.typeId}-${field.formatId}`];
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
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
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
            autoFocus={focus}
            disabled={props.currentStep < 2}
            type={inputType}
            onBlur={(e) => handleOnBlurInput(e.target.value, field.fieldId, isKeyRef, isAutoIndex)}
            onPressEnter={(e) => {
              const inputEle = e.target as HTMLInputElement;
              handleOnBlurInput(inputEle.value, field.fieldId, isKeyRef, isAutoIndex);
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
    if (field.typeId === FIELD_TYPE.DATE) {
      const format = DATE_FORMAT[field.formatId];
      const currentDate = dayjs(new Date());
      const hasDateStamp = field.flags.some((flag) => flag.flagId === FIELD_FLAG.DATE_STAMP);
      const dynamicProps = hasDateStamp ? { initialValue: currentDate } : {};
      const moreRules = [
        () => ({
          validator(rules, value) {
            if (isStringEmpty(value)) {
              return Promise.resolve();
            }
            const selectedDate = _.trim(value.format(DATE_FORMAT[field.formatId]));
            const isValueTaken = folders.some((folder) => folder[field.name] === selectedDate);
            const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
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
            disabled={props.currentStep < 2}
            format={format}
            onChange={(date, dateString) => {
              handleOnBlurInput(dateString, field.fieldId, isKeyRef, isAutoIndex);
            }}
          />
        </Form.Item>
      );
    }
    if (field.typeId === FIELD_TYPE.LIST) {
      const list = _.cloneDeep(field.lists).sort((a, b) => a.order_no - b.order_no);
      const options = list.map((item) => ({ value: item.name, label: item.name }));
      const emptyOption = '-- Choose --';
      options.unshift({ value: '', label: emptyOption });
      const isRequired = field.flags.some((flag) => flag.flagId === FIELD_FLAG.REQUIRED);
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
            disabled={props.currentStep < 2}
            options={options}
            onChange={(value) => {
              handleOnBlurInput(value, field.fieldId, isKeyRef, isAutoIndex);
            }}
          />
        </Form.Item>
      );
    }
    return null;
  };

  const renderRows = () => {
    return fields.map((item, index) => (
      <Row key={item.fieldId} className={styles.row}>
        <Col span={10}>{renderInput(item, index === 0)}</Col>
        <Col span={4} className="d-flex align-items-center justify-content-center">
          {item.typeName}
        </Col>
        <Col span={4} className="d-flex align-items-center justify-content-center">
          {_.isNumber(item.width) && item.width > 0 ? item.width : '-'}
        </Col>
        <Col span={3} className="d-flex align-items-center justify-content-center">
          {item.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.REQUIRED) > -1 ? 'Yes' : 'No'}
        </Col>
        <Col span={3} className="d-flex align-items-center justify-content-center">
          {item.flags.findIndex((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY) > -1
            ? 'Yes'
            : 'No'}
        </Col>
      </Row>
    ));
  };

  const renderSelectDrawerStep = () => {
    return (
      <div className={`d-flex flex-column mt-2 ${styles.modal_description}`}>
        <input
          className="my-1"
          disabled
          value={currentDrawer && currentDrawer.name ? currentDrawer.name : ''}
        />
      </div>
    );
  };

  const renderCreateFolderStep = () => {
    if (props.currentStep === 1 && !props.multipleFolders) {
      return null;
    }
    if (props.currentStep === 2 && !props.multipleFolders) {
      return (
        <>
          <Row className={styles.head_row}>
            <Col span={10}>Field</Col>
            <Col span={4}>Type</Col>
            <Col span={4}>Width</Col>
            <Col span={3}>Required</Col>
            <Col span={3}>Unique</Col>
          </Row>
          <div className="scroll_content" style={{ maxHeight: '500px' }}>
            {renderRows()}
          </div>
        </>
      );
    }
    return (
      <>
        <div className={styles.download_csv}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleDownloadCSV();
            }}
          >
            Download CSV Template
          </a>
        </div>
        <Upload className={styles.upload_folders_area} {...uploadProps}>
          <div className={styles.upload_area_content}>
            <span className={styles.upload_icon}>
              <UploadOutlined />
            </span>
            <p>Upload Files (CSV)</p>
          </div>
        </Upload>
      </>
    );
  };

  const handleClick = () => {
    onLoadScannerClick(props.handleDataScanner);
  };

  const renderImportFileStep = () => {
    const { maxFileSize, maxFiles, maxTotalFileSize } = props.uploadFileError;
    const hasError = maxFileSize || maxFiles || maxTotalFileSize;
    if (props.currentStep === 1) {
      return (
        <div className={styles.import_file_content}>
          <Radio.Group
            onChange={(e) => props.updateImportScanType(e.target.value)}
            value={props.importScanType}
          >
            <Radio value={1}>Import</Radio>
            <Radio value={2}>Scan</Radio>
          </Radio.Group>
          {hasError && (
            <div className={styles.file_notification}>
              <p>{maxFileSize}</p>
              <p>{maxFiles}</p>
              <p>{maxTotalFileSize}</p>
            </div>
          )}
          {props.importScanType === 2 && (
            <div className={styles.scan_files_btn}>
              <Button onClick={handleClick}>Scan Files</Button>
            </div>
          )}
          <div>
            <Upload
              className={`${styles.upload_folders_area} ${props.importScanType === 2 ? styles.hide_upload_input : ''
                }`}
              {...uploadProps}
            >
              <div className={styles.upload_area_content}>
                <span className={styles.upload_icon}>
                  <UploadOutlined />
                </span>
                <p>Upload Files (PNG, JPG, PDF, JPEG, TIF, TIFF)</p>
              </div>
            </Upload>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Form form={form} ref={ref} layout="vertical" className={styles.form}>
      {(loading || createFolderLoading || localLoading) && (
        <div className={styles.spinner_container}>
          <Spin />
        </div>
      )}
      <Steps
        direction="vertical"
        size="small"
        current={props.currentStep}
        items={[
          {
            title: 'Select Drawer',
            description: renderSelectDrawerStep(),
          },
          !props.multipleFolders && {
            title: 'Import Files',
            description: renderImportFileStep(),
          },
          {
            title: 'Create Folder',
            description: renderCreateFolderStep(),
          },
        ]}
      />
    </Form>
  );
});

IndexFieldForm.displayName = 'CreateNewFolderForm';

export default IndexFieldForm;
