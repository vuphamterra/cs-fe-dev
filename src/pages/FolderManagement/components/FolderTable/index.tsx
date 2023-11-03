import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import _, { truncate } from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';

import { useAppSelector } from '~/store/hooks';
import { FOLDER_MODEL_EXTENDED } from '../../interfaces';
import styles from './FolderList.module.scss';

interface Props {
  setFolders: any;
  exceptFolderId: number
}

const FolderList: React.FC<Props> = (props) => {
  const {
    setFolders,
    exceptFolderId
  } = props;
  const {
    loading: loadingDrawer,
  } = useAppSelector((store) => store.draw);

  const {
    folders,
    fields,
    loading: loadingFolders,
  } = useAppSelector((store) => store.folder);

  const folderList = [];
  // eslint-disable-next-line array-callback-return
  folders.map((item) => {
    if (item.csId !== exceptFolderId) folderList.push(item);
  });

  const [selectedFolders, setSelectedFolders] = useState([]);

  const getColumns = (): ColumnsType<FOLDER_MODEL_EXTENDED> => {
    let limitLength = 80;
    if (fields.length > 7) {
      limitLength = 30;
    } else if (fields.length > 3) {
      limitLength = 40;
    }
    const columns: ColumnsType<FOLDER_MODEL_EXTENDED> = [
      ...fields.map((item) => ({
        dataIndex: item.name,
        title: item.name,
        render(value) {
          if (!value || _.trim(value).length === 0) {
            return '-';
          }
          return truncate(value, { length: limitLength });
        },
      })),
      {
        title: 'Last modified',
        dataIndex: 'updated_at',
        fixed: 'right',
        width: 150,
        render: (value) => {
          if (!value) {
            return '-';
          }
          return moment(value).format('HH:mm DD MMM YYYY');
        },
      },
      {
        title: 'Files',
        fixed: 'right',
        dataIndex: 'fileCount',
        width: 80,
        align: 'center',
      },
    ];
    return columns;
  };

  return (
    <>
      <Table
        className={`${styles.folder_table} table_folder`}
        columns={getColumns()}
        dataSource={folderList}
        scroll={{ x: 1000, y: 295 }}
        sticky
        loading={loadingDrawer || loadingFolders}
        rowKey="csId"
        rowSelection={{
          selectedRowKeys: selectedFolders,
          onChange: (selectedRowKeys) => {
            setFolders(selectedRowKeys);
            setSelectedFolders(selectedRowKeys);
          },
        }}
      />
    </>
  );
};

export default FolderList;
