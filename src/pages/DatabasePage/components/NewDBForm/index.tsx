import { useEffect, useReducer, forwardRef, createElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input, Row, Col, Spin, FormInstance, theme, Checkbox } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { createDatabase, saveAppSetting } from '~/store/DatabaseSlice';
import InfoTooltip from '~/components/InfoTooltip';
import {
  InputWithValidation,
  validateConnectionName,
  validateDatabaseName,
  validateHostName,
  validatePassword,
  validatePort,
  validateUsername,
} from './validations';
import { INITIAL_SETTING_STEP } from '~/constants';
import DBSuccess from '~/assets/images/db_success.png';
import styles from './NewDBForm.module.scss';

const gutter: [Gutter, Gutter] = [16, 16];

const ACTION_TYPE = {
  CONNECTION_CHANGE: 'CONNECTION_CHANGE',
  CONNECTION_CHANGE_WITH_ERROR: 'CONNECTION_CHANGE_WITH_ERROR',
  HOST_CHANGE: 'HOST_CHANGE',
  PORT_CHANGE: 'PORT_CHANGE',
  USERNAME_CHANGE: 'USERNAME_CHANGE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  DB_NAME_CHANGE: 'DB_NAME_CHANGE',
  DB_NAME_CHANGE_WITH_ERROR: 'DB_NAME_CHANGE_WITH_ERROR',
  DB_CREATED_CHANGE: 'DB_CREATED_CHANGE',
};

interface ACTION {
  type: string;
  payload: any;
}

interface COMP_STATE_TYPE {
  connection: InputWithValidation;
  host: InputWithValidation;
  port: InputWithValidation;
  username: InputWithValidation;
  password: InputWithValidation;
  schema: InputWithValidation;
  dbCreated: boolean;
}

const initialState: COMP_STATE_TYPE = {
  connection: { value: '' },
  host: { value: '' },
  port: { value: '' },
  username: { value: '' },
  password: { value: '' },
  schema: { value: '' },
  dbCreated: false,
};

