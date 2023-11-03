import React, { useEffect, useReducer, useRef } from 'react';
import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { X as ClosedIcon, Lock } from '~/components/Icons';
import { changePasswordUser } from '~/store/UserSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import styles from './ChangePasswordModal.module.scss';

interface Props {
  visible: boolean;
  onCancel: (visible: boolean) => void;
  onOk: () => void;
}

interface STATE {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPw: boolean;
  showNewPw: boolean;
  showConPw: boolean;
  visible: boolean;
}

interface ACTION {
  type: string;
  payload: any;
}

const initialState: STATE = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrentPw: false,
  showNewPw: false,
  showConPw: false,
  visible: false,
};

const UPDATE_VISIBILITY = 'UPDATE_VISIBILITY';
const SHOW_CURRENT_PW = 'SHOW_CURRENT_PW';
const SHOW_NEW_PW = 'SHOW_NEW_PW';
const SHOW_CONFIRM_PW = 'SHOW_CONFIRM_PW';
const CURRENT_PW_CHANGE = 'CURRENT_PW_CHANGE';
const NEW_PW_CHANGE = 'NEW_PW_CHANGE';
const CONFIRM_PW_CHANGE = 'CONFIRM_PW_CHANGE';

const reducer = (state: STATE, action: ACTION) => {
  if (action.type === UPDATE_VISIBILITY) {
    return {
      ...state,
      visible: action.payload,
    };
  }
  if (action.type === SHOW_CURRENT_PW) {
    return {
      ...state,
      showCurrentPw: action.payload,
    };
  }
  if (action.type === SHOW_NEW_PW) {
    return {
      ...state,
      showNewPw: action.payload,
    };
  }
  if (action.type === SHOW_CONFIRM_PW) {
    return {
      ...state,
      showConPw: action.payload,
    };
  }
  if (action.type === CURRENT_PW_CHANGE) {
    return {
      ...state,
      currentPassword: action.payload,
    };
  }
  if (action.type === NEW_PW_CHANGE) {
    return {
      ...state,
      newPassword: action.payload,
    };
  }
  if (action.type === CONFIRM_PW_CHANGE) {
    return {
      ...state,
      confirmPassword: action.payload,
    };
  }
  return state;
};

const ChangePasswordModal: React.FC<Props> = (props) => {
  const [form] = Form.useForm();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showCurrentPw, showNewPw, visible, currentPassword, newPassword, showConPw } = state;
  const userId = useAppSelector((s) => s.auth.user.id);
  const dispatchAction = useAppDispatch();
  const currentPwInputRef = useRef(null);

  const handleConfirm = () => {
    form
      .validateFields()
      .then(() => {
        const submitData = {
          id: userId,
          currentPassword: currentPassword as string,
          newPassword: newPassword as string,
        };
        dispatchAction(changePasswordUser(submitData)).then((res) => {
          const { error }: any = res;
          if (!error) {
            handleCancel();
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCancel = () => {
    dispatch({ type: UPDATE_VISIBILITY, payload: !visible });
    props.onCancel(!visible);
    form.resetFields();
  };

  const handleShowCurrentPassword = () => {
    dispatch({ type: SHOW_CURRENT_PW, payload: !showCurrentPw });
  };

  const handleShowNewPassword = () => {
    dispatch({ type: SHOW_NEW_PW, payload: !showNewPw });
  };

  const handleShowConfirmNewPassword = () => {
    dispatch({ type: SHOW_CONFIRM_PW, payload: !showConPw });
  };

  useEffect(() => {
    dispatch({ type: UPDATE_VISIBILITY, payload: props.visible });
  }, [props.visible]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (currentPwInputRef && currentPwInputRef.current) {
          currentPwInputRef.current.focus();
        }
      }, 0);
    }
  }, [visible]);

  const renderModalFooter = () => {
    return (
      <div className={styles.modal_footer}>
        <Button className={styles.cancel_button} onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="btn_primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    );
  };

  const renderModalTitle = () => {
    return (
      <Row className={styles.modal_header}>
        <Col className={styles.icon_box}>
          <Lock width={16} height={20} fill="" />
        </Col>
        <Col>
          <Col className={styles.modal_title}>Change Password</Col>
          <Col className={styles.modal_desc}>
            Re-enter your authentication to change to new password.
          </Col>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      bodyStyle={{ padding: '24px 0' }}
      closeIcon={<ClosedIcon width={16} height={16} fill="" className={styles.closed_icon} />}
      // onOk={handleConfirm}
      onCancel={handleCancel}
      open={visible}
      title={renderModalTitle()}
      maskClosable
      destroyOnClose
      centered
      footer={renderModalFooter()}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name={['current', 'password']}
          label="Current Password"
          className={styles.form_item}
          rules={[{ required: true, message: 'Current Password is required.' }]}
        >
          <Input
            ref={currentPwInputRef}
            className={styles.input}
            type={showCurrentPw ? 'text' : 'password'}
            placeholder="Enter your current password"
            onChange={(e) => dispatch({ type: CURRENT_PW_CHANGE, payload: e.target.value })}
            suffix={
              <span onClick={handleShowCurrentPassword} className={styles.showPwIcon}>
                {!showCurrentPw && <EyeInvisibleOutlined />}
                {showCurrentPw && <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>
        <Form.Item
          name={['new', 'password']}
          label="New Password"
          className={styles.form_item}
          rules={[
            { required: true, message: 'New Password is required.' },
            { min: 8, max: 36, message: 'Password must be within 8 - 36 characters.' },
            {
              validator(_, val) {
                if (val !== currentPassword) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('New password cannot be the same with current password!'),
                );
              },
            },
            {
              validator: (_, value) =>
                !value.includes(' ')
                  ? Promise.resolve()
                  : Promise.reject(new Error('No spaces allowed')),
            },
          ]}
        >
          <Input
            className={styles.input}
            type={showNewPw ? 'text' : 'password'}
            placeholder="Enter your new password"
            onChange={(e) => dispatch({ type: NEW_PW_CHANGE, payload: e.target.value })}
            suffix={
              <span className={styles.showPwIcon} onClick={handleShowNewPassword}>
                {!showNewPw && <EyeInvisibleOutlined />}
                {showNewPw && <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>
        <Form.Item
          name={['confirm', 'password']}
          label="Confirm Password"
          className={styles.form_item}
          rules={[
            { required: true, message: 'Confirm Password is required.' },
            { min: 8, max: 36, message: 'Confirm Password must be within 8 - 36 characters.' },
            {
              pattern: new RegExp(`^${newPassword}$`),
              message: 'Confirm Password does not match.',
            },
          ]}
        >
          <Input
            className={styles.input}
            type={showConPw ? 'text' : 'password'}
            placeholder="Confirm new password"
            onChange={(e) => dispatch({ type: CONFIRM_PW_CHANGE, payload: e.target.value })}
            suffix={
              <span className={styles.showPwIcon} onClick={handleShowConfirmNewPassword}>
                {!showConPw && <EyeInvisibleOutlined />}
                {showConPw && <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
