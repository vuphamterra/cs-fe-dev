import { FC } from 'react';
import _ from 'lodash';
import { Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styles from './ReviewKeyDataRefImport.module.scss';

interface DataType {
  id: string;
  name: string;
  valid: boolean;
  messages: string[];
}

type Props = {
  importedData: any[];
};

const ReviewKeyDataRefImport: FC<Props> = ({ importedData = [] }) => {
  const getColumns: () => ColumnsType<DataType> = () => {
    if (!_.isArray(importedData) || _.isEmpty(importedData)) {
      return [];
    }
    const { fields = [] } = importedData[0] || {};
    if (!_.isArray(fields) || _.isEmpty(fields)) {
      return [];
    }
    const columns = fields.map((f) => {
      const subtitle = f.isKeyRef ? '| Key Reference' : '';
      return {
        dataIndex: getFieldProperty(f.name),
        title: `${_.trim(f.name)} ${subtitle}`,
      };
    });
    return columns;
  };

  const getDataSource = () => {
    if (!_.isArray(importedData) || _.isEmpty(importedData)) {
      return [];
    }
    const dataSource = importedData
      .filter((item) => item.rowIdx > 0)
      .map((item) => {
        const obj = {
          id: item.id,
          valid: item.valid,
          messages: item.messages,
        };
        item.fields.forEach((f, idx) => {
          obj[f.name] = item.cellValues[idx];
        });
        return obj;
      });
    return dataSource;
  };

  const getFieldProperty = (fieldName: string) => {
    return _.trim(fieldName);
  };

  const validRecordCount = importedData.filter((item, idx) => idx > 0 && item.valid).length;
  const invalidRecordCount = importedData.filter((item, idx) => idx > 0 && !item.valid).length;

  return (
    <div className={styles.container}>
      <div className={styles.record_count}>
        {validRecordCount} valid row(s), {invalidRecordCount} invalid row(s)
      </div>
      <Table
        className="table_folder"
        columns={getColumns()}
        dataSource={getDataSource()}
        pagination={{ pageSize: 5 }}
        bordered
        rowClassName={(record) => {
          const { valid } = record;
          return !valid ? styles.rowInvalid : '';
        }}
        scroll={{ x: 'max-content' }}
        components={{
          body: {
            row: (props) => {
              const { children } = props;
              if (!_.isArray(children)) {
                return <tr {...props} />;
              }
              const { props: { record = {} } = {} } = children[0] || {};
              if (record.valid) {
                return <tr {...props} />;
              }
              const msg = (
                <ul>
                  {record.messages.map((msg: string, idx: number) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              );
              return (
                <Tooltip overlayClassName="invalid_tooltip" title={msg}>
                  <tr {...props} />
                </Tooltip>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default ReviewKeyDataRefImport;