const reducer = (state: COMP_STATE_TYPE, action: ACTION) => {
  if (action.type === ACTION_TYPE.CONNECTION_CHANGE) {
    return {
      ...state,
      connection: { value: action.payload, ...validateConnectionName(action.payload) },
    };
  }
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

interface Props {
  insideModal?: boolean;
  successCb?: () => void;
}

const NewDBForm = forwardRef<FormInstance, Props>((props, ref) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();
  const {
    creating: creatingDb,
    selectedDb,
    message,
    inInstallDBProcess,
    appSetting,
  } = useAppSelector((state) => state.db);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [form] = Form.useForm();
  const [migrateDb, setMigrateDb] = useState(false);

  useEffect(() => {
    if (message) {
      if (message.type === 'success') {
        dispatch({ type: ACTION_TYPE.DB_CREATED_CHANGE, payload: true });
        if (typeof props.successCb === 'function') {
          props.successCb();
        }
      } else {
        let actionType = '';
        let field = '';
        if (message.fields.includes('connection')) {
          actionType = ACTION_TYPE.CONNECTION_CHANGE_WITH_ERROR;
          field = 'connection';
        } else if (message.fields.includes('schema')) {
          field = 'schema';
          actionType = ACTION_TYPE.DB_NAME_CHANGE_WITH_ERROR;
        }
        if (!actionType) {
          return;
        }
        dispatch({
          type: actionType,
          payload: {
            value: state[field].value,
            validateStatus: 'error',
            errorMsg: message.description,
          } as InputWithValidation,
        });
      }
    }
  }, [message]);

  const onSubmit = (values: any) => {
    form.validateFields().then(() => {
      const { connection, host, port, username, password, schema } = state;
      const isFormValid = [connection, host, port, username, password, schema].every(
        (item: InputWithValidation) => item.validateStatus === 'success',
      );
      if (isFormValid) {
        const payload = {
          ...values,
          root_path: appSetting.rootPath,
          organization_name: appSetting.organizationName,
          color_palette: '#4b00fc',
        };
        appDispatch(createDatabase(payload)).then((res) => {
          const { payload: { statusCode = '' } = {} } = res || {};
          if (statusCode === 200) {
            if (migrateDb) {
              appDispatch(saveAppSetting({ ...appSetting, migrated: false }));
              navigate('/migrate-database');
            } else {
              // Clear setting data
              appDispatch(saveAppSetting({ rootPath: '', organizationName: '' }));
            }
          }
        });
      }
    });
  };

  const handleCheckboxMigrateDBChange = (e: CheckboxChangeEvent) => {
    setMigrateDb(e.target.checked);
  };

  const renderOverallTooltipContent = () => {
    return (
      <ul className="my-2 px-4">
        <li>By default, the Database will be setup on the same Server with the Web App</li>
        <li>Database will be deployed on the Server with defined Hostname and Port</li>
      </ul>
    );
  };

  const renderConnectionNameTooltipContent = () => {
    return (
      <ul className="my-2 px-4">
        <li>Minimum 4 characters</li>
        <li>Maximum 36 characters</li>
        <li>Case sensitive</li>
        <li>Consists letter from &quot;a&quot; to &quot;z&quot;</li>
        <li>Consists number from &quot;0&quot; to &quot;9&quot;</li>
        <li>Allow only underscore ( _ ) and dash ( - )</li>
      </ul>
    );
  };

  const renderDatabaseNameTooltipContent = () => {
    return (
      <ul className="my-2 px-4">
        <li>Must be unique</li>
        <li>Case sensitive</li>
        <li>No space</li>
        <li>Minimum 4 characters</li>
        <li>Maximum 36 characters</li>
        <li>Accept numberical & alphabetical character</li>
        <li>Only accept dash ( _ )</li>
      </ul>
    );
  };

  const showForm = inInstallDBProcess === INITIAL_SETTING_STEP.SECOND && !state.dbCreated;
  const showMsg =
    !props.insideModal && inInstallDBProcess === INITIAL_SETTING_STEP.SECOND && state.dbCreated;

  return (
    <div className={styles.container}>
      {creatingDb && (
        <div className={styles.loading_block}>
          <Spin />
        </div>
      )}
      {!props.insideModal && (
        <h2>
          Install New Database{' '}
          <InfoTooltip
            placement="right"
            title={renderOverallTooltipContent()}
            color={token.colorPrimary}
          />
        </h2>
      )}
      {showForm && (
        <Form
          form={form}
          ref={ref}
          noValidate
          name="newDbFrm"
          layout="vertical"
          onFinish={onSubmit}
        >
          <Row gutter={gutter}>
            <Col span={24}>
              <Form.Item
                label={createElement('span', {}, [
                  'Connection Name',
                  ' ',
                  <InfoTooltip
                    key={uuidv4()}
                    placement="right"
                    title={renderConnectionNameTooltipContent()}
                    color={token.colorPrimary}
                  />,
                ])}
                name="connection"
                rules={[{ required: true, message: 'Connection Name is required' }]}
                validateStatus={state.connection.validateStatus}
                help={state.connection.errorMsg}
              >
                <Input
                  autoFocus
                  placeholder="Name for the connection"
                  disabled={creatingDb}
                  onChange={(e) =>
                    dispatch({ type: ACTION_TYPE.CONNECTION_CHANGE, payload: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutter}>
            <Col span={12}>
              <Form.Item
                label={createElement('span', {}, [
                  'Host Name',
                  ' ',
                  <InfoTooltip
                    key={uuidv4()}
                    placement="right"
                    title="Following common domain validation"
                    color={token.colorPrimary}
                  />,
                ])}
                name="host"
                rules={[{ required: true, message: 'Host Name is required' }]}
                validateStatus={state.host.validateStatus}
                help={state.host.errorMsg}
              >
                <Input
                  placeholder="Name or IP Address of the server host"
                  disabled={creatingDb}
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
                    title="Only allow number from 0 to 65000"
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
                  disabled={creatingDb}
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
                    title="Username must match with the Username Credential which will be used to connect to the Server Database"
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
                  disabled={creatingDb}
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
                    title="Password must match with the Security Authentication of the Username Credential to access to the Server Database"
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
                  disabled={creatingDb}
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
                    title={renderDatabaseNameTooltipContent()}
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
                  disabled={creatingDb}
                  onChange={(e) =>
                    dispatch({ type: ACTION_TYPE.DB_NAME_CHANGE, payload: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Checkbox onChange={handleCheckboxMigrateDBChange}>Migrate Database</Checkbox>
            </Col>
          </Row>
          {!props.insideModal && (
            <Row gutter={gutter} className={styles.btnRow}>
              <Col>
                <Button
                  disabled={creatingDb}
                  type="primary"
                  htmlType="submit"
                  className="btn btn-primary  btn-blue"
                >
                  Install Database
                </Button>
              </Col>
            </Row>
          )}
        </Form>
      )}
      {showMsg && (
        <Row gutter={gutter} className={styles.success_info}>
          <Col span={24} className="d-flex justify-content-center">
            <img width={120} src={DBSuccess} alt="" />
          </Col>
          <Col span={24} className="d-flex flex-column align-items-center">
            <p className={styles.success_title}>Database created successfully</p>
            <p className={styles.success_desc}>
              Database{' '}
              <span>{selectedDb && selectedDb.connection ? selectedDb.connection : ''}</span> has
              been successfully created.
            </p>
          </Col>
          <Col span={24} className="d-flex justify-content-center">
            <Button className="btn-blue btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
});

NewDBForm.displayName = 'NewDBForm';

export default NewDBForm;
