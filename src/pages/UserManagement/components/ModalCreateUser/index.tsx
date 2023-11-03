/* eslint-disable no-useless-escape */
import { useState, useRef, useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { Person as PersonIcon } from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { createUser, getListPermission, getListUser, getUserPermission } from '~/store/UserSlice';
import styles from './styles.module.scss';

interface ModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export default function ModalCreateUser(props: ModalProps) {
  const { open, setOpen } = props;
  const [user, setUser] = useState<any>({
    userName: '',
    email: '',
    description: '',
  });
  const { userName, email, description } = user;
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const database = useAppSelector((s) => s.db.selectedDb);
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (usernameInputRef && usernameInputRef.current && open) {
      setTimeout(() => {
        usernameInputRef.current.focus();
      }, 0);
    }
  }, [open]);

  const onClickCreateUser = () => {
    form
      .validateFields()
      .then(() => {
        const params = { ...user, databaseId: database.id };
        dispatch(createUser(params)).then((res) => {
          const {
            payload: { payload, statusCode },
          } = res;
          if (statusCode === 201) {
            dispatch(getListUser());
            dispatch(getListPermission({ skip: 0, take: 11 }));
            dispatch(getUserPermission(payload.id));
            handleCloseModal();
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCloseModal = () => {
    setOpen(false);
    form.resetFields();
    setUser({
      userName: '',
      email: '',
      description: '',
    });
  };

  const modalTitle = (
    <div className={styles.modal_header}>
      <div className={styles.icon}>
        <PersonIcon width={24} height={24} fill="" />
      </div>
      <div>
        <p className={styles.title}>Create New User</p>
      </div>
    </div>
  );

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={handleCloseModal} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button
        className={styles.export_btn}
        onClick={onClickCreateUser}
        // disabled={userName.trim().length === 0 || email.trim().length === 0}
      >
        Save
      </Button>
    </div>
  );

  const handleChangeUser = (event: any) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  return (
    <Modal
      className={styles.modal_create_user}
      open={open}
      onCancel={handleCloseModal}
      title={modalTitle}
      footer={modalActions}
      centered
    >
      <div className={styles.modal_body}>
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Username"
            name="Username"
            rules={[
              {
                required: true,
                message: 'Username is required!',
              },
              {
                type: 'string',
                min: 4,
                max: 16,
                message: 'Username must be within 4 -16 characters.',
              },
              {
                validator: (_, value) =>
                  !value.includes(' ') &&
                  value.match(/[~`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?]/) === null
                    ? Promise.resolve()
                    : Promise.reject(new Error('Username invalid!')),
              },
            ]}
          >
            <Input
              ref={usernameInputRef}
              name="userName"
              size="large"
              maxLength={16}
              onChange={(e) => handleChangeUser(e)}
              value={userName}
              placeholder="Enter Username"
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="Email"
            rules={[
              { required: true, message: 'Please enter user email!' },
              { type: 'string', max: 36 },
              () => ({
                validator(_, value) {
                  if (validateEmail(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Email format invalid. Please check again!'));
                },
              }),
            ]}
          >
            <Input
              maxLength={36}
              name="email"
              size="large"
              onChange={(e) => handleChangeUser(e)}
              value={email}
              placeholder="Enter email"
            />
          </Form.Item>
          <Form.Item label="Description" name="Description" rules={[{ type: 'string', max: 200 }]}>
            <Input
              name="description"
              size="large"
              maxLength={200}
              onChange={(e) => handleChangeUser(e)}
              value={description}
              showCount
              placeholder="Description"
            />
          </Form.Item>
          <Form.Item label="Password" name="Password">
            <Input name="Password" size="large" value="P@ssw0rd" readOnly placeholder="P@ssw0rd" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
