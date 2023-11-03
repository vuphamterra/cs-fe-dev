/* eslint-disable indent */
import { useEffect, useState, FC } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import {
  getAutoIndexData,
  getKeyDataReferenceData,
  setCreateFolderAutoIndex,
} from '~/store/DrawerSlice';
import { FIELD_FLAG } from '~/constants';
import styles from './KeyDataRef.module.scss';
import { hasAutoIndex, hasKeyReference } from '../../utils';

type Props = {
  reload: boolean;
  dataCheck: (flag: boolean) => void;
};

const KeyDataRef: FC<Props> = ({ reload, dataCheck }) => {
  const dispatch = useAppDispatch();
  const { currentDrawer, createFolderAutoIndex } = useAppSelector((store) => store.draw);
  const [columns, setColumns] = useState<ColumnsType<any>>([]);
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    loadData();
  }, [createFolderAutoIndex]);

  useEffect(() => {
    if (reload) {
      loadData();
    }
  }, [reload, currentDrawer]);

  const loadData = () => {
    if (_.isEmpty(currentDrawer)) {
      return;
    }
    const { fields: currentDrawerFields = [] } = currentDrawer || {};
    const api = hasKeyReference(currentDrawerFields)
      ? getKeyDataReferenceData
      : hasAutoIndex(currentDrawerFields)
      ? getAutoIndexData
      : null;
    if (!api) {
      return;
    }
    dispatch(api({ id: currentDrawer.id }))
      .then((res) => {
        const {
          payload: { statusCode = '' },
        } = res || {};
        if (statusCode === 200) {
          if (createFolderAutoIndex) {
            dispatch(setCreateFolderAutoIndex(false));
          }
          const { payload: { payload = {} } = {} } = res;
          const { data, fields } = payload;
          let columns = [];
          let ds = [];
          if (hasKeyReference(currentDrawerFields)) {
            columns = getColumnsKeyDataRef(fields);
            ds = getDataSourceKeyDataRef(data, fields);
          } else if (hasAutoIndex(currentDrawerFields)) {
            columns = getColumnsAutoIndex(fields);
            ds = getDataSourceAutoIndex(data, fields);
          }
          setColumns(columns);
          setDataSource(ds);
          dataCheck(!!ds.length);
        }
      })
      .catch(() => {
        if (createFolderAutoIndex) {
          dispatch(setCreateFolderAutoIndex(false));
        }
      });
  };

  const getColumnsKeyDataRef = (fields = []) => {
    return fields
      .map((field) => {
        const isKeyRef = field.flagId === FIELD_FLAG.KEY_REFERENCE ? 1 : 0;
        return {
          dataIndex: _.replace(_.trim(field.name), ' ', '_'),
          title: isKeyRef ? `${_.trim(field.name)} | Key Reference` : _.trim(field.name),
          isKeyRef,
        };
      })
      .sort((a, b) => b.isKeyRef - a.isKeyRef);
  };

  const getDataSourceKeyDataRef = (data = [], fields = []) => {
    return data.reduce((accumulator, currentItem) => {
      const rowData = currentItem.reduce((accumulator2, currentItem2) => {
        const { id, fieldId, name } = currentItem2;
        if (id) {
          accumulator2.id = id;
        }
        const field = fields.find((f) => f.fieldId === fieldId);
        if (field) {
          accumulator2[_.replace(_.trim(field.name), ' ', '_')] = name;
        }
        return accumulator2;
      }, {});
      accumulator.push(rowData);
      return accumulator;
    }, []);
  };

  const getColumnsAutoIndex = (fields = []) => {
    return fields.map((field) => {
      return {
        dataIndex: _.trim(field.name),
        title: _.trim(field.name),
        fieldId: field.fieldId || null,
      };
    });
  };

  const getDataSourceAutoIndex = (data = [], fields = []) => {
    const dataGroupByAutoKey = data.reduce((accumulator, currentItem) => {
      if (accumulator[currentItem.auto_key]) {
        accumulator[currentItem.auto_key].push({ ...currentItem });
      } else {
        accumulator[currentItem.auto_key] = [{ ...currentItem }];
      }
      return accumulator;
    }, {});
    const ds = [];
    Object.keys(dataGroupByAutoKey).forEach((autoKey) => {
      const rowData = { aKId: +autoKey };
      dataGroupByAutoKey[autoKey].forEach((item) => {
        const field = fields.find((f) => f.fieldId === item.field_id);
        if (field) {
          rowData[field.name] = item.name || '';
        }
      });
      ds.push(rowData);
    });
    console.log('___OOO___', ds, columns);
    return ds;
  };

  return (
    <div className={styles.container}>
      <Table
        rowKey="aKId"
        className="table_folder"
        columns={columns}
        dataSource={dataSource}
        bordered
      />
    </div>
  );
};

export default KeyDataRef;
