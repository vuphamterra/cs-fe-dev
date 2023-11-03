import { createElement, FC, useReducer, useEffect } from 'react';
import { Form, Row, Col, theme, Input, Button, Spin } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { v4 as uuidv4 } from 'uuid';
import InfoTooltip from '~/components/InfoTooltip';
import {
  InputWithValidation,
  validateHostName,
  validatePort,
  validateUsername,
  validatePassword,
  validateDatabaseName,
} from '../NewDBForm/validations';
import styles from './MigrateDBForm.module.scss';
import { migrateDatabase, saveAppSetting } from '~/store/DatabaseSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { useNavigate } from 'react-router-dom';
import notification from '~/utils/notification';

const gutter: [Gutter, Gutter] = [16, 16];

interface ACTION {
  type: string;
  payload: any;
}

interface COMP_STATE_TYPE {
  host: InputWithValidation;
  port: InputWithValidation;
  username: InputWithValidation;
  password: InputWithValidation;
  schema: InputWithValidation;
}

const initialState: COMP_STATE_TYPE = {
  host: { value: '' },
  port: { value: '' },
  username: { value: '' },
  password: { value: '' },
  schema: { value: '' },
};

const ACTION_TYPE = {
  CONNECTION_CHANGE_WITH_ERROR: 'CONNECTION_CHANGE_WITH_ERROR',
  HOST_CHANGE: 'HOST_CHANGE',
  PORT_CHANGE: 'PORT_CHANGE',
  USERNAME_CHANGE: 'USERNAME_CHANGE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  DB_NAME_CHANGE: 'DB_NAME_CHANGE',
  DB_NAME_CHANGE_WITH_ERROR: 'DB_NAME_CHANGE_WITH_ERROR',
  DB_CREATED_CHANGE: 'DB_CREATED_CHANGE',
};

const reducer = (state: COMP_STATE_TYPE, action: ACTION) => {
  if (action.type === ACTION_TYPE.CONNECTION_CHANGE_WITH_ERROR) {
    return {
      ...state,
      connection: action.payload,
    };
  }
  if (action.type === ACTION_TYPE.HOST_CHANGE) {
    return {
      ...state,
      host: { value: action.payload, ...validateHostName(action.payload) },
    };
  }
  if (action.type === ACTION_TYPE.PORT_CHANGE) {
    return {
      ...state,
      port: { value: action.payload, ...validatePort(action.payload) },
    };
  }
  if (action.type === ACTION_TYPE.USERNAME_CHANGE) {
    return {
      ...state,
      username: { value: action.payload, ...validateUsername(action.payload) },
    };
  }
  if (action.type === ACTION_TYPE.PASSWORD_CHANGE) {
    return {
      ...state,
      password: { value: action.payload, ...validatePassword(action.payload) },
    };
  }
  if (action.type === ACTION_TYPE.DB_NAME_CHANGE) {
    return {
      ...state,
      schema: { value: action.payload, ...validateDatabaseName(action.payload) },
    };
  }
  if (action.type === ACTION_TYPE.DB_NAME_CHANGE_WITH_ERROR) {
    return {
      ...state,
      schema: action.payload,
    };
  }
  if (action.type === ACTION_TYPE.DB_CREATED_CHANGE) {
    return {
      ...state,
      dbCreated: action.payload,
    };
  }
  return { ...initialState };
};

interface Props {}

