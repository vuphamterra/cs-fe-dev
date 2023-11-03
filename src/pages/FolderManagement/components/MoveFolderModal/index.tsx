import { useEffect, useState, createElement } from 'react';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Modal, Switch, Select, Row, Col, Input, Button, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { Folder as FolderIcon } from '~/components/Icons';
import { getDrawerById } from '~/store/DrawerSlice';
import { FIELD_UI } from '../../interfaces';
import {
  DATE_FORMAT,
  DECIMAL_NUMBER,
  FIELD_FLAG,
  FIELD_TYPE,
  FIELD_TYPE_CODE,
  REGEX,
} from '~/constants';
import { validate } from './validator';
import {
  checkFieldValueUniqueness,
  getFolders,
  moveFolder,
  updateFoldersToMove,
  updateSelectedFolders,
} from '~/store/FolderSlice';
import notification from '~/utils/notification';
import {
  formatNumber,
  formatPhoneNumber,
  formatSocialSecurity,
  getOriginalPhoneNumber,
  getOriginalSSN,
} from '~/utils';
import styles from './styles.module.scss';

export interface FIELD_MAPPING {
  destinationField: {
    id: number;
    name: string;
    width: number;
    format_id: number;
    type: { type_name: string; format: string; type_code: string };
    flags: { id: number; name: string }[];
    lists: { id: number; name: string; field_id: number; order_no: number }[];
  };
  sourceFields: FIELD_UI[];
  selectedSourceField: FIELD_UI;
  errorMessage?: string;
}

interface ModalProp {
  open: boolean;
  setOpen: (value: boolean) => void;
  folderFromFilePage?: number;
}

