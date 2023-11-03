import React from 'react';
import { Table, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.scss';
import auditTrailSetting from '~/assets/images/audit_trail_setting.png';

interface AuditModalProps {
  open: boolean;
  setOpen: (value: any) => void;
}

interface DataType {
  key: React.Key;
  name: string;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Category',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Action Description',
    dataIndex: 'address',
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'Folder',
    address: 'Index Add/Edit',
  },
  {
    key: '2',
    name: 'Folder',
    address: 'Add',
  },
  {
    key: '3',
    name: 'Folder',
    address: 'Delete',
  },
  {
    key: '4',
    name: 'Page',
    address: 'Export',
  },
  {
    key: '5',
    name: 'Page',
    address: 'Add',
  },
  {
    key: '6',
    name: 'Page',
    address: 'Delete',
  },
  {
    key: '7',
    name: 'Page',
    address: 'View/Print/Export/Email',
  },
];

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: (record: DataType) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

const AuditModal = (props: AuditModalProps) => {
  const { open, setOpen } = props;

  const modalTitle = (
    <div className={styles.modal_title}>
      <img src={auditTrailSetting} />
      <p>Audit Trail Settings</p>
    </div>
  );
  const modalActions = (
    <div className={styles.buttons_container}>
      <Button onClick={() => setOpen(false)} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button onClick={() => setOpen(false)} className={styles.apply_btn}>
        Apply
      </Button>
    </div>
  );

  return (
    <Modal
      className={`${styles.audit_modal} audit_trail_setting audit_trail_close_btn audit_trail_modal`}
      title={modalTitle}
      open={open}
      onCancel={() => setOpen(false)}
      footer={modalActions}
      centered
    >
      <Table
        className={styles.modal_body}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    </Modal>
  );
};
export default AuditModal;