const MigrateDBForm: FC<Props> = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();

  const { appSetting, migrating } = useAppSelector((state) => state.db);
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  useEffect(() => {
    if (appSetting.migrated) {
      navigate('/login');
    }
  }, []);

  const onSubmit = (values: any) => {
    form.validateFields().then(() => {
      const {
        host: server = '',
        port = '',
        username: user = '',
        password = '',
        schema: database = '',
      } = values;
      const payload = {
        server,
        user,
        port: +port,
        password,
        database,
        imagePath: appSetting.rootPath,
      };
      appDispatch(migrateDatabase(payload)).then((res) => {
        const {
          payload: {
            statusCode = '',
            response: { status = 0, data: { message = '' } = {} } = {},
          } = {},
        } = res || {};
        if (statusCode === 200) {
          navigate('/dashboard');
          notification.success({
            message: 'Migrate successfully',
            description: 'The database was migrated successfully',
          });
          // Clear setting data
          appDispatch(saveAppSetting({ rootPath: '', organizationName: '', migrated: true }));
        }
        if (status === 422) {
          notification.error({
            message: 'Migrate failed',
            description: message,
          });
          // Clear setting data
        }
        if (status === 400) {
          notification.error({
            message: 'Migrate failed',
            description: 'The database migration was failed',
          });
        }
      });
    });
  };

  return (
    <div className={styles.container}>
      {migrating && (
        <div className={styles.loading_block}>
          <Spin />
        </div>
      )}
      <h2>
        Migrate Database{' '}
        <InfoTooltip
          placement="right"
          title="Connect and migrate Database from your existing database into the newly created one"
          color={token.colorPrimary}
        />
      </h2>
      <Form form={form} noValidate name="migrateDbFrm" layout="vertical" onFinish={onSubmit}>
        <Row gutter={gutter}>
          <Col span={12}>
            <Form.Item
              label={createElement('span', {}, [
                'Host Name',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="Must match with the origin DB you want to connect and migrate from"
                  color={token.colorPrimary}
                />,
              ])}
              name="host"
              rules={[{ required: true, message: 'Host Name is required' }]}
              validateStatus={state.host.validateStatus}
              help={state.host.errorMsg}
            >
              <Input
                autoFocus
                placeholder="Name or IP Address of the server host"
                disabled={migrating}
                onChange={(e) =>
                  dispatch({ type: ACTION_TYPE.HOST_CHANGE, payload: e.target.value })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={createElement('span', {}, [
                'Port',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="The TCP/IP address of the origin DB you want to connect and migrate from"
                  color={token.colorPrimary}
                />,
              ])}
              name="port"
              rules={[{ required: true, message: 'Port is required' }]}
              validateStatus={state.port.validateStatus}
              help={state.port.errorMsg}
            >
              <Input
                type="number"
                placeholder="TCP/IP Port"
                disabled={migrating}
                onChange={(e) =>
                  dispatch({ type: ACTION_TYPE.PORT_CHANGE, payload: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={24}>
            <Form.Item
              label={createElement('span', {}, [
                'Username',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="Username Credential which will be used to access to the original DB"
                  color={token.colorPrimary}
                />,
              ])}
              name="username"
              rules={[{ required: true, message: 'Username is required' }]}
              validateStatus={state.username.validateStatus}
              help={state.username.errorMsg}
            >
              <Input
                placeholder="Username credential to access into the server"
                disabled={migrating}
                onChange={(e) =>
                  dispatch({ type: ACTION_TYPE.USERNAME_CHANGE, payload: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={24}>
            <Form.Item
              label={createElement('span', {}, [
                'Password',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="Security Authentication Key of the Username Credential to access to the original DB"
                  color={token.colorPrimary}
                />,
              ])}
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
              validateStatus={state.password.validateStatus}
              help={state.password.errorMsg}
            >
              <Input.Password
                placeholder="Password for the Username credential to access into server"
                disabled={migrating}
                onChange={(e) =>
                  dispatch({ type: ACTION_TYPE.PASSWORD_CHANGE, payload: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={24}>
            <Form.Item
              label={createElement('span', {}, [
                'Database Name',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="Name of the Database you want to conenct and migrate from"
                  color={token.colorPrimary}
                />,
              ])}
              name="schema"
              rules={[{ required: true, message: 'Database Name is required' }]}
              validateStatus={state.schema.validateStatus}
              help={state.schema.errorMsg}
            >
              <Input
                placeholder="The Schema to use as default Schema"
                disabled={migrating}
                onChange={(e) =>
                  dispatch({ type: ACTION_TYPE.DB_NAME_CHANGE, payload: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={gutter} className="justify-content-end">
          <Col span={8} className="d-flex">
            <Button
              className={styles.skip_btn}
              onClick={() => navigate('/dashboard')}
              disabled={migrating}
            >
              Skip
            </Button>
            <Button disabled={migrating} type="primary" htmlType="submit" className="btn btn-blue">
              Migrate
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MigrateDBForm;