const MoveFolderModal = (props: ModalProp) => {
  const { open, setOpen, folderFromFilePage } = props;
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { drawers, currentDrawer, loading: drawerLoading } = useAppSelector((store) => store.draw);
  const {
    fields,
    loading: folderLoading,
    foldersToMove,
    selectedFolders,
  } = useAppSelector((store) => store.folder);
  const [availableDrawers, setAvailableDrawers] = useState([]);
  const [fieldsOfSelectedDrawer, setFieldOfSelectedDrawer] = useState([]);
  const [mappingFields, setMappingFields] = useState<FIELD_MAPPING[]>([]);
  const [selectedDrawer, setSelectedDrawer] = useState(null);
  const [isDeletingSource, setDeletingSource] = useState<boolean>(false);
  const modalLoading = drawerLoading || folderLoading;

  useEffect(() => {
    if (currentDrawer) {
      const availableDrawers = drawers.filter((drawer) => drawer.id !== currentDrawer.id);
      if (availableDrawers.length) {
        setAvailableDrawers(availableDrawers);
        setSelectedDrawer(availableDrawers[0]);
        loadDrawer(availableDrawers[0].id);
      }
    }
  }, [currentDrawer]);

  useEffect(() => {
    if (selectedDrawer) {
      loadDrawer(selectedDrawer.id);
    }
  }, [selectedDrawer]);

  useEffect(() => {
    if (fields.length && fieldsOfSelectedDrawer.length) {
      const mappingFields: FIELD_MAPPING[] = fieldsOfSelectedDrawer.map((item) => {
        const fieldNone: FIELD_UI = {
          fieldId: -1,
          typeName: 'None',
          flags: [],
          formatId: -1,
          typeId: -1,
          lists: [],
          width: 0,
          name: '-- None --',
          formatName: '',
        };

        const addWidthPhoneNumber = fields.map((val: any) => {
          const lenghtNumber = getOriginalSSN(val.formatName).length;
          return val.typeName === 'Phone Number' ? { ...val, width: lenghtNumber } : val;
        });

        const sourceFields = [fieldNone, ...addWidthPhoneNumber];
        const mappedField: FIELD_MAPPING = {
          destinationField: _.cloneDeep(item),
          sourceFields,
          selectedSourceField: sourceFields[0],
        };
        return mappedField;
      });
      setMappingFields(mappingFields);
    }
  }, [fieldsOfSelectedDrawer]);

  const handleDrawerChange = (e) => {
    const drawer = availableDrawers.find((item) => item.id === e);
    if (drawer) {
      setSelectedDrawer(drawer);
    }
    loadDrawer(e);
  };

  const hanldeChangeSelectedSourceField = (value, obj) => {
    const destinationFieldIdx = mappingFields.findIndex(
      (item) => item.destinationField.id === obj.destinationField.id,
    );
    if (destinationFieldIdx < 0) {
      return;
    }
    const sourceField = mappingFields[destinationFieldIdx].sourceFields.find(
      (item) => item.fieldId === value,
    );
    if (!sourceField) {
      return;
    }
    mappingFields[destinationFieldIdx].selectedSourceField = sourceField;
    validate(mappingFields);
    setMappingFields(_.cloneDeep(mappingFields));
  };

  const handleSwitch = (e) => {
    setDeletingSource(e);
  };

  const handleModalCancel = () => {
    resetData();
    setOpen(false);
  };

  const resetData = () => {
    dispatch(updateFoldersToMove([]));
    setSelectedDrawer(availableDrawers[0]);
    setFieldOfSelectedDrawer([...fieldsOfSelectedDrawer]);
    setDeletingSource(false);
  };

  const handleMoveFolder = () => {
    const isValid = validate(mappingFields);
    setMappingFields(_.cloneDeep(mappingFields));
    if (!isValid) {
      return;
    }

    const folders = foldersToMove.map((item) => {
      const fields = mappingFields
        .filter((ele) => ele.selectedSourceField.fieldId !== -1)
        .map((ele) => {
          let destinationValue = item[ele.selectedSourceField.name] || '';
          const {
            destinationField: { type, format_id: formatId, width },
          } = ele;
          if (item[ele.selectedSourceField.name] && type.type_code === FIELD_TYPE_CODE.TEXT) {
            if (item[ele.selectedSourceField.name].length > width) {
              destinationValue = item[ele.selectedSourceField.name].substring(0, width);
            }
          }
          if (item[ele.selectedSourceField.name] && type.type_code === FIELD_TYPE_CODE.NUMBER) {
            let sourceValue = item[ele.selectedSourceField.name];
            if (ele.selectedSourceField.typeName === 'Phone Number') {
              sourceValue = item[ele.selectedSourceField.name].replaceAll(
                REGEX.PHONE_NUMBER_SPECIAL_CHARACTER,
                '',
              );
              const { width, format_id: formatId } = ele.destinationField;
              const num = formatNumber(sourceValue, DECIMAL_NUMBER[formatId]);
              const numSizeDiff = num.length - (width + 1);
              if (numSizeDiff > 0) {
                const updatedNum = num.substring(0, num.length - numSizeDiff);
                if (updatedNum[updatedNum.length - 1] === '.') {
                  sourceValue = parseFloat(updatedNum).toString();
                } else {
                  sourceValue = updatedNum;
                }
              } else {
                sourceValue = num;
              }
            }
            destinationValue = sourceValue;
          }
          if (
            item[ele.selectedSourceField.name] &&
            type.type_code === FIELD_TYPE_CODE.PHONE_NUMBER
          ) {
            let sourceValue = item[ele.selectedSourceField.name].replace(/\D/g, '');
            const widthOfPhoneNumber = getOriginalPhoneNumber(
              ele.destinationField.type.format,
            ).length;
            if (sourceValue.length < widthOfPhoneNumber) {
              let str = '';
              for (let i = 1; i <= widthOfPhoneNumber - sourceValue.length; i++) {
                str += '0';
              }
              sourceValue = str + sourceValue;
            }
            destinationValue = formatPhoneNumber(sourceValue, formatId);
          }
          if (item[ele.selectedSourceField.name] && type.type_code === FIELD_TYPE_CODE.LIST) {
            destinationValue = '';
            let sourceValue = item[ele.selectedSourceField.name];
            if (ele.selectedSourceField.typeId === FIELD_TYPE.SOCIAL_SECURITY) {
              sourceValue = formatSocialSecurity(item[ele.selectedSourceField.name]);
            }
            const idx = ele.destinationField.lists.findIndex(
              (option) => _.toLower(sourceValue) === _.toLower(option.name),
            );
            if (idx > -1) {
              destinationValue = ele.destinationField.lists[idx].name;
            } else {
              const isRequired =
                ele.destinationField.flags.findIndex((flag) => flag.id === FIELD_FLAG.REQUIRED) >
                -1;
              if (isRequired) {
                destinationValue = ele.destinationField.lists[0].name;
              }
            }
          }
          if (item[ele.selectedSourceField.name] && type.type_code === FIELD_TYPE_CODE.DATE) {
            destinationValue = dayjs(
              item[ele.selectedSourceField.name],
              DATE_FORMAT[ele.selectedSourceField.formatId],
            ).format(DATE_FORMAT[formatId]);
          }
          if (
            item[ele.selectedSourceField.name] &&
            type.type_code === FIELD_TYPE_CODE.SOCIAL_SECURITY
          ) {
            let sourceValue = item[ele.selectedSourceField.name].replace(/\D/g, '');
            const widthOfSSN = getOriginalSSN(ele.destinationField.type.format).length;
            if (sourceValue.length < widthOfSSN) {
              let str = '';
              for (let i = 1; i <= widthOfSSN - sourceValue.length; i++) {
                str += '0';
              }
              sourceValue = str + sourceValue;
            }
            destinationValue = formatId === 8 ? formatSocialSecurity(sourceValue) : sourceValue;
          }
          const field = {
            id: ele.destinationField.id,
            description: destinationValue,
            isUnique:
              ele.destinationField.flags.findIndex((flag) => flag.id === FIELD_FLAG.UNIQUE_KEY) >
              -1,
          };
          return field;
        });
      const folderToMove = {
        id: item.csId,
        fields,
      };
      return folderToMove;
    });
    const dataToCheckUniquess = folders.reduce(
      (accumulator: { id: number; description: string[] }[], currentItem) => {
        currentItem.fields.forEach((f) => {
          const addedField = accumulator.find((a) => a.id === f.id);
          if (f.isUnique) {
            if (!addedField) {
              accumulator.push({ id: f.id, description: [f.description] });
            } else {
              addedField.description.push(f.description);
            }
          }
        });
        return accumulator;
      },
      [],
    );
    const payloadToCheckValueUniqueness = {
      drawer_id: selectedDrawer.id,
      fields: dataToCheckUniquess,
    };
    dispatch(checkFieldValueUniqueness(payloadToCheckValueUniqueness))
      .then((res) => {
        const { payload: { statusCode = '', payload: { data = [] } = {} } = {} } = res || {};
        if (statusCode === 200) {
          const validFolders = [];
          const invalidFolders = [];
          folders.forEach((folder) => {
            const idx = folder.fields.findIndex(
              (f) =>
                data.findIndex((d) => d.field_id === f.id && d.description === f.description) > -1,
            );
            if (idx === -1) {
              validFolders.push(folder);
            } else {
              invalidFolders.push(folder);
            }
          });
          if (invalidFolders.length) {
            let description =
              'There was a folder cannot be moved because of violating the uniqueness of some fields of the destination folders';
            if (invalidFolders.length > 1) {
              description = `There were ${invalidFolders.length} folders cannot be moved because of violating the uniqueness of some fields of the destination folders`;
            }
            notification.warning({ message: 'Warning', description });
          }
          if (!validFolders.length) {
            return;
          }
          const payload = {
            drawer_new_id: selectedDrawer.id,
            drawer_old_id: currentDrawer.id,
            isDeletingSource,
            folders: validFolders,
          };
          dispatch(moveFolder(payload)).then((res) => {
            const {
              payload: { statusCode },
            } = res;
            if (statusCode && statusCode === 200) {
              notification.success({
                message: 'Folder moved successfully',
                description: createElement('span', {}, [
                  'The selected folder has been successfully moved to drawer ',
                  createElement('b', { key: uuidv4() }, selectedDrawer.name),
                ]),
              });
              if (pathname === '/folder-management') {
                dispatch(getFolders({ drawer_id: currentDrawer.id }));
              }
              if (isDeletingSource && folderFromFilePage) {
                dispatch(
                  updateSelectedFolders(
                    selectedFolders.filter((s) => `${s}` !== `${folderFromFilePage}`),
                  ),
                );
              }
              handleModalCancel();
            }
          });
        }
      })
      .catch((error) => console.log(error));
  };

  const loadDrawer = (id: number) => {
    dispatch(getDrawerById({ id })).then((res) => {
      const {
        payload: { statusCode, payload: drawer },
      } = res;
      if (statusCode === 200) {
        const { fields } = drawer;
        setFieldOfSelectedDrawer(fields);
      }
    });
  };

  const modalTitle = (
    <div className={styles.modal_header}>
      <div className={styles.modal_icon}>
        <FolderIcon width={20} height={20} fill="" />
      </div>
      <div>
        <p className={styles.title}>Move Folder</p>
        <p className={styles.sub_title}>Move folder to another drawer</p>
      </div>
    </div>
  );

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={handleModalCancel} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button disabled={modalLoading} className={styles.move_btn} onClick={handleMoveFolder}>
        Move Folder
      </Button>
    </div>
  );

  const renderErrorMessage = (data) => {
    if (!data.errorMessage) {
      return null;
    }
    return <Row className={styles.error_message}>{data.errorMessage}</Row>;
  };

  const renderMappingFields = () => {
    return mappingFields.map((item) => {
      const required =
        item.destinationField.flags.findIndex((flag) => flag.id === FIELD_FLAG.REQUIRED) > -1;
      return (
        <Row key={item.destinationField.id} className={styles.mapping_row}>
          <Row className={`${styles.move_item} ${item.errorMessage ? styles.has_error : ''}`}>
            <Col span={6} className={styles.source_field}>
              <Select
                options={item.sourceFields.map((f) => ({
                  value: f.fieldId,
                  label: f.name,
                }))}
                defaultValue={item.sourceFields.length ? item.sourceFields[0].fieldId : null}
                className={styles.select_des_field}
                size="large"
                onChange={(value) => hanldeChangeSelectedSourceField(value, item)}
              />
            </Col>
            <Col span={5} className={styles.field_label}>
              <span>{item.selectedSourceField.typeName}</span>
              <span className="px-1">|</span>
              <span>
                Width: {item.selectedSourceField.width > 0 ? item.selectedSourceField.width : '--'}
              </span>
            </Col>
            <Col span={2} className={styles.icon_arrow}>
              <ArrowRightOutlined />
            </Col>
            <Col span={6} className={styles.destination_field}>
              <span className={styles.asterisk}>{required ? '*' : ''}</span>
              <Input readOnly defaultValue={item.destinationField.name} size="large" />
            </Col>
            <Col span={5} className={styles.field_label}>
              <span>{item.destinationField.type.type_name}</span>
              <span className="px-1">|</span>
              <span>
                Width:{' '}
                {item.destinationField.width && item.destinationField.width > 0
                  ? item.destinationField.width
                  : '--'}
              </span>
            </Col>
          </Row>
          {renderErrorMessage(item)}
        </Row>
      );
    });
  };

  return (
    <Modal
      className={styles.move_folder_modal}
      title={modalTitle}
      open={open}
      onCancel={handleModalCancel}
      centered
      footer={modalActions}
      width={980}
      destroyOnClose
    >
      <div className={styles.modal_body}>
        {modalLoading && (
          <div className={styles.modal_loading}>
            <Spin />
          </div>
        )}
        <div className={styles.select_drawer}>
          <p>Move to</p>
          <Select
            className={styles.select_antd}
            options={availableDrawers.map((drawer) => ({ label: drawer.name, value: drawer.id }))}
            size="large"
            defaultValue={selectedDrawer ? selectedDrawer.id : null}
            onChange={handleDrawerChange}
          />
        </div>
        <div className={styles.field_mapping}>
          <p className={styles.titleField}>
            Field Mapping <span>{foldersToMove.length} folder(s) selected</span>
          </p>
          <Row className={styles.wrap_fields}>
            <Row style={{ width: '100%' }}>
              <Col span={11}>
                <p>Source Field</p>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>
                <p>Destination Field</p>
              </Col>
            </Row>
            {renderMappingFields()}
          </Row>
        </div>
        <div className={styles.remove_source}>
          <Switch checked={isDeletingSource} onChange={handleSwitch} />
          <p>Delete Source Document</p>
        </div>
      </div>
    </Modal>
  );
};
export default MoveFolderModal;
