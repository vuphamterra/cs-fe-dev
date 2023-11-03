/* eslint-disable indent */
/* eslint-disable multiline-ternary */
import { CloseOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, FormItemProps, Input, Select, Spin } from 'antd';
import { memo, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import FileList from '../FileList';
import styles from './FileDetail.module.scss';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import {
  DATE_FORMAT,
  DECIMAL_NUMBER,
  DRAWER_PERMISSION,
  FIELD_FLAG,
  FIELD_TYPE,
  FIELD_TYPE_CODE,
  MAX_LENGTH,
  REGEX,
} from '~/constants';
import { getFolderDetail, updateFolder } from '~/store/FileSlice';
import { FIELD_UI } from '~/pages/FolderManagement/interfaces';
import { isStringEmpty } from '~/utils/validations';
import _ from 'lodash';
import { FileListIcon, IndexFieldIcon } from '~/components/Icons';
import {
  formatNumber,
  formatPhoneNumber,
  formatSocialSecurity,
  getOriginalPhoneNumber,
  getOriginalSSN,
} from '~/utils';
import {
  getAutoIndexDataByAutoIndexKey,
  getDataReferenceDataByKeyRef,
  removeAutoIndex,
} from '~/store/DrawerSlice';
import { getFolders } from '~/store/FolderSlice';

const FileDetail = () => {
  const { fields, folders } = useAppSelector((store) => store.folder);
  const files = useAppSelector((s) => s.file.files);
  const currentFile = useAppSelector((s) => s.file.currentFile);
  const loading = useAppSelector((s) => s.file.loadingList);
  const folderDetail = useAppSelector((s) => s.file.folderDetail);
  const folderId = useAppSelector((s) => s.file.folderId);
  const drawerPermissions = useAppSelector((s) => s.draw.drawerPermissions);
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer);

  const [isEditingFolder, setIsEditingFolder] = useState<boolean>(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentLocation = useMemo(() => pathname.split('/')[3], [pathname]);
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const [localLoading, setLocalLoading] = useState(false);
  const [justLoadedAutoKey, setJustLoadedAutoKey] = useState<number>(null);

  useEffect(() => {
    if (currentLocation === 'files') {
      form.resetFields();
    } else {
      const fieldPhoneNumber = fields.filter((i) => i.typeId === FIELD_TYPE.PHONE_NUMBER);
      const fieldSocial = fields.filter((i) => i.formatId === 8);
      if (isEditingFolder) {
        fieldPhoneNumber.map(({ fieldId }) =>
          form.setFieldsValue({
            [`${fieldId}`]: folderDetail
              .filter((i) => i.fieldId === fieldId)[0]
              .description.split(/[-()+ ]+/)
              .join(''),
          }),
        );
        fieldSocial.map(({ fieldId }) =>
          form.setFieldsValue({
            [`${fieldId}`]: folderDetail
              .filter((i) => i.fieldId === fieldId)[0]
              .description.split('-')
              .join(''),
          }),
        );
      } else {
        dispatch(getFolderDetail(folderId)).then(() => {
          fieldPhoneNumber.map(({ fieldId }) =>
            form.setFieldsValue({
              [`${fieldId}`]: folderDetail.filter((i) => i.fieldId === fieldId)[0]?.description,
            }),
          );
          fieldSocial.map(({ fieldId }) =>
            form.setFieldsValue({
              [`${fieldId}`]: folderDetail.filter((i) => i.fieldId === fieldId)[0]?.description,
            }),
          );
        });
      }
    }
  }, [currentLocation, isEditingFolder, JSON.stringify(folderDetail)]);

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
                setJustLoadedAutoKey(autoKey);
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

  const renderInput = (field: FIELD_UI) => {
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
            return Promise.reject(new Error('This field is required!'));
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
        field.typeId === FIELD_TYPE.TEXT ||
        field.typeId === FIELD_TYPE.SOCIAL_SECURITY ||
        field.typeId === FIELD_TYPE.PHONE_NUMBER
          ? 'text'
          : 'number';
      if (FIELD_TYPE.TEXT === field.typeId) {
        const moreRules = [
          { min: 1, message: 'Minimum 1 character' },
          { max: field.width, message: `Maximum ${field.width} characters` },
          () => ({
            validator(rules, value) {
              if (!required && !value) return Promise.resolve();
              const currentFolderValue = folderDetail.filter((i) => i.fieldId === field.fieldId)[0]
                .description;
              const sanitizedValue = _.trim(value);
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && sanitizedValue !== currentFolderValue) {
                const isValueTaken = folders.some(
                  (folder) => folder[field.name] === sanitizedValue,
                );
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
      if (FIELD_TYPE.NUMBER === field.typeId) {
        const moreRules = [
          { min: 1, message: 'Minimum 1 character' },
          () => ({
            validator(rules, value) {
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
              const currentFolderValue = folderDetail.filter((i) => i.fieldId === field.fieldId)[0]
                .description;
              const sanitizedValue = _.trim(value);
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && sanitizedValue !== currentFolderValue) {
                const isValueTaken = folders.some(
                  (folder) => folder[field.name] === sanitizedValue,
                );
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
              const splitString = value.split('');
              const newString =
                splitString[3] === '-' && splitString[6] === '-' ? value.replace(/-/g, '') : value;

              if (isStringEmpty(newString)) {
                return Promise.resolve();
              }

              if (!REGEX.NUMBER_ONLY.test(value)) {
                return Promise.reject(new Error('Only accept number'));
              }

              const maxLength = 9;
              if (newString.length !== maxLength && REGEX.NUMBER_ONLY.test(newString)) {
                return Promise.reject(new Error(`${field.name} must have ${maxLength} characters`));
              } else if (newString.length > 9 && !REGEX.NUMBER_ONLY.test(newString)) {
                return Promise.reject(new Error('Correct format is (###-##-####)'));
              }

              // Check unique
              const currentFolderValue = folderDetail
                .find((i) => i.fieldId === field.fieldId)
                ?.description.split('-')
                .join('');
              const sanitizedValue = _.trim(value);
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              const isValueTaken = folders.some(
                (folder) => folder[field.name]?.split('-').join('') === sanitizedValue,
              );
              if (isUnique && sanitizedValue !== currentFolderValue) {
                if (isValueTaken) {
                  return Promise.reject(new Error('Value must be unique'));
                }
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

              // Check unique
              const currentFolderValue = folderDetail
                .filter((i) => i.fieldId === field.fieldId)[0]
                .description.split(/[-()+ ]+/)
                .join('');
              const sanitizedValue = _.trim(value);
              const isUnique = field.flags.some((flag) => flag.flagId === FIELD_FLAG.UNIQUE_KEY);
              if (isUnique && sanitizedValue !== currentFolderValue) {
                const isValueTaken = folders.some(
                  (folder) => getOriginalPhoneNumber(folder[field.name] ?? '') === sanitizedValue,
                );
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
      let initialValue = folderDetail.filter((i) => i.fieldId === field.fieldId)[0].description;
      if (inputType === 'number') {
        initialValue = initialValue.split('-').join('');
      }
      if (field.formatId === 8) {
        initialValue = formatSocialSecurity(initialValue);
      }

      return (
        <Form.Item
          name={controlName}
          label={controlLabel}
          rules={rules}
          initialValue={initialValue}
          required={required}
        >
          <Input
            type={inputType}
            disabled={!isEditingFolder}
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
      const getDateFields = fields.filter((i) => i.typeId === field.typeId);
      const dateData = folderDetail.filter((i) =>
        getDateFields.map((item) => item.fieldId).includes(i.fieldId),
      );
      const initialValue =
        dateData.find((i) => i.fieldId === field.fieldId).description === ''
          ? null
          : dayjs(
              dateData.find((i) => i.fieldId === field.fieldId).description,
              DATE_FORMAT[field.formatId],
            );
      const hasDateStamp = field.flags.some((flag) => flag.flagId === FIELD_FLAG.DATE_STAMP);
      const dynamicProps = hasDateStamp
        ? { initialValue: dateData ? initialValue : currentDate }
        : {};
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
        <Form.Item
          name={controlName}
          label={controlLabel}
          rules={rules}
          initialValue={initialValue}
          required={required}
          {...dynamicProps}
        >
          <DatePicker
            format={format}
            disabled
            style={{ width: '100%' }}
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

      const getListFields = fields.filter((i) => i.typeId === field.typeId);
      const listData = folderDetail.filter((i) =>
        getListFields.map((item) => item.fieldId).includes(i.fieldId),
      );
      const initialValue = listData.filter((i) => i.fieldId === field.fieldId)[0].description;

      return (
        <Form.Item
          key={field.fieldId}
          name={controlName}
          label={controlLabel}
          rules={rules}
          required={required}
          initialValue={initialValue}
        >
          <Select
            options={options}
            disabled={!isEditingFolder}
            onChange={(value) => {
              handleOnBlurInput(value, field.fieldId, isKeyRef, isAutoIndex);
            }}
          />
        </Form.Item>
      );
    }
    return null;
  };

  const onClickEditBtn = () => {
    if (!isEditingFolder) {
      setIsEditingFolder(true);
    } else {
      form
        .validateFields()
        .then(() => {
          let dataSubmit = [];
          const data = form.getFieldsValue();
          Object.keys(data).forEach((i) => {
            const field = fields.find((item) => item.fieldId === +i);
            let description = _.trim(data[i]);
            if (data[i]) {
              description = data[i];
            }
            if (field && field.typeId === FIELD_TYPE.NUMBER) {
              const { width } = field;
              const num = formatNumber(data[i], DECIMAL_NUMBER[field.formatId]);
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
            if (field && field.typeId === FIELD_TYPE.DATE) {
              description =
                data[i] === null
                  ? ''
                  : data[i].format(
                      DATE_FORMAT[fields.find((field) => `${field.fieldId}` === i).formatId],
                    );
            }
            if (field && field.typeId === FIELD_TYPE.PHONE_NUMBER) {
              description = formatPhoneNumber(
                data[i],
                fields.find((field) => `${field.fieldId}` === i).formatId,
              );
            }
            if (field && field.typeId === FIELD_TYPE.SOCIAL_SECURITY && field.formatId === 8) {
              description = formatSocialSecurity(data[i]);
            }
            dataSubmit = [
              ...dataSubmit,
              {
                id: folderDetail.filter((item) => item.fieldId === parseInt(i))[0].ff_id,
                field_id: parseInt(i),
                description: description.trim().length === 0 ? '' : description,
              },
            ];
          });
          dispatch(updateFolder({ folderId, fields: dataSubmit })).then(() => {
            dispatch(getFolders({ drawer_id: currentDrawer.id }));
            // Remove Auto Index Data
            if (justLoadedAutoKey) {
              dispatch(removeAutoIndex({ id: justLoadedAutoKey }))
                .then(() => {
                  setJustLoadedAutoKey(null);
                })
                .catch((error) => console.log(error));
            }
            setIsEditingFolder(false);
          });
        })
        .catch(() => {
          setIsEditingFolder(true);
        });
    }
  };

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <div className={styles.title}>
          {currentLocation === 'files' ? (
            <>
              <FileListIcon width={32} height={32} fill="" />
              {`Files ${files.findIndex((i) => i?.id === currentFile?.id) + 1} of ${files.length}`}
            </>
          ) : (
            <div className={styles.header_panel}>
              <div className={styles.title_panel}>
                <IndexFieldIcon width={24} height={24} fill="" />
                <p>Index Fields</p>
              </div>
              {drawerPermissions &&
              drawerPermissions
                .map((i) => i.code)
                .includes(DRAWER_PERMISSION.MODIFY_INDEX_FIELD) ? (
                <Button onClick={onClickEditBtn}>{isEditingFolder ? 'Save' : 'Edit'}</Button>
              ) : (
                ''
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => {
            navigate('/folder-management/folder-details');
            setIsEditingFolder(false);
          }}
        >
          <CloseOutlined />
        </Button>
      </div>
    );
  };

  return (
    <div className={styles.file_detail_sec}>
      {renderHeader()}
      <div className={styles.folder_info}>
        {currentLocation === 'files' ? (
          <FileList />
        ) : (
          <Spin spinning={loading || localLoading}>
            <div className={styles.folder_body}>
              {folderDetail.length !== 0 && (
                <Form layout="vertical" form={form} key={currentLocation}>
                  {fields.map((item) => renderInput(item))}
                </Form>
              )}
            </div>
          </Spin>
        )}
      </div>
    </div>
  );
};

export default memo(FileDetail);
