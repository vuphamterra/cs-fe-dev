import { FC, useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Button } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { X, TrashBin } from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { clearMessage, removeDatabase } from '~/store/DatabaseSlice';
import styles from './RemoveDBModal.module.scss';
import notification from '~/utils/notification';

interface Props {
  dbId: number;
  isOpening: boolean;
  ok?: () => void;
  cancel?: () => void;
}

const RemoveDBModal: FC<Props> = ({ isOpening, ok, cancel, dbId }) => {
  const appDispatch = useAppDispatch();
  const { deleting: deletingDb, message, databases } = useAppSelector((state) => state.db);
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);

  const onOk = () => {
    form
      .validateFields()
      .then((values) => {
        const { password } = values;
        const removingDb = databases.find((db) => db.id === dbId);
        if (removingDb) {
          appDispatch(removeDatabase({ password, db: removingDb }));
        }
      })
      .catch(() => {});
  };
  const onCancel = () => {
    form.resetFields();
    setPassword('');
    cancel();
  };

  useEffect(() => {
    if (message) {
      if (message.type === 'success') {
        onCancel();
      }
      notification[message.type](message);
      appDispatch(clearMessage());
    }
  }, [message]);

  const renderModalTitle = () => {
    return (
      <Row className={styles.modal_header}>
        <Col className={styles.icon_box}>
          <TrashBin width={16} height={20} fill="" />
        </Col>
        <Col>
          <Col className={styles.modal_title}>Remove Database</Col>
          <Col className={styles.modal_desc}>
            Please enter your password to complete this action
          </Col>
        </Col>
      </Row>
    );
  };

  const renderModalFooter = () => {
    return (
      <div className={styles.modal_footer}>
        <Button className={styles.cancel_button} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className={`btn_primary ${styles.confirm_btn}`}
          onClick={onOk}
          disabled={deletingDb}
          loading={deletingDb}
        >
          Confirm Remove
        </Button>
      </div>
    );
  };

  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      closeIcon={<X width={16} height={16} fill="" className={styles.x_icon} />}
      onOk={ok}
      onCancel={onCancel}
      open={isOpening}
      title={renderModalTitle()}
      maskClosable
      destroyOnClose
      centered
      footer={renderModalFooter()}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name={['password']}
          label="Password"
          className={styles.form_item}
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input
            className={styles.input}
            type={pwVisible ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={deletingDb}
            suffix={
              <span className={styles.showPwIcon} onClick={() => setPwVisible(!pwVisible)}>
                {!pwVisible && <EyeInvisibleOutlined />}
                {pwVisible && <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RemoveDBModal;
